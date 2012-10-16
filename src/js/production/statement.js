(function () {
  "use strict";
  var Class;
  Class = require("./class");
  var Statement;
  Statement = function () {
    this.__super = new Class();
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Statement.prototype = new Class();
  Statement.prototype.superarguments = Statement.prototype.super = function (m, args) {
    return this.__super[m].apply(this, args || []);
  };
  Statement.prototype.statement = function () {
    var _this = this;
    return _this.cacheaParser("statement", function () {
      var ret, vd;
      ret = "";
      _this.skipSpace();
      vd = _this.optional(function () {
        return _this.variableDeclaration();
      });
      (vd !== null) ? (function () {
        return (ret += vd);
      })() : void 0;
      _this.skipSpace();
      (ret += _this.many(function () {
        var a;
        a = _this.statementable();
        _this.skipSpace();
        _this.chr(".");
        _this.skipSpace();
        _this.followedBy(function () {
          return _this.statementable();
        });
        return (a + "; ");
      }));
      (ret += (function () {
        var _ret;
        try {
          _ret = (function () {
            return (("return " + _this.expression()) + ";");
          })();
        } catch (err) {
          _ret = function () {
            var st;
            st = (function () {
              var _ret;
              try {
                _ret = (function () {
                  return (_this.statementable() + ";");
                })();
              } catch (err) {
                _ret = function () {
                  return "";
                }(err);
              }
              return _ret;
            })();
            return (st + "return null;");
          }(err);
        }
        return _ret;
      })());
      _this.skipSpace();
      _this.optional(function () {
        return _this.chr(".");
      });
      return ret;
    });
  };
  Statement.prototype.statementable = function () {
    var _this = this;
    return _this.cacheaParser("statementable", function () {
      return _this.try_([function () {
        return _this.classHeader();
      }, function () {
        return _this.instanceMethod();
      }, function () {
        return _this.expression();
      }]);
    });
  };
  Statement.prototype.variableDeclaration = function () {
    var _this = this;
    return _this.cacheaParser("variableDeclaration", function () {
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
  module.exports = Statement;
  return Statement;
}).call(this);