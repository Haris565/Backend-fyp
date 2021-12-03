const mongoose = require ("mongoose");

const messageSchema = mongoose.Schema({

    conversationId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"conversation"
    },
    sender: {
        type:mongoose.Schema.Types.ObjectId,
    },
    text: {
        type: String
    }
    
},
    { timestamps: true }
)

module.exports =Message= mongoose.model('message', messageSchema)