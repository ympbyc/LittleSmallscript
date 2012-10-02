/*
 * This file is deprecated.
 * it will be replaced with prelude.js when it's ready
 */
(function () {
  'use strict';
  var __hasProp = {}.hasOwnProperty;
  
  Object.prototype.asString = Object.prototype.toString;
  Object.prototype.class_ = function () { return this.constructor; };
  Object.prototype.copy = Object.prototype.shallowCopy = function () { return this; };
  Object.prototype.deepCopy = function () {
    var a = new (this.constructor || Object);
    for (var key in this) {
      if (__hasProp.call(this, key)) a[key] = this[key];
    }
    return a;
  };
  Object.prototype.do_ = Object.prototype.binaryDo = function (fn) {
    for (var key in this) {
      if (__hasProp.call(this, key) && String(key).search(/__/) !== 0) fn(this[key], key);
    }
    return null;
  };
  Object.prototype.error = function (str) { throw str; };
  Object.prototype.isKindOf = function (Klass) { return this instanceof Klass; };
  Object.prototype.isMemberOf = function (Klass) { return this.class_() === Klass;  };
  Object.prototype.print = Object.printString = function () { return JSON ? JSON.stringify(this) : this.toString();  };
  Object.prototype.respondsTo = function (name) { return this[name] && (typeOf this[name] === 'function'); };
  
  Boolean.prototype.and = function (fn) { return this.valueOf() ? (fn.call(this) ? true : false) : false;  };
  Boolean.prototype.or = function (fn) { return  this.valueOf() ? true : (fn.call(this) ? true : false); };
  Boolean.prototype.eqv = function (bool) {
    if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'Beelean.eqv expects parameter 1 to be bool.' + bool + 'given.'; 
    return this.valueOf() === bool;
  };
  Boolean.prototype.xor = function (bool) {
  if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'Beelean.xor expects parameter 1 to be bool.' + bool + 'given.'; 
    return this.valueOf() !== bool;
  };
  Boolean.prototype.not = function () { return ! this.valueOf(); };
  
  Number.prototype.to = function (tonum) { 
    var i = this-1, 
    res = []; 
    while (++i < tonum) 
      res.push(i); 
    return res;
  };
  // to:by:
  Number.prototype.toby = function (tonum, bynum) {
    var i = this-1,
        res = [];
    while (i += bynum <= tonum)
      res.push(i);
    return res;
  };
  Number.prototype.timesRepeat = function (fn) {
    var _this = this;
    return (0).to(this).do_(function (it) { return fn.call(_this, it); }); 
  };
  
  Object.prototype.addAll = function (col) {
    var _this = this;
    col.do_(function (it, key) {
      _this[key] = it;
    });
    return this;
  };
  Object.prototype.asArray = function () {
    return this.collect(function (it) {return it});
  };
  Object.prototype.asString = function () {
    return this.asArray().injectinto('', function (it, lastres) {
      return lastres + String(it);
    });
  };
  Object.prototype.collect = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = fn.call(_this, it);
    });
    return ret;
  };
  Object.prototype.detect = function (fn) {
    this.do_(function (it, key) {
      if (fn.call(this, it)) return it;
    });
    throw "Object.detect could not find an item that satisfies "+fn.toString()+".";
  };
  // detect:ifAbsent:
  Object.prototype.detectifAbsent = function (fn1, fn2) {
    try {
      return this.detect(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Object.prototype.includes = function (it) {
    try{
      this.detect(function (it2) { return it === it2; });
      return true;
    } catch (err) {
      return false;
    }
  };
  // inject:into:
  Object.prototype.injectinto = function (initialValue,fn) {
    var lastres = initialValue,
        _this = this;
    this.do_(function (it, key) {
      lastres = fn.call(_this, it, lastres);
    });
    return lastres;
  };
  Object.prototype.isEmpty = function () { 
    return this.size() === 0;
  };
  Object.prototype.occuranceOf = function (item) {
    return this.injectinto(0, function (it, lst) { return (item === it) ? ++lst : lst; });
  };
  Object.prototype.remove = function (item) {
    var found = false,
        _this = this;
    this.do_(function (it, key) {
      if (it === item) { found = true; delete _this[key]; }
    });
    return null;
  };
  // remove:ifAbsent:
  Object.prototype.removeifAbsent = function (item, fn) {
    try {
      return this.remove(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.select = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.reject = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if ( ! fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.size = function () { 
    return this.injectinto(0,function (a,b) {return b+1});
  };
  Object.prototype.asDictionary = function () {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = it;
    });
    return ret;
  };
  Object.prototype.at = function (key) {
    if ((! this[key]) || this[key].isNil()) throw "Object.at: slot "+key+" is nil";
    return this[key]; 
  };
  // at:ifAbsent:
  Object.prototype.atifAbsent = function (key, fn) {
    try {
      return this.at(key);
    } catch (err) {
      return fn.call(this);
    }
  };
  // atAll:put:
  Object.prototype.atAllput = function (keys, item) {
    var _this = this;
    keys.do_(function (key) { return _this[key] = item;  });
    return this;
  };
  // at:put:
  Object.prototype.atput = function (key, item) {
    this[key] = item;
    return this;
  };
  Object.prototype.includesKey = function (key) {
    return this[key] !== undefined;
  };
  Object.prototype.indexOf = function (item) {
    for (var key in this) {
      if (this[key] === item) return key;
    }
    throw "Object.indexOf: not found";
  };
  // indexOf:ifAbsent:
  Object.prototype.indexOfifAbsent = function (item, fn) {
    try {
      return this.indexOf(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.keys = function () {
    if (Object.keys) return Object.keys(this);
    this.collect(function (it, key) {return key});
  };
  Object.prototype.keysDo = function (fn) {
    return this.keys().do_(fn);
  };
  Object.prototype.keySelect = function (fn) {
    return this.keys().select(fn);
  };
  Object.prototype.removeKey = function (key) {
    if (this[key].isNil()) throw "Object.removeKey: slot " + key + " not found";
    return delete this[key];
  };
  // removeKey:ifAbsent:
  Object.prototype.removeKeyifAbsent = function (key, fn) {
    try {
      return this.removeKey(key);
    } catch (err) {
      return fn.call(this);
    }
  };

  Array.prototype.addLast = function (item) { this.push(item); return this; };  
  Array.prototype.do_ = Array.prototype.binaryDo = Array.prototype.forEach || Object.prototype.do_;
  Array.prototype.collect = Array.prototype.map || function (fn) {
    var ret = [], 
        _this = this;
    this.do_(function (it, key) {
      ret.push(fn.call(_this, it, key));
    });
    return ret;
  };
  Array.prototype.select = Array.prototype.filter || function (fn) {
    var ret = [],
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret.push(it);
    });
    return ret;
  };
  Array.prototype.reject = function (fn) {
    var ret = [],
        _this = this;
    this.do_(function (it, key) {
      if ( ! fn.call(_this, it)) ret.push(it);
    });
    return ret;
  };
  // copyFrom:to:
  Array.prototype.copyFromto = function (from, to) {
    return this.slice(from, to);
  };
  Array.prototype.copyWith = function (fn) {
    return this.concat([]).concat(fn.call(this));
  };
  Array.prototype.copyWithout = function (val) {
    return this.reject(function (it) { return it===val;  });
  };
  // equals:startingAt:
  Array.prototype.equalsstartingAt = function (arr, idx) {
    if (this.length !== arr.slice(idx).length) return false;
    var tgt = arr.slice(idx), 
        _this = this;
    this.do_(function (it, key) {
      if (it !== tgt[key]) return false;
    });
    return true;
  };
  Array.prototype.findFirst = function (fn) {
    var _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) return key;
    });
    throw "Array.findFirst: not found";
  };
  // findFirst:ifAbsent:
  Array.prototype.findFirstifAbsent = function (fn1, fn2) {
    try {
      return this.findFirst(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Array.prototype.findLast = function (fn) {
    var ret, 
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret = key;
    });
    if (ret) return ret;
    throw "Array.findLast: not found";
  };
  // findLast:ifAbsent:
  Array.prototype.findLastifAbsent = function (fn1, fn2) {
    try {
      return this.findLast(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Array.prototype.firstKey = function () { return 0;  };
  Array.prototype.last = function () { return this[this.length-1];  };
  Array.prototype.lastKey = function () { return this.length - 1;  };
  // replaceFrom:to:with:
  Array.prototype.replaceFromtowith = function (from, to, replacement) {
    for (var i = from, j = 0; i < to; ++i) {
      this[i] = replacement[j];
      ++j;
    }
    return this;
  };
  Array.prototype.startingAt = function (idx) { return this.slice(idx);  };
  Array.prototype.reversed = function () {
    return this.reverse();
  };
  Array.prototype.reverseDo = function (fn) {
    return this.reverse().do_(fn);
  };
  Array.prototype.sort = Array.prototype.sort;
  // with:do:
  Array.prototype.withdo = function (col, fn) {
    if (this.length !== col.length) throw "Array.withDo: first argument has to be an array that have the same length as the receiver";
  };
  Array.prototype.size = function () { return this.length };

  String.prototype.at = function (idx) { return this[idx]; };

  // copyFrom:length:
  String.prototype.copyFromlength = function (from, length) { return this.substring(from, from + length);  };
  // copyFrom:to:
  String.prototype.copyFromto = String.prototype.substring;
  String.prototype.print = function () { try { return console.log(this); } catch (err) { throw "String.print: no console found"; } };
  String.prototype.size = function () { return this.length; };
  String.prototype.sameAs = function (str) { return this.toLowerCase() === str.toLowerCase(); };
  
  Function.prototype.value = function () { return this(); };
  // value:value:...
  Function.prototype.valuevalue 
      = Function.prototype.valuevaluevalue 
      = Function.prototype.valuevaluevaluevalue 
      = Function.prototype.valuevaluevaluevaluevalue 
      = function (/* &rest arguments */) { 
        return this.apply(this, arguments);
      };
  Function.prototype.whileTrue = function (fn) {
    while (this()) if (fn) fn.call(this);
    return null;
  };
  Function.prototype.whileFalse = function (fn) {
    while ( ! this()) if (fn) fn.call(this);
    return null;
  };
  Function.prototype.tryCatch = function (fn) {
    try {
      return this();
    } catch (err) {
      return fn.call(this, err);
    }
  };
  Function.prototype.tryCatchfinally = function (fn1, fn2) {
    try {
      this();
    } catch (err) {
      fn1.call(this, err);
    } finally {
      return fn2.call(this);
    }
  };
  
}).call(this);
