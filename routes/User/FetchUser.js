import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        var user = await UserModel.findOne({ username: req.params.username }, "fullName username email preferredBusStop about").lean();

        console.log(user)
        res.status(200).send(user)

          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving user",
            problem : e.message
        })
    }
}