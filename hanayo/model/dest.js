var Writable = require('stream').Writable,
      mkdirp = require('mkdirp'),
        path = require('path'),
        util = require('util'),
        jade = require('jade'),
          fs = require('fs');

util.inherits(DestStream, Writable);

function DestStream(opt) {
  if (!(this instanceof DestStream))
    return new DestStream(opt);

  Writable.call(this, {objectMode: true});
  var self = this;
  this.obj = {};
  this.archivePath = path.resolve(
    __dirname, '../../views/archives');
  this.articlePath = path.resolve(__dirname, '../../views/article');
}

DestStream.prototype._write = function(chunk, encoding, callback) {
  this.obj = JSON.parse(chunk);
  console.log(this.obj);
  
};

DestStream.prototype.archives = function(obj) {
  var self = this;
  obj.articles.map(function(article) {
    var jadefn = jade.compileFile(
      path.join(self.articlePath, article.name + '.md'),
      { cache: true }
    );
  });
};

module.exports = DestStream;
