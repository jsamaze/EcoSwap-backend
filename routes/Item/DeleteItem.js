import checkItemOwnership from "../../helper/checkItemOwnership.js";
import { ItemChatModel, ItemModel, PointChoiceModel, PointTransactionModel, ViewModel } from "../../model/index.js";


export default  async (req,res,next) => {
    try {
        await checkItemOwnership(req.session.username,req.params.id)

        await ItemModel
            .deleteOne({ _id: req.params.id })
        await ItemChatModel.deleteMany({item : req.params.id})

        await ViewModel.deleteMany({item : req.params.id})

        const choice = await PointChoiceModel.findOne({
            rewardName : "removeListedItem"
        })



        const transaction = new PointTransactionModel({
            user : req.session.user_id,
            choice: choice._id
        })

        await transaction.save()


        res.status(200).send ({
            status:"success",
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving item",
            problem : e.message
        })
        return;
    }

    res.status(200).send({
        status:"success",
    })
}