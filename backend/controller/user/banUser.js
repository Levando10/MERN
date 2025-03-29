const userModel = require("../../models/userModel");

async function banUser(req, res) {
  try {
    const { userId, isBanned } = req.body;  
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isBanned },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    res.json({
      data: updatedUser,
      message: `User has been ${isBanned ? "banned" : "unbanned"}.`,
      success: true,
      error: false,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = banUser
