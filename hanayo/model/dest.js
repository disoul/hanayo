var Writable = require('stream').Writable,
      mkdirp = require('mkdirp'),
        path = require('path'),
        util = require('util'),
          fs = require('fs');

util.inherits(DestStream, Writable);

function DestStream(opt) {
  if (!(this instanceof DestStream))
    return new DestStream(opt);

  Writable.call(this, {objectMode: true});
  var self = this;
  this.obj = {};
  this.archivePath = path.resolve(
    __dirname, '../../views/template/default/archives');
}

DestStream.prototype._write = function(chunk, encoding, callback) {
  this.obj = JSON.parse(chunk);
  
};

DestStream.prototype.archives = function(obj) {
  
};

module.exports = DestStream;
