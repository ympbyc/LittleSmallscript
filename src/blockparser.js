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

  var LittleSmallscript, BlockParser, 
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
    LittleSmallscript = require('./littlesmallscript').LittleSmallscript;
  } catch (err) {
    if ( ! (LittleSmallscript = window.LittleSmallscript)) throw "littlesmallscript.js is required";
  }

  BlockParser = (function () {
    var BlockParser;

    BlockParser = function (input) {
      this.cache = {};
      this.input = input;
      this.destinationTemplate = "function (%parameters%) { %body% }";
    };
    BlockParser.prototype = new LittleSmallscript("");

    /* [             blockStatement ] *
     *   parameters                   */
    BlockParser.prototype.block = function () {
      var _this = this;
      return this.cacheDo("block", function () {
        var parameters, body;
        _this.blockStart();
        parameters = _this.blockHead();
        body = _this.blockStatement();
        _this.blockEnd();
        return __template(this.destinationTemplate, {parameters:parameters, body:body});
      });
    };

    /* space-separated sequence of parameters
     * ":foo :bar" -> "foo, bar" */
    BlockParser.prototype.blockParameters = function () {
      var _this = this;
      return this.cacheDo("blockParameters", function () {
        vars = "";
        _this.many(function () {
          _this.colon();
          vars += _this.variable() + ", ";
          _this.skipSpace();
        });
        return vars.slice(0, -2);
      });
    };

    /* consume parameter sequence and return js style parameters
     * ":foo :bar|" -> blockParameters */
    BlockParser.prototype.blockHead = function () {
      var _this = this;
      return this.cacheDo("blockHead", function () {
        return _this.optional(function () {
          var params;
          params = _this.blockParameters();
          _this.verticalBar();
          return params;
        });
      });
    };

    /*                             cascade *
     * variable <-@recur(variable)         */
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

    /*    expression                     *
     *  ^                                *
     *               .@recur(expression) */
    BlockParser.prototype.blockStatement = function () {
      var _this = this;
      return this.cacheDo("blockStatement", function () {
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
        
        _this.optional(_this.explicitReturn);
        ret += " return " + _this.expression() + ";";
        _this.skipSpace();

        return ret;
      });
    };

    return BlockParser;
  })();

  try {
    exports.BlockParser = BlockParser;
  } catch (err) {}
  try{
    window.BlockParser = BlockParser;
  } catch (err) {}
  
  (function () {
    return;
    " examples "
    new BlockParser("[1]").block(); //"function () {  return 1; }"
    new BlockParser("[:a| [1] ]").block(); //"function (a) {  return function () {  return 1; }; }"
    new BlockParser("[:foo :bar| [foo]. bar]").block(); //"function (foo, bar) { function () {  return foo; };  return bar; }"
  })();

}).call(this);
