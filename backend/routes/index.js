const express = require("express");

const router = express.Router();

const userSignUpController = require("../controller/user/userSignUp");
const userSignInController = require("../controller/user/userSignIn");
const googleLoginController = require("../controller/user/googleLogin");
const userDetailsController = require("../controller/user/userDetails");
const changePassword = require("../controller/user/changePassword");
const authToken = require("../middleware/authToken");
const userLogout = require("../controller/user/userLogout");
const allUsers = require("../controller/user/allUsers");
const allOrders = require("../controller/user/allOrders");
const updateDeliveryStatus = require("../controller/user/updateDeliveryStatus");
const updateUser = require("../controller/user/updateUser");
const banUser = require("../controller/user/banUser");
const verifyEmailController = require("../controller/user/verifyEmailController");
const confirmPayment = require("../controller/user/confirmPayment");
const createOrder = require("../controller/user/createOrder");
const updateAvatar = require("../controller/user/updateAvatar");
const updateProfile = require("../controller/user/updateProfile");
const PaymentHistory = require("../controller/user/PaymentHistory");
const UploadProductController = require("../controller/product/uploadProduct");
const getProductController = require("../controller/product/getProduct");
const updateProductController = require("../controller/product/updateProduct");
const getCategoryProduct = require("../controller/product/getCategoryProductOne");
const getCategoryWiseProduct = require("../controller/product/getCategoryWiseProduct");
const getProductDetails = require("../controller/product/getProductDetails");
const addToCartController = require("../controller/user/addToCartController");
const countAddToCartProduct = require("../controller/user/countAddToCartProduct");
const addToCartViewProduct = require("../controller/user/addToCartViewProduct");
const updateAddToCartProduct = require("../controller/user/updateAddToCartProduct");
const deleteAddToCartProduct = require("../controller/user/deleteAddToCartProduct");
const searchProduct = require("../controller/product/searchProduct");
const filterProductController = require("../controller/product/filterProduct");
const addReview = require("../controller/user/review/addReview");
const chatMessage = require("../controller/user/chat/chatMessage");
const adminStatistics = require("../controller/statistic/adminStatistic");
const adminReplyReview = require("../controller/user/review/adminReplyReview");
const allReviews = require("../controller/user/review/allReviews");

// Payment
router.post("/create-order", authToken, createOrder);
router.post("/confirm-payment", authToken, confirmPayment);
router.post("/update-delivery-status", authToken, updateDeliveryStatus);

// Account
router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.post("/googleLogin", googleLoginController);
router.post("/forgot-password", changePassword);
router.get("/verify-email/:token", verifyEmailController);
router.get("/history-payment", authToken, PaymentHistory);
router.post("/update-avatar", authToken, updateAvatar);
router.post("/update-profile", authToken, updateProfile);
router.get("/user-details", authToken, userDetailsController);
router.post('/create-review',authToken, addReview);
router.post('/fetchMessages',authToken, chatMessage);
router.get("/userLogout", userLogout);

//admin panel
router.get("/all-orders", authToken, allOrders);
router.get("/reviews", authToken, allReviews);
router.get("/all-user", authToken, allUsers);
router.post("/update-user", authToken, updateUser);
router.post("/ban-user", authToken, banUser);
router.post("/admin-reply", authToken, adminReplyReview);
router.get("/revenue-statistic", adminStatistics);

//product
router.post("/upload-product", authToken, UploadProductController);
router.get("/get-product", getProductController);
router.post("/update-product", authToken, updateProductController);
router.get("/get-categoryProduct", getCategoryProduct);
router.post("/category-product", getCategoryWiseProduct);
router.post("/product-details", getProductDetails);
router.get("/search", searchProduct);
router.post("/filter-product", filterProductController);

//user add to cart
router.post("/addtocart", authToken, addToCartController);
router.get("/countAddToCartProduct", authToken, countAddToCartProduct);
router.get("/view-card-product", authToken, addToCartViewProduct);
router.post("/update-cart-product", authToken, updateAddToCartProduct);
router.post("/delete-cart-product", authToken, deleteAddToCartProduct);

module.exports = router;
