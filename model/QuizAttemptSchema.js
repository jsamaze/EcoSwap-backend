import { Schema } from "mongoose";

export let QuizAttempSchema = new Schema ({
    date : {
        type: Date,
        required : true,
    },
    questions : {
        type : ["ObjectId"],
        ref : "quizQuestion",
        required : true,
        maxLength : 5,
        minLength : 5,
    },
    score : {
        type : Number,
    },
})