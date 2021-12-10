const Message = require("../model/Message.model")
const io = require("../socket")

const sendMessage = async (req,res)=> {
    const newMessage = new Message (req.body)

    try {
        const saved = await newMessage.save()
        res.status(200).json(saved)
    }
    catch(err){
        res.status(500).json("server error")
    }
}


const getMessage = async (req,res)=>{
    try{
        let messages = await Message.find({conversationId: req.params.conversationId})
        res.status(200).json(messages)
    }
    catch(err){
        res.status(500).json("server error")
    }
} 


module.exports={
    sendMessage,
    getMessage
}