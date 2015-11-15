#! /usr/bin/env node

var program = require('commander');
var compile = new require('../util/comileJade.js')();
var path = require('path');

program
  .version('0.0.1')
  .arguments('<cmd> [env]', 'Build Files')
  .action(function (cmd, env) {
    cmdValue = cmd;
    envValue = env;
  })
  .option('-s --server', 'Start a Server')
  .parse(process.argv);

if (typeof cmdValue === 'undefined') {
  console.error('no arguments');
  process.exit(1);
}else {
  if (cmdValue === 'start') {
    console.log('build....');
    compile.build();
    console.log('build complete');
  }
}

if (program.server) {
  console.log('start server...');
  var Childprocess = require('child_process');
  Childprocess.exec('node server.js', {
    cwd: path.resolve(__dirname, '../server/')},
    function(error, stdout, stderr) {
      if (error !== null) {
        console.error('error:'+error);
      }
      console.log('Bye');
  }).stdout.pipe(process.stdout);
}
