const mongoose = require('mongoose');
const role = require('../utils/role');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    token :[{
        type: String
    }] ,
    role : {
        type: String,
        enum : [ role.USER, role.ADMIN],
        default: role.USER
    }
});


const User = mongoose.model('User', UserSchema);

module.exports = User ;