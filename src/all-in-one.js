(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/src/js/production/statement.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var Class;
  Class = require('./class').Class;
  var Statement;
  Statement = function () {
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Statement.prototype = new Class();;
  Statement.prototype.statement = function () {
    var _this = this;
    return _this.cacheaParser("statement", function () {
      var ret, vd;
      ret = "";
      _this.skipSpace();
      vd = _this.optional(function () {
        return _this.variableDeclaration();
      });
      (vd !== null) ? (function () {
        return (ret += vd);
      })() : void 0;
      _this.skipSpace();
      (ret += _this.many(function () {
        var a;
        a = _this.statementable();
        _this.skipSpace();
        _this.chr(".");
        _this.skipSpace();
        _this.followedBy(function () {
          return _this.statementable();
        });
        return (a + "; ");
      }));
      ret = (((ret + "return ") + _this.expression()) + ";");
      _this.skipSpace();
      _this.optional(function () {
        return _this.chr(".");
      });
      return ret;
    });
  };
  Statement.prototype.statementable = function () {
    var _this = this;
    return _this.cacheaParser("statementable", function () {
      return _this.try_([function () {
        return _this.classHeader();
      }, function () {
        return _this.instanceMethod();
      }, function () {
        return _this.expression();
      }]);
    });
  };
  Statement.prototype.variableDeclaration = function () {
    var _this = this;
    return _this.cacheaParser("variableDeclaration", function () {
      var ret;
      ret = "var ";
      _this.skipSpace();
      _this.verticalBar();
      (ret += _this.many1(function () {
        _this.skipSpace();
        return (_this.variable() + ", ");
      }).replace(/,\s$/, "; "));
      _this.skipSpace();
      _this.verticalBar();
      return ret;
    });
  };
  exports.Statement = Statement;
  return Statement;
}).call(this);
});

require.define("/src/js/production/class.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var Block;
  Block = require('./block').Block;
  var Class;
  Class = function () {
    this.instanceVariables = null;
    this.currentClass = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Class.prototype = new Block();;
  Class.prototype.init = function () {
    var _this = this;
    _this.instanceVariables = {};
    return _this.currentClass = null;
  };
  Class.prototype.classHeader = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "var %className%;\n%className% = function () { %variableInitialization%if (this.init) { this.init.apply(this, arguments); } };\n%className%.prototype = new %superClass%();";
    return _this.cacheaParser("classHeader", function () {
      var className, superClass, variables, v_init;
      _this.optional(function () {
        return _this.chr("+");
      });
      superClass = _this.variable();
      _this.skipSpace();
      _this.string("subclass:");
      _this.skipSpace();
      className = _this.variablableStringContent();
      _this.skipSpace();
      _this.string("variables:");
      _this.skipSpace();
      variables = _this.instanceVariableArray();
      _this.instanceVariables[className] = [];
      v_init = variables.injectinto("", function (a, b) {
        _this.instanceVariables[className].push(a);
        return (((b + "this.") + a) + " = null; ");
      });
      return _this.templateapply(dst_tmpl, {
        "className": className,
        "superClass": superClass,
        "variableInitialization": v_init
      });
    });
  };
  Class.prototype.instanceVariableArray = function () {
    var _this = this;
    return _this.cacheaParser("instanceVariableArray", function () {
      var variables;
      variables = [];
      _this.arrayStart();
      _this.many(function () {
        var v;
        _this.skipSpace();
        v = _this.variablableStringContent();
        variables.push(v);
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        _this.skipSpace();
        return v;
      });
      _this.closeParen();
      return variables;
    });
  };
  Class.prototype.variablableStringContent = function () {
    var _this = this;
    return _this.cacheaParser("variablableStringContent", function () {
      return _this.try_([function () {
        _this.chr("#");
        return _this.variable();
      }, function () {
        return _this.betweenandaccept((function () {
          return _this.apostrophe();
        }), (function () {
          return _this.apostrophe();
        }), function () {
          return _this.variable();
        });
      }]);
    });
  };
  Class.prototype.instanceMethod = function () {
    var _this = this;
    var method_tmpl;
    method_tmpl = "%className%.prototype.%methodName% = function (%args%) { var _this = this; %methodBody% }";
    return _this.cacheaParser("instanceMethod", function () {
      var className, methodHead, methodBody;
      _this.exclamation();
      _this.skipSpace();
      className = _this.variable();
      _this.skipSpace();
      methodHead = _this.methodHead();
      _this.skipSpace();
      _this.setCurrentClass(className);
      methodBody = _this.statement();
      _this.setCurrentClass(null);
      _this.skipSpace();
      _this.exclamation();
      return _this.templateapply(method_tmpl, {
        "className": className,
        "methodName": methodHead.name,
        "args": methodHead.args,
        "methodBody": methodBody
      });
    });
  };
  Class.prototype.methodHead = function () {
    var _this = this;
    return _this.cacheaParser("methodHead", function () {
      var methodName, args;
      methodName = "";
      args = [];
      _this.try_([function () {
        return _this.many1(function () {
          (methodName += _this.keywordSelector().slice((0), - 1));
          _this.skipSpace();
          args.push(_this.variable());
          return _this.skipSpace();
        });
      }, function () {
        return methodName = _this.unarySelector();
      }]);
      return {
        "name": methodName,
        "args": args.join(", ")
      };
    });
  };
  Class.prototype.setCurrentClass = function (className) {
    var _this = this;
    _this.currentClass = className;
    return className;
  };
  Class.prototype.instanceVariableP = function (variableName) {
    var _this = this;
    var v;
    return (((_this.currentClass !== null) && (_this.instanceVariables[_this.currentClass] !== undefined)) && (_this.instanceVariables[_this.currentClass].indexOf(variableName) > -1));
  };
  exports.Class = Class;
  return Class;
}).call(this);
});

require.define("/src/js/production/block.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var Expression;
  Expression = require('./expression').Expression;
  var Block;
  Block = function () {
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Block.prototype = new Expression();;
  Block.prototype.block = function () {
    var _this = this;
    var dst_tmpl;
    dst_tmpl = "function (%parameters%) { %body% }";
    return _this.cacheaParser("block", function () {
      var parameters, body;
      _this.blockStart();
      parameters = _this.blockHead();
      body = _this.optional(function () {
        return _this.statement();
      });
      _this.blockEnd();
      return _this.templateapply(dst_tmpl, {
        "parameters": parameters,
        "body": body
      });
    });
  };
  Block.prototype.blockParameters = function () {
    var _this = this;
    return _this.cacheaParser("blockParameters", function () {
      var vars;
      vars = "";
      _this.skipSpace();
      _this.many(function () {
        _this.colon();
        (vars += (_this.variable() + ", "));
        return _this.skipSpace();
      });
      return vars.slice((0), - 2);
    });
  };
  Block.prototype.blockHead = function () {
    var _this = this;
    return _this.cacheaParser("blockHead", function () {
      return _this.optional(function () {
        var params;
        _this.skipSpace();
        params = _this.blockParameters();
        (params.size() > (0)) ? (function () {
          return _this.verticalBar();
        })() : void 0;
        _this.skipSpace();
        return params;
      });
    });
  };
  exports.Block = Block;
  return Block;
}).call(this);
});

require.define("/src/js/production/expression.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var LittleParser, optimization;
  LittleParser = require('./littleparser').LittleParser;
  optimization = require('./optimization');
  var Expression;
  Expression = function () {
    this.bundledMethods = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Expression.prototype = new LittleParser();;
  Expression.prototype.init = function () {
    var _this = this;
    return _this.bundledMethods = [];
  };
  Expression.prototype.bundleAMethodIfAvailable = function (methodName) {
    var _this = this;
    return ((_this.bundledMethods.indexOf(methodName) > -1) && bundlableMethods.bundlable(methodName)) ? (function () {
      return _this.bundledMethods.push(bundlableMethods.bundle(methodName));
    })() : void 0;
  };
  Expression.prototype.expression = function () {
    var _this = this;
    var tmpl;
    tmpl = "%assignments%%cascade%";
    return _this.cacheaParser("expression", function () {
      var assignments, cascade;
      assignments = _this.optional(function () {
        return _this.assignments();
      });
      cascade = _this.cascade();
      return (function () {
        var _ret;
        try {
          _ret = (function () {
            return _this.templateapply(tmpl, {
              "assignments": assignments,
              "cascade": cascade
            });
          })();
        } catch (err) {
          _ret = function (e) {
            return console.log(e);
          }(err);
        }
        return _ret;
      })();
    });
  };
  Expression.prototype.assignments = function () {
    var _this = this;
    return _this.cacheaParser("assignments", function () {
      return _this.many(function () {
        var variable;
        variable = _this.extendedVariable();
        _this.skipSpace();
        _this.assignmentArrow();
        _this.skipSpace();
        return (variable + " = ");
      });
    });
  };
  Expression.prototype.cascade = function () {
    var _this = this;
    var tmpl;
    tmpl = "(function () { var _receiver = %simpleExpression%; %body% return _receiver;  })()";
    return _this.cacheaParser("cascade", function () {
      var se;
      se = _this.simpleExpression();
      return _this.try_([function () {
        _this.skipSpace();
        _this.notFollowedBy(function () {
          return _this.semicolon();
        });
        return se;
      }, function () {
        var conti;
        conti = _this.many(function () {
          var mes;
          _this.skipSpace();
          _this.semicolon();
          _this.skipSpace();
          mes = _this.continuation();
          return optimization.optimizationAvailable(mes.methodName) ? ((function () {
            return (optimization.optimize("_receiver", mes.methodName, mes.args) + ";");
          }))() : (function () {
            return (("_receiver" + mes.js) + ";");
          })();
        });
        return _this.templateapply(tmpl, {
          "simpleExpression": se,
          "body": conti
        });
      }]);
    });
  };
  Expression.prototype.simpleExpression = function (allowedParsers) {
    var _this = this;
    return _this.cacheaParser("simpleExpression", function () {
      var receiver, injection;
      receiver = injection = _this.primaryReceiver();
      _this.many(function () {
        var mes, ret;
        mes = _this.continuation(allowedParsers);
        return optimization.optimizationAvailable(mes.methodName) ? ((function () {
          return injection = optimization.optimize(injection, mes.methodName, mes.args);
        }))() : (function () {
          return mes.wrapMe ? ((function () {
            return injection = ((("(" + injection) + mes.js) + ")");
          }))() : (function () {
            return (injection += mes.js);
          })();
        })();
      });
      return injection;
    });
  };
  Expression.prototype.continuation = function (allowedParsers) {
    var _this = this;
    return _this.cacheaParser("continuation", function () {
      (allowedParsers === undefined) ? (function () {
        return allowedParsers = [function () {
          return _this.keywordMessage();
        }, function () {
          return _this.binaryMessage();
        }, function () {
          return _this.unaryMessage();
        }];
      })() : void 0;
      return _this.try_(allowedParsers);
    });
  };
  Expression.prototype.keywordMessage = function () {
    var _this = this;
    return _this.cacheaParser("keywordMessage", function () {
      var methodName, args;
      methodName = "";
      args = [];
      _this.many1(function () {
        _this.skipSpace();
        (methodName += _this.keywordSelector().replace(":", ""));
        _this.skipSpace();
        args.push(_this.simpleExpression([function () {
          return _this.binaryMessage();
        }, function () {
          return _this.unaryMessage();
        }]));
        return _this.skipSpace();
      });
      return {
        "js": (((("." + methodName) + "(") + args.join(", ")) + ")"),
        "wrapMe": false,
        "methodName": methodName,
        "args": args
      };
    });
  };
  Expression.prototype.binaryMessage = function () {
    var _this = this;
    return _this.cacheaParser("binaryMessage", function () {
      var operator, argument;
      _this.skipSpace();
      operator = _this.operator();
      _this.skipSpace();
      argument = _this.simpleExpression([function () {
        return _this.unaryMessage();
      }]);
      return {
        "js": (((" " + operator) + " ") + argument),
        "wrapMe": true,
        "methodName": operator,
        "args": [argument]
      };
    });
  };
  Expression.prototype.unaryMessage = function () {
    var _this = this;
    return _this.cacheaParser("unaryMessage", function () {
      var unarySelector;
      _this.skipSpace();
      unarySelector = _this.unarySelector();
      return {
        "js": (("." + unarySelector) + "()"),
        "wrapMe": false,
        "methodName": unarySelector,
        "args": []
      };
    });
  };
  Expression.prototype.primary = function () {
    var _this = this;
    return _this.cacheaParser("primary", function () {
      return _this.try_([function () {
        return _this.extendedVariable();
      }, function () {
        return _this.literal();
      }, function () {
        return _this.block();
      }, function () {
        return _this.primitive();
      }, function () {
        return _this.betweenandaccept((function () {
          _this.chr("(");
          return _this.skipSpace();
        }), (function () {
          _this.skipSpace();
          return _this.chr(")");
        }), function () {
          return _this.cascade();
        });
      }]);
    });
  };
  Expression.prototype.primaryReceiver = function () {
    var _this = this;
    return _this.cacheaParser("primaryReceiver", function () {
      return _this.try_([function () {
        var num;
        num = _this.numberLiteral();
        _this.followedBy(function () {
          return _this.try_([function () {
            return _this.keywordMessage();
          }, function () {
            return _this.unaryMessage();
          }]);
        });
        return (("(" + num) + ")");
      }, function () {
        _this.followedBy(function () {
          _this.block();
          _this.skipSpace();
          return _this.try_([function () {
            return _this.keywordMessage();
          }, function () {
            return _this.unaryMessage();
          }]);
        });
        return (("(" + _this.block()) + ")");
      }, function () {
        return _this.primary();
      }]);
    });
  };
  Expression.prototype.primitive = function () {
    var _this = this;
    return _this.cacheaParser("primitive", function () {
      _this.skipSpace();
      return _this.betweenandaccept((function () {
        _this.chr("<");
        _this.notFollowedBy(function () {
          return _this.chr("-");
        });
        return "<";
      }), (function () {
        return _this.chr(">");
      }), function () {
        return _this.anyChar();
      });
    });
  };
  Expression.prototype.operator = function () {
    var _this = this;
    var p;
    p = function (str) {
      return function () {
        return _this.string(str);
      };
    };
    return _this.cacheaParser("operator", function () {
      var op;
      _this.skipSpace();
      return op = _this.try_([p("+="), p("-="), p("*="), p("/="), p("+"), p("-"), p("*"), p("/"), p("%"), p("==="), p("!=="), p("<="), p(">="), p("<"), p(">"), p("^"), p("&&"), p("||")]);
    });
  };
  exports.Expression = Expression;
  return Expression;
}).call(this);
});

require.define("/src/js/production/littleparser.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var Packrat;
  Packrat = require('./packrat').Packrat;
  var LittleParser;
  LittleParser = function () {
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  LittleParser.prototype = new Packrat();;
  LittleParser.prototype.space = function () {
    var _this = this;
    return _this.cacheaParser("space", function () {
      return _this.regex(new RegExp("^[\\s\\n\\t]+"));
    });
  };
  LittleParser.prototype.blockStart = function () {
    var _this = this;
    return _this.cacheaParser("blockStart", function () {
      return _this.chr("[");
    });
  };
  LittleParser.prototype.blockEnd = function () {
    var _this = this;
    return _this.cacheaParser("blockEnd", function () {
      return _this.chr("]");
    });
  };
  LittleParser.prototype.verticalBar = function () {
    var _this = this;
    return _this.cacheaParser("verticalBar", function () {
      return _this.chr("|");
    });
  };
  LittleParser.prototype.colon = function () {
    var _this = this;
    return _this.cacheaParser("colon", function () {
      return _this.chr(":");
    });
  };
  LittleParser.prototype.semicolon = function () {
    var _this = this;
    return _this.cacheaParser("semicolon", function () {
      return _this.chr(";");
    });
  };
  LittleParser.prototype.assignmentArrow = function () {
    var _this = this;
    return _this.cacheaParser("assignmentArrow", function () {
      return _this.try_([function () {
        return _this.string(":=");
      }, function () {
        return _this.string("<-");
      }]);
    });
  };
  LittleParser.prototype.apostrophe = function () {
    var _this = this;
    return _this.cacheaParser("apostrophe", function () {
      return _this.chr("'");
    });
  };
  LittleParser.prototype.arrayStart = function () {
    var _this = this;
    return _this.cacheaParser("arrayStart", function () {
      _this.string("#(");
      return _this.skipSpace();
    });
  };
  LittleParser.prototype.closeParen = function () {
    var _this = this;
    return _this.cacheaParser("closeParen", function () {
      return _this.chr(")");
    });
  };
  LittleParser.prototype.hashStart = function () {
    var _this = this;
    return _this.cacheaParser("hashStart", function () {
      return _this.string("#{");
    });
  };
  LittleParser.prototype.hashEnd = function () {
    var _this = this;
    return _this.cacheaParser("hashEnd", function () {
      return _this.chr("}");
    });
  };
  LittleParser.prototype.exclamation = function () {
    var _this = this;
    return _this.cacheaParser("exclamation", function () {
      return _this.chr("!");
    });
  };
  LittleParser.prototype.variable = function () {
    var _this = this;
    return _this.cacheaParser("variable", function () {
      return _this.regex(new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*"));
    });
  };
  LittleParser.prototype.extendedVariable = function () {
    var _this = this;
    return _this.cacheaParser("extendedVariable", function () {
      var v;
      v = _this.regex(new RegExp("^[a-zA-Z_$][a-zA-Z0-9_$]*"));
      return (v === "self") ? ((function () {
        return "_this";
      }))() : (function () {
        _this.instanceVariableP(v) ? (function () {
          return v = ("_this." + v);
        })() : void 0;
        return v;
      })();
    });
  };
  LittleParser.prototype.keywordSelector = function () {
    var _this = this;
    return _this.cacheaParser("keywordSelector", function () {
      return _this.sequence([function () {
        return _this.variable();
      }, function () {
        return _this.colon();
      }]);
    });
  };
  LittleParser.prototype.unarySelector = function () {
    var _this = this;
    return _this.cacheaParser("unarySelector", function () {
      var sel;
      sel = _this.variable();
      _this.notFollowedBy(function () {
        return _this.colon();
      });
      return sel;
    });
  };
  LittleParser.prototype.explicitReturn = function () {
    var _this = this;
    return _this.cacheaParser("explicitReturn", function () {
      return _this.chr("^");
    });
  };
  LittleParser.prototype.commentQuote = function () {
    var _this = this;
    return _this.cacheaParser("commentQuote", function () {
      return _this.chr("\"");
    });
  };
  LittleParser.prototype.skipSpace = function () {
    var _this = this;
    return _this.cacheaParser("skipSpace", function () {
      _this.optional(function () {
        return _this.space();
      });
      return _this.many(function () {
        _this.betweenandaccept((function () {
          return _this.commentQuote();
        }), (function () {
          return _this.commentQuote();
        }), function () {
          return _this.anyChar();
        });
        return _this.optional(function () {
          return _this.space();
        });
      });
    });
  };
  LittleParser.prototype.literal = function () {
    var _this = this;
    return _this.cacheaParser("literal", function () {
      return _this.try_([function () {
        return _this.numberLiteral();
      }, function () {
        return _this.stringLiteral();
      }, function () {
        return _this.symbolLiteral();
      }, function () {
        return _this.arrayLiteral();
      }, function () {
        return _this.hashLiteral();
      }, function () {
        return _this.block();
      }]);
    });
  };
  LittleParser.prototype.numberLiteral = function () {
    var _this = this;
    return _this.cacheaParser("numberLiteral", function () {
      return _this.regex(new RegExp("^-?[0-9]+(\\.?[0-9]+)?"));
    });
  };
  LittleParser.prototype.stringLiteral = function () {
    var _this = this;
    return _this.cacheaParser("stringLiteral", function () {
      return (("\"" + _this.betweenandaccept((function () {
        return _this.apostrophe();
      }), (function () {
        return _this.apostrophe();
      }), function () {
        return _this.anyChar();
      }).replace(/\n/g, "\\n")) + "\"");
    });
  };
  LittleParser.prototype.symbolLiteral = function () {
    var _this = this;
    return _this.cacheaParser("symbolLiteral", function () {
      _this.chr("#");
      return (("\"" + _this.variable()) + "\"");
    });
  };
  LittleParser.prototype.arrayLiteral = function () {
    var _this = this;
    var args;
    return _this.cacheaParser("arrayLiteral", function () {
      args = [];
      _this.arrayStart();
      _this.many(function () {
        args.push(_this.expression());
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        return _this.skipSpace();
      });
      _this.closeParen();
      return (("[" + args.join(", ")) + "]");
    });
  };
  LittleParser.prototype.hashLiteral = function () {
    var _this = this;
    return _this.cacheaParser("hashLiteral", function () {
      var ret;
      ret = "";
      _this.hashStart();
      (ret += "{");
      (ret += _this.many(function () {
        var key, val;
        _this.skipSpace();
        key = _this.try_([function () {
          return _this.stringLiteral();
        }, function () {
          return _this.numberLiteral();
        }, function () {
          return _this.symbolLiteral();
        }]);
        _this.skipSpace();
        _this.colon();
        _this.skipSpace();
        val = _this.expression();
        _this.skipSpace();
        _this.optional(function () {
          return _this.chr(",");
        });
        return (((key + ": ") + val) + ",");
      }).slice((0), - 1));
      _this.skipSpace();
      _this.hashEnd();
      (ret += "}");
      return ret;
    });
  };
  LittleParser.prototype.templateapply = function (template, hashmap) {
    var _this = this;
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
  exports.LittleParser = LittleParser;
  return LittleParser;
}).call(this);
});

require.define("/src/js/production/packrat.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  require('../../prelude');
  Number.prototype.timesString = function (str) {
    var _this = this;
    var ret;
    ret = "";
    _this.timesRepeat(function (i) {
      return (ret += str);
    });
    return ret;
  };
  var Packrat;
  Packrat = function () {
    this.input = null;
    this.index = null;
    this.cache = null;
    this.maxIndex = null;
    this.logNest = null;
    this.stackTrace = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  Packrat.prototype = new Object();;
  Packrat.prototype.init = function (text) {
    var _this = this;
    _this.input = text;
    _this.index = 0;
    _this.cache = {};
    _this.maxIndex = 0;
    _this.logNest = -1;
    return _this.stackTrace = "";
  };
  Packrat.prototype.getIndex = function () {
    var _this = this;
    return _this.index;
  };
  Packrat.prototype.getMaxIndex = function () {
    var _this = this;
    return _this.maxIndex;
  };
  Packrat.prototype.getInputLength = function () {
    var _this = this;
    return _this.input.size();
  };
  Packrat.prototype.getStackTrace = function () {
    var _this = this;
    return _this.stackTrace;
  };
  Packrat.prototype.cacheaParser = function (s, fn) {
    var _this = this;
    var c, slot, logIndent;
    fn = (fn !== undefined) ? ((function () {
      return fn;
    }))() : (function () {
      return function () {};
    })();
    c = {};
    (_this.logNest += 1);
    logIndent = _this.logNest.timesString("  ");
    (_this.stackTrace += (((((logIndent + "ENTER : ") + s) + " : ") + _this.input.substring(_this.index)) + "\n"));
    (function () {
      var _ret;
      try {
        _ret = (function () {
          return (_this.cache[s] === undefined) ? (_this.cache[s] = {})() : void 0;
        })();
      } catch (err) {
        _ret = function () {
          return _this.cache[s] = {};
        }(err);
      }
      return _ret;
    })();
    slot = _this.cache[s][_this.index];
    return ((slot !== undefined) && (slot !== null)) ? ((function () {
      c = slot;
      _this.index = c.idx;
      (_this.index > _this.maxIndex) ? (function () {
        return _this.maxIndex = _this.index;
      })() : void 0;
      (_this.stackTrace += (((((logIndent + "CACHED: ") + s) + " : ") + c.fn) + "\n"));
      (_this.logNest -= 1);
      return c.fn;
    }))() : (function () {
      return (function () {
        var _ret;
        try {
          _ret = (function () {
            c.idx = _this.index;
            c.fn = fn.call(_this);
            _this.cache[s][c.idx] = {
              "fn": c.fn,
              "idx": _this.index
            };
            (_this.index > _this.maxIndex) ? (function () {
              return _this.maxIndex = _this.index;
            })() : void 0;
            (_this.stackTrace += (((((logIndent + "PASS  : ") + s) + " : ") + c.fn) + "\n"));
            (_this.logNest -= 1);
            return c.fn;
          })();
        } catch (err) {
          _ret = function (err) {
            _this.cache[s][c.idx] = null;
            (_this.stackTrace += (((logIndent + "FAIL  : ") + s) + "\n"));
            (_this.logNest -= 1);
            return _this.noParse();
          }(err);
        }
        return _ret;
      })();
    })();
  };
  Packrat.prototype.noParse = function () {
    var _this = this;
    return _this.error(("Parse error at:" + _this.index));
  };
  Packrat.prototype.try_ = function (parsers) {
    var _this = this;
    var ret, i;
    i = _this.index;
    parsers.do_(function (parser) {
      return (ret === undefined) ? (function () {
        return (function () {
          var _ret;
          try {
            _ret = (function () {
              return ret = parser.call(_this);
            })();
          } catch (err) {
            _ret = function () {
              return _this.index = i;
            }(err);
          }
          return _ret;
        })();
      })() : void 0;
    });
    return (ret !== undefined) ? ((function () {
      return ret;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.sequence = function (parsers) {
    var _this = this;
    var ret, i, fail;
    i = _this.index;
    ret = "";
    fail = false;
    parsers.do_(function (parser) {
      return fail ? void 0 : (function () {
        return (function () {
          var _ret;
          try {
            _ret = (function () {
              return (ret += parser.call(_this));
            })();
          } catch (err) {
            _ret = function (err) {
              _this.index = i;
              fail = true;
              return _this.noParse();
            }(err);
          }
          return _ret;
        })();
      })();
    });
    return fail ? (function () {
      return _this.noParse();
    })() : ((function () {
      return ret;
    }))();
  };
  Packrat.prototype.optional = function (parser) {
    var _this = this;
    var ret, i;
    i = _this.index;
    return (function () {
      var _ret;
      try {
        _ret = (function () {
          return parser.call(_this);
        })();
      } catch (err) {
        _ret = function () {
          _this.index = i;
          return null;
        }(err);
      }
      return _ret;
    })();
  };
  Packrat.prototype.followedBy = function (parser) {
    var _this = this;
    var f, i;
    f = true;
    i = _this.index;
    (function () {
      var _ret;
      try {
        _ret = (function () {
          parser.call(_this);
          return f = false;
        })();
      } catch (err) {
        _ret = function () {}(err);
      }
      return _ret;
    })();
    _this.index = i;
    return f ? ((function () {
      return _this.noParse();
    }))() : (function () {
      return null;
    })();
  };
  Packrat.prototype.notFollowedBy = function (parser) {
    var _this = this;
    var f, i;
    f = false;
    i = _this.index;
    (function () {
      var _ret;
      try {
        _ret = (function () {
          parser.call(_this);
          return f = true;
        })();
      } catch (err) {
        _ret = function () {}(err);
      }
      return _ret;
    })();
    _this.index = i;
    return f ? ((function () {
      return _this.noParse();
    }))() : (function () {
      return null;
    })();
  };
  Packrat.prototype.many = function (parser) {
    var _this = this;
    var a;
    return _this.try_([function () {
      return _this.many1(function () {
        return parser.call(_this);
      });
    }, function () {
      return "";
    }]);
  };
  Packrat.prototype.many1 = function (parser) {
    var _this = this;
    var v, vs;
    v = parser.call(_this);
    vs = _this.many(function () {
      return parser.call(_this);
    });
    return (v + vs);
  };
  Packrat.prototype.betweenandaccept = function (start, end, inbetween) {
    var _this = this;
    var ret;
    _this.sequence([start, function () {
      return ret = _this.many(function () {
        _this.notFollowedBy(end);
        return inbetween.call(_this);
      });
    },
    end]);
    return ret;
  };
  Packrat.prototype.anyChar = function () {
    var _this = this;
    var c;
    c = _this.input[_this.index];
    (_this.index += 1);
    return (c !== undefined) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.satisfyChar = function (fn) {
    var _this = this;
    var c;
    c = _this.anyChar();
    return (fn(c) !== undefined) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.chr = function (ch) {
    var _this = this;
    var c;
    c = _this.anyChar();
    return (c === ch) ? ((function () {
      return c;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.string = function (str) {
    var _this = this;
    return (_this.input.substring(_this.index, (_this.index + str.size())) === str) ? ((function () {
      (_this.index += str.size());
      return str;
    }))() : (function () {
      return _this.noParse();
    })();
  };
  Packrat.prototype.regex = function (regex) {
    var _this = this;
    var rc, match;
    rc = regex.exec(_this.input.substring(_this.index));
    return rc.isKindOf(Array) ? ((function () {
      match = rc[0];
      (_this.index += match.size());
      return match;
    }))() : (function () {
      console.log("regexFalse");
      return _this.noParse("regex");
    })();
  };
  Packrat.prototype.toParser = function (str) {
    var _this = this;
    return function () {
      return _this.string(str);
    };
  };
  Packrat.prototype.p = function (s) {
    var _this = this;
    console.log(s);
    return s;
  };
  exports.Packrat = Packrat;
  return Packrat;
}).call(this);
});

require.define("/src/prelude.js",function(require,module,exports,__dirname,__filename,process,global){/*
 * Copyright (c) 2012 Minori Yamashita <ympbyc@gmail.com>
 * See LICENCE.txt
 */
/* 
 * Little Smallmethods
 * Define Little Smalltalk's built-in methods for JS primitive objects.
 * This library adds methods to basic objects' prototype if you like it or not.
 */
(function () {
  'use strict';
  var __hasProp = {}.hasOwnProperty;
  
  Object.prototype.asString = Object.prototype.toString;
  Object.prototype.class_ = function () { return this.constructor; };
  Object.prototype.copy = Object.prototype.shallowCopy = function () { return this; };
  Object.prototype.deepCopy = function () {
    var a = new (this.constructor || Object);
    for (var key in this) {
      if (__hasProp.call(this, key)) a[key] = this[key];
    }
    return a;
  };
  Object.prototype.do_ = Object.prototype.binaryDo = function (fn) {
    for (var key in this) {
      if (__hasProp.call(this, key) && String(key).search(/__/) !== 0) fn(this[key], key);
    }
    return null;
  };
  Object.prototype.error = function (str) { throw str; };
  Object.prototype.isKindOf = function (Klass) { return this instanceof Klass; };
  Object.prototype.isMemberOf = function (Klass) { return this.class_() === Klass;  };
  Object.prototype.print = Object.printString = function () { return JSON ? JSON.stringify(this) : this.toString();  };
  Object.prototype.respondsTo = function (name) { return this[name] !== undefined && this[name] !== null; };
    
  Number.prototype.to = function (tonum) { 
    var i = this-1, 
    res = []; 
    while (++i < tonum) 
      res.push(i); 
    return res;
  };
  // to:by:
  Number.prototype.toby = function (tonum, bynum) {
    var i = this-1,
        res = [];
    while (i += bynum <= tonum)
      res.push(i);
    return res;
  };
  Number.prototype.timesRepeat = function (fn) {
    var _this = this;
    return (0).to(this).do_(function (it) { return fn.call(_this, it); }); 
  };
  
  Object.prototype.asArray = function () {
    return this.collect(function (it) {return it});
  };
  Object.prototype.asString = function () {
    return this.asArray().injectinto('', function (it, lastres) {
      return lastres + String(it);
    });
  };
  Object.prototype.collect = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = fn.call(_this, it);
    });
    return ret;
  };
  Object.prototype.detect = function (fn) {
    this.do_(function (it, key) {
      if (fn.call(this, it)) return it;
    });
    throw "Object.detect could not find an item that satisfies "+fn.toString()+".";
  };
  // detect:ifAbsent:
  Object.prototype.detectifAbsent = function (fn1, fn2) {
    try {
      return this.detect(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Object.prototype.includes = function (it) {
    try{
      this.detect(function (it2) { return it === it2; });
      return true;
    } catch (err) {
      return false;
    }
  };
  // inject:into:
  Object.prototype.injectinto = function (initialValue,fn) {
    var lastres = initialValue,
        _this = this;
    this.do_(function (it, key) {
      lastres = fn.call(_this, it, lastres);
    });
    return lastres;
  };
  Object.prototype.isEmpty = function () { 
    return this.size() === 0;
  };
  Object.prototype.occuranceOf = function (item) {
    return this.injectinto(0, function (it, lst) { return (item === it) ? ++lst : lst; });
  };
  Object.prototype.remove = function (item) {
    var found = false,
        _this = this;
    this.do_(function (it, key) {
      if (it === item) { found = true; delete _this[key]; }
    });
    return null;
  };
  // remove:ifAbsent:
  Object.prototype.removeifAbsent = function (item, fn) {
    try {
      return this.remove(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.select = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.reject = function (fn) {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      if ( ! fn.call(_this, it)) ret[key] = it;
    });
    return ret;
  };
  Object.prototype.size = function () { 
    return this.injectinto(0,function (a,b) {return b+1});
  };
  Object.prototype.asDictionary = function () {
    var ret = {},
        _this = this;
    this.do_(function (it, key) {
      ret[key] = it;
    });
    return ret;
  };
  Object.prototype.at = function (key) {
    if ((! this[key]) || this[key].isNil()) throw "Object.at: slot "+key+" is nil";
    return this[key]; 
  };
  // at:ifAbsent:
  Object.prototype.atifAbsent = function (key, fn) {
    try {
      return this.at(key);
    } catch (err) {
      return fn.call(this);
    }
  };
  // at:put:
  Object.prototype.atput = function (key, item) {
    this[key] = item;
    return this;
  };
  Object.prototype.includesKey = function (key) {
    return this[key] !== undefined;
  };
  Object.prototype.indexOf = function (item) {
    for (var key in this) {
      if (this[key] === item) return key;
    }
    throw "Object.indexOf: not found";
  };
  // indexOf:ifAbsent:
  Object.prototype.indexOfifAbsent = function (item, fn) {
    try {
      return this.indexOf(item);
    } catch (err) {
      return fn.call(this);
    }
  };
  Object.prototype.keys = function () {
    if (Object.keys) return Object.keys(this);
    this.collect(function (it, key) {return key});
  };
  Object.prototype.keysDo = function (fn) {
    return this.keys().do_(fn);
  };
  Object.prototype.keySelect = function (fn) {
    return this.keys().select(fn);
  };
  
  Array.prototype.addLast = function (item) { this.push(item); return this; };  
  Array.prototype.do_ = Array.prototype.binaryDo = Array.prototype.forEach || Object.prototype.do_;
  Array.prototype.collect = Array.prototype.map || function (fn) {
    var ret = [], 
        _this = this;
    this.do_(function (it, key) {
      ret.push(fn.call(_this, it, key));
    });
    return ret;
  };
  Array.prototype.select = Array.prototype.filter || function (fn) {
    var ret = [],
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret.push(it);
    });
    return ret;
  };
  Array.prototype.reject = function (fn) {
    var ret = [],
        _this = this;
    this.do_(function (it, key) {
      if ( ! fn.call(_this, it)) ret.push(it);
    });
    return ret;
  };
  // copyFrom:to:
  Array.prototype.copyFromto = function (from, to) {
    return this.slice(from, to);
  };
  Array.prototype.copyWith = function (fn) {
    return this.concat([]).concat(fn.call(this));
  };
  Array.prototype.copyWithout = function (val) {
    return this.reject(function (it) { return it===val;  });
  };
  // equals:startingAt:
  Array.prototype.equalsstartingAt = function (arr, idx) {
    if (this.length !== arr.slice(idx).length) return false;
    var tgt = arr.slice(idx), 
        _this = this;
    this.do_(function (it, key) {
      if (it !== tgt[key]) return false;
    });
    return true;
  };
  Array.prototype.findFirst = function (fn) {
    var _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) return key;
    });
    throw "Array.findFirst: not found";
  };
  // findFirst:ifAbsent:
  Array.prototype.findFirstifAbsent = function (fn1, fn2) {
    try {
      return this.findFirst(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Array.prototype.findLast = function (fn) {
    var ret, 
        _this = this;
    this.do_(function (it, key) {
      if (fn.call(_this, it)) ret = key;
    });
    if (ret) return ret;
    throw "Array.findLast: not found";
  };
  // findLast:ifAbsent:
  Array.prototype.findLastifAbsent = function (fn1, fn2) {
    try {
      return this.findLast(fn1);
    } catch (err) {
      return fn2.call(this);
    }
  };
  Array.prototype.firstKey = function () { return 0;  };
  Array.prototype.last = function () { return this[this.length-1];  };
  Array.prototype.lastKey = function () { return this.length - 1;  };
  // replaceFrom:to:with:
  Array.prototype.replaceFromtowith = function (from, to, replacement) {
    for (var i = from, j = 0; i < to; ++i) {
      this[i] = replacement[j];
      ++j;
    }
    return this;
  };
  Array.prototype.startingAt = function (idx) { return this.slice(idx);  };
  Array.prototype.reversed = function () {
    return this.reverse();
  };
  Array.prototype.reverseDo = function (fn) {
    return this.reverse().do_(fn);
  };
  Array.prototype.sort = Array.prototype.sort;
  // with:do:
  Array.prototype.withdo = function (col, fn) {
    if (this.length !== col.length) throw "Array.withDo: first argument has to be an array that have the same length as the receiver";
  };
  Array.prototype.size = function () { return this.length };

  String.prototype.at = function (idx) { return this[idx]; };

  // copyFrom:length:
  String.prototype.copyFromlength = function (from, length) { return this.substring(from, from + length);  };
  // copyFrom:to:
  String.prototype.copyFromto = String.prototype.substring;
  String.prototype.print = function () { try { return console.log(this); } catch (err) { throw "String.print: no console found"; } };
  String.prototype.size = function () { return this.length; };
  String.prototype.sameAs = function (str) { return this.toLowerCase() === str.toLowerCase(); };
  
  Function.prototype.value = function () { return this(); };
  // value:value:...
  Function.prototype.valuevalue 
      = Function.prototype.valuevaluevalue 
      = Function.prototype.valuevaluevaluevalue 
      = Function.prototype.valuevaluevaluevaluevalue 
      = function (/* &rest arguments */) { 
        return this.apply(this, arguments);
      };
  Function.prototype.whileTrue = function (fn) {
    while (this()) if (fn) fn.call(this);
    return null;
  };
  Function.prototype.whileFalse = function (fn) {
    while ( ! this()) if (fn) fn.call(this);
    return null;
  };
  Function.prototype.tryCatch = function (fn) {
    try {
      return this();
    } catch (err) {
      return fn.call(this, err);
    }
  };
  Function.prototype.tryCatchfinally = function (fn1, fn2) {
    try {
      this();
    } catch (err) {
      fn1.call(this, err);
    } finally {
      return fn2.call(this);
    }
  };
  
}).call(this);

});

require.define("/src/js/production/optimization.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
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
    "tryCatch": "(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } return _ret; })()",
    "tryCatchFinally": "(function () { var _ret; try { _ret = %receiver%(); } catch (err) { _ret = %arg1%(err); } finally { _ret = %arg2%(); } return _ret; })()",
    "new": "new %receiver%(%args%)"
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
        _ret = function () {}(err);
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
});

require.define("/lib/beautify.js",function(require,module,exports,__dirname,__filename,process,global){/*jslint onevar: false, plusplus: false */
/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          - indentation size,
    indent_char (default space)      - character to indent with,
    preserve_newlines (default true) - whether existing line breaks should be preserved,
    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

    jslint_happy (default false) - if true, then jslint-stricter mode is enforced.

            jslint_happy   !jslint_happy
            ---------------------------------
             function ()      function()

    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "expand-strict"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.

            expand-strict: put brace on own line even in such cases:

                var a =
                {
                    a: 5,
                    b: 6
                }
            This mode may break your scripts - e.g "return { a: 1 }" will be broken into two lines, so beware.

    space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",

    unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"

    e.g

    js_beautify(js_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });


*/



function js_beautify(js_source_text, options) {

    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
    var prefix, token_type, do_block_just_closed;
    var wanted_newline, just_added_newline, n_newlines;
    var preindent_string = '';


    // Some interpreters have unexpected results with foo = baz || bar;
    options = options ? options : {};

    var opt_brace_style;

    // compatibility
    if (options.space_after_anon_function !== undefined && options.jslint_happy === undefined) {
        options.jslint_happy = options.space_after_anon_function;
    }
    if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
        opt_brace_style = options.braces_on_own_line ? "expand" : "collapse";
    }
    opt_brace_style = options.brace_style ? options.brace_style : (opt_brace_style ? opt_brace_style : "collapse");


    var opt_indent_size = options.indent_size ? options.indent_size : 4;
    var opt_indent_char = options.indent_char ? options.indent_char : ' ';
    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
    var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
    var opt_jslint_happy = options.jslint_happy === 'undefined' ? false : options.jslint_happy;
    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;
    var opt_space_before_conditional = typeof options.space_before_conditional === 'undefined' ? true : options.space_before_conditional;
    var opt_indent_case = typeof options.indent_case === 'undefined' ? false : options.indent_case;
    var opt_unescape_strings = typeof options.unescape_strings === 'undefined' ? false : options.unescape_strings;

    just_added_newline = false;

    // cache the source's length.
    var input_length = js_source_text.length;

    function trim_output(eat_newlines) {
        eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
        while (output.length && (output[output.length - 1] === ' '
            || output[output.length - 1] === indent_string
            || output[output.length - 1] === preindent_string
            || (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
            output.pop();
        }
    }

    function trim(s) {
        return s.replace(/^\s\s*|\s\s*$/, '');
    }

    // we could use just string.split, but
    // IE doesn't like returning empty strings
    function split_newlines(s) {
        //return s.split(/\x0d\x0a|\x0a/);

        s = s.replace(/\x0d/g, '');
        var out = [],
            idx = s.indexOf("\n");
        while (idx !== -1) {
            out.push(s.substring(0, idx));
            s = s.substring(idx + 1);
            idx = s.indexOf("\n");
        }
        if (s.length) {
            out.push(s);
        }
        return out;
    }

    function force_newline() {
        var old_keep_array_indentation = opt_keep_array_indentation;
        opt_keep_array_indentation = false;
        print_newline();
        opt_keep_array_indentation = old_keep_array_indentation;
    }

    function print_newline(ignore_repeated) {

        flags.eat_next_space = false;
        if (opt_keep_array_indentation && is_array(flags.mode)) {
            return;
        }

        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

        flags.if_line = false;
        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            just_added_newline = true;
            output.push("\n");
        }
        if (preindent_string) {
            output.push(preindent_string);
        }
        for (var i = 0; i < flags.indentation_level; i += 1) {
            output.push(indent_string);
        }
        if (flags.var_line && flags.var_line_reindented) {
            output.push(indent_string); // skip space-stuffing, if indenting with a tab
        }
        if (flags.case_body) {
            output.push(indent_string);
        }
    }



    function print_single_space() {

        if (last_type === 'TK_COMMENT') {
            return print_newline();
        }
        if (flags.eat_next_space) {
            flags.eat_next_space = false;
            return;
        }
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1];
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }


    function print_token() {
        just_added_newline = false;
        flags.eat_next_space = false;
        output.push(token_text);
    }

    function indent() {
        flags.indentation_level += 1;
    }


    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }

    function set_mode(mode) {
        if (flags) {
            flag_store.push(flags);
        }
        flags = {
            previous_mode: flags ? flags.mode : 'BLOCK',
            mode: mode,
            var_line: false,
            var_line_tainted: false,
            var_line_reindented: false,
            in_html_comment: false,
            if_line: false,
            in_case_statement: false, // switch(..){ INSIDE HERE }
            in_case: false, // we're on the exact line with "case 0:"
            case_body: false, // the indented case-action block
            eat_next_space: false,
            indentation_baseline: -1,
            indentation_level: (flags ? flags.indentation_level + (flags.case_body ? 1 : 0) + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : 0),
            ternary_depth: 0
        };
    }

    function is_array(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
    }

    function is_expression(mode) {
        return in_array(mode, ['[EXPRESSION]', '(EXPRESSION)', '(FOR-EXPRESSION)', '(COND-EXPRESSION)']);
    }

    function restore_mode() {
        do_block_just_closed = flags.mode === 'DO_BLOCK';
        if (flag_store.length > 0) {
            var mode = flags.mode;
            flags = flag_store.pop();
            flags.previous_mode = mode;
        }
    }

    function all_lines_start_with(lines, c) {
        for (var i = 0; i < lines.length; i++) {
            var line = trim(lines[i]);
            if (line.charAt(0) !== c) {
                return false;
            }
        }
        return true;
    }

    function is_special_word(word) {
        return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
    }

    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    function look_up(exclude) {
        var local_pos = parser_pos;
        var c = input.charAt(local_pos);
        while (in_array(c, whitespace) && c !== exclude) {
            local_pos++;
            if (local_pos >= input_length) {
                return 0;
            }
            c = input.charAt(local_pos);
        }
        return c;
    }

    function get_next_token() {
        var i;
        var resulting_string;

        n_newlines = 0;

        if (parser_pos >= input_length) {
            return ['', 'TK_EOF'];
        }

        wanted_newline = false;

        var c = input.charAt(parser_pos);
        parser_pos += 1;


        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

        if (keep_whitespace) {

            //
            // slight mess to allow nice preservation of array indentation and reindent that correctly
            // first time when we get to the arrays:
            // var a = [
            // ....'something'
            // we make note of whitespace_count = 4 into flags.indentation_baseline
            // so we know that 4 whitespaces in original source match indent_level of reindented source
            //
            // and afterwards, when we get to
            //    'something,
            // .......'something else'
            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
            //
            var whitespace_count = 0;

            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    trim_output();
                    output.push("\n");
                    just_added_newline = true;
                    whitespace_count = 0;
                } else {
                    if (c === '\t') {
                        whitespace_count += 4;
                    } else if (c === '\r') {
                        // nothing
                    } else {
                        whitespace_count += 1;
                    }
                }

                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }
            if (flags.indentation_baseline === -1) {
                flags.indentation_baseline = whitespace_count;
            }

            if (just_added_newline) {
                for (i = 0; i < flags.indentation_level + 1; i += 1) {
                    output.push(indent_string);
                }
                if (flags.indentation_baseline !== -1) {
                    for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                        output.push(' ');
                    }
                }
            }

        } else {
            while (in_array(c, whitespace)) {

                if (c === "\n") {
                    n_newlines += ((opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1 : 0 : 1);
                }


                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }

                c = input.charAt(parser_pos);
                parser_pos += 1;

            }

            if (opt_preserve_newlines) {
                if (n_newlines > 1) {
                    for (i = 0; i < n_newlines; i += 1) {
                        print_newline(i === 0);
                        just_added_newline = true;
                    }
                }
            }
            wanted_newline = n_newlines > 0;
        }


        if (in_array(c, wordchar)) {
            if (parser_pos < input_length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input_length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                var sign = input.charAt(parser_pos);
                parser_pos += 1;

                var t = get_next_token();
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR'
                && last_type !== 'TK_EQUALS'
                && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            var inline_comment = true;
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input_length) {
                    while (parser_pos < input_length &&
                        ! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/')) {
                        c = input.charAt(parser_pos);
                        comment += c;
                        if (c === "\n" || c === "\r") {
                            inline_comment = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                if (inline_comment && n_newlines === 0) {
                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                } else {
                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                }
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
        c === '"' || // string
        (c === '/' &&
            ((last_type === 'TK_WORD' && is_special_word(last_text)) ||
                (last_text === ')' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) ||
                (last_type === 'TK_COMMA' || last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var esc1 = 0;
            var esc2 = 0;
            resulting_string = c;

            if (parser_pos < input_length) {
                if (sep === '/') {
                    //
                    // handle regexp separately...
                    //
                    var in_char_class = false;
                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            } else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        } else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }

                } else {
                    //
                    // and handle string also separately
                    //
                    while (esc || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (esc1 && esc1 >= esc2) {
                            esc1 = parseInt(resulting_string.substr(-esc2), 16);
                            if (esc1 && esc1 >= 0x20 && esc1 <= 0x7e) {
                                esc1 = String.fromCharCode(esc1);
                                resulting_string = resulting_string.substr(0, resulting_string.length - esc2 - 2) + (((esc1 === sep) || (esc1 === '\\')) ? '\\' : '') + esc1;
                            }
                            esc1 = 0;
                        }
                        if (esc1) {
                            esc1++;
                        } else if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                        } else {
                            esc = false;
                            if (opt_unescape_strings) {
                                if (input.charAt(parser_pos) === 'x') {
                                    esc1++;
                                    esc2 = 2;
                                } else if (input.charAt(parser_pos) === 'u') {
                                    esc1++;
                                    esc2 = 4;
                                }
                            }
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }



            }

            parser_pos += 1;

            resulting_string += sep;

            if (sep === '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }

        if (c === '#') {


            if (output.length === 0 && input.charAt(parser_pos) === '!') {
                // shebang
                resulting_string = c;
                while (parser_pos < input_length && c !== '\n') {
                    c = input.charAt(parser_pos);
                    resulting_string += c;
                    parser_pos += 1;
                }
                output.push(trim(resulting_string) + '\n');
                print_newline();
                return get_next_token();
            }



            // Spidermonkey-specific sharp variables for circular references
            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
            var sharp = '#';
            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                do {
                    c = input.charAt(parser_pos);
                    sharp += c;
                    parser_pos += 1;
                } while (parser_pos < input_length && c !== '#' && c !== '=');
                if (c === '#') {
                    //
                } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                    sharp += '[]';
                    parser_pos += 2;
                } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                    sharp += '{}';
                    parser_pos += 2;
                }
                return [sharp, 'TK_WORD'];
            }
        }

        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
            parser_pos += 3;
            c = '<!--';
            while (input.charAt(parser_pos) !== '\n' && parser_pos < input_length) {
                c += input.charAt(parser_pos);
                parser_pos++;
            }
            flags.in_html_comment = true;
            return [c, 'TK_COMMENT'];
        }

        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
            flags.in_html_comment = false;
            parser_pos += 2;
            if (wanted_newline) {
                print_newline();
            }
            return ['-->', 'TK_COMMENT'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input_length) {
                    break;
                }
            }

            if (c === ',') {
                return [c, 'TK_COMMA'];
            } else if (c === '=') {
                return [c, 'TK_EQUALS'];
            } else {
                return [c, 'TK_OPERATOR'];
            }
        }

        return [c, 'TK_UNKNOWN'];
    }

    //----------------------------------
    indent_string = '';
    while (opt_indent_size > 0) {
        indent_string += opt_indent_char;
        opt_indent_size -= 1;
    }

    while (js_source_text && (js_source_text.charAt(0) === ' ' || js_source_text.charAt(0) === '\t')) {
        preindent_string += js_source_text.charAt(0);
        js_source_text = js_source_text.substring(1);
    }
    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    last_last_text = ''; // pre-last token text
    output = [];

    do_block_just_closed = false;

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    digits = '0123456789'.split('');

    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::';
    punct += ' <%= <% %> <?= <? ?>'; // try to be a good boy and try not to break the markup language identifiers
    punct = punct.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    flag_store = [];
    set_mode('BLOCK');

    parser_pos = 0;
    while (true) {
        var t = get_next_token();
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

        case 'TK_START_EXPR':

            if (token_text === '[') {

                if (last_type === 'TK_WORD' || last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (in_array(last_text, line_starters)) {
                        print_single_space();
                    }
                    set_mode('(EXPRESSION)');
                    print_token();
                    break;
                }

                if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                    if (last_last_text === ']' && last_text === ',') {
                        // ], [ goes to new line
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else if (last_text === '[') {
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');

                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    } else {
                        set_mode('[EXPRESSION]');
                    }
                } else {
                    set_mode('[EXPRESSION]');
                }



            } else {
                if (last_word === 'for') {
                    set_mode('(FOR-EXPRESSION)');
                } else if (in_array(last_word, ['if', 'while'])) {
                    set_mode('(COND-EXPRESSION)');
                } else {
                    set_mode('(EXPRESSION)');
                }
            }

            if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
                if (wanted_newline) {
                    print_newline();
                }
                // do nothing on (( and )( and ][ and ]( and .(
            } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_single_space();
            } else if (last_word === 'function' || last_word === 'typeof') {
                // function() vs function ()
                if (opt_jslint_happy) {
                    print_single_space();
                }
            } else if (in_array(last_text, line_starters) || last_text === 'catch') {
                if (opt_space_before_conditional) {
                    print_single_space();
                }
            }
            print_token();

            break;

        case 'TK_END_EXPR':
            if (token_text === ']') {
                if (opt_keep_array_indentation) {
                    if (last_text === '}') {
                        // trim_output();
                        // print_newline(true);
                        remove_indent();
                        print_token();
                        restore_mode();
                        break;
                    }
                } else {
                    if (flags.mode === '[INDENTED-EXPRESSION]') {
                        if (last_text === ']') {
                            restore_mode();
                            print_newline();
                            print_token();
                            break;
                        }
                    }
                }
            }
            restore_mode();
            print_token();
            break;

        case 'TK_START_BLOCK':

            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            } else {
                set_mode('BLOCK');
            }
            if (opt_brace_style === "expand" || opt_brace_style === "expand-strict") {
                var empty_braces = false;
                if (opt_brace_style === "expand-strict") {
                    empty_braces = (look_up() === '}');
                    if (!empty_braces) {
                        print_newline(true);
                    }
                } else {
                    if (last_type !== 'TK_OPERATOR') {
                        if (last_text === '=' || (is_special_word(last_text) && last_text !== 'else')) {
                            print_single_space();
                        } else {
                            print_newline(true);
                        }
                    }
                }
                print_token();
                if (!empty_braces) {
                    indent();
                }
            } else {
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        print_single_space();
                    }
                } else {
                    // if TK_OPERATOR or TK_START_EXPR
                    if (is_array(flags.previous_mode) && last_text === ',') {
                        if (last_last_text === '}') {
                            // }, { in array context
                            print_single_space();
                        } else {
                            print_newline(); // [a, b, c, {
                        }
                    }
                }
                indent();
                print_token();
            }

            break;

        case 'TK_END_BLOCK':
            restore_mode();
            if (opt_brace_style === "expand" || opt_brace_style === "expand-strict") {
                if (last_text !== '{') {
                    print_newline();
                }
                print_token();
            } else {
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    if (just_added_newline) {
                        remove_indent();
                    } else {
                        // {}
                        trim_output();
                    }
                } else {
                    if (is_array(flags.mode) && opt_keep_array_indentation) {
                        // we REALLY need a newline here, but newliner would skip that
                        opt_keep_array_indentation = false;
                        print_newline();
                        opt_keep_array_indentation = true;

                    } else {
                        print_newline();
                    }
                }
                print_token();
            }
            break;

        case 'TK_WORD':

            // no, it's not you. even I have problems understanding how this works
            // and what does what.
            if (do_block_just_closed) {
                // do {} ## while ()
                print_single_space();
                print_token();
                print_single_space();
                do_block_just_closed = false;
                break;
            }

            prefix = 'NONE';

            if (token_text === 'function') {
                if (flags.var_line && last_type !== 'TK_EQUALS' ) {
                    flags.var_line_reindented = true;
                }
                if ((just_added_newline || last_text === ';') && last_text !== '{'
                && last_type !== 'TK_BLOCK_COMMENT' && last_type !== 'TK_COMMENT') {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    n_newlines = just_added_newline ? n_newlines : 0;
                    if (!opt_preserve_newlines) {
                        n_newlines = 1;
                    }

                    for (var i = 0; i < 2 - n_newlines; i++) {
                        print_newline(false);
                    }
                }
                if (last_type === 'TK_WORD') {
                    if (last_text === 'get' || last_text === 'set' || last_text === 'new' || last_text === 'return') {
                        print_single_space();
                    } else {
                        print_newline();
                    }
                } else if (last_type === 'TK_OPERATOR' || last_text === '=') {
                    // foo = function
                    print_single_space();
                } else if (is_expression(flags.mode)) {
                        //ää print nothing
                } else {
                    print_newline();
                }

                print_token();
                last_word = token_text;
                break;
            }

            if (token_text === 'case' || (token_text === 'default' && flags.in_case_statement)) {
                if (last_text === ':' || flags.case_body) {
                    // switch cases following one another
                    remove_indent();
                } else {
                    // case statement starts in the same line where switch
                    if (!opt_indent_case) {
                        flags.indentation_level--;
                    }
                    print_newline();
                    if (!opt_indent_case) {
                        flags.indentation_level++;
                    }
                }
                print_token();
                flags.in_case = true;
                flags.in_case_statement = true;
                flags.case_body = false;
                break;
            }

            if (last_type === 'TK_END_BLOCK') {

                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                } else {
                    if (opt_brace_style === "expand" || opt_brace_style === "end-expand" || opt_brace_style === "expand-strict") {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        print_single_space();
                    }
                }
            } else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            } else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_WORD') {
                if (last_text === 'else') {
                    // eat newlines between ...else *** some_op...
                    // won't preserve extra newlines in this place (if any), but don't care that much
                    trim_output(true);
                }
                prefix = 'SPACE';
            } else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            } else if (last_type === 'TK_END_EXPR') {
                print_single_space();
                prefix = 'NEWLINE';
            }

            if (in_array(token_text, line_starters) && last_text !== ')') {
                if (last_text === 'else') {
                    prefix = 'SPACE';
                } else {
                    prefix = 'NEWLINE';
                }

            }

            if (flags.if_line && last_type === 'TK_END_EXPR') {
                flags.if_line = false;
            }
            if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                if (last_type !== 'TK_END_BLOCK' || opt_brace_style === "expand" || opt_brace_style === "end-expand" || opt_brace_style === "expand-strict") {
                    print_newline();
                } else {
                    trim_output(true);
                    print_single_space();
                }
            } else if (prefix === 'NEWLINE') {
                if (is_special_word(last_text)) {
                    // no newline between 'return nnn'
                    print_single_space();
                } else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                            // no newline for } else if {
                            print_single_space();
                        } else {
                            flags.var_line = false;
                            flags.var_line_reindented = false;
                            print_newline();
                        }
                    }
                } else if (in_array(token_text, line_starters) && last_text !== ')') {
                    flags.var_line = false;
                    flags.var_line_reindented = false;
                    print_newline();
                }
            } else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
                print_newline(); // }, in lists get a newline treatment
            } else if (prefix === 'SPACE') {
                print_single_space();
            }
            print_token();
            last_word = token_text;

            if (token_text === 'var') {
                flags.var_line = true;
                flags.var_line_reindented = false;
                flags.var_line_tainted = false;
            }

            if (token_text === 'if') {
                flags.if_line = true;
            }
            if (token_text === 'else') {
                flags.if_line = false;
            }

            break;

        case 'TK_SEMICOLON':

            print_token();
            flags.var_line = false;
            flags.var_line_reindented = false;
            if (flags.mode === 'OBJECT') {
                // OBJECT mode is weird and doesn't get reset too well.
                flags.mode = 'BLOCK';
            }
            break;

        case 'TK_STRING':

            if (last_type === 'TK_END_EXPR' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) {
                print_single_space();
            } else if (last_type === 'TK_COMMENT' || last_type === 'TK_STRING' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                print_newline();
            } else if (last_type === 'TK_WORD') {
                print_single_space();
            }
            print_token();
            break;

        case 'TK_EQUALS':
            if (flags.var_line) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.var_line_tainted = true;
            }
            print_single_space();
            print_token();
            print_single_space();
            break;

        case 'TK_COMMA':
            if (flags.var_line) {
                if (is_expression(flags.mode) || last_type === 'TK_END_BLOCK' ) {
                    // do not break on comma, for(var a = 1, b = 2)
                    flags.var_line_tainted = false;
                }
                if (flags.var_line_tainted) {
                    print_token();
                    flags.var_line_reindented = true;
                    flags.var_line_tainted = false;
                    print_newline();
                    break;
                } else {
                    flags.var_line_tainted = false;
                }

                print_token();
                print_single_space();
                break;
            }

            if (last_type === 'TK_COMMENT') {
                print_newline();
            }

            if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                print_token();
                if (flags.mode === 'OBJECT' && last_text === '}') {
                    print_newline();
                } else {
                    print_single_space();
                }
            } else {
                if (flags.mode === 'OBJECT') {
                    print_token();
                    print_newline();
                } else {
                    // EXPR or DO_BLOCK
                    print_token();
                    print_single_space();
                }
            }
            break;


        case 'TK_OPERATOR':

            var space_before = true;
            var space_after = true;

            if (is_special_word(last_text)) {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                print_single_space();
                print_token();
                break;
            }

            // hack for actionscript's import .*;
            if (token_text === '*' && last_type === 'TK_UNKNOWN' && !last_last_text.match(/^\d+$/)) {
                print_token();
                break;
            }

            if (token_text === ':' && flags.in_case) {
                if (opt_indent_case) {
                    flags.case_body = true;
                }
                print_token(); // colon really asks for separate treatment
                print_newline();
                flags.in_case = false;
                break;
            }

            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }

            if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
                // unary operators (and binary +/- pretending to be unary) special cases

                space_before = false;
                space_after = false;

                if (last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }
                if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                    space_before = true;
                }

                if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            } else if (token_text === '.') {
                // decimal digits or object.property
                space_before = false;

            } else if (token_text === ':') {
                if (flags.ternary_depth === 0) {
                    if (flags.mode === 'BLOCK') {
                        flags.mode = 'OBJECT';
                    }
                    space_before = false;
                } else {
                    flags.ternary_depth -= 1;
                }
            } else if (token_text === '?') {
                flags.ternary_depth += 1;
            }
            if (space_before) {
                print_single_space();
            }

            print_token();

            if (space_after) {
                print_single_space();
            }

            break;

        case 'TK_BLOCK_COMMENT':

            var lines = split_newlines(token_text);
            var j; // iterator for this case

            if (all_lines_start_with(lines.slice(1), '*')) {
                // javadoc: reformat and reindent
                print_newline();
                output.push(lines[0]);
                for (j = 1; j < lines.length; j++) {
                    print_newline();
                    output.push(' ');
                    output.push(trim(lines[j]));
                }

            } else {

                // simple block comment: leave intact
                if (lines.length > 1) {
                    // multiline comment block starts with a new line
                    print_newline();
                } else {
                    // single-line /* comment */ stays where it is
                    if (last_type === 'TK_END_BLOCK') {
                        print_newline();
                    } else {
                        print_single_space();
                    }

                }

                for (j = 0; j < lines.length; j++) {
                    output.push(lines[j]);
                    output.push("\n");
                }

            }
            if (look_up('\n') !== '\n') {
                print_newline();
            }
            break;

        case 'TK_INLINE_COMMENT':
            print_single_space();
            print_token();
            if (is_expression(flags.mode)) {
                print_single_space();
            } else {
                force_newline();
            }
            break;

        case 'TK_COMMENT':

            if (last_text === ',' && !wanted_newline) {
                trim_output(true);
            }
            if (last_type !== 'TK_COMMENT') {
                if (wanted_newline) {
                    print_newline();
                } else {
                    print_single_space();
                }
            }
            print_token();
            print_newline();
            break;

        case 'TK_UNKNOWN':
            if (is_special_word(last_text)) {
                print_single_space();
            }
            print_token();
            break;
        }

        last_last_text = last_text;
        last_type = token_type;
        last_text = token_text;
    }

    var sweet_code = preindent_string + output.join('').replace(/[\r\n ]+$/, '');
    return sweet_code;

}

// Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined") {
    exports.js_beautify = js_beautify;
}
});

require.define("/src/js/production/littlesmallscript.js",function(require,module,exports,__dirname,__filename,process,global){(function () {
  "use strict";
  var Statement;
  Statement = require('./statement').Statement;
  var LittleSmallscript;
  LittleSmallscript = function () {
    this.input = null;
    this.options = null;
    this.beautifyOption = null;
    this.cache = null;
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };
  LittleSmallscript.prototype = new Statement();;
  LittleSmallscript.prototype.initWithInputandOptions = function (text, opt) {
    var _this = this;
    _this.input = text;
    _this.options = opt;
    _this.cache = {};
    _this.beautifyOption = {
      "indent_size": 2,
      "indent_char": " ",
      "jslint_happy": true
    };
    return _this;
  };
  LittleSmallscript.prototype.onError = function (err) {
    var _this = this;
    var line, rest, token;
    line = (function () {
      var _ret;
      try {
        _ret = (function () {
          return (_this.input.substring((0), _this.getMaxIndex()).match(/\n/g).size() + 1);
        })();
      } catch (err) {
        _ret = function () {
          return 0;
        }(err);
      }
      return _ret;
    })();
    rest = _this.input.substring(_this.getMaxIndex());
    token = rest.substring((0), rest.search(/[\.\s\t\n]|$/));
    console.log((((("Parse error on line " + line) + ". Unexpected ") + token) + "."));
    console.log("====================================================");
    return console.log(_this.getStackTrace());
  };
  LittleSmallscript.prototype.toJS = function () {
    var _this = this;
    var wrapTmpl, js, beautifyOption, err;
    err = false;
    wrapTmpl = "(function () { \"use strict\"; %statement% }).call(this);";
    (function () {
      var _ret;
      try {
        _ret = (function () {
          return js = _this.templateapply(wrapTmpl, {
            "statement": _this.statement()
          });
        })();
      } catch (err) {
        _ret = function () {
          err = true;
          return _this.onError();
        }(err);
      }
      return _ret;
    })();
    err ? void 0 : (function () {
      return (_this.getIndex() < _this.input.size()) ? (function () {
        err = true;
        return _this.onError(null);
      })() : void 0;
    })();
    return err ? void 0 : (function () {
      return (_this.options && _this.options.prettyprint) ? ((function () {
        return require('../../../lib/beautify.js').js_beautify(js, _this.beautifyOption);
      }))() : (function () {
        return js;
      })();
    })();
  };
  exports.LittleSmallscript = LittleSmallscript;
  window.LittleSmallscript = LittleSmallscript;
  return LittleSmallscript;
}).call(this);
});
require("/src/js/production/littlesmallscript.js");
})();
