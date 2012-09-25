(function () {
  'use strict';
  var BlockParser, MyParser, mp;
  BlockParser = require('./blockparser').BlockParser;
  MyParser = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(BlockParser);
  MyParser.prototype.init = function (input) {
    var _this = this;
    _this.input = input;
    return _this.cache = {};
  };
  MyParser.prototype.toJS = function () {
    var _this = this;
    return (function () {
      return _this.try_([_this.block]);
    }).tryCatch(function (err) {
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
    });
  };
  mp = new MyParser("[#(1 2 #aaa #(3))]");
  return mp.p(mp.toJS());
}).call(this);