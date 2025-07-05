// requirments packages 
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const url = process.env.MONGO_URL
const app = express();
const httpstatustext = require('./utils/httpstatustext');
// routes 
const userRoute = require('./routes/user.route');
const categoryRoute = require('./routes/category.route');
const productRoute = require('./routes/product.route');
const orderRoute = require('./routes/order.route');
const cors = require('cors');

app.use(express.json());
mongoose.connect(url).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('Connection failed');
    console.log(error);
})

app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
// Create a write stream for logging to a file
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Log to console with custom format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));



// Log to file using 'dev' format
app.use(morgan('dev', { stream: logStream }));




//routes
app.use('/api/user',userRoute);
app.use('/api/category', categoryRoute);
app.use('/api/product',productRoute);
app.use('/api/order',orderRoute);

app.all('*', (req, res) => {
    res.status(404).json({status : httpstatustext.FAIL, message: 'Resource not found'});
})
//global error handler
app.use((error,req, res, next) => {
    res.status(error.statusCode || 500).json({status : error.statusText , message: error.message});
});


app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
});