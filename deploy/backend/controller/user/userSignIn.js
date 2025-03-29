const bcrypt = require("bcryptjs");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");

async function userSignInController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new Error("Please provide email");
    }
    if (!password) {
      throw new Error("Please provide password");
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Your email don't exits!",
        error: true,
        success: false,
        wrongEmail: true
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in.",
          notVerified: true
      });
  }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned. Please contact support.",
        error: true,
        success: false,
        isBanned: true
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    
    if (checkPassword) {
      const tokenData = {
        _id: user._id,
        email: user.email,
      };
      const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 8,
      });

      const tokenOption = {
        httpOnly: true,
        secure: true,
      };

      res.cookie("token", token, tokenOption).status(200).json({
        message: "Login successfully",
        data: token,
        success: true,
        error: false,
      });
    } else {
      return res.status(401).json({
        message: "Your account wrong password!!!",
        error: true,
        success: false,
        wrongPassword: true
      });
    }
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = userSignInController;
