/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * Little Smallmethods
 * Define Little Smalltalk's built-in methods for JS primitive objects.
 * This library adds methods to basic objects' prototype if you like it or not.
 */
(function () {
  'use strict';
  var __hasProp = {}.hasOwnProperty;
  
  Function.prototype.subclass = function () {
    var Sc = function () {};
    Sc = function () {};
    Sc.prototype = new this();
    Sc.prototype.init = function () {}; // gets called immidiately after new
    Sc.prototype.__init = function () {}; //internal use only
    return Sc;
  };
  Function.prototype.subclassWithVariables_ = function (vararr) {
    var Sc = this.subclass();
    Sc.prototype.__init = function () {
      if (Object.defineProperty !== undefined && Object.defineProperty !== null) {
        Object.defineProperty(newInstance, '__instanceVariables__', {enumerable:false, value:[], writable:false});
      } else {
        this.__instanceVariables__ = [];
      }
      for (var key in vararr) {
        this[vararr[key]] = null;
        this.__instanceVariables__.push(vararr[key]);
      }
    }
    return Sc;
  };
  Function.prototype.new = Object.prototype.new_ = function () {
    var newInstance = new this();
    if (Object.defineProperty !== undefined && Object.defineProperty !== null) {
      Object.defineProperty(newInstance, '__collection__', {enumerable:false, value:[], writable:true});
      Object.defineProperty(newInstance, '__keys__', {enumerable:false, value:[], writable:true});
      Object.defineProperty(newInstance, '__generatorIndex__', {enumerable:false, value:-1, writable:true});
    } else {
      newInstance.__collection__ = []; // internal use for generators
      newInstance.__keys__ = [];
      newInstance.__generatorIndex__ = -1; // internal use for generators
    }
    if (newInstance.__init) newInstance.__init.call(this);
    if (newInstance.init) newInstance.init.call(this, arguments);
    return newInstance;
  };
  Function.prototype.method_at_ = function (fn, slot) {
    return this.prototype[slot] = fn;
  };

  Object.prototype.asString = Object.prototype.toString;
  Object.prototype.class_ = function () { return this.constructor };
  Object.prototype.copy = Object.prototype.shallowCopy = function () { return this; };
  Object.prototype.deepCopy = function () {
    var a = new this.constructor || Object;
    for (var key in this) {
      if (__hasProp.call(this, key)) a[key] = this[key];
    }
    return a;
  };
  Object.prototype.do_ = Object.prototype.binaryDo_ = function (fn) {
    for (var key in this) {
      if (__hasProp.call(this, key) && new String(key).search(/__/) !== 0) fn(this[key], key);
    }
    return null;
  };
  Object.prototype.error_ = function (str) { throw str; };
  Object.prototype.__updateCollection = function () {
    this.__collection__ = [];
    this.__keys__ = [];
    var _this = this;
    return this.do_(function (it, key) {
      if (it !== undefined) {
        _this.__collection__.push(it);
        _this.__keys__.push(key);
      }
    });
  };

  Object.prototype.first = function () { 
    this.__updateCollection();
    return this.__collection__[this.__generatorIndex__+1].notNil() ? this.__collection__[++this.__generatorIndex__] : this;
  };
  Object.prototype.next = function () {
    return this.__collection__[this.__generatorIndex__+1] ? this.__collection__[++this.__generatorIndex__] : null;
  };
  Object.prototype.isKindOf_ = function (Klass) { return this instanceof Klass; };
  Object.prototype.isMemberOf_ = function (Klass) { return this.class_() === Klass;  }
  Object.prototype.isNil = function () { return this === null || this === undefined;  };
  Object.prototype.notNil = function () { return this !== null && this !== undefined;  };
  Object.prototype.print = Object.printString = function () { return JSON ? JSON.stringify(this) : this.toString();  };
  Object.prototype.respondsTo_ = function (name) { return this[name].notNil() };
  
  Boolean.prototype.and_ = function (fn) { return this.valueOf() ? (fn.call(this) ? true : false) : false;  };
  Boolean.prototype.or_ = function (fn) { return  this.valueOf() ? true : (fn.call(this) ? true : false); };
  Boolean.prototype.eqv_ = function (bool) {
    if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'argument must be boolean'; 
    return this.valueOf() === bool;
  };
  Boolean.prototype.xor_ = function (bool) {
  if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'argument must be boolean';
    return this.valueOf() !== bool;
  };
  Boolean.prototype.ifTrue_ = function (fn) { return this.valueOf() ? fn.call(this) : null;  };
  Boolean.prototype.ifFalse_ = function (fn) { return this.valueOf() ? null : fn.call(this);  };
  Boolean.prototype.ifTrue_ifFalse_ = function (t, f) { return this.valueOf() ? t.call(this) : f.call(this); };
  Boolean.prototype.ifFalse_ifTrue_ = function (f, t) { return this.valueOf() ? t.call(this) : f.call(this); };
  Boolean.prototype.not = function () { return ! this.valueOf(); };
  
  Number.prototype.to_ = function (tonum) { 
    var i = this-1, 
    res = []; 
    while (++i < tonum) 
      res.push(i); 
    return res;
  };
  Number.prototype.to_by_ = function (tonum, bynum) {
    var i = this-1;
    res = [];
    while (i+=bynum <= tonum)
      res.push(i);
    return res;
  };
  Number.prototype.timesRepeat_ = function (fn) {
    var _this = this;
    return (0).to_(this).do_(function (it) { return fn.call(_this, it); }); 
  };
  
  Object.prototype.addAll = function (col) {
    var _this = this;
    col.do_(function (it, key) {
      _this[key] = it;
      _this.__collection__.push(it);
      _this.__keys__.push(key);
    });
    return this;
  };
  Object.prototype.asArray = function () {
    this.__updateCollection(); //for safety
    return this.__collection__.concat([]);
  };
  Object.prototype.asString = function () {
    this.__updateCollection(); //for safety
    return this.__collection__.inject_into_('', function (it, lastres) {
      return lastres + new String(it);
    });
  };
  Object.prototype.collect_ = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = fn.call(_this, it);
    });
    return ret;
  };
  Object.prototype.detect_ = function (fn) {
    this.do_(function (it, key) {
      if (fn.call(this, it)) return it;
    });
    throw "not found";
    return null;
  };
  Object.prototype.detect_ifAbsent_ = function (fn1, fn2) {
    try {
      return this.detect(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Object.prototype.includes_ = function (it) {
    try{
      this.detect(function (it2) { return it === it2; });
      return true;
    } catch (err) {
      return false;
    };
  };
  Object.prototype.inject_into_ = function (initialValue,fn) {
    var lastres = initialValue,
        _this = this;
    this.do_(function (it, key) {
      lastres = fn.call(_this, it, lastres);
    });
    return lastres;
  };
  Object.prototype.isEmpty = function () { 
    this.__updateCollection(); //for safety
    return this.__collection__.length === 0; 
  };
  Object.prototype.occuranceOf_ = function (item) {
    return this.inject_into_(0, function (it, lst) { return (item === it) ? ++lst : lst });
  };
  Object.prototype.remove_ = function (item) {
    var found = false,
        _this = this;
    this.do_(function (it, key) {
      if (it === item) { found = true; delete _this[key]; }
    });
    return null;
  };
  Object.prototype.remove_ifAbsent_ = function (item, fn) {
    try {
      return this.remove_(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.select_ = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.reject_ = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if ( ! fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.size = function () { 
    this.__updateCollection(); //for safety
    return this.__collection__.length;  
  };
  Object.prototype.asDictionary = function () {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = it;
    });
    return ret;
  };
  Object.prototype.at_ = function (key) {
    if (this[key].isNil) throw "slot is nil";
    return this[key]; 
  };
  Object.prototype.at_ifAbsent_ = function (key, fn) {
    try {
      return this.at_(key);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.atAll_put_ = function (keys, item) {
    var _this = this;
    keys.do_(function (key) { return _this[key] = item;  });
    this.__updateCollection();
    return this;
  };
  Object.prototype.at_put_ = function (key, item) {
    this[key] = item;
    this.__updateCollection();
    return this;
  };
  Object.prototype.includesKey_ = function (key) {
    return this[key] !== undefined;
  };
  Object.prototype.indexOf_ = function (item) {
    for (var key in this) {
      if (this[key] === item) return key;
    }
    throw "not found";
  }
  Object.prototype.indexOf_ifAbsent_ = function (item, fn) {
    try {
      return this.indexOf_(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.keys = function () {
    this.__updateCollection(); //for safety
    return this.__keys__;
  };
  Object.prototype.keysDo_ = function (fn) {
    return this.keys().do_(fn);
  };
  Object.prototype.keySelect_ = function (fn) {
    return this.keys().select_(fn);
  };
  Object.prototype.removeKey_ = function (key) {
    if (this[key].isNil()) throw "slot not found";
    this.__updateCollection();
    return delete this[key];
  };
  Object.prototype.removeKey_ifAbsent_ = function (key, fn) {
    try {
      return this.removeKey(key);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.currentKey = function () {
    this.__updateCollection(); //for safety
    return this.__keys__[this.__generatorIndex__];
  };

  Array.prototype.addLast_ = function (item) { this.push(item); this.__updateCollection(); return this; };  
  Array.prototype.do_ = Array.prototype.binaryDo_ = Array.prototype.forEach || Object.prototype.do_;
  Array.prototype.collect_ = Array.prototype.map || function (fn) {
    var ret = [], 
        _this = this;
    this.do_(function (it, key) {
      ret.push(fn.call(_this, it, key));
    });
    return ret;
  };
  Array.prototype.select_ = Array.prototype.filter || function (fn) {
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
  Array.prototype.copyFrom_to_ = function (from, to) {
    return this.slice(from, to);
  };
  Array.prototype.copyWith_ = function (fn) {
    return this.concat([]).concat(fn.call(this));
  };
  Array.prototype.copyWithout_ = function (val) {
    return this.reject(function (it) { return it===val;  });
  };
  Array.prototype.equals_startingAt_ = function (arr, idx) {
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
    throw "not found";
  };
  Array.prototype.findFirst_ifAbsent = function (fn1, fn2) {
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
    throw "not found"
  };
  Array.prototype.findLast_ifAbsent = function (fn1, fn2) {
    try {
      return this.findLast(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Array.prototype.firstKey = function () { return 0;  };
  Array.prototype.last = function () { return this[this.length-1];  };
  Array.prototype.lastKey = function () { return this.length - 1;  }
  Array.prototype.replaceFrom_to_with_ = function (from, to, replacement) {
    for (var i = from, j = 0; i < to; ++i) {
      this[i] = replacement[j];
      ++j;
    }
    this.__updateCollection();
    return this;
  };
  Array.prototype.startingAt_ = function (idx) { return this.slice(idx);  };
  Array.prototype.reversed = function () {
    return this.reverse();
  };
  Array.prototype.reverseDo_ = function (fn) {
    return this.reverse().do_(fn);
  };
  Array.prototype.sort_ = Array.prototype.sort;
  Array.prototype.with_do_ = function (col, fn) {
    if (this.length !== col.length) throw "first argument has to be an array that have the same length as the receiver";
  };

  String.prototype.at_ = function (idx) { return this[idx]; };
  String.prototype.at_put_ = function (idx, item) {
    this = this.substring(0,idx-1) + item + this.substring(idx+1);
    return this;
  };
  String.prototype.copyFrom_length_ = function (from, length) { return this.substring(from, from+length)  };
  String.prototype.copyFrom_to_ = String.prototype.substring;
  String.prototype.print = function () { try { console.log(this) } catch (err) { throw "no console found" } };
  String.prototype.size = function () { return this.length; };
  String.prototype.sameAs_ = function (str) { return this.toLowerCase() === str.toLowerCase() };
  
  Function.prototype.value = function () { return this(); };
  Function.prototype.value_ 
      = Function.prototype.value_value_ 
      = Function.prototype.value_value_value_ 
      = Function.prototype.value_value_value_value_ 
      = Function.prototype.value_value_value_value_value_ 
      = function (/* &rest arguments */) { 
        return this.apply(this, arguments);
      };
  Function.prototype.whileTrue_ = function (fn) {
    while (this()) fn.call(this);
    return null;
  };
  Function.prototype.whileTrue = function () {
    while (this()) ;
    return null;
  };
  Function.prototype.whileFalse_ = function (fn) {
    while ( ! this()) fn.call(this);
    return null;
  };
  Function.prototype.whileFalse = function () {
    while ( ! this()) ;
    return null;
  };
  
}).call(this);
