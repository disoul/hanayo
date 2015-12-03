var ArticleParse = require('../model/parseArticle.js'),
     JadeParse = require('../model/jadeParse.js'),
     YamlParse = require('../model/ymlParse.js'),
  previewParse = require('../model/previewParse.js'),
     DestParse = require('../model/dest.js'),
          exec = require('child_process').exec,
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

  this.clean = function() {
    var rmflag = false;
    var rmCallback = function(err) {
      if (err) throw err;
      if (rmflag) {
        console.log('clean complete');
      } else {
        rmcount = true;
      }
    };

    exec('rm -r ' + path.resolve(process.cwd(), './views/tag'), rmCallback);
    exec('rm -r ' + path.resolve(process.cwd(), './views/archives'), rmCallback);
  };
}

module.exports = CompileJade;
