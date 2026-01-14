import { Router } from "express";
import {
  getAllCitiesController,
  getCityByIdController,
  getCitiesByCountryIdController,
} from "../controllers/city.controller";
import paginate from "../middleware/pagination.middleware";
import City from "../models/city.model";
import Country from "../models/country.model";

const router = Router();

// Get all cities with pagination and filters (country_id, search)
router.get(
  "/",
  paginate(City, [
    {
      model: Country,
      as: "country",
      attributes: ["id", "name", "shortcode"],
    },
  ]),
  getAllCitiesController
);

// Get cities by country ID
router.get("/country/:countryId", getCitiesByCountryIdController);

// Get city by ID
router.get("/:id", getCityByIdController);

export default router;
