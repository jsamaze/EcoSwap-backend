import generateEmailOTP from "../../helper/generateOTP.js";
import { UserModel } from "../../model/index.js";

const approvedAttributes = ["fullName", "preferredBusStop","about","email"]

export default  async (req,res,next) => {
    try {
        console.log(req.body)

        if (req.body && Object.keys(req.body).length>0){ //if body not empty


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
                await generateEmailOTP(req.session.username)
                res.status(200).send({
                    status:"update successful - please verify email"
                })
                return;
            } else {
                res.status(200).send({
                    status:"update successful"
                })
                return
            }

        } else {
            res.status(200).send({
                status:"update successful"
            })   
            return       
        }

        



    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed updating user",
            problem : e.message
        })
    }
}