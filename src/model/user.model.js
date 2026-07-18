const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        verified: {
            type: Boolean,
            default: false,
        },

        refreshTokenHash: {
  type: String,
  default: null,
  select: false, // by default query mein na aaye
},
    },
    { timestamps: true }
);



const User = mongoose.model('User', userSchema);

module.exports = User;
