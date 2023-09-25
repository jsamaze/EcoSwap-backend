import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        var user = await UserModel.findOne({ username: req.params.username }, "fullName username email preferredBusStop about").lean();

        if (user){
            res.status(200).send({
                status:"Success",
                data:user
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