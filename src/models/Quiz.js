const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String},
    questionPool: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    numberOfQuestionsToDraw: {type: Number, default: 0},
    questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    createdBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    timeLimit: {type: Number, default:0},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Quiz', QuizSchema);