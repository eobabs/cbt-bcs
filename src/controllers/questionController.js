const Question = require('../models/Question');

exports.createQuestion = async (req, res) => {
    const { questionText, questionType, options, answer } = req.body;

    try {
        const newQuestion = new Question({
            questionText,
            questionType,
            options,
            answer,
            createdBy: req.user.id
        });

        const question = await newQuestion.save();
        res.status(201).json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.uploadQuestions = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    try {
        const questionsToUpload = JSON.parse(req.file.buffer.toString());
        const questionsWithCreator = questionsToUpload.map(q => ({
            ...q,
            createdBy: req.user.id
        }));
        const insertedQuestions = await Question.insertMany(questionsWithCreator);

        res.status(201).json({
            msg: `${insertedQuestions.length} questions uploaded successfully`,
            questions: insertedQuestions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: Invalid JSON format or data.');
    }
};