const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createQuiz, getQuizzesByTeacher, getQuizById } = require('../controllers/quizController');


router.post('/', auth, createQuiz);
router.get('/', auth, getQuizzesByTeacher);
router.get('/:quizId', auth, getQuizById);


module.exports = router;