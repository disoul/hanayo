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

    this.articlePath = opt.articlePath;

    this.headParse = function(str) {
        var re = /title: *(\S*)\n/;
        var title,tags,author,picture;
        if ((title = re.exec(str)) !== null) {
            self.title = title[1];
        }
        re = /tag: *(\S*)\n/;
        if ((tags = re.exec(str)) !== null){
            tags[1].split(',').map(function(ele) {
                self.tags.push(ele);
            });
        }
        re = /author: *(\S*)\n/;
        if ((author = re.exec(str)) !== null){
            self.author = author[1];
        }
        re = /picture: *(\S*)\n/;
        if ((picture = re.exec(str)) !== null){
            self.picture = picture[1];
        }
    };

    this.getObj = function() {
        var date = fs.statSync(self.articlePath).ctime;
        return {
            flag: 'article', title: self.title, tag: self.tags,
            author: self.author, content: self.content, 
            picture: self.picture,
            time: {
                year: date.getFullYear().toString(),
                month: (date.getMonth() + 1).toString(),
                day: date.getDay().toString()
            },
            name: path.basename(self.articlePath, '.md')
        };
    };
}

ArticleParse.prototype._transform = function(chunk, encode, callback) {
    this.push(chunk); // push upstream
    var self = this;
    var article_string = fs.readFileSync(this.articlePath, {encoding: 'utf8'});
    var re = /(\n----+)/;
    var article_exec = re.exec(article_string);
    var head = article_string.slice(0, article_exec.index);
    self.headParse(head + '\n');
    self.content = markdown.toHTML(article_string.slice(
            article_exec.index+article_exec[1].length, -1
    ));
    self.push((JSON.stringify(self.getObj())));
    self.push(null);
};

module.exports = ArticleParse;
