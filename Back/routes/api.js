require('dotenv').config({ path: '/home/importent/.env' });
// require('dotenv').config({ path: 'C:/importent/.env' });

var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var multer = require('multer');

// MySQL 쿼리 실행 함수 (요청 때 마다 연결을 생성하도록...)
function executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {

        // MySQL 연결 생성
        var connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PW,
            database: process.env.DB_NAME
        });

        // 연결 시도
        connection.connect(function(err) {
            if (err) {
                reject('MySQL 연결 실패... : ' + err);
                return;
            }

            // 쿼리 실행
            connection.query(query, params, function(err, results) {
                // 쿼리가 끝나면 연결 끊기
                connection.end();

                if (err) {
                    reject('쿼리 실행 오류: ' + err);
                } else {
                    resolve(results);
                }
            });
        });
    });
}

// multer 설정 (파일 업로드에 사용)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/var/www/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'image.jpg');
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/test
router.get('/test', function(req, res, next) {
    res.send('Hi!');
});

// GET /api/getdatas
router.get('/getdatas', async function(req, res, next) {
    const query = 'SELECT url, date, side FROM menu_tb ORDER BY id DESC LIMIT 1;';

    try {
        const results = await executeQuery(query);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('데이터 없음');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

// POST /api/upload
router.post('/upload', upload.single('image'), async function(req, res, next) {
    try {
        const { side } = req.body;
        const filePath = '/var/www/uploads/image.jpg';

        const query = 'INSERT INTO menu_tb (url, date, side) VALUES (?, NOW(), ?)';
        const params = [filePath, side];
        await executeQuery(query, params);

        res.status(200).json({ message: '파일 업로드 성공' });
    } catch (err) {
        console.error(err);
        res.status(500).send('파일 업로드 오류');
    }
});

// POST /api/login
router.post('/login', async function(req, res, next) {
    const { id, pw } = req.body;

    const query = 'SELECT * FROM admin_tb WHERE id = ? AND password = ?';
    const params = [id, pw];

    try {
        const results = await executeQuery(query, params);
        if (results.length > 0) {
            res.json({ message: '1' }); // 성공
        } else {
            res.json({ message: '0' }); // 실패
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');

    }
});

module.exports = router;