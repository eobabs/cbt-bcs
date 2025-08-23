const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

process.env.JWT_SECRET = 'testsecret';


describe('Auth API', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'student'
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');

        const user = await User.findOne({ email: 'test@example.com' });
        expect(user).not.toBeNull();
        expect(user.name).toBe('Test User');
    });

    it('should fail to register a user with an existing email', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Another User',
                email: 'test@example.com',
                password: 'password456'
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe('User already exists');
    });
});
