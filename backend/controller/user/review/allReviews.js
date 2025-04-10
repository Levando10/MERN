const reviewModel = require("../../../models/reviewModel");
async function allReviews(req, res) {
  try {
    const reviews = await reviewModel
      .find()
      .populate("userId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}
module.exports = allReviews;
