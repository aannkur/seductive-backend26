import app from "./app";
import sequelize from "./config/db";
import "./models";
import { seedCountries } from "./models/country.model";
import { seedCities } from "./models/city.model";
import { seedTags } from "./models/tag.model";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { initializeSocket } from "./utils/socket.handler";

const PORT = process.env.PORT || 3010;

const shouldSync = process.env.DB_SYNC === "true";
const shouldSeed = process.env.DB_SEED === "true";

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin:'* ',
    credentials: true,
  },
});

// Initialize Socket.IO event handlers
initializeSocket(io);

// Attach io instance to app for use in other parts of the application if needed
(app as any).io = io;

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

    httpServer.listen(PORT, () =>
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

