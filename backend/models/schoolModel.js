
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
    image: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }],
    location: {
        type: String,
        required: true
    },
    schoolFees: {
        type: Number,
        required: true,
    },
    grades: [{
        type: String,
        required: true
    }],
    subjects: [{
        type: String,
        required: true
    }],
    schoolType: {
        type: String,
        enum: ["primary", "secondary", "combined", "private", "special_needs"],
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    
});

schoolSchema.index({ location: 1 });
schoolSchema.index({ schoolType: 1 });
module.exports = mongoose.model('School', schoolSchema);