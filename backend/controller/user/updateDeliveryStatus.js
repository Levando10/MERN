const orderModel = require("../../models/orders");

async function updateDeliveryStatus(req, res) {
    try {
        const { orderId, statusDelivery } = req.body;     
        const validStatuses = ["Pending", "Shipped", "Delivered"];
        if (!validStatuses.includes(statusDelivery)) {
            return res.status(400).json({ message: "Invalid delivery status" });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { statusDelivery },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Delivery status updated successfully!",
            success: true,
            updatedOrder,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating delivery status", error });
    }
};

module.exports = updateDeliveryStatus;
