(function () {
  'use strict';
  var LittleParser, Statement;
  LittleParser = require('./littleparser').LittleParser;
  Statement = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(LittleParser);
  Statement.prototype.statement = function () {
    var _this = this;
    return _this.cacheparser("statement", function () {
      var ret, vd;
      ret = "";
      _this.skipSpace();
      vd = _this.optional(_this.variableDecalaration);
      (vd !== null) ? (function () {
        return (ret += vd);
      })() : void 0;
      _this.skipSpace();
      (ret += _this.many(function () {
        var a;
        a = _this.expression();
        _this.skipSpace();
        _this.chr(".");
        _this.skipSpace();
        _this.followedBy(_this.expression);
        return (a + "; ");
      }));
      ((ret += _this.expression()) + "; ");
      _this.skipSpace();
      _this.optional(function () {
        return _this.chr(".");
      });
      return (ret + "; ");
    });
  };
  Statement.prototype.variableDecalaration = function () {
    var _this = this;
    return _this.cacheparser("variableDecalaration", function () {
      var ret;
      ret = "var ";
      _this.skipSpace();
      _this.verticalBar();
      (ret += _this.many1(function () {
        _this.skipSpace();
        return (_this.variable() + ", ");
      }).replace(/,\s$/, "; "));
      _this.skipSpace();
      _this.verticalBar();
      return ret;
    });
  };
  exports.Statement = Statement;
  return Statement;
}).call(this);