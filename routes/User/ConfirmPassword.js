import { UserModel } from "../../model/index.js";

export default async (req,res) => {
    try {
        var user = await UserModel.findOne({ username: req.body.username });

        if (user.checkOTP(req.body.otp)){
            user.otp=undefined
            user.password=req.body.password
            user.otpValidUntil=undefined
            res.status(200).send({
                status:"success"
            })
        } else {
            res.status(401).send({
                status:"unable to verify OTP"
            })
        }
        await user.save();


    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "unable to find user",
            problem : e.message
        })
    }
}