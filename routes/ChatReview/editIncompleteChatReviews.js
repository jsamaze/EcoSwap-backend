import {ChatReviewModel} from "../../model/index.js"
import { UserModel } from "../../model/index.js"

export default async (req,res) => {

    try {  
        
        if (!(req.body.textContent && req.body.reviewId && req.body.rating)){
            res.status(400).send({
                status: "Failure- body incomplete",
                problem : "need textContent, rating, and reviewId"
            })
            return;
        }

        var review = await ChatReviewModel.findOne({
            by : req.session.user_id,
            textContent : {$exists : false},
            rating : {$exists : false},
            _id : req.body.reviewId
        })

        if(review){
            review.textContent = req.body.textContent
            review.rating = req.body.rating

            await review.save()

            return res.send({
                status : "success",

            })
        }else {
            throw Error("review does not exist")
        }




    } catch (e){
        res.status(500).send({
            status : "failed to modify review",
            problem : e.message
        })
    }

}