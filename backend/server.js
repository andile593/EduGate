require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT || 5000, () => {
            console.log('Server is running on port', process.env.PORT || 5000);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });