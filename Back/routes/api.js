var express = require('express');
var router = express.Router();

// GET /api/test
router.get('/test', function(req, res, next) {
    res.send('Hi!');
});

module.exports = router;
