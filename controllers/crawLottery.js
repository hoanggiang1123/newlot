const cheerio = require('cheerio');
const City = require('../models/city');
const Area = require('../models/area');
const Lottery = require('../models/lottery');

const { getCrawLotteryUrl, parseContent, parseContentMb, getContent } = require('../helpers/crawLottery');

const getCityBySlug =  (slug) => {
    return new Promise((resolve, reject) => {
        City.findOne({ slug })
        .populate('area', '_id name slug code')
        .select('_id name slug code area')
        .exec((err, data) => {
            if(err) {
                reject(null)
            }
            resolve(data);
        })
    })
    
}

const generateRandomTitle =  (fullname, sumname) => {

    let kq = ['Kết quả', 'KQ'];
    let kqStr = kq[Math.floor(Math.random() * kq.length)];
    let xs = ['xổ số', 'xs', 'sx'];
    let xsStr = xs[Math.floor(Math.random() * xs.length)];
    let area = [fullname, sumname];
    let areaStr = area[Math.floor(Math.random() * area.length)];

    return kqStr + ' ' + xsStr + ' ' + areaStr;
}

const lotteryExist = (check) => {
    return new Promise((resolve, reject) => {
        Lottery.findOne({ check }).exec((err, data) => {
            if (data) {
                resolve(true)
            } else {
                resolve(false)
            }
            if (err) {
                reject('error occur')
            }
        })
    })
}

const sleep = (second) => {
    return new Promise(resolve => setTimeout(resolve,second));
}

exports.craw = async (req, res) => {

    const { slug, start, end } = req.params;
    const urlArr = getCrawLotteryUrl(slug, start, end);
    // Lottery.find({'area.slug': 'xo-so-mien-trung'}).exec( async (err, data) => {
    //     if(data) {
    //         for(let i = 0; i < data.length; i++) {
    //             let item = data[i];
    //             Lottery.findOne({ _id: item._id }).exec( async (err, lot) => {
    //                 if(lot) {
    //                     await lot.remove();
    //                 }
    //             })
    //         }
    //     }
    // })

    if (urlArr.length) {

        for (let k = 0; k < urlArr.length; k++) {

            let path = urlArr[k].path;
            let date = urlArr[k].dayStr;
            let day = new Date(date).getDay();
            try {
                let content = await getContent(path);
        
                if(content === null) {
                    await sleep(5000);
                    content = await getContent(path);
                }

                if(content !== null) {
                    const $ = cheerio.load(content);
        
                    let table = $('table')[0];
                    
                    if (table) {
                        let data = {};

                        if ($(table).attr('id') === 'MB0') {
            
                            data = parseContentMb(table, date);
            
                        } else if($(table).attr('id') === 'MT0' || $(table).attr('id') === 'MN0') {
            
                            data = parseContent(table);
                        }

                        if(Object.keys(data).length) {

                            for (const key of Object.keys(data)) {
                                
                                if (data[key]) {
                                    
                                    const checkSlug = path + '_' + key;

                                    try {
                                        const check = await lotteryExist(checkSlug);

                                        if (!check) {

                                            const cityAreaObj = await getCityBySlug(key);
                
                                            let city = {};
                                            let area = {};
                                            let name = '';
                                            let subname = '';
                    
                                            if (cityAreaObj !== null) {
                    
                                                city = { _id: cityAreaObj._id, name: cityAreaObj.name, slug: cityAreaObj.slug, code: cityAreaObj.code };
                    
                                                area = { _id: cityAreaObj.area._id, name: cityAreaObj.area.name, slug: cityAreaObj.area.slug, code: cityAreaObj.area.code }
                    
                                                name = generateRandomTitle(cityAreaObj.name, cityAreaObj.code);
                                                subname = generateRandomTitle(cityAreaObj.area.name, cityAreaObj.area.code);
                    
                                            }
                                            
                                            const { db, g1, g2, g3, g4, g5, g6, g7, g8 } = data[key];
                    
                                            const result = { db, g1, g2, g3, g4, g5, g6, g7, g8 };
                    
                                            const loto = new Lottery({ name, subname, result, area, city, date, day, check: checkSlug });
    
                                            await loto.save((err, data) => {
                                                if(err) {
                                                    console.log(err)
                                                }
                                                console.log(`success  ${checkSlug}`);
                                            })
                                        } else {
                                            console.log(`Lottery already exsit ${checkSlug}`);
                                        }

                                    } catch (err) {
                                        console.log(err);
                                    }
                                }
                                
                            }
                        }
                    }
                }
        
            } catch (err) {
        
                console.log(err);
            }

        }
    }

    res.send('getting loto...');
}