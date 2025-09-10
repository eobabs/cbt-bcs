const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getQuestionPerformance } = require('../controllers/analyticsController');

router.get('/quiz/:quizId/question-performance', auth, getQuestionPerformance);

module.exports = router;