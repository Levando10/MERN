import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import SweetAlert from "sweetalert";
import { HiOutlineEye } from "react-icons/hi";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";

const Allorders = () => {
    const [allOrders, setAllorders] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    const fetchAllorders = async () => {
        const fetchData = await fetch(SummaryApi.allOrders.url, {
            method: SummaryApi.allOrders.method,
            credentials: "include",
        });

        const dataResponse = await fetchData.json();
        if (dataResponse.success) {
            setAllorders(dataResponse.data);
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

    const handleShowDetail = (order) => {
        const productListHtml = order.items
            .map(
                (item) => `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
              <img src="${item.productId.productImage[0] || "/placeholder.jpg"
                    }" alt="${item.productId.productName}" 
                style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
              <div>
                <p><strong>${item.productId.productName}</strong></p>
                <p>Brand: ${item.productId.brandName}</p>
                <p>Category: ${item.productId.category}</p>
                <p>Price: <strong>${formatCurrency(
                        item.priceAtPurchase
                    )}</strong></p>
                <p>Quantity: <strong>${item.quantity}</strong></p>
              </div>
            </div>
          `
            )
            .join("");

        Swal.fire({
            title: `Order Details`,
            html: `
            <div style="text-align: left;">
              <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>Total Amount:</strong> ${formatCurrency(
                order.totalAmount
            )}</p>
              <p style="margin-bottom: 8px"><strong>Status:</strong> 
                <span style="color: ${order.status === "Paid" ? "green" : "red"};">
                  ${order.status}
                </span>
              </p>
              <hr>
              <hr>
              <h3>Products in Order:</h3>
              ${productListHtml}
            </div>
          `,
            confirmButtonText: "Close",
            confirmButtonColor: "#DC2626",
        });
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = React.useMemo(() => {
        let sortedData = [...allOrders];
        if (sortConfig.key) {
            sortedData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortedData;
    }, [allOrders, sortConfig]);

    const updateOrderStatus = async (orderId, currentStatus) => {
        const { value: newStatus } = await Swal.fire({
            title: "Update Order Status",
            input: "select",
            inputOptions: {
                Pending: "⏳ Pending",
                Shipped: "🚛 Shipped",
                Delivered: "✅ Delivered",
            },
            inputPlaceholder: "Select a status",
            showCancelButton: true,
            inputValue: currentStatus,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: "bg-green-500 text-white px-4 py-2 rounded",
                cancelButton: "bg-red-500 text-white px-4 py-2 rounded",
                popup: "shadow-lg",
            },
        });

        if (newStatus) {
            try {
                const response = await fetch(SummaryApi.updateDeliveryStatus.url, {
                    method: SummaryApi.updateDeliveryStatus.method,
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderId, statusDelivery: newStatus }),
                });

                const data = await response.json();
                if (data.success) {
                    Swal.fire("Success!", "Order status updated.", "success");
                    fetchAllorders();
                } else {
                    Swal.fire("Error!", "Failed to update status.", "error");
                }
            } catch (error) {
                Swal.fire("Error!", "Something went wrong.", "error");
            }
        }
    };

    const statusColors = {
        Pending: "bg-yellow-200 text-yellow-800",
        Shipped: "bg-blue-200 text-blue-800",
        Delivered: "bg-green-200 text-green-800",
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    return (
        <div className="bg-white pb-4">
            <h2 style={{ padding: "4px" }} className='font-bold text-lg'>Management Order</h2>
            <table className="w-full userTable">
                <thead>
                    <tr className="bg-black text-white">
                        <th>
                            Sr.
                        </th>
                        <th>
                            <button onClick={() => requestSort('userId')}>Name</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('totalAmount')}>Total Amount</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('status')}>Status</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('createdAt')}>Date Created</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('paymentMethod')}>Payment Method</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('shippingAddress')}>Shipping Address</button>
                        </th>
                        <th>
                            <button onClick={() => requestSort('statusDelivery')}>Update Delivery</button>
                        </th>
                        <th>Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map((order, index) => {
                        return (
                            <tr key={order._id}>
                                <td>{index + 1}</td>
                                <td>{order.userId ? order.userId.name : 'N/A'}</td>
                                <td className="price-right">{formatCurrency(order.totalAmount)}</td>
                                <td>{order.status}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>{order.paymentMethod || 'N/A'}</td>
                                <td>{order.shippingAddress || 'N/A'}</td>
                                <td className="flex justify-between gap-2 items-center">
                                    <span style={{minWidth:"85px"}} className={`px-2 py-1 rounded ${statusColors[order.statusDelivery]}`}>
                                        {order.statusDelivery}
                                    </span>
                                    <FaEdit
                                        onClick={() => updateOrderStatus(order._id, order.statusDelivery)}
                                        size={16}
                                        className="text-gray-600 cursor-pointer hover:text-blue-500 transition"
                                    />
                                </td>
                                <td><button
                                    onClick={() => handleShowDetail(order)}
                                    className="text-gray-600 hover:text-blue-500 transition"
                                >
                                    <HiOutlineEye size={22} />
                                </button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Allorders;
