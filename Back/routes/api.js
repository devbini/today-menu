require('dotenv').config({ path: '/home/importent/.env' });
// require('dotenv').config({ path: 'C:/importent/.env' });

var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// MySQL 연결 설정
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME
});

connection.connect(function(err) {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
});

// GET /api/test
router.get('/test', function(req, res, next) {
    res.send('Hi!');
});

// GET /api/getdatas
router.get('/getdatas', function(req, res, next) {
    const query = 'SELECT url, date, side FROM menu_tb ORDER BY date DESC LIMIT 1';
    
    connection.query(query, function(err, results) {
        if (err) {
            res.status(500).send('서버 오류');
            return;
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('데이터 없음');
        }
    });
});

module.exports = router;
