const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/errorMiddleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');


const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many attempts, please try again after 15 minutes'
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth', require('./routes/authRoutes'));
app.use('/schools', require('./routes/schoolRoutes'));
app.use('/applications', require('./routes/applicationRoutes'));

app.use(errorMiddleware);

module.exports = app;