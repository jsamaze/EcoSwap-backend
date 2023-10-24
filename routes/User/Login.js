import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        if (!req.body.password){
            throw new Error("Please give a password")
        }
        var user = await UserModel.findOne({ username: req.body.username });
        if (user == null){
            user = await UserModel.findOne({ email: req.body.username });
        }
        if (user == null) {
            throw new Error ("User Not found")
        }
        user.comparePassword(req.body.password, function(err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                req.session.regenerate(function (err) {
                    if (err) throw (err)
                
                    // store user information in session, typically a user id
                    req.session.user_id = user._id;
                    req.session.username = user.username;
                
                    // save the session before redirection to ensure page
                    // load does not happen before session is saved
                    req.session.save(function (err) {
                        if (err) return next(err)
                        res.status(200).send({
                            status : "Success",
                            username : user.username,
                            userId : user._id
                        })
                    })
                })
            } else {
                res.status(401).send({
                    status : "fail",
                    problem : "unable to authenticate"
                })
            }
        });
          
    } catch (e){
        res.status(500).send({
            status : "fail",
            problem : e.message
        })
    }
}