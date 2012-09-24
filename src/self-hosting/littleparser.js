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
  LittleParser.prototype.init = function (input) {
    var _this = this;
    _this.input = input;
    return _this.cache = {};
  };
  LittleParser.prototype.space = function () {
    var _this = this;
    return _this.cacheparser("space", function () {
      return _this.regex(new RegExp("^[\s\n\t]+"));
    });
  };
  LittleParser.prototype.blockStart = function () {
    var _this = this;
    return _this.cacheparser("blockStart", _this.chr("["));
  };
  LittleParser.prototype.blockEnd = function () {
    var _this = this;
    return _this.cacheparser("blockEnd", _this.chr("]"));
  };
  LittleParser.prototype.verticalBar = function () {
    var _this = this;
    return _this.cacheparser("verticalBar", _this.chr("]"));
  };
  LittleParser.prototype.colon = function () {
    var _this = this;
    return _this.cacheparser("verticalBar", _this.chr("]"));
  };
  LittleParser.prototype.semicolon = function () {
    var _this = this;
    return _this.cacheparser("semicolon", _this.chr(";"));
  };
  LittleParser.prototype.assignmentArrow = function () {
    var _this = this;
    return _this.cacheparser("assignmentArrow", _this.string(":="));
  };
  LittleParser.prototype.apostrophe = function () {
    var _this = this;
    return _this.cacheparser("apostrophe", _this.chr("'"));
  };
  LittleParser.prototype.variable = function () {
    var _this = this;
    return _this.regex(new RegExp("[a-zA-Z_$][a-zA-Z0-9_$]"));
  };
  LittleParser.prototype.literal = function () {
    var _this = this;
    return _this.cacheparser("literal", function () {
      return _this.try_([_this.numberLiteral, _this.stringLiteral, _this.symbolLiteral, _this.arrayLiteral]);
    });
  };
  LittleParser.prototype.numberLiteral = function () {
    var _this = this;
    return _this.cacheparser("numberLiteral", function () {
      return _this.regex(new RegExp("^-?[0-9]+(\.?[0-9]+)?"));
    });
  };
  LittleParser.prototype.stringLiteral = function () {
    var _this = this;
    return _this.cacheparser("stringLiteral", function () {
      return (("\"" + _this.betweenandaccept(self.apostrophe, self.apostrophe, self.anyChar)) + "\"");
    });
  };
  LittleParser.prototype.symbolLiteral = function () {
    var _this = this;
    return _this.cacheparser("symbolLiteral", function () {
      _this.chr("#").call(_this);
      return (("\"" + _this.variable()) + "\"");
    });
  };
  LittleParser.prototype.arrayLiteral = function () {
    var _this = this;
    var args;
    return _this.cacheparser("arrayLiteral", function () {
      args = [];
      _this.string("#(").call(_this);
      _this.p("@@@@@@2");
      _this.many(function () {
        _this.p("@@@@@@");
        args.push(_this.expression());
        _this.skipSpace();
        _this.optional(_this.chr(","));
        return _this.skipSpace();
      });
      _this.chr(")")();
      return (("[" + args.join(", ")) + "]");
    });
  };
  LittleParser.prototype.skipSpace = function () {
    var _this = this;
    return _this.cacheparser("skipSpace", function () {
      return _this.optional(self.space);
    });
  };
  LittleParser.prototype.expression = function () {
    var _this = this;
    return _this.cacheparser("expression", function () {
      return _this.literal();
    });
  };
  exports.LittleParser = LittleParser;
  return LittleParser;
}).call(this);