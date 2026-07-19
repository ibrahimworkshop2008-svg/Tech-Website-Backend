    require('dotenv').config();




const required = [
  'MONGO_URI', 'JWT_SECRET', 'SECRET_CLIENT_ID', 'CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN', 'GOOGLE_USER', 'USER_PASS', 'SECRET_PASS',
  'IMAGEKIT_PRIVATE', 'APP_URL'
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`⚠️ Missing env vars: ${missing.join(', ')}`);
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
    APP_URL: process.env.APP_URL || 'http://localhost:5000',
}


module.exports = config;