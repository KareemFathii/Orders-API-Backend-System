const mongoose = require('mongoose');
const Category = require('./category.model');
const OrderSchema = new mongoose.Schema({
    userid :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productid :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity :{
        type: Number,
        required: true,
        min: 1,
    },
    discount : {
        type : Number  ,
        default : 0
        },
    totalPrice :{
        type: Number,
        min:10
    },
    status :{
        type: String,
        enum : ['Placed Order','Pending','Cancelled' ,'Shipped', 'Delivered'],
        default: 'Pending'
    },

});


const Order = mongoose.model('Order', OrderSchema);

module.exports = Order ;