const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../backend/models/userModel');
const School = require('../backend/models/schoolModel');

let adminToken;
let schoolAdminToken;
let studentToken;
let schoolId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);

    // Create admin
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
    });

    // Create school admin
    const schoolAdmin = await User.create({
        name: 'School Admin',
        email: 'schooladmin@test.com',
        password: 'password123',
        role: 'school_admin',
        isVerified: true
    });

    // Create student
    const student = await User.create({
        name: 'Student User',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        isVerified: true
    });

    // Login all three and grab tokens
    const adminLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    const schoolAdminLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'schooladmin@test.com', password: 'password123' });
    schoolAdminToken = schoolAdminLogin.body.token;

    const studentLogin = await request(app)
        .post('/auth/login')
        .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.token;
});

afterAll(async () => {
    await User.deleteMany({});
    await School.deleteMany({});
    await mongoose.connection.close();
});

describe('School Controller', () => {

    // ── CREATE ────────────────────────────────────────────
    describe('POST /schools', () => {

        it('should allow school_admin to create a school', async () => {
            const res = await request(app)
                .post('/schools')
                .set('Authorization', `Bearer ${schoolAdminToken}`)
                .send({
                    name: 'Test High School',
                    description: 'A great school',
                    schoolType: 'secondary',
                    location: 'Johannesburg',
                    schoolFees: 5000,
                    grades: ['Grade 8', 'Grade 9', 'Grade 10'],
                    subjects: ['Mathematics', 'Science']
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            schoolId = res.body.school._id;
        });

        it('should not allow school_admin to create a second school', async () => {
            const res = await request(app)
                .post('/schools')
                .set('Authorization', `Bearer ${schoolAdminToken}`)
                .send({
                    name: 'Another School',
                    description: 'Description',
                    schoolType: 'primary',
                    location: 'Pretoria',
                    schoolFees: 3000,
                    grades: ['Grade 1'],
                    subjects: ['English']
                });

            expect(res.statusCode).toBe(400);
        });

        it('should not allow student to create a school', async () => {
            const res = await request(app)
                .post('/schools')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    name: 'Student School',
                    description: 'Description',
                    schoolType: 'primary',
                    location: 'Cape Town',
                    schoolFees: 1000,
                    grades: ['Grade 1'],
                    subjects: ['English']
                });

            expect(res.statusCode).toBe(403);
        });
    });

    // ── READ ──────────────────────────────────────────────
    describe('GET /schools', () => {

        it('should return only verified active schools publicly', async () => {
            const res = await request(app)
                .get('/schools');

            expect(res.statusCode).toBe(200);
            // Unverified school from above should not appear
            res.body.schools.forEach(school => {
                expect(school.isVerified).toBe(true);
                expect(school.status).toBe('active');
            });
        });
    });

    // ── VERIFY ────────────────────────────────────────────
    describe('PUT /schools/admin/:id/verify', () => {

        it('should allow admin to verify a school', async () => {
            const res = await request(app)
                .put(`/schools/admin/${schoolId}/verify`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.school.isVerified).toBe(true);
        });

        it('should not allow school_admin to verify a school', async () => {
            const res = await request(app)
                .put(`/schools/admin/${schoolId}/verify`)
                .set('Authorization', `Bearer ${schoolAdminToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    // ── DELETE ────────────────────────────────────────────
    describe('DELETE /schools/:id', () => {

        it('should not allow school_admin to delete a school', async () => {
            const res = await request(app)
                .delete(`/schools/${schoolId}`)
                .set('Authorization', `Bearer ${schoolAdminToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('should allow admin to delete a school', async () => {
            const res = await request(app)
                .delete(`/schools/${schoolId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});