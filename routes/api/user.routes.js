const router = require('express').Router();
const auth = require('../../middleware/auth');
const userController = require("../../Controller/user.controller")


router.get("/",auth, userController.getAuth)
router.post("/login", userController.validateData("loginUser"), userController.loginUser )
router.post("/register", userController.validateData("signupUser"), userController.signupUser)
router.post("/booking", auth, userController.booking)
router.get("/userAppointments", userController.userAppointments)


module.exports=router;