import { FaUser, FaHistory, FaSpinner } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { FaRegCircleUser } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { setUserDetails } from "../store/userSlice";
import SweetAlert from "sweetalert";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../helpers/firebaseConfig";
import Swal from "sweetalert2";
import { HiOutlineEye } from "react-icons/hi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "account";
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [editing, setEditing] = useState(false);
  const [historyPayment, setHistoryPayment] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("All");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchOrderHistory = async () => {
    const response = await fetch(SummaryApi.historyPayment.url, {
      method: SummaryApi.historyPayment.method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    setHistoryPayment(responseData.data);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      fetchOrderHistory();
    }
  }, [user]);

  useEffect(() => {
    if (startDate && endDate) {
      if (startDate > endDate) {
        setErrorMessage("Start date must be before end date.");
      } else {
        setErrorMessage("");
      }
    }
  }, [startDate, endDate]);

  const validateInput = () => {
    const PHONE_REGEX = /^[0-9]{10,11}$/;
    const trimmedName = formData.name?.trim().replace(/\s+/g, " ");
    const trimmedAddress = formData.address?.trim().replace(/\s+/g, " ");
    const trimmedNewPassword = formData.newPassword
      ?.trim()
      .replace(/\s+/g, " ");
    const trimmedConfirmPassword = formData.confirmPassword
      ?.trim()
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
    const trimmedPhone = formData.phone?.trim();

    if (trimmedName.length > 50) {
      Swal.fire(
        "Error!",
        `Name is too long! Maximum allowed is ${50} characters.`,
        "error"
      );
      return false;
    }

    if (trimmedAddress.length > 60) {
      Swal.fire(
        "Error!",
        `Address is too long! Maximum allowed is ${60} characters.`,
        "error"
      );
      return false;
    }

    if (trimmedPhone.length > 11) {
      Swal.fire(
        "Error!",
        `Phone number is too long! Maximum allowed is ${11} characters.`,
        "error"
      );
      return false;
    }

    if (!PHONE_REGEX.test(trimmedPhone)) {
      Swal.fire(
        "Error!",
        "Invalid phone number! It should contain only numbers and be 10-11 digits long.",
        "error"
      );
      return false;
    }

    if (trimmedNewPassword || trimmedConfirmPassword) {
      if (
        trimmedNewPassword?.length < 8 ||
        trimmedConfirmPassword?.length < 8
      ) {
        Swal.fire(
          "Error!",
          "Password must be at least 8 characters long.",
          "error"
        );
        return false;
      }

      if (
        trimmedNewPassword?.length > 30 ||
        trimmedConfirmPassword?.length > 30
      ) {
        Swal.fire(
          "Error!",
          "Password is too long! Maximum allowed is 30 characters.",
          "error"
        );
        return false;
      }
      if (trimmedNewPassword !== trimmedConfirmPassword) {
        Swal.fire(
          "Error!",
          "Passwords do not match. Please try again.",
          "error"
        );
        return false;
      }
    }

    setFormData({
      name: trimmedName,
      phone: trimmedPhone,
      address: trimmedAddress,
      newPassword: trimmedNewPassword ? trimmedNewPassword : "",
      confirmPassword: trimmedConfirmPassword ? trimmedConfirmPassword : "",
    });
    formData.name = trimmedName;
    formData.phone = trimmedPhone;
    formData.address = trimmedAddress;
    formData.newPassword = trimmedNewPassword ? trimmedNewPassword : "";
    formData.confirmPassword = trimmedConfirmPassword
      ? trimmedConfirmPassword
      : "";

    return true;
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

  const filteredOrders = historyPayment?.filter((order) => {
    const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    const inDateRange =
      (!start || orderDate >= start) && (!end || orderDate <= end);

    const matchesStatus =
      deliveryStatusFilter === "All" ||
      order.statusDelivery === deliveryStatusFilter;

    return inDateRange && matchesStatus;
  });

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `avatar/${user._id}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const fetchResponse = await fetch(SummaryApi.updateAvatar.url, {
            method: SummaryApi.updateAvatar.method,
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              userId: user._id,
              profilePic: downloadURL,
            }),
          });
          const responseData = await fetchResponse.json();
          if (responseData.success) {
            dispatch(setUserDetails({ ...user, profilePic: downloadURL }));
            setTimeout(() => {
              SweetAlert(
                "Updating avatar successfully!",
                "Your avatar has been updated.",
                "success"
              );
            }, 200);
          } else {
            console.error("Failed to update avatar:", responseData.message);
          }
        } catch (err) {
          console.error("Error getting download URL:", err);
        }
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (!validateInput()) return;
    try {
      const response = await fetch(SummaryApi.updateProfile.url, {
        method: SummaryApi.updateProfile.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name.trim().replace(/\s+/g, " "),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        dispatch(setUserDetails({ ...user, ...formData }));
        setTimeout(() => {
          SweetAlert(
            "Update information success!",
            "Information has been updated!",
            "success"
          );
        }, 300);
        setEditing(false);
      } else {
        console.error("Error update:", responseData.message);
      }
    } catch (err) {
      console.error("Error update", err);
    }
  };

  const handleShowDetail = (order) => {
    const isDelivered = order.statusDelivery === "Delivered";
    let allReviewed = true;

    const productListHtml = order.items
      .map((item, index) => {
        if (!item.isReviewed) allReviewed = false;
        const realStar = item?.productId?.reviews?.find(
          (review) => review?.orderId === order?._id
        );

        const ratingStars = [...Array(5)]
          .map(
            (_, i) =>
              `<span 
                class="star ${item.isReviewed ? "disabled" : "clickable"}" 
                data-index="${index}" 
                data-value="${i + 1}" 
                style="cursor: ${
                  item.isReviewed ? "default" : "pointer"
                }; font-size: 20px; color: ${
                i < (realStar?.rating || 5) ? "#FFD700" : "#ccc"
              };">★</span>`
          )
          .join("");

        return `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
            <img src="${item.productId.productImage[0] || "/placeholder.jpg"}" 
                 alt="${item.productId.productName}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
            <div>
                <p><strong>${item.productId.productName}</strong></p>
                <p>Brand: ${item.productId.brandName}</p>
                <p>Category: ${item.productId.category}</p>
                <p>Price: <strong>${formatCurrency(
                  item.priceAtPurchase
                )}</strong></p>
                <p>Quantity: <strong>${item.quantity}</strong></p>

                ${
                  isDelivered
                    ? `
                <div>
                  <p style="margin-bottom: 5px;">Rating:</p>
                  <div class="rating-container" data-index="${index}">
                    ${ratingStars}
                  </div>
                  <input type="hidden" id="rating-${index}" value="${
                        item.rating || 5
                      }">
                </div>

                <div>
                  <label for="review-${index}">Review:</label>
                  <textarea
                      id="review-${index}"
                      name="review-${index}"
                      placeholder="Write your review here"
                      style="width: 100%; min-height: 60px; max-height: 60px; resize: unset; min-width: 310px;"
                      ${item.isReviewed ? "disabled" : ""}
                  >${
                    realStar?.review || "Good product, very satisfied!"
                  }</textarea>
                </div>

                <div style="margin-top: 8px;">
                  <input type="checkbox" id="reviewed-${index}" name="reviewed-${index}" 
                  ${item.isReviewed ? "checked disabled" : ""}>
                  <label for="reviewed-${index}" style="margin-left: 5px; font-size: 14px;">
                    Mark as Reviewed
                  </label>
                </div>
                `
                    : ""
                }
            </div>
        </div>
        `;
      })
      .join("");

    let deliveryStatusColor = "";
    let deliveryStatusBack = "";
    switch (order.statusDelivery) {
      case "Pending":
        deliveryStatusColor = "#854D0E";
        deliveryStatusBack = "#FEF08A";
        break;
      case "Shipped":
        deliveryStatusColor = "#1E40AF";
        deliveryStatusBack = "#BFDBFE";
        break;
      case "Delivered":
        deliveryStatusColor = "#065F46";
        deliveryStatusBack = "#BBF7D0";
        break;
    }

    Swal.fire({
      title: `Order Details`,
      html: `
        <div style="text-align: left;">
            <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(
              order.totalAmount
            )}</p>
            <p style="margin-bottom: 4px"><strong>Status:</strong> 
                <span style="color: ${
                  order.status === "Paid" ? "green" : "red"
                };">
                    ${order.status}
                </span>
            </p>
            <hr>
            <p style="margin-bottom: 8px;padding: 8px 0"><strong>Status Delivery:</strong> 
                <span style="color: ${deliveryStatusColor}; background-color: ${deliveryStatusBack}" class="px-2 py-1 rounded">
                    ${order.statusDelivery}
                </span>
            </p>
            <hr>
            <h3>Products in Order:</h3>
            ${productListHtml}
        </div>
      `,
      confirmButtonText: "Save Review",
      confirmButtonColor: "#4CAF50",
      showConfirmButton: isDelivered && !allReviewed,
      cancelButtonText: "Close",
      showCancelButton: true,
      cancelButtonColor: "#DC2626",
      didOpen: () => {
        document.querySelectorAll(".clickable").forEach((star) => {
          star.addEventListener("click", function () {
            const index = this.getAttribute("data-index");
            const value = this.getAttribute("data-value");
            document
              .querySelectorAll(
                `.rating-container[data-index='${index}'] .star`
              )
              .forEach((s, i) => {
                s.style.color = i < value ? "#FFD700" : "#ccc";
              });
            const ratingInput = document.getElementById(`rating-${index}`);
            if (ratingInput) {
              ratingInput.value = value;
            }
          });
        });
      },
      preConfirm: () => {
        if (isDelivered && !allReviewed) {
          const updatedItems = order.items.map((item, index) => {
            const ratingInput = document.getElementById(`rating-${index}`);
            const rating = ratingInput ? parseInt(ratingInput.value) : 5;
            const review = document.getElementById(`review-${index}`).value;
            const isReviewed = document.getElementById(
              `reviewed-${index}`
            ).checked;
            return {
              ...item,
              isReviewed,
              rating,
              review,
            };
          });
          saveReview(order._id, updatedItems);
        }
      },
    });
  };

  const saveReview = async (orderId, updatedItems) => {
    try {
      const response = await fetch(SummaryApi.addReview.url, {
        method: SummaryApi.addReview.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          updatedItems,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Your review has been saved.",
          icon: "success",
          confirmButtonText: "Close",
          confirmButtonColor: "#DC2626",
        });
        fetchOrderHistory();
      } else {
        Swal.fire({
          title: "Error!",
          text: "There was an error saving your review.",
          icon: "error",
          confirmButtonText: "Close",
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (error) {
      console.error("Error saving review:", error);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "Close",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  const statusColors = {
    Pending: "bg-yellow-200 text-yellow-800",
    Shipped: "bg-blue-200 text-blue-800",
    Delivered: "bg-green-200 text-green-800",
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/4 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-700">Account</h2>
        <ul className="space-y-4">
          <li
            className={`flex items-center p-3 cursor-pointer rounded-lg transition duration-200 ${
              selectedTab === "account"
                ? "text-white bg-red-600 hover:bg-red-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedTab("account")}
          >
            <FaUser className="mr-3" /> Account Management
          </li>
          <li
            className={`flex items-center p-3 cursor-pointer rounded-lg transition duration-200 ${
              selectedTab === "orders"
                ? "text-white bg-red-600 hover:bg-red-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedTab("orders")}
          >
            <FaHistory className="mr-3" /> Order history
          </li>
        </ul>
      </div>

      <div className="w-3/4 p-8">
        {selectedTab === "account" ? (
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Account Management
            </h1>

            <div className="bg-white p-8 rounded-xl w-full max-w-md">
              <div className="relative flex flex-col items-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatarInput"
                />
                <label
                  htmlFor="avatarInput"
                  className="cursor-pointer relative group"
                >
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-28 h-28 rounded-full shadow-md object-cover transition-opacity duration-300 group-hover:opacity-70"
                    />
                  ) : (
                    <FaRegCircleUser className="w-28 h-28" />
                  )}
                  <span className="rounded-full absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Change photo
                  </span>
                </label>
              </div>

              {editing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Full Name"
                  />
                  <p className="text-gray-600 mb-2">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Addres..."
                  />

                  <div className="relative w-full mb-3">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                      placeholder="New Password"
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <AiOutlineEyeInvisible size={20} />
                      ) : (
                        <AiOutlineEye size={20} />
                      )}
                    </span>
                  </div>

                  <div className="relative w-full mb-3">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                      placeholder="Confirm Password"
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible size={20} />
                      ) : (
                        <AiOutlineEye size={20} />
                      )}
                    </span>
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    <strong className="text-gray-700">Name:</strong> {user.name}
                  </p>
                  <p className="text-lg mb-2">
                    <strong className="text-gray-700">Email:</strong>{" "}
                    {user.email}
                  </p>
                  <p className="text-lg mb-2">
                    <strong className="text-gray-700">Address:</strong>{" "}
                    {user.address || "N/A"}
                  </p>
                  <div
                    className="relative inline-block"
                    onMouseEnter={() => setShowPassword(true)}
                    onMouseLeave={() => setShowPassword(false)}
                  >
                    <p className="text-lg mb-2 cursor-pointer relative">
                      <strong className="text-gray-700">Password:</strong>{" "}
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        ********************
                      </span>
                      {showPassword && (
                        <span className="absolute left-0 top-full mt-2 bg-gray-800 text-white text-sm py-1 px-3 rounded-lg shadow-md">
                          {user.password}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-lg mb-4">
                    <strong className="text-gray-700">Phone:</strong>{" "}
                    {user.phone}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-red-500 text-white p-3 rounded-lg shadow-md hover:bg-gray-800 transition-all"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Order history
            </h1>

            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date:
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!startDate}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mt-auto flex gap-2">
                {["All", "Pending", "Shipped", "Delivered"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setDeliveryStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        deliveryStatusFilter === status
                          ? "text-white bg-red-600 hover:bg-red-700"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            {filteredOrders && filteredOrders?.length ? (
              <div
                className="space-y-4"
                style={{ overflow: "auto", maxHeight: "490px" }}
              >
                {filteredOrders?.map((order, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg shadow-sm bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div className="w-20 h-20">
                        <img
                          src={
                            order.items[0]?.productId?.productImage[0] ||
                            "/placeholder.jpg"
                          }
                          alt="Product"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      <div className="col-span-2">
                        <p className="font-semibold text-lg">
                          Order id: {order._id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date created: {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            order.status === "Paid"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {order.status}
                        </p>
                        <p
                          style={{ maxWidth: "85px", display: "inline-block" }}
                          className={`px-2 py-1 rounded ${
                            statusColors[order.statusDelivery]
                          }`}
                        >
                          {order.statusDelivery}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleShowDetail(order)}
                        className="text-gray-600 hover:text-blue-500 transition"
                      >
                        <HiOutlineEye size={22} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
