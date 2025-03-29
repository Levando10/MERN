const orderModel = require("../../models/orders");

const PaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId!" });
    }

    const orders = await orderModel
      .find({ userId, status: "Paid" })
      .populate("items.productId");
    if (!orders.length) {
      return res.json({
        message: "No order history found!",
        success: false,
        error: true,
      });
    }

    return res.json({
      data: orders,
      message: "List history",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("❌ Error fetching order history:", error);
    res.status(500).json({ message: "Error fetching order history", error });
  }
};

module.exports = PaymentHistory;
