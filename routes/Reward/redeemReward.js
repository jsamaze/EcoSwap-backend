import fetchNetPoints from "../../helper/point/fetchNetPoints.js"
import { PointRewardModel, PointTransactionModel } from "../../model/index.js"

export default  async (req,res,next) => {
    try {

        var reward = await PointRewardModel.findOne({
            rewardName : req.params.rewardName
        })

        if (!reward){
            throw new Error("reward does not exist")
        }

        var counting = await PointTransactionModel.aggregate([
            {
              '$match': {
                'choice': reward._id
              }
            }, {
              '$count': 'noTimesRedeemed'
            }
          ])

        var noTimesRedeemed = counting[0]?.noTimesRedeemed ?? 0

          
        if (noTimesRedeemed >= reward.max){
            throw new Error("no more reward- reached maximum")
        }

        const netPtInfo = await fetchNetPoints(req.session.username)

        if (netPtInfo.totalNetPts >= Math.abs(reward.points)){
            const transaction = new PointTransactionModel({
                user : req.session.user_id,
                choice : reward._id
            })

            await transaction.save()

            res.send({
                status : "Success"
            })
        } else {
            throw new Error("insufficient points")
        }



    } catch (e) {
        res.status(500).send({
            status : "failed redeeming reward",
            problem : e.message
        })
    }
}