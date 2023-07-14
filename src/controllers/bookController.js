const { default: mongoose } = require('mongoose');
const BookModel = require('../models/BookModel');
const UserModel = require('../models/UserModel');
const ReviewModel = require('../models/ReviewModel');
const moment = require('moment');
const { uploadBookCover } = require('../utils/awsConfig');

/*
POST /books
Create a book document from request body. Get userId in request body only.
Make sure the userId is a valid userId by checking the user exist in the users collection.
Return HTTP status 201 on a succesful book creation. Also return the book document. The response should be a JSON object
Create atleast 10 books for each user
Return HTTP status 400 for an invalid request with a response body
*/
/*
 add bookCover(string) key in your bookModel in Book managemt project. When book is being created , take up the book cover as an image , upload it to s3 and save the url in bookCover key.
*/

const createBook = async (req, res) => {
    try {
        const { userId, title, excerpt, ISBN, category, subcategory, releasedAt } = req.body;
        const userIdFromToken = req.userId;

        const files = req.files;

        if(files && files.length>0){
            let uploadedFileURL= await uploadBookCover( files[0] )
            // res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
            req.body.bookCover = uploadedFileURL
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }

        // Validate userId
        if(!userId) {
            return res.status(400).send({
                status: false,
                message: 'Please add a userId'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: 'Please add a valid userId'
            });
        }
        // Validate user exist in the database
        const user = await UserModel.findById({ _id: userId });
        if(!user) {
            return res.status(404).send({
                status: false,
                message: 'User not found'
            });
        }

        // Book Title Validation
        if(!title) {
            return res.status(400).send({
                status: false,
                message: 'Book title is required'
            });
        }
        const existingBook = await BookModel.findOne({ title });
        if(existingBook) {
            return res.status(400).send({
                status: false,
                message: 'Book title already exists'
            });
        }

        // Book Excerpt Validation
        if(!excerpt) {
            return res.status(400).send({
                status: false,
                message: 'Book excerpt is required'
            });
        }

        // Book ISBN Validation
        if(!ISBN) {
            return res.status(400).send({
                status: false,
                message: 'Book ISBN is required'
            });
        }
        const existingISBN = await BookModel.findOne({ ISBN });
        if(existingISBN) {
            return res.status(400).send({
                status: false,
                message: 'Book ISBN already exists'
            });
        }

        // Book Category Validation
        if(!category) {
            return res.status(400).send({
                status: false,
                message: 'Book category is required'
            });
        }

        // Book Subcategory Validation
        if(!subcategory) {
            return res.status(400).send({
                status: false,
                message: 'Book subcategory is required'
            });
        }

        // Book ReleasedAt Validation
        if(!releasedAt) {
            return res.status(400).send({
                status: false,
                message: 'Book releasedAt is required'
            });
        }
        const releasedAtDateRegex = /((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/;
        if(!releasedAtDateRegex.test(releasedAt)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid releasedAt date'
            });
        }

        // Validate userId
        if(!mongoose.Types.ObjectId.isValid(userIdFromToken)) {
            return res.status(400).send({
                status: false,
                message: `${userIdFromToken} is not a valid user token id`
            });
        }

        // Validate user
        if(userId !== userIdFromToken) {
            return res.status(403).send({
                status: false,
                message: 'Unauthorized access! You are not allowed to create this book'
            });
        }

        // format releasedAt
        const releasedAtDate = new Date(releasedAt).toISOString();
        // console.log(releasedAtDate);

        const newBook = await BookModel.create({
            userId,
            title,
            excerpt,
            ISBN,
            category,
            subcategory,
            releasedAt: releasedAtDate.slice(0, 10),
            bookCover: req.body.bookCover
        });
        // await newBook.save();

        res.status(201).send({
            status: true,
            message: 'Book created successfully',
            data: newBook
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
GET /books
Returns all books in the collection that aren't deleted. Return only book _id, title, excerpt, userId, category, releasedAt, reviews field. Response example here
Return the HTTP status 200 if any documents are found. The response structure should be
If no documents are found then return an HTTP status 404 with a response
Filter books list by applying filters. Query param can have any combination of below filters.
By userId
By category
By subcategory example of a query url: books?filtername=filtervalue&f2=fv2
Return all books sorted by book name in Alphabatical order
*/

const getBooks = async (req, res) => {
    try {
        const filter = {};
        const { userId, category, subcategory } = req.query;

        if(Object.keys(req.query).length === 0) {
            const getAllBooks = await BookModel.find({ ...filter, isDeleted: false }).select('_id title userId excerpt category releasedAt reviews').sort({ title: 1 });
            return res.status(200).send({
                status: true,
                message: 'Books List',
                data: getAllBooks
            });
        }

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid userId'
            });
        }
        
        if(userId && mongoose.Types.ObjectId.isValid(userId)) {
            filter.userId = userId;
        }
        
        if(category) {
            filter.category = category;
            // filter['category'] = category;
        }
        
        if(subcategory) {
            filter.subcategory = subcategory;
        }
        
        
        const books = await BookModel.find({ ...filter, isDeleted: false }).select('_id title userId excerpt category releasedAt reviews').sort({ title: 1 });

        if(books.length === 0) {
            return res.status(404).send({
                status: false,
                message: 'No books found'
            });
        }

        res.status(200).send({
            status: true,
            message: 'Books List',
            data: books
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
GET /books/:bookId
Returns a book with complete details including reviews. Reviews array would be in the form of Array. Response example here
Return the HTTP status 200 if any documents are found. The response structure should be
If the book has no reviews then the response body should include book detail as shown here and an empty array for reviewsData.
If no documents are found then return an HTTP status 404 with a response
*/

const getBookWithReviews = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId value'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false }).select('-ISBN -deletedAt -__v');
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        const reviewsData = await ReviewModel.find({ bookId, isDeleted: false }).select('_id bookId reviewedBy reviewedAt rating review');

        const bookDataWithReviews = {
            ...book._doc,
            reviewsData
        }

        res.status(200).send({
            status: true,
            message: 'Books List',
            data: bookDataWithReviews
        })

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
PUT /books/:bookId
Update a book by changing its
title
excerpt
release date
ISBN
Make sure the unique constraints are not violated when making the update
Check if the bookId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body
Return an HTTP status 200 if updated successfully with a body
Also make sure in the response you return the updated book document.
*/

const updateBook = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const { title, excerpt, releasedAt, ISBN } = req.body;
        const userIdFromToken = req.userId;

        // BookId Validation
        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId value'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        if(!mongoose.Types.ObjectId.isValid(userIdFromToken)) {
            return res.status(400).send({
                status: false,
                message: `${userIdFromToken} is not a valid user`
            });
        }

        // Book Validation
        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }

        // User Validation
        if(book.userId.toString() !== userIdFromToken) {
            return res.status(403).send({
                status: false,
                message: 'Unauthorized access! You are not allowed to update this book'
            });
        }

        // Title Validation
        const existingTitle = await BookModel.findOne({ title, _id: { $ne: bookId } });
        if(existingTitle) {
            return res.status(400).send({
                status: false,
                message: 'Title already exists'
            });
        }

        // ISBN Validation
        const existingISBN = await BookModel.findOne({ ISBN, _id: { $ne: bookId } });
        if(existingISBN) {
            return res.status(400).send({
                status: false,
                message: 'ISBN already exists'
            });
        }

        // Update book
        book.title = title;
        book.excerpt = excerpt;
        book.releasedAt = releasedAt;
        book.ISBN = ISBN;
        const updatedBook = await book.save(); 

        res.status(200).send({
            status: true,
            message: 'Book updated successfully',
            data: updatedBook
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}



/*
DELETE /books/:bookId
Check if the bookId exists and is not deleted. If it does, mark it deleted and return an HTTP status 200 with a response body with status and message.
If the book document doesn't exist then return an HTTP status of 404 with a body
*/

const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const userIdFromToken = req.userId;

        if(!bookId) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a bookId value'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: 'Please enter a valid bookId'
            });
        }

        if(!mongoose.Types.ObjectId.isValid(userIdFromToken)) {
            return res.status(400).send({
                status: false,
                message: `${userIdFromToken} is not a valid user`
            });
        }

        const book = await BookModel.findOne({ _id: bookId, isDeleted: false });
        if(!book) {
            return res.status(404).send({
                status: false,
                message: 'Book not found'
            });
        }
        
        // User Validation
        if(book.userId.toString() !== userIdFromToken) {
            return res.status(403).send({
                status: false,
                message: 'Unauthorized access! You are not allowed to delete this book'
            });
        }

        book.isDeleted = true;
        book.deletedAt = new Date();
        await book.save();

        res.status(200).send({
            status: true,
            message: 'Book deleted successfully'
        })


    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}


module.exports = {
    createBook,
    getBooks,
    getBookWithReviews,
    updateBook,
    deleteBook
}