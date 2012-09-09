/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * LittleSmallscript
 * main
 */
(function () {
  'use strict';
  
  var Packrat, LittleParsers, BlockParser, ExpressionParser, LittleSmallscript,
  __extend = function (destination, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        destination[k] = source[k];
      }
    }
    return destination;
  };
  
  try {
    Packrat = require("./packratparser").Packrat;
    LittleParsers = require('./littleparsers').LittleParsers;
    BlockParser = require('./blockparser').BlockParser;
    ExpressionParser= require('./expressionparser').ExpressionParser;
  } catch (err) {
    if ( ! (Packrat = window.Packrat)) throw "packratparser.js is required";
    if ( ! (LittleParsers = window.LittleParsers)) throw "littleparsers.js is required";
    if ( ! (BlockParser = window.BlockParser)) throw "blockparser.js is required";
    if ( ! (ExpressionParser = window.ExpressionParser)) throw "expressionparser.js is required";
  }

  LittleSmallscript = (function () { 
    var LittleSmallscript;
    
    LittleSmallscript = function (input) {
      this.cache = {};
      this.input = input;
    };
    LittleSmallscript.prototype = new Packrat("");
    //mixin
    __extend(LittleSmallscript.prototype, LittleParsers.prototype);
    __extend(LittleSmallscript.prototype, BlockParser.prototype);
    __extend(LittleSmallscript.prototype, ExpressionParser.prototype);
    
    return LittleSmallscript;
  })()
  
  try {
    exports.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  try {
    window.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  
}).call(this);
