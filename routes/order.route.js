const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const  OrderController = require('../controller/order.controller');
const role = require('../utils/role');
const authorization = require('../middleware/autherization.user');


router.post('/CreateOrder',verifyToken, authorization(role.USER), OrderController.createOrder);
router.get('/getAllOrders',verifyToken, OrderController.getAllOrders);
router.get('/getSingleOrder/:id',verifyToken, OrderController.getSingleOrder);
router.patch('/updateOrder/:id',verifyToken,authorization(role.ADMIN), OrderController.updateOrder);
router.delete('/deleteOrder/:id',verifyToken, authorization(role.ADMIN), OrderController.deleteOrder);


module.exports = router;