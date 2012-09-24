(function () {
  'use strict';
  var LittleParser, MyParser, mp;
  LittleParser = require('./littleparser').LittleParser;
  MyParser = (function (_super) {
    var _Constructor;
    _Constructor = function ( /* &rest arguments */ ) {
      if (this.init) this.init.apply(this, arguments);
    };
    _Constructor.prototype = new _super();
    return _Constructor;
  })(LittleParser);
  MyParser.prototype.init = function (input) {
    var _this = this;
    _this.input = input;
    return _this.cache = {};
  };
  MyParser.prototype.toJS = function () {
    var _this = this;
    return _this.try_([_this.literal]);
  };
  mp = new MyParser("#(1 2 #bar #(3))");
  return mp.p(mp.toJS());
}).call(this);