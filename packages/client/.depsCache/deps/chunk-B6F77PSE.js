import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@feathersjs/commons/lib/debug.js
var require_debug = __commonJS({
  "../../node_modules/@feathersjs/commons/lib/debug.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDebug = exports.setDebug = exports.noopDebug = void 0;
    var debuggers = {};
    function noopDebug() {
      return function() {
      };
    }
    exports.noopDebug = noopDebug;
    var defaultInitializer = noopDebug;
    function setDebug(debug) {
      defaultInitializer = debug;
      Object.keys(debuggers).forEach((name) => {
        debuggers[name] = debug(name);
      });
    }
    exports.setDebug = setDebug;
    function createDebug(name) {
      if (!debuggers[name]) {
        debuggers[name] = defaultInitializer(name);
      }
      return (...args) => debuggers[name](...args);
    }
    exports.createDebug = createDebug;
  }
});

// ../../node_modules/@feathersjs/commons/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/@feathersjs/commons/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSymbol = exports.isPromise = exports._ = exports.stripSlashes = void 0;
    function stripSlashes(name) {
      return name.replace(/^(\/+)|(\/+)$/g, "");
    }
    exports.stripSlashes = stripSlashes;
    exports._ = {
      each(obj, callback) {
        if (obj && typeof obj.forEach === "function") {
          obj.forEach(callback);
        } else if (exports._.isObject(obj)) {
          Object.keys(obj).forEach((key) => callback(obj[key], key));
        }
      },
      some(value, callback) {
        return Object.keys(value).map((key) => [value[key], key]).some(([val, key]) => callback(val, key));
      },
      every(value, callback) {
        return Object.keys(value).map((key) => [value[key], key]).every(([val, key]) => callback(val, key));
      },
      keys(obj) {
        return Object.keys(obj);
      },
      values(obj) {
        return exports._.keys(obj).map((key) => obj[key]);
      },
      isMatch(obj, item) {
        return exports._.keys(item).every((key) => obj[key] === item[key]);
      },
      isEmpty(obj) {
        return exports._.keys(obj).length === 0;
      },
      isObject(item) {
        return typeof item === "object" && !Array.isArray(item) && item !== null;
      },
      isObjectOrArray(value) {
        return typeof value === "object" && value !== null;
      },
      extend(first, ...rest) {
        return Object.assign(first, ...rest);
      },
      omit(obj, ...keys) {
        const result = exports._.extend({}, obj);
        keys.forEach((key) => delete result[key]);
        return result;
      },
      pick(source, ...keys) {
        return keys.reduce((result, key) => {
          if (source[key] !== void 0) {
            result[key] = source[key];
          }
          return result;
        }, {});
      },
      // Recursively merge the source object into the target object
      merge(target, source) {
        if (exports._.isObject(target) && exports._.isObject(source)) {
          Object.keys(source).forEach((key) => {
            if (exports._.isObject(source[key])) {
              if (!target[key]) {
                Object.assign(target, { [key]: {} });
              }
              exports._.merge(target[key], source[key]);
            } else {
              Object.assign(target, { [key]: source[key] });
            }
          });
        }
        return target;
      }
    };
    function isPromise(result) {
      return exports._.isObject(result) && typeof result.then === "function";
    }
    exports.isPromise = isPromise;
    function createSymbol(name) {
      return typeof Symbol !== "undefined" ? Symbol(name) : name;
    }
    exports.createSymbol = createSymbol;
    __exportStar(require_debug(), exports);
  }
});

export {
  require_lib
};
//# sourceMappingURL=chunk-B6F77PSE.js.map
