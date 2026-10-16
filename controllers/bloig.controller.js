import express from 'express'
import { Blog } from '../models/blog.model.js'
import { userExtractor } from '../utils/middleware.js'

const blogsRouter = express.Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: "token missing or invalid" })
  }
  const body = request.body
  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    await savedBlog.populate('user', { username: 1, name: 1 })
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    console.error(error)
  }

})



blogsRouter.delete('/:id', userExtractor, async (request, response,) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: "token missing or invalid" })
  }
  try {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }


    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'unauthorized to delete this blog' })
    }
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    console.log("erorr in deleting blog", error)
    response.status(500).json({ error: 'internal server error' })

  }
})


blogsRouter.put('/:id', async (request, response) => {

  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      blog,
      { returnDocument: 'after', runValidators: true, context: 'query' }
      //mongoose: the `new` option for `findOneAndUpdate()` and `findOneAndReplace()` is 
      //  deprecated. Use `returnDocument: 'after'` instead. (this comment is by moongoose )
    )

    if (updatedBlog) {
     await updatedBlog.populate('user', { username: 1, name: 1 })
      response.status(200).json(updatedBlog)
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
  } catch (error) {
    console.log("error in updating blog", error)
  }
})

export default blogsRouter