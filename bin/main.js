#!/usr/bin/env node

(function () {
  'use strict';

  var LittleSmallscript, fs, optimist, argv, readline, rl, help, VERSION;

  VERSION = 'littlesmallscript 1.0.3';
  
  LittleSmallscript = require("../src/js/production/littlesmallscript");
  
  fs = require('fs');

  optimist = require('optimist');
  argv = optimist
      .usage('node littlesmallscript')
      .alias('h', 'help')
      .describe('h', 'show help message')
      .alias('c', 'compile')
      .describe('c', 'compile to JavaScript and save as .js files')
      .alias('i', 'interactive')
      .describe('i', 'run an interactive LittleSmallscript REPL')
      .alias('p', 'print')
      .describe('p', 'print out the compiled JavaScript')
      .describe('packed', 'output without prettyprint')
      .alias('v', 'version')
      .describe('v', 'print the version')
      .alias('w', 'watch')
      .describe('watch files in current directory for changes and automaticaly compile them.')
      .argv;

  function interactiveShell () {
    require('./prelude'); //prototype extension

    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);
    
    rl.setPrompt("LittleSmallscript> ");
    rl.prompt();
    
    rl.on("line", function(input) {
      try {
        var js = new LittleSmallscript().initWithInputandOptions(input, {prettyprint:true}).toJS();
        console.log(js+'\n');
        console.log(eval(js)+'\n');
      } catch (err) {
        console.log(err.message || err.type || err+'\n');
        console.log(err.partialjs);
      }
      rl.prompt();
    });
  }

  function compile (fileName) {
    if (! fileName) return console.log(help);
    return fs.readFile(fileName, 'utf8', function (err, lssString) {
      if (err) throw err;
      try {
        var js = new LittleSmallscript().initWithInputandOptions(lssString, {prettyprint: true}).toJS();
        if (argv.p) return console.log(js);
        fs.writeFile(fileName.replace(/\.([^\.])+$/, '.js'), js, function (err) {
          if (err) throw err;
        });
      } catch (err) {
        console.log(err.message||err.type||JSON.stringify(err));
        throw err;
      }
    });
  }

  help = 
"\n \
Usage: littlesmallscript [options] path/to/script.st\n\n \
-c, --compile      compile to JavaScript and save as .js files\n \
-h, --help         display this help message\n \
-i, --interactive  run an interactive LittleSmallscript REPL\n \
-p, --print        print out the compiled JavaScript\n \
-v, --version      print out the version\n \
-w, --watch        watch *.st files in current directory for changes and automaticaly compile them\n \
";

  if (argv.h) return console.log(help);

  if (argv.v) return console.log(VERSION);

  if (argv.i) return interactiveShell();

  if (argv.w) return fs.readdir('.', function (err, files) {
    //--watch
    files.forEach(function (fileName) {
      if (fileName.slice(fileName.length - 3) !== '.st') return;
      fs.watchFile(fileName, {interval:5000}, function (curr, prev) {
        if (curr.mtime !== prev.mtime) {
          console.log("compiling "+fileName+"...\n");
          return compile(fileName);
        }
      });
    });
  });
  
  return compile(argv.c || argv.p);

}).call(this);
