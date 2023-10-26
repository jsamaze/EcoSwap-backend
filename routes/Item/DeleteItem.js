import checkItemOwnership from "../../helper/checkItemOwnership.js";
import { ItemChatModel, ItemModel, PointChoiceModel, PointTransactionModel, ViewModel } from "../../model/index.js";
import {s3} from '../global/S3.js'

export default  async (req,res,next) => {
    try {
        await checkItemOwnership(req.session.username,req.params.id)

        var item = await ItemModel.findById(req.params.id).lean()

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


      await Promise.all( item.photoName.map(
        async name => {
           try {
                
                let params = {
                    Bucket: 'ecoswap',
                    Key: name,
                };
               await s3.deleteObject(params).promise()
           } catch (e){
               console.log(e)
               console.log("Problem with deleting photo")
           }
       }
   ))




}