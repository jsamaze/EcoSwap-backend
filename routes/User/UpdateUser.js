import generateEmailOTP from "../../helper/generateOTP.js";
import { BusStopModel, UserModel } from "../../model/index.js";

const approvedAttributes = ["fullName", "preferredBusStop","about","email"]

export default  async (req,res,next) => {
    try {

        if (req.body && Object.keys(req.body).length>0){ //if body not empty


        try {
            Object.keys(req.body).forEach(key => {
                if (! approvedAttributes.includes(key)){
                    throw new Error(`${key} cannot be set in User`)  
                }
            });   
            if (Object.keys(req.body).includes("preferredBusStop")){
                var busStop = await BusStopModel.findOne({BusStopCode : req.body.preferredBusStop})
                console.log(busStop)
                if (!busStop) {
                    throw new Error("Bus stop does not exist")
                }
            }

            if(req.body.email){
                var email = req.body.email
                delete req.body.email
            }

            await UserModel.validate(req.body,Object.keys(req.body))

            if(email){
                req.body.email = email;
            }

        } catch (e){
            console.log(e)
            res.status(400).send({
                status:`Invalid input`,
                problem:e.message
            })
            return;
        }

        if (Object.keys(req.body).includes("email")){
            req.body.emailVerified = false
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
