import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";


export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username)
        var chatDoc = await ChatModel.findById(chat._id)
        if (chat){
            
            chatDoc.messages.push({
                sender : chat.seller.username == req.session.username ? "seller" : "buyer",
                textContent: req.body.textContent
            })
            await chatDoc.save();
            res.send({
                status : "Success"
            })
        } else { 
            throw new Error ("Chat does not exist")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to add message",
            problem : e.message
        });
    } 
}