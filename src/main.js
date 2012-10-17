#!/usr/bin/env node

(function () {
  'use strict';

  var LittleSmallscript, fs, optimist, argv, readline, rl, help, VERSION;

  VERSION = 1.0.2;
  
  LittleSmallscript = require("./js/production/littlesmallscript");
  
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

  help = 
"\n \
Usage: littlesmallscript [options] path/to/script.st\n\n \
-c, --compile      compile to JavaScript and save as .js files\n \
-i, --interactive  run an interactive LittleSmallscript REPL\n \
-h, --help         display this help message\n \
-p, --print        print out the compiled JavaScript\n \
";

  if (argv.h) return console.log(help);

  if (argv.v) return console.log(VERSION);

  if (argv.i) return interactiveShell();
  
  return (function () {
    var fileName = argv.c || argv.p;
    if (! fileName) return console.log(help);
    return fs.readFile(fileName, 'utf8', function (err, lssString) {
      if (err) throw err;
      try {
        var js = new LittleSmallscript().initWithInputandOptions(lssString, {prettyprint: true}).toJS();
        if (argv.p) return console.log(js);
        fs.writeFile(argv.c.replace(/\.([^\.])+$/, '.js'), js, function (err) {
          if (err) throw err;
        });
      } catch (err) {
        console.log(err.message||err.type||JSON.stringify(err));
        if (err.partialjs) console.log('###partial js###\n'+err.partialjs+'\n#########');
        throw err;
      }
    });
  })();

}).call(this);
