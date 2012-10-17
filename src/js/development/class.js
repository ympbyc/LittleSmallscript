(function () {
  "use strict";
  var Block;
  Block = require("./block");
  var Class;
  Class = function () {
    this.instanceVariables = null;
    this.currentClass = null;
    this.__super = new Block();
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Class.prototype = new Block();
  Class.prototype.superarguments = Class.prototype.super = function (m, args) {
    return this.__super[m].apply(this, args || []);
  };
  Class.prototype.init = function () {
    var _this = this;
    _this.instanceVariables = {};
    return _this.currentClass = null;
  };
  Class.prototype.classHeader = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "var %className%;\n%className% = function () { %variableInitialization%if (this.init) { this.init.apply(this, arguments); } };\n%className%.__super = new %superClass%();\n%className%.prototype = new %superClass%();\n%className%.prototype.superarguments = %className%.prototype.super = function (m,args) { return %className%.__super[m].apply(this, args||[]); }";
    return _this.cacheaParser("classHeader", function () {
      var className, superClass, variables, v_init;
      _this.optional(function () {
        return _this.chr("+");
      });
      superClass = _this.variable();
      _this.skipSpace();
      _this.string("subclass:");
      _this.skipSpace();
      className = _this.variablableStringContent();
      _this.skipSpace();
      _this.string("variables:");
      _this.skipSpace();
      variables = _this.instanceVariableArray();
      _this.instanceVariables[className] = [];
      v_init = variables.injectinto("", function (a, b) {
        _this.instanceVariables[className].push(a);
        return (((b + "this.") + a) + " = null; ");
      });
      return _this.templateapply(dst_tmpl, {
        "className": className,
        "superClass": superClass,
        "variableInitialization": v_init
      });
    });
  };
  Class.prototype.instanceVariableArray = function () {
    var _this = this;
    return _this.cacheaParser("instanceVariableArray", function () {
      var variables;
      variables = [];
      _this.arrayStart();
      _this.many(function () {
        var v;
        _this.skipSpace();
        v = _this.variablableStringContent();
        variables.push(v);
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        _this.skipSpace();
        return v;
      });
      _this.closeParen();
      return variables;
    });
  };
  Class.prototype.variablableStringContent = function () {
    var _this = this;
    return _this.cacheaParser("variablableStringContent", function () {
      return _this.try_([function () {
        _this.chr("#");
        return _this.variable();
      }, function () {
        return _this.betweenandaccept((function () {
          return _this.apostrophe();
        }), (function () {
          return _this.apostrophe();
        }), function () {
          return _this.variable();
        });
      }]);
    });
  };
  Class.prototype.instanceMethod = function () {
    var _this = this;
    var method_tmpl;
    method_tmpl = "%className%.prototype.%methodName% = function (%args%) { var _this = this; %methodBody% }";
    return _this.cacheaParser("instanceMethod", function () {
      var className, methodHead, methodBody;
      _this.exclamation();
      _this.skipSpace();
      className = _this.variable();
      _this.skipSpace();
      methodHead = _this.methodHead();
      _this.skipSpace();
      _this.setCurrentClass(className);
      methodBody = _this.statement();
      _this.setCurrentClass(null);
      _this.skipSpace();
      _this.exclamation();
      return _this.templateapply(method_tmpl, {
        "className": className,
        "methodName": methodHead.name,
        "args": methodHead.args,
        "methodBody": methodBody
      });
    });
  };
  Class.prototype.methodHead = function () {
    var _this = this;
    return _this.cacheaParser("methodHead", function () {
      var methodName, args;
      methodName = "";
      args = [];
      _this.try_([function () {
        return _this.many1(function () {
          (methodName += _this.keywordSelector().slice((0), - 1));
          _this.skipSpace();
          args.push(_this.variable());
          return _this.skipSpace();
        });
      }, function () {
        return methodName = _this.unarySelector();
      }]);
      return {
        "name": methodName,
        "args": args.join(", ")
      };
    });
  };
  Class.prototype.setCurrentClass = function (className) {
    var _this = this;
    _this.currentClass = className;
    return className;
  };
  Class.prototype.instanceVariableP = function (variableName) {
    var _this = this;
    var v;
    return (((_this.currentClass !== null) && (_this.instanceVariables[_this.currentClass] !== undefined)) && (_this.instanceVariables[_this.currentClass].indexOf(variableName) > -1));
  };
  module.exports = Class;
  return Class;
}).call(this);