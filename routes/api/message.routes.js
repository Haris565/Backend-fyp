const router = require('express').Router()
const Message = require('../../model/Message.model')
const messageController = require ("../../Controller/message.controller")
const auth = require("../../middleware/auth")

router.post("/sendMessage",auth, messageController.sendMessage)


router.get("/getMessage/:conversationId", auth, messageController.getMessage)

module.exports=router