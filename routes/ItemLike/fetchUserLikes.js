import { ItemLikeModel, UserModel,ItemModel } from "../../model/index.js"

export default async (req,res)=>{
    try {
        var user = await UserModel.findById(req.session.user_id)
        console.log(user)
        var itemsLiked = await ItemLikeModel.aggregate([
            {
                $match : {user : user._id }
            },
            {
                $lookup:{
                    from: "items",
                    localField: "item",
                    foreignField: "_id",
                    as: "items",
                  }
            },
            {
                $unwind : {
                    path : "$items"
                }
            },
            {
                $project : {
                    _id : "$items._id",
                    itemType : "$items.itemType",
                    itemName : "$items.itemName",
                    category : "$items.category",
                    condition : "$items.condition",
                    tags : "$items.tags",
                    createdAt : "$items.createdAt",
                    updatedAt : "$items.updatedAt",
                    photoName : "$items.photoName",
                    views : "$items.views"
                }
            }
        ])
        console.log(itemsLiked)

        for (const index in itemsLiked) {
            let item = itemsLiked[index]
            item.photoURLs = await ItemModel.getImageURLsStatic(item.photoName);
            delete item.photoName 
          }

        res.send({
            status : "success",
            data : itemsLiked
        })
    } catch (e) {
        res.status(500).send({
            status : "failed",
            problem : e.message
        })
    }
}