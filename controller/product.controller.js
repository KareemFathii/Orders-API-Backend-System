const asynchandler = require('../middleware/asynchandler');
const Product = require('../models/product.model');
const httpstatustext = require('../utils/httpstatustext');
const apperror = require('../utils/apperror');

const addProduct = asynchandler (async (req, res, next) => {
    const {name , description , price , category , images , stock} = req.body;
    if(!category) {
        const error = apperror.createError(404, httpstatustext.ERROR, "Category not found");
        return next(error);
    }
    const product = await new Product({
        name,
        description,
        price,
        category,
        images : req.file.filename,
        stock
    });
    await product.save();
    res.status(201).json({status : httpstatustext.SUCCESS, data: product});
});

const getAllProduct = asynchandler (async (req , res, next) => {
    const products = await Product.find({}).populate('category', 'name');
    if(!products) {
        const error = apperror.createError(404, httpstatustext.ERROR, "No products found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: products});
})
const getOneProduct = asynchandler (async (req , res, next) => {
    const id = req.params.id;
    const product = await Product.findById(id).populate('category', 'name');
    if(!product) {
        const error = apperror.createError(404, httpstatustext.ERROR, "Product not found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: product});
})
const updateOneProduct = asynchandler (async (req , res, next) => {
    const id = req.params.id;
    const data = req.body;
    const product = await Product.updateOne({_id:id}, {$set :{ ...data}});
    if(!product) {
        const error = apperror.createError(404, httpstatustext.ERROR, "Product not found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: product});
    
})
const deleteOneProduct = asynchandler (async (req , res, next) => {
    const id = req.params.id;
    const Deletedproduct = await Product.deleteOne({_id:id});
    if(Deletedproduct.deletedCount == 0) {
        const error = apperror.createError(404 , httpstatustext.FAIL, "The product with the given ID was not found" );
        return next(error);
    }
    res.json({status: httpstatustext.SUCCESS , data: "null"});
})

module.exports = {
    addProduct,
    getAllProduct,
    getOneProduct,
    updateOneProduct,
    deleteOneProduct
}