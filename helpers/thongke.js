const Lottery = require('../models/lottery');

exports.getQuery = (query) => {

    const area = '';
    const city = '';
    const date = '';
    const day = '';
    const tk = '';
    const skip = '';
    const limit = '';

    if (Object.keys(query).length) {
        area = query.hasOwnProperty('area') ? query.area : '';
        city = query.hasOwnProperty('city') ? query.city : '';
        date = query.hasOwnProperty('date') ? query.date : '';
        day = query.hasOwnProperty('day') ? query.day : '';
        tk = query.hasOwnProperty('tk') ? query.tk : '';
        skip = query.hasOwnProperty('skip') ? query.skip : '';
        limit = query.hasOwnProperty('limit') ? query.limit : '';
    }

    return { area, city, date, day, tk, skip, limit };
}


exports.homeList = async () => {
    try {

        const data = await Lottery.aggregate([
            { $group: { _id: {date: '$date', order: '$area.order'}, data: { $push: { name: '$name', subname: '$subname', result: '$result', area_name: '$area.name', area_slug: '$area.slug', area_code: '$area.code', city_name: '$city.name', city_slug: '$city.slug', city_code: '$city.code' } } } },
            { $sort: { '_id.date': -1, '_id.order': 1 } },
            { $limit: 3 },
            
        ])
        return data;

    } catch (err) {
        return err;
    }
}