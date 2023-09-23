import { WishListItemModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        const items = await WishListItemModel.find().populate({
            path: 'user',
            select: 'fullName username' 
        }).limit(5); //limit code missing
        res.send({
            status : "success",
            items : items
        })
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed",
            problem : e.message
        });
    }
}