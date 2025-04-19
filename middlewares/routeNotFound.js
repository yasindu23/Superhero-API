
const routeNotFound = (req, res) => {
    res.status(404).json({ success: false, msg: 'Page Not Found' })
}

module.exports = routeNotFound
