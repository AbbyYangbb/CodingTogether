var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
    // send the index.html to the Start client side
    res.sendFile("index.html", { root: path.join(__dirname, '../../public/') });
});

module.exports = router;
