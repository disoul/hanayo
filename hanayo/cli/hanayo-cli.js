#! /usr/bin/env node

var program = require('commander');
var compile = new require('../build/compile.js')();
var Childprocess = require('child_process');
var path = require('path');
var ncp = require('ncp');
var fs = require('fs');
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
    case 'init':
      init();
      break;
    case 'clean':
      clean();
      break;
  }
}

function build() {
  console.log('build....');
  console.log('compile compass...');
  Childprocess.exec('compass compile', {
    cwd: path.resolve(
      process.cwd(), './views/template/default/public')},
    function(error, stdout, srderr) {
      if (error !== null) {
        console.error('error:', error);
      }
    }
  ).stdout.pipe(process.stdout);
  compile.build();
  console.log('build complete');
}

function server() {
  console.log('start server...');
  Childprocess.exec('node server.js ' + process.cwd(), {
    cwd: path.resolve(__dirname, '../server/')},
    function(error, stdout, stderr) {
      if (error !== null) {
        console.error('error:'+error);
      }
      console.log('Bye');
  }).stdout.pipe(process.stdout);
}

function init() {
  console.log('copy files...');
  ncp.limit = 16;
  ncp(
    path.resolve(__dirname, '../../blog.yml'), 
    path.resolve(process.cwd(), './blog.yml'));
  ncp(
    path.resolve(__dirname, '../../article'), 
    path.resolve(process.cwd(), './article'));
  
  ncp(
    path.resolve(__dirname, '../../views'), 
    path.resolve(process.cwd(), './views'),
    function(err) {
      if (err) throw err;
      console.log('copy complete!');
      console.log('bower install...');
      Childprocess.exec('bower install', {
        cwd: path.resolve(process.cwd(), './views/template/default/public')},
        function(error, stdout, stderr) {
          if (error !== null) {
            console.error('error:', error);
          }
      }).stdout.pipe(process.stdout);
    }
  );
}

function clean() {
  console.log('clean...');
  compile.clean();
}
