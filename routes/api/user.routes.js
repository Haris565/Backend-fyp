const router = require('express').Router();
const auth = require('../../middleware/auth');
const userController = require("../../Controller/user.controller")
const conversationController = require("../../Controller/conversation.controller")
const messageController = require ("../../Controller/message.controller")

router.get("/",auth, userController.getAuth)
router.post("/login", userController.validateData("loginUser"), userController.loginUser )
router.post("/register" ,userController.validateData("signupUser"), userController.signupUser)
router.post("/booking", auth, userController.booking)
router.post("/addToFavorite", userController.addToFavorite)
router.get("/userAppointments",auth, userController.userAppointments)
router.get("/userPreviousAppointments",auth, userController.userPreviousAppointments)
router.get("/getSalons", userController.getSalons)
router.get("/getNearBySalons", userController.getNearBySalons)
router.get("/getFavorites", auth, userController.getFavorites)
router.get("/getReview/:profile_id", userController.getReview)
router.post("/addReview", auth, userController.addReview)
router.post("/createConversation", auth,  conversationController.createConversation)
router.get("/getConversations",auth, conversationController.getUserConversation )
router.get("/getMessage/:conversationId", auth, messageController.getMessage)
router.post("/sendMessage", auth, messageController.sendMessage)

module.exports=router;