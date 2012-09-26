(function () {
  'use strict';
  var LittleParser, BlockParser, Expression, Statement, MyParser, mp;
  LittleParser = require('./littleparser').LittleParser;
  BlockParser = require('./blockparser').BlockParser;
  Expression = require('./expression').Expression;
  Statement = require('./statement').Statement;
  MyParser = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(LittleParser);
  BlockParser.prototype.do_(function (item, key) {
    return MyParser.prototype[key] = item;
  });
  Expression.prototype.do_(function (item, key) {
    return MyParser.prototype[key] = item;
  });
  Statement.prototype.do_(function (item, key) {
    return MyParser.prototype[key] = item;
  });
  MyParser.prototype.init = function (input) {
    var _this = this;
    _this.input = input;
    return _this.cache = {};
  };
  MyParser.prototype.onError = function (err) {
    var _this = this;
    var line, rest, token;
    console.log(_this.maxIndex);
    (function () {
      return line = (_this.input.substring((0), _this.maxIndex).match(/\n/g).size() + 1);
    }).tryCatch(function () {
      return line = 0;
    });
    rest = _this.input.substring(_this.maxIndex);
    token = rest.substring((0), rest.search(/[\.\s\t\n]|$/));
    return console.log((((("Parse error on line " + line) + ". Unexpected ") + token) + "."));
  };
  MyParser.prototype.toJS = function () {
    var _this = this;
    var ret;
    ret = (function () {
      return _this.try_([_this.statement]);
    }).tryCatch(function () {
      return _this.onError();
    });
    (_this.index < _this.input.length) ? (function () {
      return _this.onError({});
    })() : void 0;
    return ret;
  };
  mp = new MyParser("| foo bar | foo := 1. bar.");
  return console.log(mp.toJS());
}).call(this);