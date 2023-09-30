import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";


export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username);
        if (chat){
            var itemChat  = ItemChatModel.findOne({
                item: req.params.itemId,
                chat: chat._id,
                user: req.session.user_id
            })
            if (!itemChat){
                throw new Error("Item is not in said chat")
            }
            await ItemChatModel.deleteOne({
                item: req.params.itemId,
                chat: chat._id,
                user: req.session.user_id
            })
            res.send({
                status : "Success",

            })
        } else { 
            throw new Error ("Item does not exist in chat")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to delete item",
            problem : e.message
        });
    }
}