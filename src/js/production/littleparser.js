(function () {
  "use strict";
  var Packrat;
  Packrat = require("./packrat");
  var LittleParser;
  LittleParser = function () {
    this.__super = new Packrat();
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  LittleParser.prototype = new Packrat();
  LittleParser.prototype.superarguments = LittleParser.prototype.super = function (m, args) {
    return this.__super[m].apply(this, args || []);
  };
  LittleParser.prototype.space = function () {
    var _this = this;
    return _this.cacheaParser("space", function () {
      return _this.regex(new RegExp("^[\\s\\n\\t]+"));
    });
  };
  LittleParser.prototype.blockStart = function () {
    var _this = this;
    return _this.cacheaParser("blockStart", function () {
      return _this.chr("[");
    });
  };
  LittleParser.prototype.blockEnd = function () {
    var _this = this;
    return _this.cacheaParser("blockEnd", function () {
      return _this.chr("]");
    });
  };
  LittleParser.prototype.verticalBar = function () {
    var _this = this;
    return _this.cacheaParser("verticalBar", function () {
      return _this.chr("|");
    });
  };
  LittleParser.prototype.colon = function () {
    var _this = this;
    return _this.cacheaParser("colon", function () {
      return _this.chr(":");
    });
  };
  LittleParser.prototype.semicolon = function () {
    var _this = this;
    return _this.cacheaParser("semicolon", function () {
      return _this.chr(";");
    });
  };
  LittleParser.prototype.assignmentArrow = function () {
    var _this = this;
    return _this.cacheaParser("assignmentArrow", function () {
      return _this.try_([function () {
        return _this.string(":=");
      }, function () {
        return _this.string("<-");
      }]);
    });
  };
  LittleParser.prototype.apostrophe = function () {
    var _this = this;
    return _this.cacheaParser("apostrophe", function () {
      return _this.chr("'");
    });
  };
  LittleParser.prototype.arrayStart = function () {
    var _this = this;
    return _this.cacheaParser("arrayStart", function () {
      _this.string("#(");
      return _this.skipSpace();
    });
  };
  LittleParser.prototype.closeParen = function () {
    var _this = this;
    return _this.cacheaParser("closeParen", function () {
      return _this.chr(")");
    });
  };
  LittleParser.prototype.hashStart = function () {
    var _this = this;
    return _this.cacheaParser("hashStart", function () {
      return _this.string("#{");
    });
  };
  LittleParser.prototype.hashEnd = function () {
    var _this = this;
    return _this.cacheaParser("hashEnd", function () {
      return _this.chr("}");
    });
  };
  LittleParser.prototype.exclamation = function () {
    var _this = this;
    return _this.cacheaParser("exclamation", function () {
      return _this.chr("!");
    });
  };
  LittleParser.prototype.variable = function () {
    var _this = this;
    return _this.cacheaParser("variable", function () {
      return _this.regex(new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*"));
    });
  };
  LittleParser.prototype.extendedVariable = function () {
    var _this = this;
    return _this.cacheaParser("extendedVariable", function () {
      var v;
      v = _this.regex(new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*"));
      return (v === "self") ? ((function () {
        return "_this";
      }))() : (function () {
        _this.instanceVariableP(v) ? (function () {
          return v = ("_this." + v);
        })() : void 0;
        return v;
      })();
    });
  };
  LittleParser.prototype.keywordSelector = function () {
    var _this = this;
    return _this.cacheaParser("keywordSelector", function () {
      return _this.sequence([function () {
        return _this.variable();
      }, function () {
        return _this.colon();
      }]);
    });
  };
  LittleParser.prototype.unarySelector = function () {
    var _this = this;
    return _this.cacheaParser("unarySelector", function () {
      var sel;
      sel = _this.variable();
      _this.notFollowedBy(function () {
        return _this.colon();
      });
      return sel;
    });
  };
  LittleParser.prototype.explicitReturn = function () {
    var _this = this;
    return _this.cacheaParser("explicitReturn", function () {
      return _this.chr("^");
    });
  };
  LittleParser.prototype.commentQuote = function () {
    var _this = this;
    return _this.cacheaParser("commentQuote", function () {
      return _this.chr("\"");
    });
  };
  LittleParser.prototype.skipSpace = function () {
    var _this = this;
    return _this.cacheaParser("skipSpace", function () {
      _this.optional(function () {
        return _this.space();
      });
      return _this.many(function () {
        _this.betweenandaccept((function () {
          return _this.commentQuote();
        }), (function () {
          return _this.commentQuote();
        }), function () {
          return _this.anyChar();
        });
        return _this.optional(function () {
          return _this.space();
        });
      });
    });
  };
  LittleParser.prototype.literal = function () {
    var _this = this;
    return _this.cacheaParser("literal", function () {
      return _this.try_([function () {
        return _this.numberLiteral();
      }, function () {
        return _this.stringLiteral();
      }, function () {
        return _this.symbolLiteral();
      }, function () {
        return _this.arrayLiteral();
      }, function () {
        return _this.hashLiteral();
      }, function () {
        return _this.block();
      }]);
    });
  };
  LittleParser.prototype.numberLiteral = function () {
    var _this = this;
    return _this.cacheaParser("numberLiteral", function () {
      return _this.regex(new RegExp("^-?[0-9]+(\\.?[0-9]+)?"));
    });
  };
  LittleParser.prototype.stringLiteral = function () {
    var _this = this;
    return _this.cacheaParser("stringLiteral", function () {
      return (("\"" + _this.betweenandaccept((function () {
        return _this.apostrophe();
      }), (function () {
        return _this.apostrophe();
      }), function () {
        return _this.anyChar();
      }).replace(/\n/g, "\\n")) + "\"");
    });
  };
  LittleParser.prototype.symbolLiteral = function () {
    var _this = this;
    return _this.cacheaParser("symbolLiteral", function () {
      _this.chr("#");
      return (("\"" + _this.variable()) + "\"");
    });
  };
  LittleParser.prototype.arrayLiteral = function () {
    var _this = this;
    var args;
    return _this.cacheaParser("arrayLiteral", function () {
      args = [];
      _this.arrayStart();
      _this.skipSpace();
      _this.many(function () {
        args.push(_this.expression());
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        return _this.skipSpace();
      });
      _this.closeParen();
      return (("[" + args.join(", ")) + "]");
    });
  };
  LittleParser.prototype.hashLiteral = function () {
    var _this = this;
    return _this.cacheaParser("hashLiteral", function () {
      var ret;
      ret = "";
      _this.hashStart();
      (ret += "{");
      (ret += _this.many(function () {
        var key, val;
        _this.skipSpace();
        key = _this.try_([function () {
          return _this.stringLiteral();
        }, function () {
          return _this.numberLiteral();
        }, function () {
          return _this.symbolLiteral();
        }]);
        _this.skipSpace();
        _this.colon();
        _this.skipSpace();
        val = _this.expression();
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        return (((key + ": ") + val) + ",");
      }).slice((0), - 1));
      _this.skipSpace();
      _this.hashEnd();
      (ret += "}");
      return ret;
    });
  };
  LittleParser.prototype.templateapply = function (template, hashmap) {
    var _this = this;
    var dest_str;
    dest_str = template;
    hashmap.do_(function (it, key) {
      ((it === null) || (it === undefined)) ? (function () {
        return it = "";
      })() : void 0;
      return dest_str = dest_str.replace(new RegExp((("%" + key) + "%"), "g"), it);
    });
    return dest_str;
  };
  module.exports = LittleParser;
  return LittleParser;
}).call(this);