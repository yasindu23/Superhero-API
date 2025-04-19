const Hero = require('../model/hero')
const CustomError = require('../errors/customError')

const getAllHeros = async (req, res) => {
    try {
        const { alignment, gender, sort, numerics, fields } = req.query

        let queryObject = {}

        if (alignment) {
            queryObject['data.biography.alignment'] = alignment
        }
        if (gender) {
            queryObject['data.appearance.gender'] = `${gender.toString().substring(0, 1).toUpperCase() + gender.slice(1)}`
        }

        if (numerics) {
            const operatorMap = {
                '>': '$gt',
                '>=': '$gte',
                '=': '$eq',
                '<': '$lt',
                '<=': '$lte',
            };
            const options = [
                'speed',
                'power',
                'intelligence',
                'strength',
                'durability',
                'combat'
            ];

            const regEx = /\b(<|>|>=|=|<|<=)\b/g;
            numerics.split(',').forEach((e) => {
                const filteredValue = e.replace(regEx, (match) => `-${operatorMap[match]}-`)
                const [field, simble, value] = filteredValue.split('-')

                if (options.includes(field)) {
                    let currentField;

                    switch (field) {
                        case 'speed':
                            currentField = 'data.powerstats.speed'
                            break;
                        case 'intelligence':
                            currentField = 'data.powerstats.intelligence'
                            break;
                        case 'power':
                            currentField = 'data.powerstats.power'
                            break;
                        case 'strength':
                            currentField = 'data.powerstats.strength'
                            break;
                        case 'durability':
                            currentField = 'data.powerstats.durability'
                            break;
                        case 'combat':
                            currentField = 'data.powerstats.combat'
                            break;
                        default:
                            currentField = ''
                    }

                    queryObject[currentField] = { [simble]: Number(value) }
                }
            })
        }

        let taks = Hero.find(queryObject)

        if (sort) {
            const validItems = [
                'heroId',
                '-heroId',
                'intelligence',
                '-intelligence',
                'speed',
                '-speed',
                'power',
                '-power'
            ]

            // remove all null values
            sort.split(',').forEach((element) => {
                if (validItems.includes(element))
                    queryObject[`data.powerstats.${element}`] = { $ne: NaN }
            })

            const items = sort.split(',').map(element => {
                if (validItems.includes(element)) {
                    queryObject[element] = { $ne: null }

                    switch (element) {
                        case 'heroId':
                            return 'heroId'
                        case '-heroId':
                            return '-heroId'
                        case 'intelligence':
                            return 'data.powerstats.intelligence'
                        case '-intelligence':
                            return '-data.powerstats.intelligence'
                        case 'speed':
                            return 'data.powerstats.speed'
                        case '-speed':
                            return '-data.powerstats.speed'
                        case 'power':
                            return 'data.powerstats.power'
                        case '-power':
                            return '-data.powerstats.power'
                    }
                }
            });

            if (!items.join(',')) {
                throw new CustomError(404, 'no items to sort')
            }
            taks = taks.sort(items.join(','))
        }

        if (fields) {
            const options = [
                'powerstats',
                'biography',
                'appearance',
                'work',
                'connections',
                'image'
            ]

            const setupedItems = fields.split(',').map((e) => {
                if (options.includes(e)) {
                    switch (e) {
                        case 'powerstats':
                            return 'data.powerstats'
                        case 'biography':
                            return 'data.biography'
                        case 'appearance':
                            return 'data.appearance'
                        case 'work':
                            return 'data.work'
                        case 'connections':
                            return 'data.connections'
                        case 'image':
                            return 'data.image'
                        default:
                            return ''
                    }
                }
            })

            const fieldItems = setupedItems.join(' ')
            taks = taks.select(fieldItems)
        }

        const pages = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const heros = await taks
            .select('-_id')
            .skip((pages - 1) * limit)
            .limit(limit);

        res.status(200).json({ heroes: heros })
    } catch (error) {
        return next(error)
    }
}

const getSingleHero = async (req, res) => {
    try {
        const id = req.params.id
        const hero = await Hero.findOne({ "heroId": Number(id) }).select('-_id')

        if (!hero)
            throw new CustomError(404, `No Hero with id ${id}`)

        res.status(200).json({ heroes: hero })
    } catch (error) {
        return next(error)
    }
}

const searchHero = async (req, res) => {
    try {
        const searchResult = req.query.name
        const results = await Hero.find({
            'data.name': {
                '$regex': searchResult,
                '$options': 'i'
            }
        }).select('-_id')

        res.status(200).json({ heroes: results })
    } catch (error) {
        return next(error)
    }
}

const getRandomHero = async (req, res) => {
    const randomNumber = Math.floor(Math.random() * 730)
    const hero = await Hero.findOne({ "heroId": randomNumber }).select('-_id')
    res.status(200).json({ heroes: hero })
}


module.exports = {
    getAllHeros,
    getSingleHero,
    searchHero,
    getRandomHero
}