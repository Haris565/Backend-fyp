const mongoose = require ('mongoose');

const salonSchema = new mongoose.Schema ({

    email:{
        type:String,
        require: true,
        unique:true
    },
    password:{
        type:String,
        require: true
    },
    resetToken:{
        type:String,
    },
    resetTokenExpireation: {
        type:Date,
    },
    profileComplete:{
        type:Boolean,
        default:false
    },
    appointment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointments',
    }],
},{ strict: false })

module.exports= Salon = mongoose.model('salon', salonSchema)

