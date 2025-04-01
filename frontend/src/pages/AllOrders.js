import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import SweetAlert from "sweetalert";

const Allorders = () => {
    const [allOrders, setAllorders] = useState([]);

    const fetchAllorders = async () => {
        const fetchData = await fetch(SummaryApi.allOrders.url, {
            method: SummaryApi.allOrders.method,
            credentials: "include",
        });

        const dataResponse = await fetchData.json();
        if (dataResponse.success) {
            setAllorders(dataResponse.data);
            console.log(dataResponse.data[0]);
            
        }

        if (dataResponse.error) {
            SweetAlert(
                "Failed to load order list!",
                "An error occurred while fetching the order list. Please try again later.",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchAllorders();
    }, []);

    return (
        <div className="bg-white pb-4">
            <table className="w-full userTable">
                <thead>
                    <tr className="bg-black text-white">
                        <th>Sr.</th>
                        <th>Name</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Shipping Address</th>
                    </tr>
                </thead>
                <tbody>
                    {allOrders.map((order, index) => {
                        return (
                            <tr key={order._id}>
                                <td>{index + 1}</td>
                                <td>{order.userId ? order.userId.name : 'N/A'}</td>
                                <td>{order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : 'N/A'}</td>
                                <td>{order.status}</td>
                                <td>{order.paymentMethod || 'N/A'}</td>
                                <td>{order.shippingAddress || 'N/A'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Allorders;
