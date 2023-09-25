import { UserModel } from "../../model/index.js";

// export default  async (req,res,next) => {
//     try {
//         var user = await UserModel.findOne({ username: req.params.username });


//         res.status(200).sendFile(process.cwd()+'/user/photo/'+user.photoName);
          
//     } catch (e){
//         console.log(e);
//         res.status(500).send({
//             status : "failed to fetch photo",
//             problem : e.message
//         })
//     }
// }

export default  async (req,res,next) => {

    
    try {
        var user = await UserModel.findOne({ username: req.params.username });

        if (user.photoName){
            var url = await user.getImageURL()
            res.status(200).send({
                status : "success",
                url : url
            })
        } else {
            res.status(500).send({
                status : "failed to fetch photo",
                problem : 'no photo is set by user'
            })
        }            
    } catch (e){
        console.log(e);

    }
}