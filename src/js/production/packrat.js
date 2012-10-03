(function () {
  "use strict";
  require("../../prelude");
  Number.prototype.timesString = function (str) {
    var _this = this;
    var ret;
    ret = "";
    _this.timesRepeat(function (i) {
      return (ret += str);
    });
    return ret;
  };
  var Packrat;
  Packrat = function () {
    this.input = null;
    this.index = null;
    this.cache = null;
    this.maxIndex = null;
    this.logNest = null;
    this.stackTrace = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Packrat.prototype = new Object();;
  Packrat.prototype.init = function (text) {
    var _this = this;
    _this.input = text;
    _this.index = 0;
    _this.cache = {};
    _this.maxIndex = 0;
    _this.logNest = -1;
    return _this.stackTrace = "";
  };
  Packrat.prototype.getIndex = function () {
    var _this = this;
    return _this.index;
  };
  Packrat.prototype.getMaxIndex = function () {
    var _this = this;
    return _this.maxIndex;
  };
  Packrat.prototype.getInputLength = function () {
    var _this = this;
    return _this.input.size();
  };
  Packrat.prototype.getStackTrace = function () {
    var _this = this;
    return _this.stackTrace;
  };
  Packrat.prototype.cacheaParser = function (s, fn) {
    var _this = this;
    var c, slot, logIndent;
    fn = (fn !== undefined) ? ((function () {
      return fn;
    }))() : (function () {
      return function () {};
    })();
    c = {};
    (_this.logNest += 1);
    logIndent = _this.logNest.timesString("  ");
    (_this.stackTrace += (((((logIndent + "ENTER : ") + s) + " : ") + _this.input.substring(_this.index)) + "\n"));
    (function () {
      var _ret;
      try {
        _ret = (function () {
          return (_this.cache[s] === undefined) ? (_this.cache[s] = {})() : void 0;
        })();
      } catch (err) {
        _ret = function () {
          return _this.cache[s] = {};
        }(err);
      }
      return _ret;
    })();
    slot = _this.cache[s][_this.index];
    return ((slot !== undefined) && (slot !== null)) ? ((function () {
      c = slot;
      _this.index = c.idx;
      (_this.index > _this.maxIndex) ? (function () {
        return _this.maxIndex = _this.index;
      })() : void 0;
      (_this.stackTrace += (((((logIndent + "CACHED: ") + s) + " : ") + c.fn) + "\n"));
      (_this.logNest -= 1);
      return c.fn;
    }))() : (function () {
      return (function () {
        var _ret;
        try {
          _ret = (function () {
            c.idx = _this.index;
            c.fn = fn.call(_this);
            _this.cache[s][c.idx] = {
              "fn": c.fn,
              "idx": _this.index
            };
            (_this.index > _this.maxIndex) ? (function () {
              return _this.maxIndex = _this.index;
            })() : void 0;
            (_this.stackTrace += (((((logIndent + "PASS  : ") + s) + " : ") + c.fn) + "\n"));
            (_this.logNest -= 1);
            return c.fn;
          })();
        } catch (err) {
          _ret = function (err) {
            _this.cache[s][c.idx] = null;
            (_this.stackTrace += (((logIndent + "FAIL  : ") + s) + "\n"));
            (_this.logNest -= 1);
            return _this.noParse();
          }(err);
        }
        return _ret;
      })();
    })();
  };
  Packrat.prototype.noParse = function () {
    var _this = this;
    return _this.error(("Parse error at:" + _this.index));
  };
  Packrat.prototype.try_ = function (parsers) {
    var _this = this;
    var ret, i;
    i = _this.index;
    parsers.do_(function (parser) {
      return (ret === undefined) ? (function () {
        return (function () {
          var _ret;
          try {
            _ret = (function () {
              return ret = parser.call(_this);
            })();
          } catch (err) {
            _ret = function () {
              return _this.index = i;
            }(err);
          }
          return _ret;
        })();
      })() : void 0;
    });
    return (ret !== undefined) ? ((function () {
      return ret;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.sequence = function (parsers) {
    var _this = this;
    var ret, i, fail;
    i = _this.index;
    ret = "";
    fail = false;
    parsers.do_(function (parser) {
      return fail ? void 0 : (function () {
        return (function () {
          var _ret;
          try {
            _ret = (function () {
              return (ret += parser.call(_this));
            })();
          } catch (err) {
            _ret = function (err) {
              _this.index = i;
              fail = true;
              return _this.noParse();
            }(err);
          }
          return _ret;
        })();
      })();
    });
    return fail ? (function () {
      return _this.noParse();
    })() : ((function () {
      return ret;
    }))();
  };
  Packrat.prototype.optional = function (parser) {
    var _this = this;
    var ret, i;
    i = _this.index;
    return (function () {
      var _ret;
      try {
        _ret = (function () {
          return parser.call(_this);
        })();
      } catch (err) {
        _ret = function () {
          _this.index = i;
          return null;
        }(err);
      }
      return _ret;
    })();
  };
  Packrat.prototype.followedBy = function (parser) {
    var _this = this;
    var f, i;
    f = true;
    i = _this.index;
    (function () {
      var _ret;
      try {
        _ret = (function () {
          parser.call(_this);
          return f = false;
        })();
      } catch (err) {
        _ret = function () {}(err);
      }
      return _ret;
    })();
    _this.index = i;
    return f ? ((function () {
      return _this.noParse();
    }))() : (function () {
      return null;
    })();
  };
  Packrat.prototype.notFollowedBy = function (parser) {
    var _this = this;
    var f, i;
    f = false;
    i = _this.index;
    (function () {
      var _ret;
      try {
        _ret = (function () {
          parser.call(_this);
          return f = true;
        })();
      } catch (err) {
        _ret = function () {}(err);
      }
      return _ret;
    })();
    _this.index = i;
    return f ? ((function () {
      return _this.noParse();
    }))() : (function () {
      return null;
    })();
  };
  Packrat.prototype.many = function (parser) {
    var _this = this;
    var a;
    return _this.try_([function () {
      return _this.many1(function () {
        return parser.call(_this);
      });
    }, function () {
      return "";
    }]);
  };
  Packrat.prototype.many1 = function (parser) {
    var _this = this;
    var v, vs;
    v = parser.call(_this);
    vs = _this.many(function () {
      return parser.call(_this);
    });
    return (v + vs);
  };
  Packrat.prototype.betweenandaccept = function (start, end, inbetween) {
    var _this = this;
    var ret;
    _this.sequence([start, function () {
      return ret = _this.many(function () {
        _this.notFollowedBy(end);
        return inbetween.call(_this);
      });
    },
    end]);
    return ret;
  };
  Packrat.prototype.anyChar = function () {
    var _this = this;
    var c;
    c = _this.input[_this.index];
    (_this.index += 1);
    return (c !== undefined) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.satisfyChar = function (fn) {
    var _this = this;
    var c;
    c = _this.anyChar();
    return (fn(c) !== undefined) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.chr = function (ch) {
    var _this = this;
    var c;
    c = _this.anyChar();
    return (c === ch) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.string = function (str) {
    var _this = this;
    return (_this.input.substring(_this.index, (_this.index + str.size())) === str) ? ((function () {
      (_this.index += str.size());
      return str;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.regex = function (regex) {
    var _this = this;
    var rc, match;
    rc = regex.exec(_this.input.substring(_this.index));
    return rc.isKindOf(Array) ? ((function () {
      match = rc[0];
      (_this.index += match.size());
      return match;
    }))() : (function () {
      console.log("regexFalse");
      return _this.noParse("regex");
    })();
  };
  Packrat.prototype.toParser = function (str) {
    var _this = this;
    return function () {
      return _this.string(str);
    };
  };
  Packrat.prototype.p = function (s) {
    var _this = this;
    console.log(s);
    return s;
  };
  module.exports = Packrat;
  return Packrat;
}).call(this);