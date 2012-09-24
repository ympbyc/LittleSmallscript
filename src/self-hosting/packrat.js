(function () {
  'use strict';
  var Packrat;
  require('../littlesmallmethods');
  Number.prototype.timesString = function (str) {
    var _this = this;
    var ret;
    ret = "";
    _this.timesRepeat(function (i) {
      return (ret += str);
    });
    return ret;
  };
  Packrat = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(Object);
  Packrat.prototype.init = function (input) {
    var _this = this;
    _this.input = input;
    _this.index = 0;
    _this.cache = {};
    return _this.logNest = -1;
  };
  Packrat.prototype.cacheparser = function (s, fn) {
    var _this = this;
    var c, logIndent;
    fn = (fn || function () {});
    c = {};
    (_this.logNest += 1);
    logIndent = _this.logNest.timesString("  ");
    console.log(((((logIndent + "ENTER : ") + s) + " : ") + _this.input.substring(_this.index)));
    (function () {
      return (_this.cache[s] === undefined) ? (_this.cache[s] = {})() : void 0;
    }).tryCatch(function () {
      return _this.cache[s] = {};
    });
    return (_this.cache[s][_this.index] !== undefined) ? ((function () {
      c = _this.cache[s][_this.index];
      return (c.idx !== undefined) ? ((function () {
        console.log(((((logIndent + "CACHED: ") + s) + " : ") + c.fn));
        (_this.logNest -= 1);
        _this.index = c.idx;
        return c.fn;
      }))() : (function () {
        return _this.noParse();
      })();
    }))() : (function () {
      return (function () {
        c.idx = _this.index;
        c.fn = fn.call(_this);
        _this.cache[s][c.idx] = {
          "fn": c.fn,
          "idx": _this.index
        };
        console.log(((((logIndent + "PASS  : ") + s) + " : ") + c.fn));
        (_this.logNest -= 1);
        return c.fn;
      }).tryCatch(function (err) {
        _this.cache[s][_this.index] = null;
        console.log(((logIndent + "FAIL  : ") + s));
        (_this.logNest -= 1);
        return _this.error(err);
      });
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
          return ret = parser.call(_this);
        }).tryCatch(function () {
          return _this.index = i;
        });
      })() : void 0;
    });
    return (ret !== undefined) ? ((function () {
      return ret;
    }))() : (function () {
      return _this.noParse("try_");
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
          return (ret += parser.call(_this));
        }).tryCatch(function (err) {
          _this.index = i;
          fail = true;
          return _this.noParse();
        });
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
      return parser.call(_this);
    }).tryCatch(function () {
      _this.index = i;
      return null;
    });
  };
  Packrat.prototype.followedBy = function (parser) {
    var _this = this;
    var f, i;
    f = true;
    i = _this.index;
    (function () {
      parser.call(_this);
      return f = false;
    }).tryCatch(function () {});
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
      parser.call(_this);
      return f = true;
    }).tryCatch(function () {});
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
    c = _this.anuChar();
    return fn.valueifTrueifFalse((c !== undefined), c, function () {
      return _this.noParse();
    });
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
    return (_this.input.substring(_this.index, (_this.index + str.length)) === str) ? ((function () {
      (_this.index += str.length);
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
  Packrat.prototype.p = function (s) {
    var _this = this;
    console.log(s);
    return s;
  };
  exports.Packrat = Packrat;
  return Packrat;
}).call(this);