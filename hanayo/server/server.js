var express = require('express'),
     path = require('path');
var app = express();

app.use('/static', express.static(path.resolve(
  __dirname, '../../views/template/default/')));
app.use('/archives', express.static(path.resolve(
  __dirname, '../../views/archives')));

var options = {
  root: path.resolve(__dirname, '../../views'),
  headers: {
    'Content-Type': 'text/html'
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

var server = app.listen(8000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Hanayo listening at http://%s:%s', host, port);
  console.log('Dare ga tasukete~');
});
