const router = require('express').Router();
const auth = require('../../middleware/auth');
const userController = require("../../Controller/user.controller")


router.get("/",auth, userController.getAuth)
router.post("/login", userController.validateData("loginUser"), userController.loginUser )
router.post("/register", userController.signupUser)
router.post("/booking", auth, userController.booking)
router.get("/userAppointments", userController.userAppointments)
router.get("/getSalons", userController.getSalons)
router.get("/getNearBySalons", userController.getNearBySalons)


module.exports=router;