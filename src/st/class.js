(function () {
  "use strict";
  var Packrat;
  Packrat = require('./packrat').Packrat;
  var Class;
  Class = function () {
    this.instanceVariables = null;
    this.currentClass = null;
  };
  Class.prototype = new Packrat();;
  Class.prototype.classHeader = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "var %className%;
%className% = function () { %variableInitialization%};
%className%.prototype = new %superClass%();";
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
  return Class.prototype.instanceVariableArray = function () {
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
}).call(this);