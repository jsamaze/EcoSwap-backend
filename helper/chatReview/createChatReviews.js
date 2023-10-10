import {ChatReviewModel} from "../../model/index.js"

export default async (chatId, username1, username2) => {
    var review1 = new ChatReviewModel({
        chat : chatId,
        by : username1,
        for : username2,
    })
    var review2 = new ChatReviewModel({
        chat : chatId,
        by : username2,
        for : username1,
    })
    await review1.save()
    await review2.save()

}