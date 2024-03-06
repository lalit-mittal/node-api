const Post = require('../../models/postModel')
const User = require('../../models/userModel')

exports.getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().populate('createdBy', 'name email').exec()
        if (!posts) {
            const error = new Error('No posts found')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: 'Posts fetched successfully',
            data: posts
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId).populate('createdBy', 'name createdAt role').exec()
        if (!post) {
            const error = new Error('Post not found')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: 'Post fetched successfully',
            data: post
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}