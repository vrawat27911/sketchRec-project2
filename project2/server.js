var express = require('express');
var app = express();
app.use(express.static('public'));

var dataFile = require("./public/data.json")
app.get('/data.json', function(req, res) {
    res.send({a:1});
});
app.listen(3000, function() {
	console.log('listening on port 3000');
});
