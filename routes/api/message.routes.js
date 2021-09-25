const router = require('express').Router()
const Message = require('../../model/Message.model')
const messageController = require ("../../Controller/message.controller")


router.post("/sendMessage", messageController.sendMessage)


router.get("/getMessage", messageController.getMessage)

module.exports=router