import { UserModel } from "../../model/index.js";
import {s3} from '../../global/S3.js'

export default  async (req,res,next) => {

    let item = req.originalUrl.split("/")[1];

    var params = {
        Bucket: 'ecoswap',
        Key: item +Date.now() + '-' + req.session.user_id+".png",
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
        return;
    }
    try {
        var user = await UserModel.findOne({ username: req.session.username });

        var oldPhotoName = user.photoName;
        user.photoName = params.Key;

        await user.save();

        if(oldPhotoName && oldPhotoName.length > 0){
            params = {
                Bucket: 'ecoswap',
                Key: oldPhotoName,
            }
            s3.deleteObject(params, (e,data)=>{
                if (e){
                    console.log(e)
                    res.status(200).send({
                        status:"success but old photo not deleted"
                    })
                    return;
                } else {
                    console.log(data)
                }
            })

        }

        res.status(200).send({
            status : "success in updating photo",
            filename : user.photoName
        })
 
    } catch (e){
        console.log(e);

        s3.deleteObject(params, (e,data)=>{
            if (err){
                res.status(500).send({
                    status : "error with database update, photo not deleted from database",
                    problem : [e.message,err.message]
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