import Country from "../models/country.model";
import { MESSAGES } from "../constants/messages";

/**
 * Get all countries
 */
export const getAllCountriesService = async () => {
  const countries = await Country.findAll({
    order: [["name", "ASC"]],
    attributes: ["id", "name", "shortcode"],
  });

  return {
    message: MESSAGES.COUNTRIES_FETCHED,
    countries,
  };
};

/**
 * Get country by ID
 */
export const getCountryByIdService = async (id: number) => {
  const country = await Country.findByPk(id, {
    attributes: ["id", "name", "shortcode"],
  });

  if (!country) {
    throw new Error(MESSAGES.COUNTRY_NOT_FOUND);
  }

  return {
    message: MESSAGES.COUNTRY_FETCHED,
    country,
  };
};
