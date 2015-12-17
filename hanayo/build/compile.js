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
    console.log('build....');

    var yaml = YamlParse();
    var dest = DestParse();
    var globalConfig = {};

    yaml.on('data', function(chunk) {
      globalConfig = JSON.parse(chunk.toString());
      console.log('theme: ', globalConfig.theme);
      
      
      console.log('compile compass...');
      exec('compass compile', {
        cwd: path.resolve(
          process.cwd(), './views/template', globalConfig.theme, 'public')},
        function(error, stdout, srderr) {
          if (error !== null) {
            console.error('error:', error);
          }
          console.log('copy static files..')
          ncp.limit = 16;
          ncp(
              path.resolve(
                  process.cwd(), 
                  './views/template', globalConfig.theme, 'public'),
              path.resolve(
                  process.cwd(),
                  './_build/public')
          );
        }
      ).stdout.pipe(process.stdout);

    });

    yaml
    .pipe(ArticleParse())
    .pipe(previewParse())
    .pipe(JadeParse())
    .pipe(dest);


  };

  this.clean = function() {
    var rmCallback = function(err) {
      if (err) throw err;
      console.log('clean complete');
      }

    exec('rm -r ' + path.resolve(process.cwd(), './_build'), rmCallback);
    };

  // FIXME: update from github
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
