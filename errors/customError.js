

class CustomErrorHandeller extends Error {
    constructor(stateCode, msg) {
        super(msg)
        this.stateCode = stateCode
    }
}

module.exports = CustomErrorHandeller