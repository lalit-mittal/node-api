const mongoose = require('mongoose');

const Schema = mongoose.Schema

const postCommentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const PostComment = mongoose.model('PostComment', postCommentSchema);

module.exports = PostComment;
