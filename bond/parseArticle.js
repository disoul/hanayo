var markdown = require('markdown').markdown;
var Transform = require('stream').Transform;
var fs = require('fs');
var util = require('util');

util.inherits(ArticleParse, Transform);

var article = fs.createReadStream('./article/test', {encoding: 'utf8'});

function ArticleParse(opt) {
    if (!(this instanceof ArticleParse))
        return new ArticleParse(opt);

    Transform.call(this, opt);
    var self = this;

    this.headParse = function(str) {
        var re = /title: *(\S*)\n/;
        var title,tags,author;
        if ((title = re.exec(str)) !== null) {
            self.push(new Buffer(
                "<div class='article_title'><p>"+title[1]+"</p><div>"
            ));
        }
        re = /tag: *(\S*)\n/;
        if ((tags = re.exec(str)) !== null){
            tags[1].split(',').map(function(ele) {
                console.log(ele);
                self.push(new Buffer(
                    "<div class='article_tag'><p>"+ele+"</p></div>"
                ));
            });
        }
        re = /author: *(\S*)\n/;
        if ((author = re.exec(str)) !== null){
            console.log(author);
            self.push(new Buffer(
                "<div class='article_author'><p>"+author[1]+"</p></div>"
            ));
        }
    };
}

ArticleParse.prototype._transform = function(chunk, encoding, done) {
    var article_string = chunk.toString();
    var re = /(\n----+)/;
    var article_exec = re.exec(article_string);
    console.log(re.exec(article_string));
    var head = article_string.slice(0, article_exec.index);
    this.headParse(head + '\n');
    this.push(new Buffer(
        '<div class="article_content">'+
        markdown.toHTML(article_string.slice(
            article_exec.index+article_exec[1].length, -1
        ))+'</div>'
    ));


};
