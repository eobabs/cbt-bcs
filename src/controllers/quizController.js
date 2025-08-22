const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

exports.createQuiz = async (req, res) => {
    const { title, description, questionIds, timeLimit } = req.body;

    try {
        const newQuiz = new Quiz({
            title,
            description,
            questions: questionIds,
            timeLimit,
            createdBy: req.user.id
        });

        const quiz = await newQuiz.save();
        res.status(201).json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getQuizzesByTeacher = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        if (quiz.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};