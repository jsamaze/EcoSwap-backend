import { Schema } from "mongoose";
//based on LTA Data Mall
export let BusStopSchema = new Schema({
    "BusStopCode": {
        type:String,
        minLength : 5,
        maxLength : 5,
        required:true,
        unique:true,
    },
    "RoadName":{
        type:String,
        required : true
    },
    "Description": {
        type:String,
        required : true,
    },
    loc : 
         { type: {type:String}, coordinates: [Number]},
    

})