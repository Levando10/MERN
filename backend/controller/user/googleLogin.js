const { OAuth2Client } = require("google-auth-library");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GG_CLIENT_ID);

async function googleLoginController(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ message: "No token provided", success: false });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GG_CLIENT_ID,
    });
    const { email, name, picture, sub } = ticket.getPayload();

    let user = await userModel.findOne({ email });
    console.log(sub);

    if (user && !user.googleId) {
      return res.status(400).json({
        message:
          "This email is already registered with a password. Please log in with your email and password.",
        success: false,
        usePassword: true,
      });
    }

    if (!user) {
      user = new userModel({
        email,
        name,
        profilePic: picture,
        googleId: sub,
        isVerified: true,
        isBanned: false,
      });
      await user.save();
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        notVerified: true,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned. Please contact support.",
        error: true,
        success: false,
        isBanned: true,
      });
    }

    const tokenData = {
      _id: user._id,
      email: user.email,
    };
    const tokenGen = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: 60 * 60 * 8,
    });

    const tokenOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("token", token, tokenOption).status(200).json({
      message: "Google login successful",
      data: tokenGen,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Google login failed",
      success: false,
    });
  }
}

module.exports = googleLoginController;
