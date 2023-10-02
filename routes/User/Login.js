import { UserModel } from "../../model/index.js";

export default  async (req,res,next) => {
    try {
        var user = await UserModel.findOne({ username: req.body.username });
        if (user == null){
            user = await UserModel.findOne({ email: req.body.email });
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
                            status : "Success"
                        })
                    })
                })
            } else {
                res.status(401).send({
                    status : "unable to authenticate"
                })
            }
        });
          
    } catch (e){
        console.log(e);
        res.status(500).send({
            status : "failed retrieving user",
            problem : e.message
        })
    }
}