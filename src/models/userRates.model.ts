import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// UserRates attributes interface
interface UserRatesAttributes {
  id: number;
  user_id: number;
  type: string;
  duration: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// UserRates creation attributes
type UserRatesCreationAttributes = Optional<
  UserRatesAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// UserRates model class
class UserRates
  extends Model<UserRatesAttributes, UserRatesCreationAttributes>
  implements UserRatesAttributes
{
  public id!: number;
  public user_id!: number;
  public type!: string;
  public duration!: string;
  public price!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize UserRates model
UserRates.init(
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

    // Type
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Duration
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Price
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRates",
    tableName: "user_rates",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["user_id", "type"],
        unique: true,
      },
    ],
  }
);

// Define associations
UserRates.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(UserRates, {
  foreignKey: "user_id",
  as: "rates",
});

export default UserRates;
export type { UserRatesAttributes, UserRatesCreationAttributes };
