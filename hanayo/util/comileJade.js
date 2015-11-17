var ArticleParse = require('../model/parseArticle.js'),
     JadeParse = require('../model/jadeParse.js'),
     YamlParse = require('../model/ymlParse.js'),
  previewParse = require('../model/previewParse.js'),
        fs = require('fs'),
      mkdirp = require('mkdirp'),
      path = require('path');

function CompileJade() {
  if (!(this instanceof CompileJade))
    return new CompileJade();

  this.article_path = path.resolve(__dirname, '../../views/article');
  this.archivesDir = path.resolve(
    __dirname, '../../views/template/default/archives');
  var self = this;
  this.getArticles = function(){
    fs.readdir(this.article_path, function(err, files) {
      if (err)
        throw err;
      files.map(function(file, index) {
        var article = new ArticleParse({
          articlePath: path.join(self.article_path, file)
        });
        new YamlParse().pipe(article)
          .pipe(new previewParse()).pipe(self.jade);
      });
    });
  };


  this.compileArticles = function(jadeobj) {
    jadeobj.articles.map(function(article) {
      var date = new Date(article.time);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var articleJade = new JadeParse({
        objectMode: true,
        jadePath: path.resolve(
          __dirname, '../../views/template/default/pages'),
        jadePage: 'article.jade'

      });
      var articleParse = new ArticleParse({
        articlePath: self.article_path + '/' + article.name + '.md'
      });
      new YamlParse().pipe(articleParse).pipe(articleJade);
      articleJade.on('finish', function() {
        mkdirp(path.join(
          self.archivesDir, article.time.year, article.time.month),
          function(err) {
            if (err) throw err;
            var articleHtml = fs.createWriteStream(
              path.join(
                self.archivesDir, article.time.year,
                article.time.month,article.name + '.html')
            );
            articleJade.pipe(articleHtml);
          }
        );
      });
    });
  };
  this.jade = new JadeParse({
      objectMode: true,
      jadePage: 'index.jade'
    });

  this.build = function(opt) {
    var html = fs.createWriteStream(path.resolve(
        __dirname, '../../views/template/default/index.html'));

    /*
    this.jade.on('finish', function() {
      self.jade.pipe(html);
      self.compileArticles(self.jade.obj);
    });

    this.getArticles();
   */
    new YamlParse().pipe(new ArticleParse()).pipe(self.jade).pipe(html);
  };
}

module.exports = CompileJade;
