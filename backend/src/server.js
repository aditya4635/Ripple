import http from "http";
import app from "./app.js";
import config from "./config/index.js";
import { connectDB } from "./config/database.js";
import { initializeSocket } from "./socket/index.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  await connectDB();

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });
}

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

startServer();
