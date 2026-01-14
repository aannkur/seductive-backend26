import Tag from "../models/tag.model";
import { MESSAGES } from "../constants/messages";
import { Op } from "sequelize";

/**
 * Get all tags with optional search and tag_type filter
 */
export const getAllTagsService = async (
  search?: string,
  tag_type?: "profile" | "content"
) => {
  const whereCondition: any = {};

  // Add search filter if provided
  if (search && search.trim()) {
    whereCondition.label = {
      [Op.iLike]: `%${search.trim()}%`,
    };
  }

  // Add tag_type filter if provided
  if (tag_type) {
    whereCondition.tag_type = tag_type;
  }

  const tags = await Tag.findAll({
    where: whereCondition,
    order: [["label", "ASC"]],
    attributes: ["id", "label", "description", "tag_type"],
  });

  return {
    message: MESSAGES.TAGS_FETCHED,
    tags,
  };
};
