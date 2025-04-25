require('dotenv').config()

const express = require('express')
const app = express()

const errorHandler = require('./middlewares/errorHandeller.js')
const notFound = require('./middlewares/routeNotFound.js')
const connectDb = require('./db/connectDb')

const cors = require('cors')

const heroRouter = require('./routes/heros.js')

app.use(cors({ origin: "*" }))

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use('/api/v1/heroes', heroRouter)

app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT || 8080
const start = async () => {
    await connectDb(process.env.MONGO_URL)
    app.listen(port, () => {
        console.log(`server is listening to port ${port}`)
    })
}
start()