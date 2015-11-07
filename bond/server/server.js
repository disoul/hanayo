var express = require('express'),
       path = require('path');
var app = express();

app.use(express.static(path.resolve(
    __dirname, '../../views/template/default/')));

var options = {
    root: path.resolve(__dirname, '../../views/template/default/'),
    headers: {
        'Content-Type': 'text/plain'
    }
};

app.get('/', function(req, res) {
    res.sendFile('index.html', options, function(err) {
        if (err){
            console.error(err);
            res.status(err.status).end();
        }
    });   
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Bond app listening at http://%s:%s', host, port);
});
