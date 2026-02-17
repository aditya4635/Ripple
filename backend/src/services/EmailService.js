import nodemailer from "nodemailer";
import config from "../config/index.js";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = null;
  }

  _getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    }
    return this.transporter;
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: `"Ripple" <${config.email.user}>`,
      to: email,
      subject: "Verify Your Email - Ripple",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #4f46e5; margin-bottom: 10px;">Ripple</h1>
            <p style="color: #6b7280; font-size: 16px;">Verify your email address</p>
          </div>
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            <div style="background-color: #4f46e5; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this._getTransporter().sendMail(mailOptions);
      logger.info(`OTP email sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send OTP email", error);
      throw new Error("Failed to send verification email. Please try again.");
    }
  }

  async sendEmailChangeOTP(email, otp) {
    const mailOptions = {
      from: `"Ripple" <${config.email.user}>`,
      to: email,
      subject: "Verify Email Change - Ripple",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #4f46e5; margin-bottom: 10px;">Ripple</h1>
            <p style="color: #6b7280; font-size: 16px;">Verify your new email address</p>
          </div>
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            <div style="background-color: #4f46e5; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>If you didn't request this change, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this._getTransporter().sendMail(mailOptions);
      logger.info(`Email change OTP sent to ${email}`);
    } catch (error) {
      logger.error("Failed to send email change OTP", error);
      throw new Error("Failed to send verification email. Please try again.");
    }
  }
}

export default new EmailService();
