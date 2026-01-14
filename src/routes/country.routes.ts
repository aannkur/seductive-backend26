import { Router } from "express";
import {
  getAllCountriesController,
  getCountryByIdController,
} from "../controllers/country.controller";

const router = Router();

// Get all countries
router.get("/", getAllCountriesController);

// Get country by ID
router.get("/:id", getCountryByIdController);

export default router;
