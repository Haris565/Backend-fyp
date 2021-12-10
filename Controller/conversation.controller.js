const Conversation = require("../model/Conversation.model")


//route GET api/conversation
//@desc new user conversation

const createConversation = async (req, res)=> {
    // let {senderId , receiverId} = req.body;
    console.log(req.body.receiverId)
    console.log(req.user.id )
    try {
        let senderId = req.user.id
        let findConversation = await Conversation.findOne({members:[senderId, req.body.receiverId]})
        console.log(findConversation)

        if(findConversation){
            console.log("find")
            return res.status(200).json(findConversation);
        }
        else {
            const newConversation = new Conversation ({
                members: [senderId, req.body.receiverId]
            })
            let createdConversation = await newConversation.save();
            return res.status(200).json(createdConversation);
        }
       
        
    }
    catch (err){
        res.status(500).json({msg:"Server Error"})
    }
}

//route GET api/conversation
//@desc get all conversation for the user

const getUserConversation = async (req, res)=> {
    try {
        let conversations = await Conversation.find({
            members:{$in:[req.user.id]}
        })
        res.status(200).json(conversations)

    }
    catch(err){
        res.status(500).json({msg:"Server Error"})
    }
}


module.exports = {
    getUserConversation,
    createConversation
}