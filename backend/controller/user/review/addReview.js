const reviewModel = require("../../../models/reviewModel");
const orderModel = require("../../../models/orders");
const productModel = require("../../../models/productModel");

async function addReview(req, res) {
  const { orderId, updatedItems } = req.body;
  const userId = req.userId; 
  try {
    const order = await orderModel
      .findById(orderId)
      .populate("items.productId");
      
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    for (const updatedItem of updatedItems) {
      const { productId, rating, review } = updatedItem;
      const product = order.items.find(
        (item) => item.productId._id.toString() === productId._id.toString()
      );
      
      if (!product) {
        return res
          .status(404)
          .json({ message: "Product not found in this order" });
      }
      
      if (product.isReviewed) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this product." });
      }
      
      product.isReviewed = true;
      await order.save();
      let adminReply = null;
      let isAdminReplied = false;
      let adminId = null;
      
      if (rating === 5) {
        const adminReplies = [
          "Thank you for trusting and supporting our products! See you again next time ❤️",
          "We're thrilled that you're happy with your purchase! Have a great day 😊",
          "Thanks for shopping with us! We hope to see you again in the future 🎉",
          "Your 5-star review made our day! We truly appreciate your support 🙌",
        ];
        adminReply =
          adminReplies[Math.floor(Math.random() * adminReplies.length)];    
        isAdminReplied = true;
        adminId = "67e7d4d4239e88be03f4c93e";
      }

      const newReview = new reviewModel({
        userId: userId,
        productId: product.productId._id,
        orderId,
        rating,
        review,
        adminReply,
        adminId,
        isAdminReplied,
      });
    
      await newReview.save();
      const productNew = await productModel.findById(product.productId._id);
      productNew.reviews.push(newReview._id);
      await productNew.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Review saved successfully!" });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
}

module.exports = addReview;
