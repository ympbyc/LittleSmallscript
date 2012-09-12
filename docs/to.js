(function () {
  var Klass,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
  
  Klass = (function (_super) {
    __extends(Klass, _super);
    var Klass;
    
    Klass = function () {
      this.someArray = (1).to(10);
      this.index = 0;
    };
    
    Klass.prototype.current = function () {
      return this.someArray.at_(this.index);
    };

    Klass.prototype.replaceCurrentWith = function (replacement) {
      this.someArray.[this.index] = replacement;
      return this;
    };
    
    Klass.prototype.incrementPointer = function () {
      var origin;
      origin = this.index;
      index = index + 1;
      (origin + ' to ' + index).print();
      return index;
    };

  })(superClass);
  
  (function () {
    var _cascade;
    _cascade = Klass.new_();
    _cascade.incrementPointer();
    _cascade.replaceCurrentWith(3);
    _cascade.current().print();
    return _cascade;
  })();

  [1, 2, 3, 4].injectinto(0, function (a, lastres) { return lastres + a; });

}).call(this);
