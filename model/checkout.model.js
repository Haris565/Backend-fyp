const mongoose = require("mongoose");


const checkoutSchema = mongoose.Schema({
  checkoutID: {
    type: String,
    unique:true
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
  },
  packageID:{
      type:String
  },

});

module.exports = mongoose.model("checkout", checkoutSchema);