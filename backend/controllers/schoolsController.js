const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
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

    if (req.body.images !== undefined) {
        let images = []

        typeof req.body.images === 'string' ? images.push(req.body.images) : images = req.body.images

        await Promise.all(school.images.map(image => admin.storage().bucket().file(image.public_id).delete()));

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const file = admin.storage().bucket().file(`schools/${Date.now()}_${i}`);
            await file.save(images[i], {
                contentType: 'image/jpeg',
            });

            const url = `https://storage.googleapis.com/${file.bucket.name}/${file.name}`;

            imagesLink.push({
                public_id: file.name,
                url: url,
            });
        }

        req.body.images = imagesLink;
    }

    if (req.body.logo.length > 0) {
        await admin.storage().bucket().file(school.schoolbrand.logo.public_id).delete();

        const file = admin.storage().bucket().file(`schoolbrands/${Date.now()}_logo`);
        await file.save(req.body.logo, {
            contentType: 'image/jpeg',
        });

        const schoolLogoUrl = `https://storage.googleapis.com/${file.bucket.name}/${file.name}`;

        req.body.schoolbrand = {
            name: req.body.schoolname,
            logo: {
                public_id: file.name,
                url: schoolLogoUrl
            }
        };
    }

    let specs = [];
    req.body.details.forEach((s) => {
        specs.push(JSON.parse(s))
    });
    req.body.details = specs;
    req.body.user = req.user.id;

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