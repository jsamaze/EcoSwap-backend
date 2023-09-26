//Yet to implement imageURL

import { ListedItemModel, ViewModel } from "../../model/index.js";

const betweenViewDuration = 300000 //milliseconds
export default  async (req,res,next) => {
    try {
        var item = await ListedItemModel
            .findOne({ _id: req.params.id },"-photoName -__v")
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
            if (view.lastSeen+betweenViewDuration <= Date.now()){
                item.views++
                view.lastSeen=Date.now();
            }
        } else {
            // a view entry does not exist
            view = new ViewModel({
                user: req.session.user_id,
                item : req.params.id,
                lastSeen : Date.now(),
            })
            item.views++
        }

        await item.save();
        await view.save();
    } catch (e){
        console.log("Issue with updating view")
        console.log(e);
    }

    res.status(200).send({
        status:"success",
        data:item
    })
}