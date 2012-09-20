(function () {
  'use strict';

  var LittleSmallscript, fs, optimist, argv, readline, rl;
  
  LittleSmallscript = require("./littlesmallscript").LittleSmallscript;
  
  fs = require('fs');

  optimist = require('optimist');
  argv = optimist
      .usage('node littlesmallscript')
      .alias('c', 'compile')
      .describe('c', 'compile to JavaScript and save as .js files')
      .alias('i', 'interactive')
      .describe('i', 'run an interactive CoffeeScript REPL')
      .alias('p', 'print')
      .describe('p', 'print out the compiled JavaScript')
      .describe('prettyprint', 'prettyprint the compiled JavaScript')
      .describe('optimize', 'perform optimization')
      .argv;

  function interactiveShell () {
    require('./littlesmallmethods'); //prototype extension

    readline = require('readline'),
    rl = readline.createInterface(process.stdin, process.stdout);
    
    rl.setPrompt("LittleSmallscript>");
    rl.prompt();
    
    rl.on("line", function(input) {
      try {
        var js = new LittleSmallscript(input, {prettyprint:true, optimization:true}).toJS();
        console.log(js+'\n');
        console.log(eval(js)+'\n');
      } catch (err) {
        console.log(err+'\n');
      }
      rl.prompt();
    });
  }

  if (argv.i) return interactiveShell();
  
  return (function () {
    var fileName = argv.c || argv.p;
    if (! fileName) return console.log("file name have to be specified with -c or -p");
    return fs.readFile(fileName, 'utf8', function (err, lssString) {
      if (err) throw err;
      try {
        var js = new LittleSmallscript(lssString, {prettyprint: argv.prettyprint||false, optimization: argv.optimize||false}).toJS();
        if (argv.p) return console.log(js);
        fs.writeFile(argv.c.replace(/\.([^\.])+$/, '.js'), js, function (err) {
          if (err) throw err;
        });
      } catch (err) {
        throw err;
      }
    });
  })();

}).call(this);
