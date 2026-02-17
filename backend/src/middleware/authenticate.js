import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import config from "../config/index.js";
import { AuthenticationError } from "../errors/index.js";

export const authenticate = async (req, _res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new AuthenticationError("Unauthorized - No token provided");
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    if (!decoded?.userId) {
      throw new AuthenticationError("Unauthorized - Invalid token");
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new AuthenticationError("Unauthorized - User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }
    next(new AuthenticationError("Unauthorized - Invalid token"));
  }
};
