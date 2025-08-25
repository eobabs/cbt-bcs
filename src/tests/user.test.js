const request = require('supertest');
const app = require('/server');
const User = require('../models/User');

const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';


describe('Auth/User API', () => {
    let teacherToken;
    let teacherUser;
    let studentToken;
    let studentUser;

    const createUserAndToken = async (userData) => {
        const user = new User(userData);
        await user.save();
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '0.5h'});
        return {user, token};
    };

    beforeEach(async () => {
        const teacherData = {
            name: 'Test Teacher',
            email: `teacher${Date.now()}@test.com`,
            password: 'password123',
            role: 'teacher'
        };
        const teacher = await createUserAndToken(teacherData);
        teacherUser = teacher.user;
        teacherToken = teacher.token;

        const studentData = {
            name: 'Test Student',
            email: `student${Date.now()}@test.com`,
            password: 'password123',
            role: 'student'
        };
        const student = await createUserAndToken(studentData);
        studentUser = student.user;
        studentToken = student.token;

    });

    describe('Auth API - Register User - POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'password123',
                role: 'student'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should not register user with existing email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: teacherUser.email,
                    password: 'password123',
                    role: 'student'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('User already exists');
        });
    });

    describe('Auth API - LogIn User - POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Login User',
                    email: 'loginuser@test.com',
                    password: 'password123',
                    role: 'student'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'loginuser@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Invalid credentials');
        });
    });
});

