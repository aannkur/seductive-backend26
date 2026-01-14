import sequelize from "../config/db";
import User from "../models/user.model";
import UserAvailability from "../models/userAvailability.model";
import UserTags from "../models/userTags.model";
import UserGallery from "../models/userGallery.model";
import UserRates from "../models/userRates.model";
import ClientPreferences from "../models/clientPreferences.model";
import Tag from "../models/tag.model";
import { deleteFileFromS3 } from "../utils/s3.utils";
import { MESSAGES } from "../constants/messages";

/**
 * Format gallery data into object with public and private arrays
 */
const formatGalleryData = (
  galleryData: UserGallery[] | null | undefined
): { public: UserGallery[]; private: UserGallery[] } => {
  if (!galleryData || galleryData.length === 0) {
    return {
      public: [],
      private: [],
    };
  }

  return {
    public: galleryData
      .filter((img) => img.access_type === "public")
      .map((img) => ({
        id: img.id,
        image_url: img.image_url,
        access_type: img.access_type,
        caption: img.caption,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
      })) as UserGallery[],
    private: galleryData
      .filter((img) => img.access_type === "private")
      .map((img) => ({
        id: img.id,
        image_url: img.image_url,
        access_type: img.access_type,
        caption: img.caption,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
      })) as UserGallery[],
  };
};

/**
 * Update User Profile Service
 * Supports partial updates for user, availability, tags, and gallery
 */
export const updateUserProfileService = async (data: {
  user_id: number;
  // User fields (all optional for partial update)
  name?: string;
  profile_name?: string;
  username?: string;
  profile_bio?: string;
  dob?: string;
  age?: number;
  city?: string;
  country?: string;
  extra?: string;
  note?: string;
  timezone?: string;
  live_status?: "Not Available" | "Available" | "By Request";
  profile_photo?: string;
  // Creator-only fields (only updatable if role is Creator)
  unlock_price?: number | null;
  platform_url?: string | null;
  // Availability (array of objects, optional)
  availability?: Array<{
    days_of_week:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    start_time: string;
    end_time: string;
  }>;
  // Tags (array of objects, optional)
  tags?: Array<{
    tag_id?: number;
    tag_label?: string;
    tag_type?: "profile" | "content";
  }>;
  // Gallery (separate public and private arrays, optional)
  gallery?: {
    public?: string[];
    private?: string[];
    captions?: {
      public?: string[];
      private?: string[];
    };
  };
  // User Rates (array of objects, optional)
  user_rates?: Array<{
    type: string;
    duration: string;
    price: number;
  }>;
}) => {
  const transaction = await sequelize.transaction();
  let transactionCommitted = false;

  try {
    const { user_id, gallery, availability, tags, user_rates, ...userFields } =
      data;

    // Verify user exists
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    // Update user fields (only provided fields)
    const userUpdateData: Record<string, unknown> = {};
    const allowedUserFields = [
      "name",
      "profile_name",
      "username",
      "profile_bio",
      "dob",
      "age",
      "city",
      "country",
      "extra",
      "note",
      "timezone",
      "live_status",
      "profile_photo",
    ];

    for (const field of allowedUserFields) {
      if (userFields[field as keyof typeof userFields] !== undefined) {
        userUpdateData[field] = userFields[field as keyof typeof userFields];
      }
    }

    // Handle Creator-only fields (unlock_price and platform_url)
    // Only allow updates if role is Creator, otherwise set to null
    if (user.role === "Creator") {
      // Creator can update these fields
      if (userFields.unlock_price !== undefined) {
        userUpdateData.unlock_price = userFields.unlock_price;
      }
      if (userFields.platform_url !== undefined) {
        userUpdateData.platform_url = userFields.platform_url;
      }
    } else {
      // For non-Creator roles, always set these fields to null
      userUpdateData.unlock_price = null;
      userUpdateData.platform_url = null;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await user.update(userUpdateData, { transaction });
    }

    // Handle availability if provided
    if (availability !== undefined) {
      // Validate availability entries
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;
      for (const avail of availability) {
        if (
          !timeRegex.test(avail.start_time) ||
          !timeRegex.test(avail.end_time)
        ) {
          await transaction.rollback();
          throw new Error(MESSAGES.INVALID_TIME_FORMAT);
        }
        const start = new Date(`2000-01-01T${avail.start_time}`);
        const end = new Date(`2000-01-01T${avail.end_time}`);
        if (start >= end) {
          await transaction.rollback();
          throw new Error(MESSAGES.START_TIME_MUST_BE_BEFORE_END_TIME);
        }
      }

      // Delete all existing availability
      await UserAvailability.destroy({ where: { user_id }, transaction });

      // Create new availability records
      if (availability.length > 0) {
        await UserAvailability.bulkCreate(
          availability.map((avail) => ({
            user_id,
            days_of_week: avail.days_of_week,
            start_time: avail.start_time,
            end_time: avail.end_time,
          })),
          { transaction }
        );
      }
    }

    // Handle tags if provided
    let updatedTags = null;
    if (tags !== undefined) {
      // Delete existing tags
      await UserTags.destroy({ where: { user_id }, transaction });

      if (tags.length > 0) {
        // Process tags
        const tagIds: number[] = [];
        for (const tagData of tags) {
          let tagId: number;

          if (tagData.tag_id) {
            const tag = await Tag.findByPk(tagData.tag_id, { transaction });
            if (!tag) {
              await transaction.rollback();
              throw new Error(
                MESSAGES.TAG_NOT_FOUND_BY_ID.replace(
                  "{tagId}",
                  tagData.tag_id.toString()
                )
              );
            }
            tagId = tag.id;
          } else if (tagData.tag_label) {
            // Check for existing tag with same label AND tag_type
            // Allow same label with different tag_type, but prevent duplicate label + tag_type
            const tagType = tagData.tag_type || "profile";
            const [tag] = await Tag.findOrCreate({
              where: {
                label: tagData.tag_label,
                tag_type: tagType,
              },
              defaults: {
                label: tagData.tag_label,
                description: tagData.tag_label,
                tag_type: tagType,
              },
              transaction,
            });
            tagId = tag.id;
          } else {
            await transaction.rollback();
            throw new Error(MESSAGES.TAG_ID_OR_LABEL_REQUIRED);
          }

          tagIds.push(tagId);
        }

        // Create user tag associations
        await UserTags.bulkCreate(
          tagIds.map((tag_id) => ({
            user_id,
            tag_id,
          })),
          { transaction }
        );
      }

      // Fetch updated tags
      updatedTags = await UserTags.findAll({
        where: { user_id },
        include: [
          {
            model: Tag,
            as: "tag",
            attributes: ["id", "label", "description", "tag_type"],
          },
        ],
        transaction,
      });
    }

    // Handle user_rates if provided (only for Escort role)
    let updatedRates = null;
    if (user_rates !== undefined) {
      // Check if user role is Escort
      if (user.role !== "Escort") {
        await transaction.rollback();
        throw new Error(MESSAGES.USER_RATES_ONLY_FOR_ESCORT);
      }

      // Validate user_rates entries
      for (const rate of user_rates) {
        if (!rate.type || !rate.duration || rate.price === undefined) {
          await transaction.rollback();
          throw new Error(MESSAGES.RATE_MUST_HAVE_TYPE_DURATION_PRICE);
        }
        if (typeof rate.price !== "number" || rate.price < 0) {
          await transaction.rollback();
          throw new Error(MESSAGES.PRICE_MUST_BE_NON_NEGATIVE);
        }
      }

      // Get existing rates
      const existingRates = await UserRates.findAll({
        where: { user_id },
        transaction,
      });

      // Get types from the new rates array
      const newTypes = user_rates.map((rate) => rate.type);

      // Delete rates that are not in the new array
      const ratesToDelete = existingRates.filter(
        (rate) => !newTypes.includes(rate.type)
      );
      for (const rate of ratesToDelete) {
        await rate.destroy({ transaction });
      }

      // Update or create rates
      for (const rateData of user_rates) {
        const existingRate = existingRates.find(
          (rate) => rate.type === rateData.type
        );

        if (existingRate) {
          // Update existing rate
          await existingRate.update(
            {
              duration: rateData.duration,
              price: rateData.price,
            },
            { transaction }
          );
        } else {
          // Create new rate
          await UserRates.create(
            {
              user_id,
              type: rateData.type,
              duration: rateData.duration,
              price: rateData.price,
            },
            { transaction }
          );
        }
      }

      // Fetch updated rates
      updatedRates = await UserRates.findAll({
        where: { user_id },
        order: [["type", "ASC"]],
        transaction,
      });
    }

    // Handle gallery if provided
    let updatedGallery = null;
    if (gallery !== undefined) {
      const publicUrls = gallery.public || [];
      const privateUrls = gallery.private || [];

      // Enforce public gallery max limit
      if (publicUrls.length > 15) {
        throw new Error(MESSAGES.GALLERY_PUBLIC_LIMIT_EXCEEDED);
      }

      // Get existing gallery
      const existingGallery = await UserGallery.findAll({
        where: { user_id },
        transaction,
      });

      const existingPublicUrls = existingGallery
        .filter((img) => img.access_type === "public")
        .map((img) => img.image_url);
      const existingPrivateUrls = existingGallery
        .filter((img) => img.access_type === "private")
        .map((img) => img.image_url);

      // Find URLs to delete
      const publicUrlsToDelete = existingPublicUrls.filter(
        (url) => !publicUrls.includes(url)
      );
      const privateUrlsToDelete = existingPrivateUrls.filter(
        (url) => !privateUrls.includes(url)
      );

      // Delete removed images from DB (S3 deletion happens outside transaction)
      const allUrlsToDelete = [...publicUrlsToDelete, ...privateUrlsToDelete];
      for (const url of allUrlsToDelete) {
        const galleryItem = existingGallery.find(
          (img) => img.image_url === url
        );
        if (galleryItem) {
          await galleryItem.destroy({ transaction });
        }
      }

      // Add new images to DB
      const newGalleryItems: Array<{
        user_id: number;
        image_url: string;
        access_type: "public" | "private";
        caption: string | null;
      }> = [];
      const publicUrlsToAdd = publicUrls.filter(
        (url) => !existingPublicUrls.includes(url)
      );
      const privateUrlsToAdd = privateUrls.filter(
        (url) => !existingPrivateUrls.includes(url)
      );

      publicUrlsToAdd.forEach((url, index) => {
        newGalleryItems.push({
          user_id,
          image_url: url,
          access_type: "public" as const,
          caption: gallery.captions?.public?.[index] || null,
        });
      });

      privateUrlsToAdd.forEach((url, index) => {
        newGalleryItems.push({
          user_id,
          image_url: url,
          access_type: "private" as const,
          caption: gallery.captions?.private?.[index] || null,
        });
      });

      if (newGalleryItems.length > 0) {
        await UserGallery.bulkCreate(newGalleryItems, { transaction });
      }

      // Fetch updated gallery
      updatedGallery = await UserGallery.findAll({
        where: { user_id },
        order: [["createdAt", "ASC"]],
        transaction,
      });
    }

    await transaction.commit();
    transactionCommitted = true;

    // Delete S3 files outside transaction (for gallery) - wrapped in try-catch to prevent rollback errors
    if (gallery !== undefined) {
      try {
        const publicUrls = gallery.public || [];
        const privateUrls = gallery.private || [];
        const existingGallery = await UserGallery.findAll({
          where: { user_id },
        });
        const existingPublicUrls = existingGallery
          .filter((img) => img.access_type === "public")
          .map((img) => img.image_url);
        const existingPrivateUrls = existingGallery
          .filter((img) => img.access_type === "private")
          .map((img) => img.image_url);

        const publicUrlsToDelete = existingPublicUrls.filter(
          (url) => !publicUrls.includes(url)
        );
        const privateUrlsToDelete = existingPrivateUrls.filter(
          (url) => !privateUrls.includes(url)
        );

        const allUrlsToDelete = [...publicUrlsToDelete, ...privateUrlsToDelete];
        for (const url of allUrlsToDelete) {
          try {
            await deleteFileFromS3(url);
          } catch (error) {
            console.error(`Failed to delete S3 file: ${url}`, error);
          }
        }
      } catch (error) {
        console.error("Error deleting S3 files (non-critical):", error);
        // Don't throw - S3 cleanup is non-critical
      }
    }

    // Fetch updated user with relations
    let updatedUser;
    try {
      updatedUser = await User.findByPk(user_id, {
        include: [
          {
            model: UserAvailability,
            as: "availability",
            required: false,
          },
          {
            model: UserTags,
            as: "userTags",
            include: [
              {
                model: Tag,
                as: "tag",
                attributes: ["id", "label", "description", "tag_type"],
              },
            ],
            required: false,
          },
          {
            model: UserGallery,
            as: "gallery",
            required: false,
          },
        ],
      });
    } catch (error) {
      console.error("Error updating user with relations:", error);
      // If include fails, fetch user without relations
      updatedUser = await User.findByPk(user_id);
      if (!updatedUser) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }
    }

    // If we couldn't get tags from include, fetch them separately
    let userTagsData: UserTags[] | null = updatedTags;
    if (!userTagsData && updatedUser) {
      try {
        userTagsData = await UserTags.findAll({
          where: { user_id },
          include: [
            {
              model: Tag,
              as: "tag",
              attributes: ["id", "label", "description", "tag_type"],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching tags:", error);
        userTagsData = [];
      }
    }

    // Get availability if not already fetched
    const userRelations = updatedUser as unknown as {
      availability?: UserAvailability[];
      gallery?: UserGallery[];
    };

    let availabilityData: UserAvailability[] | undefined =
      userRelations.availability;
    if (!availabilityData) {
      try {
        availabilityData = await UserAvailability.findAll({
          where: { user_id },
          order: [["days_of_week", "ASC"]],
        });
      } catch (error) {
        console.error("Error fetching availability:", error);
        availabilityData = [];
      }
    }

    // Get gallery if not already fetched
    let galleryData: UserGallery[] | null =
      updatedGallery || userRelations.gallery || null;
    if (!galleryData) {
      try {
        galleryData = await UserGallery.findAll({
          where: { user_id },
          order: [["createdAt", "ASC"]],
        });
      } catch (error) {
        console.error("Error fetching gallery:", error);
        galleryData = [];
      }
    }

    // Get user_rates if not already fetched
    let userRatesData: UserRates[] | null = updatedRates;
    if (!userRatesData) {
      try {
        userRatesData = await UserRates.findAll({
          where: { user_id },
          order: [["type", "ASC"]],
        });
      } catch (error) {
        console.error("Error fetching user rates:", error);
        userRatesData = [];
      }
    }

    // Format gallery data using common helper
    const formattedGallery = formatGalleryData(galleryData);

    return {
      message: MESSAGES.PROFILE_UPDATED,
      user: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        profile_name: updatedUser!.profile_name,
        username: updatedUser!.username,
        email: updatedUser!.email,
        profile_photo: updatedUser!.profile_photo,
        profile_bio: updatedUser!.profile_bio,
        dob: updatedUser!.dob,
        age: updatedUser!.age,
        city: updatedUser!.city,
        country: updatedUser!.country,
        extra: updatedUser!.extra,
        note: updatedUser!.note,
        timezone: updatedUser!.timezone,
        live_status: updatedUser!.live_status,
        role: updatedUser!.role,
        status: updatedUser!.status,
        is_verified: updatedUser!.is_verified,
        unlock_price: updatedUser!.unlock_price,
        platform_url: updatedUser!.platform_url,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      },
      availability: availabilityData || [],
      tags: userTagsData || [],
      gallery: formattedGallery,
      user_rates: userRatesData || [],
    };
  } catch (error: unknown) {
    // Only rollback if transaction hasn't been committed
    if (!transactionCommitted) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(errorMessage);
  }
};

/**
 * Get User Profile Service
 * Fetches user with all related data
 */
export const getUserProfileService = async (userId: number) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Fetch related data separately to avoid association issues
  // Only fetch user_rates if user role is Escort
  // Only fetch client_preferences if user role is Client
  const [availability, userTags, gallery, userRates, clientPreferences] =
    await Promise.all([
      UserAvailability.findAll({
        where: { user_id: userId },
        order: [["days_of_week", "ASC"]],
      }).catch(() => []),
      UserTags.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Tag,
            as: "tag",
            attributes: ["id", "label", "description", "tag_type"],
          },
        ],
      }).catch(() => []),
      UserGallery.findAll({
        where: { user_id: userId },
        order: [["createdAt", "ASC"]],
      }).catch(() => []),
      user.role === "Escort"
        ? UserRates.findAll({
            where: { user_id: userId },
            order: [["type", "ASC"]],
          }).catch(() => [])
        : Promise.resolve([]),
      user.role === "Client"
        ? ClientPreferences.findOne({
            where: { user_id: userId },
          })
            .then((prefs) =>
              prefs
                ? {
                    id: prefs.id,
                    user_id: prefs.user_id,
                    city: prefs.city,
                    preferences: prefs.preferences,
                    bio: prefs.bio,
                    tags: prefs.tags,
                    createdAt: prefs.createdAt,
                    updatedAt: prefs.updatedAt,
                  }
                : null
            )
            .catch(() => null)
        : Promise.resolve(null),
    ]);

  // Format gallery data using common helper
  const formattedGallery = formatGalleryData(gallery);

  return {
    message: MESSAGES.PROFILE_FETCHED,
    user: {
      id: user.id,
      name: user.name,
      profile_name: user.profile_name,
      username: user.username,
      email: user.email,
      profile_photo: user.profile_photo,
      profile_bio: user.profile_bio,
      dob: user.dob,
      age: user.age,
      city: user.city,
      country: user.country,
      extra: user.extra,
      note: user.note,
      timezone: user.timezone,
      live_status: user.live_status,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      unlock_price: user.unlock_price,
      platform_url: user.platform_url,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    availability: availability || [],
    tags: userTags || [],
    gallery: formattedGallery,
    user_rates: userRates || [],
    client_preferences: clientPreferences || null,
  };
};
