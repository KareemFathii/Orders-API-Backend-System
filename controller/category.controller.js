const asynchandler = require('../middleware/asynchandler');
const Category = require('../models/category.model');
const httpstatustext = require('../utils/httpstatustext');
const apperror = require('../utils/apperror');

const CreateCategory = asynchandler (async (req, res, next) => {
    console.log(req.UserContent.id)
    console.log(req?.session._id);
    const {name , description} = req.body;
    const category = await new Category({
        name,
        description,
        createdBy: req.UserContent.id
    });
    await category.save();
    res.status(201).json({status : httpstatustext.SUCCESS, data: category});

});
const GetAllCategory = asynchandler (async (req, res, next) => {
    const categories = await Category.find({}).populate('createdBy', 'name email role');
    if(!categories) {
        const error = apperror.createError(404, httpstatustext.ERROR, "No categories found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: categories});
})

const GetSingleCategory = asynchandler (async (req, res, next) => {
    const id = req.params.id;
    const category = await Category.findById(id).populate('createdBy', 'name email role');
    if(!category) {
        const error = apperror.createError(404, httpstatustext.ERROR, "Category not found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: category});
})
const DeleteCategory = asynchandler (async (req, res, next) => {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id).populate('createdBy', 'name email role');
    if(!category) {
        const error = apperror.createError(404, httpstatustext.ERROR, "Category not found");
        return next(error);
    }
    res.status(200).json({status : httpstatustext.SUCCESS, data: category});
})

module.exports = {
    CreateCategory ,
    GetAllCategory,
    GetSingleCategory,
    DeleteCategory

}