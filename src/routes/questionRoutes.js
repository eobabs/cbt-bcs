const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");

const { createQuestion, uploadQuestions, updateQuestion, deleteQuestion } = require("../controllers/questionController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/', auth, createQuestion);
router.post('/upload', [auth, upload.single('questionsFile')], uploadQuestions);
router.put('/:questionId', auth, updateQuestion);
router.delete('/:questionId', auth, deleteQuestion);


module.exports = router;