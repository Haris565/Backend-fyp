const express = require('express');
const connectDB = require('./config/db')
const expressValidator = require('express-validator')
const cors = require('cors')
const userRoutes = require("./routes/api/user.routes")
const salonRoute= require ("./routes/api/salon.routes")



const PORT = process.env.PORT || 5000;
const app=express()


connectDB()
app.use(express.json())
app.use(cors())



app.use("/api/user", userRoutes)
app.use("/api/salon", salonRoute)







app.listen(PORT, ()=> {console.log('server connected ')});