import { Schema } from "mongoose";

export let ChatReviewSchema = new Schema ({
    chat : {
        type : 'ObjectId',
        ref : "chat",
        required : 'true'
    },
    by : {  
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    for :{  
        type : 'ObjectId',
        ref : 'user',
        required : true,
    }, 
    textContent : {
        type: String,
    },
    rating : {
        type: Number,
        min:0,
        max:5,
    },
},
{
    timestamps:true, // use updated at for the correct timeline
})

ChatReviewSchema.index({chat:1,by:1,for:1}, {unique:true})