const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { submitQuiz } = require('../controllers/submissionController');


router.post('/quiz/:quizId/submit', auth, submitQuiz);

module.exports = router;