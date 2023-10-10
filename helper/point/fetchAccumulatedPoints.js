import { PointTransactionModel, UserModel } from "../../model/index.js";

export default async (username)=>{

    var user = await UserModel.findOne({username})

        const transactions = await PointTransactionModel.aggregate(
            [
                {
                  $match: {
                    user: user._id
                  }
                },
                {
                  $lookup: {
                    from: 'pointchoices',
                    localField: 'choice',
                    foreignField: '_id',
                    as: 'choices'
                  }
                },
                { $unwind: { path: '$choices' } },
                {
                  $match: {
                    'choices.prizeTitle': { $exists: false }
                  }
                },
                {
                  $project: {
                    rewardName: '$choices.rewardName',
                    points: '$choices.points',
                    createdAt: 1
                  }
                }
              ],
        )

        let totalAccPts = 0

        transactions.forEach(e=>{
            totalAccPts+=e.points
        })

        return {
            totalAccPts,
            transactions
        }

}
