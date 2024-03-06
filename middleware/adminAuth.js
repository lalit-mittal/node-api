const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const dotenv = require('dotenv')

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization')
        if (!authHeader) {
            const error = new Error('Not authenticated')
            error.statusCode = 401
            throw error
        }
        const token = authHeader.split(' ')[1]

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

            if (!decodedToken) {
                const error = new Error('Not authenticated')
                error.statusCode = 401
                throw error
            }
            const userToken = await User.findOne({ _id: decodedToken.userId, authToken: token })

            if (!userToken) {
                const error = new Error('Not authenticated')
                error.statusCode = 401
                throw error
            }
            if (decodedToken.role !== 'ADMIN' || userToken.authToken !== token) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

            req.userId = decodedToken.userId
            next()
        } catch (error) {
            error.message = 'Invalid Token'
            error.statusCode = 401
            next(error)
        }
    } catch (error) {
        error.statusCode = 500
        error.message = 'Internal Error'
        next(error)
    }


}