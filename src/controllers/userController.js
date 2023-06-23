const UserModel = require('../models/UserModel');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/*
POST /register
Create a user - atleast 5 users
Create a user document from request body.
Return HTTP status 201 on a succesful user creation. Also return the user document. The response should be a JSON object
Return HTTP status 400 if no params or invalid params received in request body. The response should be a JSON object
*/
const registerUser = async (req, res) => {
    try {
        const user = req.body;

        if(!req.body) {
            return res.status(400).send({
                status: false,
                message: 'User data is required'
            });
        }

        // User Title Validation
        if(!user.title) {
            return res.status(400).send({
                status: false,
                message: 'User title is required'
            });
        }
        if(!['Mr', 'Mrs', 'Miss'].includes(user.title)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid user title. User title must be Mr, Mrs, or Miss'
            });
        }

        // User Name Validation
        if(!user.name) {
            return res.status(400).send({
                status: false,
                message: 'User name is required'
            });
        }

        // User Phone Validation
        if(!user.phone) {
            return res.status(400).send({
                status: false,
                message: 'User phone number is required'
            });
        }
        const phoneExists = await UserModel.findOne({ phone: user.phone });
        if(phoneExists) {
            return res.status(400).send({
                status: false,
                message: 'Phone number already exists'
            });
        }
        const phoneRegex = /^[0-9]{10}$/;
        if(!phoneRegex.test(user.phone)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid phone number'
            });
        }

        // User Email Validation
        if(!user.email) {
            return res.status(400).send({
                status: false,
                message: 'User email is required'
            });
        }
        const emailExists = await UserModel.findOne({ email: user.email });
        if(emailExists) {
            return res.status(400).send({
                status: false,
                message: 'Email already exists'
            });
        }
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!emailRegex.test(user.email)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid email'
            })
        }

        // User Password Validation
        if(!user.password) {
            return res.status(400).send({
                status: false,
                message: 'User password is required'
            });
        }
        if(user.password.length < 8 || user.password.length > 15) {
            return res.status(400).send({
                status: false,
                message: 'Password must be between 8 and 15 characters'
            });
        }

        // // Encrypt password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // // Create new user
        // const newUser = await UserModel.create({
        //     ...user,
        //     password: hashedPassword
        // });

        const newUser = await UserModel.create(user);

        return res.status(201).send({
            status: true,
            message: 'User created successfully',
            data: newUser
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

/*
POST /login
Allow an user to login with their email and password.
On a successful login attempt return a JWT token contatining the userId, exp, iat. The response should be a JSON object
If the credentials are incorrect return a suitable error message with a valid HTTP status code. The response should be a JSON object
*/

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // User Email Validation
        if(!email) {
            return res.status(400).send({
                status: false,
                message: 'User email is required'
            });
        }
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid email'
            });
        }

        // User Password Validation
        if(!password) {
            return res.status(400).send({
                status: false,
                message: 'User password is required'
            });
        }

        const user = await UserModel.findOne({ email, password });
        if(!user) {
            return res.status(401).send({
                status: false,
                message: 'Incorrect email or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // expires in 7 days. Also, divided by 1000 to convert from milliseconds to seconds
                iat: Math.floor(Date.now() / 1000) // issued at time of request 
            },
            process.env.JWT_SECRET_KEY, 
            // {
            //     expiresIn: '7d'
            // }
        );

        res.setHeader('x-api-key', token);

        res.status(200).send({
            status: true,
            message: 'User logged in successfully',
            data: {
                token
            }
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

module.exports = {
    registerUser, 
    loginUser
}