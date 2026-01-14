import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { COUNTRIES } from "../constants/countries";

// Country attributes interface
interface CountryAttributes {
  id: number;
  name: string;
  shortcode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Country creation attributes
type CountryCreationAttributes = Optional<
  CountryAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// Country model class
class Country
  extends Model<CountryAttributes, CountryCreationAttributes>
  implements CountryAttributes
{
  public id!: number;
  public name!: string;
  public shortcode!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Country model
Country.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Country Name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Country Shortcode
    shortcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        // Ensure shortcode is always lowercase
        this.setDataValue("shortcode", value.toLowerCase());
      },
      validate: {
        len: [2, 2], // Ensure shortcode is exactly 2 characters
      },
    },
  },
  {
    sequelize,
    modelName: "Country",
    tableName: "countries",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
      {
        unique: true,
        fields: ["shortcode"],
      },
    ],
  }
);

// Seed function to initialize countries
export const seedCountries = async () => {
  try {
    for (const country of COUNTRIES) {
      await Country.findOrCreate({
        where: { shortcode: country.shortcode },
        defaults: country,
      });
    }

    console.log(
      "=================> Countries seeded successfully <================="
    );
  } catch (error) {
    console.error("Error seeding countries:", error);
  }
};

export default Country;
export type { CountryAttributes, CountryCreationAttributes };
