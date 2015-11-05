var JadeParse = require('./jadeParse.js');
var YamlParse = require('./ymlParse.js');

var jade = new JadeParse(),
    yaml = new YamlParse({ymlpath: '/home/disoul/Documents/webPoj/bond/views/blog.yml'});

yaml.pipe(jade);
