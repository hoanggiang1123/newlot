const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { resolve } = require('path');

require('dotenv').config();


//app
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 8000;

//db
mongoose
    .connect(process.env.DATABASE_LOCAL, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
    .then(() => console.log('DB connected'))
    .catch(err => {
        console.log(err);
    });

// middleware

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/test', function(req, res) {
    setTimeout(() => {
        res.send('okokoko');
    }, 10000)
})

const createAreaCity = require('./helpers/createAreaCity');

createAreaCity();

app.use('/api', require('./routes/lottery'));
app.use('/craw', require('./routes/crawLottery'));
app.use('/create-area-city', require('./routes/createAreaCity'));


http.listen(port, () => console.log(`App running on port ${port}`));