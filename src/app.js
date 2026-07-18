const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookies = require('cookie-parser');
const registerRoute = require('./route/auth');
const productRoute = require('./route/productcrud');




app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173", // aapka frontend URL
  credentials: true,
}));

app.use('/api/auth', registerRoute);
app.use('/api/product', productRoute);


module.exports = app;