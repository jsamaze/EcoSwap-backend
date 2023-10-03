import { ChatModel } from "../../model/index.js";

export default async function (username1, username2){
      var chat = await ChatModel.aggregate(
        [
          { $match: { closedOn: { $exists: false } } },
          {
            $lookup: {
              from: 'users',
              localField: 'seller',
              foreignField: '_id',
              as: 'sellers'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'buyer',
              foreignField: '_id',
              as: 'buyers'
            }
          },
          { $unwind: { path: '$sellers' } },
          { $unwind: { path: '$buyers' } },
          {
            $project: {
              seller: '$sellers',
              buyer: '$buyers',
              createdAt: 1,
              updatedAt: 1,
              messages: 1,
              sellerClose:1,
              buyerClose:1,
            }
          },
          {
            $match: {
              $or: [
                {
                  'seller.username': username1,
                  'buyer.username': username2
                },
                {
                  'seller.username': username2,
                  'buyer.username': username1
                }
              ]
            }
          },
          {
            $project: {
              seller: { username: 1, fullName: 1, _id:1 },
              buyer: { username: 1, fullName: 1 ,_id :1},
              createdAt: 1,
              updatedAt: 1,
              messages: 1,
              sellerClose:1,
              buyerClose:1,
            }
          }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      );
      return chat[0]
}