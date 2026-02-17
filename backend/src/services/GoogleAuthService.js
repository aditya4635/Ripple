import { AuthenticationError } from "../errors/index.js";
import logger from "../utils/logger.js";

class GoogleAuthService {
  async verifyToken(token) {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Google API responded with ${response.status}`);
      }

      const payload = await response.json();

      if (!payload?.email || !payload?.email_verified) {
        throw new AuthenticationError("Invalid Google account");
      }

      return {
        email: payload.email,
        fullName: payload.name || payload.email.split("@")[0],
        profilePic: payload.picture || "",
        isVerified: true,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      logger.error("Google token verification failed", error);
      throw new AuthenticationError("Google authentication failed");
    }
  }
}

export default new GoogleAuthService();
