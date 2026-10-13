import express from 'express'
import { Blog } from '../models/blog.model.js'

const blogsRouter = express.Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    console.error(error)
  }

})



blogsRouter.delete('/:id', async (request, response,) => {

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    console.log("erorr in deleting blog", error)
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
      response.status(200).json(updatedBlog)
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
  } catch (error) {
    console.log("error in updating blog", error)
  }
})

export default blogsRouter