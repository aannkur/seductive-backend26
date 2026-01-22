import ClientPreferences from "../models/clientPreferences.model";
import User from "../models/user.model";
import { MESSAGES } from "../constants/messages";
import { City } from "../models";
import { Op } from "sequelize";

/**
 * Create or Update Client Preferences
 */
export const saveClientPreferencesService = async (data: {
  user_id: number;
  city?: string | null;
  preferences?: string[] | null;
  bio?: string | null;
  tags?: string[] | null;
}) => {
  const { user_id, preferences, bio, tags } = data;
  const cityName = data.city

  if (!cityName) {
    throw new Error("City is required");
  }

 const city = await City.findOne({
  where: {
    name: {
      [Op.iLike]: cityName
    }
  }
});

    console.log(city,"this is city for now")
    if (!city) {
      throw new Error("City not found");
    }

    console.log("this is row in db",city)

  // Verify user exists and is a Client
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  if (user.role !== "Client") {
    throw new Error(MESSAGES.ONLY_CLIENTS_CAN_SET_PREFERENCES);
  }

  // Check if preferences already exist
  let clientPreferences = await ClientPreferences.findOne({
    where: { user_id },
  });

  if (clientPreferences) {
    // Update existing preferences (only update provided fields)
    if (city !== undefined) {
      clientPreferences.city = city.id;
    }
    if (preferences !== undefined) {
      clientPreferences.preferences = preferences;
    }
    if (bio !== undefined) {
      clientPreferences.bio = bio;
    }
    if (tags !== undefined) {
      clientPreferences.tags = tags;
    }
    await clientPreferences.save();
  } else {
    const cityId = city.id;
    // Create new preferences
    clientPreferences = await ClientPreferences.create({
      user_id,
      city: cityId ?? null,
      preferences: preferences ?? null,
      bio: bio ?? null,
      tags: tags ?? null,
    });
  }

  return {
    message: MESSAGES.CLIENT_PREFERENCES_SAVED,
    preferences: {
      id: clientPreferences.id,
      user_id: clientPreferences.user_id,
      city: clientPreferences.city,
      preferences: clientPreferences.preferences,
      bio: clientPreferences.bio,
      tags: clientPreferences.tags,
      createdAt: clientPreferences.createdAt,
      updatedAt: clientPreferences.updatedAt,
    },
  };
};

/**
 * Update Client Preferences (requires existing preferences)
 */
export const updateClientPreferencesService = async (data: {
  user_id: number;
  city?: string | null;
  preferences?: string[] | null;
  bio?: string | null;
  tags?: string[] | null;
}) => {
  const { user_id, city, preferences, bio, tags } = data;

  // Verify user exists and is a Client
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  if (user.role !== "Client") {
    throw new Error(MESSAGES.ONLY_CLIENTS_CAN_SET_PREFERENCES);
  }

  // Find existing preferences
  const clientPreferences = await ClientPreferences.findOne({
    where: { user_id },
  });

  if (!clientPreferences) {
    throw new Error(MESSAGES.CLIENT_PREFERENCES_NOT_FOUND);
  }

  // Update existing preferences (only update provided fields)
  if (city !== undefined) {
    if (city) {
      const cityRecord = await City.findOne({
        where: { id: city }
      });
      if (!cityRecord) {
        throw new Error("City not found");
      }
      clientPreferences.city = cityRecord.id;
    } else {
      clientPreferences.city = null;
    }
  }
  if (preferences !== undefined) {
    clientPreferences.preferences = preferences;
  }
  if (bio !== undefined) {
    clientPreferences.bio = bio;
  }
  if (tags !== undefined) {
    clientPreferences.tags = tags;
  }
  await clientPreferences.save();

  return {
    message: MESSAGES.CLIENT_PREFERENCES_UPDATED,
    preferences: {
      id: clientPreferences.id,
      user_id: clientPreferences.user_id,
      city: clientPreferences.city,
      preferences: clientPreferences.preferences,
      bio: clientPreferences.bio,
      tags: clientPreferences.tags,
      createdAt: clientPreferences.createdAt,
      updatedAt: clientPreferences.updatedAt,
    },
  };
};

/**
 * Get Client Preferences by User ID
 */
export const getClientPreferencesService = async (userId: number) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find preferences
  const clientPreferences = await ClientPreferences.findOne({
    where: { user_id: userId },
  });

  if (!clientPreferences) {
    throw new Error(MESSAGES.CLIENT_PREFERENCES_NOT_FOUND);
  }

  return {
    message: MESSAGES.CLIENT_PREFERENCES_FETCHED,
    preferences: {
      id: clientPreferences.id,
      user_id: clientPreferences.user_id,
      city: clientPreferences.city,
      preferences: clientPreferences.preferences,
      bio: clientPreferences.bio,
      tags: clientPreferences.tags,
      createdAt: clientPreferences.createdAt,
      updatedAt: clientPreferences.updatedAt,
    },
  };
};

/**
 * Delete Client Preferences
 */
export const deleteClientPreferencesService = async (userId: number) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find and delete preferences
  const clientPreferences = await ClientPreferences.findOne({
    where: { user_id: userId },
  });

  if (!clientPreferences) {
    throw new Error(MESSAGES.CLIENT_PREFERENCES_NOT_FOUND);
  }

  await clientPreferences.destroy();

  return {
    message: MESSAGES.CLIENT_PREFERENCES_DELETED,
  };
};
