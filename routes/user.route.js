const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller');
const validateUser = require('../middleware/user_validation');
const verifytoken = require('../middleware/verifyToken');
const autherization = require('../middleware/autherization.user');
const role = require('../utils/role');



router.post('/register',validateUser,UserController.register);
router.post('/login',UserController.login);
router.get('/logoutAll',verifytoken,UserController.logoutAll);


router.route('/password/forgetPassword')
.get(UserController.GetforgetPassword)
.post(UserController.SendResetPassLink);
router.route('/password/reset-Password/:id/:token')
.get(UserController.GetResetPassword)
.post(UserController.resetPassword);

router.post('/changePassword',verifytoken, autherization(role.ADMIN),UserController.changePassword);

module.exports = router;
