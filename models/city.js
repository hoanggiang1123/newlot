const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
        unique: true,
        index: true
    },
    code: {
        type: String
    },
    description: {
        type: {},
        min: 200,
        max: 2000000
    },
    area: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        require: true
    }
})

module.exports = mongoose.model('City', citySchema);