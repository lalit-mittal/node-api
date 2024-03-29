const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'USER',
        required: true
    },
    isActive: {
        type: Boolean,
        default: false,
        required: true
    },
    authToken: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)