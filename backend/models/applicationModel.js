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
            type: Number,
            required: true
        },
    },
    contactInfo : {
        emailAdress: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        emergencyContactName: {
            type: String,
            required: true
        },
        emergencyPhoneNumber: {
            type: Number,
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
            type: Number,
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
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    }],

})

module.exports = mongoose.model('Application', applicationSchema)