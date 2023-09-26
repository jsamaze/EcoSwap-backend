import { ListedItemModel } from "../../model/index.js";
import checkListedItemOwnership from "../../helper/checkListedItemOwnership.js";

const approvedAttributes = ["itemName", "description","category","condition","tags"]

export default  async (req,res,next) => {
    try {
        if (req.body && Object.keys(req.body).length>0){
            await checkListedItemOwnership(req.session.username,req.params.id)
            Object.keys(req.body).forEach(key => {
                if (! approvedAttributes.includes(key)){
                    res.status(400).send({
                        status:`${key} cannot be set in listed item`
                    })
                    return;
                }
            });
    
            try{
                await ListedItemModel.validate(req.body,Object.keys(req.body))
            } catch(e){
                res.status(400).send({
                    status:`Invalid input`,
                    problem:e.message
                })
                return;
            }
    
            await ListedItemModel.updateOne({_id:req.params.id},req.body)    
        }

        res.status(200).send({
            status:"update successful"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed updating ListedItem",
            problem : e.message
        })
    }
}