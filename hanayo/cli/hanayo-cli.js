#! /usr/bin/env node

var program = require('commander');
var compile = new require('../util/comileJade.js')();
var Childprocess = require('child_process');
var path = require('path');
var cmdValue,envValue = '';
program
  .version('0.0.1')
  .arguments('<cmd> [env]', 'Build Files')
  .action(function (cmd, env) {
    cmdValue = cmd;
    envValue = env;
  })
  .parse(process.argv);

if (typeof cmdValue === 'undefined') {
  console.error('no arguments');
  process.exit(1);
} else {
  switch(cmdValue) {
    case 'build':
      build();
      break;
    case 'server':
      server();
      break;
  }
}

function build() {
  console.log('build....');
  compile.build();
  console.log('build complete');
}

function server() {
  console.log('start server...');
  Childprocess.exec('node server.js', {
    cwd: path.resolve(__dirname, '../server/')},
    function(error, stdout, stderr) {
      if (error !== null) {
        console.error('error:'+error);
      }
      console.log('Bye');
  }).stdout.pipe(process.stdout);
}
