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
  
  var LittleParsers, BlockParser, ExpressionParser, LittleSmallscript;
  
  try {
    LittleParsers = require('./littleparsers').LittleParsers;
    BlockParser = require('./blockparser').BlockParser;
    ExpressionParser= require('./expressionparser').ExpressionParser;
  } catch (err) {
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
    LittleSmallscript.prototype = new LittleParsers("");
    
    /*                             cascade *
     * variable <-@recur(variable)         */
    LittleSmallscript.prototype.expression = function () {
      var _this = this;
      return this.cacheDo("expression", function () {
        return new ExpressionParser(this.input.substring(this.index)).expression();
      });
    };
    
    /* [                 blockstatement ] *
     *   blockparameters                  */
    LittleSmallscript.prototype.block = function () {
      var _this = this;
      return this.cacheDo("block", function () {
        return new BlockParser(this.input.substring(this.index)).block();
      });
    };

    return LittleSmallscript;
  })()
  
  try {
    exports.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  try {
    window.LittleSmallscript = LittleSmallscript;
  } catch (err) {}
  
}).call(this);
