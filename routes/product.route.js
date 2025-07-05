const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const productController = require('../controller/product.controller');
const role = require('../utils/role');
const authorization = require('../middleware/autherization.user');
const multer = require('multer');
const path = require('path');
const apperror = require('../utils/apperror');
const diskStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const fileName = `product-${Date.now()}.${ext}` ;
        cb(null, fileName);
    }
})
const filefilter = (req, file, cb) => {
    const filetype = file.mimetype.split('/')[0];
    console.log(filetype);
    if(filetype === 'image') {
       return cb(null, true);
    } else {
        return cb(apperror.createError(400,"Error" ,'Only image files are allowed'), false);
    }
}
const upload = multer({storage :diskStorage ,fileFilter: filefilter, limits: {fileSize: 1024 * 1024 * 5}});



router.post('/addProduct',verifyToken, authorization(role.ADMIN),upload.single('images'), productController.addProduct);
router.get('/getAllProducts',verifyToken, productController.getAllProduct);
router.get('/getSingleProduct/:id',verifyToken, productController.getOneProduct);
router.patch('/updateOneProduct/:id',verifyToken,authorization(role.ADMIN) ,productController.updateOneProduct);
router.delete('/deleteProduct/:id',verifyToken, authorization(role.ADMIN), productController.deleteOneProduct);


module.exports = router;