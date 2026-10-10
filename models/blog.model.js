
import mongoose from "mongoose"


const blogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})

export const Blog = mongoose.model('Blog', blogSchema)