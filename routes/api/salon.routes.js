const router = require('express').Router()
const auth = require("../../middleware/auth");
const salonController = require ("../../Controller/salon.controller")


router.get("/", auth , salonController.getAuth)
router.post("/login", salonController.validateData("loginSalon"), salonController.salonLogin)
router.post("/signup", salonController.validateData("signupSalon"), salonController.salonSignup),
router.post("/setProfile", auth, salonController.profile),
router.get("/getProfile",auth, salonController.getProfile),
router.post("/resetPassword", salonController.resetPassword)
router.post("/newPassword", salonController.newPassword)

module.exports= router;
