const Application = require('../models/applicationModel')
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

exports.createApplication = asyncErrorHandler(async (req, res, next) => {
    const user = req.body.user
    req.user.id = user

    const application = await Application.create(req.body)

    res.status(200).json({
        success: true,
        application
    })
})