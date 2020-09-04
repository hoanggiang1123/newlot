const express = require('express');
const router = express.Router();

const createAreaCity = require('../helpers/createAreaCity')

router.get('/', async (req, res) => {
    createAreaCity();
    res.send('124141')
})

module.exports = router;