var Readable = require('stream').Readable;
var fs = require('fs');
var util = require('util');
var yaml = require('js-yaml');

util.inherits(YamlParse, Readable);

function YamlParse(opt) {
    if (!(this instanceof YamlParse))
        return new YamlParse(opt);
    
    Readable.call(this, {readableObjectMode: true});
    // Obj Stream
    this.path = opt.ymlpath;
    this._ispush = false;
    var self = this;
}

YamlParse.prototype._read = function(size) {
    var yml = yaml.safeLoad(fs.readFileSync(this.path, 'utf8'));
    this.push(JSON.stringify(yml));
    this.push(null);
};

/* test
var yamlparse = new YamlParse({
    ymlpath: '/home/disoul/Documents/webPoj/bond/views/blog.yml',
});
var out = fs.createWriteStream('out');
yamlparse.pipe(out);
*/
