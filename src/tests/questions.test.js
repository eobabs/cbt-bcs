const request = require('supertest');
const mongoose = require('mongoose');
const app = require('/server');
const User = require('../models/User');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const Quiz = require("../models/Quiz");

process.env.JWT_SECRET = 'testsecret';


describe('Questions API', () => {
    let teacherToken;
    let teacherUser;
    let studentToken;
    let studentUser;
    let questionOne;
    let questionTwo;
    let quiz;

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

        questionOne = new Question({
            questionText: 'What is 2 + 2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            answer: '4',
            createdBy: teacherUser._id
        });
        await questionOne.save();

        questionTwo = new Question({
            questionText: 'The Capital of Nigeria is Abuja',
            questionType: 'true-false',
            options: ['True', 'False'],
            answer: 'True',
            createdBy: teacherUser._id
        });
        await questionTwo.save();
    });


    describe('Questions API - Create a Question - POST /api/questions', () => {
        it('should create a new question', async () => {
            const questionData = {
                questionText: 'What is the capital of Ekiti?',
                questionType: 'multiple-choice',
                options: ['Oye-Ekiti', 'Aramoko-Ekiti', 'Ado-Ekiti', 'Ekiti'],
                answer: 'Ado-Ekiti'
            };

            const res = await request(app)
                .post('/api/questions')
                .set('x-auth-token', teacherToken)
                .send(questionData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.questionText).toBe(questionData.questionText);
            expect(res.body.createdBy).toBe(teacherUser._id.toString());
        });

        it('should not create question without authentication', async () => {
            const questionData = {
                questionText: 'Unauthorized question',
                questionType: 'multiple-choice',
                options: ['A', 'B', 'C', 'D'],
                answer: 'A'
            };

            const res = await request(app)
                .post('/api/questions')
                .send(questionData);

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Questions API - Update a Question - PUT /api/questions/:questionId', () => {
        it('should update question by creator', async () => {
            const updateData = {
                questionText: 'Updated: What is 3 + 3?',
                answer: '6'
            };

            const res = await request(app)
                .put(`/api/questions/${questionOne._id}`)
                .set('x-auth-token', teacherToken)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.questionText).toBe(updateData.questionText);
        });

        it('should not update question by non-creator', async () => {
            const res = await request(app)
                .put(`/api/questions/${questionOne._id}`)
                .set('x-auth-token', studentToken)
                .send({ questionText: 'Unauthorized update' });

            expect(res.statusCode).toEqual(401);
            expect(res.body.msg).toBe('User not Authorized');
        });
    });

    describe('Questions API - Delete a Question - DELETE /api/questions/:questionId', () => {
        it('should delete question by creator', async () => {
            const res = await request(app)
                .delete(`/api/questions/${questionOne._id}`)
                .set('x-auth-token', teacherToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.msg).toBe('Question removed');

            const deletedQuestion = await Question.findById(questionOne._id);
            expect(deletedQuestion).toBeNull();
        });

        it('should not delete question by non-creator', async () => {
            const res = await request(app)
                .delete(`/api/questions/${questionOne._id}`)
                .set('x-auth-token', studentToken);

            expect(res.statusCode).toEqual(401);
            expect(res.body.msg).toBe('User not authorized');
        });
    });




});