const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");

const { createQuestion, uploadQuestions } = require("../controllers/QuestionController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/', auth, createQuestion);
router.post('/upload', [auth, upload.single('questionsFile')], uploadQuestions);

module.exports = router;