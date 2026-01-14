import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

// User attributes interface
interface UserAttributes {
  id: number;
  name: string;
  profile_name: string;
  username: string;
  email: string;
  password: string | null;
  profile_photo: string | null;
  profile_bio: string | null;
  role: "Admin" | "Creator" | "Client" | "Escort";
  dob: string | null;
  age: number | null;
  city: string | null;
  country: string | null;
  extra: string | null;
  note: string | null;
  timezone: string | null;
  live_status: "Not Available" | "Available" | "By Request" | null;
  status: "Approved" | "Pending" | "Block" | "Suspend" | "Active" | "Inactive";
  pass_status: "Default" | "Changed";
  is_verified: boolean;
  deletedAt: Date | null;
  dailyFreeUnlocks: number;
  reset_password_otp: string | null;
  reset_password_otp_sent_at: Date | null;
  reset_password_otp_attempts: number;
  reset_password_otp_first_attempt_at: Date | null;
  login_otp: string | null;
  login_otp_sent_at: Date | null;
  login_otp_attempts: number;
  login_otp_first_attempt_at: Date | null;
  unlock_price: number | null;
  platform_url: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// User creation attributes (optional fields for creation)
type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// User model class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public profile_name!: string;
  public username!: string;
  public email!: string;
  public password!: string | null;
  public profile_photo!: string | null;
  public profile_bio!: string | null;
  public role!: "Admin" | "Creator" | "Client" | "Escort";
  public dob!: string | null;
  public age!: number | null;
  public city!: string | null;
  public country!: string | null;
  public extra!: string | null;
  public note!: string | null;
  public timezone!: string | null;
  public live_status!: "Not Available" | "Available" | "By Request" | null;
  public status!:
    | "Approved"
    | "Pending"
    | "Block"
    | "Suspend"
    | "Active"
    | "Inactive";
  public pass_status!: "Default" | "Changed";
  public is_verified!: boolean;
  public deletedAt!: Date | null;
  public dailyFreeUnlocks!: number;
  public reset_password_otp!: string | null;
  public reset_password_otp_sent_at!: Date | null;
  public reset_password_otp_attempts!: number;
  public reset_password_otp_first_attempt_at!: Date | null;
  public login_otp!: string | null;
  public login_otp_sent_at!: Date | null;
  public login_otp_attempts!: number;
  public login_otp_first_attempt_at!: Date | null;
  public unlock_price!: number | null;
  public platform_url!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize User model
User.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Basic Information
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profile_bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Personal Information
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Address Information
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    live_status: {
      type: DataTypes.ENUM("Not Available", "Available", "By Request"),
      allowNull: true,
    },

    // Account Settings
    role: {
      type: DataTypes.ENUM("Admin", "Client", "Escort", "Creator"),
      defaultValue: "Client",
    },
    status: {
      type: DataTypes.ENUM(
        "Approved",
        "Pending",
        "Block",
        "Suspend",
        "Active",
        "Inactive"
      ),
      defaultValue: "Pending",
    },
    pass_status: {
      type: DataTypes.ENUM("Default", "Changed"),
      defaultValue: "Default",
    },

    // Security & Verification
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // App Features
    dailyFreeUnlocks: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
    },

    // Soft Delete
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Password Reset OTP
    reset_password_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_otp_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    reset_password_otp_first_attempt_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Login OTP
    login_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    login_otp_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_otp_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    login_otp_first_attempt_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Pricing & Platform
    unlock_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    platform_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    paranoid: true,
    deletedAt: "deletedAt",
    timestamps: true,
  }
);

export default User;
export type { UserAttributes, UserCreationAttributes };
