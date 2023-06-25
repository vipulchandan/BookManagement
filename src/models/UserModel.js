const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        enum: ['Mr', 'Mrs', 'Miss'],
        trim: true,    
    }, 
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: [true, 'Phone number already exists'],
        trim: true,
        validate: {
            validator: (value) => {
                const phoneRegex = /^[0-9]{10}$/;
                return phoneRegex.test(value);
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Email already exists'],
        trim: true,
        validate: {
            validator: (value) => {
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegex.test(value);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        trim: true,
        minlength: 8,
        maxlength: 15,
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);