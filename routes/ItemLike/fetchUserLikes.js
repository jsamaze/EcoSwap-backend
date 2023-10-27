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
                    views : "$items.views",
                    user : "$items.user"
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'users'
                }
                },
                { $unwind: { path: '$users' } },
                {
                $project: {
                    user: '$users',
                    itemType: 1,
                    itemName: 1,
                    description: 1,
                    category: 1,
                    condition: 1,
                    lowerCaseTags: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    tags:1,
                    photoName:1,
                    views:1,
                    done:1,
                }
                },
                {
                $project: {
                    user: {
                    email: 0,
                    password: 0,
                    photoName: 0,
                    preferredBusStop: 0,
                    emailVerified: 0,
                    __v: 0,
                    otp : 0,
                    otpValidUntil : 0,
                    about:0,
                    }
                }
                }
        ])
        // console.log(itemsLiked)

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