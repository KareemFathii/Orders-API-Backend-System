const apperror = require('../utils/apperror');
const httpstatustext = require('../utils/httpstatustext');
const Order = require('../models/order.model');
const asynchandler = require('../middleware/asynchandler');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');

function calculateTotalPrice(price, quantity, discount) {
    if (discount > 0) {
        const discountAmount = (price * discount) / 100;
        price = price - discountAmount ;
    }
    return price * quantity;
}
function CheckStock(product, quantity, next) {
    if(product.stock == 0) {
        const error = apperror.createError(404, httpstatustext.FAIL, `The product is out of stock`);
        return next(error);
    }
    else if (product.stock < quantity) {
        const error = apperror.createError(404, httpstatustext.FAIL, `The product have only ${product.stock} in stock`);
        return next(error);
    }
    return true;
}
const createOrder = asynchandler(async (req, res, next) => {
    const {userid , productid , quantity } = req.body;
    const product = await Product.findById(productid);
    if(CheckStock(product, quantity,next) ) {
        price = calculateTotalPrice (product.price, quantity , product.discount);
        const order = await new Order({
            userid,
            productid,
            quantity,
            totalPrice: price,
            status: 'Placed Order'
        });
        product.stock -= quantity;
        await product.save();
        await order.save();
        const user = await User.findById(userid);
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
            subject: 'Order Confirmation',
            html : ` <!DOCTYPE html>
            <html>
            
        <head>
        <style>
        /* Use inline styles as much as possible for email compatibility */
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                }
                
        .email-header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            }
                
        .email-body {
            padding: 20px;
            color: #333333;
            line-height: 1.6;
            }
            
        .email-footer {
                background-color: #f4f4f4;
                color: #666666;
                text-align: center;
                padding: 10px;
                font-size: 14px;
                }
                
        .button {
            display: inline-block;
            background-color: #007BFF;
            color:rgb(255, 255, 255) !important;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 0 auto ;
            margin-top: 20px;
            }
        .order , .code {
            font-size: 2.5rem ;
            color: #000000;
            text-transform: capitalize;
            font-weight: 900 ;
            display: block;
            width: 250px;
            text-align: center;
            }
            .status{
                font-size: 2rem ;
                font-weight: 800;
                text-transform: uppercase;
                color: #007BFF;
                }
                </style>
            </head>
            
            <body>
            <div class="email-container">
            <div class="email-header">
            <h1>Welcome to Our Service</h1>
            </div>
            <div class="email-body">
            <p>Dear Customer,</p>
            <p>Thank you for signing up for our service. We're thrilled to have you on board!</p>
            <p>Order ID : ${order._id}</p>
            <p>Product Name : ${product.name}</p>
            <p>Quantity : ${quantity}</p>
            <h1>Your Order Status is <span class="status"> ${order.status}</span> </h1>
            <h3>Total Price Of Your Order After Discount  </h3>
            
            <a href="https://example.com" class="button code">${order.totalPrice}</a>
            <p>If you have any questions or need assistance, feel free to contact us at any time.</p>
            
            <a href="https://example.com" class="button">Visit Our Website</a>
            </div>
            <div class="email-footer">
            <p>&copy; 2025 Your Company. All rights reserved.</p>
            </div>
            </div>
            </body>
        
        </html>`
                            
}
transporter.sendMail(mailOptions, (error, success) => {
    if (error){
        return next(apperror.createError(404, httpstatustext.FAIL, 'Email not sent' + error.message));}
        else{
            res.status(200).json({status : httpstatustext.SUCCESS, message: 'Order placed successfully, check your email for order details.'});
        }
    });    
};
    
});

const getAllOrders = asynchandler(async (req, res, next) => {
    const orders = await Order.find({}).populate('userid', 'name email role').populate('productid', 'name price stock');
    if(!orders) {
        const error = apperror.createError(404, httpstatustext.FAIL, "No orders found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: orders});
});

const getSingleOrder = asynchandler(async (req, res, next) => {
    const id = req.params.id;
    const order = await Order.findById(id).populate('userid', 'name email role').populate('productid', 'name price stock');
    if(!order) {
        const error = apperror.createError(404, httpstatustext.FAIL, "Order not found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: order});
});

const updateOrder = asynchandler(async (req, res, next) => {
    const OrderId = req.params.id;
    const OrderData = req.body;
    const order = await Order.findByIdAndUpdate(OrderId,{...OrderData}, {new: true});
    if(!order) {
        const error = apperror.createError(404, httpstatustext.FAIL, "Order not found");
        return next(error);
    }
    const user = await User.findById(order.userid);
    const product = await Product.findById(order.productid);
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
        subject: 'Your Order',
        html : ` <!DOCTYPE html>
        <html>
        
    <head>
    <style>
    /* Use inline styles as much as possible for email compatibility */
    body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            }
            
    .email-header {
        background-color: #007BFF;
        color: #ffffff;
        text-align: center;
        padding: 20px;
        }
            
    .email-body {
        padding: 20px;
        color: #333333;
        line-height: 1.6;
        }
        
    .email-footer {
            background-color: #f4f4f4;
            color: #666666;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            }
            
    .button {
        display: inline-block;
        background-color: #007BFF;
        color:rgb(255, 255, 255) !important;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        margin: 0 auto ;
        margin-top: 20px;
        }
    .order , .code {
        font-size: 2.5rem ;
        color:rgb(255, 255, 255);
        text-transform: capitalize;
        font-weight: 900 ;
        display: block;
        width: 250px;
        text-align: center;
        }
        .status{
            font-size: 2rem ;
            font-weight: 800;
            text-transform: uppercase;
            color:rgb(94, 153, 255);
            }
            </style>
        </head>
        
        <body>
        <div class="email-container">
        <div class="email-header">
        <h1>Welcome to Our Service</h1>
        </div>
        <div class="email-body">
        <p>Dear Customer,</p>
        <p>Thank you for signing up for our service. We're thrilled to have you on board!</p>
        <p>Order ID : ${order._id}</p>
        <p>Product Name : ${product.name}</p>
        <p>Quantity : ${order.quantity}</p>
        <h1>Your Order Status is <span class="status"> ${order.status}</span> </h1>
        <h3>Total Price Of Your Order After Discount  </h3>
        
        <a href="https://example.com" class="button code">${order.totalPrice}</a>
        <p>If you have any questions or need assistance, feel free to contact us at any time.</p>
        
        <a href="https://example.com" class="button">Visit Our Website</a>
        </div>
        <div class="email-footer">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
        </div>
        </div>
        </body>
    
    </html>` }
    transporter.sendMail(mailOptions, (error, success) => {
        if (error){
            return next(apperror.createError(404, httpstatustext.FAIL, 'Email not sent' + error.message));}
        else{
            res.status(200).json({status : httpstatustext.SUCCESS, message: 'Order Updated successfully, check your email for order details.'});
            }
    });    
});



const deleteOrder = asynchandler(async (req, res, next) => {
    const OrderId = req.params.id;
    const order = await Order.findByIdAndDelete({_id:OrderId});
    if(!order) {
        const error = apperror.createError(404, httpstatustext.FAIL, "Order not found");
        return next(error);
    }
    const user = await User.findById(order.userid);
    const product = await Product.findById(order.productid);
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
        subject: 'Order Cancellation',
        html : `<h1>Your order has been Cancelled successfully </h1>
        <h2>Order Details</h2>
        <p>Order ID : ${order._id}</p>
        <p>Product Name : ${product.name}</p>
        <p>Quantity : ${order.quantity}</p>
        <p>Total Price : ${order.totalPrice}</p>` }
    transporter.sendMail(mailOptions, (error, success) => {
        if (error){
            return next(apperror.createError(404, httpstatustext.FAIL, 'Email not sent' + error.message));}
        else{
            res.status(200).json({status : httpstatustext.SUCCESS, message: 'Order Cancelled successfully, check your email for order details.'});
            }
    });    
    // res.status(200).json({status : httpstatustext.SUCCESS, data: order});
});

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrder,
    deleteOrder
}