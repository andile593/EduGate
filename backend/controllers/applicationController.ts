import { NextFunction, Request, Response } from 'express';
const School = require('../models/schoolModel')

exports.submitForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schools = await School.find({})
        res.json(schools)
    } catch (error) {
        next(error)
    }
}