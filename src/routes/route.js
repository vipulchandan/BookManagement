const express = require('express');
const router = express.Router();

const { 
    registerUser, 
    loginUser 
} = require('../controllers/userController');
const { 
    createBook, 
    getBooks, 
    getBookWithReviews, 
    updateBook, 
    deleteBook 
} = require('../controllers/bookController');
const { 
    createReview, 
    updateReview, 
    deleteReview 
} = require('../controllers/reviewController');
const { auth } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.send('Welcome to Book Management System!');
});

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1"
})

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Book Routes
router.post('/books', auth, createBook);
router.get('/books', auth, getBooks);
router.get('/books/:bookId', auth, getBookWithReviews);
router.put('/books/:bookId', auth, updateBook);
router.delete('/books/:bookId', auth, deleteBook);


// Review Routes
router.post('/books/:bookId/review', auth, createReview);
router.put('/books/:bookId/review/:reviewId', auth, updateReview);
router.delete('/books/:bookId/review/:reviewId', auth, deleteReview);

module.exports = router