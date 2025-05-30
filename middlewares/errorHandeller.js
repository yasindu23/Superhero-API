const CustomErrorHandler = require('../errors/customError')

const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomErrorHandler) {
        console.log(`custom error ${err.message}`)
        return res.status(err.stateCode).json({ success: false, data: err.message })
    }

    console.log(`system error ${err.message}`)
    res.status(200).json({ success: false, data: err.message })
}

module.exports = errorHandler
