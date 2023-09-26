import generateEmailOTP from "../../helper/generateOTP.js";
import { UserModel } from "../../model/index.js";

const approvedAttributes = ["fullName", "preferredBusStop","about","email"]

export default  async (req,res,next) => {
    try {

        if (req.body && Object.keys(req.body).length>0){ //if body not empty
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
    
            if (Object.keys(req.body).includes("email")){
                generateEmailOTP(req.session.username)
                res.status(200).send({
                    status:"update successful - please verify email"
                })
            } else {
                res.status(200).send({
                    status:"update successful"
                })
            }
        } else {
            res.status(200).send({
                status:"update successful"
            })          
        }

        



    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed updating user",
            problem : e.message
        })
    }
}