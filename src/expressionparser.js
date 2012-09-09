/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * ExpressionParser
 * convert smalltalk style block to javascript's closure
 */
(function () {
  'use strict';

  var LittleSmallscript, ExpressionParser, BlockParser, 
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
    BlockParser = require('./blockparser').BlockParser;
  } catch (err) {
    if ( ! (LittleSmallscript = window.LittleSmallscript)) throw "littlesmallscript.js is required";
    if ( ! (BlockParser = window.BlockParser)) throw "blockparser.js is required";
  }

  ExpressionParser = (function () {
    var ExpressionParser;

    ExpressionParser = function (input) {
      this.cache = {};
      this.input = input;
    };
    ExpressionParser.prototype = new LittleSmallscript("");

    /*                             cascade *
     * variable <-@recur(variable)         */
    ExpressionParser.prototype.expression = function () {
      var assignments,
          cascade,
          _this = this,
          tmpl = "%assignments% %cascade%"; // a = b = A new
      return this.cacheDo("expression", function () {
        assignments = _this.optional(_this.assignments);
        cascade = _this.cascade();
        return __template(tmpl, {assignments:assignments, cascade:cascade});
      });
    };

    ExpressionParser.prototype.assignments = function () {
      var _this = this;
      return this.cacheDo("assignments", function () {
        return _this.many(function () {
          var a = "";
          a += _this.variable();
          _this.skipSpace(),
          _this.assignmentArrow();
          _this.skipSpace();
          a += " = ";
          return a;
        });
      });
    };
    
    /*
     * obj mes / obj kw: arg - simpleExpression
     * obj mes ; mes2 ; kw: arg - cascade
     */
    ExpressionParser.prototype.cascade = function () {
      var _this = this,
          tmpl = "(function () { var receiver = %simpleExpression%; %body% return receiver;  })()";
      return this.cacheDo("cascade", function () {
        var se, conti;
        se = _this.simpleExpression(); // obj mes / obj sel arg / obj kw: arg kw2: arg
        if (_this.notFollowedBy(_this.semicolon) === null) return se;
        conti = _this.optional(function () {
          return _this.many(function () {
            _this.skipSpace();
            _this.semicolon();
            _this.skipSpace();
            return "receiver" + _this.continuation() + ";";
          })
        });
        return __template(tmpl, {simpleExpression:se, body:conti});
      });
    };
    
    /*
     * receiver
     * receiver unarySelector
     * receiver keyword: argument ...
     */
    ExpressionParser.prototype.simpleExpression = function () {
      var _this = this;
      return this.cacheDo("simpleExpression", function () {
        return _this.try_(
          _this.keywordMessage,
          _this.unaryMessage
        );
      });
    };

    // from | receiver keyword1: aaa keyword2: bbb
    // to   | receiver.keyword1_keyword2_(aaa, bbb)
    ExpressionParser.prototype.keywordMessage = function () {
      var _this = this;
      return this.cacheDo("keywordMessage", function () {
        var receiver,
        methodName = "",
        args = "";
        receiver = _this.primary();
        _this.many1(function () {
          _this.skipSpace();
          methodName += _this.keywordSelector().replace(':', '_');
          _this.skipSpace();
          args += _this.primary() + ", ";
          _this.skipSpace();
        });
        return receiver + "." + methodName + "(" + args.slice(0,-2) + ")";
      });
    };

    // receiver selector
    ExpressionParser.prototype.unaryMessage = function () {
      var _this = this;
      return this.cacheDo("unaryMessage", function () {
        var a = "";
        a += _this.primary();
        _this.skipSpace();
        a += ".";
        _this.skipSpace();
        a += _this.variable() + "()";
        return a;
      });
    };
    
    /*
     * variable, literal, block, primitive, (cascade)
     */
    ExpressionParser.prototype.primary = function () {
      var _this = this;
      return this.cacheDo("primary", function () {
        return _this.try_(
          _this.variable,
          _this.literal,
          _this.block,
          //_this.primitive,
          function () {
            var ret;
            _this.chr("(");
            ret = _this.cascade;
            _this.chr(")");
            return ret;
          }
        );
      });
    };

    ExpressionParser.prototype.continuation = function () {
      var _this = this;
      return this.cacheDo("continuation", function () {
        return _this.try(
          _this.keywordMessage,
          _this.unaryMessage
        );
      });
    };

    return ExpressionParser;
  })();

  try {
    exports.ExpressionParser = ExpressionParser;
  } catch (err) {}
  try {
    window.ExpressionParser = ExpressionParser;
  } catch (err) {}
 
}).call(this);
