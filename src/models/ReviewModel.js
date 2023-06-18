const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Please add a book']
    },
    reviewedBy: {
        type: String,
        required: [true, 'Please add a reviewedBy'],
        default: 'Anonymous Guest',
        value: 'Anonymous Guest'
    },
    reviewedAt: {
        type: Date,
        required: [true, 'Please add a reviewedAt'],
        default: Date.now,
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating'],
        min: [1, 'Rating must be above 0'],
        max: [5, 'Rating must be below 6'],
    },
    review: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);