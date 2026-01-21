import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

interface FaqAttributes {
    id: number,
    question: string,
    answer: string,
    is_active: boolean,
    createdAt?: Date,
    updatedAt?: Date;
    deletedAt?: Date;
}

type FaqCreationAttributes = Optional<FaqAttributes,
    "id" | "is_active" | "createdAt" | "updatedAt" | "deletedAt"
>

// faq model class
class Faq
    extends Model<FaqAttributes, FaqCreationAttributes>
    implements FaqAttributes {
    public id!: number;
    public question!: string;
    public answer!: string;
    public is_active!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;
}

Faq.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: "Faq",
        tableName: "faqs",
        timestamps: true,
        paranoid: true, // soft delete support
    }
)

export default Faq;
export type {FaqAttributes,FaqCreationAttributes};