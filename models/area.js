const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    slug: {
        type: String,
        require: true,
        trim: true,
        unique: true,
        index: true
    },
    code: {
        type: String
    },
    order: Number,
    description: {
        type: {},
        min: 200,
        max: 2000000
    }
})

module.exports = mongoose.model('Area', areaSchema);