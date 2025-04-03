const reviewModel = require("../../../models/reviewModel");
const orderModel = require("../../../models/orders")

async function editReview(req, res) {
  try {
    const { reviewId, rating, review } = req.body;
    const userId = req.userId;
    

  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}
module.exports =  editReview;