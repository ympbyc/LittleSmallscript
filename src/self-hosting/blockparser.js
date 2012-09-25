(function () {
  'use strict';
  var LittleParser, BlockParser;
  LittleParser = require('./littleparser').LittleParser;
  BlockParser = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(LittleParser);
  BlockParser.prototype.block = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "function (%parameters%) { %body% }";
    return _this.cacheparser("block", function () {
      var parameters, body;
      _this.blockStart();
      parameters = _this.blockHead();
      body = _this.optional(_this.literal);
      _this.blockEnd();
      return _this.templateapply(dst_tmpl, {
        "parameters": parameters,
        "body": body
      });
    });
  };
  BlockParser.prototype.blockParameters = function () {
    var _this = this;
    return _this.cacheparser("blockParameters", function () {
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
  BlockParser.prototype.blockHead = function () {
    var _this = this;
    return _this.cacheparser("blockHead", function () {
      return _this.optional(function () {
        var params;
        _this.skipSpace();
        params = _this.blockParameters();
        (params.length > (0)) ? (function () {
          return _this.verticalBar();
        })() : void 0;
        _this.skipSpace();
        return params;
      });
    });
  };
  exports.BlockParser = BlockParser;
  return BlockParser;
}).call(this);