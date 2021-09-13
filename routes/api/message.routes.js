const router = require('express').Router()
const Message = require('../../model/Message.model')


router.post("/sendMessage", async (req,res)=> {
    const newMessage = new Message ({

    })

    try {
        const saved = await newMessage.save()
        res.status(200).json(saved)
    }
    catch(err){
        res.status(500).json("server error")
    }
})


router.get("/getMessage", async (req,res)=>{
    
} )
