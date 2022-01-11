const { compareSync } = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const config = require ('config');
const crypto = require('crypto')
const nodemailer = require ("nodemailer")
const {cloudinary} = require("../middleware/cloudinary")
const mongoose = require("mongoose");

const transport= nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sheixharis006@gmail.com',
      pass: '03235528584'
    }
})


const Salon = require("../model/salon.model")
const Profile =require ("../model/Profile.model")
const Appointment = require("../model/Appointment.model")
const Conversation = require ("../model/Conversation.model")
const User = require ("../model/user.model")
const Review = require("../model/review.model")
const Checkout = require("../model/checkout.model")

const stripe = require("stripe");
const Stripe = stripe("sk_test_51JVLh7GHsDLdda7ZlaRmaZCC2Uzmn2yXSjDSgUlSwTx7uAUPHfPKNhZ4kY8ntf8iHeGTamUjFpw9gUkANpkm6WgL00wNQ5K8tD", {
  apiVersion: "2020-08-27",
});
const PUBLISHABLE_KEY ="pk_test_51JVLh7GHsDLdda7Zw1h5Qb4UKMOboJVO3klC09CytOh6qBaPAdEiUOIZyunCQKlJmBPdhG47cax8etvHZ5mvRb1O00At4F5Huy"
const SECRET_KEY="sk_test_51JVLh7GHsDLdda7ZlaRmaZCC2Uzmn2yXSjDSgUlSwTx7uAUPHfPKNhZ4kY8ntf8iHeGTamUjFpw9gUkANpkm6WgL00wNQ5K8tD"


const validateData = (method) => {
    switch (method) {
      case 'signupSalon': {
       return [ 
        
          body('email', 'Please include a valid email').isEmail(),
          body('password', 'Please enter password with 6 or more character').isLength({min:6}),
         
         ]   
      }
  
      case 'loginSalon': {
          return [ 
            body('email', 'Please include a valid email').isEmail(),
            body('password', 'Please enter password with 6 or more character').isLength({min:6}),
            ]   
         }
    }
  }

const uploader = async (req,res)=>{
    let image= req.body.image
    let uploadStr = 'data:image/jpeg;base64,' + image;
    try{
        const uploadedResponse = await cloudinary.uploader.upload(uploadStr,{
            upload_preset:"zks50yqn"
        })
        console.log(uploadedResponse)
        res.status(200).json("Uplaoder")
    }
    catch(err){
        console.log("error")
        res.status(500).json("Server Error")
    }
}
const getAuth = async (req,res)=>{
    try{
        const salon = await Salon.findById(req.user.id).select("-password")
        console.log(salon);
        res.json(salon);
    }
    catch(err){
        console.log(err)
        res.status(500).json("Server Error")
    }
}

const salonLogin = async (req,res) =>{

    try {
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({error:error.array()})
        }
    
        const {email, password}=req.body;
        let salon = await Salon.findOne({email});
        console.log(salon);
        if(!salon){
            return res.status(400).json ({error : [{msg:"Invalid credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, salon.password);
        if(!isMatch){
            return res.status(400).json ({error : [{msg:"Invalid credentials"}]})
        }

        const payload = {
            user:{
              id: salon.id
            }
        }
        jwt.sign(payload, config.get("jwtsecret"), {expiresIn: 360000}, 
        (err, token)=>{
            if(err) throw err;
            res.json({token})
        }
        )
    }
    catch(err){
        console.error(err.message)
        res.status(500).json("Server error")
    }


}



const salonSignup = async (req,res) => {

    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        // if salon exist 
        const {email,password}=req.body
        let salon = await Salon.findOne({email});
        if (salon){
           return res.status(400).json({ errors: [{msg: "email is already register"}]})
        }


        salon = new Salon ({
            email,
            password
        })

        const salt = await bcrypt.genSalt(10);
        salon.password = await bcrypt.hash(password,salt);
        
        await salon.save();
        const payload = {
            user:{
              id: salon.id
            }
        }
        jwt.sign(payload, config.get("jwtsecret"), {expiresIn: 360000}, 
        (err, token)=>{
            if(err) throw err;
            res.json({token})
        }
        )
    }
    catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
}


const resetPassword = async (req,res) =>{
    
    // const errors= validationResult(req)
    // if(!errors.isEmpty()){
    //      return res.status(400).json({errors: errors.array()})
    // }
    let token
    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
             res.status(400).json({errors:[{msg:"Try later"}]})
        }
        token = buffer.toString("hex");
    })
    const {email} = req.body
    console.log(req.body)
    
    try {
        console.log("Hello")
        let salon = await Salon.findOne({email});
        console.log(salon)
        if(salon){
            salon.resetToken= token;
            salon.resetTokenExpireation=Date.now()+3600000
            const withToken = await salon.save();
            res.json({withToken})
            transport.sendMail({
                from: 'sheixharis006@gmail.com',
                to: 'sheixharis007@gmail.com',
                subject: 'Reset Password',
                text: `http://localhost:3000/reset/${token}`
              }, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
        }
        else{
            return res.status(500).json({msg:"Cant find the email"})
        }
    }
    catch (err){
        res.status(400).json({errors:[{msg:"Error"}]})
    }
}


const newPassword = async (req,res) =>{
    console.log(req.body)
    const password = req.body.password
    const token = req.body.token
    try {
        let salon = await Salon.findOne({resetToken:token})
        console.log(salon)
        if(salon){
            const salt = await bcrypt.genSalt(10);
            salon.password = await bcrypt.hash(password,salt);
            salon.resetToken=undefined
            salon.resetTokenExpireation=undefined
            let updatedSalon= await salon.save()
            console.log(updatedSalon)
            return res.status(200).json({errors:[{msg:"Password Updated please login to continue"}]})
        }
        else {
            return res.status(400).json({errors:[{msg:"Token Expired"}]})
        }
    }
 
    catch (err){
        res.status(500).json({errors:[{msg:"Sorry cant update"}]})
    }
}


const profile = async (req,res)=> {
    const errors = validationResult(req.body)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    console.log("--------------------------------------------",req.body)
    const {name , number , address, location, description, image , time, services} =req.body
    const profileField = {}
    profileField.user=req.user.id
    if(name) profileField.name=name 
    if(number) profileField.number=number
    if(address) profileField.address= address 
    if(services) profileField.services=services
    if(location) profileField.location=location
    if(description) profileField.description=description
    if(image) profileField.image=image
    if(time) profileField.time=time
    
    console.log(req.user)
    
    try {
        if(image){
            let uploadStr = 'data:image/jpeg;base64,' + profileField.image;
            const uploadedResponse = await cloudinary.uploader.upload(uploadStr,{
                upload_preset:"zks50yqn"
            })
            console.log(uploadedResponse)
            profileField.image=uploadedResponse.url
        }

        let profile = await Profile.findOne({user: req.user.id})
        console.log("profile founded")
        if(profile){
            console.log("profile founded")
           profileUpdated = await Profile.updateOne({user:req.user.id}, {$set: profileField}, {new: true, useFindAndModify: false})
           console.log("updated", profileUpdated)
            return res.json(profileUpdated)

        }

        profile =new Profile(profileField)
        let newProfile = await profile.save()
        console.log("new profile")
        console.log(newProfile)
        if(newProfile){
            let salontoUpdate = await Salon.findOneAndUpdate({_id:req.user.id}, {$set: {profileComplete:true, profileId:newProfile._id}}, {new: true, useFindAndModify: false})
            console.log(salontoUpdate)
           
        }
        res.json(profile)


    }
    catch(err){
        console.log(err)
        res.status(500).send("server error")
    }
}


const getProfile =  async (req,res,next)=>{
    try{
       let profile = await Profile.findOne({user: req.user.id}).populate('user',['email'])
       if(!profile){
           return res.status(400).json({msg:"There is no profile exist for user"})
       }
       res.json(profile)

    }
    catch(err){
        console.log(err)
        res.status(400).send("Server Error")
    }
}


const checkingCheckout=async (req,res)=>{
    const { priceId } = req.body;
    // const checkUser = await Subscription.find({userID:req.USER._id});
    // let date=new Date().getTime();
    // date=Math.floor(date/1000);
    try {
        const session = await Stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              // For metered billing, do not pass quantity
              quantity: 1,
            },
          ],
        //   subscription_data: {
        //     trial_period_days: 14,
        //   },
          // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
          // the actual Session ID is returned in the query parameter when your customer
          // is redirected to the success page.
          success_url:
            "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:3000/failed",
        });

        const checkout = await new Checkout({
          checkoutID: session.id,
          userID: req.user.id,
          priceID: priceId,
        }).save();

        res.status(200).json({ session: session });
      } catch (err) {
        res.status(500).json(err);
      }
    // if (checkUser.length == 0 || date > checkUser[0].periodEnd) {

    // } else if (date <= checkUser[0].periodEnd) {
    //   res.json({
    //     msg: "your previous subscription is valid .. wait for that to end",
    //   });
    // } 
  }

  const markPaymentDone = async (req,res) => {
      try {
          let checkoutID = req.body.session_id
          let UserCheckout = await Checkout.findOne({checkoutID:checkoutID}) 
          console.log(UserCheckout)
          if(UserCheckout){
              let findUser = await Salon.updateOne({_id:UserCheckout.userID}, {$set: {
                paymentComplete:true
              }})
              console.log(findUser)
              res.status(200).json(findUser)
          }

      }
      catch(err){
          console.log(err)
          res.status(500).json("server error")
      }
  }

  const customerPortal = async (req,res)=>{
    if(req.USER.userType === 'company'){
        const { returnURL } = req.body;
        const subscriptions = await Subscription.find({
          subscriptionID: req.USER.subscriptionID,
        });
  
        const customer = subscriptions[0].customerID;
        const session = await Stripe.billingPortal.sessions.create({
          customer: customer,
          return_url: returnURL,
        });
        res.json(session); 
    }
    else{
      res.status(403).json({msg:"permission denied"})
    }
  }

  const setAppointmentTime = async (req,res) =>{
    try{
        let appointmentId = req.body.appointmentId;
        let startTime = req.body.startTime
        let endTime = req.body.endTime
        let updateAppointment = await Appointment.findOneAndUpdate({_id:appointmentId},{$set: {start_time:startTime, end_time:endTime , status:"accepted"}}, {new: true, useFindAndModify: false})
        console.log(updateAppointment)
        res.status(200).json(updateAppointment)
    }
    catch(err){
        res.status(500).json(err);
    }
  }

  const markAsComplete = async (req,res) =>{
    try{
        let appointmentId = req.body.appointmentId;
        console.log("In to the completed")
        let updateAppointment = await Appointment.findOneAndUpdate({_id:appointmentId},{$set: { status:"completed"}}, {new: true, useFindAndModify: false})
        console.log(updateAppointment)
        res.status(200).json(updateAppointment)
    }
    catch(err){
        res.status(500).json(err);
    }
  }

//   const markAsAccepted = async (req,res) =>{
//     try{
//         let appointmentId = req.body.appointmentId;
//         let updateAppointment = await Appointment.findOneAndUpdate({_id:appointmentId},{$set: { status:"accepted"}}, {new: true, useFindAndModify: false})
//         console.log(updateAppointment)
//         res.status(200).json(updateAppointment)
//     }
//     catch(err){
//         res.status(500).json(err);
//     }
//   }


  const markAsCancelled = async (req,res) =>{
    try{
        let appointmentId = req.body.appointmentId;
        let updateAppointment = await Appointment.findOneAndUpdate({_id:appointmentId},{$set: { status:"cancelled"}}, {new: true, useFindAndModify: false})
        console.log(updateAppointment)
        res.status(200).json(updateAppointment)
    }
    catch(err){
        res.status(500).json(err);
    }
  }

  const getAllAppointments = async (req,res) => {
        let status = req.params.status
        try {
            let appointments = await Appointment.find({salon_id:req.user.id, status:status, appointment_date: {$gte: new Date().toISOString()}}).populate("customer_id");
            console.log(appointments)
            res.status(200).json(appointments)
        }
        catch(err){
            res.status(500).json(err);
        }
  }


  const getCounts = async (req,res)=>{
      console.log(req.user.id)
      try{
        let count = await Appointment.aggregate([
            // // {$match:{status:'pending'}},
            {$match:{salon_id:new mongoose.Types.ObjectId(req.user.id)}},
            
            // {$group:{_id: {state: "$services.price"}, total:{$sum:1}}}

            {$group:{_id: "$status", total:{$sum:1}}}
        ])
        // let count = await Appointment.aggregate([
        //     {$match:{salon_id:ObjectId("6151c9ffa7928e2934748e40")}},
        //     {$group:{_id: {state: "$status"}, total:{$sum:1}}}
        // ])
        console.log(count)
        res.status(200).json(count)
      }
      catch(err){
        res.status(500).json(err);
    }
  }

  const getSalonConversations =async (req,res) =>{
    try{
        console.log("into the controller")
        let profileId = req.params.profileId
        let conversations = await Conversation.find({
            members:{$in:[profileId]}
        })
        res.status(200).json(conversations)
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
  }

  const findChatOtherUser = async (req,res) => {
      try {
        let userId = req.params.userId
        let findUser = await User.findOne({_id: userId})
        res.status(200).json(findUser)

      }
      catch(err){
          console.log(err)
          res.status(500).json(err);
      }
  }

  const getDashboardData = async (req,res) => {
      try {
        let count = await Appointment.aggregate([
            // // {$match:{status:'pending'}},
            {$match:{salon_id:new mongoose.Types.ObjectId(req.user.id)}},
            
            // {$group:{_id: {state: "$services.price"}, total:{$sum:1}}}

            {$group:{_id: null, total:{$sum:1}}}
        ])
        let total = await Appointment.aggregate([
            // // {$match:{status:'pending'}},
            {$match:{salon_id:new mongoose.Types.ObjectId(req.user.id)}},
            

            {$group:{_id: null, total:{$sum:"$total"}}}
        ])

        
        let upComing = await Appointment.find({salon_id:req.user.id, status:"accepted", appointment_date:{$gte: new Date().toISOString()}}).sort( {appointment_date : 1 } ).limit(2).populate("customer_id")
        let reviews = await Review.find({profile_id: req.params.profileId}).limit(2).populate('user_id')
        let canceled = await Appointment.find({salon_id:req.user.id, status:"cancelled"})
        // let count = await Appointment.aggregate([
        //     {$match:{salon_id:ObjectId("6151c9ffa7928e2934748e40")}},
        //     {$group:{_id: {state: "$status"}, total:{$sum:1}}}
        // ])
        // let reviews = await
        
        let cancelRate=0
        let acceptRate=0
        if(count.length > 0){
            cancelRate = (Number(canceled.length)*Number(count[0].total)/100)
            acceptRate = 100-cancelRate
        }
        
        
        console.log(cancelRate)
        res.status(200).json({count, total, upComing, reviews, canceled, cancelRate, acceptRate})
      }
      catch(err){
          console.log(err)
          res.status(500).json(err);
      }
  }


  const packageHandler = async (req, res) => {
    try {
        let service = req.body.service
        let price = req.body.price
        let profileId = req.body.profileId
        let saved = await Profile.updateOne({_id:profileId}, {$set: {
            'package.service':service,
            'package.price': price,
            'package.status':true
        }})
        res.status(200).json(saved)
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
  }

  const activatePackage = async (req, res) => {
    try {
        let profileId = req.body.profileId
        let saved = await Profile.updateOne({_id:profileId}, {$set: {
            'package.status':true
        }})
        res.status(200).json(saved)
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
  }


  const deactivatePackage = async (req, res) => {
    try {
        let profileId = req.body.profileId
        let saved = await Profile.updateOne({_id:profileId}, {$set: {
            'package.status':false
        }})
        res.status(200).json(saved)
    }
    catch(err){
        console.log(err)
        res.status(500).json(err);
    }
  }
module.exports={
    getAuth,
    salonLogin,
    salonSignup,
    resetPassword,
    newPassword,
    profile,
    validateData,
    getProfile,
    uploader,
    checkingCheckout,
    customerPortal,
    setAppointmentTime,
    markAsComplete,
    // markAsAccepted,
    markAsCancelled,
    getAllAppointments,
    getCounts,
    getSalonConversations,
    findChatOtherUser,
    getDashboardData,
    packageHandler,
    activatePackage,
    deactivatePackage,
    markPaymentDone
}