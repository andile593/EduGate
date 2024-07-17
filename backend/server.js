require('dotenv').config()

const express = require("express")
const cors = require("cors")
const mongoose = require('mongoose')


const schoolRoutes = require('./routes/schoolRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/', schoolRoutes)
app.use('/', applicationRoutes)

mongoose.connect(process.env.MONGODB_URI)
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