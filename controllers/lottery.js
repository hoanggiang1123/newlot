const Lottery = require('../models/lottery');

exports.list = (req, res) => {
    Lottery.find({}).limit(10).exec((err, lotteries) => {
        if(err && !lotteries) {
            return res.status(400).json({
                err: 'Not Found'
            })
        }
        res.json(lotteries)
    })
}

exports.create = (req, res) => {
    const { name, result, date, area, city } = req.body;

    const lottery = new Lottery({ name, result, date, area, city })

    lottery.save((err, data) => {
        if(err) {
            return res.status(400).json({
                err: 'Error Occurr'
            })
        }
        res.json(data)
    })
}