
import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from './app.js'
import { Blog } from './models/blog.model.js'
import bcrypt from 'bcrypt'
import { User } from './models/user.models.js'
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
const initialUsers = [
    {
        username: 'root',
        name: 'Super Admin',
        password: 'sekret'
    },
    {
        username: 'khali',
        name: 'Khali Hein',
        password: 'mysecretpassword'
    }
]
beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const savedUsers = []
    for (const user of initialUsers) {
        const passwordHash = await bcrypt.hash(user.password, 10)
        const newUser = new User({
            username: user.username,
            name: user.name,
            password: passwordHash
        })
        const saved = await newUser.save()
        savedUsers.push(saved)
    }





    const blogsToInsert = initialBlogs.map(blog => ({
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes,
        user: savedUsers[0]._id
    }))

    await Blog.insertMany(blogsToInsert)
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


test('testing blog deletion', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogCount = await Blog.countDocuments({})
    assert.strictEqual(blogCount, initialBlogs.length - 1)



})


test("testing blog updating", async () => {
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




test("testing user registering", async () => {
    const newUserData = {
        username: "Khali",
        password: "7860",
        name: "khali hein way phyo"
    }

    const res = await api
        .post('/api/users/register')
        .send(newUserData)
        .expect(201)
        .expect('Content-Type', /json/)

    assert.strictEqual(res.body.username, newUserData.username)
    assert.strictEqual(res.body.name, newUserData.name)


    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, initialUsers.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert.strictEqual(usernames.includes(newUserData.username), true)
})



test('testing user login', async () => {
    const user = {
        username: 'root',
        password: "sekret",
    }
    const res = await api
        .post('/api/users/login')
        .send(user)
        .expect(200)
        .expect('Content-Type', /json/)

    assert.ok(res.body.token)

    assert.strictEqual(res.body.username, user.username)

})


test('a valid blog can be added when token is provided', { only: true }, async () => {

    const loginResponse = await api
        .post('/api/users/login')
        .send({ username: 'root', password: 'sekret' })

    const token = loginResponse.body.token

    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert.strictEqual(titles.includes('Type wars'), true)
})

test('blog cannot be added if token is missing', { only: true }, async () => {
    const newBlog = {
        title: "Unauthorized blog",
        author: "Hacker",
        url: "http://hacker.com",
        likes: 0,
    }

    const response = await api
        .post('/api/blogs')

        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /json/)

    assert.ok(response.body.error)
})

