const express = require('express');
const connectDB = require('./config/db')
const expressValidator = require('express-validator')
const cors = require('cors')
const userRoutes = require("./routes/api/user.routes")
const salonRoute= require ("./routes/api/salon.routes")
const messageRoute = require("./routes/api/message.routes")




const PORT = process.env.PORT || 5000;
const app=express()



connectDB()
app.use(express.json({limit: '50mb'}));
app.use(cors())



app.use("/api/user", userRoutes)
app.use("/api/salon", salonRoute)
app.use("api/chat", messageRoute)


app.get("/success", (req, res) => {
    res.send("Payment successful");
  });
  
  app.get("/failed", (req, res) => {
    res.send("Payment failed");
  });




app.listen(PORT, ()=> {console.log('Server Connected')});