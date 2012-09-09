/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * LittleParsers
 * super class for more specialized parsers
 * declare common parsers here
 */
(function () {
  'use strict';
  
  var Packrat, LittleParsers, ExpressionParser, BlockParser;

  try {
    Packrat = require('./packratparser').Packrat;
  } catch (err) {
    if ( ! (Packrat = window.Packrat)) throw "packrat.js is required";
  }

  LittleParsers = (function () { 
    var LittleParsers;
    
    LittleParsers = function (input) {
      this.cache = {};
      this.input = input;
    };
    LittleParsers.prototype = new Packrat("");

    // whitespace
    LittleParsers.prototype.space = function () {
      var _this = this;
      return this.cacheDo("space", function () { return _this.regex(/^[\s\n\t]+/); });
    };
    
    // [
    LittleParsers.prototype.blockStart = function () {
      var _this = this;
      return this.cacheDo("blockStart", function () {return _this.chr("[");});
    };
    
    // ]
    LittleParsers.prototype.blockEnd = function () {
      var _this = this;
      return this.cacheDo("blockEnd", function () {return _this.chr("]");});
    };
    
    // | 
    LittleParsers.prototype.verticalBar = function () {
      var _this = this;
      return this.cacheDo("verticalBar", function () {return _this.chr("|");});
    };

    // :
    LittleParsers.prototype.colon = function () {
      var _this = this;
      return this.cacheDo("colon", function () {return _this.chr(":");});
    };

    // ;
    LittleParsers.prototype.semicolon = function () {
      var _this = this;
      return this.cacheDo("colon", function () { return _this.chr(";") });
    }

    // <-
    LittleParsers.prototype.assignmentArrow = function () {
      var _this = this;
      return this.cacheDo("assignmentArrow", function () { 
        return _this.string("<-");
      });
    };
    
    // '
    LittleParsers.prototype.apostrophe = function () {
      var _this = this;
      return this.cacheDo("apostrophe", function () { 
        return _this.string("'");
      });
    };

    // 1, "foo", #(1 2 3)
    LittleParsers.prototype.literal = function () {
      var _this = this;
      return this.cacheDo("literal", function () { 
        return _this.try_(
          _this.numberLiteral,
          _this.stringLiteral,
          _this.arrayLiteral
        );
      });
    };
    
    // 1, 1.1
    LittleParsers.prototype.numberLiteral = function () {
      var _this = this;
      return this.cacheDo("numberLiteral", function () { 
        return _this.regex(/^[0-9]+/);
      });
    };

    // 'quick brown fox jumps over the lazy dog'
    LittleParsers.prototype.stringLiteral = function () {
      var _this = this;
      return this.cacheDo("stringLiteral", function () {
        return '"' + _this.between(
          _this.apostrophe,
          _this.anyChar,
          _this.apostrophe
        ) + '"';
      });
    };
    
    // #(1 2 3) -> [1, 2, 3]
    LittleParsers.prototype.arrayLiteral = function () {
      var _this = this;
      return this.cacheDo("arrayLiteral", function () {
        var ret = "";
        _this.string("#(");
        ret += "[";
        ret += _this.many(function () {
          _this.skipSpace();
          //return _this.expression() + ",";
          return _this.primary() + ",";
        }).slice(0, -1);
        _this.chr(")");
        ret += "]";
        return ret;
      });
    };

    // only alpha-numeric characters (plus $ and _) are accepted due to javasript's limitation
    LittleParsers.prototype.variable = function () {
      var _this = this;
      return this.cacheDo("variable", function () {return _this.regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);});
    };

    // :foo
    LittleParsers.prototype.colonVariable = function () {
      var _this = this;
      return this.cacheDo("colonVariable", function () {
        return _this.sequence(_this.colon, _this.variable);
      });
    };

    // foo:
    LittleParsers.prototype.keywordSelector = function () {
      var _this = this;
      return this.cacheDo("keywordSelector", function () {
        return _this.sequence(_this.variable, _this.colon);
      });
    };
    
    // foo
    LittleParsers.prototype.unarySelector = LittleParsers.prototype.variable;
    
    // ignore whitespaces
    LittleParsers.prototype.skipSpace = function () {
      return this.optional(this.space);
    };
    
    // ^ can be prefixed to the last expression in a statement
    LittleParsers.prototype.explicitReturn = function () {
      return _char("^");
    };

    /*                             cascade *
     * variable <-@recur(variable)         
    LittleParsers.prototype.expression = function () {
      var _this = this;
      if (ExpressionParser===null || ExpressionParser===undefined) {
        try {
          ExpressionParser = require("./expressionparser").ExpressionParser;
        } catch (e) {
          ExpressionParser = window.ExpressionParser;
        }
      }
      return this.cacheDo("expression", function () {
        var ep, ret;
        ep = new ExpressionParser(this.input.substring(this.index));
        ret = ep.expression();
        _this.index += ep.index;
        return ret;
      });
    };
    
    /* [                 blockstatement ] *
     *   blockparameters                  
    LittleParsers.prototype.block = function () {
      var _this = this;
      if (BlockParser===null || BlockParser===undefined) {
        try {
          BlockParser = require("./blockparser").BlockParser;
        } catch (e) {
          BlockParser = window.BlockParser;
        }
      }
      return this.cacheDo("block", function () {
        var bp, ret;
        bp = new BlockParser(this.input.substring(this.index));
        ret = bp.block();
        _this.index += bp.index;
        return ret;
      });
    };
    */

    return LittleParsers;
  })()
  
  try {
    exports.LittleParsers = LittleParsers;
  } catch (err) {}
  try {
    window.LittleParsers = LittleParsers;
  } catch (err) {}

}).call(this);
