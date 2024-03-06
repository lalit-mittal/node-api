const mongoose = require('mongoose')

const Schema = mongoose.Schema

/**
 * Represents the schema for a post in the database.
 * @typedef {Object} PostSchema
 * @property {string} title - The title of the post.
 * @property {string} content - The content of the post.
 * @property {string} image - The image associated with the post.
 * @property {string} createdBy - The ID of the user who created the post.
 * @property {Date} createdAt - The timestamp when the post was created.
 * @property {Date} updatedAt - The timestamp when the post was last updated.
 */
const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('Post', postSchema)