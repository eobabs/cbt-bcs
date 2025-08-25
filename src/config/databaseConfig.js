const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        if (process.env.NODE_ENV !== 'test') {
            console.log('MongoDB connected successfully.');
        }
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        } else {
            throw error;
        }
    }
};

module.exports = connectDatabase;