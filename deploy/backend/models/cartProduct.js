const mongoose = require("mongoose");

const addToCart = mongoose.Schema(
  {
    productId: {
      ref: "product",
      type: String,
    },
    quantity: Number,
    userId: String,
    price : Number,
  },
  {
    timestamps: true,
  }
);

const addToCartModel = mongoose.model("addToCart", addToCart);

module.exports = addToCartModel;
