const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const httpstatustext = require('../utils/httpstatustext');
const asyncwrapper = require('../middleware/asynchandler');
const apperror = require('../utils/apperror');
const createToken = require('../utils/create.token');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const register = asyncwrapper(async (req, res , next) => {
    const {username , password, email , role } = req.body;
    console.log(req.body);
    const oldUser = await User.findOne({email});
    if(oldUser){
        const error  = apperror.createError(404, httpstatustext.FAIL, 'User already exists');
        return next(error);  
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        password: hashedPassword,
        email ,
        role
    });
    user.token = [];
    await user.save();
    res.status(201).json({status : httpstatustext.SUCCESS, data: user});
});

const login = asyncwrapper(async (req, res , next) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        const error = apperror.createError(404, httpstatustext.FAIL, ' Incorrect Email or password ');
        return next(error);
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){   
        const error = apperror.createError(404, httpstatustext.FAIL, ' Incorrect Email or password ');
        return next(error);
    }
    token = createToken({id: user._id , username: user.username , role : user.role});
    user.token = user.token.concat(token);
    await user.save();
    res.status(200).json({status : httpstatustext.SUCCESS, data: user});
});
const logoutAll = asyncwrapper(async (req, res , next) => {
    console.log(req.UserContent);
    const user = await User.findById(req.UserContent.id);
    user.token = [];
    req.headers['authorization'] = "Bearer " + user.token;
    await user.save();
    res.status(200).json({status : httpstatustext.SUCCESS, data: 'Logged out from all devices'});
});
// const logout = asyncwrapper(async (req, res , next) => {
//     req.user.token = req.user.token.filter(token => token !== req.token);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// forget password

const GetforgetPassword = asyncwrapper(async (req, res , next) => {
    res.render('forgetPassword');
})

const SendResetPassLink = asyncwrapper(async (req, res , next) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        const error = apperror.createError(404, httpstatustext.FAIL, 'User not found');
        return next(error);
    }
    const secret = process.env.SECRET_KEY + user.password;
    const token = jwt.sign({id: user._id , email: user.email, role : user.role}, secret, {expiresIn: '10m'});
    
    const link = `http://localhost:5000/api/user/password/reset-Password/${user._id}/${token}/`;
    const transporter  = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }); 
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Reset Password',
        html : `<h1>Click on the link to reset your password</h1>
                <p>${link}</p>`
    }
    transporter.sendMail(mailOptions, (error, success) => {
        if (error){
            return next(apperror.createError(404, httpstatustext.FAIL, 'Email not sent' + error.message));
        }else{
            res.render('resetPassLinkSent');
        }
    });

});

// rest password 

const GetResetPassword = asyncwrapper(async (req, res , next) => {
    const {id , token} = req.params;
    const user = await User.findById(id);
    if(!user){
        const error = apperror.createError(404, httpstatustext.FAIL, 'User not found');
        return next(error);
    }
    const secret = process.env.SECRET_KEY + user.password;
    try{
        jwt.verify(token, secret);
        res.render('resetPassword' , {email: user.email});
    }catch(error){ 
        return next(apperror.createError(404, httpstatustext.FAIL, 'Invalid Token'))
    }
})

const resetPassword = asyncwrapper(async (req, res , next) => {
    const {id , token} = req.params;
    const { password} = req.body;
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    const user = await User.findById({_id : id});

    if(!user){
        const error = apperror.createError(404, httpstatustext.FAIL, 'User not found');
        return next(error);
    }
    const secret = process.env.SECRET_KEY + user.password;
    try{
        jwt.verify(token, secret);
    // Check if the password matches the regex pattern
    if (!passwordRegex.test(password)) {
        return next(apperror.createError(404, httpstatustext.FAIL, 'password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'));
    }
        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, genSalt);
        user.password = hashedPassword;
        await user.save();
        res.render("resetpassSuccess");
    }catch(error){
        return next(apperror.createError(404, httpstatustext.FAIL, 'Invalid Token'))
    }
});
const changePassword = asyncwrapper(async (req, res , next) => {
    const {oldPassword , newPassword} = req.body;
    if(!oldPassword || !newPassword){
        return next(apperror.createError(404, httpstatustext.FAIL, 'Please provide old password and new password'));
    }
    const user = await User.findById(req.UserContent.id);
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if(!isPasswordCorrect){
        return next(apperror.createError(404, httpstatustext.FAIL, 'Incorrect old password'));
    }
    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, genSalt);
    user.password = hashedPassword;
    user.token = []
    await user.save();
    res.status(200).json({status : httpstatustext.SUCCESS, data: user});
})

module.exports= {
    register ,
    login ,
    logoutAll ,
    GetforgetPassword ,
    SendResetPassLink ,
    GetResetPassword ,
    resetPassword ,
    changePassword
}