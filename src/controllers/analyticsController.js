const Submission = require('../models/Submission');
const Question = require('../models/Question');
const mongoose = require('mongoose');

exports.getQuestionPerformance = async (req, res) => {
    try {
        const { quizId } = req.params;

        const performanceData = await Submission.aggregate([
            { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },

            {$project: { answers: { $objectToArray: "$answers" } } },
            { $unwind: "$answers" },

            {
                $lookup: {
                    from: Question.collection.name,
                    localField: "answers.k",
                    foreignField: "_id",
                    as: "questionDetails"
                }
            },
            { $unwind: "$questionDetails" },

            {
                $group: {
                    _id: "$questionDetails._id",
                    questionText: { $first: "$questionDetails.questionText" },
                    totalAttempts: { $sum: 1 },
                    correctAttempts: {
                        $sum: {
                            $cond: [{ $eq: ["$answers.v", "$questionDetails.answer"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    questionId: "$_id",
                    questionText: 1,
                    totalAttempts: 1,
                    correctAttempts: 1,
                    correctPercentage: {
                        $round: [{ $multiply: [{ $divide: ["$correctAttempts", "$totalAttempts"] }, 100] }, 2]
                    }
                }
            },

            { $sort: { correctPercentage: 1 } }
        ]);

        res.json(performanceData);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


