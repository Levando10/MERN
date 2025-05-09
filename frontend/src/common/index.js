const backendDomin = "https://mern-v6c4.onrender.com";
// const backendDomin = "http://localhost:8080";

const SummaryApi = {
    default: {
        url: backendDomin,
    },
    signUP: {
        url: `${backendDomin}/api/signup`,
        method: "post"
    },
    signIn: {
        url: `${backendDomin}/api/signin`,
        method: "post"
    },
    googleLogin: {
        url: `${backendDomin}/api/googleLogin`,
        method: "post"
    },
    reviews: {
        url: `${backendDomin}/api/reviews`,
        method: "get"
    },
    addReview: {
        url: `${backendDomin}/api/create-review`,
        method: "post"
    },
    adminReply: {
        url: `${backendDomin}/api/admin-reply`,
        method: "post"
    },
    forgotPassword: {
        url: `${backendDomin}/api/forgot-password`,
        method: "post"
    },
    current_user: {
        url: `${backendDomin}/api/user-details`,
        method: "get"
    },
    logout_user: {
        url: `${backendDomin}/api/userLogout`,
        method: 'get'
    },
    createOrder: {
        url: `${backendDomin}/api/create-order`,
        method: "post"
    },
    confirmPayment: {
        url: `${backendDomin}/api/confirm-payment`,
        method: "post"
    },
    historyPayment: {
        url: `${backendDomin}/api/history-payment`,
        method: 'get'
    },
    fetchMessages: {
        url: `${backendDomin}/api/fetchMessages`,
        method: 'post'
    },
    allUser: {
        url: `${backendDomin}/api/all-user`,
        method: 'get'
    },
    updateDeliveryStatus: {
        url: `${backendDomin}/api/update-delivery-status`,
        method: 'post'
    },
    allOrders: {
        url: `${backendDomin}/api/all-orders`,
        method: 'get'
    },
    updateUser: {
        url: `${backendDomin}/api/update-user`,
        method: "post"
    },
    updateAvatar: {
        url: `${backendDomin}/api/update-avatar`,
        method: "post"
    },
    updateProfile: {
        url: `${backendDomin}/api/update-profile`,
        method: "post"
    },
    banUser: {
        url: `${backendDomin}/api/ban-user`,
        method: "post"
    },
    uploadProduct: {
        url: `${backendDomin}/api/upload-product`,
        method: 'post'
    },
    allProduct: {
        url: `${backendDomin}/api/get-product`,
        method: 'get'
    },
    updateProduct: {
        url: `${backendDomin}/api/update-product`,
        method: 'post'
    },
    categoryProduct: {
        url: `${backendDomin}/api/get-categoryProduct`,
        method: 'get'
    },
    categoryWiseProduct: {
        url: `${backendDomin}/api/category-product`,
        method: 'post'
    },
    productDetails: {
        url: `${backendDomin}/api/product-details`,
        method: 'post'
    },
    addToCartProduct: {
        url: `${backendDomin}/api/addtocart`,
        method: 'post'
    },
    addToCartProductCount: {
        url: `${backendDomin}/api/countAddToCartProduct`,
        method: 'get'
    },
    addToCartProductView: {
        url: `${backendDomin}/api/view-card-product`,
        method: 'get'
    },
    updateCartProduct: {
        url: `${backendDomin}/api/update-cart-product`,
        method: 'post'
    },
    deleteCartProduct: {
        url: `${backendDomin}/api/delete-cart-product`,
        method: 'post'
    },
    searchProduct: {
        url: `${backendDomin}/api/search`,
        method: 'get'
    },
    filterProduct: {
        url: `${backendDomin}/api/filter-product`,
        method: 'post'
    },
    revenueStatistics: {
        url: `${backendDomin}/api/revenue-statistic`,
        method: 'get'
    }
}


export default SummaryApi