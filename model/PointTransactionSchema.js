import { Schema } from "mongoose";

export let PointTransactionSchema = new Schema ({
    user : {
        type : 'ObjectId',
        ref : 'user',
        required : true
    },
    choice : {
        type : "ObjectId",
        ref : 'pointChoice',
        required : true
    },
    redemptionCode :{
        type : "String",
    }
},{
    timestamps:true
})