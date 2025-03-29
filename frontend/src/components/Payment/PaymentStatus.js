import { useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SummaryApi from "../../common";
import Context from "../../context";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const userId = searchParams.get("userId")
  const { fetchUserAddToCart } = useContext(Context);
  useEffect(() => {
      const confirmPayment = async () => {
        if (!orderCode) return;

        try {
          const response = await fetch(SummaryApi.confirmPayment.url, {
            method: SummaryApi.confirmPayment.method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: status === "CANCELLED" ? "UNPAID" : "PAID",
              userId
            }),
          });

          const responseData = await response.json();

          if (responseData.success) {
            Swal.fire({
              title:
                status === "CANCELLED"
                  ? "Order Cancelled!"
                  : "Payment Successful!",
              text:
                status === "CANCELLED"
                  ? "Your order has been canceled because the payment was not completed."
                  : "Thank you for your purchase! Your order has been confirmed.",
              icon: status === "CANCELLED" ? "warning" : "success",
              timer: 6000,
              showConfirmButton: false,
            });

            fetchUserAddToCart();
            setTimeout(() => {
              navigate("/");
            }, 400);
          } else {
            Swal.fire({
              title: "Payment Failed!",
              text:
                responseData.message ||
                "We couldn't process your payment. Please try again or contact support.",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error Occurred",
            text: "Something went wrong while confirming your payment. Please try again later.",
            icon: "error",
          });
        }
      };
      confirmPayment();
    
  }, [orderCode, navigate]);

  return null;
};

export default PaymentStatus;
