import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { io } from "../../../index.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";

export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username);
        //one sided

        if (chat){
            await ChatModel.deleteOne({_id : chat._id});
            await ItemChatModel.deleteMany({chat : chat._id})
            io.of("/").to(req.params.username).emit("endChatFail",req.session.username)
            res.status(200).send({
                status : "successfully delete",
            });
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