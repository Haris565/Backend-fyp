const mongoose = require ("mongoose");

const conversationSchema = mongoose.Schema({

    members: {
        type:Array
    },

},
    {timeStamp: true}
)


module.exports=Conversation=mongoose.model("conversation", conversationSchema); 