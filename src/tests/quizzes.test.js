const request = require('supertest');
const mongoose = require('mongoose');
const app = require('/server');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';

describe('Quizzes API - Update and Delete', () => {
    let teacherToken;
    let teacherUser;
    let quiz;

    beforeEach(async () => {
        teacherUser = new User({
            name: 'Quiz Teacher',
            email: `teacher${Date.now()}@test.com`,
            password: 'password',
            role: 'teacher'
        });
        await teacherUser.save();

        const payload = { user: { id: teacherUser.id, role: teacherUser.role } };
        teacherToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '0.5h' });

        quiz = new Quiz({
            title: 'Initial Quiz Title',
            description: 'A test quiz.',
            createdBy: teacherUser.id
        });
        await quiz.save();
    });

    describe('PUT /:quizId', () => {
        it('should update the quiz if the user is the owner', async () => {
            const res = await request(app)
                .put(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', teacherToken)
                .send({ title: 'Updated Quiz Title' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe('Updated Quiz Title');
        });

        it('should NOT update the quiz if the user is not the owner', async () => {
            const otherUser = new User({ name: 'Other Teacher', email: `other${Date.now()}@test.com`, password: '123' });
            await otherUser.save();
            const otherToken = jwt.sign({ user: { id: otherUser.id } }, process.env.JWT_SECRET);

            const res = await request(app)
                .put(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', otherToken)
                .send({ title: 'Attempted Update' });

            expect(res.statusCode).toEqual(401);
            expect(res.body.msg).toBe('User not authorized');
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .put(`/api/quizzes/${quiz._id}`)
                .send({ title: 'No Token Update' });
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('DELETE /:quizId', () => {
        it('should delete the quiz if the user is the owner', async () => {
            const res = await request(app)
                .delete(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', teacherToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Quiz deleted');

            const foundQuiz = await Quiz.findById(quiz._id);
            expect(foundQuiz).toBeNull();

        });

        it('should NOT delete the quiz if the user is not the owner', async () => {
            const otherUser = new User({ name: 'Another Teacher', email: `another${Date.now()}@test.com`, password: '123' });
            await otherUser.save();
            const otherToken = jwt.sign({ user: { id: otherUser.id } }, process.env.JWT_SECRET);

            const res = await request(app)
                .delete(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', otherToken);

            expect(res.statusCode).toEqual(401);

            const foundQuiz = await Quiz.findById(quiz._id);
            expect(foundQuiz).not.toBeNull();
        });
    });
});
