import { Schema } from "mongoose";

export let PointChoiceSchema = new Schema ({
    rewardName : {
        type : "String",
        required : true,
        unique : true
    },
    points : {
        type : Number,
        required : true
    },



})

