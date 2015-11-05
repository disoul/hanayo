var markdown = require('markdown').markdown;
var Transform = require('stream').Transform;
var fs = require('fs');
var util = require('util');

util.inherits(ArticleParse, Transform);

function ArticleParse(opt) {
    if (!(this instanceof ArticleParse))
        return new ArticleParse(opt);

    Transform.call(this, opt);
    var self = this;
    this.title = '';
    this.tags = [];
    this.author = '';
    this.content = '';

    this.headParse = function(str) {
        var re = /title: *(\S*)\n/;
        var title,tags,author;
        if ((title = re.exec(str)) !== null) {
            self.title = title[1];
        }
        re = /tag: *(\S*)\n/;
        if ((tags = re.exec(str)) !== null){
            tags[1].split(',').map(function(ele) {
                console.log(ele);
                self.tags.push(ele);
            });
        }
        re = /author: *(\S*)\n/;
        if ((author = re.exec(str)) !== null){
            console.log(author);
            self.author = author[1];
        }
    };

    this.getObj = function() {
        return {
            flag: 'article', title: self.title, tag: self.tags,
            author: self.author, content: self.content
        };
    };
}

ArticleParse.prototype._transform = function(chunk, encoding, done) {
    var article_string = chunk.toString();
    var re = /(\n----+)/;
    var article_exec = re.exec(article_string);
    console.log(re.exec(article_string));
    var head = article_string.slice(0, article_exec.index);
    this.headParse(head + '\n');
    this.content = markdown.toHTML(article_string.slice(
            article_exec.index+article_exec[1].length, -1
    ));

    this.push(new Buffer(
        this.getObj()
    ));
    done();
};

module.exports = ArticleParse;
