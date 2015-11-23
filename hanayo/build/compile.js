var ArticleParse = require('../model/parseArticle.js'),
     JadeParse = require('../model/jadeParse.js'),
     YamlParse = require('../model/ymlParse.js'),
  previewParse = require('../model/previewParse.js'),
     DestParse = require('../model/dest.js'),
        fs = require('fs'),
      mkdirp = require('mkdirp'),
      path = require('path');

function CompileJade() {
  if (!(this instanceof CompileJade))
    return new CompileJade();


  this.build = function(opt) {
    YamlParse()
    .pipe(ArticleParse())
    .pipe(previewParse())
    .pipe(JadeParse())
    .pipe(DestParse());
  };
}

module.exports = CompileJade;
