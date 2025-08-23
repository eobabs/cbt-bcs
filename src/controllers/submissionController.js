const Submission =require('../models/Submission');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');

exports.submitQquiz = async (req, res) => {
    const { quizId } = req.params;
    const { answers, startedAt } = req.body;

    try{
        const quiz = await Quiz.findById(quizId).populate('questions');
        if(!quiz) return res.status(404).send('No such quiz');

        let score = 0;
        let correctAnswers = 0;
        const studentAnswers = new Map(Object.entries(answers));

        quiz.questions.forEach(question => {
            if (studentAnswers.has(question._id.toString()) && studentAnswers.get(question._id.toString()) == question.answer) {
                correctAnswers++;
            }
        });

        score = (correctAnswers / quiz.questions.length) * 100;

        const newSubmission = new Submission({
            quizId,
            studentId: req.user.id,
            answers : studentAnswers,
            score: score.toFixed(2),
            startedAt
        });

        const submission = await newSubmission.save();

        await Assignment.findOneAndUpdate(
            { quizId, studentId: req.user.id },
            { status: 'completed', submissionId: submission._id }
        );

        res.status(201).json({ msg: 'Quiz submitted successfully!', submissionId: submission._id, score: submission.score });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};