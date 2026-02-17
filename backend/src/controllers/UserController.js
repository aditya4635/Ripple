import userService from "../services/UserService.js";
import { HTTP_STATUS } from "../utils/constants.js";

class UserController {
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateProfile(
        req.user._id,
        req.body
      );
      res.status(HTTP_STATUS.OK).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async initiateEmailChange(req, res, next) {
    try {
      const result = await userService.initiateEmailChange(
        req.user._id,
        req.body
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailChange(req, res, next) {
    try {
      const updatedUser = await userService.verifyEmailChange(
        req.user._id,
        req.body
      );
      res.status(HTTP_STATUS.OK).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
