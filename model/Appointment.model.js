const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Appointments = new Schema({
    salon_id: {
        type: mongoose.Types.ObjectId,
        ref:"salon",
        required: true
    },
    customer_id: {
        type: mongoose.Types.ObjectId,
        ref:"user",
        required: true
    },
    profile_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'profile',
    },
    start_time: {
        type: String,
        
    },
    end_time: {
        type: String,
        
    },
    services: [
        {
        }
    ],
    status: {
        type:String,
        default:"pending",
        enum:['accepted', "rejected", "completed", "pending"]
    },
    appointment_date: {
        type: Date,
        
    },
    paymentStatus:{
        type: String,
        
    },
    isReviewed:{
        type:Boolean,
        default:false
    },
},
    {
        timestamps: true,
    }
);
module.exports = Appointment = mongoose.model("Appointments", Appointments);