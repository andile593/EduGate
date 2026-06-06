const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI);
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('Auth Controller', () => {

    // ── REGISTER ──────────────────────────────────────────
    describe('POST /auth/register', () => {

        it('should register a new student successfully', async () => {
            const res = await request(app)
                .post(' /auth/register')
                .send({
                    name: 'Test Student',
                    email: 'student@test.com',
                    password: 'password123',
                    role: 'student'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Verification email sent');
        });

        it('should not register with duplicate email', async () => {
            await User.create({
                name: 'Existing User',
                email: 'existing@test.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test Student',
                    email: 'existing@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should not allow self-registration as admin', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Fake Admin',
                    email: 'fakeadmin@test.com',
                    password: 'password123',
                    role: 'admin'
                });

            // Should register but as student not admin
            const user = await User.findOne({ 
                email: 'fakeadmin@test.com' 
            });
            expect(user.role).not.toBe('admin');
        });

        it('should fail without required fields', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'incomplete@test.com' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── LOGIN ─────────────────────────────────────────────
    describe('POST /auth/login', () => {

        beforeEach(async () => {
            await User.create({
                name: 'Verified User',
                email: 'verified@test.com',
                password: 'password123',
                isVerified: true
            });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'verified@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'verified@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should not login unverified user', async () => {
            await User.create({
                name: 'Unverified User',
                email: 'unverified@test.com',
                password: 'password123',
                isVerified: false
            });

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'unverified@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(403);
        });

        it('should not login with missing fields', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'verified@test.com' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ── PROTECTED ROUTES ──────────────────────────────────
    describe('GET /auth/me', () => {

        it('should return profile for authenticated user', async () => {
            const user = await User.create({
                name: 'Auth User',
                email: 'authuser@test.com',
                password: 'password123',
                isVerified: true
            });

            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    email: 'authuser@test.com',
                    password: 'password123'
                });

            const token = loginRes.body.token;

            const res = await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.user.email).toBe('authuser@test.com');
        });

        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/auth/me');

            expect(res.statusCode).toBe(401);
        });
    });
});