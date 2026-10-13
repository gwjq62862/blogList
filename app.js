import express from 'express'
import mongoose from 'mongoose'
import { MongoDb_URI } from './utils/config.js'
import { info, error } from './utils/logger.js'
import blogsRouter from './controllers/bloig.controller.js'


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


app.use('/api/blogs', blogsRouter)

export default app