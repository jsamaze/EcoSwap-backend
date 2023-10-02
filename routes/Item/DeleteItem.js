import checkItemOwnership from "../../helper/checkItemOwnership.js";
import { ItemChatModel, ItemModel, ViewModel } from "../../model/index.js";


export default  async (req,res,next) => {
    try {
        await checkItemOwnership(req.session.username,req.params.id)

        await ItemModel
            .deleteOne({ _id: req.params.id })
        await ItemChatModel.deleteMany({item : req.params.id})

        await ViewModel.deleteMany({item : req.params.id})


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