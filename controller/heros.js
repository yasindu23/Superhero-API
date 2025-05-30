const Hero = require('../model/hero')
const CustomError = require('../errors/customError')

const getAllHeroes = async (req, res, next) => {
    try {
        const { alignment, gender, sort, numerics, fields, search } = req.query

        let queryObject = {}

        if (search) {
            queryObject['data.name'] = {
                '$regex': search,
                '$options': 'i'
            }
        }

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
                '>>': '$eq', // equals do with the '>>'
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

            const regEx = /\b(<|>|>=|>>|<|<=)\b/;
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

        let task = Hero.find(queryObject)

        if (sort) {
            const validItems = [
                'heroId',
                '-heroId',
                'intelligence',
                '-intelligence',
                'speed',
                '-speed',
                'power',
                '-power',
                'durability',
                '-durability',
                'strength',
                '-strength',
                'combat',
                '-combat'
            ]

            const items = sort.split(',').map(element => {
                if (validItems.includes(element)) {
                    queryObject[`data.powerstats.${element}`] = {
                        $exists: true,
                        $ne: null,
                        $nin: ["null", "NaN"]
                    }

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
                        case 'durability':
                            return 'data.powerstats.durability'
                        case '-durability':
                            return '-data.powerstats.durability'
                        case 'strength':
                            return 'data.powerstats.strength'
                        case '-strength':
                            return '-data.powerstats.strength'
                        case 'combat':
                            return 'data.powerstats.combat'
                        case '-combat':
                            return '-data.powerstats.combat'
                    }
                }
            });

            if (!items.join(',')) {
                throw new CustomError(200, 'no items to sort')
            }
            task = task.find(queryObject).sort(items.join(','))
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
            task = task.select(fieldItems)
        }

        const pages = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;

        const heroes = await task
            .select('-_id')
            .skip((pages - 1) * limit)
            .limit(limit);

        res.status(200).json({ success: true, data: heroes })
    } catch (error) {
        return next(error)
    }
}

const getSingleHero = async (req, res, next) => {
    try {
        const id = req.params.id
        const hero = await Hero.findOne({ "heroId": Number(id) }).select('-_id')

        if (!hero)
            throw new CustomError(200, `No Hero with id ${id}`)

        res.status(200).json({ success: true, data: hero })
    } catch (error) {
        return next(error)
    }
}

const getRandomHero = async (req, res, next) => {
    try {
        const randomNumber = Math.floor(Math.random() * 730)
        const hero = await Hero.findOne({ "heroId": randomNumber }).select('-_id')
        res.status(200).json({ success: true, data: hero })
    } catch (error) {
        return next(error)
    }
}


module.exports = {
    getAllHeroes,
    getSingleHero,
    getRandomHero
}