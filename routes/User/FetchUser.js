import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        var user = await UserModel.findOne({ username: req.params.username }, "fullName username email preferredBusStop about photoName");
        var userToSend = user.toObject()
        userToSend.imageURL = await user.getImageURL()
        delete userToSend.photoName
        if (user){
            res.status(200).send({
                status:"Success",
                data:userToSend
            })
        } else {
            throw new Error("No such user")
        }


          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving user",
            problem : e.message
        })
    }
}