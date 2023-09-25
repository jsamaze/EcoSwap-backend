import { ListedItemModel } from "../../model/index.js";;

export default async (req,res) => {
    try {

        const item = new ListedItemModel({
            "itemName" : req.body.itemName,
            "description" : req.body.description,
            "category" : req.body.category,
            "condition" : req.body.condition,
            "tags": req.body.tags,
            "user" : req.session.user_id,
            "view" : 0,
        });

        await item.save();


        res.status(200).send ({
            status:"success",
            id : item._id
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "fail",
            problem : e.message
        })
    }
}