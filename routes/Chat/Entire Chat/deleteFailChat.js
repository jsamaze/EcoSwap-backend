import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";

export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username);
        //one sided

        if (chat){
            chat.sellerItems = sellerItems;
            chat.buyerItems = buyerItems;
            res.send({
                status : "Success",
                data : chat,
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