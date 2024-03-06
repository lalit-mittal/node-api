const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
const multer = require('multer')
const dotenv = require('dotenv').config()

const postRoute = require('./routes/postRoute');
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const db = require('./utils/db')

const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'image') {
            cb(null, 'images/postImages')
        }
        if (file.fieldname === 'profileImage') {
            cb(null, 'images/profileImages')
        }
    },
    filename: (req, file, cb) => {
        const file_name = file.originalname.replace(/[ ?]/g, "")
        cb(null, uuidv4() + '-' + file_name)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})


app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/feeds', postRoute)
app.use('/auth', authRoute)
app.use('/admin', adminRoute)


app.use((error, req, res, next) => {
    const status = error.statusCode || 500
    const message = error.message || 'Internal error'
    res.status(status).json({
        message,
        data: []
    })
})

db.connectDB()
    .then(result => {
        console.log('CONNECTED')
        app.listen(process.env.PORT)
    }).catch(err => {
        console.log(err)
    })
