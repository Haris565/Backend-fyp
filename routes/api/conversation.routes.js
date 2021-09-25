const router = require("express").Router()
const conversationController = require("../../Controller/conversation.controller")
const auth = require("../../middleware/auth")

//route GET api/conversation
//@desc new user conversation

router.post("/createConversation" ,conversationController.createConversation )
router.get("/userConversation", conversationController.getUserConversation )

module.exports = router