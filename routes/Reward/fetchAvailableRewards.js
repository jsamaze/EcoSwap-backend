import { PointChoiceModel, PointRewardModel } from "../../model/index.js"

export default  async (req,res,next) => {
    try {

        var choices = await PointChoiceModel.find({__t:{$exists:false}},"-__v -_id")
        var rewards = await PointRewardModel.find({},"-__v -_id -__t")

        res.send({
            choices,
            rewards
        })

    } catch (e) {
        res.status(500).send({
            status : "failed retrieving rewards",
            problem : e.message
        })
    }
}