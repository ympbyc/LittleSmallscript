(function () {
  var LittleSmallscript, ExpressionParser, BlockParser, readline, rl;
  
  ExpressionParser = require("./expressionparser").ExpressionParser;
  BlockParser = require("./blockparser").BlockParser;

  readline = require('readline'),
  rl = readline.createInterface(process.stdin, process.stdout);

  rl.setPrompt("LittleSmallscript>");
  rl.prompt();

  rl.on("line", function(input) {
    if (input === "Littlesmalltalk exit") {
      rl.close();
      process.stdin.destroy();
      return;
    }
    
    console.log(new ExpressionParser(input).expression());
  });

}).call(this);
