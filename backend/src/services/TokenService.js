import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { COOKIE_OPTIONS } from "../utils/constants.js";

class TokenService {
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  setTokenCookie(res, userId) {
    const token = this.generateToken(userId);
    res.cookie("jwt", token, {
      ...COOKIE_OPTIONS,
      maxAge: config.jwt.maxAgeMs,
    });
    return token;
  }

  clearTokenCookie(res) {
    res.cookie("jwt", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }
}

export default new TokenService();
