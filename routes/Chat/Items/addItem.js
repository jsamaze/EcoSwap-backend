import retrieveChat from "../../../helper/chat/retrieveChat.js";
import checkItemOwnership from "../../../helper/checkItemOwnership.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";


export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username)
        chat = await ChatModel.findById(chat._id)

        if (chat){
            var item = await checkItemOwnership(req.session.username,req.body.itemId)
            if (item.itemType != "Listed"){
                throw new Error("Item is not listed (it is wishlist)")
            }
            var itemChat = new ItemChatModel({
                item: req.body.itemId,
                chat: chat._id,
                user: req.session.user_id
            })
            await itemChat.save()
            res.send({
                status : "Success",

            })
        } else { 
            throw new Error ("Chat does not exist")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to create chat",
            problem : e.message
        });
    }
}