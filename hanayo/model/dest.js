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
  this.jadePath = path.resolve(__dirname, '../../views/template/default/pages');

  this.getArticleObj = function(globalObj, articleObj){
    globalObj.articles = undefined;
    globalObj.article = articleObj;
    return globalObj;
  };
}

DestStream.prototype._write = function(chunk, encoding, callback) {
  this.obj = JSON.parse(chunk);
  this.archive_article(this.obj); // write archives articles
  console.log(this.obj);
  
};

DestStream.prototype.archive_article = function(obj) {
  var self = this;
  obj.articles.map(function(article) {
    var jadefn = jade.compileFile(
      path.join(self.jadePath, 'article.jade'),
      { cache: true }
    );
    var archive_path = path.join(
      self.archivePath, article.time.year, article.time.month);
    mkdirp(archive_path, function(err) {
        if (err) throw err;
        fs.writeFile(
          path.join(archive_path, article.name + '.html'),
          jadefn(self.getArticleObj(obj, article)),
          function (err) {
            if (err) throw err;
            console.log('write file', article.name);
          }
        );
      }
    );
  });
};

module.exports = DestStream;
