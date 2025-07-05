const jwt = require("jsonwebtoken");
const apperror = require("../utils/apperror");
const httpstatustext = require("../utils/httpstatustext");

 const verifytoken = (req, res, next) => {
    const token = req.headers['authorization']||req.headers['Authorization'];
    if (!token) {
        const error = apperror.createError(401, httpstatustext.ERROR,"Token is required");
        return next(error);
    }
    try{
        const Authtoken = token.split(' ')[1];
        const UserContent = jwt.verify(Authtoken , process.env.SECRET_KEY );   
        req.UserContent = UserContent;
        next();
    }catch(err){
    const error= apperror.createError(401, httpstatustext.ERROR, "Unauthorized access please log in first",);
    next(error);
    }
   
}
module.exports = verifytoken;