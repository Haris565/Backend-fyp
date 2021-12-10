let io 

module.exports = {
    init : (httpServer)=>{
       io= require("socket.io")(httpServer, {
        cors: {
          origin: "http://localhost:3000",
        }
      })
       return io
    },
    getIo : ()=> {
        if(!io){
            throw new Error ("not initializw")
        }
        return io
    }

}