(function () {
  'use strict';
  var Packrat, pkrt;
  Packrat = require('./packrat').Packrat;
  pkrt = new Packrat("12345");
  return console.log((pkrt.try_([pkrt.string("08765"), pkrt.string("12345"), pkrt.string("76122")]) === "12345"));
}).call(this);