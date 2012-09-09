(function () {
  var LittleSmallscript, readline, rl;
  
  ExpressionParser = require("./expressionparser").ExpressionParser;

  readline = require('readline'),
  rl = readline.createInterface(process.stdin, process.stdout);

  rl.setPrompt("LittleSmallscript>");
  rl.prompt();

  rl.on("line", function(input) {
    console.log(new ExpressionParser(input).expression());
    return;
  });

}).call(this);
