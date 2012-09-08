/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * BlockParser
 * convert smalltalk style block to javascript's closure
 */
(function () {
  'use strict';

  var Packrat, BlockParser, 
  __each = function (obj, fn) {
    for (var key in obj)
      if (obj.hasOwnProperty(key))
        fn(obj[key], key);
    return;
  },
  __template = function (template, hashmap) {
    var dest_str = template;
    __each(hashmap, function (it, key) {
      dest_str = dest_str.replace(new RegExp('%'+key+'%', 'g'), it || "");
    });
    return dest_str;
  };

  try {
    Packrat = require('packratparser').Packrat;
  } catch (err) {
    if ( ! (Packrat = window.Packrat)) throw "packrat.js is required";
  }


  function BlockParser (input) {
    this.cache = {};
    this.input = input;
    this.destinationTemplate = "function (%parameters%) { %body% }";
  };
  BlockParser.prototype = new Packrat("");

  BlockParser.prototype.block = function () {
    var _this = this;
    return this.cacheDo("block", function () {
      var parameters, body;
      _this.blockStart();
      parameters = _this.blockHead();
      body = _this.body();
      _this.blockEnd();
      return __template(this.destinationTemplate, {parameters:parameters, body:body});
    });
  };

  BlockParser.prototype.space = function () {
    var _this = this;
    return this.cacheDo("space", function () { return _this.regex(/^[\s\n\t]+/); });
  };

  BlockParser.prototype.blockStart = function () {
    var _this = this;
    return this.cacheDo("blockStart", function () {return _this.chr("[");});
  };

  BlockParser.prototype.blockEnd = function () {
    var _this = this;
    return this.cacheDo("blockEnd", function () {return _this.chr("]");});
  };

  BlockParser.prototype.variable = function () {
    var _this = this;
    return this.cacheDo("variable", function () {return _this.regex(/^[a-zA-Z]+/);});
  };

  BlockParser.prototype.colon = function () {
    var _this = this;
    return this.cacheDo("colon", function () {return _this.chr(":");});
  };

  BlockParser.prototype.variables = function () {
    var _this = this;
    return this.cacheDo("variables", function () {
      vars = "";
      _this.many(function () {
        _this.colon();
        vars += _this.variable() + ", ";
        _this.skipSpace();
      });
      return vars.slice(0, -2);
    });
  };

  BlockParser.prototype.colonVariable = function () {
    var _this = this;
    return this.cacheDo("colonVariable", function () {
      return _this.sequence(_this.colon, _this.variable);
    });
  };

  BlockParser.prototype.verticalBar = function () {
    var _this = this;
    return this.cacheDo("verticalBar", function () {return _this.chr("|");});
  };

  BlockParser.prototype.blockHead = function () {
    var _this = this;
    return this.cacheDo("blockHead", function () {
      return _this.optional(function () {
        var params;
        params = _this.variables();
        _this.verticalBar();
        return params;
      });
    });
  };

  BlockParser.prototype.expression = function () {
    var _this = this;
    return this.cacheDo("expression", function () {
      return _this.try_(
        _this.block,
        function () {
          return _this.regex(/^[^\[\]\.]+/);
        }
      );
    });
  };
      
  BlockParser.prototype.skipSpace = function () {
    return this.optional(this.space);
  };

  BlockParser.prototype.body = function () {
    var _this = this;
    return this.cacheDo("body", function () {
      var ret ="";

      _this.skipSpace();
      ret += _this.many(function () {
        var a;
        a = _this.expression();
      
        _this.skipSpace();
        _this.chr(".");
        _this.skipSpace();
        
        return a + "; ";
      });
      
      ret += " return " + _this.expression() + ";";
      _this.skipSpace();

      return ret;
    });
  };

  if ( ! exports) var exports = window;
  exports.BlockParser = BlockParser;
  
  (function () {
    " examples "
    new BlockParser("[1]").block(); //"function () {  return 1; }"
    new BlockParser("[:a| [1] ]").block(); //"function (a) {  return function () {  return 1; }; }"
    new BlockParser("[:foo :bar| [foo]. bar]").block(); //"function (foo, bar) { function () {  return foo; };  return bar; }"
  })();

}).call(this);
