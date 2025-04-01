const orderModel = require("../../models/orders")

async function allOrders(req, res) {
    console.log("vao r");
    
    try {
        const paidOrders = await orderModel.find({ status: 'Paid' });

        res.json({
            message: "All Orders ",
            data: paidOrders,
            success: true,
            error: false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = allOrders