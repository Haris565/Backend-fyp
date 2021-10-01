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
    start_time: {
        type: String,
        
    },
    end_time: {
        type: String,
        
    },
    services: [{
        name:{
            type:String
        },
        price:{
            type:String
        }
    }],
    
    status: {
        type:String,
        default:"pending"
    },
    appointment_date: {
        type: Date,
        
    },
    paymentStatus:{
        type: String,
        
    } 
},
    {
        timestamps: true,
    }
);
module.exports = Appointment = mongoose.model("Appointments", Appointments);