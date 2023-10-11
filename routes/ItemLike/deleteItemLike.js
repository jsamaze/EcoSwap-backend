import { ItemLikeModel } from "../../model/index.js";

export default async (req,res) => {
    try {
          

        await ItemLikeModel.deleteOne({
            item : req.params.itemId,
            user : req.session.user_id
        });


        res.send({
            status : "success"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "fail - maybe already liked it",
            problem : e.message
        })
    }
}