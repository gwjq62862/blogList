
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from './app.js'
import { Blog } from './models/blog.model.js'
const api = supertest(app)

const initialBlogs = [
    {
        id: "1",
        title: 'First test blog',
        author: 'Hein',
        url: 'https://example.com/1',
        likes: 5
    },
    {
        id: "2",
        title: 'Second test blog',
        author: 'Khali',
        url: 'https://example.com/2',
        likes: 10
    }
]
beforeEach(async () => {

    await Blog.deleteMany({})

    await Blog.insertMany(initialBlogs)
})

let mongoServer

before(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }
    await mongoose.connect(uri)
})

after(async () => {
    await mongoose.connection.close()
    await mongoServer.stop()
})
test('testing blog return with jsonformat and correct amount', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /json/)

    assert.strictEqual(Array.isArray(response.body), true, " data should be array")

    if (response.length > 0) {
        const firstBlog = response.body[0]
        assert.ok(firstBlog.id, 'Blog should have id property')
        assert.strictEqual(firstBlog._id, undefined, 'Blog should not have _id property')
    }

})




test('testing blog creation is ok', async () => {
    const body = {
        id: "3",
        title: 'third test blog',
        author: 'Khali3',
        url: 'https://example.com/3',
        likes: 0
    }
    const res = await api
        .post('/api/blogs')
        .send(body)
        .expect(201)
        .expect('Content-Type', /json/)

    const blogCount = await Blog.countDocuments({})
    assert.strictEqual(blogCount, initialBlogs.length + 1)

    assert.strictEqual(res.body.likes, 0)



})

test('if blog creation url or title is missing  error must return', async () => {
    const body = {
        author: 'Khali3',
        url: 'https://example.com/3',
        likes: 0
    }
    const res = await api
        .post('/api/blogs')
        .send(body)
        .expect(400)


})

test('if blog creation url is missing  error must return', async () => {
    const body = {
        title: 'third test blog',
        author: 'Khali3',
        likes: 0
    }
    const res = await api
        .post('/api/blogs')
        .send(body)
        .expect(400)


})


test('testing blog deletion', { only: true }, async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogCount = await Blog.countDocuments({})
    assert.strictEqual(blogCount, initialBlogs.length - 1)



})


test("testing blog updating", { only: true }, async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const body = {
        likes: blogToUpdate.likes + 1
    }

    const res = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(body)
        .expect(200)

    assert.strictEqual(res.body.likes, blogToUpdate.likes + 1)

})