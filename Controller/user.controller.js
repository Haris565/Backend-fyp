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




const validateData = (method) => {
  switch (method) {
    case 'signupUser': {
     return [ 
        body('name', 'name is required ').isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter password with 6 or more character').isLength({min:6}),
        body('number', 'Please enter a valid number').isLength({min:11})
       ]   
    }

    case 'loginUser': {
        return [ 
           body('email', 'Invalid email').exists().isEmail(),
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
        // if (!errors.isEmpty()) {
        //     res.status(422).json({ errors: errors.array() });
        //     return
        // }

        const {email, password}=req.body;
        let user = await User.findOne({email});
        console.log(user);
        if(!user){
            return res.status(400).json ({error : [{msg:"Invalid credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json ({error : [{msg:"Invalid credentials"}]})
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
        const errors = validationResult(req)
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
        const {salon_id, start_time, services} =req.body;
        const customer_id = req.user.id
        const appointment = new Appointment({
            customer_id, salon_id, start_time, services
        })
        let booking = await appointment.save()
        res.json(booking)
        console.log(booking._id)
        if(booking){
            let user = await User.findById(req.user.id)
            if(user){
                let appointmentsByUser = user.appointment
                appointmentsByUser=[...appointmentsByUser, booking._id]
                console.log(appointmentsByUser)
                const updated= await User.updateOne({_id:req.user.id},{appointment:appointmentsByUser})
                console.log(updated)
            }
        
            let salon = await Salon.findById(req.body.salon_id)
            console.log(salon)
            if(salon){
                let appointmentsforSalon = salon.appointment
                appointmentsforSalon=[...appointmentsforSalon, booking._id]
                console.log(appointmentsforSalon)
                const updated= await Salon.updateOne({_id:req.body.salon_id},{appointment:appointmentsforSalon})
                console.log(updated)
            }
            
        }

    }
    catch(err){
        console.log(err)
        res.status(500).json("Server Error")
    }
}


//route POST api/user/appointmentsforSalon
//@desc see all appointments booked for Register salon

const userAppointments = async (req,res)=>{
    try {
        let allAppointments = await Appointment.find({customer_id:req.user.id})
        res.json(allAppointments)
        console.log(allAppointments)
    }
    catch (err){
        res.status(500).send("Server Error")
    }
}

const getNearBySalons = async (req,res) => {
    try {
        let findSalons = await Profile.find({"location": {$near: {$geometry: {type:"Point", coordinates: [33.6254994,73.0616463] }, $minDistance: 0, 
        $maxDistance: 1000 }}})
        console.log(findSalons)
        res.status(200).json("Hello")
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

module.exports ={
    validateData,
    getAuth,
    loginUser,
    signupUser,
    booking,
    userAppointments,
    getNearBySalons,
    getSalons 
}


