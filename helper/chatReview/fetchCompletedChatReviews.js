import {ChatReviewModel} from "../../model/index.js"
import { UserModel } from "../../model/index.js"

export default async (username) => {
    var user = await UserModel.findOne({username},"_id username")
    console.log(user)
    var reviewsWritten = await ChatReviewModel.find({
        by : user._id,
        textContent : {$exists : true},
        rating : {$exists : true}
    },"-by -__v").populate("chat", "createdAt closedOn")
    .populate("for", "_id username fullName")

    var reviewsReceived = await ChatReviewModel.find({
        for : user._id,
        textContent : {$exists : true},
        rating : {$exists : true}
    },"-for -__v").populate("chat", "createdAt closedOn")
    .populate("by", "_id username fullName")

    var ratings = []

    reviewsReceived.forEach(
        e => {
            ratings.push(e.rating)
        }
    )

    return {
        reviewsReceived,
        reviewsWritten,
        avgRating : ratings.reduce((a,b)=> a+b,0) / ratings.length
    }
}