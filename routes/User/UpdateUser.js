import { UserModel } from "../../model/index.js";

const approvedAttributes = ["fullName", "preferredBusStop","about"]

export default  async (req,res,next) => {
    try {

        
        Object.keys(req.body).forEach(key => {
            if (! approvedAttributes.includes(key)){
                res.status(400).send({
                    status:`${key} cannot be set in User`
                })
                return;
            }
        });

        try{
            await UserModel.validate(req.body,Object.keys(req.body))
        } catch(e){
            res.status(400).send({
                status:`Invalid input`,
                problem:e.message
            })
            return;
        }

        await UserModel.updateOne({username:req.session.username},req.body)

        res.status(200).send({
            status:"update successful"
        })


    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed updating user",
            problem : e.message
        })
    }
}