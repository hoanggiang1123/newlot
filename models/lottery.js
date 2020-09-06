const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    subname: {
        type: String,
        trim: true
    },
    result: {
        db: {
            type: String,
            require: true
        },
        g1: {
            type: String,
            require: true
        },
        g2: {
            type: String,
            require: true
        },
        g3: {
            type: String,
            require: true
        },
        g4: {
            type: String,
            require: true
        },
        g5: {
            type: String,
            require: true
        },
        g6: {
            type: String,
            require: true
        },
        g7: {
            type: String,
            require: true
        },
        g8: {
            type: String
        }
    },
    area: {
        _id: String,
        name: String,
        slug: String,
        code: String,
        order: Number
    },
    city: {
        _id: String,
        name: String,
        slug: String,
        code: String
    },
    check: String,
    date: {
        type: Date
    },
    day: Number
});

module.exports = mongoose.model('Lottery', lotterySchema);