import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import config from "./config/index.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __dirname = path.resolve();

app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

registerRoutes(app);

if (config.isProduction) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use(errorHandler);

export default app;
