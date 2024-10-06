var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors');
var session = require('express-session');
const cors = require("cors");
const csurf = require("csurf");
const xss = require('xss-clean');

var apiRouter = require('./routes/api');
var app = express();

// XSS 쉴드 추가
app.use(xss());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 파일 크기 제한 설정
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 기존 설정 미들웨어들
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 세션 미들웨어 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// CORS 설정
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// CSRF 보호 및 쿠키 파서 추가
app.use(cookieParser());
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// 라우터 설정
app.use('/api', apiRouter);

// 404 핸들
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


var port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
