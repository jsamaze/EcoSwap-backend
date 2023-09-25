import transporter from './transporter.js';
import crypto from 'crypto'
import { UserModel } from "../model/index.js";

export default async (username)=>{
    var user = await UserModel.findOne({ username: username });

    user.otp = crypto.randomInt(100000, 999999);
    user.otpValidUntil= Date.now()+300000,
    transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: 'EcoSwap - Verify Password',
        html:  `Please enter this OTP into the website: <br>
                
                <h1>${user.otp}</h1>`
    })
    await user.save()
}