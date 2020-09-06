const express = require('express');
const router = express.Router();

const { list, create, areaList } = require('../controllers/lottery.js');

router.get('/lotteries', list);
router.post('/lottery', create);
router.get('/lottery/:area', areaList);


module.exports = router;