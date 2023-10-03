import retrieveChat from "../../../helper/chat/retrieveChat.js";
import retrieveItemList from "../../../helper/chat/retrieveItemList.js";
import { io } from "../../../index.js";
import { ChatModel, ItemChatModel, ItemModel, UserModel } from "../../../model/index.js";

export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username);
        //two sided
        console.log(chat)
        if (chat){


            // case 1 : reset chat closing process

            if (req.query.reject && req.query.reject =="True"){
                var chatDoc = await ChatModel.findById(chat._id);
                if ((chatDoc.sellerClose || chatDoc.buyerClose) && !(chatDoc.sellerClose && chatDoc.buyerClose)){
                    chatDoc.sellerClose = false;
                    chatDoc.buyerClose = false
                    await chatDoc.save();
                    res.status(200).send({
                        status : "reset the process of closing chat"
                    })
                    io.of("/").to(req.params.username).emit("resetEndChatSuccess",req.session.username)
                } else {
                    res.status(400).send({
                        status : "reject closing chat because not initiated yet"
                    })
                }

                return;
            }

            var sellerItems = await retrieveItemList(chat._id,chat.seller._id);
            var buyerItems =  await retrieveItemList(chat._id,chat.buyer._id);

            if (sellerItems.length==0 && buyerItems==0){
                res.status(400).send({
                    status : "please delete chat instead"
                })
                return;
            }





            var userRole = req.session.username == chat.seller.username ? "seller" : "buyer"

            // case 2 : one has agreeed but not the other
            if ((userRole == "buyer" &&chat.sellerClose) || (userRole == "seller" && chat.buyerClose) && !(chat.buyerClose && chat.sellerClose)){
                // either one has already initiated but not both
                for (const item of buyerItems){
                    let itemDoc = await ItemModel.findById(item._id);
                    itemDoc.done = new Date();
                    await itemDoc.save()
                    await ItemChatModel.deleteMany({item : item._id})
                }
                for (const item of sellerItems){
                    let itemDoc = await ItemModel.findById(item._id);
                    itemDoc.done = new Date();
                    await itemDoc.save()
                    await ItemChatModel.deleteMany({item : item._id})
                }
                var chatDoc = await ChatModel.findById(chat._id);
                chatDoc.closedOn = new Date();
                switch (true){
                    case userRole == "buyer" && chat.sellerClose:
                        chatDoc.buyerClose=true
                        break;
                    case userRole == "seller" && chat.buyerClose:
                        chatDoc.sellerClose=true;
                        break;
                }
                await chatDoc.save()
                res.status(200).send({
                    status:"endChatSuccess"
                })
                io.of("/").to(req.params.username).emit("endChatSuccess",req.session.username);

            } else {
                switch (true){
                    // case 3 : both people close already
                    case (chat.buyerClose && chat.sellerClose):
                        res.status(200).send({
                            status:"Chat already closed successfully"
                        })
                        break;

                    // case 4 : waiting - no action
                    case (userRole == "buyer" && chat.buyerClose) || (userRole == "seller" && chat.sellerClose):
                        res.status(401).send({
                            status: "Please wait for the other party to confirm"
                        })
                        break;

                    // case 5 : nobody initiated
                    case !chat.sellerClose && !chat.buyerClose: //no one initiate yet
                        var chatDoc = await ChatModel.findById(chat._id);
                        var otherPerson = null;
                        if (req.session.username==chat.seller.username){
                            chatDoc.sellerClose=true;
                            otherPerson = chat.buyer.username;
                        } else {
                            chatDoc.buyerClose=true;
                            otherPerson = chat.seller.username;
                        }
                        await chatDoc.save();
                        res.send({
                            status : "requestEndChatSuccess"
                        })
                        io.of("/").to(otherPerson).emit("requestEndChatSuccess",req.session.username);
                        break;
                }
            }
        } else { 
            throw new Error ("Chat does not exist")
        }
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed to delete chat",
            problem : e.message
        });
    }
}