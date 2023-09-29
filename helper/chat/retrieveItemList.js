import {ItemChatModel } from "../../model/index.js";

export default async function (chatId, userId){
    var list = await ItemChatModel.aggregate(
        [
            {
              $match: {
                user: userId,
                chat: chatId
              }
            },
            {
              $lookup: {
                from: 'items',
                localField: 'item',
                foreignField: '_id',
                as: 'items'
              }
            },
            { $unwind: { path: '$items' } },
            {
              $project: {
                'items.itemName': 1,
                'items.category': 1,
                'items.condition': 1
              }
            },
            {
              $group: {
                _id: null,
                item: { $push: '$items' }
              }
            }
          ]
        );
      console.log(list)
      if (list[0]){
        list = list[0].item
      } else {
        list =[]
      }
      return  list
}