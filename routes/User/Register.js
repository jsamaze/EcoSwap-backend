import { UserModel } from "../../model/index.js";
import transporter from "../../helper/transporter.js";
import generateEmailOTP from "../../helper/generateEmailOTP.js";


export default async (req,res) => {
    try {

        const user = new UserModel({
            fullName: req.body.fullName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            photoName : null,
            preferredBusStop: null,
            emailVerified:false,
        });

        await user.save();

        generateEmailOTP(user.username)

        res.status(200).send ({
            status:"please confirm email - account creation succeed"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "account creation failed",
            problem : e.message
        })
    }
}