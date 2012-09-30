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
        var se;
        se = _this.simpleExpression(); // obj mes / obj kw: arg kw2: arg / 1+2+3
        return _this.try_(function () {
          _this.skipSpace();
          _this.notFollowedBy(_this.semicolon);
          return se;
        }, function () {
          var conti;
          conti =  _this.many(function () {
            var mes;
            _this.skipSpace();
            _this.semicolon();
            _this.skipSpace();
            mes = _this.continuation();
            //optimize if optimization is available
            if (optimization.optimizationAvailable(mes.methodName)) {
              return optimization.optimize("_receiver", mes.methodName, mes.args) + ';';
            }
            return "_receiver" + mes.toJS() + ";";
          });
          return __template(tmpl, {simpleExpression: se, body: conti});
        });
      });
    };
    
    /*
     * receiver
     * receiver unarySelector
     * receiver keyword: argument ...
     */
    ExpressionParser.prototype.simpleExpression = function (allowedParsers) {
      var _this = this;
      return this.cacheDo("simpleExpression", function () {
        var receiver, injection;
        receiver = _this.primaryReceiver();
        
        injection = receiver;

        _this.many(function () {
          var mes, ret;
          mes = _this.continuation(allowedParsers); //{}

          //optimize if optimization is available
          if (optimization.optimizationAvailable(mes.methodName)) {
            injection = optimization.optimize(injection, mes.methodName, mes.args);
            return injection;
          }
          if (mes.wrapMe) return injection = "(" + injection +  mes.toJS() + ")";
          return injection += mes.toJS();
        });
        return injection; // + conti;
      });
    };

    /*
     * + 1 / foo: 1 bar: 2 / foo
     */
    ExpressionParser.prototype.continuation = function (allowedParsers) {
      var _this = this;
      return this.cacheDo("continuation", function () {
        allowedParsers = allowedParsers || [
          _this.keywordMessage, //{}
          _this.binaryMessage,  //{}
          _this.unaryMessage    //{}
        ];
        return _this.try_.apply(_this, allowedParsers);
      });
    };
    
    //sel1: arg1 sel2: arg2
    ExpressionParser.prototype.keywordMessage = function () {
      var _this = this;
      return this.cacheDo("keywordMessage", function () {
        var methodName = "",
        args = [];
        _this.many1(function () {
          _this.skipSpace();
          methodName += _this.keywordSelector().replace(':', ''); // "inject:into" becomes "injectinto" 
          _this.skipSpace();
          args.push(
            //binary and unary are ranked higher than kwd
            _this.simpleExpression([_this.binaryMessage, _this.unaryMessage])
          ); //previously _this.primary()
          _this.skipSpace();
        });
        return {
          toJS : function () {
            return "." + this.methodName + "(" + this.args.join(", ") + ")"; 
          },
          methodName : methodName,
          args : args
        };
      });
    };

    // + 1
    ExpressionParser.prototype.binaryMessage = function () {
      var _this = this;
      return this.cacheDo("binaryMessage", function () {
        var operator, argument;
        _this.skipSpace();
        operator = _this.operator();
        _this.skipSpace();
        //unary is ranked higher than binary
        argument = _this.simpleExpression([_this.unaryMessage]);//primary();
        return {
          toJS : function () { 
            return  this.methodName + "" + this.args; 
          },
          wrapMe : true,
          methodName : operator,
          args : [argument]
        };
      });
    };

    // receiver selector
    ExpressionParser.prototype.unaryMessage = function () {
      var _this = this;
      return this.cacheDo("unaryMessage", function () {
        var unarySelector;
        _this.skipSpace();
        unarySelector = _this.unarySelector();
        return {
          toJS : function () { return "." + this.methodName + "()"; },
          methodName : unarySelector,
          args       : []
        };
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
            _this.skipSpace();
            ret = _this.cascade();
            _this.skipSpace();
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
            var num = _this.numberLiteral();
            _this.followedBy(function () {
              return _this.try_(
                _this.keywordMessage, _this.unaryMessage
              );
            });
            return "(" + num + ")";
          },
          function () {
            _this.followedBy(function () {
              _this.block();
              _this.skipSpace();
              _this.try_(
                _this.keywordMessage, _this.unaryMessage
              );
              return;
            });
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
          _this.toParser("+="),
          _this.toParser("-="),
          _this.toParser("*="),
          _this.toParser("/="),
          _this.toParser("%="),
          _this.toParser("+"),
          _this.toParser("-"),
          _this.toParser("*"),
          _this.toParser("/"),
          _this.toParser("%"),
          _this.toParser("==="),
          _this.toParser("!=="),
          _this.toParser("instanceof"),
          _this.toParser("<="),
          _this.toParser(">="),
          _this.toParser("<"),
          _this.toParser(">"),
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
