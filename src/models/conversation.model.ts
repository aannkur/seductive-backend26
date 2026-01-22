import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";

// Conversation attributes interface
interface ConversationAttributes {
  id: number;
  participant_1_id: number;
  participant_2_id: number;
  last_message?: string | null;
  last_message_at?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Conversation creation attributes
type ConversationCreationAttributes = Optional<
  ConversationAttributes,
  "id" | "createdAt" | "updatedAt" | "last_message" | "last_message_at" | "deletedAt"
>;

// Conversation model class
class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: number;
  public participant_1_id!: number;
  public participant_2_id!: number;
  public last_message!: string | null;
  public last_message_at!: Date | null;
  public deletedAt?: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    participant_1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    participant_2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    last_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_message_at: {
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
    modelName: "Conversation",
    tableName: "Conversations",
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ["participant_1_id", "participant_2_id"],
      },
    ],
  }
);

// Add associations
Conversation.belongsTo(User, {
  foreignKey: "participant_1_id",
  as: "participant1",
});

Conversation.belongsTo(User, {
  foreignKey: "participant_2_id",
  as: "participant2",
});

export default Conversation;
