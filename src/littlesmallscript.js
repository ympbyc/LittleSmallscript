/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * LittleSmallscript
 * super class for more specialized parsers
 * declare common parsers here
 */
(function () {
  'use strict';
  
  var Packrat, LittleSmallscript;

  try {
    Packrat = require('./packratparser').Packrat;
  } catch (err) {
    if ( ! (Packrat = window.Packrat)) throw "packrat.js is required";
  }

  LittleSmallscript = (function () { 
    var Smallscript;
    
    Smallscript = function (input) {
      this.cache = {};
      this.input = input;
    };
    Smallscript.prototype = new Packrat("");

    // whitespace
    Smallscript.prototype.space = function () {
      var _this = this;
      return this.cacheDo("space", function () { return _this.regex(/^[\s\n\t]+/); });
    };
    
    // [
    Smallscript.prototype.blockStart = function () {
      var _this = this;
      return this.cacheDo("blockStart", function () {return _this.chr("[");});
    };
    
    // ]
    Smallscript.prototype.blockEnd = function () {
      var _this = this;
      return this.cacheDo("blockEnd", function () {return _this.chr("]");});
    };
    
    // | 
    Smallscript.prototype.verticalBar = function () {
      var _this = this;
      return this.cacheDo("verticalBar", function () {return _this.chr("|");});
    };

    // :
    Smallscript.prototype.colon = function () {
      var _this = this;
      return this.cacheDo("colon", function () {return _this.chr(":");});
    };

    // ;
    Smallscript.prototype.semicolon = function () {
      var _this = this;
      return this.cacheDo("colon", function () { return _this.chr(";") });
    }

    // <-
    Smallscript.prototype.assignmentArrow = function () {
      var _this = this;
      return this.cacheDo("assignmentArrow", function () { 
        return _this.string("<-");
      });
    };
    
    // '
    Smallscript.prototype.apostrophe = function () {
      var _this = this;
      return this.cacheDo("apostrophe", function () { 
        return _this.string("'");
      });
    };

    // 1, "foo", #(1 2 3)
    Smallscript.prototype.literal = function () {
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
    Smallscript.prototype.numberLiteral = function () {
      var _this = this;
      return this.cacheDo("numberLiteral", function () { 
        return _this.regex(/^[0-9]+/);
      });
    };

    // 'quick brown fox jumps over the lazy dog'
    Smallscript.prototype.stringLiteral = function () {
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
    Smallscript.prototype.arrayLiteral = function () {
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
    Smallscript.prototype.variable = function () {
      var _this = this;
      return this.cacheDo("variable", function () {return _this.regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);});
    };

    // :foo
    Smallscript.prototype.colonVariable = function () {
      var _this = this;
      return this.cacheDo("colonVariable", function () {
        return _this.sequence(_this.colon, _this.variable);
      });
    };

    // foo:
    Smallscript.prototype.keywordSelector = function () {
      var _this = this;
      return this.cacheDo("keywordSelector", function () {
        return _this.sequence(_this.variable, _this.colon);
      });
    };
    
    // ignore whitespaces
    Smallscript.prototype.skipSpace = function () {
      return this.optional(this.space);
    };
    
    // ^ can be prefixed to the last expression in a statement
    Smallscript.prototype.explicitReturn = function () {
      return _char("^");
    };
    
    return Smallscript;
  })()
  
  try {
    exports.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  try {
    window.LittleSmallscript = LittleSmallscript;
  } catch (err) {}

}).call(this);
