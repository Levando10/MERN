const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

async function updateProfile(req, res) {
  try {
    const { userId, name, phone, newPassword, confirmPassword } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    if (!name) {
      return res.status(400).json({
        message: "Please provide a name.",
        success: false,
      });
    }

    if (!phone) {
      return res.status(400).json({
        message: "Please provide a phone number.",
        success: false,
      });
    }

    const updateData = { name, phone };

    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "Both new password and confirm password are required.",
          success: false,
        });
      }
      if (newPassword.length < 8 || newPassword.length > 30) {
        return res.status(400).json({
          message: "Password must be between 8 and 30 characters long.",
          success: false,
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "Passwords do not match.",
          success: false,
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.json({
      data: updatedUser,
      message: "Profile updated successfully.",
      success: true,
    });
  } catch (err) {
    res.status(400).json({ message: err.message, success: false });
  }
}

module.exports = updateProfile;
