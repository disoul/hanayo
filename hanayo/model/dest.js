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
  this.archiveListObj = { dateList: [] };
  this.archivePath = path.resolve(
    __dirname, '../../views/archives');
  this.articlePath = path.resolve(__dirname, '../../views/article');
  this.jadePath = path.resolve(__dirname, '../../views/template/default/pages');
  this.homePath = path.resolve(__dirname, '../../views');

  this.getArticleObj = function(globalObj, articleObj){
    globalObj.article = articleObj;
    return globalObj;
  };

  this.getListObj = function(globalObj, list) {
    globalObj.list = list;
    return globalObj;
  };

  this.pushListObj = function(ele) {
    for (var i in this.archiveListObj) {
      if (this.archiveListObj[i] == ele)
        return;
    } 
    this.archiveListObj.dateList.push(ele);
  };
}

DestStream.prototype._write = function(chunk, encoding, callback) {
  this.obj = JSON.parse(chunk);
  this.homepage(this.obj); // write home page
  this.archive_article(this.obj); // write archives articles
//  console.log(this.obj);
  
};


DestStream.prototype.homepage = function(obj) {
  var self = this;
  var jadefn = jade.compileFile(
    path.join(self.jadePath, 'index.jade'),
    {cache: true}
  );

  fs.writeFile(
    path.join(self.homePath, 'index.html'),
    jadefn(obj),
    function (err) {
      if (err) throw err;
      console.log('write home');
    }
  );

};


DestStream.prototype.archive_article = function(obj) {
  var self = this;
  obj.articles.map(function(article, index, articles) {
    var jadefn = jade.compileFile(
      path.join(self.jadePath, 'article.jade'),
      { cache: true }
    );
    var archive_path = path.join(
      self.archivePath, article.time.year, article.time.month);
    mkdirp(archive_path, function(err) {
        if (err) throw err;
        self.pushListObj(
          article.time.year + '/' + article.time.month);
        fs.writeFile(
          path.join(archive_path, article.name + '.html'),
          jadefn(self.getArticleObj(obj, article)),
          function (err) {
            if (err) throw err;
            console.log('write file', article.name);

            if (index == articles.length - 1) {
              self.archive_list();
            }
          }
        );
      }
    );
  });
};

DestStream.prototype.archive_list = function() {
  var self = this;
  var archiveObj =  this.getListObj(
    this.obj, 
    this.archiveListObj.dateList.map(function(ele) {
      return {name: ele, link: '/archives/' + ele + '/' + 'index.html'};
    }) 
  );

  console.log(archiveObj);
  var jadefn = jade.compileFile(
    path.join(self.jadePath, 'archive.jade'),
    { cache: true }
  );
  fs.writeFile(
    path.join(self.archivePath, 'index.html'),
    jadefn(archiveObj),
    function(err) {
      if (err) throw err;
      console.log('write archive');
    }
  );

  this.archiveListObj.dateList.map(function(date) {
    var list = [];
    fs.readdirSync(path.join(self.archivePath, date))
      .map(function(ele) {
        if (ele == 'index.html') return;
        list.push({ 
          name: path.basename(ele, '.html'), 
          link: path.join('/archives', date, ele)
        });
      });
    fs.writeFile(
      path.join(self.archivePath, date, 'index.html'),
      jadefn(self.getListObj(self.obj, list)),
      function(err) {
        if (err) throw err;
        console.log('write', date, 'archive');
      }
    );
  });
};

module.exports = DestStream;
