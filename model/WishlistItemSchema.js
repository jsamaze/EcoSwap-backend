import { Schema } from "mongoose";
 

export let WishlistItemSchema = new Schema ({
    itemName : {
        type : String,
        trim: true,
        required: true,
    },
    user : {
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    description :  {
        type: String,
        trim: true, 
    },
    category : {
        type:String,
        required:true,
        enum:{
            values : ['Electronics','Fashion','Furniture','Kitchenware'],
            message : "Invalid category"
        }
    },
    condition : {
        type:String,
        required:true,
        enum:{
            values : ['new','old'],
            message : "Invalid condition"
        }
    },

    tags : {
        type:[String],
        trim:true,
    },

    photoName : {
        type:[String],
        trim:true,
        validate: {
            validator: (pictures) => pictures.length <=5,
            message: 'you cannot have more than 5 pictures'
          }
    },
    

},
{
    timestamps:true
})

//add a method to retrieve image path