(function () {
  "use strict";
  var Expression;
  Expression = require("./expression");
  var Block;
  Block = function () {
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Block.__super = Expression.prototype;
  Block.prototype = new Expression();
  Block.prototype.block = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "function (%parameters%) { %body% }";
    return _this.cacheaParser("block", function () {
      var parameters, body;
      _this.blockStart();
      parameters = _this.blockHead();
      body = _this.optional(function () {
        return _this.statement();
      });
      _this.blockEnd();
      return _this.templateapply(dst_tmpl, {
        "parameters": parameters,
        "body": body
      });
    });
  };
  Block.prototype.blockParameters = function () {
    var _this = this;
    return _this.cacheaParser("blockParameters", function () {
      var vars;
      vars = "";
      _this.skipSpace();
      _this.many(function () {
        _this.colon();
        (vars += (_this.variable() + ", "));
        return _this.skipSpace();
      });
      return vars.slice((0), - 2);
    });
  };
  Block.prototype.blockHead = function () {
    var _this = this;
    return _this.cacheaParser("blockHead", function () {
      return _this.optional(function () {
        var params;
        _this.skipSpace();
        params = _this.blockParameters();
        (params.size() > (0)) ? (function () {
          return _this.verticalBar();
        })() : void 0;
        _this.skipSpace();
        return params;
      });
    });
  };
  module.exports = Block;
  return Block;
}).call(this);