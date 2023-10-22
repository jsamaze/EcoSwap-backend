import { UserModel } from "../../model/index.js";
import generateOTP from "../../helper/generateOTP.js";


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

        generateOTP(user.username)

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