const express = require('express')
const app = express()

const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport')
const cookieSession = require('cookie-session')
require('./api/middleware/passport-setup')
const cors = require('cors')

const userRoutes = require('./api/routes/users')
const quizRoutes = require('./api/routes/quiz')
const examHistoryRoutes = require('./api/routes/examHistory')
const googleAuthRoutes = require('./api/routes/googleSignIn')

app.use(express.json())
app.use(cors())

app.use(userRoutes)
app.use(quizRoutes)
app.use(examHistoryRoutes)
app.use(googleAuthRoutes)

app.get("/", (req, res) => {
    res.status(200).end("welcome")
})


app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})


module.exports = app