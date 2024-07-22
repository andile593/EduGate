const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');
const School = require('../models/schoolModel')


exports.getAllSchools = asyncErrorHandler(async (req, res, next) => {
    const resultPerPage = 12;
    const schoolsCount = await School.countDocuments();

    console.log(req.query);


    const searchFeature = new SearchFeatures(School.find(), req.query)
        .search()
        .filter();

    let schools = await searchFeature.query;
    const filteredSchoolsCount = schools.length;

    searchFeature.pagination(resultPerPage);

    schools = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        schools,
        schoolsCount,
        resultPerPage,
        filteredSchoolsCount,
    });

});

exports.getSchools = asyncErrorHandler(async (req, res, next) => {
    const schools = await School.find()

    res.status(200).json({
        success: true,
        schools
    })
})


exports.getSchoolDetails = asyncErrorHandler(async (req, res, next) => {
    const school = await School.findById(req.params.id)

    if (!school) {
        return next(new ErrorHandler('School Not Found', 404))
    }

    res.status(200).json({
        success: true,
        school
    })
})

exports.getAdminSchools = asyncErrorHandler(async (req, res, next) => {
    const schools = await School.find()

    res.status(200).json({
        success: true,
        schools
    })
})


exports.createSchool = asyncErrorHandler(async (req, res, next) => {

    req.body.user = req.user.id

    const school = await School.create(req.body)

    res.status(200).json({
        success: true,
        school
    })
})


exports.updateSchool = asyncErrorHandler(async (req, res, next) => {
    let school = await School.findById(req.params.id)

    if (!school) {
        return next(new ErrorHandler('School Not Found', 404))
    }

    //implement contional logic edits to the school object 
    
    school = await School.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(201).json({
        success: true,
        school
    });

})

exports.deleteSchool = asyncErrorHandler(async (req, res, next) => {
    const school = await School.findById(req.params.id);

    if (!school) {
        return next(new ErrorHandler("School Not Found", 404));
    }

    // Delete images from Firebase Storage
    for (let i = 0; i < school.images.length; i++) {
        await admin.storage().bucket().file(school.images[i].public_id).delete();
    }

    // Remove product document from the database
    await school.remove();

    res.status(201).json({
        success: true
    });
});