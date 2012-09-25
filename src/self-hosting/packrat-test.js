(function () {
  'use strict';
  var LittleParser, BlockParser, Expression, MyParser, mp;
  LittleParser = require('./littleparser').LittleParser;
  BlockParser = require('./blockparser').BlockParser;
  Expression = require('./expression').Expression;
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
    (function () {
      return _this.try_([_this.expression]);
    }).tryCatch(function () {
      return _this.onError();
    });
    return (_this.index < _this.input.length) ? (function () {
      return _this.onError({});
    })() : void 0;
  };
  mp = new MyParser("Object new ; at:#a put:1");
  return mp.p(mp.toJS());
}).call(this);