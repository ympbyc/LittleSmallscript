/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * StatementParser
 * parse statements
 */
(function () {
  'use strict';

  var LittleParsers, StatementParser;

  try {
    LittleParsers = require('./statementparsers').LittleParsers;
  } catch (err) {
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
  }

  StatementParser = (function () {
    var StatementParser;
    
    StatementParser = function (input) {
      this.cache = {};
      this.input = input;
    }
    StatementParser.prototype = new LittleParsers("");

    /*    expression                     *
     *  ^                                *
     *               .@recur(expression) */
    StatementParser.prototype.statement = function () {
      var _this = this;
      return this.cacheDo("statement", function () {
        var ret ="";

        _this.skipSpace();
        ret += _this.optional(_this.variableDeclaration) || ""; // | foo bar |

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
        _this.skipSpace();
        ret += " return " + _this.expression() + ";";
        _this.skipSpace();
        _this.optional(function () { return _this.chr("."); });

        return ret;
      });
    };

    StatementParser.prototype.variableDeclaration = function () {
      var _this = this;
      return this.cacheDo("variableDeclaration", function () {
        var ret = "var ";
        _this.skipSpace();
        _this.verticalBar();
        ret += _this.many(function () {
          _this.skipSpace();
          return _this.variable() + ", ";
        }).replace(/,\s$/, '; ');
        _this.skipSpace();
        _this.verticalBar();
        return ret;
      });
    };

    return StatementParser;
  })();

  try {
    exports.StatementParser = StatementParser;
  } catch (err) {}
  try{
    window.StatementParser = StatementParser;
  } catch (err) {}
  
}).call(this);
