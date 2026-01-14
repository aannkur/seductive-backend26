import { Sequelize } from "sequelize";
require("dotenv").config();

const DB_NAME = process.env.DB_NAME as string;
const DB_USERNAME = process.env.DB_USERNAME as string;
const DB_PASSWORD = process.env.DB_PASSWORD as string;
const DB_HOST = process.env.DB_HOST as string;
const DB_PORT = Number(process.env.DB_PORT);

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "=================> Database connected successfully! <================="
    );
  } catch (error) {
    console.error(
      "xxxxxxxxxxxxxxx Unable to connect to the database: xxxxxxxxxxxxxxx",
      error
    );
  }
};

// Run connection test
testConnection();

export default sequelize;
