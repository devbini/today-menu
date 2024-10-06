const envPath = process.platform === "win32" 
  ? "C:/importent/.env_lunch"   // Windows 경로
  : "/home/importent/.env";     // Linux 경로

// .env 파일 로드
require('dotenv').config({ path: envPath });

var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
var multer = require("multer");
const jwt = require("jsonwebtoken");
const csurf = require('csurf');
const fs = require("fs");

// CSRF 보호 설정
const csrfProtection = csurf({ cookie: true });

// MySQL 쿼리 실행 함수 (요청 때 마다 연결을 생성하도록...)
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    // MySQL 연결 생성
    var connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_NAME,
    });

    // 연결 시도
    connection.connect(function (err) {
      if (err) {
        reject("MySQL 연결 실패... : " + err);
        return;
      }

      // 쿼리 실행
      connection.query(query, params, function (err, results) {
        // 쿼리가 끝나면 연결 끊기
        connection.end();

        if (err) {
          reject("쿼리 실행 오류: " + err);
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
    const uploadPath = process.platform === 'win32'
      ? 'C:/uploads/'
      : '/var/www/uploads/';

    // 경로 확인
    fs.access(uploadPath, fs.constants.W_OK, (err) => {
      if (err) {
        console.error("경로가 존재하지 않거나 쓰기 권한이 없습니다:", uploadPath);
        return cb(new Error("경로가 존재하지 않거나 쓰기 권한이 없습니다"));
      }
      cb(null, uploadPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, "image.jpg");
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// GET /api/test
router.get("/test", function (req, res, next) {
  res.send("Hi!");
});

// GET /api/getdatas
router.get("/getdatas", async function (req, res, next) {
  const query = "SELECT url, date, side FROM menu_tb ORDER BY id DESC LIMIT 1;";

  try {
    const results = await executeQuery(query);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send("데이터 없음");
    }
  } catch (err) {
    res.status(500).send("서버 오류");
  }
});

// POST /api/upload
router.post(
  "/upload",
  authenticateToken,
  csrfProtection,
  upload.single("image"),
  async function (req, res, next) {
    console.log("파일 업로드 처리 시작");

    try {
      if (!req.file) {
        console.log("파일이 업로드되지 않았습니다.");
        throw new Error("파일이 업로드되지 않았습니다.");
      }

      const { side } = req.body;
      const filePath = "/var/www/uploads/image.jpg";

      const query = "INSERT INTO menu_tb (url, date, side) VALUES (?, NOW(), ?)";
      const params = [filePath, side];

      await executeQuery(query, params);

      res.status(200).json({ message: "파일 업로드 성공" });
    } catch (err) {
      console.error("파일 업로드 중 오류 발생:", err);  // 파일 업로드 오류 로그
      res.status(500).send("파일 업로드 오류");
    }
  }
);

// POST /api/login
router.post("/login", async function (req, res, next) {
  const { id, pw } = req.body;

  const query = "SELECT * FROM admin_tb WHERE id = ? AND password = ?";
  const params = [id, pw];

  try {
    const results = await executeQuery(query, params);
    if (results.length > 0) {
      const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 60 * 10 * 1000, // 10분
      });

      // CSRF 토큰을 함께 반환
      res.json({
        token,
        csrfToken: req.session.csrfToken, // 세션에서 CSRF 토큰 반환
      });
    } else {
      res.status(401).json({ message: "로그인 실패" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 오류");
  }
});

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(403).json({ message: "관리자 인증이 필요합니다." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = user;
    next();
  });
}

// CSRF 토큰을 세션에 저장하고 재사용
router.get("/csrf-token", function (req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = req.csrfToken();
  }
  res.json({ csrfToken: req.session.csrfToken });
});

module.exports = router;