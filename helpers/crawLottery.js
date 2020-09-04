const https = require('https');
const cheerio = require('cheerio');
const { SCHEDULE } = require('./lotteryMockup');

const getCrawLotteryUrl = (area, startDate, endDate) => {

    let newStartDate = transformDate(startDate);
    let newEndDate = transformDate(endDate);
    let current = new Date(newStartDate);
    let end = new Date(newEndDate);

    let dateArr = [];

    while(current <= end) {
        const newDate = new Date(current);
        let dateStr = newDate.getDate() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getFullYear();
        const path = '/' + area + '/ngay-' + dateStr;
        let year = newDate.getFullYear();
        let month = newDate.getMonth() + 1 < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth();
        let day =  newDate.getDate() < 10 ?  '0' + newDate.getDate() :  newDate.getDate();
        const dayStr = year + '-' + month + '-' + day;
        dateArr = [...dateArr, { path, dayStr }];
        current.setDate(current.getDate() + 1);
    }
    return dateArr;
}

const getCitySlug = (date) => {
    // const newdate = transformDate(date);
    const daySlug = getWeekDay(date);

    const cities = SCHEDULE[daySlug];

    let slug = '';
    
    if (cities[Object.keys(cities)[0]]) {
        slug = cities[Object.keys(cities)[0]].slug;
    }
    
    return slug;
}

function toSlug(str) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');
    str = str.replace(/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, 'A');
    str = str.replace(/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, 'E');
    str = str.replace(/(Ì|Í|Ị|Ỉ|Ĩ)/g, 'I');
    str = str.replace(/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, 'O');
    str = str.replace(/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, 'U');
    str = str.replace(/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/g, 'Y');
    str = str.replace(/(Đ)/g, 'D');
    str = str.replace(/(\.)/g, '');
    str = str.replace(/(\“|\”|\‘|\’|\,|\!|\&|\;|\@|\#|\%|\~|\`|\=|\_|\'|\]|\[|\}|\{|\)|\(|\+|\^)/g, '-');
    str = str.replace(/( )/g, '-');
    return str;
}

function transformDate(date) {

    let newdate = '';

    const dateArr = date.split('-');

    if(dateArr.length === 3) {
        newdate = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
    }

    return newdate;
}

function getWeekDay(date) {

    const dayOfWeek = new Date(date).getDay();

    return isNaN(dayOfWeek) ? null : 
    ['chu-nhat', 'thu-2', 'thu-3', 'thu-4', 'thu-5', 'thu-6', 'thu-7'][dayOfWeek];
}

const getContent = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'xskt.com.vn',
            path: path,
            method: 'GET',
            timeout: 3000
        }
        var req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let strData = '';
            res.on('data', data => {
                strData += data;
            })
            req.on('timeout', () => {
                resolve(null);
            })
            res.on('end', () => {
                resolve(strData);
            })
        })

        req.on('error', error => {
            reject(error)
        })
        req.end();
    });
}

function getLotoNumber(str) {

    str = str.replace(new RegExp('<br>', 'g'),'-');
   
    let $ = cheerio.load(str);

    return toSlug($.text());
}

const parseContentMb = (table, date) => {
    if (!table) return {};
    const $ = cheerio.load(table);

    const items = $('tr');

    let resp = {};

    if (items && items.length) {

        let data = {};

        for (let i = 1; i < items.length; i++) {

            let index = 'g8';
            let result = '';

            if (i === (items.length -1) && $(items[i]).find('td strong.red').length) {

                result = $(items[i]).find('td strong.red').text();
            } else if ($(items[i]).find('td').length > 2) {

                let indexNode = $(items[i]).find('td')[0];
                index = toSlug($(indexNode).text());

                let resultNode = $(items[i]).find('td')[1];
                result = getLotoNumber($(resultNode).html());
            }
            data[index] = result;

        }

        let city = getCitySlug(date);

        resp[city] =  data;
    }

    return resp;
}

const parseContent = (table) => {
    if (!table) return {};
    const $ = cheerio.load(table);

    let resp = {};

    let col = $($('tr')[0]).find('th').length ? ($($('tr')[0]).find('th').length -1 ) : 0

    if (col === 0) return {};

    const items = $('tr');

    if (items && items.length) {

        let data = {};

        for (let i = 0; i < items.length; i++) {
            
            let row = 'td';

            if (i === 0) row = 'th';

            let rows = $(items[i]).find(row);

            for (let x = 0; x < col; x++) {

                let key = x + 1;

                if (i === 0 ) {

                    let index = toSlug($(rows[key]).text());
                    
                    data[index] = {};
                } else {
                    let head = $(items[0]).find('th');

                    let index = toSlug($(head[key]).text());

                    let idex = toSlug($(rows[0]).text());

                    let value = getLotoNumber($(rows[key]).html());

                    data[index][idex] = value;

                }
            }
        }

        resp = data;
    }

    return resp;
}

module.exports = {
    getCrawLotteryUrl,
    parseContentMb,
    parseContent,
    getContent
}