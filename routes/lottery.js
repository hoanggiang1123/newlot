const express = require('express');
const router = express.Router();

const { list, create } = require('../controllers/lottery.js');

router.get('/lotteries', list);
router.post('/lottery', create);


module.exports = router;