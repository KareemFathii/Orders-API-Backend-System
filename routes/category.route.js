const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const categoryController = require('../controller/category.controller');
const role = require('../utils/role');
const authorization = require('../middleware/autherization.user');


router.post('/addCategory',verifyToken, categoryController.CreateCategory);
router.get('/getAllCategory',verifyToken, categoryController.GetAllCategory);
router.get('/getSingleCategory/:id',verifyToken, categoryController.GetSingleCategory);
router.delete('/deleteCategory/:id',verifyToken, authorization(role.ADMIN), categoryController.DeleteCategory);


module.exports = router;