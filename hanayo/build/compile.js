var ArticleParse = require('../model/parseArticle.js'),
     JadeParse = require('../model/jadeParse.js'),
     YamlParse = require('../model/ymlParse.js'),
  previewParse = require('../model/previewParse.js'),
     DestParse = require('../model/dest.js'),
          exec = require('child_process').exec,
           ncp = require('ncp'),
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
    var rmCallback = function(err) {
      if (err) throw err;
      console.log('clean complete');
      }

    exec('rm -r ' + path.resolve(process.cwd(), './_build'), rmCallback);
    };

  this.update = function(theme) {
    exec(
        'rm -r ' + path.resolve(process.cwd(), './views/template', theme),
        function(err) {
          if (err) throw err;
          ncp.limit = 16;
          ncp(
              path.resolve(__dirname, '../../views/template', theme),
              path.resolve(process.cwd(), './views/template', theme)
          );
        }
    );
    
  };
}

module.exports = CompileJade;
