import bcrypt from 'bcrypt'
import express from 'express'
import { User } from '../models/user.models.js'
import { JWT_SECRET } from '../utils/config.js'
import jwt from 'jsonwebtoken'

const usersRouter = express.Router()


usersRouter.post('/register', async (req, res) => {
    const { username, password, name } = req.body

    if (!username || !password || username.length < 3 || password.length < 3) {
        return res.status(400).json({
            error: 'username and password must be at least 3 characters long'
        })
    }

    const exsistingUserName = await User.findOne({ username })

    if (exsistingUserName) {
        res.status(400).json({
            message: " username is already taken"
        })
        return
    }


    const saltRounds = 10;


    const hashedPassword = await bcrypt.hash(password, saltRounds);



    const newUser = new User({
        username: username,
        password: hashedPassword,//in prod it's better not to return password
        name: name
    })

    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (error) {
        console.log(error)
    }




})





usersRouter.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({
            message: "username and password must sent"
        })
        return
    }


    const user = await User.findOne({ username })
    if (!user) {
        res.status(401).json({ message: "invalid credential" })
        return
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        res.status(401).json({
            message: "invalid credential"
        })
        return
    }

    const payload = {
        username: username,
        id: user.id
    };

    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' } //  expires in 7day
    );




    return res.status(200).json({
        success: true,
        token: token,
        username: user.username,
        name: user.name
    });

})

export default usersRouter