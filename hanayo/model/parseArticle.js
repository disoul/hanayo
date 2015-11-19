var markdown = require('markdown').markdown;
var Transform = require('stream').Transform;
var fs = require('fs');
var util = require('util');
var path = require('path');

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

  this.articlePath = path.resolve(__dirname, '../../article');

  this.headParse = function(str) {
    var re = /title: *(\S*)\n/;
    var obj = {tags: []};
    var title,tags,author,picture;
    if ((title = re.exec(str)) !== null) {
      obj.title = title[1];
    }
    re = /tag: *(\S*)\n/;
    if ((tags = re.exec(str)) !== null){
      tags[1].split(',').map(function(ele) {
        obj.tags.push(ele);
      });
    }
    re = /author: *(\S*)\n/;
    if ((author = re.exec(str)) !== null){
      obj.author = author[1];
    }
    re = /picture: *(\S*)\n/;
    if ((picture = re.exec(str)) !== null){
      obj.picture = picture[1];
    }

    return obj;
  };

  this.pushObj = function(obj, article_path) {
    var date = fs.statSync(self.articlePath).ctime;
    this.push(JSON.stringify({
      flag: 'article', title: obj.title, tag: obj.tags,
      author: obj.author, content: obj.content,
      picture: obj.picture,
      time: {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        day: date.getDay().toString()
      },
      name: path.basename(article_path, '.md')
    }));
  };

  this.readArticle = function(article) {
    var article_string = fs.readFileSync(article, {encoding: 'utf8'});
    var re = /(\n----+)/;
    var article_exec = re.exec(article_string);
    var head = article_string.slice(0, article_exec.index);
    var articleObj = self.headParse(head + '\n');
    articleObj.content = markdown.toHTML(article_string.slice(
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
