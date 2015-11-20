var Readable = require('stream').Readable;
var fs = require('fs');
var util = require('util');
var yaml = require('js-yaml');
var path = require('path');

util.inherits(YamlParse, Readable);

function YamlParse(opt) {
  if (!(this instanceof YamlParse))
    return new YamlParse(opt);

  Readable.call(this, {readableObjectMode: true});
  // Obj Stream
  if (opt && opt.ymlpath !== undefined) {
    this.path = opt.ymlpath;
  } else {
    this.path = path.resolve(process.cwd(), './blog.yml');
  }
  this._ispush = false;
  var self = this;
}

YamlParse.prototype._read = function(size) {
  var yml = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'));
  yml.flag = 'config';
  this.push(JSON.stringify(yml));
  this.push(null);
};

module.exports = YamlParse;
