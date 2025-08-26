const Question = require('../models/Question');
const csv = require('csv-parser')
const stream = require('stream');

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

    const fileType = req.body.fileType || 'json';
    const questionsToUpload = [];

    try {
        if (fileType === 'json') {
            const extractedData = JSON.parse(req.file.buffer.toString());
            if (!Array.isArray(parsedData)) {
                throw new Error('Invalid JSON format: The file must contain an array of questions.');
            }
            questionsToUpload.push(...extractedData);
        } else if(fileType === 'csv') {
            await new Promise((resolve, reject) => {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(req.file.buffer);

                bufferStream
                    .pipe(csv())
                    .on('data', (row) => {
                        const question = {
                            questionText: row.questionText,
                            questionType: row.questionType,
                            answer: row.answer,
                            options: row.options ? row.options.split(',').map(opt => opt.trim()) : []
                        };
                        questionsToUpload.push(question);
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            return res.status(400).json({ msg: 'Unsupported file type. Please use JSON or CSV.' });
        }

        if (questionsToUpload.length === 0) {
            return res.status(400).json({ msg: 'No questions found in the uploaded file.' });
        }
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
        res.status(500).send('Server Error: The file could not be processed. Please check the format and data.');
    }
};

exports.updateQuestion = async (req, res) => {
    try{
        let question = await Question.findById(req.params.questionId);
        if (!question) return res.status(404).json({ msg: 'Question not found' });

        if(question.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not Authorized' });
        }
        question = await Question.findByIdAndUpdate(req.params.questionId, { $set: req.body }, { new: true });
        res.json(question);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) return res.status(404).json({ msg: 'Question not found' });

        if (question.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Question.findByIdAndDelete(req.params.questionId);
        res.json({ msg: 'Question removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

