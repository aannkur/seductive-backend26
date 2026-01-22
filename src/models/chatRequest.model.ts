import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// ChatRequest attributes interface
interface ChatRequestAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: "pending" | "accepted" | "rejected";
  message?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// ChatRequest creation attributes
type ChatRequestCreationAttributes = Optional<
  ChatRequestAttributes,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "message"
>;

// ChatRequest model class
class ChatRequest
  extends Model<ChatRequestAttributes, ChatRequestCreationAttributes>
  implements ChatRequestAttributes
{
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public status!: "pending" | "accepted" | "rejected";
  public message!: string | null;
  public deletedAt?: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatRequest.init(
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
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
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
    modelName: "ChatRequest",
    tableName: "ChatRequests",
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ["sender_id", "receiver_id"],
      },
    ],
  }
);

// Add associations
ChatRequest.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

ChatRequest.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

export default ChatRequest;
