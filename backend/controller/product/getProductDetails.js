const productModel = require("../../models/productModel");

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId).populate({
      path: "reviews",
      populate: {
        path: "userId",
        select: "email profilePic",
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    const totalRatings = product.reviews.length;
    const totalStars = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    const averageRating = totalRatings === 0 ? 0 : totalStars / totalRatings;

    res.json({
      data: product,
      totalRatings: totalRatings,
      averageRating: averageRating,
      message: "Ok",
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

module.exports = getProductDetails;
