import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Country from "./country.model";
import { CITIES, generateSlug } from "../constants/cities";

// City attributes interface
interface CityAttributes {
  id: number;
  name: string;
  slug: string;
  country_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// City creation attributes
type CityCreationAttributes = Optional<
  CityAttributes,
  "id" | "createdAt" | "updatedAt"
>;

// City model class
class City
  extends Model<CityAttributes, CityCreationAttributes>
  implements CityAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public country_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize City model
City.init(
  {
    // Primary Key
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // City Name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // City Slug (hyphenated, lowercase)
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        // Ensure slug is always lowercase and hyphenated
        this.setDataValue("slug", generateSlug(value));
      },
    },

    // Foreign Key to Country
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "countries",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "City",
    tableName: "cities",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["country_id"],
      },
      {
        fields: ["name", "country_id"],
      },
    ],
  }
);

// Hook to auto-generate slug from name if not provided
City.beforeValidate((city) => {
  if (city.name && !city.slug) {
    city.slug = generateSlug(city.name);
  }
});

// Define associations
City.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Country.hasMany(City, {
  foreignKey: "country_id",
  as: "cities",
});

// Seed function to initialize cities
export const seedCities = async () => {
  try {
    // Get all countries first
    const countries = await Country.findAll();

    // Create a map of shortcode to country id
    const countryMap = new Map<string, number>();
    countries.forEach((country) => {
      countryMap.set(country.shortcode, country.id);
    });

    // Seed cities for each country
    for (const [shortcode, cityNames] of Object.entries(CITIES)) {
      const countryId = countryMap.get(shortcode);
      if (!countryId) {
        console.warn(`Country with shortcode ${shortcode} not found`);
        continue;
      }

      for (const cityName of cityNames) {
        const slug = generateSlug(cityName);
        await City.findOrCreate({
          where: { slug },
          defaults: {
            name: cityName,
            slug,
            country_id: countryId,
          },
        });
      }
    }

    console.log(
      "=================> Cities seeded successfully <================="
    );
  } catch (error) {
    console.error("Error seeding cities:", error);
  }
};

export default City;
export type { CityAttributes, CityCreationAttributes };
