const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name : String,
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : String,
    profilePic : String,
    role : String,
    phone: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    isBanned: {
        type: Boolean,
        default: false,
      },
},{
    timestamps : true
})


const userModel =  mongoose.model("user",userSchema)


module.exports = userModel