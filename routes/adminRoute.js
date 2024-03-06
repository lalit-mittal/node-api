const router = require('express').Router()

const userAdminController = require('../controllers/admin/userAdminController')
const postAdminController = require('../controllers/admin/postAdminController')
const adminAuth = require('../middleware/adminAuth')

router.get('/getAllUsers', adminAuth, userAdminController.getAllUsers)

router.get('/getUser/:userId', adminAuth, userAdminController.getUser)

router.delete('/deleteUsers', adminAuth, userAdminController.deleteUsers)

router.patch('/updateUserStatus/:userId', adminAuth, userAdminController.updateUserStatus)

router.get('/getAllPosts', adminAuth, postAdminController.getAllPosts)

router.get('/getPost/:postId', adminAuth, postAdminController.getPost)

module.exports = router