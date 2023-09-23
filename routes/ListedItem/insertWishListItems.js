import { WishListItemModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        const item = new WishListItemModel({
            itemName:req.body.itemName,
            user: req.session.user_id,
            description: req.body.itemName,
            category:req.body.category,
            condition : req.body.condition
        });

        await item.save();

        res.status(200).send ({
            status:"Item added to wishlist"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to add item",
            problem : e.message
        })
    }
}