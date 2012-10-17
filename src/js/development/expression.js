(function () {
  "use strict";
  var LittleParser, optimization;
  LittleParser = require("./littleparser");
  optimization = require("./optimization");
  var Expression;
  Expression = function () {
    this.bundledMethods = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Expression.__super = LittleParser.prototype;
  Expression.prototype = new LittleParser();
  Expression.prototype.init = function () {
    var _this = this;
    return _this.bundledMethods = [];
  };
  Expression.prototype.bundleAMethodIfAvailable = function (methodName) {
    var _this = this;
    return ((_this.bundledMethods.indexOf(methodName) > -1) && bundlableMethods.bundlable(methodName)) ? (function () {
      return _this.bundledMethods.push(bundlableMethods.bundle(methodName));
    })() : void 0;
  };
  Expression.prototype.expression = function () {
    var _this = this;
    var tmpl;
    tmpl = "%assignments%%cascade%";
    return _this.cacheaParser("expression", function () {
      var assignments, cascade;
      assignments = _this.optional(function () {
        return _this.assignments();
      });
      cascade = _this.cascade();
      return _this.templateapply(tmpl, {
        "assignments": assignments,
        "cascade": cascade
      });
    });
  };
  Expression.prototype.assignments = function () {
    var _this = this;
    return _this.cacheaParser("assignments", function () {
      return _this.many(function () {
        var variable;
        variable = _this.extendedVariable();
        _this.skipSpace();
        _this.assignmentArrow();
        _this.skipSpace();
        return (variable + " = ");
      });
    });
  };
  Expression.prototype.cascade = function () {
    var _this = this;
    var tmpl;
    tmpl = "(function () { var _receiver = %simpleExpression%; %body% return _receiver;  })()";
    return _this.cacheaParser("cascade", function () {
      var se;
      se = _this.simpleExpression();
      return _this.try_([function () {
        _this.skipSpace();
        _this.notFollowedBy(function () {
          return _this.semicolon();
        });
        return se;
      }, function () {
        var conti;
        conti = _this.many(function () {
          var mes;
          _this.skipSpace();
          _this.semicolon();
          _this.skipSpace();
          mes = _this.continuation();
          return optimization.optimizationAvailable(mes.methodName) ? ((function () {
            return (optimization.optimize("_receiver", mes.methodName, mes.args) + ";");
          }))() : (function () {
            return (("_receiver" + mes.js) + ";");
          })();
        });
        return _this.templateapply(tmpl, {
          "simpleExpression": se,
          "body": conti
        });
      }]);
    });
  };
  Expression.prototype.simpleExpression = function (allowedParsers) {
    var _this = this;
    return _this.cacheaParser("simpleExpression", function () {
      var receiver, injection;
      receiver = injection = _this.primaryReceiver();
      _this.many(function () {
        var mes, ret;
        mes = _this.continuation(allowedParsers);
        return optimization.optimizationAvailable(mes.methodName) ? ((function () {
          return injection = optimization.optimize(injection, mes.methodName, mes.args);
        }))() : (function () {
          return mes.wrapMe ? ((function () {
            return injection = ((("(" + injection) + mes.js) + ")");
          }))() : (function () {
            return (injection += mes.js);
          })();
        })();
      });
      return injection;
    });
  };
  Expression.prototype.continuation = function (allowedParsers) {
    var _this = this;
    return _this.cacheaParser("continuation", function () {
      (allowedParsers === undefined) ? (function () {
        return allowedParsers = [function () {
          return _this.keywordMessage();
        }, function () {
          return _this.binaryMessage();
        }, function () {
          return _this.unaryMessage();
        }];
      })() : void 0;
      return _this.try_(allowedParsers);
    });
  };
  Expression.prototype.keywordMessage = function () {
    var _this = this;
    return _this.cacheaParser("keywordMessage", function () {
      var methodName, args;
      methodName = "";
      args = [];
      _this.many1(function () {
        _this.skipSpace();
        (methodName += _this.keywordSelector().replace(":", ""));
        _this.skipSpace();
        args.push(_this.simpleExpression([function () {
          return _this.binaryMessage();
        }, function () {
          return _this.unaryMessage();
        }]));
        return _this.skipSpace();
      });
      return {
        "js": (((("." + methodName) + "(") + args.join(", ")) + ")"),
        "wrapMe": false,
        "methodName": methodName,
        "args": args
      };
    });
  };
  Expression.prototype.binaryMessage = function () {
    var _this = this;
    return _this.cacheaParser("binaryMessage", function () {
      var operator, argument;
      _this.skipSpace();
      operator = _this.operator();
      _this.skipSpace();
      argument = _this.simpleExpression([function () {
        return _this.unaryMessage();
      }]);
      return {
        "js": (((" " + operator) + " ") + argument),
        "wrapMe": true,
        "methodName": operator,
        "args": [argument]
      };
    });
  };
  Expression.prototype.unaryMessage = function () {
    var _this = this;
    return _this.cacheaParser("unaryMessage", function () {
      var unarySelector;
      _this.skipSpace();
      unarySelector = _this.unarySelector();
      return {
        "js": (("." + unarySelector) + "()"),
        "wrapMe": false,
        "methodName": unarySelector,
        "args": []
      };
    });
  };
  Expression.prototype.primary = function () {
    var _this = this;
    return _this.cacheaParser("primary", function () {
      return _this.try_([function () {
        return _this.extendedVariable();
      }, function () {
        return _this.literal();
      }, function () {
        return _this.block();
      }, function () {
        return _this.primitive();
      }, function () {
        return _this.betweenandaccept((function () {
          _this.chr("(");
          return _this.skipSpace();
        }), (function () {
          _this.skipSpace();
          return _this.chr(")");
        }), function () {
          return _this.cascade();
        });
      }]);
    });
  };
  Expression.prototype.primaryReceiver = function () {
    var _this = this;
    return _this.cacheaParser("primaryReceiver", function () {
      return _this.try_([function () {
        var num;
        num = _this.numberLiteral();
        _this.followedBy(function () {
          return _this.try_([function () {
            return _this.keywordMessage();
          }, function () {
            return _this.unaryMessage();
          }]);
        });
        return (("(" + num) + ")");
      }, function () {
        _this.followedBy(function () {
          _this.block();
          _this.skipSpace();
          return _this.try_([function () {
            return _this.keywordMessage();
          }, function () {
            return _this.unaryMessage();
          }]);
        });
        return (("(" + _this.block()) + ")");
      }, function () {
        return _this.primary();
      }]);
    });
  };
  Expression.prototype.primitive = function () {
    var _this = this;
    return _this.cacheaParser("primitive", function () {
      _this.skipSpace();
      return _this.betweenandaccept((function () {
        _this.chr("<");
        _this.notFollowedBy(function () {
          return _this.chr("-");
        });
        return "<";
      }), (function () {
        return _this.chr(">");
      }), function () {
        return _this.anyChar();
      });
    });
  };
  Expression.prototype.operator = function () {
    var _this = this;
    var p;
    p = function (str) {
      return function () {
        return _this.string(str);
      };
    };
    return _this.cacheaParser("operator", function () {
      var op;
      _this.skipSpace();
      return op = _this.try_([p("+="), p("-="), p("*="), p("/="), p("+"), p("-"), p("*"), p("/"), p("%"), p("==="), p("!=="), p("<="), p(">="), p("<"), p(">"), p("^"), p("&&"), p("||")]);
    });
  };
  module.exports = Expression;
  return Expression;
}).call(this);