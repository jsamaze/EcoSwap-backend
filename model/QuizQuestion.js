import { Schema } from "mongoose";

export let QuizQuestionSchema = new Schema ({
    question : {
        type : "String",
        required : true
    },
    choice : {
        type : ["String"],
        required : true
    },
    correctAnswer : {
        type : Number, 
        required: true
    },
})