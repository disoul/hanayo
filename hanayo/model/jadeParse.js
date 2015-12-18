var Duplex = require('stream').Duplex;
var jade = require('jade');
var util = require('util');
var fs = require('fs');
var path = require('path');

util.inherits(JadeParse, Duplex);

function JadeParse(opt) {
  if (!(this instanceof JadeParse))
    return new JadeParse(opt);

  Duplex.call(this, {objectMode: true});
  var self = this;
  this.obj = {};
  this.articles = {articles: []};
  
  this.mergeObj = function(obj) {
    for (var attr in obj) {
      self.obj[attr] = obj[attr];
    }
  };

  this.sortObj = function(obj) {
    obj.articles.sort(function(a, b) {
      if (a.time.timestamp > b.time.timestamp) {
        return -1;
      }
      if (a.time.timestamp < b.time.timestamp) {
        return 1;
      } else {
        return 0;
      }
    });

    obj.articleLength = obj.articles.length;

    obj.articles.map(function(article, index) {
      article.index =  obj.articleLength - 1 - index;
    });
  }

  this.isMerge = function(obj) {
    if (Object.keys(this.articles).length === 0) return true;
    if (this.articles.article !== undefined) {
      if (this.articles.article.title == obj.title) {
        return false;
      }else {
        return true;
      }
    }
    for (var i = 0;i<self.articles.articles.length;i++) {
      if (self.articles.articles[i].title == obj.title)
        return false;
    }
    return true;
  };
}

JadeParse.prototype._write = function(chunk, encode, callback) {
  var chunkObj = JSON.parse(chunk.toString());
  if ((chunkObj.flag == 'article') && (this.isMerge(chunkObj))) {
    this.articles.articles.push(chunkObj);
    this.mergeObj(this.articles);
  }else if (chunkObj.flag != 'article'){
    this.mergeObj(chunkObj);
  }

  callback();
  return true;
};

JadeParse.prototype._read = function(size) {
  this.sortObj(this.obj);
  this.push(JSON.stringify(this.obj));
  this.push(null);
};

module.exports = JadeParse;
