const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/databaseConfig');

dotenv.config();

const app = express();

connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/questions', require('./src/routes/questionRoutes'));
app.use('/api/quizzes', require('./src/routes/quizRoutes'));
app.use('/api/assignments', require('./src/routes/assignmentRoutes'));
app.use('/api/submissions', require('./src/routes/submissionRoutes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));