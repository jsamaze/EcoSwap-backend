
import validator from "validator";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import {s3} from '../global/S3.js'
import mongooseUniqueValidator from "mongoose-unique-validator";

const saltRounds=10;

let UserSchema = new Schema ({
    fullName : {
        type : String,
        trim: true,
        required: true,
    },
    username : {  //need hv length limit
        type : String,
        trim : true,
        index : {unique : true},
        maxLength : 20,
    },
    email :  {
        type: String,
        trim: true,
        // lowercase: true,
        index : {unique : true},
        required: 'Email address is required',
        validate: [validator.isEmail, 'Please fill a valid email address'],    
    },
    password : {
        type:String,
        required:true,

    },
    photoName : {
        type:String,
    },
    preferredBusStop : {
        type:String,
        maxLength:5,
        minLength:5,
    },
    emailVerified : {
        type:Boolean,
        required:true,
    },
    otp : {
        type : String
    },
    about: {
        type: String,
        trim:true,
    },
    otpValidUntil : {
        type : Date
    }
},
    { 
        methods : {
         comparePassword (candidatePassword, cb) {
            bcrypt.compare(candidatePassword, this.password, function(err,isMatch){
                if (err) return cb(err);
                cb(null,isMatch);
                })
            },

        async getImageURL (){
                var url = ""
                if (this.photoName){
                    url = await s3.getSignedUrl('getObject',{
                        Bucket:process.env.S3_BUCKET,
                        Key:this.photoName
                    })
                }

                return url
            },
        async checkOTP(candidateOTP){

            var match = await bcrypt.compare(candidateOTP.toString(), this.otp)
            return match && this.otpValidUntil.getDate() <= Date.now()
        },
        
        },

        timestamps:true
})

UserSchema.pre("save", async function (next) {
    var user = this;
    console.log(user.isModified('password'))
    if (user.isModified('password')&& user.password){
        var salt = await bcrypt.genSalt(saltRounds)
        var hash = await bcrypt.hash(user.password,salt)

        user.password = hash
    }

    console.log(user.isModified('otp'))

    if(user.isModified('otp') && user.otp){
        var salt = await bcrypt.genSalt(saltRounds)
        var hash = await bcrypt.hash(user.otp,salt)

        user.otp = hash
    }

    return next();

})

UserSchema.plugin(mongooseUniqueValidator, { message: 'Error, expected {PATH} to be unique.' })

export {UserSchema};