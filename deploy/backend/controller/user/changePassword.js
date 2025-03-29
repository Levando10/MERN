const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function sendNewPasswordEmail(email, newPassword) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your New Password",
    html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Password Reset Successful</h2>
          <p style="font-size: 16px; color: #555;">Your new password is:</p>
          <div style="text-align: center; font-size: 18px; font-weight: bold; background: #f4f4f4; padding: 10px; border-radius: 5px; margin: 10px 0;">
            ${newPassword}
          </div>
          <p style="font-size: 14px; color: #777;">Please log in and change your password for security reasons.</p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2025 Our Service. All rights reserved.</p>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
}

async function changePassword(req, res) {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Email not found!" });
  }

  const newPassword = generateRandomPassword();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hashSync(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  try {
    await sendNewPasswordEmail(email, newPassword);
    res.json({
      success: true,
      message: "New password has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending email." });
  }
}

module.exports = changePassword;
