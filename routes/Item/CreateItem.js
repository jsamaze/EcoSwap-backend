import { ItemModel } from "../../model/index.js";

export default async (req,res) => {
    try {
        
        if(!req.query.type && ["Listed", "WishList"].includes(req.query.type)){ // ?type=
            res.status(400).send({
                status:"Missing query parameter"
            })
            return;
        }        

        const item = new ItemModel({
            "itemName" : req.body.itemName,
            "description" : req.body.description,
            "category" : req.body.category,
            "condition" : req.body.condition,
            "tags": req.body.tags,
            "user" : req.session.user_id,
            "view" : 0,
            "itemType" : req.query.type
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