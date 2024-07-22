const Application = require('../models/applicationModel')
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');

exports.createApplication = asyncErrorHandler(async (req, res, next) => {
    
    console.log(req.body)

    const application = await Application.create(req.body)

    res.status(200).json({
        success: true,
         application
    })

    
})


exports.getAllApplictaions = asyncErrorHandler(async (req, res, next) => {
    
    const applications = await Application.find()

    res.status(200).json({
        success: true,
        applications,
    });

}) 


exports.getApplicationDetails = asyncErrorHandler(async (req, res, next) => {
    const application = await Application.findById(req.params.id)

    if (!application) {
        return next(new ErrorHandler('Application Not Found', 404))
    }

    res.status(200).json({
        success: true,
        application
    })
})

exports.updateApplication = asyncErrorHandler(async (req, res, next) => {
    let application = await Application.findById(req.params.id)

    if (!application) {
        return next(new ErrorHandler('Application Not Found', 404))
    }

    //implement contional logic edits to the application object 
    
    application = await Application.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(201).json({
        success: true,
        application
    });

})

exports.deleteApplication = asyncErrorHandler(async (req, res, next) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return next(new ErrorHandler("Application Not Found", 404));
    }

    // Delete images from Firebase Storage
    for (let i = 0; i < application.images.length; i++) {
        await admin.storage().bucket().file(application.images[i].public_id).delete();
    }

    // Remove product document from the database
    await application.remove();

    res.status(201).json({
        success: true
    });
});





