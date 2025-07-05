const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
   
    name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
        min: 1,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
      images: {
        type: String,
        required: true,
        default: '../uploads/avater.jpg',
      },
      stock: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    });


const Product = mongoose.model('Product', productSchema);

module.exports = Product ;