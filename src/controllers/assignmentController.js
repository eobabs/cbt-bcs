const Assignment = require('../models/Assignment');

exports.assignQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { studentIds, dueDate } = req.body;

    try {
        const assignments = studentIds.map(studentId => ({
            quizId,
            studentId,
            dueDate,
            assignedBy: req.user.id
        }));

        const createdAssignments = await Assignment.insertMany(assignments, { ordered: false });
        res.status(201).json({ msg: `${createdAssignments.length} assignments created.`, assignments: createdAssignments });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Some assignments already exist and were skipped.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};



exports.getStudentAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ studentId: req.user.id })
            .populate('quizId', 'title description timeLimit').sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

