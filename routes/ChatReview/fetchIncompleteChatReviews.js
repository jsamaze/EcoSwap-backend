import {ChatReviewModel} from "../../model/index.js"
import { UserModel } from "../../model/index.js"

export default async (req,res) => {

    try {    
        var reviewsNotWritten = await ChatReviewModel.find({
            by : req.session.user_id,
            textContent : {$exists : false},
            rating : {$exists : false}
        },"-by -__v").populate("chat", "createdAt closedOn")
        .populate("for", "_id username fullName")


        return res.send({
            status : "success",
            data : reviewsNotWritten
        })

    } catch (e){
        res.status(500).send({
            status : "failed to retrieve incomplete reviews",
            problem : e.message
        })
    }

}