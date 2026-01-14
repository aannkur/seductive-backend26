import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Tag from "./tag.model";

// UserTags attributes interface
interface UserTagsAttributes {
  user_id: number;
  tag_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// UserTags creation attributes
type UserTagsCreationAttributes = Optional<
  UserTagsAttributes,
  "createdAt" | "updatedAt"
>;

// UserTags model class
class UserTags
  extends Model<UserTagsAttributes, UserTagsCreationAttributes>
  implements UserTagsAttributes
{
  public user_id!: number;
  public tag_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize UserTags model
UserTags.init(
  {
    // Composite Primary Key - User ID
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // Composite Primary Key - Tag ID
    tag_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: "tags",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "UserTags",
    tableName: "user_tags",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "tag_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["tag_id"],
      },
    ],
  }
);

// Define associations
UserTags.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

UserTags.belongsTo(Tag, {
  foreignKey: "tag_id",
  as: "tag",
});

// Many-to-many relationships
User.belongsToMany(Tag, {
  through: UserTags,
  foreignKey: "user_id",
  otherKey: "tag_id",
  as: "tags",
});

User.hasMany(UserTags, {
  foreignKey: "user_id",
  as: "userTags",
});

Tag.belongsToMany(User, {
  through: UserTags,
  foreignKey: "tag_id",
  otherKey: "user_id",
  as: "users",
});

export default UserTags;
export type { UserTagsAttributes, UserTagsCreationAttributes };
