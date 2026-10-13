import jwt from 'jsonwebtoken'
import { User } from '../models/user.models.js'
import { JWT_SECRET } from './config.js'


const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.substring(7)
    } else {
        request.token = null
    }
    next()
}


const userExtractor = async (request, response, next) => {

    try {
        if (!request.token) {
            return response.status(401).json({ error: 'token missing' })
        }

        const decodedToken = jwt.verify(request.token, JWT_SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' })
        }

        const user = await User.findById(decodedToken.id)
        if (!user) {
            return response.status(404).json({ error: 'user not found' })
        }

        request.user = user
        next()
    } catch (error) {
        return response.status(401).json({ error: 'token invalid or malformed' })
    }
}

export { tokenExtractor, userExtractor }