import { NextFunction, Request, Response } from 'express';
const SearchFeatures = require('../utils/searchFeatures');
const School = require('../models/schoolModel')

interface QueryParams {
    keyword?: string;
  }

  exports.getSchools = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resultPerPage = 12;
        const schoolsCount = await School.countDocuments();

        console.log(req.query);

        // Assuming req.query is of type QueryParams
        const searchFeature = new SearchFeatures(School.find(), req.query as QueryParams)
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

    } catch (error) {
        next(error);
    }
};