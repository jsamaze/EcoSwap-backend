import { Schema } from "mongoose";

export let ItemChatSchema = new Schema ({
    user : {  
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    item :{  
        type : 'ObjectId',
        ref : 'item',
        required : true,
    }, //person starting
    chat : {
        type : 'ObjectId',
        ref:"chat",
        required:true,
    },
},
{
    timestamps:true,
})

ItemChatSchema.index({item:1,chat:1}, {unique:true})