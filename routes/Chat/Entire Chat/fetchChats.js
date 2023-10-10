import { ObjectId } from "mongodb";
import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";

export default  async (req,res,next) => {
    try {

        var closed = req.query.closed ?? "false"
        console.log("closed"+closed)
        closed = (closed.toLowerCase() == "true")
        var chatsAsSeller = await ChatModel.aggregate(
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
                $addFields: {
                  latestMessage: { $last: '$messages' }
                }
              },
              {
                $project: {
                  seller: '$sellers',
                  buyer: '$buyers',
                  createdAt: 1,
                  updatedAt: 1,
                  latestMessage: 1
                }
              },
              {
                $project: {
                  createdAt: 1,
                  updatedAt: 1,
                  latestMessage: {
                    textContent: 1,
                    createdAt: 1,
                    sender: 1
                  },
                  seller: { username: 1, fullName: 1 },
                  buyer: { username: 1, fullName: 1 }
                }
              },
              { $match: { closedOn: { $exists: closed } } },
              { $match: { 'seller.username':  req.session.username } }
            ],
            { maxTimeMS: 60000, allowDiskUse: true }
          );

        var chatsAsBuyer = await ChatModel.aggregate(
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
                $addFields: {
                  latestMessage: { $last: '$messages' }
                }
              },
              {
                $project: {
                  seller: '$sellers',
                  buyer: '$buyers',
                  createdAt: 1,
                  updatedAt: 1,
                  latestMessage: 1
                }
              },
              {
                $project: {
                  createdAt: 1,
                  updatedAt: 1,
                  latestMessage: {
                    textContent: 1,
                    createdAt: 1,
                    sender: 1
                  },
                  seller: { username: 1, fullName: 1 },
                  buyer: { username: 1, fullName: 1 }
                }
              },
              { $match: { closedOn: { $exists: closed } } },
              { $match: { 'buyer.username': req.session.username } }
            ],
            { maxTimeMS: 60000, allowDiskUse: true }
          );

        res.send({
            status : "success",
            data : chatsAsBuyer.concat(chatsAsSeller)
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to create chat",
            problem : e.message
        });
    }
}

