const userModel = require("../../models/userModel");

async function updateAvatar(req, res) {
  try {
    const { userId, profilePic } = req.body;  
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic },
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
      message: `User has been update avatar.`,
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

module.exports = updateAvatar
