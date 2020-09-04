const express = require('express');
const router = express.Router();

const { craw } = require('../controllers/crawLottery');

router.get('/:slug/:start/:end', craw);

module.exports = router;