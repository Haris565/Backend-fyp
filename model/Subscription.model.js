const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
  },
  customerID: {
    type: String,
  },
  checkoutID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "checkout",
  },
  subscriptionID: {
    type: String,
    default:''
  },
  periodStart: {
    type: String,
    default:''
  },
  periodEnd: {
    type:String,
    default:''
  },
  status: {
    type: String,
    default:''
  },
});

module.exports = mongoose.model("subscription", subscriptionSchema);
