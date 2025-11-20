import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    console.log("Testing email configuration...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***" : "NOT SET");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself as a test
      subject: "Test Email - OTP System",
      text: "This is a test email from your Ripple app. If you receive this, your email configuration is working correctly!",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("\n✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("\n❌ Error sending email:");
    console.error("Error message:", error.message);
    
    if (error.code === "EAUTH") {
      console.error("\n⚠️  Authentication failed. Please check:");
      console.error("   1. EMAIL_USER is set to your Gmail address");
      console.error("   2. EMAIL_PASS is set to your App Password (NOT your regular Gmail password)");
      console.error("   3. You have enabled 2-Step Verification on your Google account");
      console.error("   4. You have generated an App Password at: https://myaccount.google.com/apppasswords");
    }
  }
}

testEmail();
