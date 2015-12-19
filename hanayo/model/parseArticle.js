var markdown = require('markdown-it');
var Transform = require('stream').Transform;
var yaml = require('js-yaml');
var hljs = require('highlight.js');
var fs = require('fs');
var util = require('util');
var path = require('path');

var md = new markdown({
    html:       false,
    breaks:     true,
    langPrefix: 'language-',
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }

      try {
        return hljs.highlightAuto(str).value;
      } catch (__) {}

      return '';
    }
});

util.inherits(ArticleParse, Transform);

function ArticleParse(opt) {
  if (!(this instanceof ArticleParse))
    return new ArticleParse(opt);

  Transform.call(this, opt);
  var self = this;
  this._readableState.objectMode = true;
  this.title = '';
  this.tags = [];
  this.author = '';
  this.picture = '';
  this.content = '';

  this.articlePath = path.resolve(process.cwd(), './article');

  this.headParse = function(str) {
    return yaml.safeLoad(str);
  };

  this.pushObj = function(obj, article_path) {
    var date;
    if (obj.date) { 
      date = new Date(obj.date);
      console.log('use article date', obj.date, date);
    } else {
      date = fs.statSync(article_path).atime;
      console.log('use data', date);
    }

    var articleObj = {
      flag: 'article', title: obj.title, tag: obj.tag,
      author: obj.author, content: obj.content,
      picture: obj.picture,
      time: {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        day: date.getDay().toString(),
        date: date,
        timestamp: date.getTime()
      },
      name: path.basename(article_path, '.md')
    };

    articleObj.url = '/archives/' + articleObj.year + '/' + 
        articleObj.month + '/' + articleObj.name + '.html';
    console.log(articleObj.url);

    this.push(JSON.stringify(articleObj));

  };

  this.readArticle = function(article) {
    var article_string = fs.readFileSync(article, {encoding: 'utf8'});
    var re = /(\n---+\n)/;
    var article_exec = re.exec(article_string);
    var head = article_string.slice(0, article_exec.index);
    var articleObj = self.headParse(head + '\n');

    articleObj.content = md.render(article_string.slice(
        article_exec.index+article_exec[1].length, -1
    ));
    this.pushObj(articleObj,article);
  };
}

ArticleParse.prototype._transform = function(chunk, encode, callback) {
  this.push(chunk); // push upstream
  var self = this;

  var files = fs.readdirSync(this.articlePath);
  for (var index in files) {
      self.readArticle(path.join(this.articlePath, files[index]));
    }
    self.push(null);

};

module.exports = ArticleParse;
