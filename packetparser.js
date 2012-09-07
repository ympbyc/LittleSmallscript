/* packetparser.js - javascript clone of http://d.hatena.ne.jp/ku-ma-me/20070906/p1
 *
 * packetparser.js is part of Little Smallscript.
 */

(function () {
  var Packet;

  /*
   * Packet Parser is an implementation of PEG
   * new this constructor function with input you want to parse
   * to generare parsers.
   */
  Packet = (function () {
    var Packet, NoParse;

    /* constructor */
    function Packet (input) {
      this.input = input;
      this.index = 0;
      this.cache = {};
    }

    /*
     * Cache combinators instead of evaluating them every time.
     * s = combinator name, fn = block that the combinator returns
     */
    Packet.prototype.cacheDo = function (s, fn) {
      fn = fn || function () {}; //block
      var c = {}; // c={fn:,idx:}
      if ((this.cache[s] || {})[this.index]) {
        c = this.cache[s][this.index];
        if (c.idx) {
          this.index = c.idx;
          return c.fn;
        }
        return this.noParse();
      }
      try {
        c.idx = this.index;
        c.fn = fn();
        this.cache[s][c.idx] = {fn:c.fn, idx:this.index};
        return c.fn;
      } catch (err) {
        this.cache[s][c.idx] = null;
        throw e;
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
    Packet.prototype.noParse = function () {
      throw new NoParse;
    };

    /*--- Definition of basic combinators ---*/

    /* 
     * ordered or 
     * a / b / ...
     */
    Packet.prototype.try_ = function (/* &rest arguments */) {
      var i, ret, _this = this;
      i = this.index;
      [].slice.call(arguments).forEach(function (a) {
        if (ret) return;
        try {
          ret = a.call(_this);
        } catch (err) {
          if ( ! err instanceof NoParse) throw err;
          _this.index = i;
        }
      });
      return ret ? ret : this.noParse();
    };

    /*
     * not sure what the intended use of this is
     */
    Packet.prototype.followedBy = function (fn) {
      var f = true,
          i = this.index;
      try {
        fn();
        f = false;
      } catch (err) {
        if ( ! err instanceof NoParse) throw err;
      }
      this.index = i;
      return f ? this.noParse() : null;
    };

    /*
     * not sure what the intended use of this is
     */
    Packet.prototype.notFollowedBy = function (fn) {
      var f = false,
          i = this.index;
      try {
        fn();
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
    Packet.prototype.many = function (fn) {
      var _this = this;
      return this.try_(
        function () { return _this.many1( function () { return fn(); } )  },
        function () { return [] }
      );
    };

    /*
     * 1 or more occurance. returned in an array.
     * a+
     */
    Packet.prototype.many1 = function (fn) {
      var v, vs;
      v = fn();
      vs = this.many(function () { return fn(); });
      return v.concat(vs);
    };

    /*
     * Matchs and consumes any one character.
     */
    Packet.prototype.anyChar = function () {
      var c;
      c = this.input[this.index];
      this.index += 1;
      return c ? c : this.noParse();
    };

    /*
     * Takes predicate block and consumes a character if satisfied.
     */
    Packet.prototype.satisfyChar = function (fn) {
      var c;
      c = this.anyChar();
      return fn(c) ? c : this.noParse();
    };
    
    /*
     * Matches the given character.
     */
    Packet.prototype.chr = function (ch) {
      var c;
      c = this.anyChar();
      return c == ch ? c : this.noParse()
    };
    
    /*
     * Matches the given string.
     */
    Packet.prototype.string = function (str) {
      var _this = this;
      str.split('').forEach(function (ch) {
        var c;
        c = _this.anyChar();
        if (c !== ch) _this.noParse();
      });
      return str;
    }
    
    return Packet;
    
  })();

  if ( ! exports) var exports = window;
  exports.Packet = Packet;

}).call(this);
