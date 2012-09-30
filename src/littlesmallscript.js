(function () {
  'use strict';
  var Packrat, LittleParser, BlockParser, Expression, Statement, Class, LittleSmallscript, mp;
  Packrat = require('./packrat').Packrat;
  LittleParser = require('./littleparser').LittleParser;
  BlockParser = require('./blockparser').BlockParser;
  Expression = require('./expression').Expression;
  Statement = require('./statement').Statement;
  Class = require('./class').Class;
  LittleSmallscript = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(Packrat);
  LittleParser.prototype.do_(function (item, key) {
    return LittleSmallscript.prototype[key] = item;
  });
  BlockParser.prototype.do_(function (item, key) {
    return LittleSmallscript.prototype[key] = item;
  });
  Expression.prototype.do_(function (item, key) {
    return LittleSmallscript.prototype[key] = item;
  });
  Statement.prototype.do_(function (item, key) {
    return LittleSmallscript.prototype[key] = item;
  });
  Class.prototype.do_(function (item, key) {
    return LittleSmallscript.prototype[key] = item;
  });
  LittleSmallscript.prototype.init = function (input, options) {
    var _this = this;
    _this.input = input;
    _this.index = 0;
    _this.cache = {};
    _this.options = options;
    _this.instanceVariables = {};
    return _this.currentClass = null;
  };
  LittleSmallscript.prototype.onError = function (err) {
    var _this = this;
    var line, rest, token;
    (function () {
      return line = (_this.input.substring((0), _this.maxIndex).match(/\n/g).size() + 1);
    }).tryCatch(function () {
      return line = 0;
    });
    rest = _this.input.substring(_this.maxIndex);
    token = rest.substring((0), rest.search(/[\.\s\t\n]|$/));
    console.log((((("Parse error on line " + line) + ". Unexpected ") + token) + "."));
    return console.log("====================================================");
  };
  LittleSmallscript.prototype.toJS = function () {
    var _this = this;
    var wrapTmpl, js, beautifyOption;
    wrapTmpl = "(function () { \"use strict\"; %statement% }).call(this);";
    (function () {
      return js = _this.templateapply(wrapTmpl, {
        "statement": _this.statement()
      });
    }).tryCatch(function () {
      return _this.onError();
    });
    (_this.index < _this.input.length) ? (function () {
      return _this.onError({});
    })() : void 0;
    beautifyOption = {
      "indent_size": 2,
      "indent_char": " ",
      "jslint_happy": true
    };
    return (_this.options && _this.options.prettyprint) ? ((function () {
      return require('../lib/beautify.js').js_beautify(js, beautifyOption);
    }))() : (function () {
      return js;
    })();
  };
  exports.LittleSmallscript = LittleSmallscript;
  return LittleSmallscript;
}).call(this);