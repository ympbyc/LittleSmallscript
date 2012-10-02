(function () {
  'use strict';
  var LSObject, LSArray, __hasProp;
  __hasProp = {}.hasOwnProperty;
  
  LSObject = function (obj) {
    var _Constructor, lsObj, key;
    if (obj !== undefined && obj !== null) {
      _Constructor = function () {};
      _Constructor.prototype = new LSObject();
      lsObj = new _Constructor();
      for (key in obj) {
        if (__hasProp.call(obj, key)) {
          lsObj[key] = obj[key];
        }
      }
      return lsObj;
    }
  };
  LSObject.prototype = new Object();

  LSArray = function (arr) {
    var key;
    this._privateArray = [];
    if ( ! arr) { return; }
    for (key in arr) {
      if (__hasProp.call(arr, key)) {
        this._privateArray.push(arr[key]);
      }
    }
  };
  LSArray.prototype = new LSObject();

  LSArray.prototype.push = LSArray.prototype.addLast = function (item) {
    return this._privateArray.push(item);
  };
  LSArray.prototype.pop = function () {
    return this._privateArray.pop();
  };
  LSArray.prototype.shift = function (item) {
    return this._privateArray.shift(item)
  };
  LSArray.prototype.unshift = function () {
    return this._privateArray.unshift()
  };
  LSArray.prototype.sort = function () {
    return this._privateArray.sort();
  };
  LSArray.prototype.do_ = LSArray.prototype.binaryDo = function (fn) {
    var key;
    for (key in this._privateArray) {
      if (__hasProp(this._privateArray, key)) {
        fn(this._privateArray[key]);
      }
    };
    return null;
  };
  LSArray.prototype.collect = function (fn) {
    var ret, _this;
    ret = new LSArray();
    _this = this;
    this.do_(function (item, key) {
      ret.push(fn.call(_this, item, key));
    });
    return ret;
  };
  LSArray.prototype.select = function (fn) {
    var ret;
    ret = new LSArray();
    this.do_(function (it, key) {
      if (fn.call(_this, it, key)) {
        ret.push(it);
      }
    });

    return ret;
  };
  LSArray.prototype.reject = function (fn) {
    var ret, _this;
    ret = new LSArray();
    _this = this;
    this.do(function (it, key) {
      if (! fn.call(_this, it, key)) {
        ret.push(it);
      }
    });
    return ret;
  };
  LSArray.prototype.sort = function () {
    return this._privateArray.sort();
  };
  LSArray.prototype.size = function () {
    return this._privateArray.length
  };
  LSArray.prototype.at = function (key) {
    return this._privateArray[key];
  };
  LSArray.prototype.atput = function (key, item) {
    return this._privateArray[key] = item;
  };
  "..."
})();