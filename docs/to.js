(function () {
  var Klass,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
  
  Klass = (function (_super) {
    __extends(Klass, _super);
    
    function Klass () {
      this.someArray = null;
      this.index = null;
      this.init();
    }

    Klass.prototype.init = function () {
      this.someArray = Array.new_();
      this.index = 0;
    };
    
    Klass.prototype.current = function () {
      return this.someArray.at_(this.index);
    };

    Klass.prototype.current_ = function (replacement) {
      this.someArray.at_put_(this.index, replacement);
      return this;
    };
    
    Klass.prototype.incrementPointer = function () {
      var origin;
      origin = index.deepCopy();
      index = index.plus_(1);
      (origin.concat_(' to ').concat_(index)).print();
      return index;
    };

  })(superClass);
  
  (function () {
    var _cascade;
    _cascade = Klass.new_();
    _cascade.incrementPointer();
    _cascade.current_(3);
    _cascade.current().print();
  })();

  [1, 2, 3, 4].inject_into_(0, function (a, lastres) { return lastres.plus_(a); });

}).call(this);
