export default function (req, res, next) {

    req.session.userId = null;
    req.session.username = null;

    req.session.destroy(function(err) {
        // cannot access session here
        if (err) {
            res.status(500).send({
                status:"Failed",
                problem : err.message
            })
        }
        res.status(200).send({
            status : "Success"
        })
      })
  }