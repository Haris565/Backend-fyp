const express = require('express');
const mongoose = require("mongoose");
const { compareSync } = require('bcryptjs');
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken")
const config = require ('config');
const { body,validationResult} = require('express-validator')



const User = require('../model/user.model');
const Appointment = require("../model/Appointment.model")
const Salon = require('../model/salon.model');
const Profile = require ("../model/Profile.model")
const Review = require("../model/review.model")




const validateData = (method) => {
  switch (method) {
    case 'signupUser': {
     return [ 
        body('name', 'name is required ').exists(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter password with 6 or more character').isLength({min:6}),
        body('phone', 'Please enter a valid number').isLength({min:11})
       ]   
    }

    case 'loginUser': {
        return [ 
           body('email', 'Invalid email').isEmail(),
           body('password', "Password is required").exists()
          ]   
       }
  }
}


//route GET api/auth
//@desc Test route 


const getAuth = async (req,res,next) => {
    try{
    
        const user = await User.findById(req.user.id).select("-password")
        console.log(user);
        res.json(user);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send("server error")
    }
} 


//route POST api/userLogin
//@desc Login user

const loginUser = async (req,res,next)=>{
    try{
        console.log(req.body)
        const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
        console.log(errors)
        if (!errors.isEmpty()) {
            res.status(422).json({ errors: errors.array() });
            return
        }

        const {email, password}=req.body;
        let user = await User.findOne({email});
        console.log("user", user);
        if(!user){
            
            res.status(422).json({errors : [{msg:"Invalid credentials"}]})
            return
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json ({errors : [{msg:"Invalid credentials"}]})
        }

        const payload = {
            user:{
              id: user.id
            }
        }
        jwt.sign(payload, config.get("jwtsecret"), {expiresIn: 360000}, 
        (err, token)=>{
            if(err) throw err;
            res.json({token})
        }
        )
    }
    catch (err){
        console.log(err)
        res.status(500).json("Server Error")
    }
}


//route POST api/user
//@desc Register user


const signupUser = async (req,res) =>{
    try{
        const errors =  validationResult(req);
        console.log(errors)
        if (!errors.isEmpty()){
            res.status(400).json({errors: errors.array()});
            return
        }
        // if user exist 
        const {name,email,password,number}=req.body
        let user = await User.findOne({email});
        if (user){
           return res.status(400).json({ errors: [{msg: "email is already register"}]})
        }

 

        user = new User ({
            name,
            email,
            password,
            number,
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        
        await user.save();
        const payload = {
            user:{
              id: user.id
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
        console.log(err)
        res.status(500).json("Server Error")
    }
}

//route POST api/user/booking
//@desc book an apppointment for Register user


const booking = async (req,res)=>{
    try{
        const {salon_id, salon_profile, appointment_date, services} =req.body;
        console.log("salon_id", salon_id)
        console.log("services", services)
        const customer_id = req.user.id
        console.log("customer_id", customer_id)
        const appointment = new Appointment({
            customer_id, salon_id, appointment_date, services, profile_id:salon_profile
        })
        let booking = await appointment.save()
        console.log("booking", booking)
        console.log(booking._id)
        if(booking){
            let user = await User.findById(req.user.id)
            console.log("user", user)
            if(user){
                let appointmentsByUser = user.appointment
                appointmentsByUser=[...appointmentsByUser, booking._id]
                console.log(appointmentsByUser)
                const updated= await User.updateOne({_id:req.user.id},{appointment:appointmentsByUser})
                console.log("updated user", updated)
            }
        
            let salon = await Salon.findById(salon_id)
            console.log("salon",salon)
            if(salon){
                let appointmentsforSalon = salon.appointment
                appointmentsforSalon=[...appointmentsforSalon, booking._id]
                console.log(appointmentsforSalon)
                const updated= await Salon.updateOne({_id:req.body.salon_id},{appointment:appointmentsforSalon})
                console.log("updated salon", updated)
            }
            
        }
        res.status(200).json("Booking done")

    }
    catch(err){
        console.log(err)
        res.status(500).json("Server Error")
    }
}


//route POST api/user/appointmentsforSalon
//@desc see all appointments booked for Register salon

const userAppointments = async (req,res)=>{
    console.log("user_id",req.user.id)
    try {
        let allAppointments = await Appointment.find({customer_id:req.user.id, appointment_date: {$gte: new Date().toISOString()} }).populate('salon_id').populate("customer_id").populate("profile_id")
        let salon_id = allAppointments
        res.json(allAppointments)
        console.log(salon_id)
    }
    catch (err){
        res.status(500).send("Server Error")
        console.log(err)
    }
}


const userPreviousAppointments = async (req,res)=>{
    console.log(req.user.id)
    try {
        let allAppointments = await Appointment.find({customer_id:req.user.id, appointment_date: {$lte: new Date().toISOString()} }).populate('salon_id').populate("customer_id").populate("profile_id")
        let salon_id = allAppointments
        res.json(allAppointments)
        console.log(salon_id)
    }
    catch (err){
        res.status(500).send("Server Error")
        console.log(err)
    }
}

const addToFavorite = async (req,res) =>{
    try {
        console.log(req.body)
        const {userId, profileId} = req.body
        // let ifExist = await User.find({_id:userId}, {favorites: {$in:[profileId]}})
        let userFind = await User.findOne({_id:userId})
        // let ifExist = User.find({favorites: {$in:[32]}})
        if(userFind){
            console.log(userFind.favorites)
            let isExist = userFind.favorites.includes(profileId)
            
            if(isExist){
                let user = await User.updateOne({_id:userId}, {$pull: {favorites: profileId}},{new: true }).exec();
                console.log(user)
                return res.json(user)
            }
            else {
                
                let user = await User.updateOne({_id:userId}, {$push: {favorites: profileId}},{new: true }).exec();
                console.log(user)
                return res.json(user)
            }
        }
        else {
            return res.status(400).json({msg:"no such user exist"})
        }
     
        // let user = await User.find({"id":userId})

    }
    catch(err){
        res.status(500).send("Server Error")
        console.log(err)
    }
}

const getFavorites = async (req, res) =>{
    try{
        let userId = req.user.id
        console.log(userId)
        let findFav = await User.findOne({_id:userId}).populate("favorites")
        console.log(findFav)
        res.status(200).json(findFav);
    }
    catch(err){
        console.log(err)
        res.status(500).send("server error")
    }
}

const getNearBySalons = async (req,res) => {
    try {
        let findSalons = await Profile.find({"location": {$near: {$geometry: {type:"Point", coordinates: [33.6254994,73.0616463] }, $minDistance: 0, 
        $maxDistance: 6000 }}})
        console.log(findSalons)
        res.status(200).json(findSalons)
    }
    catch(err){
        console.log(err)
        res.status(500).send("Server Error")
    }
}


const getSalons = async (req, res)=>{
    try {
        let salons = await Profile.find({"address.city": "RAWALPINDI"})
        res.status(200).json(salons)
    }
    catch(err){
        res.status(500).send("Server Error")
    }
}


const addReview = async (req,res) =>{
    let user_id = req.user.id
    const {profile_id, review, rating, appointment_id} = req.body
    console.log("body",req.body)
    try {
        let createReview = new Review ({
            profile_id, user_id, review, rating 
        })
        let newReview = await createReview.save()

        if(newReview){
            console.log("into the if")
            let updateAppointment =await Appointment.updateOne({_id:appointment_id}, {
                $set: {
                    isReviewed: true
                }
            })
           
            console.log(updateAppointment)
            res.status(200).json(newReview)
        }
        else {
            res.status(404).send("Unable to perfome this action")
        }
     
       
    } 
    catch(err){
        res.status(500).send("Server Error")
    }
}

const getReview = async (req,res) => {
    const profile_id = req.params.profile_id
    console.log("profile_id", profile_id)
    try {
       
        let reviews = await Review.find({"profile_id":profile_id}).populate("user_id")
        console.log(reviews)
        res.status(200).json(reviews)
    }
    catch(err){
        console.log(err)
        res.status(500).send("Server Error")
    }
}

module.exports ={
    validateData,
    getAuth,
    loginUser,
    signupUser,
    booking,
    userAppointments,
    getNearBySalons,
    getSalons,
    addToFavorite,
    getFavorites,
    userPreviousAppointments,
    addReview,
    getReview,
}


