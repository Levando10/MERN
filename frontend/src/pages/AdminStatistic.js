import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import SummaryApi from "../common";

const RevenueStatistics = () => {
  const [chartData, setChartData] = useState({
    topProducts: [],
    salesByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  const formattedTopProductsData = chartData.topProducts.slice(0, 5).reduce(
    (acc, product) => {
      acc[product.name] = product.sales;
      return acc;
    },
    { name: "Product" }
  );

  const formattedSalesByMonthData = chartData.salesByMonth.map(month => ({
    month: month.date,
    totalSales: month.totalSales,
  }));

  const FIXED_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  const fetchOrderStatistics = async () => {
    try {
      const response = await fetch(SummaryApi.revenueStatistics.url);
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error("Error when retrieving statistical data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatistics();
  }, []);

  if (loading) {
    return <div className="text-center p-4">⏳ Loading data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Top Products Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Top 5 Best Selling Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart width={500} height={300} data={[formattedTopProductsData]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData.topProducts.slice(0, 5).map((product, index) => (
              <Bar
                key={product.name}
                dataKey={product.name}
                name={product.name}
                fill={FIXED_COLORS[index]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sales by Month Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Sales by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart width={500} height={300} data={formattedSalesByMonthData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueStatistics;
