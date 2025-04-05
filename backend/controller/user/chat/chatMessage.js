const messageModel = require("../../../models/messageModel");

async function chatMessage(req, res) {
  const { userId } = req.body;
  try {
    const messages = await messageModel
      .find({
        $or: [
          { sender: userId, receiver: "67e7d4d4239e88be03f4c93e" },
          { sender: "67e7d4d4239e88be03f4c93e", receiver: userId },
        ],
      })
      .sort({ createdAt: 1 });
    // await messageModel.deleteMany();
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = chatMessage;
