
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter school name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter school description"]
    },
    schoolType: {
        type: String,
        required: [true, "Please enter school type"]
    },
    image: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    location: {
        type: String,
        required: true
    },
    schoolFees: {
        type: Number,
        required: true,
    },
    grades: {
        type: String,
        required: true,
    },
    subjects: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('School', schoolSchema);