const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');

exports.startQuizSession = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;
        const assignment = await Assignment.findOne({ quizId, studentId, status: { $ne: 'completed' } });
        if (!assignment) {
            return res.status(403).json({ msg: 'You are not assigned this quiz or have already completed it.' });
        }

        const quiz = await Quiz.findById(quizId).populate('questionPool');
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found.' });

        const pool = [...quiz.questionPool];
        for(let index = pool.length - 1; index > 0; index--){

            const randomIndex = Math.floor(Math.random() * (index + 1));
            let temp = pool[index];
            pool[index] = pool[randomIndex];
            pool[randomIndex] = temp;
        }

        const drawCount = quiz.numberOfQuestionsToDraw > 0 ? quiz.numberOfQuestionsToDraw : pool.length;
        const selectedQuestions = pool.slice(0, drawCount);

        const questionsForStudent = selectedQuestions.map(q => {
            const questionObject = q.toObject();

            if (questionObject.questionType === 'multiple-choice' && Array.isArray(questionObject.options)){
                for(let index = questionObject.options.length - 1; index > 0; index--){

                    const randomIndex = Math.floor(Math.random() * (index + 1));
                    let temp = questionObject.options[index];
                    questionObject.options[index] = questionObject.options[randomIndex];
                    questionObject.options[randomIndex] = temp;
                }
            }

            delete questionObject.answer;
            return questionObject;
        });

        assignment.status = 'in-progress';
        await assignment.save();

        res.json({
            quizTitle: quiz.title,
            timeLimit: quiz.timeLimit,
            questions: questionsForStudent
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};