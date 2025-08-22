const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true
    },
    options: [{ type: String }],
    answer: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

QuestionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', QuestionSchema);