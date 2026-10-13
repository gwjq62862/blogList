
import mongoose from "mongoose"


const blogSchema = mongoose.Schema({
    title: {
        type: String,
    required: true,

    },
    author: String,
    url: {
        required: true,
        type: String,

    },
    likes: {
        type: Number,
        default: 0
    },
})

export const Blog = mongoose.model('Blog', blogSchema)