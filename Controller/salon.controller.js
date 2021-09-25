const { compareSync } = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const config = require ('config');
const crypto = require('crypto')
const nodemailer = require ("nodemailer")
const {cloudinary} = require("../middleware/cloudinary")


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

const stripe = require("stripe");
const Stripe = stripe("sk_test_51JVLh7GHsDLdda7ZlaRmaZCC2Uzmn2yXSjDSgUlSwTx7uAUPHfPKNhZ4kY8ntf8iHeGTamUjFpw9gUkANpkm6WgL00wNQ5K8tD", {
  apiVersion: "2020-08-27",
});


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

    const {name , number , address, location, description, image , time, services} =req.body
    const profileField = {}
    profileField.user=req.user.id
    if(name) profileField.name=name 
    if(description) profileField.description=description
    if(number) profileField.number=number
    if(address) profileField.address= address 
    if(location) profileField.location=location
    if(image) profileField.image=image
    if(time) profileField.time=time
    if(services) profileField.services=services
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
        if(profile){
           profileUpdated = await Profile.findOneAndUpdate({user:req.user.id}, {$set: profileField}, {new: true, useFindAndModify: false})
            return res.json(profileUpdated)

        }

        profile =new Profile(profileField)
        let newProfile = await profile.save()
        console.log("new profile")
        console.log(newProfile)
        if(newProfile){
            let salontoUpdate = await Salon.findOneAndUpdate({_id:req.user.id}, {$set: {profileComplete:true}}, {new: true, useFindAndModify: false})
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
            "http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:5000/failed",
        });

        // const checkout = await new Checkout({
        //   checkoutID: session.id,
        //   userID: req.USER._id,
        //   priceID: priceId,
        // }).save();

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
        let updateAppointment = await Appointment.findOneAndUpdate({_id:appointmentId},{$set: { status:"completed"}}, {new: true, useFindAndModify: false})
        console.log(updateAppointment)
        res.status(200).json(updateAppointment)
    }
    catch(err){
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
    markAsComplete

}