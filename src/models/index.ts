// Import all models here to ensure they are registered with Sequelize
import User from "./user.model";
import TempUser from "./tempUser.model";
import ClientPreferences from "./clientPreferences.model";
import Country from "./country.model";
import City from "./city.model";
import Tag from "./tag.model";
import UserGallery from "./userGallery.model";
import UserTags from "./userTags.model";
import UserAvailability from "./userAvailability.model";
import UserRates from "./userRates.model";
import ContactUs from "./contact-us.model";
import Faq from "./faq.model";
import Ad from "./ad.model"

// Export all models
export {
  User,
  TempUser,
  ClientPreferences,
  Country,
  City,
  Tag,
  UserGallery,
  UserTags,
  UserAvailability,
  UserRates,
  ContactUs,
  Faq,
  Ad
};
export default {
  User,
  TempUser,
  ClientPreferences,
  Country,
  City,
  Tag,
  UserGallery,
  UserTags,
  UserAvailability,
  UserRates,
  ContactUs,
  Faq,
  Ad
};
