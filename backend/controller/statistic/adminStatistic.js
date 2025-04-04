const Order = require("../../models/orders");

async function adminStatistics(req, res) {
  try {
    const orders = await Order.find().populate("items.productId", "productName");

    const salesByMonth = {};
    const topProducts = {}; 

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); 

      if (!salesByMonth[month]) {
        salesByMonth[month] = { date: month, totalSales: 0 };
      }

      order.items.forEach((item) => {
        const productName = item.productId?.productName || "Unknown";

        salesByMonth[month].totalSales += item.quantity * item.priceAtPurchase;

        if (!topProducts[productName]) {
          topProducts[productName] = { name: productName, sales: 0 };
        }

        topProducts[productName].sales += item.quantity;
      });
    });

    const salesByMonthArray = Object.values(salesByMonth)
      .sort((a, b) => b.date.localeCompare(a.date)) 
      .slice(0, 5) 
      .sort((a, b) => a.date.localeCompare(b.date)); 

    const topProductsArray = Object.values(topProducts)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.json({
      salesByMonth: salesByMonthArray, 
      topProducts: topProductsArray,
    });
  } catch (error) {
    console.error("Err adminStatistics:", error);
    res.status(500).json({ message: "Err Server", error: true });
  }
};

module.exports = adminStatistics;
