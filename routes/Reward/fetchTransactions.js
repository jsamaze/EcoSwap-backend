import fetchNetPoints from "../../helper/point/fetchNetPoints.js"
import { PointTransactionModel } from "../../model/index.js"

export default  async (req,res,next) => {
    try {

        var {transactions} = await fetchNetPoints(req.session.username)
        console.log(transactions)
        res.send({
            status : "success",
            data : transactions

        })


    } catch (e) {
        res.status(500).send({
            status : "failed retrieving rewards",
            problem : e.message
        })
    }
}