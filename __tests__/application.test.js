const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const School = require('../models/schoolModel');
const Application = require('../models/applicationModel');

let studentToken;
let schoolAdminToken;
let adminToken;
let schoolId;
let applicationId;

const validApplicationBody = {
    personalInfo: {
        firstName: 'Test',
        lastName: 'Student',
        dateOfBirth: '2005-01-01',
        gender: 'Male',
        address: '123 Main St',
        city: 'Johannesburg',
        province: 'Gauteng',
        country: 'South Africa',
        postalCode: '2000'
    },
    contactInfo: {
        emailAddress: 'test@student.com',
        phoneNumber: '0731234567',
        emergencyContactName: 'Parent Name',
        emergencyPhoneNumber: '0739876543'
    },
    eduBackground: {
        previousSchoolName: 'Old School',
        previousSchoolAddress: '456 Old St',
        yearOfGraduation: 2023
    },
    academicInfo: {
        grade: 'Grade 9',
        year: 2025,
        academicAchievements: 'Honours student'
    },
    extraCurricularActivities: 'Football, Chess'
};

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);

    const schoolAdmin = await User.create({
        name: 'School Admin',
        email: 'schooladmin@test.com',
        password: 'password123',
        role: 'school_admin',
        isVerified: true
    });

    const student = await User.create({
        name: 'Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        isVerified: true
    });

    const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
    });

    const schoolAdminLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'schooladmin@test.com', password: 'password123' });
    schoolAdminToken = schoolAdminLogin.body.token;

    const studentLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.token;

    const adminLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Create and verify a school directly in DB for testing
    const school = await School.create({
        name: 'Test School',
        description: 'Test description',
        schoolType: 'secondary',
        location: 'Johannesburg',
        schoolFees: 5000,
        grades: ['Grade 9'],
        subjects: ['Maths'],
        user: schoolAdmin._id,
        isVerified: true,
        status: 'active'
    });

    schoolId = school._id.toString();
});

afterAll(async () => {
    await User.deleteMany({});
    await School.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
});

describe('Application Controller', () => {

    // ── CREATE ────────────────────────────────────────────
    describe('POST /applications', () => {

        it('should allow student to submit an application', async () => {
            const res = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ ...validApplicationBody, school: schoolId });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            applicationId = res.body.application._id;
        });

        it('should not allow duplicate application to same school', async () => {
            const res = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ ...validApplicationBody, school: schoolId });

            expect(res.statusCode).toBe(400);
        });

        it('should not allow school_admin to create application', async () => {
            const res = await request(app)
                .post('/applications')
                .set('Authorization', `Bearer ${schoolAdminToken}`)
                .send({ ...validApplicationBody, school: schoolId });

            expect(res.statusCode).toBe(403);
        });
    });

    // ── READ ──────────────────────────────────────────────
    describe('GET /applications', () => {

        it('should return only own applications for student', async () => {
            const res = await request(app)
                .get('/applications')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            res.body.applications.forEach(app => {
                expect(app.user._id || app.user).toBe(
                    res.body.applications[0].user._id || 
                    res.body.applications[0].user
                );
            });
        });

        it('should return all applications for admin', async () => {
            const res = await request(app)
                .get('/applications')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.applications.length).toBeGreaterThan(0);
        });
    });

    // ── STATUS UPDATE ─────────────────────────────────────
    describe('PATCH /applications/:id/status', () => {

        it('should allow school_admin to update application status', async () => {
            const res = await request(app)
                .patch(`/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${schoolAdminToken}`)
                .send({ 
                    status: 'under_review', 
                    note: 'Documents being reviewed' 
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.application.status).toBe('under_review');
            expect(res.body.application.statusHistory.length).toBeGreaterThan(0);
        });

        it('should not allow student to update application status', async () => {
            const res = await request(app)
                .patch(`/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ status: 'approved' });

            expect(res.statusCode).toBe(403);
        });

        it('should reject invalid status values', async () => {
            const res = await request(app)
                .patch(`/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalidstatus' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── DELETE ────────────────────────────────────────────
    describe('DELETE /applications/:id', () => {

        it('should not allow student to delete submitted application', async () => {
            const res = await request(app)
                .delete(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${studentToken}`);

            // Status is under_review not draft so should fail
            expect(res.statusCode).toBe(400);
        });

        it('should allow admin to delete any application', async () => {
            const res = await request(app)
                .delete(`/applications/${applicationId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
        });
    });
});