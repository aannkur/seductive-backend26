import app from "./app";
import sequelize from "./config/db";
import "./models";
import { seedCountries } from "./models/country.model";
import { seedCities } from "./models/city.model";
import { seedTags } from "./models/tag.model";

const PORT = process.env.PORT || 3010;

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("=================> Database synchronized <=================");
    // Seed countries
    console.log("=================> Seeding Database <=================");
    await seedCountries();
    // Seed cities
    await seedCities();
    // Seed tags
    await seedTags();
    console.log(
      "=================> Database seeded successfully <================="
    );
    app.listen(PORT, () =>
      console.log(
        `=================> Server running on port ${PORT} <=================`
      )
    );
  })
  .catch((error) => {
    console.error(
      "xxxxxxxxxxxxxxx Unable to sync the database: xxxxxxxxxxxxxxx",
      error
    );
  });
