import retrieveChat from "../../../helper/chat/retrieveChat.js";
import retrieveItemList from "../../../helper/chat/retrieveItemList.js";

export default  async (req,res,next) => {
    try {
        var chat = await retrieveChat(req.session.username,req.params.username);
        var sellerItems = await retrieveItemList(chat._id,chat.seller._id);
        var buyerItems =  await retrieveItemList(chat._id,chat.buyer._id);

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