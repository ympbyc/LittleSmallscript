(function () {
  'use strict';

  var optimTmpl,
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
  
  optimTmpl = {
    "at" : "%receiver%[%arg1%]",
    "atput" : "%receiver%[%arg1%] = %arg2%",
    "do" : "%receiver%.do_(%arg1%)",
    "value" : "%receiver%(%arg1%)",
    "valuevalue" : "%receiver%(%args%)",
    "valuevaluevalue" : "%receiver%(%args%)",
    "valuevaluevaluevalue" : "%receiver%(%args%)",
    "valuevaluevaluevaluevalue" : "%receiver%(%args%)",
    "ifTrue" : "%receiver% ? (%arg1%)() : void 0",
    "ifFalse" : "%receiver% ? void 0 : (%arg1%)()",
    "ifTrueifFalse" : "%receiver% ? (%arg1%)() : (%arg2%)()",
    "ifFalseifTrue" : "%receiver% ? (%arg2%)() : (%arg1%)()",
    "and" : "%receiver% && %arg1%()",
    "or"  : "%receiver% || %arg1%()",
    "eqv" : "%receiver% === %arg1%()",
    "xor" : "(%receiver% && !%arg1%()) || (!%receiver% && %arg1%())",
    "not" : "! %receiver%",
    "new" : "new %receiver%(%args%)",
    "subclass" : "(function (_super) { var _Constructor; _Constructor = function (/* &rest arguments */) { if (this.init) this.init.apply(this,arguments); }; _Constructor.prototype = new _super(); return _Constructor; })(%receiver%)",
    "methodat" : "%receiver%.prototype[%arg2%] = %arg1%",
  };

  var classes = {};

  var optimize = function (receiver, methodName, args) {
    return __template(optimTmpl[methodName], {
      "receiver" : receiver,
      "args" : args.join(', '),
      "arg1": args[0],
      "arg2": args[1],
      "arg3": args[3]
    });
  };
  
  var oa = function (kw) {
    if (optimTmpl.hasOwnProperty(kw)) return true;
    return false;
  };
  
  try {
    exports.optimizationAvailable = oa;
    exports.optimize = optimize;
  } catch (e) {
    window.optimization = {};
    window.optimization.optimize = optimize;
    window.optimization.optimizationAvailable = oa;
  }

}).call(this);
