
import validator from "validator";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import {s3} from '../global/S3.js'

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
        lowercase: true,
        unique: true,
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
        type : Number
    },
    about: {
        type: String,
        trim:true,
    },
    otpValidUntil : {
        type : Number
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
                console.log(this.photoName)
                var url = await s3.getSignedUrl('getObject',{
                    Bucket:"ecoswap",
                    Key:this.photoName
                })
                return url


        }
        },
        timestamps:true
})

UserSchema.pre("save",function (next) {
    var user = this;

    if (!user.isModified('password')){
        return next()
    }

    bcrypt.genSalt(saltRounds, function(err,salt){
        if (err) return next(err);

        bcrypt.hash (user.password, salt, function(err,hash) {
            if (err) return next(err);
            user.password=hash;
            next();
        })
    })
})

export {UserSchema};