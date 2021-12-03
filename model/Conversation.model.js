const mongoose = require ("mongoose");

const conversationSchema = mongoose.Schema({

    members:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"salon"
            }
        ]
    

},
{ timestamps: true }
)


module.exports=Conversation=mongoose.model("conversation", conversationSchema); 