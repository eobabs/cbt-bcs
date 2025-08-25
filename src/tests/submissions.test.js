const request = require('supertest');
const mongoose = require('mongoose');
const app = require('/server');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Assignment = require('../models/Assignment');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';


describe('Submissions API', () => {
    let teacherToken;
    let teacherUser;
    let studentToken;
    let studentUser;
    let questionOne;
    let questionTwo;
    let quiz;
    let assignment;

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

        quiz = new Quiz({
            title: 'Test Quiz',
            description: 'A test quiz for students',
            questions: [questionOne._id, questionTwo._id],
            createdBy: teacherUser._id,
            timeLimit: 30
        });
        await quiz.save();


    assignment = new Assignment({
        quizId: quiz._id,
        studentId: studentUser._id,
        assignedBy: teacherUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await assignment.save();

});

    describe('Submissions API - Submit Quiz by Students - POST /api/submissions/quiz/:quizId/submit', () => {
        it('should submit quiz answers and calculate score', async () => {
            const submissionData = {
                answers: {
                    [questionOne._id]: '4',
                    [questionTwo._id]: 'True'
                },
                startedAt: new Date()
            };

            const res = await request(app)
                .post(`/api/submissions/quiz/${quiz._id}/submit`)
                .set('x-auth-token', studentToken)
                .send(submissionData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.msg).toBe('Quiz submitted successfully!');
            expect(res.body.score).toBe(100);
            expect(res.body).toHaveProperty('submissionId');

            const updatedAssignment = await Assignment.findOne({
                quizId: quiz._id,
                studentId: studentUser._id
            });
            expect(updatedAssignment.status).toBe('completed');
        });

        it('should calculate partial score for partially correct answers', async () => {
            const submissionData = {
                answers: {
                    [questionOne._id]: '8',
                    [questionTwo._id]: 'True'
                },
                startedAt: new Date()
            };

            const res = await request(app)
                .post(`/api/submissions/quiz/${quiz._id}/submit`)
                .set('x-auth-token', studentToken)
                .send(submissionData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.score).toBe(50);
        });

        it('should handle non-existent quiz', async () => {
            const fakeQuizId = new mongoose.Types.ObjectId();
            const submissionData = {
                answers: {},
                startedAt: new Date()
            };

            const res = await request(app)
                .post(`/api/submissions/quiz/${fakeQuizId}/submit`)
                .set('x-auth-token', studentToken)
                .send(submissionData);

            expect(res.statusCode).toEqual(404);
        });
    });

});

