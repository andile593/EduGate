const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use('/auth', require('./routes/authRoutes'));
app.use('/schools', require('./routes/schoolRoutes'));
app.use('/applications', require('./routes/applicationRoutes'));

app.use(errorMiddleware);

module.exports = app;