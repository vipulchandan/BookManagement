const ReviewModel = require('../models/ReviewModel');
const BookModel = require('../models/BookModel');
const { default: mongoose } = require('mongoose');


/*
POST /books/:bookId/review
Add a review for the book in reviews collection.
Check if the bookId exists and is not deleted before adding the review. Send an error response with appropirate status code if the book does not exist
Get review details like review, rating, reviewer's name in request body.
Update the related book document by increasing its review count
Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object
*/

const createReview = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { review, rating, reviewedBy } = req.body;

        // Validate bookId
        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        // Validate review
        if(!review) {
            return res.status(400).send({
                status: false,
                message: 'Review is required'
            });
        }

        // Validate rating
        if(!rating) {
            return res.status(400).send({
                status: false,
                message: 'Rating is required'
            });
        }
        if(!Number.isInteger(rating)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid rating'
            });
        }
        if(rating < 1 || rating > 5) {
            return res.status(400).send({
                status: false,
                message: 'Please enter rating between 1 and 5'
            });
        }

        // Validate reviewedBy
        if(!reviewedBy) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a reviewers name'
            });
        }

        // Check if book exists
        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        // Update the book document with the new review
        book.reviews += 1;
        const updatedBook = await book.save();

        // Add review
        const reviewsData = new ReviewModel({
            bookId,
            reviewedBy,
            review,
            rating
        });
        await reviewsData.save();

        // Get Updated book document with reviews
        const allData = {
            ...updatedBook._doc, 
            reviewsData
        }

        // Update book
        // const newBook = await BookModel.updateOne(
        //     { _id: bookId }, 
        //     { $inc: { reviews: 1 } },
        //     { new: true },         
        // );

        res.status(200).send({
            status: true,
            message: 'Review added successfully',
            data: allData
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
PUT /books/:bookId/review/:reviewId
Update the review - review, rating, reviewer's name.
Check if the bookId exists and is not deleted before updating the review. Check if the review exist before updating the review. Send an error response with appropirate status code if the book does not exist
Get review details like review, rating, reviewer's name in request body.
Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object
*/

const updateReview = async (req, res) => {
    try {
        const { bookId, reviewId } = req.params;
        const { review, rating, reviewedBy } = req.body;

        // Validate bookId
        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        // Validate reviewId
        if(!reviewId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a reviewId'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid reviewId'
            });
        }

        // Validate review, rating, reviewedBy
        if(!review || !rating || !reviewedBy) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a review, rating, and reviewers name for the review to be updated'
            });
        }
        // if(!review) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'Review is required'
        //     });
        // }
        // if(!reviewedBy) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'Please enter a reviewers name'
        //     });
        // }
        // if(!rating) {
        //     return res.status(400).send({
        //         status: false,
        //         message: 'Rating is required'
        //     });
        // }
        if(!Number.isInteger(rating)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid rating'
            });
        }
        if(rating < 1 || rating > 5) {
            return res.status(400).send({
                status: false,
                message: 'Please enter rating between 1 and 5'
            });
        }

        // Check if book exists
        const book = await BookModel.findOne({ _id:bookId, isDeleted: false });
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        // Check if review exists
        const reviewData = await ReviewModel.findOne({ _id: reviewId, isDeleted: false });
        if(!reviewData) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }

        // Update review
        reviewData.review = review;
        reviewData.rating = rating;
        reviewData.reviewedBy = reviewedBy;
        await reviewData.save();

        // Get Updated book document with reviews
        const allData = {
            ...book._doc,
            reviewsData: reviewData
        }

        res.status(200).send({
            status: true,
            message: 'Review updated successfully',
            data: allData
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
DELETE /books/:bookId/review/:reviewId
Check if the review exist with the reviewId. Check if the book exist with the bookId. Send an error response with appropirate status code like this if the book or book review does not exist
Delete the related reivew.
Update the books document - decrease review count by one
*/

const deleteReview = async (req, res) => {
    try {
        const { bookId, reviewId } = req.params;

        // Validate bookId
        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId'
            });
        } 
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        // Validate reviewId
        if(!reviewId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a reviewId'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid reviewId'
            });
        }

        // Check if book exists
        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        // Check if review exists
        const reviewData = await ReviewModel.findOne({ _id: reviewId, isDeleted: false });
        if(!reviewData) {
            return res.status(404).send({
                status: false,
                message: 'Review not found'
            });
        }

        // Delete review
        reviewData.isDeleted = true;
        await reviewData.save();

        // Update book
        book.reviews -= 1;
        await book.save();

        res.status(200).send({
            status: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

module.exports = {
    createReview,
    updateReview,
    deleteReview
}