import { PointChoiceModel, PointRewardModel } from "../../model/index.js";

export default async (req,res) => {
    try {    
        if (req.body.reward){
            const reward= new PointRewardModel({
                rewardName: req.body.rewardName,
                points: req.body.points,
                max : req.body.max,
                prizeTitle : req.body.prizeTitle,
                prizeDescription : req.body.prizeDescription
            });
    
            await reward.save();
    
    
            res.status(200).send ({
                status:"success - reward",
                id : reward._id
            })
        } else {
            const choice= new PointChoiceModel({
                rewardName: req.body.rewardName,
                points: req.body.points,

            });
    
            await choice.save();
    
    
            res.status(200).send ({
                status:"success",
                id : choice._id
            })

        }



    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "fail",
            problem : e.message
        })
    }
}