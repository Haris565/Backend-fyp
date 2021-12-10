const express = require('express');
const connectDB = require('./config/db')
const expressValidator = require('express-validator')
const cors = require('cors')
const userRoutes = require("./routes/api/user.routes")
const salonRoute= require ("./routes/api/salon.routes")
const messageRoute = require("./routes/api/message.routes")




const PORT = process.env.PORT || 5000;
const app=express()
const http = require("http").createServer(app);


// const io = require("socket.io")(http , {
//     cors: {
//       origin: "http://localhost:3000",
     
//      }
//     }
//      );



// connectDB()
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




let users = []

const addUser = (userId, socketId) => {
  !users.some((user)=>user.userId === userId) && users.push({userId, socketId})
}

const removeUser = (socketId) => {
   users = users.filter ((user)=> user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user)=>user.userId===userId)
}
connectDB().then((result)=>{
  http.listen(PORT, ()=> {console.log('Server Connected')});
  const io = require('./socket').init(http)
  io.on("connection", (socket)=>{
    console.log("client connected")
    socket.on("addUser", (userId)=>{
        addUser(userId, socket.id)
        console.log(users)
        io.emit("getUsers", users)
    })

    socket.on("sendMessage", ({senderId, receiverId, text})=>{
      console.log("ids", senderId, receiverId, text)
      console.log("into the send")
      let user = getUser(receiverId)
      console.log("user",user)
    
      io.to(user?.socketId).emit('getMessage', {
        senderId,
        text
      })
      console.log("into the get")
    })

    socket.on("disconnect", ()=>{
      console.log("user disconnected")
      removeUser(socket.id)
      io.emit("getUsers", users)
      console.log(users)
    })
   
  })

})
// io.on("connection", function(socket) {
//   console.log("connected");
//  });

// // console.log(server)
// const io = require('socket.io')(8900, {
//   cors: {
//     origin: "http://localhost:3000",
   
//   }
// })

// io.on("connection", (socket)=>{
//   console.log("client connected")
// })
// console.log("io",io)



// connectDB().then(()=>{
//   const server = app.listen(PORT, ()=> {console.log('Server Connected')});
//   // console.log(server)

//   console.log("io",io)
// }).catch(err=> {
//   console.log(err)
// })