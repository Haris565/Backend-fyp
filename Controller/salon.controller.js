const { compareSync } = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const config = require ('config');
const crypto = require('crypto')
const nodemailer = require ("nodemailer")



const transport= nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sheixharis006@gmail.com',
      pass: '03235528584'
    }
})


const Salon = require("../model/salon.model")
const Profile =require ("../model/Profile.model")



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
             body('email', 'Invalid email').exists().isEmail(),
             body('password', "Password is required").exists()
            ]   
         }
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
    
    const errors= validationResult(req)
    if(!errors.isEmpty()){
         return res.status(400).json({errors: errors.array()})
    }
    let token
    crypto.randomBytes(32, (err, buffer)=>{
        if(err){
             res.status(400).json({errors:[{msg:"Try later"}]})
        }
        token = buffer.toString("hex");
    })
    const {email} = req.body
    
    try {
  
        let salon = await Salon.findOne ({email});
        if(salon){
            salon.resetToken= token;
            salon.resetTokenExpireation=Date.now()+3600000
            const withToken = await salon.save();
            res.json({withToken})
            transport.sendMail({
                from: 'sheixharis006@gmail.com',
                to: 'sheixharis007@gmail.com',
                subject: 'Reset Password',
                text: `http://localhost:3000/${token}`
              }, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
        }
    }
    catch (err){
        res.status(400).json({errors:[{msg:"Error"}]})
    }
}


const newPassword = async (req,res) =>{
    const password = req.body.password
    const token = req.body.token
    try {
        let salon = await Salon.findOne({resetToken:req.body.token})
        if(salon){
            const salt = await bcrypt.genSalt(10);
            salon.password = await bcrypt.hash(password,salt);
            salon.resetToken=undefined
            salon.resetTokenExpireation=undefined
            let updatedSalon= await salon.save()
            return res.status(400).json({errors:[{msg:"Password Updated"}]})
        }
        else {
            return res.status(400).json({errors:[{msg:"Token Expired"}]})
        }
    }
 
    catch (err){
        res.status(400).json({errors:[{msg:"Sorry cant update"}]})
    }
}


const profile = async (req,res)=> {
    const errors = validationResult(req.body)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name , number , address, location, description, image , time} =req.body
    const profileField = {}
    profileField.user=req.body.user
    if(name) profileField.name=name 
    if(number) profileField.number=number
    if(address) profileField.address= address 
    if(location) profileField.location=location
    if(description) profileField.description=description
    if(image) profileField.image=image
    if(time) profileField.time=time
    try {
        let profile = await Profile.findOne({id: req.user.id})
        if(profile){

            profile = await Profile.findOneAndUpdate({id:req.user.id}, {$set: profileField}, {new: true})
            return res.json(profile)

        }

        profile =new Profile(profileField)
        await profile.save()
        res.json(profile)


    }
    catch(err){
        console.log(err)
        res.status(500).send("Server Error")
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


module.exports={
    getAuth,
    salonLogin,
    salonSignup,
    resetPassword,
    newPassword,
    profile,
    validateData,
    getProfile

}