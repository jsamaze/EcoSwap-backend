import {s3} from '../../global/S3.js'
import checkItemOwnership from '../../helper/checkItemOwnership.js';

export default  async (req,res,next) => {

    let fileSuffix = req.originalUrl.split("/")[1];

    try {
        var  item=await checkItemOwnership(req.session.username,req.params.id);
        if (item.photoName.length==5){
            throw new Error("Maximum 5 photos for one project")
        }
    } catch (e){
        res.status(400).send({
            "status":"Bad request",
            "problem": e.message
        })
        return;
    }

    var params = {
        Bucket: 'ecoswap',
        Key: fileSuffix +Date.now() + '-' + req.session.user_id+".png",
        Body: req.file.buffer,
      };
    
    
    try {
        var stored = await s3.upload(params).promise()
        console.log(stored.key);
    } catch (err) {
        console.log(err)
        res.status(500).send({
            status:"failed",
            problem:err.message
        })
    }
    try {
        item.photoName.push(params.Key);

        await item.save();

        res.status(200).send({
            status : "success in updating photo",
            filename : params.Key
        })
 
    } catch (e){
        console.log(e);

        s3.deleteObject(params, (e,data)=>{
            if (err){
                res.status(500).send({
                    status : "error with database update, photo not deleted from database",
                    problem1 : e.message,
                    problem2 : err.message
                })
            } else {
                res.status(500).send({
                    status:"error with database update, photo not deleted",
                    problem : e.message
                })
            }
        })
    }
}