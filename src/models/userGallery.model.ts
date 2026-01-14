import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// UserGallery attributes interface
interface UserGalleryAttributes {
  id: number;
  user_id: number;
  image_url: string;
  access_type: "public" | "private";
  caption: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// UserGallery creation attributes
type UserGalleryCreationAttributes = Optional<
  UserGalleryAttributes,
  "id" | "caption" | "createdAt" | "updatedAt"
>;

// UserGallery model class
class UserGallery
  extends Model<UserGalleryAttributes, UserGalleryCreationAttributes>
  implements UserGalleryAttributes
{
  public id!: number;
  public user_id!: number;
  public image_url!: string;
  public access_type!: "public" | "private";
  public caption!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize UserGallery model
UserGallery.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Foreign Key - User ID
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // Image URL
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Access Type
    access_type: {
      type: DataTypes.ENUM("public", "private"),
      allowNull: false,
      defaultValue: "public",
    },

    // Caption
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "UserGallery",
    tableName: "user_gallery",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["access_type"],
      },
    ],
  }
);

// Define associations
UserGallery.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(UserGallery, {
  foreignKey: "user_id",
  as: "gallery",
});

export default UserGallery;
export type { UserGalleryAttributes, UserGalleryCreationAttributes };
