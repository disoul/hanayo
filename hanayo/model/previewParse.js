var htmlparser = require('htmlparser2');
var select = require('soupselect').select;
var Transform = require('stream').Transform;
var util = require('util');

util.inherits(PreviewParse, Transform);

function PreviewParse(opt) {
  if (!(this instanceof PreviewParse))
    return new PreviewParse(opt);

  Transform.call(this, opt);
  this.isPreview = false;
  this.previewStyle = 'short'; // Default is Short
  var self = this;

  this.getPreview = function(html, callback){
    switch(this.previewStyle) {
      case 'short':
        var handler = new htmlparser.DomHandler(function(err, dom) {
          if (err) {
            throw err;
          } else {
            callback(select(dom, 'p')[0].children[0].data);
          }
        }); 
        var parse = new htmlparser.Parser(handler);
        parse.write(html);
        parse.done();
        break;
    }   
  };

}

PreviewParse.prototype._transform = function(chunk, encode, callback) {
  var chunkObj = JSON.parse(chunk.toString());
  var self = this;
  if (chunkObj.flag == 'config') {
    if (chunkObj.preview.ispreview === true){
      this.isPreview = true;
      this.previewStyle = chunkObj.preview.style;
    }
    this.push(chunk);
    callback();
  }
  if (chunkObj.flag == 'article') {
    if (this.isPreview === true) {
      this.getPreview(chunkObj.content, function(pre) {
        chunkObj.preview = pre;   
        console.log(chunkObj);
        console.log('complete');
        self.push(JSON.stringify(chunkObj));
        callback();
      });
    } else {
      this.push(chunk);
      callback();
    }
  }
};

module.exports = PreviewParse;
