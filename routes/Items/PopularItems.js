import { ItemModel } from "../../model/index.js";
import { ItemSchema } from "../../model/ItemSchema.js";

const notLoggedInLimit =10

export default async function  (req, res, next) {
    var aggregation = [
        {
            $match : {
                $and : [
                    {itemType : "Listed"},
                    {done : {$exists : false}}
                ]
            }
            
        },
        {
            $addFields: {
                lowerCaseTags: {
                $map: {
                    input: '$tags',
                    in: { $toLower: '$$this' }
                }
                }
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
                views:1
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
            },
        { $sort : {"views" : -1}}
    ]
    if (!req.session.user_id) {
        //not logged in
        aggregation.push({
            $limit : 10
        })
    } else {
        aggregation.push({
            $match : {
                'user.username' : {$ne : req.session.username}
            }
        })
        aggregation.push({
            $limit : 15
        })
    }
    var result = await ItemModel.aggregate(aggregation);

           
    for (const index in result) {
        let item = result[index]
        item.photoURLs = await ItemModel.getImageURLsStatic(item.photoName);
        delete item.photoName 
      }



    res.send({
        status : "Success",
        data : result,
        // pipeline : aggregation
    })

}