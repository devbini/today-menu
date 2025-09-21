var express = require("express");
var router = express.Router();
var mysql = require("mysql2");
var multer = require("multer");
const jwt = require("jsonwebtoken");
const csurf = require("csurf");
const bcrypt = require("bcryptjs");

// Azure
const { BlobServiceClient } = require("@azure/storage-blob");

// 현재 시간 읽는 함수
function getTimeStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// MySQL 쿼리 실행 함수 (요청 때 마다 연결을 생성하도록...)
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    // MySQL 연결 생성
    var connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_NAME,
      timezone: "Z",
      ssl: {
        rejectUnauthorized: false,
      },
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

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME,
);

const upload = multer({
  storage: multer.memoryStorage(),
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
    console.error("데이터 읽기 오류:", err);
    res.status(500).send("서버 오류");
  }
});

// GET /api/getreviews
router.get("/getreviews", async function (req, res, next) {
  const query = "SELECT message, date, rate FROM review_tb ORDER BY date DESC;";
  try {
    const results = await executeQuery(query);
    res.json(results);
  } catch (err) {
    console.error("리뷰 데이터 가져오기 오류:", err);
    res.status(500).send("서버 오류");
  }
});

// POST /api/upload
router.post(
  "/upload",
  authenticateToken,
  upload.single("image"),
  async function (req, res, next) {
    console.log("파일 업로드 처리 시작 (Azure Blob)");

    try {
      if (!req.file) {
        console.log("파일이 업로드되지 않았습니다.");
        throw new Error("파일이 업로드되지 않았습니다.");
      }

      const { side } = req.body;
      const timeStamp = getTimeStamp();
      const blobName = `${timeStamp}_image.jpg`;

      // 1. Blob 클라이언트 가져오기
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // 2. 파일 버퍼(RAM)를 Blob Storage로 업로드
      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      // 3. 업로드된 파일의 공용 URL 가져오기
      const blobUrl = blockBlobClient.url;
      console.log("Azure Blob 업로드 성공:", blobUrl);

      // 4. DB에는 로컬 경로가 아닌, 이 공용 URL을 저장
      const query =
        "INSERT INTO menu_tb (url, date, side) VALUES (?, NOW(), ?)";
      const params = [blobUrl, side];

      await executeQuery(query, params);

      res.status(200).json({ message: "파일 업로드 성공" });
    } catch (err) {
      console.error("파일 업로드 중 오류 발생:", err); // 파일 업로드 오류 로그
      res.status(500).send("파일 업로드 오류");
    }
  },
);

// POST /api/uploadReview
router.post("/uploadReview", async function (req, res, next) {
  const { message, rating } = req.body;

  // 값 유효성 검증 (간단하게)
  if (!message || !rating) {
    return res.status(400).json({ message: "필수 데이터가 누락되었습니다." });
  }

  const query =
    "INSERT INTO review_tb (message, date, rate) VALUES (?, NOW(), ?);";
  const params = [message, rating];

  try {
    await executeQuery(query, params);
    res.status(200).json({ message: "리뷰 등록 성공" });
  } catch (err) {
    console.error("리뷰 등록 오류:", err);
    res.status(500).send("리뷰 등록 오류");
  }
});

// POST /api/login
router.post("/login", async function (req, res, next) {
  const { id, pw } = req.body;

  const query = "SELECT * FROM admin_tb WHERE id = ?";
  const params = [id];

  try {
    const results = await executeQuery(query, params);

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }

    const user = results[0];
    const storedHash = user.password;

    const passwordMatch = await bcrypt.compare(pw, storedHash);

    if (passwordMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 60 * 10 * 1000,
        secure: true,
        sameSite: "none",
      });

      // CSRF 토큰을 함께 반환
      res.json({
        token,
        csrfToken: req.csrfToken(),
      });
    } else {
      res
        .status(401)
        .json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }
  } catch (err) {
    console.error("로그인 오류", err);
    res.status(500).send("서버 오류");
  }
});

// GET /api/visitCount
router.get("/visitCount", async function (req, res, next) {
  const today = new Date().toISOString().slice(0, 10);
  const query = "SELECT count FROM visit_count WHERE date = ?";

  try {
    const results = await executeQuery(query, [today]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({ count: 0 });
    }
  } catch (err) {
    console.error("접속자 카운트 읽기 오류:", err);
    res.status(500).send("읽기 오류 발생");
  }
});

// POST /api/incrementVisitCount
router.post("/incrementVisitCount", async function (req, res, next) {
  const today = new Date().toISOString().slice(0, 10);
  const updateQuery = "UPDATE visit_count SET count = count + 1 WHERE date = ?";
  const insertQuery = "INSERT INTO visit_count (date, count) VALUES (?, 1)";

  try {
    const result = await executeQuery(updateQuery, [today]);
    if (result.affectedRows === 0) {
      await executeQuery(insertQuery, [today]);
    }
    res.status(200).json({ message: "증가 성공!" });
  } catch (err) {
    console.error("접속자 카운트 증가 오류:", err);
    res.status(500).send("오류 발생");
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
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
