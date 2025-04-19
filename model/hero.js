const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    heroId : {
        type : Number,
        unique : true,
        required : [true, 'no heroId provided']
    },
    data : {
        type : Object,
        required : true
    }
})

module.exports = mongoose.model('HeroStore', schema)