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
  this.archiveListObj = [];

  this.buildPath = path.resolve(process.cwd(), './_build');
  this.articlePath = path.resolve(process.cwd(), './article');
  this.jadePath = path.resolve(process.cwd(), './views/template/default/pages');
  this.tagPath = path.resolve(this.buildPath, './tag');
  this.archivePath = path.resolve(this.buildPath, './archives');
  this.pagePath = path.resolve(this.buildPath, './pages');


  this.getArticleObj = function(globalObj, articleObj){
    globalObj.article = articleObj;
    return globalObj;
  };

  this.getListObj = function(globalObj, list) {
    globalObj.list = list;
    return globalObj;
  };

  this.getTagObj = function(getListObj) {
    var tags = {};
    getListObj.articles.map(function(article) {
      article.tag.map(function(tag) {
        var tagObj = {
          title: tag,
          name: article.title, 
          date: article.time,
          link: '/archives/' + article.time.year + '/' +
                article.time.month + '/' + article.name + '.html'
        };
        if (tags[tag] !== undefined) {
          tags[tag].push(tagObj);
        } else {
          tags[tag] = [];
          tags[tag].push(tagObj);
        }
      });
    });
    return tags;
  }

  this.getPageObj = function(obj, index) {
    console.log('getstart', obj.articles.length);
    var pageObj = Object.create(obj); //copy from global obj
    var pagesCount = Math.ceil(obj.articles.length / obj.pagesize);

    pageObj.pages = [];
    for (var i = 1;i <= pagesCount;i++) {
      if (i == index) {
        pageObj.pages.push({value: i, isCurrentPage: true});
      } else {
        pageObj.pages.push({value: i, isCurrentPage: false});
      }
    }

    pageObj.articles = obj.articles.slice(
        (index - 1) * obj.pagesize, 
        index * obj.pagesize
    );
    console.log('getend', obj.articles.length);
    return pageObj;
  }

  this.getTagList = function(obj) {
    var list = [];
    for (var key in obj) {
      list.push({name: key, link: '/tag/' + key + '.html'});
    }
    return list;
  };

  this.pushListObj = function(ele) {
    for (var i in this.archiveListObj) {
      if (this.archiveListObj[i] == ele)
        return;
    } 
    this.archiveListObj.push(ele);
  };
}

DestStream.prototype._write = function(chunk, encoding, callback) {
  var self = this;
  this.obj = JSON.parse(chunk);
  mkdirp(this.buildPath, function(err) {
    if (err) throw err;

    self.homepage(self.obj); // write home page
    self.archive_article(self.obj); // write archives articles
    self.writeTag();
  });
 
};


DestStream.prototype.homepage = function(obj) {
  var self = this;
  if (obj.articles.length > obj.pagesize){
    this.writePages(obj);
  } else {
    obj.pages = [];
  }

  var indexJadefn = jade.compileFile(
    path.join(self.jadePath, 'index.jade'),
    {cache: true}
  );

  var self = this;

  fs.writeFile(
      path.join(self.buildPath, 'index.html'),
      indexJadefn(self.getPageObj(obj, 1)),
      function (err) {
        if (err) throw err;
      }
  );
};

DestStream.prototype.writePages = function(obj) {
  var self = this;
  var indexJadefn = jade.compileFile(
    path.join(self.jadePath, 'index.jade'),
    {cache: true}
  );
  var pageCount = Math.ceil(obj.articles.length / obj.pagesize);
  console.log('pageCount', pageCount);
    console.log(obj.articles.length);

  mkdirp(self.pagePath, function(err) {
    if (err) throw err;
    console.log(obj.articles.length);
    var i = 1;
    for (i;i <= pageCount;i++ ) {
    console.log(obj.articles.length);
      fs.writeFileSync(
          path.join(self.pagePath, i + ".html"),
          indexJadefn(self.getPageObj(self.obj, i))
      );     
    }
  });
}

DestStream.prototype.writeTag = function() {
  var self = this;
  var jadefn = jade.compileFile(
    path.join(self.jadePath, 'tag.jade'),
    {cache: true}
  );
  var tags = this.getTagObj(this.obj);
  mkdirp(self.tagPath, function(err) {
    if (err) throw err;
    var tagPageObj = self.obj;
    tagPageObj.tag = {
      title: 'Tags',
      list: self.getTagList(tags)
    };
    fs.writeFile(
      path.join(self.tagPath, 'index.html'),
      jadefn(tagPageObj),
      function(err) {
        if (err) throw err;
      }
    );
    for (var key in tags) {
      if (key === undefined) return;
      var tagObj = self.obj;
      tagObj.tag = {title: key, list: tags[key]};
      fs.writeFile(
        path.join(self.tagPath, key + '.html'),
        jadefn(tagObj),
        function (err) {
          if (err) throw err;
        }
      );
      };
  });
}


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
    this.archiveListObj.map(function(ele) {
      return {name: ele, link: '/archives/' + ele + '/' + 'index.html'};
    }) 
  );

  var jadefn = jade.compileFile(
    path.join(self.jadePath, 'archive.jade'),
    { cache: true }
  );
  console.log(this.archiveListObj);
  fs.writeFile(
    path.join(self.archivePath, 'index.html'),
    jadefn(archiveObj),
    function(err) {
      if (err) throw err;
    }
  );

  this.archiveListObj.map(function(date) {
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
      }
    );
  });
};


module.exports = DestStream;
