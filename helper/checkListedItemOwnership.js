import { ListedItemModel } from "../model/index.js";

export default async (username, item_id) => {
    var item = await ListedItemModel
    .findOne({ _id: item_id })
    .populate('user',"username");

    if (!item)  {
        throw new Error("No such item")
    } else if (item.user.username != username){
        throw new Error("Not your item")
    }
    return item;
}