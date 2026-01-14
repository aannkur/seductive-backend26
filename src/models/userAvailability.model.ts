import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// UserAvailability attributes interface
interface UserAvailabilityAttributes {
  id: number;
  user_id: number;
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
  createdAt?: Date;
  updatedAt?: Date;
}

// UserAvailability creation attributes
type UserAvailabilityCreationAttributes = Optional<
  UserAvailabilityAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// UserAvailability model class
class UserAvailability
  extends Model<UserAvailabilityAttributes, UserAvailabilityCreationAttributes>
  implements UserAvailabilityAttributes
{
  public id!: number;
  public user_id!: number;
  public days_of_week!:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  public start_time!: string;
  public end_time!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize UserAvailability model
UserAvailability.init(
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

    // Days of Week
    days_of_week: {
      type: DataTypes.ENUM(
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      ),
      allowNull: false,
    },

    // Start Time
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    // End Time
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserAvailability",
    tableName: "user_availability",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["days_of_week"],
      },
    ],
  }
);

// Define associations
UserAvailability.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(UserAvailability, {
  foreignKey: "user_id",
  as: "availability",
});

export default UserAvailability;
export type { UserAvailabilityAttributes, UserAvailabilityCreationAttributes };
