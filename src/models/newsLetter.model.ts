import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";


interface NewsLetterAttributes {
    id: number,
    email: string,
    createdAt?: Date;
    updatedAt?: Date;
}

// creation attributs

type NewsLetterCreationAttributes = Optional<
NewsLetterAttributes,
  "id" | "createdAt" | "updatedAt"
>


// Newsletter model class

class Newsletter
  extends Model<NewsLetterAttributes, NewsLetterCreationAttributes>
  implements NewsLetterAttributes
{
  public id!: number;
  public email!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


// initialize NewsLetter model
Newsletter.init(
    {
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
        },
        email:{
            type:DataTypes.STRING(150),
            allowNull:false,
            unique:true,
            validate:{
                isEmail:true
            },
        },
    },
    {
        sequelize,
        modelName:"NewsLetter",
        tableName:"newsletters",
        timestamps:true,
        indexes:[
            {
                fields:["email"],
            },
        ]
    }
)

export default Newsletter;
export type {NewsLetterAttributes, NewsLetterCreationAttributes};