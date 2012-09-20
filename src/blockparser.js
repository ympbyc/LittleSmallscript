/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * BlockParser
 * convert smalltalk style block to javascript's closure
 */
(function () {
  'use strict';

  var LittleParsers, BlockParser, 
  __each = function (obj, fn) {
    for (var key in obj)
      if (obj.hasOwnProperty(key))
        fn(obj[key], key);
    return;
  },
  __template = function (template, hashmap) {
    var dest_str = template;
    __each(hashmap, function (it, key) {
      dest_str = dest_str.replace(new RegExp('%'+key+'%', 'g'), it || "");
    });
    return dest_str;
  };

  try {
    LittleParsers = require('./littleparsers').LittleParsers;
  } catch (err) {
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
  }

  BlockParser = (function () {
    var BlockParser;

    BlockParser = function (input) {
      this.cache = {};
      this.input = input;
    };
    BlockParser.prototype = new LittleParsers("");

    /* [             statement ] *
     *   parameters              */
    BlockParser.prototype.block = function () {
      var _this = this,
          destinationTemplate = "function (%parameters%) { var self = this; %body% }";
      return this.cacheDo("block", function () {
        var parameters, body;
        _this.blockStart();
        parameters = _this.blockHead();
        body = _this.optional(_this.statement);
        _this.blockEnd();
        return __template(destinationTemplate, {parameters:parameters, body:body});
      });
    };

    /* space-separated sequence of parameters
     * ":foo :bar" -> "foo, bar" */
    BlockParser.prototype.blockParameters = function () {
      var _this = this;
      return this.cacheDo("blockParameters", function () {
        var vars = "";
        _this.many(function () {
          _this.colon();
          vars += _this.variable() + ", ";
          _this.skipSpace();
        });
        return vars.slice(0, -2);
      });
    };

    /* consume parameter sequence and return js style parameters
     * ":foo :bar|" -> blockParameters */
    BlockParser.prototype.blockHead = function () {
      var _this = this;
      return this.cacheDo("blockHead", function () {
        return _this.optional(function () {
          var params;
          _this.skipSpace();
          params = _this.blockParameters();
          if (params && params.length) _this.verticalBar();
          return params;
        });
      });
    };

    return BlockParser;
  })();

  try {
    exports.BlockParser = BlockParser;
  } catch (err) {}
  try{
    window.BlockParser = BlockParser;
  } catch (err) {}
  
}).call(this);
