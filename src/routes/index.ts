// all the routes will be goes from this to app.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import clientPreferencesRoutes from "./clientPreferences.routes";
import countryRoutes from "./country.routes";
import cityRoutes from "./city.routes";
import tagRoutes from "./tag.routes";
import userTagsRoutes from "./userTags.routes";
import userAvailabilityRoutes from "./userAvailability.routes";
import galleryRoutes from "./gallery.routes";
import userRoutes from "./user.routes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);

// Public routes - Countries, Cities, and Tags
router.use("/countries", countryRoutes);
router.use("/cities", cityRoutes);
router.use("/tags", tagRoutes);

// Protected routes with role-based access like client, advertiser, admin
router.use("/client-preferences", clientPreferencesRoutes);
router.use("/user-availability", userAvailabilityRoutes);
router.use("/user-tags", userTagsRoutes);
router.use("/gallery", galleryRoutes);
router.use("/user", userRoutes);

// Admin routes

export default router;
