import { model,Schema } from "mongoose";
import { UserSchema } from "./UserSchema.js";
import { ItemSchema } from "./ItemSchema.js";
import { ChatSchema } from "./ChatSchema.js";
import { ViewSchema } from "./ViewSchema.js";
import { BusStopSchema } from "./BusStopSchema.js";
import {ItemChatSchema} from "./ItemChatSchema.js"
import {ChatReviewSchema} from "./ChatReviewSchema.js"
import {PointChoiceSchema} from "./PointChoiceSchema.js"
import {PointTransactionSchema} from "./PointTransactionSchema.js"


export let UserModel = model("user", UserSchema);
export let ItemModel = model("item", ItemSchema);
export let ChatModel = model("chat", ChatSchema);
export let ViewModel = model("view", ViewSchema);
export let BusStopModel = model("busStop",BusStopSchema);
export let ItemChatModel = model("itemChat", ItemChatSchema);
export let ChatReviewModel = model("chatReview", ChatReviewSchema)
export let PointChoiceModel = model("pointChoice",PointChoiceSchema)
export let PointRewardModel = PointChoiceModel.discriminator('pointReward',new Schema( {
    max : {
        type : Number, //if not provided the infinity
    },
    prizeTitle : {
        type : String,
        trim: true,
        required : true
    },
    prizeDescription : {
        type : String,
        trim: true,
        required : true
    }
}))
export let PointTransactionModel = model("pointTransaction", PointTransactionSchema)