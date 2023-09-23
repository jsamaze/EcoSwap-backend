import { UserModel } from "../../model/index.js";
// import fs from 'fs';
import AWS from 'aws-sdk';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export default  async (req,res,next) => {

    const s3 = new AWS.S3();
    var params = {
        Bucket: 'ecoswap',
        Key: "user" +Date.now() + '-' + req.session.user_id+".png",
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
                } else {
                    console.log("delete cake")
                    console.log(data)
                }
            })


            //Old code using Local Storage
            // fs.unlink(process.cwd()+'/user/photo/' + oldPhotoName,(error)=>{
            //     if (error) throw error
            //     res.status(200).send({
            //         status : "success in updating photo",
            //         filename : user.photoName
            //     })
            // })
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



        // fs.unlink('user/photo/' + req.file.filename);

        // fs.unlink(process.cwd()+'/user/photo/' + req.file.filename,(error)=>{
        //     if (error){
        //         res.status(500).send({
        //             status : "error with database update, photo not deleted from database",
        //             ptoblem1 : e.message,
        //             problem2 : error.message
        //         })
        //     } 
        //     res.status(500).send({
        //         status : "error with database update, photo deleted from database",
        //         problem : e.message 
        //     })
        // })
    }
}