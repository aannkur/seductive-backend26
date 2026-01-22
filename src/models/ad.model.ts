import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

export type AdType = "vip" | "featured" | "standard";
export type AdPlacement = "home" | "searchresult" | "profilehighlight";

interface AdAttributes {
  id: number;
  adTitle: string;
  adDescription: string;
  adType: AdType;
  mediaUrls: string[];
  adPlacement: AdPlacement;
  adDuration: number;
  mainProfile?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface AdCreationAttributes extends Optional<AdAttributes, "id"> { }

export class Ad
  extends Model<AdAttributes, AdCreationAttributes>
  implements AdAttributes {
  public id!: number;
  public adTitle!: string;
  public adDescription!: string;
  public adType!: AdType;
  public mediaUrls!: string[];
  public adPlacement!: AdPlacement;
  public adDuration!: number;
  public mainProfile?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | undefined;

}

Ad.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    adTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    adType: {
      type: DataTypes.ENUM("vip", "featured", "standard"),
      allowNull: false,
    },
    mediaUrls: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    mainProfile:{
      type:DataTypes.STRING,
      allowNull: true,
    },
    adPlacement: {
      type: DataTypes.ENUM(
        "home",
        "searchresult",
        "profilehighlight"
      ),
      allowNull: false,
    },
    adDuration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Ad",
    tableName: "ads",
    timestamps: true,
    paranoid: true,    
    deletedAt: "deletedAt",
  }
);

export default Ad;
export type { AdAttributes, AdCreationAttributes };
