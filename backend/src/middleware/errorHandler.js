import { AppError, RateLimitError } from "../errors/index.js";
import logger from "../utils/logger.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const errorHandler = (err, _req, res, _next) => {
  logger.error(`${err.name}: ${err.message}`, err);

  if (err instanceof RateLimitError) {
    return res.status(err.statusCode).json({
      message: err.message,
      remainingSeconds: err.remainingSeconds,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error",
  });
};
