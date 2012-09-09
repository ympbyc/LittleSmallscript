/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * ExpressionParser
 * Little Smalltalk expression to Javascript expression
 */
(function () {
  'use strict';

  var LittleParsers, ExpressionParser, 
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
    LittleParsers = require('./littleparsers').LittleParsers;
  } catch (err) {
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
  }

  ExpressionParser = (function () {
    var ExpressionParser;

    ExpressionParser = function (input) {
      this.cache = {};
      this.input = input;
    };
    ExpressionParser.prototype = new LittleParsers("");

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
          tmpl = "(function () { var _receiver = %simpleExpression%; %body% return _receiver;  })()";
      return this.cacheDo("cascade", function () {
        var se, conti;
        se = _this.simpleExpression(); // obj mes / obj sel arg / obj kw: arg kw2: arg
        try {
          if (_this.notFollowedBy(_this.semicolon) === null) return se;
        } catch (e) {}
        conti = _this.optional(function () {
          return _this.many(function () {
            _this.skipSpace();
            _this.semicolon();
            _this.skipSpace();
            return "_receiver" + "." + _this.continuation() + ";";
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
          _this.keywordExpression,
          _this.unaryExpression,
          _this.primary
        );
      });
    };

    // from | receiver keyword1: aaa keyword2: bbb
    // to   | receiver.keyword1_keyword2_(aaa, bbb)
    ExpressionParser.prototype.keywordExpression = function () {
      var _this = this;
      return this.cacheDo("keywordExpression", function () {
        var receiver,
            methodCall;
        receiver = _this.primary();
        methodCall = _this.keywordMessage();
        return "(" + receiver + ")" + "." + methodCall;
      });
    };

    // from | sel1: arg1 sel2: arg2
    // to   | sel1_sel2_(arg1, arg2)
    ExpressionParser.prototype.keywordMessage = function () {
      var _this = this;
      return this.cacheDo("keywordMessage", function () {
        var methodName = "",
        args = "";
        _this.many1(function () {
          var tmpMethodName;
          _this.skipSpace();
          tmpMethodName = _this.keywordSelector().replace(':', '');
          methodName += (methodName.length > 0) ? tmpMethodName[0].toUpperCase() + tmpMethodName.substring(1) : tmpMethodName; //eg: injectInto
          _this.skipSpace();
          args += _this.primary() + ", ";
          _this.skipSpace();
        });
        return methodName + "(" + args.slice(0,-2) + ")";
      });  
    }

    // from | receiver selector
    // to   | receiver.selector()
    ExpressionParser.prototype.unaryExpression = function () {
      var _this = this;
      return this.cacheDo("unaryExpression", function () {
        var a = "";
        a += "(" + _this.primary() + ")";
        _this.skipSpace();
        a += ".";
        _this.skipSpace();
        a += _this.unaryMessage();
        return a;
      });
    };

    // from | selector
    // to   | selector()
    ExpressionParser.prototype.unaryMessage = function () {
      var _this = this;
      return this.cacheDo("unaryMessage", function () {
        return _this.unarySelector() + "()";
      });
    };


    ExpressionParser.prototype.continuation = function () {
      var _this = this;
      return this.cacheDo("continuation", function () {
        return _this.try_(
          _this.keywordMessage,
          _this.unaryMessage
        );
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
            ret = _this.cascade();
            _this.chr(")");
            return ret;
          }
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
