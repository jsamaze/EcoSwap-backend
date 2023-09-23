import { UserModel } from "../../model/index.js";

export default async (req,res) => {
    try {
        const user = new UserModel({
            fullName: req.body.fullName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            photoName : "",
            preferredBusStop:""
        });

        await user.save();

        res.status(200).send ({
            status:"account creation succeed"
        })

    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "account creation failed",
            problem : e.message
        })
    }
}