const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema ({
    name:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true,
        unique:true
    },
    password:{
        type:String,
        require: true
    },
    number:{
        type:String,
        require: true
    },
    city:{
        type:String,
        require: true
    },
    profile:{
        type:String,
    },
    services: [{
        
    }],
    appointment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appointments',
        
    }],
    favorites:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'profile',
        
    }],
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports= User = mongoose.model('user', userSchema)

