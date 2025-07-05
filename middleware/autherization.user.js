const autherization = (...AuthRoles) =>{
    return (req, res, next) => {
        const userRole = req.UserContent.role;
        if (!AuthRoles.includes(userRole)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to perform this action'
            });
        }
        next();
    }
}
module.exports = autherization;