const express = require('express')
const router = express.Router()

const {
    getRandomHero,
    getSingleHero,
    getAllHeroes
} = require('../controller/heros')

router.get('/', getAllHeroes)
router.get('/id/:id', getSingleHero)
router.get('/random', getRandomHero)

module.exports = router
