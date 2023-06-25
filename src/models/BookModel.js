const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        unique: [true, 'Title already exists'],
        trim: true,
    },
    excerpt: {
        type: String,
        required: [true, 'Please add an excerpt'],
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    },
    ISBN: {
        type: String,
        required: [true, 'Please add an ISBN'],
        unique: [true, 'ISBN already exists'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true
    },
    subcategory: {
        type: String,
        required: [true, 'Please add a subcategory'],
        trim: true
    },
    reviews: {
        type: Number,
        default: 0,
        comment: 'Holds number of reviews of this book'
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        // type: String,
        trim: true,
        required: [true, 'Please add a releasedAt'],
        format: 'YYYY-MM-DD',
    }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);