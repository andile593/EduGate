require('dotenv').config()

import express from "express";
import cors from "cors";

import schoolRoutes from './routes/schoolRoutes';
import applicationRoutes from './routes/applicationRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/', schoolRoutes)
app.use('/', applicationRoutes)

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB')
        app.listen(process.env.PORT, () => {
            console.log('Server is running on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error)
    })


// app.use(errorMiddleware);