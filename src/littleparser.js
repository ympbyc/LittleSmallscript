(function () {
  'use strict';
  var Packrat, LittleParser;
  Packrat = require('./packrat').Packrat;
  LittleParser = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(Packrat);
  LittleParser.prototype.space = function () {
    var _this = this;
    return _this.cacheparser("space", function () {
      return _this.regex(new RegExp("^[\\s\\n\\t]+"));
    });
  };
  LittleParser.prototype.blockStart = function () {
    var _this = this;
    return _this.cacheparser("blockStart", function () {
      return _this.chr("[");
    });
  };
  LittleParser.prototype.blockEnd = function () {
    var _this = this;
    return _this.cacheparser("blockEnd", function () {
      return _this.chr("]");
    });
  };
  LittleParser.prototype.verticalBar = function () {
    var _this = this;
    return _this.cacheparser("verticalBar", function () {
      return _this.chr("|");
    });
  };
  LittleParser.prototype.colon = function () {
    var _this = this;
    return _this.cacheparser("colon", function () {
      return _this.chr(":");
    });
  };
  LittleParser.prototype.semicolon = function () {
    var _this = this;
    return _this.cacheparser("semicolon", function () {
      return _this.chr(";");
    });
  };
  LittleParser.prototype.assignmentArrow = function () {
    var _this = this;
    return _this.cacheparser("assignmentArrow", function () {
      return _this.try_([function () {
        return _this.string(":=");
      }, function () {
        return _this.string("<-");
      }]);
    });
  };
  LittleParser.prototype.apostrophe = function () {
    var _this = this;
    return _this.cacheparser("apostrophe", function () {
      return _this.chr("'");
    });
  };
  LittleParser.prototype.arrayStart = function () {
    var _this = this;
    return _this.cacheparser("arrayStart", function () {
      return _this.string("#(");
    });
  };
  LittleParser.prototype.closeParen = function () {
    var _this = this;
    return _this.cacheparser("closeParen", function () {
      return _this.chr(")");
    });
  };
  LittleParser.prototype.hashStart = function () {
    var _this = this;
    return _this.cacheparser("hashStart", function () {
      return _this.string("#{");
    });
  };
  LittleParser.prototype.hashEnd = function () {
    var _this = this;
    return _this.cacheparser("hashEnd", function () {
      return _this.chr("}");
    });
  };
  LittleParser.prototype.exclamation = function () {
    var _this = this;
    return _this.cacheparser("exclamation", function () {
      return _this.chr("!");
    });
  };
  LittleParser.prototype.variable = function () {
    var _this = this;
    return _this.cacheparser("variable", function () {
      return _this.regex(new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*"));
    });
  };
  LittleParser.prototype.extendedVariable = function () {
    var _this = this;
    return _this.cacheparser("extendedVariable", function () {
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
    return _this.cacheparser("keywordSelector", function () {
      return _this.sequence([_this.variable, _this.colon]);
    });
  };
  LittleParser.prototype.unarySelector = function () {
    var _this = this;
    return _this.cacheparser("unarySelector", function () {
      var sel;
      sel = _this.sequence([_this.variable]);
      _this.notFollowedBy(_this.colon);
      return sel;
    });
  };
  LittleParser.prototype.explicitReturn = function () {
    var _this = this;
    return _this.cacheparser("explicitReturn", function () {
      return _this.chr("^");
    });
  };
  LittleParser.prototype.commentQuote = function () {
    var _this = this;
    return _this.cacheparser("commentQuote", function () {
      return _this.chr("\"");
    });
  };
  LittleParser.prototype.skipSpace = function () {
    var _this = this;
    return _this.cacheparser("skipSpace", function () {
      _this.optional(_this.space);
      return _this.many(function () {
        _this.betweenandaccept(_this.commentQuote, _this.commentQuote, _this.anyChar);
        return _this.optional(_this.space);
      });
    });
  };
  LittleParser.prototype.literal = function () {
    var _this = this;
    return _this.cacheparser("literal", function () {
      return _this.try_([_this.numberLiteral, _this.stringLiteral, _this.symbolLiteral, _this.arrayLiteral, _this.hashLiteral, _this.block]);
    });
  };
  LittleParser.prototype.numberLiteral = function () {
    var _this = this;
    return _this.cacheparser("numberLiteral", function () {
      return _this.regex(new RegExp("^-?[0-9]+(\\.?[0-9]+)?"));
    });
  };
  LittleParser.prototype.stringLiteral = function () {
    var _this = this;
    return _this.cacheparser("stringLiteral", function () {
      return (("\"" + _this.betweenandaccept(_this.apostrophe, _this.apostrophe, _this.anyChar)) + "\"");
    });
  };
  LittleParser.prototype.symbolLiteral = function () {
    var _this = this;
    return _this.cacheparser("symbolLiteral", function () {
      _this.chr("#");
      return (("\"" + _this.variable()) + "\"");
    });
  };
  LittleParser.prototype.arrayLiteral = function () {
    var _this = this;
    var args;
    return _this.cacheparser("arrayLiteral", function () {
      args = [];
      _this.arrayStart();
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
    return _this.cacheparser("hashLiteral", function () {
      var ret;
      ret = "";
      _this.hashStart();
      (ret += "{");
      (ret += _this.many(function () {
        var key, val;
        _this.skipSpace();
        key = _this.try_([_this.stringLiteral, _this.numberLiteral, _this.symbolLiteral]);
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
  exports.LittleParser = LittleParser;
  return LittleParser;
}).call(this);