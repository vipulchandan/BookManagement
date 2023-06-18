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

// User Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Book Routes
router.post('/books', auth, createBook);
router.get('/books', getBooks);
router.get('/books/:bookId', getBookWithReviews);
router.put('/books/:bookId', auth, updateBook);
router.delete('/books/:bookId', auth, deleteBook);


// Review Routes
router.post('/books/:bookId/review', createReview);
router.put('/books/:bookId/review/:reviewId', updateReview);
router.delete('/books/:bookId/review/:reviewId', deleteReview);

module.exports = router