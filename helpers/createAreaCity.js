const Area = require('../models/area');
const City = require('../models/city');

const { LOTOVN } = require('./lotteryMockup');

const createAreaCity = async () => {
    const mapArea = { 'xo-so-mien-bac': 'Xổ Số Miền Bắc', 'xo-so-mien-nam': 'Xổ Số Miền Nam', 'xo-so-mien-trung': 'Xổ Số Miền Trung' };
    
    const lotoArr = Object.keys(LOTOVN);
    
    for(const index of lotoArr) {
        const areaName = mapArea[index];
        const area = new Area({ name:  areaName, slug: index, code: '', order: 0 });
        try {
            await area.save( async (err, data) => {
                if(err) {
                    console.log(err);
                    return false;
                }
                let area_id = data._id;
                let cities = LOTOVN[index];
                let cityArr = Object.keys(cities);

                for(const ke of cityArr) {
                    let item = cities[ke];
                    const city = new City({ name:  item.name, slug: ke, code: item.sum, area: area_id});
                    await city.save();
                }
            })
            
        }catch(err) {
            console.log(err)
        }
    }
}

module.exports = createAreaCity;