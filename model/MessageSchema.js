import { Schema } from "mongoose";

export let messageSchema = new Schema({
    sender : {
        type: String,
        required:true,
        enum:{
            values : ['seller','buyer'],
            message : "Invalid value"
        }
    },
    textContent : {
        type: String, //yeah only sending text message...let's keep it simple
        required:true,
    },
    pictureContent : {
        type : String,
    }
},{
    timestamps:true,
})
