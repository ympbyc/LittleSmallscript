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
    return Sc;
  };
  Function.prototype.new = Object.prototype.new_ = function () {
    var newInstance = new this();
    newInstance.__collection__ = []; // internal use for generators
    newInstance.__keys__ = [];
    newInstance.__generatorIndex__ = -1; // internal use for generators
    if () newInstance.init.call(this, arguments);
    return newInstance;
  };
  Function,prototype.method_at_ = function (fn, slot) {
    return this.prototype[slot] = fn;
  };

  Object.prototype.asString = Object.prototype.toString;
  Object.prototype.class_ = return () { return this.constructor };
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
      if (__hasProp.call(this, key)) fn(this[key], key);
    }
    return null;
  };
  Object.prototype.error_ = function (str) { throw str; };
  Object.prototype.first = function () { 
    for (var key in this) {
      if (__hasProp.call(this, key) && this[key] !== undefined) {
        this.__collection__.push(this[key]);
        this.__keys__.push(key);
      }
    }
    return __collection__[__generatorIndex__+1].notNil() ? __collection__[++__generatorIndex__] : this;
  };
  Object.prototype.next = function () {
    return __collection__[__generatorIndex__+1].notNil() ? __collection__[++__generatorIndex__] : null;
  };
  Object.prototype.isKindOf_ = function (Klass) { return this instanceof Klass; };
  Object.prototype.isMemberOf_ = function (Klass) { return this.class_() === Klass;  }
  Object.prototype.isNil = function () { return this === null || this === undefined;  };
  Object.prototype.notNil = function () { return this !== null && this !== undefined;  };
  Object.prototype.print = Object.printString = function () { return JSON ? JSON.stringify(this) : this.toString();  };
  Object.prototype.respondsTo_ = function (name) { return this[name].notNil() };
  
  Boolean.prototype.and_ = function (fn) { return this ? (fn.call(this) ? true : false) : false;  };
  Boolean.prototype.or_ = function (fn) { return  this ? true : (fn.call(this) ? true : false); };
  Boolean.prototype.eqv_ = function (bool) {
    if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'argument must be boolean'; 
    return this === bool 
  };
  Boolean.prototype.xor_ = function (bool) {
  if (typeof bool !== 'boolean' && ! bool instanceof Boolean) throw 'argument must be boolean';
    return this !== bool;
  };
  Boolean.prototype.ifTrue_ = function (fn) { retrun this ? fn.call(this) : null;  };
  Boolean.prototype.ifFalse_ = function (fn) { return this ? null : fn.call(this);  };
  Boolean.prototype.ifTrue_ifFalse_ = function (t, f) { return this ? t.call(this) : f.call(this); };
  Boolean.prototype.ifFalse_ifTrue_ = function (f, t) { return this ? t.call(this) : f.call(this); };
  Boolean.prototype.not = function () { return ! this; };
  
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
      res.push(i)l
    return res;
  };
  Number.timesRepeat = function (fn) {
    var _this = this;
    return (0).to_(this).do_(function (it) { return fn.call(_this, it); }); 
  };
  
  Object.prototype.addAll = function (col) {
    for (var key in col) {
      this[key] = col[key]
      this.__collection__.push(col[key]);
      this.__keys__.push(key);
    }
    return this;
  };
  Object.prototype.asArray = function () {
    return this.__collection__.concat([]);
  };
  Object.prototype.asString = function () {
    return this.__collection__.inject_into_('', function (it, lastres) {
      return lastres + new String(it);
    });
  };
  Object.prototype.collect_ = function (fn) {
    var ret = {}
    for (var key in this) {
      ret.[key] = fn.call(this, this[key]);
    };
    return ret;
  };
  Object.prototype.detect_ = function (fn) {
    for (var key in this) {
      if (fn.call(this, this[key])) return this[key];
    }
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
    var lastres = initialValue;
    for (var key in this) {
      lastres = fn.call(this, this[key], lastres);
    }
    return lastres;
  };
  Object.prototype.isEmpty = function () { return this.__collection__.length === 0; };
  Object.prototype.occuranceOf_ = function (item) {
    return this.inject_into_(0, function (it, lst) { return (item === it) ? ++lst : lst });
  };
  Object.prototype.remove_ = function (item) {
    var found = false;
    for (var key in this) {
      if (this[key] === item) { false = true; delete this[key]; }
    }
    if ( ! found) throw "not found";
    return null;
  };
  Object.prototype.remove_ifAbsent_ (item, fn) {
    try {
      return this.remove_(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.select_ = function (fn) {
    var ret = {};
    for (var key in this) {
      if (fn.call(this, this[key])) ret[key] = this[key];
    }
    return ret;
  };
  Object.prototype.reject_ = function (fn) {
    var ret = {};
    for (var key in this) {
      if ( ! fn.call(this, this[key])) ret[key] = this[key];
    }
    return ret;
  };
  Object.prototype.size = function () { return this.__collection__.length;  };
  Object.prototype.asDictionary = function () {
    var ret = {};
    for (var key in this) {
      ret[key] = this[key];
    }
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
    if (Object.keys) return Object.keys(this);
    var keys = [];
    for (var key in this) {
      keys.push(key);
    }
    return keys;
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
    return this.__keys__[this.__generatorIndex__];
  };
  Object.prototype.__updateCollection = function () {
    this.__collection__ = [];
    for (var key in this) {
      if (__hasProp.call(this, key) && this[key] !== undefined) {
        this.__collection__.push(this[key]);
        this.__keys__.push(key);
      }
    }
  };
  
  Array.prototype.copyFrom_to_ = function (from, to) {
    return this.slice(from, to);
  };
  Array.prototype.copyWith_ = function (fn) {
    return this.concat([]).concat(fn.call(this));
  };
  Array.prototype.copyWithout_ = (val) {
    return this.reject(function (it) { return it===val;  });
  };
  Array.prototype.equals_startingAt_ = function (arr, idx) {
    if (this.length !== arr.slice(idx).length) return false;
    var tgt = arr.slice(idx);
    for (var key in this) {
      if (this[key] !== tgt[key]) return false;
    }
    return true;
  };
  
  
}).call(this);
