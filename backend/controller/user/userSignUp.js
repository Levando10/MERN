const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

async function userSignUpController(req, res) {
  try {
    const { email, password, name } = req.body;
    const user = await userModel.findOne({ email });

    if (user) {
      throw new Error("Already user exits.");
    }

    if (!email) {
      throw new Error("Please provide email");
    }
    if (!password) {
      throw new Error("Please provide password");
    }
    if (!name) {
      throw new Error("Please provide name");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hashSync(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    if (!hashPassword) {
      throw new Error("Something is wrong");
    }

    const payload = {
      ...req.body,
      role: "GENERAL",
      isVerified: false,
      verificationToken,
      password: hashPassword,
    };

    const userData = new userModel(payload);
    const saveUser = await userData.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User created Successfully!",
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}
async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `https://mern-v6c4.onrender.com/api/verify-email/${token}`;
  // const verificationLink = `https://localhost:3000/api/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Welcome to Our Service",
    html: `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Our Service!</h2>
        <p style="font-size: 16px; color: #555;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationLink}" 
             style="background-color: #007bff; color: #fff; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
             Verify Your Email
          </a>
        </div>
        <p style="font-size: 14px; color: #777;">If you didn’t create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2025 Our Service. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
module.exports = userSignUpController;
