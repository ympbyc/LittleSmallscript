(function () {
  'use strict';
  var Packrat, Class;
  Packrat = require('./packrat').Packrat;
  Class = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(Packrat);
  Class.prototype.classHeader = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "%className% = function () { %variableInitialization%};\n%className%.prototype = new %superClass%();";
    return _this.cacheparser("classHeader", function () {
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
    return _this.cacheparser("instanceVariableArray", function () {
      var variables;
      variables = [];
      _this.arrayStart();
      _this.many(function () {
        var v;
        _this.skipSpace();
        v = _this.variablableStringContent();
        variables.push(v);
        return v;
      });
      _this.closeParen();
      return variables;
    });
  };
  Class.prototype.variablableStringContent = function () {
    var _this = this;
    return _this.cacheparser("variablableStringContent", function () {
      return _this.try_([function () {
        _this.chr("#");
        return _this.variable();
      }, function () {
        return _this.betweenandaccept(_this.apostrophe, _this.apostrophe, _this.variable);
      }]);
    });
  };
  Class.prototype.instanceMethod = function () {
    var _this = this;
    var method_tmpl;
    method_tmpl = "%className%.prototype.%methodName% = function (%args%) { var _this = this; %methodBody% }";
    return _this.cacheparser("instanceMethod", function () {
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
    return _this.cacheparser("methodHead", function () {
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
  exports.Class = Class;
  return Class;
}).call(this);