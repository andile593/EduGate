const School = require('../models/schoolModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');


exports.getSchools = asyncErrorHandler(async (req, res, next) => {
    const query = {};

    // Filtering
    if (req.query.schoolType) {
        query.schoolType = req.query.schoolType;
    }

    if (req.query.location) {
        query.location = { 
            $regex: req.query.location, 
            $options: 'i' 
        };
    }

    if (req.query.grade) {
        query.grades = { 
            $in: [req.query.grade] 
        };
    }

    // Only show active verified schools to public
    query.isVerified = true;
    query.status = 'active';

    const schools = await School.find(query)
        .populate('user', 'name email');

    res.status(200).json({
        success: true,
        count: schools.length,
        schools
    });
});


exports.getSchoolById = asyncErrorHandler(async (req, res, next) => {
    const school = await School.findById(req.params.id)
        .populate('user', 'name email');

    if (!school) {
        return next(new ErrorHandler(
            `School not found with id: ${req.params.id}`, 404
        ));
    }

    // Non-admin users can only see active verified schools
    if (!school.isVerified || school.status !== 'active') {
        return next(new ErrorHandler('School not found', 404));
    }

    res.status(200).json({
        success: true,
        school
    });
});


exports.createSchool = asyncErrorHandler(async (req, res, next) => {
    // Attach the logged in user as owner
    req.body.user = req.user.id;

    // school_admin can only own one school
    if (req.user.role === 'school_admin') {
        const existingSchool = await School.findOne({ 
            user: req.user.id 
        });

        if (existingSchool) {
            return next(new ErrorHandler(
                'You have already registered a school', 400
            ));
        }
    }

    const school = await School.create(req.body);

    res.status(201).json({
        success: true,
        school
    });
});


exports.updateSchool = asyncErrorHandler(async (req, res, next) => {
    let school = await School.findById(req.params.id);

    if (!school) {
        return next(new ErrorHandler(
            `School not found with id: ${req.params.id}`, 404
        ));
    }

    // Ownership check - school_admin can only update their own school
    if (req.user.role === 'school_admin' && 
        school.user.toString() !== req.user.id) {
        return next(new ErrorHandler(
            'You are not authorized to update this school', 403
        ));
    }

    // Prevent school_admin from verifying their own school
    if (req.user.role === 'school_admin') {
        delete req.body.isVerified;
        delete req.body.status;
    }

    school = await School.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        school
    });
});

exports.deleteSchool = asyncErrorHandler(async (req, res, next) => {
    const school = await School.findById(req.params.id);

    if (!school) {
        return next(new ErrorHandler(
            `School not found with id: ${req.params.id}`, 404
        ));
    }

    await school.deleteOne();

    res.status(200).json({
        success: true,
        message: 'School deleted successfully'
    });
});


exports.verifySchool = asyncErrorHandler(async (req, res, next) => {
    const school = await School.findById(req.params.id);

    if (!school) {
        return next(new ErrorHandler(
            `School not found with id: ${req.params.id}`, 404
        ));
    }

    school.isVerified = true;
    school.status = 'active';
    await school.save();

    res.status(200).json({
        success: true,
        message: 'School verified successfully',
        school
    });
});