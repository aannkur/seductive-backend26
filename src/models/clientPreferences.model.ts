import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// Client Preferences attributes interface
interface ClientPreferencesAttributes {
  id: number;
  user_id: number;
  city: string | null;
  preferences: string[] | null; // Array of vibe preferences
  bio: string | null;
  tags: string[] | null; // Array of tags
  createdAt?: Date;
  updatedAt?: Date;
}

// Client Preferences creation attributes
type ClientPreferencesCreationAttributes = Optional<
  ClientPreferencesAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// Client Preferences model class
class ClientPreferences
  extends Model<
    ClientPreferencesAttributes,
    ClientPreferencesCreationAttributes
  >
  implements ClientPreferencesAttributes
{
  public id!: number;
  public user_id!: number;
  public city!: string | null;
  public preferences!: string[] | null;
  public bio!: string | null;
  public tags!: string[] | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize ClientPreferences model
ClientPreferences.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Foreign Key to User
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // One preference record per user
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // Location
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Vibe Preferences (stored as JSON array)
    preferences: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: null,
    },

    // Bio
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Tags (stored as JSON array)
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "ClientPreferences",
    tableName: "client_preferences",
    timestamps: true,
  }
);

export default ClientPreferences;
