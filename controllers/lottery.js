const Lottery = require('../models/lottery');

const { getQuery, homeList } = require('../helpers/thongke');

exports.list = async (req, res) => {
    const { area, city, date, day, tk, skip, limit } = getQuery(req.query);

    if ( area === '' && city === '' && date === '' && day === '' && tk === '' && skip === '' && limit === '') {
        
        try {
            const data = await homeList();
            if (data) {
                res.json(data);
            }
        } catch (err) {
            res.status(400).json({ err: 'Not Found Lotteries' })
        }
    }
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

exports.areaList = (req, res) => {
    const { area, skip, limit } = req.params;
    console.log(req.query)
    Lottery.aggregate([
        { $match: { 'area.slug': area } },
        { $group: 
            { 
                _id: '$date',
                result: { $push: { name: '$name', subname: '$subname', result: '$result',  area: '$area', city: '$city' } } 
            }
        },
        { $sort: { _id: -1 } },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) }
        
    ]).exec((err, data) => {
        if(err) {
            res.status(400).json({ error: 'Not Found' })
        }
        res.json(data)
    })
    //res.send('21525');
}