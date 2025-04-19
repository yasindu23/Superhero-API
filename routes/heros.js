const express = require('express')
const router = express.Router()

const {
    getAllHeros,
    getRandomHero,
    getSingleHero,
    searchHero
} = require('../controller/heros')

router.get('/', getAllHeros)
router.get('/id/:id', getSingleHero)
router.get('/random', getRandomHero)
router.get('/search', searchHero)

module.exports = router
