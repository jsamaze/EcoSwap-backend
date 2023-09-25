import { Schema } from "mongoose";

export let ViewSchema = new Schema ({
    item : {
        type : 'ObjectId',
        ref : 'item',
        required : true,
    },
    user : {
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    lastSeen : {
        type: Number,
        required:true
    }
})