import express from "express";
import userController from "../controllers/UserController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { validateProfileUpdate } from "../validators/userValidators.js";
import { validateEmailChangeInput } from "../validators/authValidators.js";

const router = express.Router();

router.put(
  "/update-profile",
  authenticate,
  validate(validateProfileUpdate),
  userController.updateProfile
);

router.post(
  "/change-email",
  authenticate,
  validate(validateEmailChangeInput),
  userController.initiateEmailChange
);

router.post(
  "/verify-email-change",
  authenticate,
  userController.verifyEmailChange
);

export default router;
