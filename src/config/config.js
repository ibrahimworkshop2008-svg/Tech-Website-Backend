    require('dotenv').config();




    if(!process.env.PORT) {
        throw new Error('PORT is not defined');
    }

if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
}

if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

if(!process.env.SECRET_CLIENT_ID) {
    throw new Error('SECRET_CLIENT_ID is not defined');
}

if(!process.env.CLIENT_SECRET) {
    throw new Error('CLIENT_SECRET is not defined');
}

if(!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('GOOGLE_REFRESH_TOKEN is not defined');
}

if(!process.env.GOOGLE_USER) {
    throw new Error('GOOGLE_USER is not defined');
}

if(!process.env.USER_PASS) {
    throw new Error('User_PASS is not defined');
}

if(!process.env.SECRET_PASS) {
    throw new Error('SECRET_PASS is not defined');
}


if(!process.env.IMAGEKIT_PRIVATE) {
    throw new Error('IMAGEKIT_PRIVATE is not defined');
}

const config = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
    JWT_SECRET: process.env.JWT_SECRET,
    SECRET_CLIENT_ID: process.env.SECRET_CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER,
    USER_PASS: process.env.USER_PASS,
    SECRET_PASS: process.env.SECRET_PASS,
    IMAGEKIT_PRIVATE: process.env.IMAGEKIT_PRIVATE,
}


module.exports = config;