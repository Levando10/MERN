const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productName : String,
    brandName : String,
    category : String,
    productImage : [],
    description : String,
    price : Number,
    sellingPrice : Number,
    reviews: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'review'
      }
  ]
},{
    timestamps : true
})


const productModel = mongoose.model("product",productSchema)

module.exports = productModel