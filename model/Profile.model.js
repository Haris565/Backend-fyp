const moongose = require ("mongoose");

const profileSchema = new moongose.Schema({
    user:{
        type:moongose.Schema.Types.ObjectId,
        ref:"salon"
    },
    name:{
        type:String,
        
    },

    number:{
        type:String,
        
    },
    address: {
        address: {
            type: String,
            
        },
        city: {
            type: String,
            
        }
    },
    location: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
           //   required: true
        },
        coordinates: {
          type: [Number],
        //   required: true
        }
    },

    description:{ 
        type: String,
    },
    image:{
        type:Buffer,
    },
    time:{
      type:[String]
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports= Profile =moongose.model('profile', profileSchema)