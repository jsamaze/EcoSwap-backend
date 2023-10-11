import { ItemLikeModel, ItemModel, ViewModel } from "../../model/index.js";

const betweenViewDuration = 300000 //milliseconds
export default  async (req,res,next) => {
    try {
        var item = await ItemModel
            .findOne({ _id: req.params.id }," -__v")
            .populate('user',"username fullname preferredBusStop");

        if (!item)  {
            throw new Error("No such item")
        }


    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving item",
            problem : e.message
        })
        return;
    }
    try {
        //additional logic to count people
        console.log(item)
        var view = await ViewModel.findOne({
            user : req.session.user_id,
            item : item.id
        })

        if (view) {
            // a view entry exists
            if (view.lastSeen.getTime()+betweenViewDuration <= Date.now()){
                item.views++
                view.lastSeen=Date.now();
            }
        } else {
            // a view entry does not exist
            view = new ViewModel({
                user: req.session.user_id,
                item : req.params.id,
            })
            item.views++
        }

        await item.save();
        await view.save();
    } catch (e){
        console.log("Issue with updating view")
        console.log(e);
    }

    try {
        var itemToSend =  item.toObject();
        itemToSend.photoURL = await item.getImageURLs();
        delete itemToSend.photoName

    } catch (e){

    }

    try {
        var likesCount = await ItemLikeModel.aggregate([
            {
                $match :             {
                    item : itemToSend._id
                }
            },
            {
                $count : "noOfLikes"
            }
        ])

        console.log(likesCount)


        itemToSend.noOfLikes = likesCount[0].noOfLikes
        

    } catch (e){
        res.status(500).send({
            status:"fail to check number of likes",
            data:item, //even if photo fetch error still return smth
            problem:e.message
        })
    }

    try {
        if (req.session.username){
            var like = await ItemLikeModel.findOne({
                user : req.session.user_id,
                item : item._id
            })


        itemToSend.userLike = !!like
        }

        res.status(200).send({
            status:"success",
            data:itemToSend
        })
    } catch (e){
        res.status(500).send({
            status:"fail to check whether logged in user likes it",
            data:item, //even if photo fetch error still return smth
            problem:e.message
        })
    }
}