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
  
  var Packrat, LittleParsers;

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
      return this.cacheDo("colon", function () { return _this.chr(";"); });
    };

    // <- or :=
    LittleParsers.prototype.assignmentArrow = function () {
      var _this = this;
      return this.cacheDo("assignmentArrow", function () { 
        return _this.try_(
          function () { return _this.string(":="); },
          function () { return _this.string("<-"); }
        );
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
          _this.symbolLiteral,
          _this.arrayLiteral,
          _this.hashLiteral
        );
      });
    };
    
    // 1, 1.1
    LittleParsers.prototype.numberLiteral = function () {
      var _this = this;
      return this.cacheDo("numberLiteral", function () { 
        return _this.regex(/^-?[0-9]+(\.?[0-9]+)?/);
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
        ).replace(/\n/g, '\\n') + '"';
      });
    };
    
    // #abc -> "abc"
    LittleParsers.prototype.symbolLiteral = function () {
      var _this = this;
      return this.cacheDo("symbolLiteral", function () {
        _this.chr('#');
        return '"' + _this.variable() + '"';
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
          var item;
          _this.skipSpace();
          item = _this.expression() + ",";
          _this.skipSpace();
          _this.optional(function () { return _this.chr(","); });
          return item;
        }).slice(0, -1);
        _this.skipSpace();
        _this.chr(")");
        ret += "]";
        return ret;
      });
    };
    
    LittleParsers.prototype.hashLiteral = function () {
      var _this = this;
      return this.cacheDo("hashLiteral", function () {
        var ret = "";
        _this.string("#{");
        ret += "{";
        ret += _this.many(function () {
          var key, val;
          _this.skipSpace();
          key = _this.try_(
            _this.stringLiteral,
            _this.numberLiteral,
            _this.symbolLiteral
          );
          _this.skipSpace();
          _this.chr(':');
          _this.skipSpace();
          val = _this.expression();
          _this.skipSpace();
          _this.optional(function () { return _this.chr(","); });
          return key + ':' + val + ',';
        }).slice(0, -1);
        _this.skipSpace();
        _this.chr("}");
        ret += "}";
        return ret;
      });
    };

    // only alpha-numeric characters (plus $ and _) are accepted due to javasript's limitation
    LittleParsers.prototype.variable = function () {
      var _this = this;
      return this.cacheDo("variable", function () {
        var v = _this.regex(/^[a-zA-Z_$@][a-zA-Z0-9_$]*/);
        if (v === 'self') return 'this';
        if (v[0] === '@') return 'this.'+v.substring(1); //@foo -> this.foo
        return v;
      });
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
    
    // ignore whitespaces and comments
    LittleParsers.prototype.skipSpace = function () {
      var _this = this;
      this.optional(this.space);
      this.optional(function () { return _this.between(_this.commentQuote, _this.anyChar, _this.commentQuote); });
      return this.optional(this.space);
    };
    
    LittleParsers.prototype.commentQuote = function () {
      var _this = this;
      return this.cacheDo("commentQuote", function () {
        return _this.chr('"');
      });
    }; 
    
    // ^ can be prefixed to the last expression in a statement
    LittleParsers.prototype.explicitReturn = function () {
      return this.chr("^");
    };

    return LittleParsers;
  })();
  
  try {
    exports.LittleParsers = LittleParsers;
  } catch (err) {}
  try {
    window.LittleParsers = LittleParsers;
  } catch (err) {}

}).call(this);
