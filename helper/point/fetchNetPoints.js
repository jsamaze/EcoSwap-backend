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
                  $project: {
                    rewardName: '$choices.rewardName',
                    points: '$choices.points',
                    createdAt: 1
                  }
                }
              ]
        )

        let totalNetPts = 0

        transactions.forEach(e=>{
            totalNetPts+=e.points
        })

        return {
            totalNetPts,
            transactions
        }
        

}
