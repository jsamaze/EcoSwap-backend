import fetchCompletedChatReviews from "../../helper/chatReview/fetchCompletedChatReviews.js";
import fetchAccumulatedPoints from "../../helper/point/fetchAccumulatedPoints.js";
import fetchNetPoints from "../../helper/point/fetchNetPoints.js";
import { UserModel,BusStopModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        var user = await UserModel.findOne({ username: req.params.username }, "fullName username email preferredBusStop about photoName emailVerified");
        
        if (!user){
            throw new Error("No such user")
        }



        var userToSend = user.toObject()
        userToSend.imageURL = await user.getImageURL()
        var reviewInfo = await fetchCompletedChatReviews(req.params.username)
        delete userToSend.photoName
        userToSend = {
            ...userToSend,
            ...reviewInfo
        }
        var netTransact = await fetchNetPoints(user.username)
        var accTransact = await fetchAccumulatedPoints(user.username)

        switch (true){
            case accTransact.totalAccPts < 100:
                var tier = "Green"
                break;
            case accTransact.totalAccPts < 300:
                var tier = "Silver"
                break;
            case accTransact.totalAccPts < 500:
                var tier = "Gold"
                break;
            default:
                var tier = "Superstar"
                break
        }

        userToSend = {
            ...userToSend,
            accumulatedPoints : accTransact.totalAccPts,
            netPoints : netTransact.totalNetPts,
            tier
        }

        userToSend.busStop = await BusStopModel.findOne({BusStopCode : user.preferredBusStop}).lean()





    

            res.status(200).send({
                status:"Success",
                data:userToSend
            })


          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving user",
            problem : e.message
        })
    }
}