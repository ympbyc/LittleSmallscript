/* packratparser.js - javascript clone of http://d.hatena.ne.jp/ku-ma-me/20070906/p1
 *
 * packratparser.js is part of Little Smallscript.
 */

(function () {
  'use strict';

  var Packrat,
      __toArray = function (a) { return [].slice.call(a); },
      __valid = function (vari) { return /*vari !== null &&*/ vari !== undefined;  };

  /*
   * Packrat Parser is an implementation of PEG
   * new this constructor function with input you want to parse
   * to generare parsers.
   */
  Packrat = (function () {
    var Packrat, NoParse;

    /* constructor */
    function Packrat (input) {
      this.input = input;
      this.index = 0;
      this.cache = {};
    }

    /*
     * Cache parsers instead of evaluating them every time.
     * s = parser name, fn = the parser returned by the parser
     */
    Packrat.prototype.cacheDo = function (s, fn) {
      fn = fn || function () {}; //block
      var c = {}; // c={fn:,idx:}
      if ((this.cache[s] || (this.cache[s] = {}))[this.index]) {
        c = this.cache[s][this.index];
        if (c.idx) {
          this.index = c.idx;
          return c.fn;
        }
        return this.noParse();
      }
      try {
        c.idx = this.index;
        c.fn = fn.call(this);
        this.cache[s][c.idx] = {fn:c.fn, idx:this.index};
        return c.fn;
      } catch (err) {
        this.cache[s][c.idx] = null;
        throw err;
      }
    };

    /*
     * constructor for Error objects that is thrown on failure
     */
    NoParse = (function () {
      function NoParse () {
      };
      
      NoParse.prototype = new Error;
      
      return NoParse;
    })();

    /*
     * throw NoParse
     */
    Packrat.prototype.noParse = function () {
      throw new NoParse;
    };

    /*--- Definition of basic combinators ---*/
    /* available pegs
     * a b, a / b, a?, a*, a+, &a, !a,  (a)
     */


    /* 
     * ordered or 
     * a / b / ...
     */
    Packrat.prototype.try_ = function (/* &rest arguments */) {
      var i, ret, _this = this;
      i = this.index;
      __toArray(arguments).forEach(function (a) {
        if (ret) return;
        try {
          ret = a.call(_this);
        } catch (err) {
          if ( ! err instanceof NoParse) throw err;
          _this.index = i;
        }
      });
      return __valid(ret) ? ret : this.noParse();
    };

    /*
     * match all or none
     * a b ...
     */
    Packrat.prototype.sequence = function (/* &rest arguments */) {
      var i, ret, fail, _this = this;
      i = this.index;
      ret = "";
      fail = false;
      __toArray(arguments).forEach(function (a) {
        if (fail) return;
        try {
          ret += a.call(_this);
        } catch (err) {
          if ( ! err instanceof NoParse) throw err;
          _this.index = i;
          fail = true;
          _this.noParse();
        }
      });
      return __valid(ret) ? ret : this.noParse();
    };

    /*
     * succeeds even when the parser doesn't match
     * a?
     */
    Packrat.prototype.optional = function (fn) {
      var i;
      i = this.index;
      try {
        return fn.call(this);
      } catch (err) {
        if ( ! err instanceof NoParse) throw err;
        this.index = i; //backtraq
        return null;
      }
    };

    /*
     * succeeds if the given parser matches.
     * this parser doesn't consume the input
     * &a
     */
    Packrat.prototype.followedBy = function (fn) {
      var f = true,
          i = this.index;
      try {
        fn.call(this);
        f = false;
      } catch (err) {
        if ( ! err instanceof NoParse) throw err;
      }
      this.index = i; //backtraq
      return f ? this.noParse() : null;
    };

    /*
     * opposite of followedBy
     * !a
     */
    Packrat.prototype.notFollowedBy = function (fn) {
      var f = false,
          i = this.index;
      try {
        fn.call(this);
        f = true;
      } catch (err) {
        if ( ! err instanceof NoParse) throw err;
      }
      this.index = i;
      return f ? this.noParse() : null;
    };
    
    /*
     * 0 or more ocuurance. returned in an array.
     * a*
     */
    Packrat.prototype.many = function (fn) {
      var _this = this;
      return this.try_(
        function () { return _this.many1( function () { return fn.call(_this); } );  },
        function () { return ""; }
      );
    };

    /*
     * 1 or more occurance. returned in an array.
     * a+
     */
    Packrat.prototype.many1 = function (fn) {
      var v, vs, _this = this;
      v = fn.call(this);
      vs = this.many(function () { return fn.call(_this); });
      return v += vs;
    };

    /*
     * Matchs and consumes any one character.
     */
    Packrat.prototype.anyChar = function () {
      var c;
      c = this.input[this.index];
      this.index += 1;
      return __valid(c) ? c : this.noParse();
    };

    /*
     * Takes predicate block and consumes a character if satisfied.
     */
    Packrat.prototype.satisfyChar = function (fn) {
      var c;
      c = this.anyChar();
      return fn.call(this, c) ? c : this.noParse();
    };
    
    /*
     * Matches the given character.
     */
    Packrat.prototype.chr = function (ch) {
      var c;
      c = this.anyChar();
      return c == ch ? c : this.noParse()
    };
    
    /*
     * Matches the given string.
     */
    Packrat.prototype.string = function (str) {
      var _this = this;
      str.split('').forEach(function (ch) {
        var c;
        c = _this.anyChar();
        if (c !== ch) _this.noParse();
      });
      return str;
    }

    /*
     * Reular expression
     */
    Packrat.prototype.regex = function (regex) {
      var rc, match;
      rc = regex.exec(this.input.substring(this.index));
      if (rc) {
        match = rc[0]+"";
        this.index += match.length;
        return match;
      }
      this.noParse();
    }
    
    return Packrat;
    
  })();

  if ( ! exports) var exports = window;
  exports.Packrat = Packrat;

}).call(this);
