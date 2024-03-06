const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const sendMail = require('../utils/emails')

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed')
            error.message = errors.array()[0].msg
            error.statusCode = 400
            throw error
        }
        const { email, password, name, role } = req.body
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email,
            password: hashedPassword,
            name,
            role
        })
        const newUser = await user.save()
        //sendMail.sendSignupMail(user.email, user._id)
        res.status(201).json({
            message: 'User created successfully',
            data: newUser
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}

exports.verifyUser = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const user = await User.findById(userId)
        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        }
        user.isActive = true
        const updatedUser = await user.save()
        res.status(200).json({
            message: 'User verified successfully',
            data: updatedUser
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            const error = new Error('Invalid email or password')
            error.statusCode = 404
            throw error
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            const error = new Error('Invalid password')
            error.statusCode = 404
            throw error
        }
        if (!user.isActive) {
            const error = new Error('User not verified')
            error.statusCode = 404
            throw error
        }
        const token = jwt.sign({ email: user.email, userId: user._id.toString(), role: user.role }, 'mynameislalitmittal', { expiresIn: '1h' })

        user.authToken = token
        await user.save()

        res.status(200).json({
            message: 'User logged in successfully',
            data: user
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}

exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error('User not found')
            error.statusCode = 404
            throw error
        }
        user.authToken = ''
        await user.save()
        res.status(200).json({
            message: 'User logged out successfully'
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}