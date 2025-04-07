const reviewModel = require("../../../models/reviewModel");

async function adminReplyReview(req, res) {
  try {
    const { reviewId, reply } = req.body;
    const adminId = req.userId;
    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    if (review.isAdminReplied) {
      return res.status(400).json({
        message: "This review has already been replied to by an admin.",
        success: false,
      });
    }

    review.adminReply = reply;
    review.adminId = adminId;
    review.isAdminReplied = true;
    await review.save();  

    return res.status(200).json({
      success: true,
      message: "Admin reply has been added successfully.",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = adminReplyReview;
