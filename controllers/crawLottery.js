const cheerio = require('cheerio');
const City = require('../models/city');
const Area = require('../models/area');
const Lottery = require('../models/lottery');

const { getCrawLotteryUrl, parseContent, parseContentMb, getContent } = require('../helpers/crawLottery');

const getCityBySlug =  (slug) => {
    return new Promise((resolve, reject) => {
        City.findOne({ slug })
        .populate('area', '_id name slug code order')
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
            if (!data) {
                resolve(false);
            } 
            resolve(true);

            if (err) {

                reject('error occur');
            }
        })
    })
}

const sleep = (second) => {
    return new Promise(resolve => setTimeout(resolve,second));
}

exports.craw = async (req, res) => {
    res.send('getting loto...');
    const { slug, start, end } = req.params;
    const urlArr = getCrawLotteryUrl(slug, start, end);
    
    let fail = [];
    if (urlArr.length) {
       
        for await (const k of urlArr) {

            let path = k.path;
            let date = k.dayStr;
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

                            for await (const key of Object.keys(data)) {
                                
                                if (data[key]) {
                                    
                                    const checkSlug = path + '_' + key;

                                    try {
                                        const check = await lotteryExist(checkSlug);
                                        
                                        if (check === false) {

                                            const cityAreaObj = await getCityBySlug(key);
                
                                            let city = {};
                                            let area = {};
                                            let name = '';
                                            let subname = '';
                    
                                            if (cityAreaObj !== null) {

                                                city = { _id: cityAreaObj._id, name: cityAreaObj.name, slug: cityAreaObj.slug, code: cityAreaObj.code };
                                                
                                                area = { _id: cityAreaObj.area._id, name: cityAreaObj.area.name, slug: cityAreaObj.area.slug, code: cityAreaObj.area.code, order: cityAreaObj.area.order }
                                                
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
                } else {
                    fail.push(k);
                }
        
            } catch (err) {
        
                console.log(err);
            }

        }
    }
    console.log(fail)
}