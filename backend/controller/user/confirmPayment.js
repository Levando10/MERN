const orderModel = require("../../models/orders");
const addToCartModel = require("../../models/cartProduct");

const confirmPayment = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.userId;
    if (status === "UNPAID") {
      return res.status(200).json({
        message: "Order was not paid and has been deleted!",
        success: true,
      });
    } else if ("PAID") {
      const cartItems = await addToCartModel.find({ userId });
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart empty!!!" });
      }

      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      }));

      const totalAmount = items.reduce(
        (total, item) => total + item.quantity * item.priceAtPurchase,
        0
      );
      const newOrder = new orderModel({
        userId,
        items,
        totalAmount,
        status: "Paid",
        paymentMethod: "PayOS",
        shippingAddress: "Hà Nội, Việt Nam",
      });

      await newOrder.save();
      await addToCartModel.deleteMany({ userId: userId });

      res.status(200).json({
        message: "Payment successful, order updated, and cart cleared!",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error confirming payment", error });
  }
};

module.exports = confirmPayment;
