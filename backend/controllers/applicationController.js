const Application = require('../models/applicationModel');
const School = require('../models/schoolModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');
const sendEmail = require('../utils/sendEmail');


exports.getApplications = asyncErrorHandler(async (req, res, next) => {
    let applications;

    if (req.user.role === 'admin') {
        // Admin sees everything
        applications = await Application.find()
            .populate('user', 'name email')
            .populate('school', 'name location');

    } else if (req.user.role === 'school_admin') {
        // school_admin only sees applications for their school
        const school = await School.findOne({ user: req.user.id });

        if (!school) {
            return next(new ErrorHandler(
                'No school found for this account', 404
            ));
        }

        applications = await Application.find({ school: school._id })
            .populate('user', 'name email')
            .populate('school', 'name location');

    } else {
        // Student only sees their own applications
        applications = await Application.find({ user: req.user.id })
            .populate('school', 'name location');
    }

    res.status(200).json({
        success: true,
        count: applications.length,
        applications
    });
});


exports.getApplicationById = asyncErrorHandler(async (req, res, next) => {
    const application = await Application.findById(req.params.id)
        .populate('user', 'name email')
        .populate('school', 'name location');

    if (!application) {
        return next(new ErrorHandler(
            `Application not found with id: ${req.params.id}`, 404
        ));
    }

    // Ownership checks
    if (req.user.role === 'student' && 
        application.user._id.toString() !== req.user.id) {
        return next(new ErrorHandler(
            'You are not authorized to view this application', 403
        ));
    }

    if (req.user.role === 'school_admin') {
        const school = await School.findOne({ user: req.user.id });

        if (!school || 
            application.school._id.toString() !== school._id.toString()) {
            return next(new ErrorHandler(
                'You are not authorized to view this application', 403
            ));
        }
    }

    res.status(200).json({
        success: true,
        application
    });
});


exports.createApplication = asyncErrorHandler(async (req, res, next) => {
    // Attach student
    req.body.user = req.user.id;

    // Verify school exists and is active
    const school = await School.findById(req.body.school);

    if (!school) {
        return next(new ErrorHandler('School not found', 404));
    }

    if (!school.isVerified || school.status !== 'active') {
        return next(new ErrorHandler(
            'This school is not currently accepting applications', 400
        ));
    }

    // Prevent duplicate applications to the same school
    const existingApplication = await Application.findOne({
        user: req.user.id,
        school: req.body.school
    });

    if (existingApplication) {
        return next(new ErrorHandler(
            'You have already applied to this school', 400
        ));
    }

    const application = await Application.create(req.body);

    // Notify student
    await sendEmail({
        to: req.user.email,
        subject: 'EduGate - Application Submitted',
        html: `
            <h2>Hi ${req.user.name}</h2>
            <p>Your application to <strong>${school.name}</strong> 
               has been submitted successfully.</p>
            <p>Current status: <strong>Submitted</strong></p>
            <p>We will notify you when the school reviews your application.</p>
        `
    });

    res.status(201).json({
        success: true,
        application
    });
});


exports.updateApplication = asyncErrorHandler(async (req, res, next) => {
    let application = await Application.findById(req.params.id);

    if (!application) {
        return next(new ErrorHandler(
            `Application not found with id: ${req.params.id}`, 404
        ));
    }

    // Ownership check
    if (application.user.toString() !== req.user.id) {
        return next(new ErrorHandler(
            'You are not authorized to update this application', 403
        ));
    }

    // Can only edit draft applications
    if (application.status !== 'draft') {
        return next(new ErrorHandler(
            'Submitted applications cannot be edited', 400
        ));
    }

    // Prevent student from changing school or status
    delete req.body.school;
    delete req.body.status;
    delete req.body.statusHistory;
    delete req.body.user;

    application = await Application.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        application
    });
});


exports.updateApplicationStatus = asyncErrorHandler(async (req, res, next) => {
    const { status, note } = req.body;

    const validStatuses = [
        'under_review', 
        'approved', 
        'rejected', 
        'waitlisted'
    ];

    if (!validStatuses.includes(status)) {
        return next(new ErrorHandler(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400
        ));
    }

    const application = await Application.findById(req.params.id)
        .populate('user', 'name email')
        .populate('school', 'name');

    if (!application) {
        return next(new ErrorHandler(
            `Application not found with id: ${req.params.id}`, 404
        ));
    }

    // school_admin ownership check
    if (req.user.role === 'school_admin') {
        const school = await School.findOne({ user: req.user.id });

        if (!school || 
            application.school._id.toString() !== school._id.toString()) {
            return next(new ErrorHandler(
                'You are not authorized to update this application', 403
            ));
        }
    }

    // Push to status history before updating
    application.statusHistory.push({
        status,
        changedBy: req.user.id,
        note: note || ''
    });

    application.status = status;
    await application.save();

    // Notify student of status change
    const statusMessages = {
        under_review: 'is now under review',
        approved: 'has been approved. Congratulations!',
        rejected: 'has not been successful at this time',
        waitlisted: 'has been placed on the waitlist'
    };

    await sendEmail({
        to: application.user.email,
        subject: `EduGate - Application Update: ${application.school.name}`,
        html: `
            <h2>Hi ${application.user.name}</h2>
            <p>Your application to 
               <strong>${application.school.name}</strong> 
               ${statusMessages[status]}.</p>
            ${note ? `<p>Note from school: <em>${note}</em></p>` : ''}
            <p>Log in to EduGate to view your full application status.</p>
        `
    });

    res.status(200).json({
        success: true,
        application
    });
});


exports.deleteApplication = asyncErrorHandler(async (req, res, next) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return next(new ErrorHandler(
            `Application not found with id: ${req.params.id}`, 404
        ));
    }

    // Student can only delete their own draft
    if (req.user.role === 'student') {
        if (application.user.toString() !== req.user.id) {
            return next(new ErrorHandler(
                'You are not authorized to delete this application', 403
            ));
        }

        if (application.status !== 'draft') {
            return next(new ErrorHandler(
                'Only draft applications can be deleted', 400
            ));
        }
    }

    await application.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
    });
});