const addToCartModel = require("../../models/cartProduct");
const productModel = require("../../models/productModel");

const addToCartController = async (req, res) => {
  try {
    const { productId } = req?.body;
    const currentUser = req.userId;
    const existingCartItem = await addToCartModel.findOne({
      productId,
      userId: currentUser,
    });
    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({
        message: "Product have remove!",
        success: false,
        error: true,
      });
    }

    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();

      return res.json({
        data: existingCartItem,
        message: "Increased quantity in cart",
        success: true,
        error: false,
      });
    }

    const newCartItem = new addToCartModel({
      productId,
      quantity: 1,
      userId: currentUser,
      price: product.sellingPrice,
    });

    const savedItem = await newCartItem.save();

    return res.json({
      data: savedItem,
      message: "Product Added in Cart",
      success: true,
      error: false,
    });
  } catch (err) {
    res.json({
      message: err?.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = addToCartController;
