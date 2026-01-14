import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { TAGS } from "../constants/tags";

// Tag attributes interface
interface TagAttributes {
  id: number;
  label: string;
  description: string | null;
  tag_type: "profile" | "content";
  createdAt?: Date;
  updatedAt?: Date;
}

// Tag creation attributes
type TagCreationAttributes = Optional<
  TagAttributes,
  "id" | "description" | "createdAt" | "updatedAt"
>;

// Tag model class
class Tag
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes
{
  public id!: number;
  public label!: string;
  public description!: string | null;
  public tag_type!: "profile" | "content";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Tag model
Tag.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Tag Label
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Tag Description
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Tag Type
    tag_type: {
      type: DataTypes.ENUM("profile", "content"),
      allowNull: false,
      defaultValue: "profile",
    },
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["label", "tag_type"], // Composite unique constraint: same label allowed with different tag_type
      },
      {
        fields: ["tag_type"],
      },
      {
        fields: ["label"],
      },
    ],
  }
);

// Seed function to initialize tags
export const seedTags = async () => {
  try {
    for (const tag of TAGS) {
      await Tag.findOrCreate({
        where: {
          label: tag.label,
          tag_type: "profile", // Check both label and tag_type for uniqueness
        },
        defaults: {
          label: tag.label,
          description: tag.description || null,
          tag_type: "profile", // Default to profile for seeded tags
        },
      });
    }

    console.log(
      "=================> Tags seeded successfully <================="
    );
  } catch (error) {
    console.error("Error seeding tags:", error);
  }
};

export default Tag;
export type { TagAttributes, TagCreationAttributes };
