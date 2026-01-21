import app from "./app";
import sequelize from "./config/db";
import "./models";
import { seedCountries } from "./models/country.model";
import { seedCities } from "./models/city.model";
import { seedTags } from "./models/tag.model";

const PORT = process.env.PORT || 3010;

const shouldSync = process.env.DB_SYNC === "true";
const shouldSeed = process.env.DB_SEED === "true";


  (async () => {
    try {
      if (shouldSync) {
        await sequelize.sync({ alter: true });
        console.log("=================> Database synchronized <=================");
      }

      if (shouldSeed) {
        console.log("=================> Seeding Database <=================");

          await seedCountries();
          await seedCities();
          await seedTags();

        console.log("=================> Database seeded successfully <=================");
      }

      app.listen(PORT, () =>
        console.log(
          `=================> Server running on port ${PORT} <=================`
        )
      );
    } catch (error) {
      console.error(
        "xxxxxxxxxxxxxxx Startup failed xxxxxxxxxxxxxxx",
        error
      );
    }
  })();

