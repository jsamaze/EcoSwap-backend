import { Schema } from "mongoose";
import { messageSchema } from "./MessageSchema.js"
import { ItemSchema } from "./ItemSchema.js";

export let ChatSchema = new Schema ({
    seller : {  
        type : 'ObjectId',
        ref : 'user',
        required : true,
    },
    buyer :{  
        type : 'ObjectId',
        ref : 'user',
        required : true,
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
    },
    sellerClose : {
        type: Boolean,
        required: true
    },
    buyerClose : {
        type : Boolean,
        required : true
    },
    sellerGave : [{
        type : 'ObjectId',
        ref : 'item',
    }],
    buyerGave :[ {
        type : 'ObjectId',
        ref : 'item',
    }]
},
{
    timestamps:true,
})

ChatSchema.index({buyer:1,seller:1,closedOn:1}, {unique:true})