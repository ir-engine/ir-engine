import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/querystring/decode.js
var require_decode = __commonJS({
  "../../node_modules/querystring/decode.js"(exports, module) {
    "use strict";
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    module.exports = function(qs, sep, eq, options) {
      sep = sep || "&";
      eq = eq || "=";
      var obj = {};
      if (typeof qs !== "string" || qs.length === 0) {
        return obj;
      }
      var regexp = /\+/g;
      qs = qs.split(sep);
      var maxKeys = 1e3;
      if (options && typeof options.maxKeys === "number") {
        maxKeys = options.maxKeys;
      }
      var len = qs.length;
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }
      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = "";
        }
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
        if (!hasOwnProperty(obj, k)) {
          obj[k] = v;
        } else if (Array.isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }
      return obj;
    };
  }
});

// ../../node_modules/querystring/encode.js
var require_encode = __commonJS({
  "../../node_modules/querystring/encode.js"(exports, module) {
    "use strict";
    var stringifyPrimitive = function(v) {
      switch (typeof v) {
        case "string":
          return v;
        case "boolean":
          return v ? "true" : "false";
        case "number":
          return isFinite(v) ? v : "";
        default:
          return "";
      }
    };
    module.exports = function(obj, sep, eq, name) {
      sep = sep || "&";
      eq = eq || "=";
      if (obj === null) {
        obj = void 0;
      }
      if (typeof obj === "object") {
        return Object.keys(obj).map(function(k) {
          var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
          if (Array.isArray(obj[k])) {
            return obj[k].map(function(v) {
              return ks + encodeURIComponent(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
      }
      if (!name)
        return "";
      return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
    };
  }
});

// ../../node_modules/querystring/index.js
var require_querystring = __commonJS({
  "../../node_modules/querystring/index.js"(exports) {
    exports.decode = exports.parse = require_decode();
    exports.encode = exports.stringify = require_encode();
  }
});
export default require_querystring();
//# sourceMappingURL=querystring.js.map
