(function () {
  "use strict";
  var Statement;
  Statement = require('./statement').Statement;
  var LittleSmallscript;
  LittleSmallscript = function () {
    this.input = null;
    this.options = null;
    this.beautifyOption = null;
    this.cache = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  LittleSmallscript.prototype = new Statement();;
  LittleSmallscript.prototype.initWithInputandOptions = function (text, opt) {
    var _this = this;
    _this.input = text;
    _this.options = opt;
    _this.cache = {};
    _this.beautifyOption = {
      "indent_size": 2,
      "indent_char": " ",
      "jslint_happy": true
    };
    return _this;
  };
  LittleSmallscript.prototype.onError = function (err) {
    var _this = this;
    var line, rest, token;
    line = (function () {
      var _ret;
      try {
        _ret = (function () {
          return (_this.input.substring((0), _this.getMaxIndex()).match(/\n/g).size() + 1);
        })();
      } catch (err) {
        _ret = function () {
          return 0;
        }(err);
      }
      return _ret;
    })();
    rest = _this.input.substring(_this.getMaxIndex());
    token = rest.substring((0), rest.search(/[\.\s\t\n]|$/));
    console.log((((("Parse error on line " + line) + ". Unexpected ") + token) + "."));
    console.log("====================================================");
    return console.log(_this.getStackTrace());
  };
  LittleSmallscript.prototype.toJS = function () {
    var _this = this;
    var wrapTmpl, js, beautifyOption, err;
    err = false;
    wrapTmpl = "(function () { \"use strict\"; %statement% }).call(this);";
    (function () {
      var _ret;
      try {
        _ret = (function () {
          return js = _this.templateapply(wrapTmpl, {
            "statement": _this.statement()
          });
        })();
      } catch (err) {
        _ret = function () {
          err = true;
          return _this.onError();
        }(err);
      }
      return _ret;
    })();
    err ? void 0 : (function () {
      return (_this.getIndex() < _this.input.size()) ? (function () {
        err = true;
        return _this.onError(null);
      })() : void 0;
    })();
    return err ? void 0 : (function () {
      return (_this.options && _this.options.prettyprint) ? ((function () {
        return require('../../../lib/beautify.js').js_beautify(js, _this.beautifyOption);
      }))() : (function () {
        return js;
      })();
    })();
  };
  exports.LittleSmallscript = LittleSmallscript;
  return LittleSmallscript;
}).call(this);