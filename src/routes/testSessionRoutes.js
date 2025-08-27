const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { startQuizSession } = require('../controllers/testSessionController');


router.get('/start/:quizId', auth, startQuizSession);

module.exports = router;