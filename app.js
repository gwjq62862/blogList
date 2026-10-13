import express from 'express'
import mongoose from 'mongoose'
import { MongoDb_URI } from './utils/config.js'
import { info, error } from './utils/logger.js'
import blogsRouter from './controllers/bloig.controller.js'
import usersRouter from './controllers/user.controller.js'
import { tokenExtractor } from './utils/middleware.js'


const app = express()

info('connecting to MongoDB...')

const connectToDB = async () => {
  try {
    await mongoose.connect(MongoDb_URI, { family: 4 })
    info('connected to MongoDB successfully')
  } catch (err) {
    error('error connecting to MongoDB:', err.message)
  }
}

connectToDB()
app.use(express.json())
app.use(tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users',usersRouter)

export default app