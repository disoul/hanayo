var Transform = require('stream').Transform;
var jade = require('jade');
var util = require('util');
var fs = require('fs');

util.inherits(JadeParse, Transform);

function JadeParse(opt) {
    if (!(this instanceof JadeParse))
        return new JadeParse(opt);

    Transform.call(this, opt);
    var self = this;

    this.obj = {};
}

JadeParse.prototype._transform = function(chunk, encode, callback) {
    console.log(chunk.toString());
    console.log('///');    
    this.push(chunk);
    callback();
};

module.exports = JadeParse;
