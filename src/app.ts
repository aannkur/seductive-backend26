import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { loggerMiddleware } from "./middleware/logger.middleware";
import routes from "./routes";

const app = express();
app.use(express.json());
app.use(cookieParser());
// Logger middleware
app.use(loggerMiddleware);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(helmet());
app.use(morgan("dev"));

// API routes
app.use("/api", routes);

app.get("/", (_req: Request, res: Response) => {
  res.send({
    STATUS: "OK",
    HEALTH: "GOOD",
  });
});

export default app;
