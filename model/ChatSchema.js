import { Schema } from "mongoose";
import { messageSchema } from "./MessageSchema.js"

export let ChatSchema = new Schema ({
    seller : {
        user : {  
            type : 'ObjectId',
            ref : 'user',
            required : true,
        },
        items : {
            type: ['ObjectId'], // not going to record when it was added
            ref: 'item'
        }
    },
    buyer : {
        user : {  
            type : 'ObjectId',
            ref : 'user',
            required : true,
        },
        items : {
            type: ['ObjectId'], // not going to record when it was added
            ref: 'item'
        }
    }, //person starting
    messages : {
        type: [messageSchema],
        required:true,
    },
    closedOn : {
        type:Date,
        // validate: {
        //     validator : function (v){
        //         return v.getTime() > this.createdAt()
        //     },
        //     message: "You can only close a chat after it is created"
        // }
    }
},
{
    timestamps:true,
})