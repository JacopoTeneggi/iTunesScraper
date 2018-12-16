'use strict'

const express = require('express');

const sse = require('./lib/sse');
const logger = require('./config/winston').logger;
const analyze = require('./lib/analyzer').analyze;
const db = require('./db');

const app = express();

// View folder
app.set('views', './views');
// Public folder
app.use(express.static('./public'));
// View engine
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('stats');
});

app.get('/stats', (req, res) => {
    res.render('stats');
});

app.get('/analyzer', (req, res) => {
    res.render('analyzer');
})

app.post('/analyzer', (req, res) => {
    const { statusCode, text } = analyze();
    res.status(statusCode).send(text);
});

app.get('/analyzer/update-stream', (req, res) => {
    sse.subscribe(res);
    req.on('close', () => {
        sse.unsubscribe();
    });
})

app.get('/test', (req, res) => {
    logger.log('web', 'ciao');
    res.status(200).send();
})

app.get('/top10', (req, res) => {
    db.query('SELECT hostingvendors, COUNT(*) from ( select unnest(hostingvendors) as hostingvendors FROM podcasts WHERE feeddown = FALSE ) as hostingvendors group by hostingvendors order by count desc;', [], (err, results) => {
        if (err) return res.send(err);
        res.render('top10', { results: results.rows });
    })
});

const server = app.listen(3000, () => {
    const port = server.address().port

    console.log('Server listening on port', port);
});