const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createQuiz, getQuizzesByTeacher, getQuizById, updateQuiz, deleteQuiz } = require('../controllers/quizController');


router.post('/', auth, createQuiz);
router.get('/', auth, getQuizzesByTeacher);
router.get('/:quizId', auth, getQuizById);
router.put('/:quizId', auth, updateQuiz);
router.delete('/:quizId', auth, deleteQuiz);

module.exports = router;