var markdown = require('markdown').markdown;
var Transform = require('stream').Transform;
var yaml = require('js-yaml');
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

  this.articlePath = path.resolve(process.cwd(), './article');

  this.headParse = function(str) {
    return yaml.safeLoad(str);
  };

  this.pushObj = function(obj, article_path) {
    var getDateString = function(str) {
      var datelist = str.split(' ');
      var timelist = datelist[1].split(':');
      var t = 0;

      while (t < 3) {
        if (!timelist[t]) {
          timelist[t] = '00';
        } else if(timelist[t].length < 2) {
          timelist[t] = '0' + timelist[t];
        }
      }
      
      return datelist[0] + timelist.join(':');

    };

    var date;
    if (article_path.date) { 
      date = new Date(getDateString(article_path.date));
    } else {
      date = fs.statSync(self.articlePath).ctime;
    }

    this.push(JSON.stringify({
      flag: 'article', title: obj.title, tag: obj.tag,
      author: obj.author, content: obj.content,
      picture: obj.picture,
      time: {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        day: date.getDay().toString(),
        date: date
      },
      name: path.basename(article_path, '.md')
    }));
  };

  this.readArticle = function(article) {
    var article_string = fs.readFileSync(article, {encoding: 'utf8'});
    var re = /(\n---+\n)/;
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
