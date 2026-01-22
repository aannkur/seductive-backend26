import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// Message attributes interface
interface MessageAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  conversation_id: number;
  content: string;
  attachment_url?: string | null;
  is_read: boolean;
  read_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Message creation attributes (optional fields for creation)
type MessageCreationAttributes = Optional<
  MessageAttributes,
  "id" | "createdAt" | "updatedAt" | "is_read" | "read_at" | "deletedAt"
>;

// Message model class
class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public conversation_id!: number;
  public content!: string;
  public attachment_url!: string | null;
  public is_read!: boolean;
  public read_at!: Date | null;
  public deletedAt?: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Conversations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachment_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "Messages",
    timestamps: true,
    paranoid: false,
  }
);

// Add associations
Message.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

Message.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

export default Message;
