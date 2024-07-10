import { NextFunction, Request, Response } from 'express';
const SearchFeatures = require('../utils/searchFeatures');
const School = require('../models/schoolModel')

exports.getSchools = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resultPerPage = 12;
        const schoolsCount = await School.countDocuments();

        console.log(req.query);
        

        const searchFeature = new SearchFeatures(School.find(), req.query)
        .search()
        .filter();

    let schools = await searchFeature.query;
    let filteredSchoolsCount = schools.length;

    searchFeature.pagination(resultPerPage);

    schools = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        schools,
        schoolsCount,
        resultPerPage,
        filteredSchoolsCount,
    });
    
    } catch (error) {
        next(error)
    }
}