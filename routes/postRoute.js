const router = require('express').Router()
const { body } = require('express-validator')

const postController = require('../controllers/postController')
const isAuth = require('../middleware/is-auth')
const User = require('../models/userModel')
const Post = require('../models/postModel')

//Get all the posts
router.get('/posts', isAuth, postController.getPosts)

router.get('/post', isAuth, postController.getUserPost)

//Create a new post
router.post('/post', isAuth, [
    body('title').trim().isLength({ max: 10, min: 5 }).withMessage('Title must be between 5 to 10 characters'),
    body('content').trim().isLength({ min: 5, max: 200 }).withMessage('Content must be between 5 to 200 characters')
], postController.createPost)

//Get Single post
router.get('/post/:postId', isAuth, postController.getPost)

//Update post
router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({ max: 10, min: 5 }).withMessage('Title must be between 5 to 10 characters'),
    body('content').trim().isLength({ min: 5, max: 200 }).withMessage('Content must be between 5 to 200 characters')
], postController.updatePost)

//Delete Post
router.delete('/post/:postId', isAuth, postController.deletePost)

//Add comment on the post
router.post('/post/comment/', isAuth, [
    body('comment').trim().isLength({ min: 1, max: 100 }).withMessage('Comment must be between 1 to 100 characters'),
    body('userId').trim().notEmpty().withMessage('User Id is required').custom(async (value, { req }) => {
        const user = await User.findById(value)
        if (!user) {
            throw new Error('User not found')
        }
    }),
    body('postId').trim().notEmpty().withMessage('Post Id is required').custom(async (value, { req }) => {
        const post = await Post.findById(value)
        if (!post) {
            throw new Error('Post not found')
        }
    })
], postController.addComment)

//Get all comments on the post
router.get('/post/comment/:postId', isAuth, postController.getComments)

//Delete comment on the post
router.delete('/post/comment/:commentId', isAuth, postController.deleteComment)

//edit comment on the post
router.put('/post/comment/:commentId', isAuth, [
    body('comment').trim().isLength({ min: 1, max: 100 }).withMessage('Comment must be between 1 to 100 characters'),
], postController.editComment)

module.exports = router