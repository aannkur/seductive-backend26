import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// TempUser attributes interface
interface TempUserAttributes {
  id: number;
  account_type: "Client" | "Escort" | "Creator" | "Admin";
  display_name: string;
  email: string;
  city: number;
  password: string;
  adult_policy: boolean;
  current_otp: string | null;
  is_verified: boolean;
  otp_attempts: number;
  last_otp_sent_at: Date | null;
  first_otp_attempt_at: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// TempUser creation attributes
type TempUserCreationAttributes = Optional<
  TempUserAttributes,
  | "id"
  | "current_otp"
  | "is_verified"
  | "otp_attempts"
  | "last_otp_sent_at"
  | "first_otp_attempt_at"
  | "createdAt"
  | "updatedAt"
>;

// TempUser model class
class TempUser
  extends Model<TempUserAttributes, TempUserCreationAttributes>
  implements TempUserAttributes
{
  public id!: number;
  public account_type!: "Client" | "Escort" | "Creator" | "Admin";
  public display_name!: string;
  public email!: string;
  public city!: number;
  public password!: string;
  public adult_policy!: boolean;
  public current_otp!: string | null;
  public is_verified!: boolean;
  public otp_attempts!: number;
  public last_otp_sent_at!: Date | null;
  public first_otp_attempt_at!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize TempUser model
TempUser.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Account Type
    account_type: {
      type: DataTypes.ENUM("Client", "Escort", "Creator", "Admin"),
      allowNull: false,
    },

    // Display Name
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Email
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    // City
    city: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Password (hashed)
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Adult Policy
    adult_policy: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    // Current OTP
    current_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Verification Status
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    // OTP Attempts Counter
    otp_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

    // Last OTP Sent Timestamp (for cooldown)
    last_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // First OTP Attempt Timestamp (for 15-minute window)
    first_otp_attempt_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TempUser",
    tableName: "temp_users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
);

export default TempUser;
export type { TempUserAttributes, TempUserCreationAttributes };
