const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { assignQuiz, getStudentAssignments } = require('../controllers/assignmentController');

router.post('/quiz/:quizId/assign', auth, assignQuiz);

router.get('/student', auth, getStudentAssignments);

module.exports = router;