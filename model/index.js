import { model,Schema } from "mongoose";
import { UserSchema } from "./UserSchema.js";
import { ItemSchema } from "./ItemSchema.js";
import { ChatSchema } from "./ChatSchema.js";
import { ViewSchema } from "./ViewSchema.js";
import { BusStopSchema } from "./BusStopSchema.js";
import {ItemChatSchema} from "./ItemChatSchema.js"

export let UserModel = model("user", UserSchema);
export let ItemModel = model("item", ItemSchema);
export let ChatModel = model("chat", ChatSchema);
export let ViewModel = model("view", ViewSchema);
export let BusStopModel = model("busStop",BusStopSchema);
export let ItemChatModel = model("itemChat", ItemChatSchema);
