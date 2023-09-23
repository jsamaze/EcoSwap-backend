import { model } from "mongoose";
import { UserSchema } from "./UserSchema.js";
import { WishlistItemSchema} from "./WishlistItemSchema.js";
import { ListedItemSchema } from "./ListedItemSchema.js";
import { ChatSchema } from "./ChatSchema.js";

export let UserModel = model("user", UserSchema);
export let WishlistItemModel = model("wishlistItem", WishlistItemSchema);
export let ListedItemModel = model("listedItem", ListedItemSchema);
export let ChatModel = model("chat", ChatSchema);