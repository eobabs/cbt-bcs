const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['assigned', 'in-progress', 'completed', 'overdue'],
        default: 'assigned'
    },
    dueDate: { type: Date },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
    assignedAt: { type: Date, default: Date.now }
});

AssignmentSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);