import checkItemOwnership from "../../../helper/checkItemOwnership.js";
import retrieveChat from "../../../helper/chat/retrieveChat.js";
import { ChatModel, ItemChatModel, UserModel } from "../../../model/index.js";
import { io } from "../../../index.js";

export default  async (req,res,next) => {
    try {
        if (!req.params.username || !req.body.itemId){
            res.status(400).send({
                status : "Issue with body"
            })
        }
        if (req.session.username==req.params.username ){
            res.status(400).send({
                status: "cant start a chat with yourself!"
            })
            return;
        }
        var chat = await retrieveChat(req.session.username,req.params.username );
        if (!chat){
            var item = await checkItemOwnership(req.params.username,req.body.itemId)
            if (item.itemType != "Listed"){
                throw new Error("Item is not listed (it is wishlist)")
            }
            var seller = await UserModel.findOne({username : req.params.username })

            chat = new ChatModel({
                buyer : req.session.user_id,
                seller : seller._id ,
                messages : [],
                sellerClose : false,
                buyerClose: false,

            })

            
            await chat.save()

            var itemChat = new ItemChatModel({
                user : seller._id,
                item : req.body.itemId,
                chat : chat._id
            })

            await itemChat.save()
            io.of("/").to(req.params.username).emit("newChat",req.session.username)
            res.status(200).send({
                status:"Success",
                chatId : chat._id
            })
        } else { 
            throw new Error ("Chat already exists")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to create chat",
            problem : e.message
        });
    }
}