import City from "../models/city.model";
import Country from "../models/country.model";
import { MESSAGES } from "../constants/messages";
import { Op } from "sequelize";

/**
 * Get all cities with optional country filter
 */
export const getAllCitiesService = async (filters?: {
  country_id?: number;
  country_shortcode?: string;
  search?: string;
}) => {
  const whereCondition: any = {};

  if (filters?.country_id) {
    whereCondition.country_id = filters.country_id;
  }

  if (filters?.country_shortcode) {
    // First find the country by shortcode
    const country = await Country.findOne({
      where: { shortcode: filters.country_shortcode.toLowerCase() },
    });

    if (country) {
      whereCondition.country_id = country.id;
    } else {
      // If country not found, return empty result
      return {
        message: MESSAGES.CITIES_FETCHED,
        cities: [],
        pagination: {
          totalResults: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  if (filters?.search) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${filters.search}%` } },
      { slug: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  const cities = await City.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Country,
        as: "country",
        attributes: ["id", "name", "shortcode"],
      },
    ],
    order: [["name", "ASC"]],
    attributes: ["id", "name", "slug", "country_id"],
  });

  return {
    message: MESSAGES.CITIES_FETCHED,
    cities: cities.rows,
    total: cities.count,
  };
};

/**
 * Get city by ID
 */
export const getCityByIdService = async (id: number) => {
  const city = await City.findByPk(id, {
    include: [
      {
        model: Country,
        as: "country",
        attributes: ["id", "name", "shortcode"],
      },
    ],
    attributes: ["id", "name", "slug", "country_id"],
  });

  if (!city) {
    throw new Error(MESSAGES.CITY_NOT_FOUND);
  }

  return {
    message: MESSAGES.CITY_FETCHED,
    city,
  };
};

/**
 * Get cities by country ID
 */
export const getCitiesByCountryIdService = async (countryId: number) => {
  const country = await Country.findByPk(countryId);

  if (!country) {
    throw new Error(MESSAGES.COUNTRY_NOT_FOUND);
  }

  const cities = await City.findAll({
    where: { country_id: countryId },
    order: [["name", "ASC"]],
    attributes: ["id", "name", "slug", "country_id"],
  });

  return {
    message: MESSAGES.CITIES_FETCHED,
    cities,
  };
};

/**
 * Get cities by country shortcode
 */
export const getCitiesByCountryShortcodeService = async (shortcode: string) => {
  const country = await Country.findOne({
    where: { shortcode: shortcode.toLowerCase() },
  });

  if (!country) {
    throw new Error(MESSAGES.COUNTRY_NOT_FOUND);
  }

  const cities = await City.findAll({
    where: { country_id: country.id },
    order: [["name", "ASC"]],
    attributes: ["id", "name", "slug", "country_id"],
  });

  return {
    message: MESSAGES.CITIES_FETCHED,
    cities,
  };
};
