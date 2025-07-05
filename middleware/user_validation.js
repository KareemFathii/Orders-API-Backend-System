const Joi = require('joi');
const apperror = require('../utils/apperror');
const httpstatustext = require('../utils/httpstatustext');
const role = require('../utils/role');
const { error } = require('console');
const userValidationSchema = Joi.object({
    username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

password: Joi.string().required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
email: Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
role: Joi.string().default(role.USER).valid(role.USER, role.ADMIN),
});

const validateUser = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
       const errorr = apperror.createError(400,httpstatustext.FAIL , error.message);
       return next(errorr);
    }
    next();
};

module.exports = validateUser;