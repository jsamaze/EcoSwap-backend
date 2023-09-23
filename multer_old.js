const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,process.cwd()+ req.url)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + req.session.user_id+".png"; 
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })