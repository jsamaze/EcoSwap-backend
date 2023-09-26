import {s3} from '../../global/S3.js'
import checkListedItemOwnership from '../../helper/checkListedItemOwnership.js';

export default  async (req,res,next) => {
    console.log(req.query.index)
    console.log(req.params.id)
    if (!(req.query.index && req.query.index > -1 && req.query.index <5)){
        res.status(400).send({
            status:"Invalid query parameters"
        })
        return;
    }

    try {
        var item = await checkListedItemOwnership(req.session.username,req.params.id)
        if (!item.photoName[req.query.index]){
            throw Error("Index invalid because empty")
        }
    } catch (e) {
        res.status(500).send({
            status : "unable to fetch item",
            problem : e.message
        })
        return;
    }

    var params = {
        Bucket: 'ecoswap',
        Key: item.photoName[req.query.index],
      };


    try {
        await s3.deleteObject(params).promise()
        item.photoName.splice(req.query.index,1);
        await item.save()
        res.status(200).send({
            status:"photo deleted",
        })
    } catch (e){
        res.status(500).send({
            status:"problem with deleting photo",
            problem: e.message,
        })               
    }

    
}