(function () {
  "use strict";
  var LP, template, optimTmpl, optimize, canUseDotNotation, optimizationAvailable;
  LP = require("./littleparser");
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
    "tryCatch": "(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } return _ret; })()",
    "tryCatchFinally": "(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } finally { _ret = %arg2%(); } return _ret; })()",
    "new": "new %receiver%(%args%)",
    "super": "%receiver%.__super.%arg1%.call(_this)",
    "superarguments": "%receiver%.__super.%arg1%.apply(_this, %arg2%)"
  };
  canUseDotNotation = function (str) {
    var v, identifier;
    v = new LP(str);
    (function () {
      var _ret;
      try {
        _ret = (function () {
          return identifier = v.betweenandaccept((function () {
            return v.chr("\"");
          }), (function () {
            return v.chr("\"");
          }), v.variable);
        })();
      } catch (err) {
        _ret = function () {
          return null;
        }(err);
      }
      return _ret;
    })();
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
    ((methodName === "super") || (methodName === "superarguments")) ? (function () {
      return args[(0)] = canUseDotNotation(args[0]);
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