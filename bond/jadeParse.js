var Duplex = require('stream').Duplex;
var jade = require('jade');
var util = require('util');
var fs = require('fs');

util.inherits(JadeParse, Duplex);

function JadeParse(opt) {
    if (!(this instanceof JadeParse))
        return new JadeParse(opt);

    Duplex.call(this, opt);
    var self = this;

    this.obj = {};
    this.articles = { articles: [] };
    this.mergeObj = function(obj) {
        for (var attr in obj) {
            self.obj[attr] = obj[attr];
        }
    };
    this.updateObj = function(obj) {
        console.log(self.obj, self.articles, obj);
        if (obj.flag == 'article') {
            self.articles.articles.push(obj); 
            Object.assign(self.obj, self.articles);
            return;
        }
        Object.assign(self.obj, obj);
    };
}

JadeParse.prototype._write = function(chunk, encode, callback) {
    var chunkObj = JSON.parse(chunk.toString());
    if (chunkObj.flag == 'article') {
        this.articles.articles.push(chunkObj);
        this.mergeObj(this.articles);
    }else {
        this.mergeObj(chunkObj);
    }
    console.log(chunkObj);

    //this.push(JSON.stringify(this.obj));
    callback();
};

JadeParse.prototype._read = function(size) {
    this.push(JSON.stringify(this.obj));
    this.push(null);
}

module.exports = JadeParse;
