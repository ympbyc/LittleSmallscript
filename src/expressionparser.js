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

  var LittleParsers, optimization, ExpressionParser, 
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
    optimization = require('./optimization');
  } catch (err) {
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
    if ( ! (optimization = window.optimization)) throw "optimization.js is required";
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
        var se, conti, brackets;
        se = _this.simpleExpression(); // obj mes / obj sel arg / obj kw: arg kw2: arg
        try {
          _this.notFollowedBy(function () { _this.skipSpace(); _this.semicolon(); });
          brackets = "";
          conti = _this.many(function () {
            var conti = _this.continuation();
            brackets += "(";
            return conti + ")";
          });
          if ( ! conti) return se;
          return brackets + se + conti;
        } catch (e) {}
        conti = _this.optional(function () {
          return _this.many(function () {
            _this.skipSpace();
            _this.semicolon();
            _this.skipSpace();
            return "_receiver" + _this.continuation() + ";";
          });
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
          _this.binaryExpression,
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
            methodCall,
            methodName,
            args,
            tmp;
        receiver = _this.primaryReceiver();
        tmp = _this.keywordMessage();
        methodCall = tmp.methodCall;
        methodName = tmp.methodName;
        args = tmp.args;
        
        //optimize if optimization is available
        if (_this.options.optimization && optimization.optimizationAvailable(methodName))
          return optimization.optimize(receiver, methodName, args);

        return receiver + "." + methodCall;
      });
    };

    // from | sel1: arg1 sel2: arg2
    // to   | sel1_sel2_(arg1, arg2)
    ExpressionParser.prototype.keywordMessage = function () {
      var _this = this;
      return this.cacheDo("keywordMessage", function () {
        var methodName = "",
        args = [];
        _this.many1(function () {
          _this.skipSpace();
          methodName += _this.keywordSelector().replace(':', ''); // "inject:into" becomes "injectinto" 
          _this.skipSpace();
          args.push(_this.primary())
          _this.skipSpace();
        });
        return {
          methodCall : methodName + "(" + args.join(", ") + ")",
          methodName : methodName,
          args : args
        };
      });  
    };

    ExpressionParser.prototype.binaryExpression = function () {
      var _this = this;
      return this.cacheDo("binaryExpression", function () {
        var receiver,binaryMessage;
        _this.skipSpace();
        receiver = _this.primaryReceiver();
        binaryMessage = _this.binaryMessage();
        return receiver + " " + operator + " " + argument;
      });
    };
    
    // from | <+> 1
    // to   | + 1
    ExpressionParser.prototype.binaryMessage = function () {
      var _this = this;
      return this.cacheDo("binaryMessage", function () {
        var operator, argument;
        _this.skipSpace();
        operator = _this.operator();
        _this.skipSpace();
        argument = _this.primary();
        return operator + " " + argument;
      });
    };

    // from | receiver selector
    // to   | receiver.selector()
    ExpressionParser.prototype.unaryExpression = function () {
      var _this = this;
      return this.cacheDo("unaryExpression", function () {
        var receiver, unarySelector;
        receiver = _this.primaryReceiver();
        _this.skipSpace();
        unarySelector = _this.unarySelector();
        
        //optimize if optimization is available
        if (_this.options.optimization && optimization.optimizationAvailable(unarySelector))
          return optimization.optimize(receiver, unarySelector, []);
        
        return receiver + '.' + unarySelector + '()';
      });
    };
    
    // from | selector
    // to   | selector()
    ExpressionParser.prototype.unaryMessage = function () {
      var _this = this;
      return this.cacheDo("unaryMessage", function () {
        return _this.unarySelector() + '()';
      });
    };

    ExpressionParser.prototype.continuation = function () {
      var _this = this;
      return this.cacheDo("continuation", function () {
        _this.skipSpace();
        return _this.try_(
          function () { return "." + _this.keywordMessage().methodCall; },
          _this.binaryMessage,
          function () { return "." + _this.unaryMessage(); }
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
          _this.primitive,
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


    /*
     * primary used as receiver have following special cases
     * invalid: function(){}() valid: (function () {})()
     * invalid: 1.foo valid: 1 .foo valid: (1).foo
     */
    ExpressionParser.prototype.primaryReceiver = function () {
      var _this = this;
      return this.cacheDo("primaryReceiver", function () {
        return _this.try_(
          function () {
            return _this.numberLiteral() + " ";
          },
          function () {
            return "(" + _this.block() + ")";
          },
          _this.primary
        );
      });
    };

    /*
     * <inline.javascript(code)>
     */
    ExpressionParser.prototype.primitive = function () {
      var _this = this;
      return this.cacheDo("primitive", function () {
        _this.skipSpace();
        return _this.between(
          function () { 
            var ret = _this.chr("<"); 
            _this.notFollowedBy(_this.toParser("-")); 
            return ret; 
          }, 
          _this.anyChar, 
          _this.toParser(">")
        );
      });
    };

    ExpressionParser.prototype.operator = function () {
      var _this = this;
      return this.cacheDo("operator", function () {
        var op;
        _this.skipSpace();
        op = _this.try_(
          _this.toParser("+"),
          _this.toParser("-"),
          _this.toParser("*"),
          _this.toParser("/"),
          _this.toParser("+="),
          _this.toParser("-="),
          _this.toParser("*="),
          _this.toParser("/="),
          _this.toParser("==="),
          _this.toParser("!=="),
          _this.toParser("instanceof"),
          _this.toParser("%"),
          _this.toParser("%="),
          _this.toParser("<"),
          _this.toParser(">"),
          _this.toParser("<="),
          _this.toParser(">="),
          _this.toParser("^"),
          _this.toParser("&&"),
          _this.toParser("||")
        );
        _this.skipSpace();
        return op;
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
