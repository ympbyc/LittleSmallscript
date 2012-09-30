(function () {
  'use strict';
  var LP, template, optimTmpl, optimize, canUseDotNotation, optimizationAvailable;
  LP = require('./littleparser').LittleParser;
  template = function (template, hashmap) {
    var dest_str;
    dest_str = template;
    hashmap.do_(function (it, key) {
      ((it === null) || (it === undefined)) ? (function () {
        return it = "";
      })() : void 0;
      return dest_str = dest_str.replace(new RegExp((("%" + key) + "%"), "g"), it);
    });
    return dest_str;
  };
  optimTmpl = {
    "at": "%receiver%[%arg1%]",
    "atput": "%receiver%[%arg1%] = %arg2%",
    "dot": "%receiver%.%arg1%",
    "dotput": "%receiver%.%arg1% = %arg2%",
    "do": "%receiver%.do_(%arg1%)",
    "value": "%receiver%(%arg1%)",
    "valuevalue": "%receiver%(%args%)",
    "valuevaluevalue": "%receiver%(%args%)",
    "valuevaluevaluevalue": "%receiver%(%args%)",
    "valuevaluevaluevaluevalue": "%receiver%(%args%)",
    "ifTrue": "%receiver% ? (%arg1%)() : void 0",
    "ifFalse": "%receiver% ? void 0 : (%arg1%)()",
    "ifTrueifFalse": "%receiver% ? (%arg1%)() : (%arg2%)()",
    "ifFalseifTrue": "%receiver% ? (%arg2%)() : (%arg1%)()",
    "and": "%receiver% && %arg1%()",
    "or": "%receiver% || %arg1%()",
    "eqv": "%receiver% === %arg1%()",
    "xor": "(%receiver% && !%arg1%()) || (!%receiver% && %arg1%())",
    "not": "! %receiver%",
    "new": "new %receiver%(%args%)"
  };
  canUseDotNotation = function (str) {
    var v, identifier;
    v = new LP(str);
    (function () {
      return identifier = v.betweenandaccept((function () {
        return v.chr("\"");
      }), (function () {
        return v.chr("\"");
      }), v.variable);
    }).tryCatch(function () {});
    return (v.getIndex() === v.getInputLength()) ? ((function () {
      return identifier;
    }))() : (function () {
      return null;
    })();
  };
  optimize = function (receiver, methodName, args) {
    ((methodName === "at") || (methodName === "dot")) ? (function () {
      var identifier;
      identifier = canUseDotNotation(args[0]);
      return (identifier !== null) ? (function () {
        args[(0)] = identifier;
        return methodName = "dot";
      })() : void 0;
    })() : void 0;
    ((methodName === "atput") || (methodName === "dotput")) ? (function () {
      var identifier;
      identifier = canUseDotNotation(args[0]);
      return (identifier !== null) ? (function () {
        args[(0)] = identifier;
        return methodName = "dotput";
      })() : void 0;
    })() : void 0;
    return template(optimTmpl[methodName], {
      "receiver": receiver,
      "args": args.join(", "),
      "arg1": args[0],
      "arg2": args[1],
      "arg3": args[2]
    });
  };
  optimizationAvailable = function (methodName) {
    return optimTmpl.hasOwnProperty(methodName);
  };
  exports.optimize = optimize;
  return exports.optimizationAvailable = optimizationAvailable;
}).call(this);