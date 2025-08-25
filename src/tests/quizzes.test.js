const request = require('supertest');
const app = require('/server');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';


describe('Quizzes API', () => {
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

        quiz = new Quiz({
            title: 'Test Quiz',
            description: 'A test quiz for students',
            questions: [questionOne._id, questionTwo._id],
            createdBy: teacherUser._id,
            timeLimit: 30
        });
        await quiz.save();
    });

    describe('Quizzes API - Creation of Quiz - POST /api/quizzes', () => {
        it('should create a new quiz', async () => {
            const quizData = {
                title: 'New Quiz',
                description: 'A brand new quiz',
                questionIds: [questionOne._id, questionTwo._id],
                timeLimit: 45
            };

            const res = await request(app)
                .post('/api/quizzes')
                .set('x-auth-token', teacherToken)
                .send(quizData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toBe(quizData.title);
            expect(res.body.createdBy).toBe(teacherUser._id.toString());
        });

        it('should not create quiz without authentication', async () => {
            const quizData = {
                title: 'Unauthorized Quiz',
                description: 'Should not be created'
            };

            const res = await request(app)
                .post('/api/quizzes')
                .send(quizData);

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Quizzes API - Retrieve All Quizzes - GET /api/quizzes', () => {
        it('should get quizzes by teacher', async () => {
            const res = await request(app)
                .get('/api/quizzes')
                .set('x-auth-token', teacherToken);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('Quizzes API - Retrieve Single Quiz - GET /api/quizzes/:quizId', () => {
        it('should get quiz by id for creator', async () => {
            const res = await request(app)
                .get(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', teacherToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body._id).toBe(quiz._id.toString());
        });

        it('should not get quiz by id for non-creator', async () => {
            const res = await request(app)
                .get(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', studentToken);

            expect(res.statusCode).toEqual(401);
            expect(res.body.msg).toBe('User not authorized');
        });
    });

    describe('Quizzes API - Update Quiz - PUT /api/quizzes/:quizId', () => {
        it('should update quiz by creator', async () => {
            const updateData = { title: 'Updated Quiz Title' };

            const res = await request(app)
                .put(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', teacherToken)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe(updateData.title);
        });

        it('should not update quiz by non-creator', async () => {
            const otherTeacher = await createUserAndToken({
                name: 'Other Teacher',
                email: `other${Date.now()}@test.com`,
                password: '123',
                role: 'teacher'
            });

            const res = await request(app)
                .put(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', otherTeacher.token)
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

    describe('Quizzes API - Delete Quiz - DELETE /api/quizzes/:quizId', () => {
        it('should delete quiz by creator', async () => {
            const res = await request(app)
                .delete(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', teacherToken);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Quiz deleted');
            const deletedQuiz = await Quiz.findById(quiz._id);
            expect(deletedQuiz).toBeNull();
        });

        it('should not delete quiz by non-creator', async () => {
            const otherTeacher = await createUserAndToken({
                name: 'Another Teacher',
                email: `another${Date.now()}@test.com`,
                password: '123',
                role: 'teacher'
            });

            const res = await request(app)
                .delete(`/api/quizzes/${quiz._id}`)
                .set('x-auth-token', otherTeacher.token);

            expect(res.statusCode).toEqual(401);

            const foundQuiz = await Quiz.findById(quiz._id);
            expect(foundQuiz).not.toBeNull();
        });
    });

});

