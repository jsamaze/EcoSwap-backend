import { Schema } from "mongoose";

export let ChatSchema = new Schema ({
    seller : {
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    buyer : {
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    messages : [{
        sender : {
            type : 'ObjectId',
            ref : 'user',
            required : true,
        },
        message : {
            type : String, 
            required : true
        },
    }],
    closed : {
        type:String
    }
},
{
    timestamps:true,
})