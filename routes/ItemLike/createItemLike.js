import { ItemLikeModel } from "../../model/index.js";

export default async (req,res) => {
    try {
          
        const like = new ItemLikeModel({
            item : req.params.itemId,
            user : req.session.user_id
        });

        await like.save()


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