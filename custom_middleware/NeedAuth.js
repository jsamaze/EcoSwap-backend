export default function  (req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        res.status(401).send({
            status : "AuthFail",
            problem : "Please login first"
        });
        return;
    }
}