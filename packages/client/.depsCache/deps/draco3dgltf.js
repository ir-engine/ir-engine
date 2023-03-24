import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// browser-external:fs
var require_fs = __commonJS({
  "browser-external:fs"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "fs" has been externalized for browser compatibility. Cannot access "fs.${key}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

// browser-external:path
var require_path = __commonJS({
  "browser-external:path"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "path" has been externalized for browser compatibility. Cannot access "path.${key}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

// ../../node_modules/draco3dgltf/draco_encoder_gltf_nodejs.js
var require_draco_encoder_gltf_nodejs = __commonJS({
  "../../node_modules/draco3dgltf/draco_encoder_gltf_nodejs.js"(exports, module) {
    var $jscomp = $jscomp || {};
    $jscomp.scope = {};
    $jscomp.arrayIteratorImpl = function(l) {
      var p = 0;
      return function() {
        return p < l.length ? { done: false, value: l[p++] } : { done: true };
      };
    };
    $jscomp.arrayIterator = function(l) {
      return { next: $jscomp.arrayIteratorImpl(l) };
    };
    $jscomp.makeIterator = function(l) {
      var p = "undefined" != typeof Symbol && Symbol.iterator && l[Symbol.iterator];
      return p ? p.call(l) : $jscomp.arrayIterator(l);
    };
    $jscomp.ASSUME_ES5 = false;
    $jscomp.ASSUME_NO_NATIVE_MAP = false;
    $jscomp.ASSUME_NO_NATIVE_SET = false;
    $jscomp.SIMPLE_FROUND_POLYFILL = false;
    $jscomp.ISOLATE_POLYFILLS = false;
    $jscomp.FORCE_POLYFILL_PROMISE = false;
    $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = false;
    $jscomp.getGlobal = function(l) {
      l = ["object" == typeof globalThis && globalThis, l, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
      for (var p = 0; p < l.length; ++p) {
        var m = l[p];
        if (m && m.Math == Math)
          return m;
      }
      throw Error("Cannot find global object");
    };
    $jscomp.global = $jscomp.getGlobal(exports);
    $jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(l, p, m) {
      if (l == Array.prototype || l == Object.prototype)
        return l;
      l[p] = m.value;
      return l;
    };
    $jscomp.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
    $jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
    $jscomp.polyfills = {};
    $jscomp.propertyToPolyfillSymbol = {};
    $jscomp.POLYFILL_PREFIX = "$jscp$";
    $jscomp.polyfill = function(l, p, m, r) {
      p && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(l, p, m, r) : $jscomp.polyfillUnisolated(l, p, m, r));
    };
    $jscomp.polyfillUnisolated = function(l, p, m, r) {
      m = $jscomp.global;
      l = l.split(".");
      for (r = 0; r < l.length - 1; r++) {
        var k = l[r];
        if (!(k in m))
          return;
        m = m[k];
      }
      l = l[l.length - 1];
      r = m[l];
      p = p(r);
      p != r && null != p && $jscomp.defineProperty(m, l, { configurable: true, writable: true, value: p });
    };
    $jscomp.polyfillIsolated = function(l, p, m, r) {
      var k = l.split(".");
      l = 1 === k.length;
      r = k[0];
      r = !l && r in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
      for (var C = 0; C < k.length - 1; C++) {
        var h = k[C];
        if (!(h in r))
          return;
        r = r[h];
      }
      k = k[k.length - 1];
      m = $jscomp.IS_SYMBOL_NATIVE && "es6" === m ? r[k] : null;
      p = p(m);
      null != p && (l ? $jscomp.defineProperty($jscomp.polyfills, k, { configurable: true, writable: true, value: p }) : p !== m && (void 0 === $jscomp.propertyToPolyfillSymbol[k] && (m = 1e9 * Math.random() >>> 0, $jscomp.propertyToPolyfillSymbol[k] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(k) : $jscomp.POLYFILL_PREFIX + m + "$" + k), $jscomp.defineProperty(r, $jscomp.propertyToPolyfillSymbol[k], { configurable: true, writable: true, value: p })));
    };
    $jscomp.polyfill("Promise", function(l) {
      function p() {
        this.batch_ = null;
      }
      function m(h) {
        return h instanceof k ? h : new k(function(q, w) {
          q(h);
        });
      }
      if (l && (!($jscomp.FORCE_POLYFILL_PROMISE || $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION && "undefined" === typeof $jscomp.global.PromiseRejectionEvent) || !$jscomp.global.Promise || -1 === $jscomp.global.Promise.toString().indexOf("[native code]")))
        return l;
      p.prototype.asyncExecute = function(h) {
        if (null == this.batch_) {
          this.batch_ = [];
          var q = this;
          this.asyncExecuteFunction(function() {
            q.executeBatch_();
          });
        }
        this.batch_.push(h);
      };
      var r = $jscomp.global.setTimeout;
      p.prototype.asyncExecuteFunction = function(h) {
        r(h, 0);
      };
      p.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length; ) {
          var h = this.batch_;
          this.batch_ = [];
          for (var q = 0; q < h.length; ++q) {
            var w = h[q];
            h[q] = null;
            try {
              w();
            } catch (B) {
              this.asyncThrow_(B);
            }
          }
        }
        this.batch_ = null;
      };
      p.prototype.asyncThrow_ = function(h) {
        this.asyncExecuteFunction(function() {
          throw h;
        });
      };
      var k = function(h) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        this.isRejectionHandled_ = false;
        var q = this.createResolveAndReject_();
        try {
          h(q.resolve, q.reject);
        } catch (w) {
          q.reject(w);
        }
      };
      k.prototype.createResolveAndReject_ = function() {
        function h(B) {
          return function(v) {
            w || (w = true, B.call(q, v));
          };
        }
        var q = this, w = false;
        return { resolve: h(this.resolveTo_), reject: h(this.reject_) };
      };
      k.prototype.resolveTo_ = function(h) {
        if (h === this)
          this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (h instanceof k)
          this.settleSameAsPromise_(h);
        else {
          a:
            switch (typeof h) {
              case "object":
                var q = null != h;
                break a;
              case "function":
                q = true;
                break a;
              default:
                q = false;
            }
          q ? this.resolveToNonPromiseObj_(h) : this.fulfill_(h);
        }
      };
      k.prototype.resolveToNonPromiseObj_ = function(h) {
        var q = void 0;
        try {
          q = h.then;
        } catch (w) {
          this.reject_(w);
          return;
        }
        "function" == typeof q ? this.settleSameAsThenable_(q, h) : this.fulfill_(h);
      };
      k.prototype.reject_ = function(h) {
        this.settle_(2, h);
      };
      k.prototype.fulfill_ = function(h) {
        this.settle_(1, h);
      };
      k.prototype.settle_ = function(h, q) {
        if (0 != this.state_)
          throw Error("Cannot settle(" + h + ", " + q + "): Promise already settled in state" + this.state_);
        this.state_ = h;
        this.result_ = q;
        2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
        this.executeOnSettledCallbacks_();
      };
      k.prototype.scheduleUnhandledRejectionCheck_ = function() {
        var h = this;
        r(function() {
          if (h.notifyUnhandledRejection_()) {
            var q = $jscomp.global.console;
            "undefined" !== typeof q && q.error(h.result_);
          }
        }, 1);
      };
      k.prototype.notifyUnhandledRejection_ = function() {
        if (this.isRejectionHandled_)
          return false;
        var h = $jscomp.global.CustomEvent, q = $jscomp.global.Event, w = $jscomp.global.dispatchEvent;
        if ("undefined" === typeof w)
          return true;
        "function" === typeof h ? h = new h("unhandledrejection", { cancelable: true }) : "function" === typeof q ? h = new q("unhandledrejection", { cancelable: true }) : (h = $jscomp.global.document.createEvent("CustomEvent"), h.initCustomEvent("unhandledrejection", false, true, h));
        h.promise = this;
        h.reason = this.result_;
        return w(h);
      };
      k.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
          for (var h = 0; h < this.onSettledCallbacks_.length; ++h)
            C.asyncExecute(this.onSettledCallbacks_[h]);
          this.onSettledCallbacks_ = null;
        }
      };
      var C = new p();
      k.prototype.settleSameAsPromise_ = function(h) {
        var q = this.createResolveAndReject_();
        h.callWhenSettled_(q.resolve, q.reject);
      };
      k.prototype.settleSameAsThenable_ = function(h, q) {
        var w = this.createResolveAndReject_();
        try {
          h.call(q, w.resolve, w.reject);
        } catch (B) {
          w.reject(B);
        }
      };
      k.prototype.then = function(h, q) {
        function w(I, J) {
          return "function" == typeof I ? function(Q) {
            try {
              B(I(Q));
            } catch (R) {
              v(R);
            }
          } : J;
        }
        var B, v, D = new k(function(I, J) {
          B = I;
          v = J;
        });
        this.callWhenSettled_(w(h, B), w(q, v));
        return D;
      };
      k.prototype.catch = function(h) {
        return this.then(void 0, h);
      };
      k.prototype.callWhenSettled_ = function(h, q) {
        function w() {
          switch (B.state_) {
            case 1:
              h(B.result_);
              break;
            case 2:
              q(B.result_);
              break;
            default:
              throw Error("Unexpected state: " + B.state_);
          }
        }
        var B = this;
        null == this.onSettledCallbacks_ ? C.asyncExecute(w) : this.onSettledCallbacks_.push(w);
        this.isRejectionHandled_ = true;
      };
      k.resolve = m;
      k.reject = function(h) {
        return new k(function(q, w) {
          w(h);
        });
      };
      k.race = function(h) {
        return new k(function(q, w) {
          for (var B = $jscomp.makeIterator(h), v = B.next(); !v.done; v = B.next())
            m(v.value).callWhenSettled_(q, w);
        });
      };
      k.all = function(h) {
        var q = $jscomp.makeIterator(h), w = q.next();
        return w.done ? m([]) : new k(function(B, v) {
          function D(Q) {
            return function(R) {
              I[Q] = R;
              J--;
              0 == J && B(I);
            };
          }
          var I = [], J = 0;
          do
            I.push(void 0), J++, m(w.value).callWhenSettled_(D(I.length - 1), v), w = q.next();
          while (!w.done);
        });
      };
      return k;
    }, "es6", "es3");
    $jscomp.owns = function(l, p) {
      return Object.prototype.hasOwnProperty.call(l, p);
    };
    $jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.assign ? Object.assign : function(l, p) {
      for (var m = 1; m < arguments.length; m++) {
        var r = arguments[m];
        if (r)
          for (var k in r)
            $jscomp.owns(r, k) && (l[k] = r[k]);
      }
      return l;
    };
    $jscomp.polyfill("Object.assign", function(l) {
      return l || $jscomp.assign;
    }, "es6", "es3");
    $jscomp.checkStringArgs = function(l, p, m) {
      if (null == l)
        throw new TypeError("The 'this' value for String.prototype." + m + " must not be null or undefined");
      if (p instanceof RegExp)
        throw new TypeError("First argument to String.prototype." + m + " must not be a regular expression");
      return l + "";
    };
    $jscomp.polyfill("String.prototype.startsWith", function(l) {
      return l ? l : function(p, m) {
        var r = $jscomp.checkStringArgs(this, p, "startsWith");
        p += "";
        var k = r.length, C = p.length;
        m = Math.max(0, Math.min(m | 0, r.length));
        for (var h = 0; h < C && m < k; )
          if (r[m++] != p[h++])
            return false;
        return h >= C;
      };
    }, "es6", "es3");
    $jscomp.polyfill("Array.prototype.copyWithin", function(l) {
      function p(m) {
        m = Number(m);
        return Infinity === m || -Infinity === m ? m : m | 0;
      }
      return l ? l : function(m, r, k) {
        var C = this.length;
        m = p(m);
        r = p(r);
        k = void 0 === k ? C : p(k);
        m = 0 > m ? Math.max(C + m, 0) : Math.min(m, C);
        r = 0 > r ? Math.max(C + r, 0) : Math.min(r, C);
        k = 0 > k ? Math.max(C + k, 0) : Math.min(k, C);
        if (m < r)
          for (; r < k; )
            r in this ? this[m++] = this[r++] : (delete this[m++], r++);
        else
          for (k = Math.min(k, C + r - m), m += k - r; k > r; )
            --k in this ? this[--m] = this[k] : delete this[--m];
        return this;
      };
    }, "es6", "es3");
    $jscomp.typedArrayCopyWithin = function(l) {
      return l ? l : Array.prototype.copyWithin;
    };
    $jscomp.polyfill("Int8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint8ClampedArray.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Int16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Int32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Float32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Float64Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    var DracoEncoderModule = function() {
      var l = "undefined" !== typeof document && document.currentScript ? document.currentScript.src : void 0;
      "undefined" !== typeof __filename && (l = l || __filename);
      return function(p) {
        function m(f) {
          return a.locateFile ? a.locateFile(f, L) : L + f;
        }
        function r() {
          var f = ba.buffer;
          a.HEAP8 = O = new Int8Array(f);
          a.HEAP16 = ea = new Int16Array(f);
          a.HEAP32 = S = new Int32Array(f);
          a.HEAPU8 = fa = new Uint8Array(f);
          a.HEAPU16 = new Uint16Array(f);
          a.HEAPU32 = T = new Uint32Array(f);
          a.HEAPF32 = ha = new Float32Array(f);
          a.HEAPF64 = new Float64Array(f);
        }
        function k(f) {
          if (a.onAbort)
            a.onAbort(f);
          f = "Aborted(" + f + ")";
          W(f);
          na = true;
          f = new WebAssembly.RuntimeError(f + ". Build with -sASSERTIONS for more info.");
          ca(f);
          throw f;
        }
        function C(f) {
          try {
            if (f == K && X)
              return new Uint8Array(X);
            if (ia)
              return ia(f);
            throw "both async and sync fetching of the wasm failed";
          } catch (b) {
            k(b);
          }
        }
        function h() {
          if (!X && (oa || Y)) {
            if ("function" == typeof fetch && !K.startsWith("file://"))
              return fetch(K, { credentials: "same-origin" }).then(function(f) {
                if (!f.ok)
                  throw "failed to load wasm binary file at '" + K + "'";
                return f.arrayBuffer();
              }).catch(function() {
                return C(K);
              });
            if (ja)
              return new Promise(function(f, b) {
                ja(K, function(c) {
                  f(new Uint8Array(c));
                }, b);
              });
          }
          return Promise.resolve().then(function() {
            return C(K);
          });
        }
        function q(f) {
          for (; 0 < f.length; )
            f.shift()(a);
        }
        function w(f) {
          this.excPtr = f;
          this.ptr = f - 24;
          this.set_type = function(b) {
            T[this.ptr + 4 >> 2] = b;
          };
          this.get_type = function() {
            return T[this.ptr + 4 >> 2];
          };
          this.set_destructor = function(b) {
            T[this.ptr + 8 >> 2] = b;
          };
          this.get_destructor = function() {
            return T[this.ptr + 8 >> 2];
          };
          this.set_refcount = function(b) {
            S[this.ptr >> 2] = b;
          };
          this.set_caught = function(b) {
            O[this.ptr + 12 >> 0] = b ? 1 : 0;
          };
          this.get_caught = function() {
            return 0 != O[this.ptr + 12 >> 0];
          };
          this.set_rethrown = function(b) {
            O[this.ptr + 13 >> 0] = b ? 1 : 0;
          };
          this.get_rethrown = function() {
            return 0 != O[this.ptr + 13 >> 0];
          };
          this.init = function(b, c) {
            this.set_adjusted_ptr(0);
            this.set_type(b);
            this.set_destructor(c);
            this.set_refcount(0);
            this.set_caught(false);
            this.set_rethrown(false);
          };
          this.add_ref = function() {
            S[this.ptr >> 2] += 1;
          };
          this.release_ref = function() {
            var b = S[this.ptr >> 2];
            S[this.ptr >> 2] = b - 1;
            return 1 === b;
          };
          this.set_adjusted_ptr = function(b) {
            T[this.ptr + 16 >> 2] = b;
          };
          this.get_adjusted_ptr = function() {
            return T[this.ptr + 16 >> 2];
          };
          this.get_exception_ptr = function() {
            if (pa(this.get_type()))
              return T[this.excPtr >> 2];
            var b = this.get_adjusted_ptr();
            return 0 !== b ? b : this.excPtr;
          };
        }
        function B() {
          function f() {
            if (!da && (da = true, a.calledRun = true, !na)) {
              qa = true;
              q(ka);
              ra(a);
              if (a.onRuntimeInitialized)
                a.onRuntimeInitialized();
              if (a.postRun)
                for ("function" == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; )
                  sa.unshift(a.postRun.shift());
              q(sa);
            }
          }
          if (!(0 < U)) {
            if (a.preRun)
              for ("function" == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; )
                ta.unshift(a.preRun.shift());
            q(ta);
            0 < U || (a.setStatus ? (a.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                a.setStatus("");
              }, 1);
              f();
            }, 1)) : f());
          }
        }
        function v() {
        }
        function D(f) {
          return (f || v).__cache__;
        }
        function I(f, b) {
          var c = D(b), d = c[f];
          if (d)
            return d;
          d = Object.create((b || v).prototype);
          d.ptr = f;
          return c[f] = d;
        }
        function J(f) {
          if ("string" === typeof f) {
            for (var b = 0, c = 0; c < f.length; ++c) {
              var d = f.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            b = Array(b + 1);
            c = 0;
            d = b.length;
            if (0 < d) {
              d = c + d - 1;
              for (var e = 0; e < f.length; ++e) {
                var g = f.charCodeAt(e);
                if (55296 <= g && 57343 >= g) {
                  var t = f.charCodeAt(++e);
                  g = 65536 + ((g & 1023) << 10) | t & 1023;
                }
                if (127 >= g) {
                  if (c >= d)
                    break;
                  b[c++] = g;
                } else {
                  if (2047 >= g) {
                    if (c + 1 >= d)
                      break;
                    b[c++] = 192 | g >> 6;
                  } else {
                    if (65535 >= g) {
                      if (c + 2 >= d)
                        break;
                      b[c++] = 224 | g >> 12;
                    } else {
                      if (c + 3 >= d)
                        break;
                      b[c++] = 240 | g >> 18;
                      b[c++] = 128 | g >> 12 & 63;
                    }
                    b[c++] = 128 | g >> 6 & 63;
                  }
                  b[c++] = 128 | g & 63;
                }
              }
              b[c] = 0;
            }
            f = n.alloc(b, O);
            n.copy(b, O, f);
            return f;
          }
          return f;
        }
        function Q(f) {
          if ("object" === typeof f) {
            var b = n.alloc(f, O);
            n.copy(f, O, b);
            return b;
          }
          return f;
        }
        function R(f) {
          if ("object" === typeof f) {
            var b = n.alloc(f, ea);
            n.copy(f, ea, b);
            return b;
          }
          return f;
        }
        function V(f) {
          if ("object" === typeof f) {
            var b = n.alloc(f, S);
            n.copy(f, S, b);
            return b;
          }
          return f;
        }
        function Z(f) {
          if ("object" === typeof f) {
            var b = n.alloc(f, ha);
            n.copy(f, ha, b);
            return b;
          }
          return f;
        }
        function P() {
          throw "cannot construct a VoidPtr, no constructor in IDL";
        }
        function M() {
          this.ptr = ua();
          D(M)[this.ptr] = this;
        }
        function z() {
          this.ptr = va();
          D(z)[this.ptr] = this;
        }
        function G() {
          this.ptr = wa();
          D(G)[this.ptr] = this;
        }
        function E() {
          this.ptr = xa();
          D(E)[this.ptr] = this;
        }
        function N() {
          this.ptr = ya();
          D(N)[this.ptr] = this;
        }
        function H() {
          this.ptr = za();
          D(H)[this.ptr] = this;
        }
        function F() {
          this.ptr = Aa();
          D(F)[this.ptr] = this;
        }
        function x() {
          this.ptr = Ba();
          D(x)[this.ptr] = this;
        }
        function u() {
          this.ptr = Ca();
          D(u)[this.ptr] = this;
        }
        function y() {
          this.ptr = Da();
          D(y)[this.ptr] = this;
        }
        function A(f) {
          f && "object" === typeof f && (f = f.ptr);
          this.ptr = Ea(f);
          D(A)[this.ptr] = this;
        }
        p = void 0 === p ? {} : p;
        var a = "undefined" != typeof p ? p : {}, ra, ca;
        a.ready = new Promise(function(f, b) {
          ra = f;
          ca = b;
        });
        var Fa = false, Ga = false;
        a.onRuntimeInitialized = function() {
          Fa = true;
          if (Ga && "function" === typeof a.onModuleLoaded)
            a.onModuleLoaded(a);
        };
        a.onModuleParsed = function() {
          Ga = true;
          if (Fa && "function" === typeof a.onModuleLoaded)
            a.onModuleLoaded(a);
        };
        a.isVersionSupported = function(f) {
          if ("string" !== typeof f)
            return false;
          f = f.split(".");
          return 2 > f.length || 3 < f.length ? false : 1 == f[0] && 0 <= f[1] && 5 >= f[1] ? true : 0 != f[0] || 10 < f[1] ? false : true;
        };
        var Ha = Object.assign({}, a), oa = "object" == typeof window, Y = "function" == typeof importScripts, Ia = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, L = "";
        if (Ia) {
          var Ja = require_fs(), la = require_path();
          L = Y ? la.dirname(L) + "/" : __dirname + "/";
          var Ka = function(f, b) {
            f = f.startsWith("file://") ? new URL(f) : la.normalize(f);
            return Ja.readFileSync(f, b ? void 0 : "utf8");
          };
          var ia = function(f) {
            f = Ka(f, true);
            f.buffer || (f = new Uint8Array(f));
            return f;
          };
          var ja = function(f, b, c) {
            f = f.startsWith("file://") ? new URL(f) : la.normalize(f);
            Ja.readFile(f, function(d, e) {
              d ? c(d) : b(e.buffer);
            });
          };
          1 < process.argv.length && process.argv[1].replace(/\\/g, "/");
          process.argv.slice(2);
          a.inspect = function() {
            return "[Emscripten Module object]";
          };
        } else if (oa || Y)
          Y ? L = self.location.href : "undefined" != typeof document && document.currentScript && (L = document.currentScript.src), l && (L = l), L = 0 !== L.indexOf("blob:") ? L.substr(0, L.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", Ka = function(f) {
            var b = new XMLHttpRequest();
            b.open("GET", f, false);
            b.send(null);
            return b.responseText;
          }, Y && (ia = function(f) {
            var b = new XMLHttpRequest();
            b.open("GET", f, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), ja = function(f, b, c) {
            var d = new XMLHttpRequest();
            d.open("GET", f, true);
            d.responseType = "arraybuffer";
            d.onload = function() {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        a.print || console.log.bind(console);
        var W = a.printErr || console.warn.bind(console);
        Object.assign(a, Ha);
        Ha = null;
        var X;
        a.wasmBinary && (X = a.wasmBinary);
        "object" != typeof WebAssembly && k("no native wasm support detected");
        var ba, na = false, O, fa, ea, S, T, ha, ta = [], ka = [], sa = [], qa = false, U = 0, ma = null, aa = null;
        var K = "draco_encoder.wasm";
        K.startsWith("data:application/octet-stream;base64,") || (K = m(K));
        var nc = 0, oc = { b: function(f, b, c) {
          new w(f).init(b, c);
          nc++;
          throw f;
        }, a: function() {
          k("");
        }, d: function(f, b, c) {
          fa.copyWithin(f, b, b + c);
        }, c: function(f) {
          var b = fa.length;
          f >>>= 0;
          if (2147483648 < f)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, f + 100663296);
            var e = Math;
            d = Math.max(f, d);
            e = e.min.call(
              e,
              2147483648,
              d + (65536 - d % 65536) % 65536
            );
            a: {
              d = ba.buffer;
              try {
                ba.grow(e - d.byteLength + 65535 >>> 16);
                r();
                var g = 1;
                break a;
              } catch (t) {
              }
              g = void 0;
            }
            if (g)
              return true;
          }
          return false;
        } };
        (function() {
          function f(e, g) {
            a.asm = e.exports;
            ba = a.asm.e;
            r();
            ka.unshift(a.asm.f);
            U--;
            a.monitorRunDependencies && a.monitorRunDependencies(U);
            0 == U && (null !== ma && (clearInterval(ma), ma = null), aa && (e = aa, aa = null, e()));
          }
          function b(e) {
            f(e.instance);
          }
          function c(e) {
            return h().then(function(g) {
              return WebAssembly.instantiate(g, d);
            }).then(function(g) {
              return g;
            }).then(e, function(g) {
              W("failed to asynchronously prepare wasm: " + g);
              k(g);
            });
          }
          var d = { a: oc };
          U++;
          a.monitorRunDependencies && a.monitorRunDependencies(U);
          if (a.instantiateWasm)
            try {
              return a.instantiateWasm(d, f);
            } catch (e) {
              W("Module.instantiateWasm callback failed with error: " + e), ca(e);
            }
          (function() {
            return X || "function" != typeof WebAssembly.instantiateStreaming || K.startsWith("data:application/octet-stream;base64,") || K.startsWith("file://") || Ia || "function" != typeof fetch ? c(b) : fetch(K, { credentials: "same-origin" }).then(function(e) {
              return WebAssembly.instantiateStreaming(e, d).then(
                b,
                function(g) {
                  W("wasm streaming compile failed: " + g);
                  W("falling back to ArrayBuffer instantiation");
                  return c(b);
                }
              );
            });
          })().catch(ca);
          return {};
        })();
        var La = a._emscripten_bind_VoidPtr___destroy___0 = function() {
          return (La = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.h).apply(null, arguments);
        }, ua = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function() {
          return (ua = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.i).apply(null, arguments);
        }, Ma = a._emscripten_bind_GeometryAttribute___destroy___0 = function() {
          return (Ma = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.j).apply(null, arguments);
        }, va = a._emscripten_bind_PointAttribute_PointAttribute_0 = function() {
          return (va = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.k).apply(null, arguments);
        }, Na = a._emscripten_bind_PointAttribute_size_0 = function() {
          return (Na = a._emscripten_bind_PointAttribute_size_0 = a.asm.l).apply(null, arguments);
        }, Oa = a._emscripten_bind_PointAttribute_attribute_type_0 = function() {
          return (Oa = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.m).apply(null, arguments);
        }, Pa = a._emscripten_bind_PointAttribute_data_type_0 = function() {
          return (Pa = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.n).apply(null, arguments);
        }, Qa = a._emscripten_bind_PointAttribute_num_components_0 = function() {
          return (Qa = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.o).apply(null, arguments);
        }, Ra = a._emscripten_bind_PointAttribute_normalized_0 = function() {
          return (Ra = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.p).apply(null, arguments);
        }, Sa = a._emscripten_bind_PointAttribute_byte_stride_0 = function() {
          return (Sa = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.q).apply(null, arguments);
        }, Ta = a._emscripten_bind_PointAttribute_byte_offset_0 = function() {
          return (Ta = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.r).apply(null, arguments);
        }, Ua = a._emscripten_bind_PointAttribute_unique_id_0 = function() {
          return (Ua = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.s).apply(null, arguments);
        }, Va = a._emscripten_bind_PointAttribute___destroy___0 = function() {
          return (Va = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.t).apply(null, arguments);
        }, wa = a._emscripten_bind_PointCloud_PointCloud_0 = function() {
          return (wa = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.u).apply(null, arguments);
        }, Wa = a._emscripten_bind_PointCloud_num_attributes_0 = function() {
          return (Wa = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.v).apply(null, arguments);
        }, Xa = a._emscripten_bind_PointCloud_num_points_0 = function() {
          return (Xa = a._emscripten_bind_PointCloud_num_points_0 = a.asm.w).apply(null, arguments);
        }, Ya = a._emscripten_bind_PointCloud___destroy___0 = function() {
          return (Ya = a._emscripten_bind_PointCloud___destroy___0 = a.asm.x).apply(null, arguments);
        }, xa = a._emscripten_bind_Mesh_Mesh_0 = function() {
          return (xa = a._emscripten_bind_Mesh_Mesh_0 = a.asm.y).apply(null, arguments);
        }, Za = a._emscripten_bind_Mesh_num_faces_0 = function() {
          return (Za = a._emscripten_bind_Mesh_num_faces_0 = a.asm.z).apply(null, arguments);
        }, $a = a._emscripten_bind_Mesh_num_attributes_0 = function() {
          return ($a = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.A).apply(null, arguments);
        }, ab = a._emscripten_bind_Mesh_num_points_0 = function() {
          return (ab = a._emscripten_bind_Mesh_num_points_0 = a.asm.B).apply(null, arguments);
        }, bb = a._emscripten_bind_Mesh_set_num_points_1 = function() {
          return (bb = a._emscripten_bind_Mesh_set_num_points_1 = a.asm.C).apply(null, arguments);
        }, cb = a._emscripten_bind_Mesh___destroy___0 = function() {
          return (cb = a._emscripten_bind_Mesh___destroy___0 = a.asm.D).apply(null, arguments);
        }, ya = a._emscripten_bind_Metadata_Metadata_0 = function() {
          return (ya = a._emscripten_bind_Metadata_Metadata_0 = a.asm.E).apply(null, arguments);
        }, db = a._emscripten_bind_Metadata___destroy___0 = function() {
          return (db = a._emscripten_bind_Metadata___destroy___0 = a.asm.F).apply(null, arguments);
        }, za = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function() {
          return (za = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.G).apply(null, arguments);
        }, eb = a._emscripten_bind_DracoInt8Array_GetValue_1 = function() {
          return (eb = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.H).apply(null, arguments);
        }, fb = a._emscripten_bind_DracoInt8Array_size_0 = function() {
          return (fb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.I).apply(null, arguments);
        }, gb = a._emscripten_bind_DracoInt8Array___destroy___0 = function() {
          return (gb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.J).apply(null, arguments);
        }, Aa = a._emscripten_bind_MetadataBuilder_MetadataBuilder_0 = function() {
          return (Aa = a._emscripten_bind_MetadataBuilder_MetadataBuilder_0 = a.asm.K).apply(null, arguments);
        }, hb = a._emscripten_bind_MetadataBuilder_AddStringEntry_3 = function() {
          return (hb = a._emscripten_bind_MetadataBuilder_AddStringEntry_3 = a.asm.L).apply(null, arguments);
        }, ib = a._emscripten_bind_MetadataBuilder_AddIntEntry_3 = function() {
          return (ib = a._emscripten_bind_MetadataBuilder_AddIntEntry_3 = a.asm.M).apply(null, arguments);
        }, jb = a._emscripten_bind_MetadataBuilder_AddIntEntryArray_4 = function() {
          return (jb = a._emscripten_bind_MetadataBuilder_AddIntEntryArray_4 = a.asm.N).apply(null, arguments);
        }, kb = a._emscripten_bind_MetadataBuilder_AddDoubleEntry_3 = function() {
          return (kb = a._emscripten_bind_MetadataBuilder_AddDoubleEntry_3 = a.asm.O).apply(null, arguments);
        }, lb = a._emscripten_bind_MetadataBuilder___destroy___0 = function() {
          return (lb = a._emscripten_bind_MetadataBuilder___destroy___0 = a.asm.P).apply(null, arguments);
        }, Ba = a._emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 = function() {
          return (Ba = a._emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 = a.asm.Q).apply(null, arguments);
        }, mb = a._emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 = function() {
          return (mb = a._emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 = a.asm.R).apply(null, arguments);
        }, nb = a._emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 = function() {
          return (nb = a._emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 = a.asm.S).apply(null, arguments);
        }, ob = a._emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 = function() {
          return (ob = a._emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 = a.asm.T).apply(null, arguments);
        }, pb = a._emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 = function() {
          return (pb = a._emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 = a.asm.U).apply(null, arguments);
        }, qb = a._emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 = function() {
          return (qb = a._emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 = a.asm.V).apply(null, arguments);
        }, rb = a._emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 = function() {
          return (rb = a._emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 = a.asm.W).apply(null, arguments);
        }, sb = a._emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 = function() {
          return (sb = a._emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 = a.asm.X).apply(null, arguments);
        }, tb = a._emscripten_bind_PointCloudBuilder_AddMetadata_2 = function() {
          return (tb = a._emscripten_bind_PointCloudBuilder_AddMetadata_2 = a.asm.Y).apply(null, arguments);
        }, ub = a._emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 = function() {
          return (ub = a._emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 = a.asm.Z).apply(null, arguments);
        }, vb = a._emscripten_bind_PointCloudBuilder___destroy___0 = function() {
          return (vb = a._emscripten_bind_PointCloudBuilder___destroy___0 = a.asm._).apply(null, arguments);
        }, Ca = a._emscripten_bind_MeshBuilder_MeshBuilder_0 = function() {
          return (Ca = a._emscripten_bind_MeshBuilder_MeshBuilder_0 = a.asm.$).apply(null, arguments);
        }, wb = a._emscripten_bind_MeshBuilder_AddFacesToMesh_3 = function() {
          return (wb = a._emscripten_bind_MeshBuilder_AddFacesToMesh_3 = a.asm.aa).apply(null, arguments);
        }, xb = a._emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 = function() {
          return (xb = a._emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 = a.asm.ba).apply(null, arguments);
        }, yb = a._emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 = function() {
          return (yb = a._emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 = a.asm.ca).apply(null, arguments);
        }, zb = a._emscripten_bind_MeshBuilder_AddMetadataToMesh_2 = function() {
          return (zb = a._emscripten_bind_MeshBuilder_AddMetadataToMesh_2 = a.asm.da).apply(null, arguments);
        }, Ab = a._emscripten_bind_MeshBuilder_AddFloatAttribute_5 = function() {
          return (Ab = a._emscripten_bind_MeshBuilder_AddFloatAttribute_5 = a.asm.ea).apply(null, arguments);
        }, Bb = a._emscripten_bind_MeshBuilder_AddInt8Attribute_5 = function() {
          return (Bb = a._emscripten_bind_MeshBuilder_AddInt8Attribute_5 = a.asm.fa).apply(null, arguments);
        }, Cb = a._emscripten_bind_MeshBuilder_AddUInt8Attribute_5 = function() {
          return (Cb = a._emscripten_bind_MeshBuilder_AddUInt8Attribute_5 = a.asm.ga).apply(null, arguments);
        }, Db = a._emscripten_bind_MeshBuilder_AddInt16Attribute_5 = function() {
          return (Db = a._emscripten_bind_MeshBuilder_AddInt16Attribute_5 = a.asm.ha).apply(null, arguments);
        }, Eb = a._emscripten_bind_MeshBuilder_AddUInt16Attribute_5 = function() {
          return (Eb = a._emscripten_bind_MeshBuilder_AddUInt16Attribute_5 = a.asm.ia).apply(null, arguments);
        }, Fb = a._emscripten_bind_MeshBuilder_AddInt32Attribute_5 = function() {
          return (Fb = a._emscripten_bind_MeshBuilder_AddInt32Attribute_5 = a.asm.ja).apply(null, arguments);
        }, Gb = a._emscripten_bind_MeshBuilder_AddUInt32Attribute_5 = function() {
          return (Gb = a._emscripten_bind_MeshBuilder_AddUInt32Attribute_5 = a.asm.ka).apply(null, arguments);
        }, Hb = a._emscripten_bind_MeshBuilder_AddMetadata_2 = function() {
          return (Hb = a._emscripten_bind_MeshBuilder_AddMetadata_2 = a.asm.la).apply(null, arguments);
        }, Ib = a._emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 = function() {
          return (Ib = a._emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 = a.asm.ma).apply(null, arguments);
        }, Jb = a._emscripten_bind_MeshBuilder___destroy___0 = function() {
          return (Jb = a._emscripten_bind_MeshBuilder___destroy___0 = a.asm.na).apply(null, arguments);
        }, Da = a._emscripten_bind_Encoder_Encoder_0 = function() {
          return (Da = a._emscripten_bind_Encoder_Encoder_0 = a.asm.oa).apply(null, arguments);
        }, Kb = a._emscripten_bind_Encoder_SetEncodingMethod_1 = function() {
          return (Kb = a._emscripten_bind_Encoder_SetEncodingMethod_1 = a.asm.pa).apply(null, arguments);
        }, Lb = a._emscripten_bind_Encoder_SetAttributeQuantization_2 = function() {
          return (Lb = a._emscripten_bind_Encoder_SetAttributeQuantization_2 = a.asm.qa).apply(null, arguments);
        }, Mb = a._emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 = function() {
          return (Mb = a._emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 = a.asm.ra).apply(null, arguments);
        }, Nb = a._emscripten_bind_Encoder_SetSpeedOptions_2 = function() {
          return (Nb = a._emscripten_bind_Encoder_SetSpeedOptions_2 = a.asm.sa).apply(null, arguments);
        }, Ob = a._emscripten_bind_Encoder_SetTrackEncodedProperties_1 = function() {
          return (Ob = a._emscripten_bind_Encoder_SetTrackEncodedProperties_1 = a.asm.ta).apply(null, arguments);
        }, Pb = a._emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 = function() {
          return (Pb = a._emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 = a.asm.ua).apply(null, arguments);
        }, Qb = a._emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 = function() {
          return (Qb = a._emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 = a.asm.va).apply(null, arguments);
        }, Rb = a._emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 = function() {
          return (Rb = a._emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 = a.asm.wa).apply(null, arguments);
        }, Sb = a._emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 = function() {
          return (Sb = a._emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 = a.asm.xa).apply(null, arguments);
        }, Tb = a._emscripten_bind_Encoder___destroy___0 = function() {
          return (Tb = a._emscripten_bind_Encoder___destroy___0 = a.asm.ya).apply(null, arguments);
        }, Ea = a._emscripten_bind_ExpertEncoder_ExpertEncoder_1 = function() {
          return (Ea = a._emscripten_bind_ExpertEncoder_ExpertEncoder_1 = a.asm.za).apply(null, arguments);
        }, Ub = a._emscripten_bind_ExpertEncoder_SetEncodingMethod_1 = function() {
          return (Ub = a._emscripten_bind_ExpertEncoder_SetEncodingMethod_1 = a.asm.Aa).apply(null, arguments);
        }, Vb = a._emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 = function() {
          return (Vb = a._emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 = a.asm.Ba).apply(null, arguments);
        }, Wb = a._emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 = function() {
          return (Wb = a._emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 = a.asm.Ca).apply(null, arguments);
        }, Xb = a._emscripten_bind_ExpertEncoder_SetSpeedOptions_2 = function() {
          return (Xb = a._emscripten_bind_ExpertEncoder_SetSpeedOptions_2 = a.asm.Da).apply(null, arguments);
        }, Yb = a._emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 = function() {
          return (Yb = a._emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 = a.asm.Ea).apply(null, arguments);
        }, Zb = a._emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 = function() {
          return (Zb = a._emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 = a.asm.Fa).apply(null, arguments);
        }, $b = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 = function() {
          return ($b = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 = a.asm.Ga).apply(null, arguments);
        }, ac = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 = function() {
          return (ac = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 = a.asm.Ha).apply(null, arguments);
        }, bc = a._emscripten_bind_ExpertEncoder___destroy___0 = function() {
          return (bc = a._emscripten_bind_ExpertEncoder___destroy___0 = a.asm.Ia).apply(null, arguments);
        }, cc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function() {
          return (cc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.Ja).apply(null, arguments);
        }, dc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function() {
          return (dc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.Ka).apply(null, arguments);
        }, ec = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function() {
          return (ec = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.La).apply(null, arguments);
        }, fc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function() {
          return (fc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.Ma).apply(null, arguments);
        }, gc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function() {
          return (gc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.Na).apply(null, arguments);
        }, hc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function() {
          return (hc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.Oa).apply(null, arguments);
        }, ic = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function() {
          return (ic = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.Pa).apply(null, arguments);
        }, jc = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function() {
          return (jc = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.Qa).apply(null, arguments);
        }, kc = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function() {
          return (kc = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.Ra).apply(null, arguments);
        }, lc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING = function() {
          return (lc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING = a.asm.Sa).apply(null, arguments);
        }, mc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING = function() {
          return (mc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING = a.asm.Ta).apply(null, arguments);
        };
        a._malloc = function() {
          return (a._malloc = a.asm.Ua).apply(null, arguments);
        };
        a._free = function() {
          return (a._free = a.asm.Va).apply(null, arguments);
        };
        var pa = function() {
          return (pa = a.asm.Wa).apply(null, arguments);
        };
        a.___start_em_js = 19116;
        a.___stop_em_js = 19214;
        var da;
        aa = function b() {
          da || B();
          da || (aa = b);
        };
        if (a.preInit)
          for ("function" == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; )
            a.preInit.pop()();
        B();
        v.prototype = Object.create(v.prototype);
        v.prototype.constructor = v;
        v.prototype.__class__ = v;
        v.__cache__ = {};
        a.WrapperObject = v;
        a.getCache = D;
        a.wrapPointer = I;
        a.castObject = function(b, c) {
          return I(b.ptr, c);
        };
        a.NULL = I(0);
        a.destroy = function(b) {
          if (!b.__destroy__)
            throw "Error: Cannot destroy object. (Did you create it yourself?)";
          b.__destroy__();
          delete D(b.__class__)[b.ptr];
        };
        a.compare = function(b, c) {
          return b.ptr === c.ptr;
        };
        a.getPointer = function(b) {
          return b.ptr;
        };
        a.getClass = function(b) {
          return b.__class__;
        };
        var n = { buffer: 0, size: 0, pos: 0, temps: [], needed: 0, prepare: function() {
          if (n.needed) {
            for (var b = 0; b < n.temps.length; b++)
              a._free(n.temps[b]);
            n.temps.length = 0;
            a._free(n.buffer);
            n.buffer = 0;
            n.size += n.needed;
            n.needed = 0;
          }
          n.buffer || (n.size += 128, n.buffer = a._malloc(n.size), n.buffer || k(void 0));
          n.pos = 0;
        }, alloc: function(b, c) {
          n.buffer || k(void 0);
          b = b.length * c.BYTES_PER_ELEMENT;
          b = b + 7 & -8;
          n.pos + b >= n.size ? (0 < b || k(void 0), n.needed += b, c = a._malloc(b), n.temps.push(c)) : (c = n.buffer + n.pos, n.pos += b);
          return c;
        }, copy: function(b, c, d) {
          d >>>= 0;
          switch (c.BYTES_PER_ELEMENT) {
            case 2:
              d >>>= 1;
              break;
            case 4:
              d >>>= 2;
              break;
            case 8:
              d >>>= 3;
          }
          for (var e = 0; e < b.length; e++)
            c[d + e] = b[e];
        } };
        P.prototype = Object.create(v.prototype);
        P.prototype.constructor = P;
        P.prototype.__class__ = P;
        P.__cache__ = {};
        a.VoidPtr = P;
        P.prototype.__destroy__ = P.prototype.__destroy__ = function() {
          La(this.ptr);
        };
        M.prototype = Object.create(v.prototype);
        M.prototype.constructor = M;
        M.prototype.__class__ = M;
        M.__cache__ = {};
        a.GeometryAttribute = M;
        M.prototype.__destroy__ = M.prototype.__destroy__ = function() {
          Ma(this.ptr);
        };
        z.prototype = Object.create(v.prototype);
        z.prototype.constructor = z;
        z.prototype.__class__ = z;
        z.__cache__ = {};
        a.PointAttribute = z;
        z.prototype.size = z.prototype.size = function() {
          return Na(this.ptr);
        };
        z.prototype.attribute_type = z.prototype.attribute_type = function() {
          return Oa(this.ptr);
        };
        z.prototype.data_type = z.prototype.data_type = function() {
          return Pa(this.ptr);
        };
        z.prototype.num_components = z.prototype.num_components = function() {
          return Qa(this.ptr);
        };
        z.prototype.normalized = z.prototype.normalized = function() {
          return !!Ra(this.ptr);
        };
        z.prototype.byte_stride = z.prototype.byte_stride = function() {
          return Sa(this.ptr);
        };
        z.prototype.byte_offset = z.prototype.byte_offset = function() {
          return Ta(this.ptr);
        };
        z.prototype.unique_id = z.prototype.unique_id = function() {
          return Ua(this.ptr);
        };
        z.prototype.__destroy__ = z.prototype.__destroy__ = function() {
          Va(this.ptr);
        };
        G.prototype = Object.create(v.prototype);
        G.prototype.constructor = G;
        G.prototype.__class__ = G;
        G.__cache__ = {};
        a.PointCloud = G;
        G.prototype.num_attributes = G.prototype.num_attributes = function() {
          return Wa(this.ptr);
        };
        G.prototype.num_points = G.prototype.num_points = function() {
          return Xa(this.ptr);
        };
        G.prototype.__destroy__ = G.prototype.__destroy__ = function() {
          Ya(this.ptr);
        };
        E.prototype = Object.create(v.prototype);
        E.prototype.constructor = E;
        E.prototype.__class__ = E;
        E.__cache__ = {};
        a.Mesh = E;
        E.prototype.num_faces = E.prototype.num_faces = function() {
          return Za(this.ptr);
        };
        E.prototype.num_attributes = E.prototype.num_attributes = function() {
          return $a(this.ptr);
        };
        E.prototype.num_points = E.prototype.num_points = function() {
          return ab(this.ptr);
        };
        E.prototype.set_num_points = E.prototype.set_num_points = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          bb(c, b);
        };
        E.prototype.__destroy__ = E.prototype.__destroy__ = function() {
          cb(this.ptr);
        };
        N.prototype = Object.create(v.prototype);
        N.prototype.constructor = N;
        N.prototype.__class__ = N;
        N.__cache__ = {};
        a.Metadata = N;
        N.prototype.__destroy__ = N.prototype.__destroy__ = function() {
          db(this.ptr);
        };
        H.prototype = Object.create(v.prototype);
        H.prototype.constructor = H;
        H.prototype.__class__ = H;
        H.__cache__ = {};
        a.DracoInt8Array = H;
        H.prototype.GetValue = H.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return eb(c, b);
        };
        H.prototype.size = H.prototype.size = function() {
          return fb(this.ptr);
        };
        H.prototype.__destroy__ = H.prototype.__destroy__ = function() {
          gb(this.ptr);
        };
        F.prototype = Object.create(v.prototype);
        F.prototype.constructor = F;
        F.prototype.__class__ = F;
        F.__cache__ = {};
        a.MetadataBuilder = F;
        F.prototype.AddStringEntry = F.prototype.AddStringEntry = function(b, c, d) {
          var e = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : J(c);
          d = d && "object" === typeof d ? d.ptr : J(d);
          return !!hb(e, b, c, d);
        };
        F.prototype.AddIntEntry = F.prototype.AddIntEntry = function(b, c, d) {
          var e = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : J(c);
          d && "object" === typeof d && (d = d.ptr);
          return !!ib(e, b, c, d);
        };
        F.prototype.AddIntEntryArray = F.prototype.AddIntEntryArray = function(b, c, d, e) {
          var g = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : J(c);
          "object" == typeof d && (d = V(d));
          e && "object" === typeof e && (e = e.ptr);
          return !!jb(g, b, c, d, e);
        };
        F.prototype.AddDoubleEntry = F.prototype.AddDoubleEntry = function(b, c, d) {
          var e = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : J(c);
          d && "object" === typeof d && (d = d.ptr);
          return !!kb(e, b, c, d);
        };
        F.prototype.__destroy__ = F.prototype.__destroy__ = function() {
          lb(this.ptr);
        };
        x.prototype = Object.create(v.prototype);
        x.prototype.constructor = x;
        x.prototype.__class__ = x;
        x.__cache__ = {};
        a.PointCloudBuilder = x;
        x.prototype.AddFloatAttribute = x.prototype.AddFloatAttribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Z(g));
          return mb(t, b, c, d, e, g);
        };
        x.prototype.AddInt8Attribute = x.prototype.AddInt8Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Q(g));
          return nb(t, b, c, d, e, g);
        };
        x.prototype.AddUInt8Attribute = x.prototype.AddUInt8Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Q(g));
          return ob(t, b, c, d, e, g);
        };
        x.prototype.AddInt16Attribute = x.prototype.AddInt16Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = R(g));
          return pb(t, b, c, d, e, g);
        };
        x.prototype.AddUInt16Attribute = x.prototype.AddUInt16Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = R(g));
          return qb(t, b, c, d, e, g);
        };
        x.prototype.AddInt32Attribute = x.prototype.AddInt32Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = V(g));
          return rb(
            t,
            b,
            c,
            d,
            e,
            g
          );
        };
        x.prototype.AddUInt32Attribute = x.prototype.AddUInt32Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = V(g));
          return sb(t, b, c, d, e, g);
        };
        x.prototype.AddMetadata = x.prototype.AddMetadata = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return !!tb(d, b, c);
        };
        x.prototype.SetMetadataForAttribute = x.prototype.SetMetadataForAttribute = function(b, c, d) {
          var e = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!ub(e, b, c, d);
        };
        x.prototype.__destroy__ = x.prototype.__destroy__ = function() {
          vb(this.ptr);
        };
        u.prototype = Object.create(v.prototype);
        u.prototype.constructor = u;
        u.prototype.__class__ = u;
        u.__cache__ = {};
        a.MeshBuilder = u;
        u.prototype.AddFacesToMesh = u.prototype.AddFacesToMesh = function(b, c, d) {
          var e = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          "object" == typeof d && (d = V(d));
          return !!wb(e, b, c, d);
        };
        u.prototype.AddFloatAttributeToMesh = u.prototype.AddFloatAttributeToMesh = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Z(g));
          return xb(t, b, c, d, e, g);
        };
        u.prototype.AddInt32AttributeToMesh = u.prototype.AddInt32AttributeToMesh = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = V(g));
          return yb(t, b, c, d, e, g);
        };
        u.prototype.AddMetadataToMesh = u.prototype.AddMetadataToMesh = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return !!zb(d, b, c);
        };
        u.prototype.AddFloatAttribute = u.prototype.AddFloatAttribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Z(g));
          return Ab(t, b, c, d, e, g);
        };
        u.prototype.AddInt8Attribute = u.prototype.AddInt8Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Q(g));
          return Bb(t, b, c, d, e, g);
        };
        u.prototype.AddUInt8Attribute = u.prototype.AddUInt8Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = Q(g));
          return Cb(t, b, c, d, e, g);
        };
        u.prototype.AddInt16Attribute = u.prototype.AddInt16Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = R(g));
          return Db(t, b, c, d, e, g);
        };
        u.prototype.AddUInt16Attribute = u.prototype.AddUInt16Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = R(g));
          return Eb(t, b, c, d, e, g);
        };
        u.prototype.AddInt32Attribute = u.prototype.AddInt32Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = V(g));
          return Fb(t, b, c, d, e, g);
        };
        u.prototype.AddUInt32Attribute = u.prototype.AddUInt32Attribute = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          e && "object" === typeof e && (e = e.ptr);
          "object" == typeof g && (g = V(g));
          return Gb(t, b, c, d, e, g);
        };
        u.prototype.AddMetadata = u.prototype.AddMetadata = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return !!Hb(d, b, c);
        };
        u.prototype.SetMetadataForAttribute = u.prototype.SetMetadataForAttribute = function(b, c, d) {
          var e = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!Ib(e, b, c, d);
        };
        u.prototype.__destroy__ = u.prototype.__destroy__ = function() {
          Jb(this.ptr);
        };
        y.prototype = Object.create(v.prototype);
        y.prototype.constructor = y;
        y.prototype.__class__ = y;
        y.__cache__ = {};
        a.Encoder = y;
        y.prototype.SetEncodingMethod = y.prototype.SetEncodingMethod = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          Kb(c, b);
        };
        y.prototype.SetAttributeQuantization = y.prototype.SetAttributeQuantization = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          Lb(d, b, c);
        };
        y.prototype.SetAttributeExplicitQuantization = y.prototype.SetAttributeExplicitQuantization = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          "object" == typeof e && (e = Z(e));
          g && "object" === typeof g && (g = g.ptr);
          Mb(t, b, c, d, e, g);
        };
        y.prototype.SetSpeedOptions = y.prototype.SetSpeedOptions = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          Nb(d, b, c);
        };
        y.prototype.SetTrackEncodedProperties = y.prototype.SetTrackEncodedProperties = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          Ob(c, b);
        };
        y.prototype.EncodeMeshToDracoBuffer = y.prototype.EncodeMeshToDracoBuffer = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return Pb(d, b, c);
        };
        y.prototype.EncodePointCloudToDracoBuffer = y.prototype.EncodePointCloudToDracoBuffer = function(b, c, d) {
          var e = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return Qb(e, b, c, d);
        };
        y.prototype.GetNumberOfEncodedPoints = y.prototype.GetNumberOfEncodedPoints = function() {
          return Rb(this.ptr);
        };
        y.prototype.GetNumberOfEncodedFaces = y.prototype.GetNumberOfEncodedFaces = function() {
          return Sb(this.ptr);
        };
        y.prototype.__destroy__ = y.prototype.__destroy__ = function() {
          Tb(this.ptr);
        };
        A.prototype = Object.create(v.prototype);
        A.prototype.constructor = A;
        A.prototype.__class__ = A;
        A.__cache__ = {};
        a.ExpertEncoder = A;
        A.prototype.SetEncodingMethod = A.prototype.SetEncodingMethod = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          Ub(c, b);
        };
        A.prototype.SetAttributeQuantization = A.prototype.SetAttributeQuantization = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          Vb(d, b, c);
        };
        A.prototype.SetAttributeExplicitQuantization = A.prototype.SetAttributeExplicitQuantization = function(b, c, d, e, g) {
          var t = this.ptr;
          n.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          "object" == typeof e && (e = Z(e));
          g && "object" === typeof g && (g = g.ptr);
          Wb(t, b, c, d, e, g);
        };
        A.prototype.SetSpeedOptions = A.prototype.SetSpeedOptions = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          Xb(d, b, c);
        };
        A.prototype.SetTrackEncodedProperties = A.prototype.SetTrackEncodedProperties = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          Yb(c, b);
        };
        A.prototype.EncodeToDracoBuffer = A.prototype.EncodeToDracoBuffer = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return Zb(d, b, c);
        };
        A.prototype.GetNumberOfEncodedPoints = A.prototype.GetNumberOfEncodedPoints = function() {
          return $b(this.ptr);
        };
        A.prototype.GetNumberOfEncodedFaces = A.prototype.GetNumberOfEncodedFaces = function() {
          return ac(this.ptr);
        };
        A.prototype.__destroy__ = A.prototype.__destroy__ = function() {
          bc(this.ptr);
        };
        (function() {
          function b() {
            a.INVALID = cc();
            a.POSITION = dc();
            a.NORMAL = ec();
            a.COLOR = fc();
            a.TEX_COORD = gc();
            a.GENERIC = hc();
            a.INVALID_GEOMETRY_TYPE = ic();
            a.POINT_CLOUD = jc();
            a.TRIANGULAR_MESH = kc();
            a.MESH_SEQUENTIAL_ENCODING = lc();
            a.MESH_EDGEBREAKER_ENCODING = mc();
          }
          qa ? b() : ka.unshift(b);
        })();
        if ("function" === typeof a.onModuleParsed)
          a.onModuleParsed();
        return p.ready;
      };
    }();
    "object" === typeof exports && "object" === typeof module ? module.exports = DracoEncoderModule : "function" === typeof define && define.amd ? define([], function() {
      return DracoEncoderModule;
    }) : "object" === typeof exports && (exports.DracoEncoderModule = DracoEncoderModule);
  }
});

// ../../node_modules/draco3dgltf/draco_decoder_gltf_nodejs.js
var require_draco_decoder_gltf_nodejs = __commonJS({
  "../../node_modules/draco3dgltf/draco_decoder_gltf_nodejs.js"(exports, module) {
    var $jscomp = $jscomp || {};
    $jscomp.scope = {};
    $jscomp.arrayIteratorImpl = function(h) {
      var n = 0;
      return function() {
        return n < h.length ? { done: false, value: h[n++] } : { done: true };
      };
    };
    $jscomp.arrayIterator = function(h) {
      return { next: $jscomp.arrayIteratorImpl(h) };
    };
    $jscomp.makeIterator = function(h) {
      var n = "undefined" != typeof Symbol && Symbol.iterator && h[Symbol.iterator];
      return n ? n.call(h) : $jscomp.arrayIterator(h);
    };
    $jscomp.ASSUME_ES5 = false;
    $jscomp.ASSUME_NO_NATIVE_MAP = false;
    $jscomp.ASSUME_NO_NATIVE_SET = false;
    $jscomp.SIMPLE_FROUND_POLYFILL = false;
    $jscomp.ISOLATE_POLYFILLS = false;
    $jscomp.FORCE_POLYFILL_PROMISE = false;
    $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = false;
    $jscomp.getGlobal = function(h) {
      h = ["object" == typeof globalThis && globalThis, h, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
      for (var n = 0; n < h.length; ++n) {
        var k = h[n];
        if (k && k.Math == Math)
          return k;
      }
      throw Error("Cannot find global object");
    };
    $jscomp.global = $jscomp.getGlobal(exports);
    $jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(h, n, k) {
      if (h == Array.prototype || h == Object.prototype)
        return h;
      h[n] = k.value;
      return h;
    };
    $jscomp.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
    $jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
    $jscomp.polyfills = {};
    $jscomp.propertyToPolyfillSymbol = {};
    $jscomp.POLYFILL_PREFIX = "$jscp$";
    $jscomp.polyfill = function(h, n, k, p) {
      n && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(h, n, k, p) : $jscomp.polyfillUnisolated(h, n, k, p));
    };
    $jscomp.polyfillUnisolated = function(h, n, k, p) {
      k = $jscomp.global;
      h = h.split(".");
      for (p = 0; p < h.length - 1; p++) {
        var l = h[p];
        if (!(l in k))
          return;
        k = k[l];
      }
      h = h[h.length - 1];
      p = k[h];
      n = n(p);
      n != p && null != n && $jscomp.defineProperty(k, h, { configurable: true, writable: true, value: n });
    };
    $jscomp.polyfillIsolated = function(h, n, k, p) {
      var l = h.split(".");
      h = 1 === l.length;
      p = l[0];
      p = !h && p in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
      for (var y = 0; y < l.length - 1; y++) {
        var f = l[y];
        if (!(f in p))
          return;
        p = p[f];
      }
      l = l[l.length - 1];
      k = $jscomp.IS_SYMBOL_NATIVE && "es6" === k ? p[l] : null;
      n = n(k);
      null != n && (h ? $jscomp.defineProperty($jscomp.polyfills, l, { configurable: true, writable: true, value: n }) : n !== k && (void 0 === $jscomp.propertyToPolyfillSymbol[l] && (k = 1e9 * Math.random() >>> 0, $jscomp.propertyToPolyfillSymbol[l] = $jscomp.IS_SYMBOL_NATIVE ? $jscomp.global.Symbol(l) : $jscomp.POLYFILL_PREFIX + k + "$" + l), $jscomp.defineProperty(p, $jscomp.propertyToPolyfillSymbol[l], { configurable: true, writable: true, value: n })));
    };
    $jscomp.polyfill("Promise", function(h) {
      function n() {
        this.batch_ = null;
      }
      function k(f) {
        return f instanceof l ? f : new l(function(q, u) {
          q(f);
        });
      }
      if (h && (!($jscomp.FORCE_POLYFILL_PROMISE || $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION && "undefined" === typeof $jscomp.global.PromiseRejectionEvent) || !$jscomp.global.Promise || -1 === $jscomp.global.Promise.toString().indexOf("[native code]")))
        return h;
      n.prototype.asyncExecute = function(f) {
        if (null == this.batch_) {
          this.batch_ = [];
          var q = this;
          this.asyncExecuteFunction(function() {
            q.executeBatch_();
          });
        }
        this.batch_.push(f);
      };
      var p = $jscomp.global.setTimeout;
      n.prototype.asyncExecuteFunction = function(f) {
        p(f, 0);
      };
      n.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length; ) {
          var f = this.batch_;
          this.batch_ = [];
          for (var q = 0; q < f.length; ++q) {
            var u = f[q];
            f[q] = null;
            try {
              u();
            } catch (A) {
              this.asyncThrow_(A);
            }
          }
        }
        this.batch_ = null;
      };
      n.prototype.asyncThrow_ = function(f) {
        this.asyncExecuteFunction(function() {
          throw f;
        });
      };
      var l = function(f) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        this.isRejectionHandled_ = false;
        var q = this.createResolveAndReject_();
        try {
          f(q.resolve, q.reject);
        } catch (u) {
          q.reject(u);
        }
      };
      l.prototype.createResolveAndReject_ = function() {
        function f(A) {
          return function(F) {
            u || (u = true, A.call(q, F));
          };
        }
        var q = this, u = false;
        return { resolve: f(this.resolveTo_), reject: f(this.reject_) };
      };
      l.prototype.resolveTo_ = function(f) {
        if (f === this)
          this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (f instanceof l)
          this.settleSameAsPromise_(f);
        else {
          a:
            switch (typeof f) {
              case "object":
                var q = null != f;
                break a;
              case "function":
                q = true;
                break a;
              default:
                q = false;
            }
          q ? this.resolveToNonPromiseObj_(f) : this.fulfill_(f);
        }
      };
      l.prototype.resolveToNonPromiseObj_ = function(f) {
        var q = void 0;
        try {
          q = f.then;
        } catch (u) {
          this.reject_(u);
          return;
        }
        "function" == typeof q ? this.settleSameAsThenable_(q, f) : this.fulfill_(f);
      };
      l.prototype.reject_ = function(f) {
        this.settle_(2, f);
      };
      l.prototype.fulfill_ = function(f) {
        this.settle_(1, f);
      };
      l.prototype.settle_ = function(f, q) {
        if (0 != this.state_)
          throw Error("Cannot settle(" + f + ", " + q + "): Promise already settled in state" + this.state_);
        this.state_ = f;
        this.result_ = q;
        2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
        this.executeOnSettledCallbacks_();
      };
      l.prototype.scheduleUnhandledRejectionCheck_ = function() {
        var f = this;
        p(function() {
          if (f.notifyUnhandledRejection_()) {
            var q = $jscomp.global.console;
            "undefined" !== typeof q && q.error(f.result_);
          }
        }, 1);
      };
      l.prototype.notifyUnhandledRejection_ = function() {
        if (this.isRejectionHandled_)
          return false;
        var f = $jscomp.global.CustomEvent, q = $jscomp.global.Event, u = $jscomp.global.dispatchEvent;
        if ("undefined" === typeof u)
          return true;
        "function" === typeof f ? f = new f("unhandledrejection", { cancelable: true }) : "function" === typeof q ? f = new q("unhandledrejection", { cancelable: true }) : (f = $jscomp.global.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", false, true, f));
        f.promise = this;
        f.reason = this.result_;
        return u(f);
      };
      l.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
          for (var f = 0; f < this.onSettledCallbacks_.length; ++f)
            y.asyncExecute(this.onSettledCallbacks_[f]);
          this.onSettledCallbacks_ = null;
        }
      };
      var y = new n();
      l.prototype.settleSameAsPromise_ = function(f) {
        var q = this.createResolveAndReject_();
        f.callWhenSettled_(q.resolve, q.reject);
      };
      l.prototype.settleSameAsThenable_ = function(f, q) {
        var u = this.createResolveAndReject_();
        try {
          f.call(q, u.resolve, u.reject);
        } catch (A) {
          u.reject(A);
        }
      };
      l.prototype.then = function(f, q) {
        function u(w, B) {
          return "function" == typeof w ? function(R) {
            try {
              A(w(R));
            } catch (Z) {
              F(Z);
            }
          } : B;
        }
        var A, F, v = new l(function(w, B) {
          A = w;
          F = B;
        });
        this.callWhenSettled_(u(f, A), u(q, F));
        return v;
      };
      l.prototype.catch = function(f) {
        return this.then(void 0, f);
      };
      l.prototype.callWhenSettled_ = function(f, q) {
        function u() {
          switch (A.state_) {
            case 1:
              f(A.result_);
              break;
            case 2:
              q(A.result_);
              break;
            default:
              throw Error("Unexpected state: " + A.state_);
          }
        }
        var A = this;
        null == this.onSettledCallbacks_ ? y.asyncExecute(u) : this.onSettledCallbacks_.push(u);
        this.isRejectionHandled_ = true;
      };
      l.resolve = k;
      l.reject = function(f) {
        return new l(function(q, u) {
          u(f);
        });
      };
      l.race = function(f) {
        return new l(function(q, u) {
          for (var A = $jscomp.makeIterator(f), F = A.next(); !F.done; F = A.next())
            k(F.value).callWhenSettled_(q, u);
        });
      };
      l.all = function(f) {
        var q = $jscomp.makeIterator(f), u = q.next();
        return u.done ? k([]) : new l(function(A, F) {
          function v(R) {
            return function(Z) {
              w[R] = Z;
              B--;
              0 == B && A(w);
            };
          }
          var w = [], B = 0;
          do
            w.push(void 0), B++, k(u.value).callWhenSettled_(v(w.length - 1), F), u = q.next();
          while (!u.done);
        });
      };
      return l;
    }, "es6", "es3");
    $jscomp.owns = function(h, n) {
      return Object.prototype.hasOwnProperty.call(h, n);
    };
    $jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.assign ? Object.assign : function(h, n) {
      for (var k = 1; k < arguments.length; k++) {
        var p = arguments[k];
        if (p)
          for (var l in p)
            $jscomp.owns(p, l) && (h[l] = p[l]);
      }
      return h;
    };
    $jscomp.polyfill("Object.assign", function(h) {
      return h || $jscomp.assign;
    }, "es6", "es3");
    $jscomp.checkStringArgs = function(h, n, k) {
      if (null == h)
        throw new TypeError("The 'this' value for String.prototype." + k + " must not be null or undefined");
      if (n instanceof RegExp)
        throw new TypeError("First argument to String.prototype." + k + " must not be a regular expression");
      return h + "";
    };
    $jscomp.polyfill("String.prototype.startsWith", function(h) {
      return h ? h : function(n, k) {
        var p = $jscomp.checkStringArgs(this, n, "startsWith");
        n += "";
        var l = p.length, y = n.length;
        k = Math.max(0, Math.min(k | 0, p.length));
        for (var f = 0; f < y && k < l; )
          if (p[k++] != n[f++])
            return false;
        return f >= y;
      };
    }, "es6", "es3");
    $jscomp.polyfill("Array.prototype.copyWithin", function(h) {
      function n(k) {
        k = Number(k);
        return Infinity === k || -Infinity === k ? k : k | 0;
      }
      return h ? h : function(k, p, l) {
        var y = this.length;
        k = n(k);
        p = n(p);
        l = void 0 === l ? y : n(l);
        k = 0 > k ? Math.max(y + k, 0) : Math.min(k, y);
        p = 0 > p ? Math.max(y + p, 0) : Math.min(p, y);
        l = 0 > l ? Math.max(y + l, 0) : Math.min(l, y);
        if (k < p)
          for (; p < l; )
            p in this ? this[k++] = this[p++] : (delete this[k++], p++);
        else
          for (l = Math.min(l, y + p - k), k += l - p; l > p; )
            --l in this ? this[--k] = this[l] : delete this[--k];
        return this;
      };
    }, "es6", "es3");
    $jscomp.typedArrayCopyWithin = function(h) {
      return h ? h : Array.prototype.copyWithin;
    };
    $jscomp.polyfill("Int8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint8Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint8ClampedArray.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Int16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint16Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Int32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Uint32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Float32Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    $jscomp.polyfill("Float64Array.prototype.copyWithin", $jscomp.typedArrayCopyWithin, "es6", "es5");
    var DracoDecoderModule = function() {
      var h = "undefined" !== typeof document && document.currentScript ? document.currentScript.src : void 0;
      "undefined" !== typeof __filename && (h = h || __filename);
      return function(n) {
        function k(e) {
          return a.locateFile ? a.locateFile(e, U) : U + e;
        }
        function p(e, b) {
          if (e) {
            var c = ia;
            var d = e + b;
            for (b = e; c[b] && !(b >= d); )
              ++b;
            if (16 < b - e && c.buffer && ra)
              c = ra.decode(c.subarray(e, b));
            else {
              for (d = ""; e < b; ) {
                var g = c[e++];
                if (g & 128) {
                  var t = c[e++] & 63;
                  if (192 == (g & 224))
                    d += String.fromCharCode((g & 31) << 6 | t);
                  else {
                    var aa = c[e++] & 63;
                    g = 224 == (g & 240) ? (g & 15) << 12 | t << 6 | aa : (g & 7) << 18 | t << 12 | aa << 6 | c[e++] & 63;
                    65536 > g ? d += String.fromCharCode(g) : (g -= 65536, d += String.fromCharCode(55296 | g >> 10, 56320 | g & 1023));
                  }
                } else
                  d += String.fromCharCode(g);
              }
              c = d;
            }
          } else
            c = "";
          return c;
        }
        function l() {
          var e = ja.buffer;
          a.HEAP8 = W = new Int8Array(e);
          a.HEAP16 = new Int16Array(e);
          a.HEAP32 = ca = new Int32Array(e);
          a.HEAPU8 = ia = new Uint8Array(e);
          a.HEAPU16 = new Uint16Array(e);
          a.HEAPU32 = Y = new Uint32Array(e);
          a.HEAPF32 = new Float32Array(e);
          a.HEAPF64 = new Float64Array(e);
        }
        function y(e) {
          if (a.onAbort)
            a.onAbort(e);
          e = "Aborted(" + e + ")";
          da(e);
          sa = true;
          e = new WebAssembly.RuntimeError(e + ". Build with -sASSERTIONS for more info.");
          ka(e);
          throw e;
        }
        function f(e) {
          try {
            if (e == P && ea)
              return new Uint8Array(ea);
            if (ma)
              return ma(e);
            throw "both async and sync fetching of the wasm failed";
          } catch (b) {
            y(b);
          }
        }
        function q() {
          if (!ea && (ta || fa)) {
            if ("function" == typeof fetch && !P.startsWith("file://"))
              return fetch(P, { credentials: "same-origin" }).then(function(e) {
                if (!e.ok)
                  throw "failed to load wasm binary file at '" + P + "'";
                return e.arrayBuffer();
              }).catch(function() {
                return f(P);
              });
            if (na)
              return new Promise(function(e, b) {
                na(P, function(c) {
                  e(new Uint8Array(c));
                }, b);
              });
          }
          return Promise.resolve().then(function() {
            return f(P);
          });
        }
        function u(e) {
          for (; 0 < e.length; )
            e.shift()(a);
        }
        function A(e) {
          this.excPtr = e;
          this.ptr = e - 24;
          this.set_type = function(b) {
            Y[this.ptr + 4 >> 2] = b;
          };
          this.get_type = function() {
            return Y[this.ptr + 4 >> 2];
          };
          this.set_destructor = function(b) {
            Y[this.ptr + 8 >> 2] = b;
          };
          this.get_destructor = function() {
            return Y[this.ptr + 8 >> 2];
          };
          this.set_refcount = function(b) {
            ca[this.ptr >> 2] = b;
          };
          this.set_caught = function(b) {
            W[this.ptr + 12 >> 0] = b ? 1 : 0;
          };
          this.get_caught = function() {
            return 0 != W[this.ptr + 12 >> 0];
          };
          this.set_rethrown = function(b) {
            W[this.ptr + 13 >> 0] = b ? 1 : 0;
          };
          this.get_rethrown = function() {
            return 0 != W[this.ptr + 13 >> 0];
          };
          this.init = function(b, c) {
            this.set_adjusted_ptr(0);
            this.set_type(b);
            this.set_destructor(c);
            this.set_refcount(0);
            this.set_caught(false);
            this.set_rethrown(false);
          };
          this.add_ref = function() {
            ca[this.ptr >> 2] += 1;
          };
          this.release_ref = function() {
            var b = ca[this.ptr >> 2];
            ca[this.ptr >> 2] = b - 1;
            return 1 === b;
          };
          this.set_adjusted_ptr = function(b) {
            Y[this.ptr + 16 >> 2] = b;
          };
          this.get_adjusted_ptr = function() {
            return Y[this.ptr + 16 >> 2];
          };
          this.get_exception_ptr = function() {
            if (ua(this.get_type()))
              return Y[this.excPtr >> 2];
            var b = this.get_adjusted_ptr();
            return 0 !== b ? b : this.excPtr;
          };
        }
        function F() {
          function e() {
            if (!la && (la = true, a.calledRun = true, !sa)) {
              va = true;
              u(oa);
              wa(a);
              if (a.onRuntimeInitialized)
                a.onRuntimeInitialized();
              if (a.postRun)
                for ("function" == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; )
                  xa.unshift(a.postRun.shift());
              u(xa);
            }
          }
          if (!(0 < ba)) {
            if (a.preRun)
              for ("function" == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; )
                ya.unshift(a.preRun.shift());
            u(ya);
            0 < ba || (a.setStatus ? (a.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                a.setStatus("");
              }, 1);
              e();
            }, 1)) : e());
          }
        }
        function v() {
        }
        function w(e) {
          return (e || v).__cache__;
        }
        function B(e, b) {
          var c = w(b), d = c[e];
          if (d)
            return d;
          d = Object.create((b || v).prototype);
          d.ptr = e;
          return c[e] = d;
        }
        function R(e) {
          if ("string" === typeof e) {
            for (var b = 0, c = 0; c < e.length; ++c) {
              var d = e.charCodeAt(c);
              127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
            }
            b = Array(b + 1);
            c = 0;
            d = b.length;
            if (0 < d) {
              d = c + d - 1;
              for (var g = 0; g < e.length; ++g) {
                var t = e.charCodeAt(g);
                if (55296 <= t && 57343 >= t) {
                  var aa = e.charCodeAt(++g);
                  t = 65536 + ((t & 1023) << 10) | aa & 1023;
                }
                if (127 >= t) {
                  if (c >= d)
                    break;
                  b[c++] = t;
                } else {
                  if (2047 >= t) {
                    if (c + 1 >= d)
                      break;
                    b[c++] = 192 | t >> 6;
                  } else {
                    if (65535 >= t) {
                      if (c + 2 >= d)
                        break;
                      b[c++] = 224 | t >> 12;
                    } else {
                      if (c + 3 >= d)
                        break;
                      b[c++] = 240 | t >> 18;
                      b[c++] = 128 | t >> 12 & 63;
                    }
                    b[c++] = 128 | t >> 6 & 63;
                  }
                  b[c++] = 128 | t & 63;
                }
              }
              b[c] = 0;
            }
            e = r.alloc(b, W);
            r.copy(b, W, e);
            return e;
          }
          return e;
        }
        function Z(e) {
          if ("object" === typeof e) {
            var b = r.alloc(e, W);
            r.copy(e, W, b);
            return b;
          }
          return e;
        }
        function X() {
          throw "cannot construct a VoidPtr, no constructor in IDL";
        }
        function S() {
          this.ptr = za();
          w(S)[this.ptr] = this;
        }
        function Q() {
          this.ptr = Aa();
          w(Q)[this.ptr] = this;
        }
        function V() {
          this.ptr = Ba();
          w(V)[this.ptr] = this;
        }
        function x() {
          this.ptr = Ca();
          w(x)[this.ptr] = this;
        }
        function D() {
          this.ptr = Da();
          w(D)[this.ptr] = this;
        }
        function G() {
          this.ptr = Ea();
          w(G)[this.ptr] = this;
        }
        function H() {
          this.ptr = Fa();
          w(H)[this.ptr] = this;
        }
        function E() {
          this.ptr = Ga();
          w(E)[this.ptr] = this;
        }
        function T() {
          this.ptr = Ha();
          w(T)[this.ptr] = this;
        }
        function C() {
          throw "cannot construct a Status, no constructor in IDL";
        }
        function I() {
          this.ptr = Ia();
          w(I)[this.ptr] = this;
        }
        function J() {
          this.ptr = Ja();
          w(J)[this.ptr] = this;
        }
        function K() {
          this.ptr = Ka();
          w(K)[this.ptr] = this;
        }
        function L() {
          this.ptr = La();
          w(L)[this.ptr] = this;
        }
        function M() {
          this.ptr = Ma();
          w(M)[this.ptr] = this;
        }
        function N() {
          this.ptr = Na();
          w(N)[this.ptr] = this;
        }
        function O() {
          this.ptr = Oa();
          w(O)[this.ptr] = this;
        }
        function z() {
          this.ptr = Pa();
          w(z)[this.ptr] = this;
        }
        function m() {
          this.ptr = Qa();
          w(m)[this.ptr] = this;
        }
        n = void 0 === n ? {} : n;
        var a = "undefined" != typeof n ? n : {}, wa, ka;
        a.ready = new Promise(function(e, b) {
          wa = e;
          ka = b;
        });
        var Ra = false, Sa = false;
        a.onRuntimeInitialized = function() {
          Ra = true;
          if (Sa && "function" === typeof a.onModuleLoaded)
            a.onModuleLoaded(a);
        };
        a.onModuleParsed = function() {
          Sa = true;
          if (Ra && "function" === typeof a.onModuleLoaded)
            a.onModuleLoaded(a);
        };
        a.isVersionSupported = function(e) {
          if ("string" !== typeof e)
            return false;
          e = e.split(".");
          return 2 > e.length || 3 < e.length ? false : 1 == e[0] && 0 <= e[1] && 5 >= e[1] ? true : 0 != e[0] || 10 < e[1] ? false : true;
        };
        var Ta = Object.assign({}, a), ta = "object" == typeof window, fa = "function" == typeof importScripts, Ua = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, U = "";
        if (Ua) {
          var Va = require_fs(), pa = require_path();
          U = fa ? pa.dirname(U) + "/" : __dirname + "/";
          var Wa = function(e, b) {
            e = e.startsWith("file://") ? new URL(e) : pa.normalize(e);
            return Va.readFileSync(e, b ? void 0 : "utf8");
          };
          var ma = function(e) {
            e = Wa(e, true);
            e.buffer || (e = new Uint8Array(e));
            return e;
          };
          var na = function(e, b, c) {
            e = e.startsWith("file://") ? new URL(e) : pa.normalize(e);
            Va.readFile(e, function(d, g) {
              d ? c(d) : b(g.buffer);
            });
          };
          1 < process.argv.length && process.argv[1].replace(/\\/g, "/");
          process.argv.slice(2);
          a.inspect = function() {
            return "[Emscripten Module object]";
          };
        } else if (ta || fa)
          fa ? U = self.location.href : "undefined" != typeof document && document.currentScript && (U = document.currentScript.src), h && (U = h), U = 0 !== U.indexOf("blob:") ? U.substr(0, U.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", Wa = function(e) {
            var b = new XMLHttpRequest();
            b.open(
              "GET",
              e,
              false
            );
            b.send(null);
            return b.responseText;
          }, fa && (ma = function(e) {
            var b = new XMLHttpRequest();
            b.open("GET", e, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }), na = function(e, b, c) {
            var d = new XMLHttpRequest();
            d.open("GET", e, true);
            d.responseType = "arraybuffer";
            d.onload = function() {
              200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
            };
            d.onerror = c;
            d.send(null);
          };
        a.print || console.log.bind(console);
        var da = a.printErr || console.warn.bind(console);
        Object.assign(a, Ta);
        Ta = null;
        var ea;
        a.wasmBinary && (ea = a.wasmBinary);
        "object" != typeof WebAssembly && y("no native wasm support detected");
        var ja, sa = false, ra = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, W, ia, ca, Y, ya = [], oa = [], xa = [], va = false, ba = 0, qa = null, ha = null;
        var P = "draco_decoder_gltf.wasm";
        P.startsWith("data:application/octet-stream;base64,") || (P = k(P));
        var pd = 0, qd = { b: function(e, b, c) {
          new A(e).init(b, c);
          pd++;
          throw e;
        }, a: function() {
          y("");
        }, d: function(e, b, c) {
          ia.copyWithin(e, b, b + c);
        }, c: function(e) {
          var b = ia.length;
          e >>>= 0;
          if (2147483648 < e)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, e + 100663296);
            var g = Math;
            d = Math.max(e, d);
            g = g.min.call(g, 2147483648, d + (65536 - d % 65536) % 65536);
            a: {
              d = ja.buffer;
              try {
                ja.grow(g - d.byteLength + 65535 >>> 16);
                l();
                var t = 1;
                break a;
              } catch (aa) {
              }
              t = void 0;
            }
            if (t)
              return true;
          }
          return false;
        } };
        (function() {
          function e(g, t) {
            a.asm = g.exports;
            ja = a.asm.e;
            l();
            oa.unshift(a.asm.f);
            ba--;
            a.monitorRunDependencies && a.monitorRunDependencies(ba);
            0 == ba && (null !== qa && (clearInterval(qa), qa = null), ha && (g = ha, ha = null, g()));
          }
          function b(g) {
            e(g.instance);
          }
          function c(g) {
            return q().then(function(t) {
              return WebAssembly.instantiate(t, d);
            }).then(function(t) {
              return t;
            }).then(g, function(t) {
              da("failed to asynchronously prepare wasm: " + t);
              y(t);
            });
          }
          var d = { a: qd };
          ba++;
          a.monitorRunDependencies && a.monitorRunDependencies(ba);
          if (a.instantiateWasm)
            try {
              return a.instantiateWasm(d, e);
            } catch (g) {
              da("Module.instantiateWasm callback failed with error: " + g), ka(g);
            }
          (function() {
            return ea || "function" != typeof WebAssembly.instantiateStreaming || P.startsWith("data:application/octet-stream;base64,") || P.startsWith("file://") || Ua || "function" != typeof fetch ? c(b) : fetch(P, { credentials: "same-origin" }).then(function(g) {
              return WebAssembly.instantiateStreaming(g, d).then(b, function(t) {
                da("wasm streaming compile failed: " + t);
                da("falling back to ArrayBuffer instantiation");
                return c(b);
              });
            });
          })().catch(ka);
          return {};
        })();
        var Xa = a._emscripten_bind_VoidPtr___destroy___0 = function() {
          return (Xa = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.h).apply(null, arguments);
        }, za = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = function() {
          return (za = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = a.asm.i).apply(null, arguments);
        }, Ya = a._emscripten_bind_DecoderBuffer_Init_2 = function() {
          return (Ya = a._emscripten_bind_DecoderBuffer_Init_2 = a.asm.j).apply(null, arguments);
        }, Za = a._emscripten_bind_DecoderBuffer___destroy___0 = function() {
          return (Za = a._emscripten_bind_DecoderBuffer___destroy___0 = a.asm.k).apply(null, arguments);
        }, Aa = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = function() {
          return (Aa = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = a.asm.l).apply(null, arguments);
        }, $a = a._emscripten_bind_AttributeTransformData_transform_type_0 = function() {
          return ($a = a._emscripten_bind_AttributeTransformData_transform_type_0 = a.asm.m).apply(null, arguments);
        }, ab = a._emscripten_bind_AttributeTransformData___destroy___0 = function() {
          return (ab = a._emscripten_bind_AttributeTransformData___destroy___0 = a.asm.n).apply(null, arguments);
        }, Ba = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function() {
          return (Ba = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.o).apply(null, arguments);
        }, bb = a._emscripten_bind_GeometryAttribute___destroy___0 = function() {
          return (bb = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.p).apply(null, arguments);
        }, Ca = a._emscripten_bind_PointAttribute_PointAttribute_0 = function() {
          return (Ca = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.q).apply(null, arguments);
        }, cb = a._emscripten_bind_PointAttribute_size_0 = function() {
          return (cb = a._emscripten_bind_PointAttribute_size_0 = a.asm.r).apply(null, arguments);
        }, db = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = function() {
          return (db = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = a.asm.s).apply(null, arguments);
        }, eb = a._emscripten_bind_PointAttribute_attribute_type_0 = function() {
          return (eb = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.t).apply(null, arguments);
        }, fb = a._emscripten_bind_PointAttribute_data_type_0 = function() {
          return (fb = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.u).apply(null, arguments);
        }, gb = a._emscripten_bind_PointAttribute_num_components_0 = function() {
          return (gb = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.v).apply(null, arguments);
        }, hb = a._emscripten_bind_PointAttribute_normalized_0 = function() {
          return (hb = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.w).apply(null, arguments);
        }, ib = a._emscripten_bind_PointAttribute_byte_stride_0 = function() {
          return (ib = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.x).apply(null, arguments);
        }, jb = a._emscripten_bind_PointAttribute_byte_offset_0 = function() {
          return (jb = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.y).apply(null, arguments);
        }, kb = a._emscripten_bind_PointAttribute_unique_id_0 = function() {
          return (kb = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.z).apply(null, arguments);
        }, lb = a._emscripten_bind_PointAttribute___destroy___0 = function() {
          return (lb = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.A).apply(null, arguments);
        }, Da = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = function() {
          return (Da = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = a.asm.B).apply(null, arguments);
        }, mb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = function() {
          return (mb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = a.asm.C).apply(null, arguments);
        }, nb = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = function() {
          return (nb = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = a.asm.D).apply(null, arguments);
        }, ob = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = function() {
          return (ob = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = a.asm.E).apply(null, arguments);
        }, pb = a._emscripten_bind_AttributeQuantizationTransform_range_0 = function() {
          return (pb = a._emscripten_bind_AttributeQuantizationTransform_range_0 = a.asm.F).apply(null, arguments);
        }, qb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = function() {
          return (qb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = a.asm.G).apply(null, arguments);
        }, Ea = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = function() {
          return (Ea = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = a.asm.H).apply(null, arguments);
        }, rb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = function() {
          return (rb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = a.asm.I).apply(null, arguments);
        }, sb = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = function() {
          return (sb = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = a.asm.J).apply(null, arguments);
        }, tb = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = function() {
          return (tb = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = a.asm.K).apply(null, arguments);
        }, Fa = a._emscripten_bind_PointCloud_PointCloud_0 = function() {
          return (Fa = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.L).apply(null, arguments);
        }, ub = a._emscripten_bind_PointCloud_num_attributes_0 = function() {
          return (ub = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.M).apply(null, arguments);
        }, vb = a._emscripten_bind_PointCloud_num_points_0 = function() {
          return (vb = a._emscripten_bind_PointCloud_num_points_0 = a.asm.N).apply(
            null,
            arguments
          );
        }, wb = a._emscripten_bind_PointCloud___destroy___0 = function() {
          return (wb = a._emscripten_bind_PointCloud___destroy___0 = a.asm.O).apply(null, arguments);
        }, Ga = a._emscripten_bind_Mesh_Mesh_0 = function() {
          return (Ga = a._emscripten_bind_Mesh_Mesh_0 = a.asm.P).apply(null, arguments);
        }, xb = a._emscripten_bind_Mesh_num_faces_0 = function() {
          return (xb = a._emscripten_bind_Mesh_num_faces_0 = a.asm.Q).apply(null, arguments);
        }, yb = a._emscripten_bind_Mesh_num_attributes_0 = function() {
          return (yb = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.R).apply(null, arguments);
        }, zb = a._emscripten_bind_Mesh_num_points_0 = function() {
          return (zb = a._emscripten_bind_Mesh_num_points_0 = a.asm.S).apply(null, arguments);
        }, Ab = a._emscripten_bind_Mesh___destroy___0 = function() {
          return (Ab = a._emscripten_bind_Mesh___destroy___0 = a.asm.T).apply(null, arguments);
        }, Ha = a._emscripten_bind_Metadata_Metadata_0 = function() {
          return (Ha = a._emscripten_bind_Metadata_Metadata_0 = a.asm.U).apply(null, arguments);
        }, Bb = a._emscripten_bind_Metadata___destroy___0 = function() {
          return (Bb = a._emscripten_bind_Metadata___destroy___0 = a.asm.V).apply(null, arguments);
        }, Cb = a._emscripten_bind_Status_code_0 = function() {
          return (Cb = a._emscripten_bind_Status_code_0 = a.asm.W).apply(null, arguments);
        }, Db = a._emscripten_bind_Status_ok_0 = function() {
          return (Db = a._emscripten_bind_Status_ok_0 = a.asm.X).apply(null, arguments);
        }, Eb = a._emscripten_bind_Status_error_msg_0 = function() {
          return (Eb = a._emscripten_bind_Status_error_msg_0 = a.asm.Y).apply(null, arguments);
        }, Fb = a._emscripten_bind_Status___destroy___0 = function() {
          return (Fb = a._emscripten_bind_Status___destroy___0 = a.asm.Z).apply(null, arguments);
        }, Ia = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = function() {
          return (Ia = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = a.asm._).apply(null, arguments);
        }, Gb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = function() {
          return (Gb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = a.asm.$).apply(null, arguments);
        }, Hb = a._emscripten_bind_DracoFloat32Array_size_0 = function() {
          return (Hb = a._emscripten_bind_DracoFloat32Array_size_0 = a.asm.aa).apply(null, arguments);
        }, Ib = a._emscripten_bind_DracoFloat32Array___destroy___0 = function() {
          return (Ib = a._emscripten_bind_DracoFloat32Array___destroy___0 = a.asm.ba).apply(null, arguments);
        }, Ja = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function() {
          return (Ja = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.ca).apply(null, arguments);
        }, Jb = a._emscripten_bind_DracoInt8Array_GetValue_1 = function() {
          return (Jb = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.da).apply(null, arguments);
        }, Kb = a._emscripten_bind_DracoInt8Array_size_0 = function() {
          return (Kb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.ea).apply(null, arguments);
        }, Lb = a._emscripten_bind_DracoInt8Array___destroy___0 = function() {
          return (Lb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.fa).apply(null, arguments);
        }, Ka = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = function() {
          return (Ka = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = a.asm.ga).apply(null, arguments);
        }, Mb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = function() {
          return (Mb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = a.asm.ha).apply(null, arguments);
        }, Nb = a._emscripten_bind_DracoUInt8Array_size_0 = function() {
          return (Nb = a._emscripten_bind_DracoUInt8Array_size_0 = a.asm.ia).apply(null, arguments);
        }, Ob = a._emscripten_bind_DracoUInt8Array___destroy___0 = function() {
          return (Ob = a._emscripten_bind_DracoUInt8Array___destroy___0 = a.asm.ja).apply(null, arguments);
        }, La = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = function() {
          return (La = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = a.asm.ka).apply(null, arguments);
        }, Pb = a._emscripten_bind_DracoInt16Array_GetValue_1 = function() {
          return (Pb = a._emscripten_bind_DracoInt16Array_GetValue_1 = a.asm.la).apply(null, arguments);
        }, Qb = a._emscripten_bind_DracoInt16Array_size_0 = function() {
          return (Qb = a._emscripten_bind_DracoInt16Array_size_0 = a.asm.ma).apply(null, arguments);
        }, Rb = a._emscripten_bind_DracoInt16Array___destroy___0 = function() {
          return (Rb = a._emscripten_bind_DracoInt16Array___destroy___0 = a.asm.na).apply(null, arguments);
        }, Ma = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = function() {
          return (Ma = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = a.asm.oa).apply(null, arguments);
        }, Sb = a._emscripten_bind_DracoUInt16Array_GetValue_1 = function() {
          return (Sb = a._emscripten_bind_DracoUInt16Array_GetValue_1 = a.asm.pa).apply(null, arguments);
        }, Tb = a._emscripten_bind_DracoUInt16Array_size_0 = function() {
          return (Tb = a._emscripten_bind_DracoUInt16Array_size_0 = a.asm.qa).apply(null, arguments);
        }, Ub = a._emscripten_bind_DracoUInt16Array___destroy___0 = function() {
          return (Ub = a._emscripten_bind_DracoUInt16Array___destroy___0 = a.asm.ra).apply(null, arguments);
        }, Na = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = function() {
          return (Na = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = a.asm.sa).apply(null, arguments);
        }, Vb = a._emscripten_bind_DracoInt32Array_GetValue_1 = function() {
          return (Vb = a._emscripten_bind_DracoInt32Array_GetValue_1 = a.asm.ta).apply(null, arguments);
        }, Wb = a._emscripten_bind_DracoInt32Array_size_0 = function() {
          return (Wb = a._emscripten_bind_DracoInt32Array_size_0 = a.asm.ua).apply(null, arguments);
        }, Xb = a._emscripten_bind_DracoInt32Array___destroy___0 = function() {
          return (Xb = a._emscripten_bind_DracoInt32Array___destroy___0 = a.asm.va).apply(null, arguments);
        }, Oa = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = function() {
          return (Oa = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = a.asm.wa).apply(null, arguments);
        }, Yb = a._emscripten_bind_DracoUInt32Array_GetValue_1 = function() {
          return (Yb = a._emscripten_bind_DracoUInt32Array_GetValue_1 = a.asm.xa).apply(null, arguments);
        }, Zb = a._emscripten_bind_DracoUInt32Array_size_0 = function() {
          return (Zb = a._emscripten_bind_DracoUInt32Array_size_0 = a.asm.ya).apply(null, arguments);
        }, $b = a._emscripten_bind_DracoUInt32Array___destroy___0 = function() {
          return ($b = a._emscripten_bind_DracoUInt32Array___destroy___0 = a.asm.za).apply(null, arguments);
        }, Pa = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = function() {
          return (Pa = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = a.asm.Aa).apply(null, arguments);
        }, ac = a._emscripten_bind_MetadataQuerier_HasEntry_2 = function() {
          return (ac = a._emscripten_bind_MetadataQuerier_HasEntry_2 = a.asm.Ba).apply(null, arguments);
        }, bc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = function() {
          return (bc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = a.asm.Ca).apply(null, arguments);
        }, cc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = function() {
          return (cc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = a.asm.Da).apply(null, arguments);
        }, dc = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = function() {
          return (dc = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = a.asm.Ea).apply(null, arguments);
        }, ec = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = function() {
          return (ec = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = a.asm.Fa).apply(
            null,
            arguments
          );
        }, fc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = function() {
          return (fc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = a.asm.Ga).apply(null, arguments);
        }, gc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = function() {
          return (gc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = a.asm.Ha).apply(null, arguments);
        }, hc = a._emscripten_bind_MetadataQuerier___destroy___0 = function() {
          return (hc = a._emscripten_bind_MetadataQuerier___destroy___0 = a.asm.Ia).apply(null, arguments);
        }, Qa = a._emscripten_bind_Decoder_Decoder_0 = function() {
          return (Qa = a._emscripten_bind_Decoder_Decoder_0 = a.asm.Ja).apply(null, arguments);
        }, ic = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = function() {
          return (ic = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = a.asm.Ka).apply(null, arguments);
        }, jc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function() {
          return (jc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = a.asm.La).apply(null, arguments);
        }, kc = a._emscripten_bind_Decoder_GetAttributeId_2 = function() {
          return (kc = a._emscripten_bind_Decoder_GetAttributeId_2 = a.asm.Ma).apply(null, arguments);
        }, lc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = function() {
          return (lc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = a.asm.Na).apply(null, arguments);
        }, mc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = function() {
          return (mc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = a.asm.Oa).apply(null, arguments);
        }, nc = a._emscripten_bind_Decoder_GetAttribute_2 = function() {
          return (nc = a._emscripten_bind_Decoder_GetAttribute_2 = a.asm.Pa).apply(null, arguments);
        }, oc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = function() {
          return (oc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = a.asm.Qa).apply(null, arguments);
        }, pc = a._emscripten_bind_Decoder_GetMetadata_1 = function() {
          return (pc = a._emscripten_bind_Decoder_GetMetadata_1 = a.asm.Ra).apply(null, arguments);
        }, qc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = function() {
          return (qc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = a.asm.Sa).apply(null, arguments);
        }, rc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function() {
          return (rc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = a.asm.Ta).apply(null, arguments);
        }, sc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = function() {
          return (sc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = a.asm.Ua).apply(null, arguments);
        }, tc = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = function() {
          return (tc = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = a.asm.Va).apply(null, arguments);
        }, uc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = function() {
          return (uc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = a.asm.Wa).apply(null, arguments);
        }, vc = a._emscripten_bind_Decoder_GetAttributeFloat_3 = function() {
          return (vc = a._emscripten_bind_Decoder_GetAttributeFloat_3 = a.asm.Xa).apply(null, arguments);
        }, wc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = function() {
          return (wc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = a.asm.Ya).apply(null, arguments);
        }, xc = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = function() {
          return (xc = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = a.asm.Za).apply(null, arguments);
        }, yc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = function() {
          return (yc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = a.asm._a).apply(null, arguments);
        }, zc = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = function() {
          return (zc = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = a.asm.$a).apply(null, arguments);
        }, Ac = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = function() {
          return (Ac = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = a.asm.ab).apply(null, arguments);
        }, Bc = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = function() {
          return (Bc = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = a.asm.bb).apply(null, arguments);
        }, Cc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = function() {
          return (Cc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = a.asm.cb).apply(null, arguments);
        }, Dc = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = function() {
          return (Dc = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = a.asm.db).apply(null, arguments);
        }, Ec = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = function() {
          return (Ec = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = a.asm.eb).apply(null, arguments);
        }, Fc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = function() {
          return (Fc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = a.asm.fb).apply(null, arguments);
        }, Gc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = function() {
          return (Gc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = a.asm.gb).apply(null, arguments);
        }, Hc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = function() {
          return (Hc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = a.asm.hb).apply(null, arguments);
        }, Ic = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = function() {
          return (Ic = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = a.asm.ib).apply(null, arguments);
        }, Jc = a._emscripten_bind_Decoder___destroy___0 = function() {
          return (Jc = a._emscripten_bind_Decoder___destroy___0 = a.asm.jb).apply(null, arguments);
        }, Kc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = function() {
          return (Kc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = a.asm.kb).apply(null, arguments);
        }, Lc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = function() {
          return (Lc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = a.asm.lb).apply(null, arguments);
        }, Mc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = function() {
          return (Mc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = a.asm.mb).apply(null, arguments);
        }, Nc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = function() {
          return (Nc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = a.asm.nb).apply(null, arguments);
        }, Oc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function() {
          return (Oc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.ob).apply(null, arguments);
        }, Pc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function() {
          return (Pc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.pb).apply(null, arguments);
        }, Qc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function() {
          return (Qc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.qb).apply(null, arguments);
        }, Rc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function() {
          return (Rc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.rb).apply(null, arguments);
        }, Sc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function() {
          return (Sc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.sb).apply(null, arguments);
        }, Tc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function() {
          return (Tc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.tb).apply(null, arguments);
        }, Uc = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function() {
          return (Uc = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.ub).apply(null, arguments);
        }, Vc = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function() {
          return (Vc = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.vb).apply(null, arguments);
        }, Wc = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function() {
          return (Wc = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.wb).apply(null, arguments);
        }, Xc = a._emscripten_enum_draco_DataType_DT_INVALID = function() {
          return (Xc = a._emscripten_enum_draco_DataType_DT_INVALID = a.asm.xb).apply(null, arguments);
        }, Yc = a._emscripten_enum_draco_DataType_DT_INT8 = function() {
          return (Yc = a._emscripten_enum_draco_DataType_DT_INT8 = a.asm.yb).apply(null, arguments);
        }, Zc = a._emscripten_enum_draco_DataType_DT_UINT8 = function() {
          return (Zc = a._emscripten_enum_draco_DataType_DT_UINT8 = a.asm.zb).apply(null, arguments);
        }, $c = a._emscripten_enum_draco_DataType_DT_INT16 = function() {
          return ($c = a._emscripten_enum_draco_DataType_DT_INT16 = a.asm.Ab).apply(null, arguments);
        }, ad = a._emscripten_enum_draco_DataType_DT_UINT16 = function() {
          return (ad = a._emscripten_enum_draco_DataType_DT_UINT16 = a.asm.Bb).apply(null, arguments);
        }, bd = a._emscripten_enum_draco_DataType_DT_INT32 = function() {
          return (bd = a._emscripten_enum_draco_DataType_DT_INT32 = a.asm.Cb).apply(null, arguments);
        }, cd = a._emscripten_enum_draco_DataType_DT_UINT32 = function() {
          return (cd = a._emscripten_enum_draco_DataType_DT_UINT32 = a.asm.Db).apply(null, arguments);
        }, dd = a._emscripten_enum_draco_DataType_DT_INT64 = function() {
          return (dd = a._emscripten_enum_draco_DataType_DT_INT64 = a.asm.Eb).apply(null, arguments);
        }, ed = a._emscripten_enum_draco_DataType_DT_UINT64 = function() {
          return (ed = a._emscripten_enum_draco_DataType_DT_UINT64 = a.asm.Fb).apply(null, arguments);
        }, fd = a._emscripten_enum_draco_DataType_DT_FLOAT32 = function() {
          return (fd = a._emscripten_enum_draco_DataType_DT_FLOAT32 = a.asm.Gb).apply(null, arguments);
        }, gd = a._emscripten_enum_draco_DataType_DT_FLOAT64 = function() {
          return (gd = a._emscripten_enum_draco_DataType_DT_FLOAT64 = a.asm.Hb).apply(null, arguments);
        }, hd = a._emscripten_enum_draco_DataType_DT_BOOL = function() {
          return (hd = a._emscripten_enum_draco_DataType_DT_BOOL = a.asm.Ib).apply(null, arguments);
        }, id = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = function() {
          return (id = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = a.asm.Jb).apply(null, arguments);
        }, jd = a._emscripten_enum_draco_StatusCode_OK = function() {
          return (jd = a._emscripten_enum_draco_StatusCode_OK = a.asm.Kb).apply(null, arguments);
        }, kd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = function() {
          return (kd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = a.asm.Lb).apply(null, arguments);
        }, ld = a._emscripten_enum_draco_StatusCode_IO_ERROR = function() {
          return (ld = a._emscripten_enum_draco_StatusCode_IO_ERROR = a.asm.Mb).apply(null, arguments);
        }, md = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = function() {
          return (md = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = a.asm.Nb).apply(null, arguments);
        }, nd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = function() {
          return (nd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = a.asm.Ob).apply(null, arguments);
        }, od = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = function() {
          return (od = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = a.asm.Pb).apply(null, arguments);
        };
        a._malloc = function() {
          return (a._malloc = a.asm.Qb).apply(null, arguments);
        };
        a._free = function() {
          return (a._free = a.asm.Rb).apply(null, arguments);
        };
        var ua = function() {
          return (ua = a.asm.Sb).apply(null, arguments);
        };
        a.___start_em_js = 11660;
        a.___stop_em_js = 11758;
        var la;
        ha = function b() {
          la || F();
          la || (ha = b);
        };
        if (a.preInit)
          for ("function" == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; )
            a.preInit.pop()();
        F();
        v.prototype = Object.create(v.prototype);
        v.prototype.constructor = v;
        v.prototype.__class__ = v;
        v.__cache__ = {};
        a.WrapperObject = v;
        a.getCache = w;
        a.wrapPointer = B;
        a.castObject = function(b, c) {
          return B(b.ptr, c);
        };
        a.NULL = B(0);
        a.destroy = function(b) {
          if (!b.__destroy__)
            throw "Error: Cannot destroy object. (Did you create it yourself?)";
          b.__destroy__();
          delete w(b.__class__)[b.ptr];
        };
        a.compare = function(b, c) {
          return b.ptr === c.ptr;
        };
        a.getPointer = function(b) {
          return b.ptr;
        };
        a.getClass = function(b) {
          return b.__class__;
        };
        var r = { buffer: 0, size: 0, pos: 0, temps: [], needed: 0, prepare: function() {
          if (r.needed) {
            for (var b = 0; b < r.temps.length; b++)
              a._free(r.temps[b]);
            r.temps.length = 0;
            a._free(r.buffer);
            r.buffer = 0;
            r.size += r.needed;
            r.needed = 0;
          }
          r.buffer || (r.size += 128, r.buffer = a._malloc(r.size), r.buffer || y(void 0));
          r.pos = 0;
        }, alloc: function(b, c) {
          r.buffer || y(void 0);
          b = b.length * c.BYTES_PER_ELEMENT;
          b = b + 7 & -8;
          r.pos + b >= r.size ? (0 < b || y(void 0), r.needed += b, c = a._malloc(b), r.temps.push(c)) : (c = r.buffer + r.pos, r.pos += b);
          return c;
        }, copy: function(b, c, d) {
          d >>>= 0;
          switch (c.BYTES_PER_ELEMENT) {
            case 2:
              d >>>= 1;
              break;
            case 4:
              d >>>= 2;
              break;
            case 8:
              d >>>= 3;
          }
          for (var g = 0; g < b.length; g++)
            c[d + g] = b[g];
        } };
        X.prototype = Object.create(v.prototype);
        X.prototype.constructor = X;
        X.prototype.__class__ = X;
        X.__cache__ = {};
        a.VoidPtr = X;
        X.prototype.__destroy__ = X.prototype.__destroy__ = function() {
          Xa(this.ptr);
        };
        S.prototype = Object.create(v.prototype);
        S.prototype.constructor = S;
        S.prototype.__class__ = S;
        S.__cache__ = {};
        a.DecoderBuffer = S;
        S.prototype.Init = S.prototype.Init = function(b, c) {
          var d = this.ptr;
          r.prepare();
          "object" == typeof b && (b = Z(b));
          c && "object" === typeof c && (c = c.ptr);
          Ya(d, b, c);
        };
        S.prototype.__destroy__ = S.prototype.__destroy__ = function() {
          Za(this.ptr);
        };
        Q.prototype = Object.create(v.prototype);
        Q.prototype.constructor = Q;
        Q.prototype.__class__ = Q;
        Q.__cache__ = {};
        a.AttributeTransformData = Q;
        Q.prototype.transform_type = Q.prototype.transform_type = function() {
          return $a(this.ptr);
        };
        Q.prototype.__destroy__ = Q.prototype.__destroy__ = function() {
          ab(this.ptr);
        };
        V.prototype = Object.create(v.prototype);
        V.prototype.constructor = V;
        V.prototype.__class__ = V;
        V.__cache__ = {};
        a.GeometryAttribute = V;
        V.prototype.__destroy__ = V.prototype.__destroy__ = function() {
          bb(this.ptr);
        };
        x.prototype = Object.create(v.prototype);
        x.prototype.constructor = x;
        x.prototype.__class__ = x;
        x.__cache__ = {};
        a.PointAttribute = x;
        x.prototype.size = x.prototype.size = function() {
          return cb(this.ptr);
        };
        x.prototype.GetAttributeTransformData = x.prototype.GetAttributeTransformData = function() {
          return B(db(this.ptr), Q);
        };
        x.prototype.attribute_type = x.prototype.attribute_type = function() {
          return eb(this.ptr);
        };
        x.prototype.data_type = x.prototype.data_type = function() {
          return fb(this.ptr);
        };
        x.prototype.num_components = x.prototype.num_components = function() {
          return gb(this.ptr);
        };
        x.prototype.normalized = x.prototype.normalized = function() {
          return !!hb(this.ptr);
        };
        x.prototype.byte_stride = x.prototype.byte_stride = function() {
          return ib(this.ptr);
        };
        x.prototype.byte_offset = x.prototype.byte_offset = function() {
          return jb(this.ptr);
        };
        x.prototype.unique_id = x.prototype.unique_id = function() {
          return kb(this.ptr);
        };
        x.prototype.__destroy__ = x.prototype.__destroy__ = function() {
          lb(this.ptr);
        };
        D.prototype = Object.create(v.prototype);
        D.prototype.constructor = D;
        D.prototype.__class__ = D;
        D.__cache__ = {};
        a.AttributeQuantizationTransform = D;
        D.prototype.InitFromAttribute = D.prototype.InitFromAttribute = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return !!mb(c, b);
        };
        D.prototype.quantization_bits = D.prototype.quantization_bits = function() {
          return nb(this.ptr);
        };
        D.prototype.min_value = D.prototype.min_value = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return ob(c, b);
        };
        D.prototype.range = D.prototype.range = function() {
          return pb(this.ptr);
        };
        D.prototype.__destroy__ = D.prototype.__destroy__ = function() {
          qb(this.ptr);
        };
        G.prototype = Object.create(v.prototype);
        G.prototype.constructor = G;
        G.prototype.__class__ = G;
        G.__cache__ = {};
        a.AttributeOctahedronTransform = G;
        G.prototype.InitFromAttribute = G.prototype.InitFromAttribute = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return !!rb(c, b);
        };
        G.prototype.quantization_bits = G.prototype.quantization_bits = function() {
          return sb(this.ptr);
        };
        G.prototype.__destroy__ = G.prototype.__destroy__ = function() {
          tb(this.ptr);
        };
        H.prototype = Object.create(v.prototype);
        H.prototype.constructor = H;
        H.prototype.__class__ = H;
        H.__cache__ = {};
        a.PointCloud = H;
        H.prototype.num_attributes = H.prototype.num_attributes = function() {
          return ub(this.ptr);
        };
        H.prototype.num_points = H.prototype.num_points = function() {
          return vb(this.ptr);
        };
        H.prototype.__destroy__ = H.prototype.__destroy__ = function() {
          wb(this.ptr);
        };
        E.prototype = Object.create(v.prototype);
        E.prototype.constructor = E;
        E.prototype.__class__ = E;
        E.__cache__ = {};
        a.Mesh = E;
        E.prototype.num_faces = E.prototype.num_faces = function() {
          return xb(this.ptr);
        };
        E.prototype.num_attributes = E.prototype.num_attributes = function() {
          return yb(this.ptr);
        };
        E.prototype.num_points = E.prototype.num_points = function() {
          return zb(this.ptr);
        };
        E.prototype.__destroy__ = E.prototype.__destroy__ = function() {
          Ab(this.ptr);
        };
        T.prototype = Object.create(v.prototype);
        T.prototype.constructor = T;
        T.prototype.__class__ = T;
        T.__cache__ = {};
        a.Metadata = T;
        T.prototype.__destroy__ = T.prototype.__destroy__ = function() {
          Bb(this.ptr);
        };
        C.prototype = Object.create(v.prototype);
        C.prototype.constructor = C;
        C.prototype.__class__ = C;
        C.__cache__ = {};
        a.Status = C;
        C.prototype.code = C.prototype.code = function() {
          return Cb(this.ptr);
        };
        C.prototype.ok = C.prototype.ok = function() {
          return !!Db(this.ptr);
        };
        C.prototype.error_msg = C.prototype.error_msg = function() {
          return p(Eb(this.ptr));
        };
        C.prototype.__destroy__ = C.prototype.__destroy__ = function() {
          Fb(this.ptr);
        };
        I.prototype = Object.create(v.prototype);
        I.prototype.constructor = I;
        I.prototype.__class__ = I;
        I.__cache__ = {};
        a.DracoFloat32Array = I;
        I.prototype.GetValue = I.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Gb(
            c,
            b
          );
        };
        I.prototype.size = I.prototype.size = function() {
          return Hb(this.ptr);
        };
        I.prototype.__destroy__ = I.prototype.__destroy__ = function() {
          Ib(this.ptr);
        };
        J.prototype = Object.create(v.prototype);
        J.prototype.constructor = J;
        J.prototype.__class__ = J;
        J.__cache__ = {};
        a.DracoInt8Array = J;
        J.prototype.GetValue = J.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Jb(c, b);
        };
        J.prototype.size = J.prototype.size = function() {
          return Kb(this.ptr);
        };
        J.prototype.__destroy__ = J.prototype.__destroy__ = function() {
          Lb(this.ptr);
        };
        K.prototype = Object.create(v.prototype);
        K.prototype.constructor = K;
        K.prototype.__class__ = K;
        K.__cache__ = {};
        a.DracoUInt8Array = K;
        K.prototype.GetValue = K.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Mb(c, b);
        };
        K.prototype.size = K.prototype.size = function() {
          return Nb(this.ptr);
        };
        K.prototype.__destroy__ = K.prototype.__destroy__ = function() {
          Ob(this.ptr);
        };
        L.prototype = Object.create(v.prototype);
        L.prototype.constructor = L;
        L.prototype.__class__ = L;
        L.__cache__ = {};
        a.DracoInt16Array = L;
        L.prototype.GetValue = L.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Pb(c, b);
        };
        L.prototype.size = L.prototype.size = function() {
          return Qb(this.ptr);
        };
        L.prototype.__destroy__ = L.prototype.__destroy__ = function() {
          Rb(this.ptr);
        };
        M.prototype = Object.create(v.prototype);
        M.prototype.constructor = M;
        M.prototype.__class__ = M;
        M.__cache__ = {};
        a.DracoUInt16Array = M;
        M.prototype.GetValue = M.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Sb(c, b);
        };
        M.prototype.size = M.prototype.size = function() {
          return Tb(this.ptr);
        };
        M.prototype.__destroy__ = M.prototype.__destroy__ = function() {
          Ub(this.ptr);
        };
        N.prototype = Object.create(v.prototype);
        N.prototype.constructor = N;
        N.prototype.__class__ = N;
        N.__cache__ = {};
        a.DracoInt32Array = N;
        N.prototype.GetValue = N.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Vb(c, b);
        };
        N.prototype.size = N.prototype.size = function() {
          return Wb(this.ptr);
        };
        N.prototype.__destroy__ = N.prototype.__destroy__ = function() {
          Xb(this.ptr);
        };
        O.prototype = Object.create(v.prototype);
        O.prototype.constructor = O;
        O.prototype.__class__ = O;
        O.__cache__ = {};
        a.DracoUInt32Array = O;
        O.prototype.GetValue = O.prototype.GetValue = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Yb(c, b);
        };
        O.prototype.size = O.prototype.size = function() {
          return Zb(this.ptr);
        };
        O.prototype.__destroy__ = O.prototype.__destroy__ = function() {
          $b(this.ptr);
        };
        z.prototype = Object.create(v.prototype);
        z.prototype.constructor = z;
        z.prototype.__class__ = z;
        z.__cache__ = {};
        a.MetadataQuerier = z;
        z.prototype.HasEntry = z.prototype.HasEntry = function(b, c) {
          var d = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          return !!ac(d, b, c);
        };
        z.prototype.GetIntEntry = z.prototype.GetIntEntry = function(b, c) {
          var d = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          return bc(d, b, c);
        };
        z.prototype.GetIntEntryArray = z.prototype.GetIntEntryArray = function(b, c, d) {
          var g = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          d && "object" === typeof d && (d = d.ptr);
          cc(g, b, c, d);
        };
        z.prototype.GetDoubleEntry = z.prototype.GetDoubleEntry = function(b, c) {
          var d = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          return dc(d, b, c);
        };
        z.prototype.GetStringEntry = z.prototype.GetStringEntry = function(b, c) {
          var d = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          return p(ec(d, b, c));
        };
        z.prototype.NumEntries = z.prototype.NumEntries = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return fc(c, b);
        };
        z.prototype.GetEntryName = z.prototype.GetEntryName = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return p(gc(d, b, c));
        };
        z.prototype.__destroy__ = z.prototype.__destroy__ = function() {
          hc(this.ptr);
        };
        m.prototype = Object.create(v.prototype);
        m.prototype.constructor = m;
        m.prototype.__class__ = m;
        m.__cache__ = {};
        a.Decoder = m;
        m.prototype.DecodeArrayToPointCloud = m.prototype.DecodeArrayToPointCloud = function(b, c, d) {
          var g = this.ptr;
          r.prepare();
          "object" == typeof b && (b = Z(b));
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return B(ic(g, b, c, d), C);
        };
        m.prototype.DecodeArrayToMesh = m.prototype.DecodeArrayToMesh = function(b, c, d) {
          var g = this.ptr;
          r.prepare();
          "object" == typeof b && (b = Z(b));
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return B(jc(g, b, c, d), C);
        };
        m.prototype.GetAttributeId = m.prototype.GetAttributeId = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return kc(d, b, c);
        };
        m.prototype.GetAttributeIdByName = m.prototype.GetAttributeIdByName = function(b, c) {
          var d = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          return lc(d, b, c);
        };
        m.prototype.GetAttributeIdByMetadataEntry = m.prototype.GetAttributeIdByMetadataEntry = function(b, c, d) {
          var g = this.ptr;
          r.prepare();
          b && "object" === typeof b && (b = b.ptr);
          c = c && "object" === typeof c ? c.ptr : R(c);
          d = d && "object" === typeof d ? d.ptr : R(d);
          return mc(g, b, c, d);
        };
        m.prototype.GetAttribute = m.prototype.GetAttribute = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return B(nc(d, b, c), x);
        };
        m.prototype.GetAttributeByUniqueId = m.prototype.GetAttributeByUniqueId = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return B(oc(d, b, c), x);
        };
        m.prototype.GetMetadata = m.prototype.GetMetadata = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return B(pc(c, b), T);
        };
        m.prototype.GetAttributeMetadata = m.prototype.GetAttributeMetadata = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return B(qc(d, b, c), T);
        };
        m.prototype.GetFaceFromMesh = m.prototype.GetFaceFromMesh = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!rc(g, b, c, d);
        };
        m.prototype.GetTriangleStripsFromMesh = m.prototype.GetTriangleStripsFromMesh = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return sc(d, b, c);
        };
        m.prototype.GetTrianglesUInt16Array = m.prototype.GetTrianglesUInt16Array = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!tc(g, b, c, d);
        };
        m.prototype.GetTrianglesUInt32Array = m.prototype.GetTrianglesUInt32Array = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!uc(g, b, c, d);
        };
        m.prototype.GetAttributeFloat = m.prototype.GetAttributeFloat = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!vc(g, b, c, d);
        };
        m.prototype.GetAttributeFloatForAllPoints = m.prototype.GetAttributeFloatForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!wc(g, b, c, d);
        };
        m.prototype.GetAttributeIntForAllPoints = m.prototype.GetAttributeIntForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!xc(g, b, c, d);
        };
        m.prototype.GetAttributeInt8ForAllPoints = m.prototype.GetAttributeInt8ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!yc(g, b, c, d);
        };
        m.prototype.GetAttributeUInt8ForAllPoints = m.prototype.GetAttributeUInt8ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!zc(g, b, c, d);
        };
        m.prototype.GetAttributeInt16ForAllPoints = m.prototype.GetAttributeInt16ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!Ac(g, b, c, d);
        };
        m.prototype.GetAttributeUInt16ForAllPoints = m.prototype.GetAttributeUInt16ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!Bc(g, b, c, d);
        };
        m.prototype.GetAttributeInt32ForAllPoints = m.prototype.GetAttributeInt32ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!Cc(g, b, c, d);
        };
        m.prototype.GetAttributeUInt32ForAllPoints = m.prototype.GetAttributeUInt32ForAllPoints = function(b, c, d) {
          var g = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          return !!Dc(g, b, c, d);
        };
        m.prototype.GetAttributeDataArrayForAllPoints = m.prototype.GetAttributeDataArrayForAllPoints = function(b, c, d, g, t) {
          var aa = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          d && "object" === typeof d && (d = d.ptr);
          g && "object" === typeof g && (g = g.ptr);
          t && "object" === typeof t && (t = t.ptr);
          return !!Ec(aa, b, c, d, g, t);
        };
        m.prototype.SkipAttributeTransform = m.prototype.SkipAttributeTransform = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          Fc(
            c,
            b
          );
        };
        m.prototype.GetEncodedGeometryType_Deprecated = m.prototype.GetEncodedGeometryType_Deprecated = function(b) {
          var c = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          return Gc(c, b);
        };
        m.prototype.DecodeBufferToPointCloud = m.prototype.DecodeBufferToPointCloud = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return B(Hc(d, b, c), C);
        };
        m.prototype.DecodeBufferToMesh = m.prototype.DecodeBufferToMesh = function(b, c) {
          var d = this.ptr;
          b && "object" === typeof b && (b = b.ptr);
          c && "object" === typeof c && (c = c.ptr);
          return B(Ic(d, b, c), C);
        };
        m.prototype.__destroy__ = m.prototype.__destroy__ = function() {
          Jc(this.ptr);
        };
        (function() {
          function b() {
            a.ATTRIBUTE_INVALID_TRANSFORM = Kc();
            a.ATTRIBUTE_NO_TRANSFORM = Lc();
            a.ATTRIBUTE_QUANTIZATION_TRANSFORM = Mc();
            a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = Nc();
            a.INVALID = Oc();
            a.POSITION = Pc();
            a.NORMAL = Qc();
            a.COLOR = Rc();
            a.TEX_COORD = Sc();
            a.GENERIC = Tc();
            a.INVALID_GEOMETRY_TYPE = Uc();
            a.POINT_CLOUD = Vc();
            a.TRIANGULAR_MESH = Wc();
            a.DT_INVALID = Xc();
            a.DT_INT8 = Yc();
            a.DT_UINT8 = Zc();
            a.DT_INT16 = $c();
            a.DT_UINT16 = ad();
            a.DT_INT32 = bd();
            a.DT_UINT32 = cd();
            a.DT_INT64 = dd();
            a.DT_UINT64 = ed();
            a.DT_FLOAT32 = fd();
            a.DT_FLOAT64 = gd();
            a.DT_BOOL = hd();
            a.DT_TYPES_COUNT = id();
            a.OK = jd();
            a.DRACO_ERROR = kd();
            a.IO_ERROR = ld();
            a.INVALID_PARAMETER = md();
            a.UNSUPPORTED_VERSION = nd();
            a.UNKNOWN_VERSION = od();
          }
          va ? b() : oa.unshift(b);
        })();
        if ("function" === typeof a.onModuleParsed)
          a.onModuleParsed();
        a.Decoder.prototype.GetEncodedGeometryType = function(b) {
          if (b.__class__ && b.__class__ === a.DecoderBuffer)
            return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b);
          if (8 > b.byteLength)
            return a.INVALID_GEOMETRY_TYPE;
          switch (b[7]) {
            case 0:
              return a.POINT_CLOUD;
            case 1:
              return a.TRIANGULAR_MESH;
            default:
              return a.INVALID_GEOMETRY_TYPE;
          }
        };
        return n.ready;
      };
    }();
    "object" === typeof exports && "object" === typeof module ? module.exports = DracoDecoderModule : "function" === typeof define && define.amd ? define([], function() {
      return DracoDecoderModule;
    }) : "object" === typeof exports && (exports.DracoDecoderModule = DracoDecoderModule);
  }
});

// ../../node_modules/draco3dgltf/draco3dgltf.js
var require_draco3dgltf = __commonJS({
  "../../node_modules/draco3dgltf/draco3dgltf.js"(exports, module) {
    var createEncoderModule = require_draco_encoder_gltf_nodejs();
    var createDecoderModule = require_draco_decoder_gltf_nodejs();
    module.exports = {
      createEncoderModule,
      createDecoderModule
    };
  }
});
export default require_draco3dgltf();
//# sourceMappingURL=draco3dgltf.js.map
