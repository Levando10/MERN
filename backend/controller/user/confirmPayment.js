const orderModel = require("../../models/orders");
const addToCartModel = require("../../models/cartProduct");
const userModel = require("../../models/userModel");
const nodemailer = require("nodemailer");

const confirmPayment = async (req, res) => {
  try {

    const { status, address } = req.body;
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
        totalAmount: totalAmount,
        status: "Paid",
        paymentMethod: "PayOS",
        shippingAddress: address ? address : "Hà Nội, Việt Nam",
      });

      await newOrder.save();
      await addToCartModel.deleteMany({ userId: userId });
      const populatedOrder = await orderModel.findById(newOrder._id).populate("items.productId")
      const user = await userModel.findById(userId);
      await sendOrderConfirmationEmail(user.email, populatedOrder);

      res.status(200).json({
        message: "Payment successful, order updated, and cart cleared!",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error confirming payment", error });
  }
};

async function sendOrderConfirmationEmail(email, order) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Order Confirmation - Thank You for Your Purchase!",
    html: `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">Thank You for Your Purchase!</h2>
        <p style="font-size: 16px; color: #555; text-align: center;">Your order has been successfully placed. Here are your order details:</p>
        <div style="background: #fff; padding: 15px; border-radius: 8px;">
          ${order.items.map(item => `
            <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <img src="${item.productId?.productImage?.[0] || '/placeholder.jpg'}" alt="Product" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
              <div>
                <p style="margin: 0; font-weight: bold; color: #333;">Product ID: ${item.productId?.productName}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Quantity: ${item.quantity} | Price: $${item.priceAtPurchase}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <p style="font-size: 16px; color: #555; text-align: center; margin-top: 15px;">Total Amount: <strong style="color: #d9534f;">$${order.totalAmount}</strong></p>
        <p style="font-size: 14px; color: #777; text-align: center;">Your order will be shipped to: <strong>${order.shippingAddress}</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2025 Our Shop. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = confirmPayment;
