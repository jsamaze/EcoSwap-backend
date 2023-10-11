import { Schema } from "mongoose";

export let ItemLikeSchema = new Schema ({
    user : {  
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    item :{  
        type : 'ObjectId',
        ref : 'item',
        required : true,
    }, 
},
{
    timestamps:true,
})

ItemLikeSchema.index({item:1,user:1}, {unique:true})