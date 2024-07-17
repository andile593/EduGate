const Application = require('../models/applicationModel')
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');

exports.createApplication = asyncErrorHandler(async (req, res, next) => {
    console.log(req.body)

    
})