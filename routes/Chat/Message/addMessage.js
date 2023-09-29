import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";


export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username)
        chat = await ChatModel.findById(chat._id)
        if (chat){
            
            chat.messages.push({
                sender : chat.seller._id == req.session.user_id ? "seller" : "buyer",
                textContent: req.body.textContent
            })
            await chat.save();
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