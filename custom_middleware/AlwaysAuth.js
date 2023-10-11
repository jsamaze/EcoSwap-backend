export default function  (req, res, next) {
    if (req.session.user_id) {
        res.status(301).send({
            status : "You are already authenticated",
            username : req.session.username,
            userId : req.session.user_id
        });
    } else {
        next()
    }
}