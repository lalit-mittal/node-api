const { validationResult } = require('express-validator')

const Post = require('../models/postModel')
const PostComment = require('../models/postCommentModel')
const clearImage = require('../utils/deleteImage')

exports.getPosts = async (req, res, next) => {
    try {
        // const posts = await Post.find().populate('createdBy', 'name createdAt role').exec()
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $lookup: {
                    from: 'postComment',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'comments'
                }
            },
            {
                $unwind: '$comments'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.createdBy',
                    foreignField: '_id',
                    as: 'comments.userDetails'
                }
            },
            {
                $unwind: '$comments.userDetails'
            },
            {
                $group: {
                    _id: '$_id',
                    userDetails: { $first: '$userDetails' },
                    title: { $first: '$title' },
                    content: { $first: '$content' },
                    comments: { $push: '$comments' }
                }
            }
        ])

        // const posts = await Post.aggregate([{
        //     $lookup: {
        //         from: 'postComment',
        //         localField: '_id',
        //         foreignField: 'postId',
        //         as: 'comments'
        //     },

        // }])
        console.log(posts);
        res.status(200).json({
            message: 'Posts fetched successfully',
            data: posts
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.getUserPost = async (req, res, next) => {
    try {
        const posts = await Post.find({ createdBy: req.userId }).populate('createdBy', 'name createdAt').exec()
        res.status(200).json({
            message: 'Posts fetched successfully',
            data: posts
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed')
            error.message = errors.array()[0].msg
            error.statusCode = 422
            throw error
        }

        if (!req.file) {
            const error = new Error('Please upload valid image file')
            error.statusCode = 422
            throw error
        }
        const image = req.file.path.replace("\\", "/")
        const { title, content } = req.body

        const post = new Post({ title, content, createdBy: req.userId, image })
        const data = await post.save()
        res.status(201).json({
            message: 'Post created',
            data
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        if (req.file) {
            clearImage(req.file.path.replace("\\", "/"));
        }
        next(error)
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if (post.createdBy.toString() !== req.userId.toString()) {
            const error = new Error('Unautherized Access')
            error.statusCode = 401
            throw error
        }
        if (!post) {
            const error = new Error('Post not found')
            error.statusCode = 404
            throw error
        }
        res.status(200).json({
            message: 'Data found',
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

exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed')
            error.message = errors.array()[0].msg
            error.statusCode = 422
            throw error
        }
        const { title, content } = req.body
        let image
        if (req.file) {
            image = req.file.path.replace("\\", "/")
        }
        if (!image) {
            const error = new Error('Image Not found')
            error.statusCode = 422
            throw error
        }

        const post = await Post.find({ _id: postId, createdBy: req.userId })
        if (post.length === 0) {
            const error = new Error('Unautherized Access')
            error.statusCode = 401
            throw error
        }
        if (image !== post[0].image) {
            clearImage(post[0].image)
        }
        post[0].title = title
        post[0].content = content
        post[0].image = image
        const updatedPost = await post[0].save()

        res.status(200).json({
            message: 'Post updated',
            data: updatedPost
        })
    } catch (error) {
        console.log(error);
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        if (req.file) {
            clearImage(req.file.path.replace("\\", "/"));
        }
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.find({ _id: postId, createdBy: req.userId })
        if (post.length === 0) {
            const error = new Error('Unautherized Access')
            error.statusCode = 401
            throw error
        }
        clearImage(post[0].image)
        await Post.findByIdAndDelete(postId)
        res.status(200).json({
            message: 'Post deleted successfully',
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

exports.addComment = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed')
            error.message = errors.array()[0].msg
            error.statusCode = 422
            throw error
        }
        const { comment, postId, userId } = req.body
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error('Post not found')
            error.statusCode = 404
            throw error
        }
        const postComment = new PostComment({ comment, postId, userId })
        const data = await postComment.save()
        res.status(201).json({
            message: 'Comment added',
            data
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}

exports.getComments = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const comments = await PostComment.find({ postId }).populate('userId', 'name').exec()
        res.status(200).json({
            message: 'Comments fetched successfully',
            data: comments
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error)
    }
}

exports.deleteComment = async (req, res, next) => {
    const commentId = req.params.commentId
    try {
        const comment = await Post.findById(commentId)
        if (!comment) {
            const error = new Error('Comment not found')
            error.statusCode = 404
            throw error
        }
        if (comment.userId.toString() !== req.userId.toString()) {
            const error = new Error('Unautherized Access')
            error.statusCode = 401
            throw error
        }
        await PostComment.findByIdAndDelete(commentId)
        res.status(200).json({
            message: 'Comment deleted successfully',
            data: comment
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}

exports.editComment = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed')
            error.message = errors.array()[0].msg
            error.statusCode = 422
            throw error
        }
        const commentId = req.params.commentId
        const { comment } = req.body
        const postComment = await PostComment.findById(commentId)
        if (!postComment) {
            const error = new Error('Comment not found')
            error.statusCode = 404
            throw error
        }
        if (postComment.userId.toString() !== req.userId.toString()) {
            const error = new Error('Unautherized Access')
            error.statusCode = 401
            throw error
        }
        postComment.comment = comment
        const data = await postComment.save()
        res.status(200).json({
            message: 'Comment updated',
            data
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
            error.message = 'Internal error'
        }
        next(error)
    }
}