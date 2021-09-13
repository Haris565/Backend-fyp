const router = require("express").Router()
const Conversation = require("../../model/Conversation.model")
const auth = require("../../middleware/auth")

//route GET api/conversation
//@desc new user conversation

router.post("/createConversation" , async (req, res)=> {
    // let {senderId , receiverId} = req.body;

    const newConversation = new Conversation ({
        members: [req.body.senderId, req.body.receiverId]
    })

    try {

        let createdConversation = await newConversation.save();
        res.status(200).json(createdConversation);

    }
    catch (err){
        res.status(500).json({msg:"Server Error"})
    }
})

//route GET api/conversation
//@desc get all conversation for the user

router.get("/userConversation" , async (req, res)=> {
    try {
        let conversations = await Conversation.find({
            members:{$in:[req.body.userId]}
        })
        res.status(200).json(conversations)

    }
    catch(err){
        res.status(500).json({msg:"Server Error"})
    }
})

module.exports = router