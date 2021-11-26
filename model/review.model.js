const mongoose = require ('mongoose');

const reviewSchema = new mongoose.Schema ({

    profile_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'profile',
    },
    user_id: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    },
    rating:{
        type:Number,
        required:true
    },
    review:{
        type:String,
        required:true
    }
})

module.exports= Review = mongoose.model('review', reviewSchema)

