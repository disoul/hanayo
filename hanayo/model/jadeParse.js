var Duplex = require('stream').Duplex;
var jade = require('jade');
var util = require('util');
var fs = require('fs');
var path = require('path');

util.inherits(JadeParse, Duplex);

function JadeParse(opt) {
  if (!(this instanceof JadeParse))
    return new JadeParse(opt);

  Duplex.call(this, opt);
  var self = this;
  if (opt && opt.jadePath !== undefined) {
    this.jadePath = opt.jadePath;
  }else {
    this.jadePath = path.resolve(
      __dirname, '../../views/template/default/pages');
  }
  this.jadePage = opt.jadePage;
  this.obj = {};
  this.articles = {};
  this.mergeObj = function(obj) {
    for (var attr in obj) {
      self.obj[attr] = obj[attr];
    }
  };
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
    if (Object.keys(this.articles).length === 0) {
      this.articles = { article: chunkObj };
    }else if (this.articles.article !== undefined ){
      this.articles = { articles: [this.articles.article]};
      this.articles.article = undefined;
      this.articles.articles.push(chunkObj);
    }else {
      this.articles.articles.push(chunkObj);
    }
    this.mergeObj(this.articles);
  }else if (chunkObj.flag != 'article'){
    this.mergeObj(chunkObj);
  }

  callback();
  return true;
};

JadeParse.prototype._read = function(size) {
  var jadefn = jade.compileFile(this.jadePath + '/' + this.jadePage,{
    cache: true,
  });
  this.push(jadefn(this.obj));
  this.push(null);
};

module.exports = JadeParse;
