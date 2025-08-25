const request = require('supertest');
const app = require('/server');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Assignment = require('../models/Assignment');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';


describe('Assignments API', () => {
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
    });

    describe('Assigments API - Assign Quiz to Students - POST /api/assignments/quiz/:quizId/assign', () => {
        it('should assign quiz to students', async () => {
            const assignmentData = {
                studentIds: [studentUser._id],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            const res = await request(app)
                .post(`/api/assignments/quiz/${quiz._id}/assign`)
                .set('x-auth-token', teacherToken)
                .send(assignmentData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.msg).toContain('assignments created');
            expect(res.body.assignments).toHaveLength(1);
        });

        it('should handle duplicate assignments', async () => {
            const assignmentData = {
                studentIds: [studentUser._id],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            await request(app)
                .post(`/api/assignments/quiz/${quiz._id}/assign`)
                .set('x-auth-token', teacherToken)
                .send(assignmentData);

            const res = await request(app)
                .post(`/api/assignments/quiz/${quiz._id}/assign`)
                .set('x-auth-token', teacherToken)
                .send(assignmentData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Some assignments already exist and were skipped.');
        });
    });

    describe('Assignments API - Students check Assigned Quizzes - GET /api/assignments/student', () => {
        beforeEach(async () => {
            assignment = new Assignment({
                quizId: quiz._id,
                studentId: studentUser._id,
                assignedBy: teacherUser._id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            await assignment.save();
        });

        it('should get student assignments', async () => {
            const res = await request(app)
                .get('/api/assignments/student')
                .set('x-auth-token', studentToken);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});

