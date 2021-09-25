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
    services:{
        type:[]
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
        type:String,
    },
    time:{
      type:[String]
    },
    date:{
        type: Date,
        default: Date.now
    }
})

profileSchema.index({ location: "2dsphere" });

module.exports= Profile =moongose.model('profile', profileSchema)