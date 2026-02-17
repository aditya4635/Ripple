import authService from "../services/AuthService.js";
import { HTTP_STATUS } from "../utils/constants.js";

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.initiateSignup(req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const user = await authService.verifyEmail(req.body, res);
      res.status(HTTP_STATUS.CREATED).json(user);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const result = await authService.resendOTP(req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      const user = await authService.googleLogin(req.body, res);
      res.status(HTTP_STATUS.OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const user = await authService.login(req.body, res);
      res.status(HTTP_STATUS.OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(_req, res, next) {
    try {
      authService.logout(res);
      res.status(HTTP_STATUS.OK).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  async checkAuth(req, res, next) {
    try {
      const user = authService.formatUserResponse(req.user);
      res.status(HTTP_STATUS.OK).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
