import retrieveChat from "../../../helper/chat/retrieveChat.js";
import retrieveItemList from "../../../helper/chat/retrieveItemList.js";
import { ChatModel } from "../../../model/index.js";

export default  async (req,res,next) => {
    try {
        // var chat = await retrieveChat(req.session.username,req.params.username);
        var chat = await ChatModel.findById(req.params.chatId).populate("seller", { username: 1, fullName: 1, _id:1, email:1 }).populate("buyer", { username: 1, fullName: 1, _id:1, email:1 })
        .populate("buyerGave",{
            'itemName': 1,
            'category': 1,
            'condition': 1,
            '_id':1,
          }).populate("sellerGave",
          {
            'itemName': 1,
            'category': 1,
            'condition': 1,
            '_id':1,
          })
        if (chat){
            var chatObj = chat.toObject()
            if (!chat.closedOn){
                console.log('chat :>> ', chat);
                var sellerItems = await retrieveItemList(chat._id,chat.seller._id);
                var buyerItems =  await retrieveItemList(chat._id,chat.buyer._id);  
                chatObj.sellerItems = sellerItems;
                chatObj.buyerItems = buyerItems;      
            } else {
                  console.log(chat.buyerGave)
                  chatObj.sellerItems = chat.sellerGave;
                  chatObj.buyerItems = chat.buyerGave;
            }

            res.send({
                status : "Success",
                data : chatObj,
            })
        } else { 
            throw new Error ("Chat does not exist")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to fetch chat",
            problem : e.message
        });
    }
}