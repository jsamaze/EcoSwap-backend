import checkItemOwnership from "../../helper/checkItemOwnership.js";
import { ItemModel } from "../../model/index.js";

const approvedAttributes = ["itemName", "description","category","condition","tags"]  //not allowed change item type

export default  async (req,res,next) => {
    try {
        console.log(req.body && Object.keys(req.body).length>0);
        if (req.body && Object.keys(req.body).length>0){
            await checkItemOwnership(req.session.username,req.params.id)
            
            try{
                Object.keys(req.body).forEach(key => {
                    if (! approvedAttributes.includes(key)){
                            throw new Error(`${key} cannot be set in User`)
    
                        
                    }
                    });        
            } catch(e){
                res.status(400).send({
                    status:`Invalid input`,
                    problem:e.message
                })
                return;
            }
    
            try{
                await ItemModel.validate(req.body,Object.keys(req.body))
            } catch(e){
                res.status(400).send({
                    status:`Invalid input`,
                    problem:e.message
                })
                return;
            }
    
            await ItemModel.updateOne({_id:req.params.id},req.body)    
        }

        res.status(200).send({
            status:"update successful"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed updating Item",
            problem : e.message
        })
    }
}