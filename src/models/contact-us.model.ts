import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

/**
 * ContactUs attributes interface
 */
interface ContactUsAttributes {
  id: number;
  full_name: string;
  email: string;
  help_topic: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes
 */
type ContactUsCreationAttributes = Optional<
  ContactUsAttributes,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * ContactUs model class
 */
class ContactUs
  extends Model<ContactUsAttributes, ContactUsCreationAttributes>
  implements ContactUsAttributes
{
  public id!: number;
  public full_name!: string;
  public email!: string;
  public help_topic!: string;
  public message!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Initialize ContactUs model
 */
ContactUs.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Full Name
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // Email Address
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    // What we can help with
    help_topic: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    // Message
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ContactUs",
    tableName: "contact_us",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["help_topic"],
      },
    ],
  }
);

export default ContactUs;
export type { ContactUsAttributes, ContactUsCreationAttributes };
