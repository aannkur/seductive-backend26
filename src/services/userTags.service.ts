import UserTags from "../models/userTags.model";
import Tag from "../models/tag.model";
import User from "../models/user.model";
import { MESSAGES } from "../constants/messages";

/**
 * Add Tag to User Profile
 */
export const addUserTagService = async (data: {
  user_id: number;
  tag_label: string;
  tag_description?: string;
  tag_type?: "profile" | "content";
}) => {
  const { user_id, tag_label, tag_description, tag_type = "profile" } = data;

  // Verify user exists
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Check if tag exists with same label and tag_type, if not create it
  // Allow same label with different tag_type, but prevent same label + same tag_type
  let tag = await Tag.findOne({
    where: {
      label: tag_label,
      tag_type: tag_type,
    },
  });

  if (!tag) {
    // Create new tag if it doesn't exist with this label + tag_type combination
    tag = await Tag.create({
      label: tag_label,
      description: tag_description || null,
      tag_type: tag_type,
    });
  }

  // Check if user already has this tag
  const existingUserTag = await UserTags.findOne({
    where: {
      user_id: user_id,
      tag_id: tag.id,
    },
  });

  if (existingUserTag) {
    throw new Error(MESSAGES.USER_TAG_ALREADY_EXISTS);
  }

  // Add tag to user
  await UserTags.create({
    user_id: user_id,
    tag_id: tag.id,
  });

  return {
    message: MESSAGES.USER_TAG_ADDED,
    tag: {
      id: tag.id,
      label: tag.label,
      description: tag.description,
      tag_type: tag.tag_type,
    },
  };
};

/**
 * Remove Tag from User Profile
 */
export const removeUserTagService = async (data: {
  user_id: number;
  tag_id: number;
}) => {
  const { user_id, tag_id } = data;

  // Verify user exists
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Verify tag exists
  const tag = await Tag.findByPk(tag_id);

  if (!tag) {
    throw new Error(MESSAGES.TAG_NOT_FOUND);
  }

  // Find user-tag relationship
  const userTag = await UserTags.findOne({
    where: {
      user_id: user_id,
      tag_id: tag_id,
    },
  });

  if (!userTag) {
    throw new Error(MESSAGES.USER_TAG_NOT_FOUND);
  }

  // Remove from user_tags table only (never delete from tags table)
  await userTag.destroy();

  return {
    message: MESSAGES.USER_TAG_REMOVED,
  };
};

/**
 * Get User Tags - Get all tags for a user
 */
export const getUserTagsService = async (userId: number) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Get all tags for the user with tag details
  const userTags = await UserTags.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Tag,
        as: "tag",
        attributes: ["id", "label", "description", "tag_type"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Extract tag information
  const tags = userTags.map((userTag) => {
    const tagData = (userTag as unknown as { tag: Tag }).tag;
    return {
      id: tagData.id,
      label: tagData.label,
      description: tagData.description,
      tag_type: tagData.tag_type,
      addedAt: userTag.createdAt,
    };
  });

  return {
    message: MESSAGES.USER_TAGS_FETCHED,
    tags,
  };
};
