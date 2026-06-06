const mongoose = require('mongoose')
const File = require('./fileModel')

const applicationSchema = new mongoose.Schema({
    personalInfo: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true,
            trim: true
        },
        gender: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        school: {
            type: mongoose.Schema.ObjectId,
            ref: "School",
            required: true
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        }
    },
    contactInfo: {
        emailAddress: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        emergencyContactName: {
            type: String,
            required: true
        },
        emergencyPhoneNumber: {
            type: String,
            required: true
        },
    },
    eduBackground: {
        previousSchoolName: {
            type: String,
            required: true
        },
        previousSchoolAddress: {
            type: String,
            required: true
        },
        yearOfGraduation: {
            type: Number,
            required: true
        },
    },
    academicInfo: {
        grade: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        acedemicAchievements: {
            type: String,
            required: true
        },
    },
    extraCurricularActivities: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "submitted", "under_review", "approved", "rejected", "waitlisted"],
        default: "draft"
    },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
        note: String
    }],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    }],
    submittedAt: {
        type: Date
    }

})

applicationSchema.index({ user: 1 });
applicationSchema.index({ school: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema)