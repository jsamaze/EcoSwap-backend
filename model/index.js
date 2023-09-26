import { model,Schema } from "mongoose";
import { UserSchema } from "./UserSchema.js";
import { WishlistItemSchema} from "./WishlistItemSchema.js";
import { ListedItemSchema } from "./ListedItemSchema.js";
import { ChatSchema } from "./ChatSchema.js";
import { ViewSchema } from "./ViewSchema.js";
import { BusStopSchema } from "./BusStopSchema.js";

export let UserModel = model("user", UserSchema);
export let WishlistItemModel = model("wishlistItem", WishlistItemSchema);
export let ListedItemModel = model("listedItem", ListedItemSchema);
export let ChatModel = model("chat", ChatSchema);
export let ViewModel = model("view", ViewSchema);
export let BusStopModel = model("busStop",BusStopSchema);
export let DoneListedItemModel = ListedItemModel.discriminator("doneListedItem",
    new Schema({doneOn : Date}))
export let DoneWishListItemModel = ListedItemModel.discriminator("doneWishListItem",
    new Schema({doneOn : Date}))