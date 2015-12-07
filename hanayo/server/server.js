var express = require('express'),
     path = require('path');
var app = express();

app.use('/static', express.static(path.resolve(
  process.argv[2], './views/template/default/')));
app.use('/', express.static(path.resolve(
  process.argv[2], './_build')));

var options = {
  root: path.resolve(process.argv[2], './views'),
  headers: {
    'Content-Type': 'text/html'
  }
};

app.get('/', function(req, res) {
  res.sendFile('index.html', options, function(err) {
    if (err){
      res.status(err.status).end();
      throw err;
    }
  });
});

var server = app.listen(8000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Hanayo listening at http://%s:%s', host, port);
  console.log('Dare ga tasukete~');
});
