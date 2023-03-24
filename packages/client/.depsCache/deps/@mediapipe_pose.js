import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mediapipe/pose/pose.js
var require_pose = __commonJS({
  "../../node_modules/@mediapipe/pose/pose.js"(exports) {
    (function() {
      "use strict";
      var x;
      function aa(a) {
        var b = 0;
        return function() {
          return b < a.length ? { done: false, value: a[b++] } : { done: true };
        };
      }
      var ba = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        if (a == Array.prototype || a == Object.prototype)
          return a;
        a[b] = c.value;
        return a;
      };
      function ca(a) {
        a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
        for (var b = 0; b < a.length; ++b) {
          var c = a[b];
          if (c && c.Math == Math)
            return c;
        }
        throw Error("Cannot find global object");
      }
      var y = ca(this);
      function z(a, b) {
        if (b)
          a: {
            var c = y;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
              var e = a[d];
              if (!(e in c))
                break a;
              c = c[e];
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && ba(c, a, { configurable: true, writable: true, value: b });
          }
      }
      z("Symbol", function(a) {
        function b(g) {
          if (this instanceof b)
            throw new TypeError("Symbol is not a constructor");
          return new c(d + (g || "") + "_" + e++, g);
        }
        function c(g, f) {
          this.h = g;
          ba(this, "description", { configurable: true, writable: true, value: f });
        }
        if (a)
          return a;
        c.prototype.toString = function() {
          return this.h;
        };
        var d = "jscomp_symbol_" + (1e9 * Math.random() >>> 0) + "_", e = 0;
        return b;
      });
      z("Symbol.iterator", function(a) {
        if (a)
          return a;
        a = Symbol("Symbol.iterator");
        for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
          var d = y[b[c]];
          "function" === typeof d && "function" != typeof d.prototype[a] && ba(d.prototype, a, { configurable: true, writable: true, value: function() {
            return da(aa(this));
          } });
        }
        return a;
      });
      function da(a) {
        a = { next: a };
        a[Symbol.iterator] = function() {
          return this;
        };
        return a;
      }
      function A(a) {
        var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return b ? b.call(a) : { next: aa(a) };
      }
      function ea(a) {
        if (!(a instanceof Array)) {
          a = A(a);
          for (var b, c = []; !(b = a.next()).done; )
            c.push(b.value);
          a = c;
        }
        return a;
      }
      var fa = "function" == typeof Object.assign ? Object.assign : function(a, b) {
        for (var c = 1; c < arguments.length; c++) {
          var d = arguments[c];
          if (d)
            for (var e in d)
              Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
        }
        return a;
      };
      z("Object.assign", function(a) {
        return a || fa;
      });
      var ha = "function" == typeof Object.create ? Object.create : function(a) {
        function b() {
        }
        b.prototype = a;
        return new b();
      }, ia;
      if ("function" == typeof Object.setPrototypeOf)
        ia = Object.setPrototypeOf;
      else {
        var ja;
        a: {
          var ka = { a: true }, la = {};
          try {
            la.__proto__ = ka;
            ja = la.a;
            break a;
          } catch (a) {
          }
          ja = false;
        }
        ia = ja ? function(a, b) {
          a.__proto__ = b;
          if (a.__proto__ !== b)
            throw new TypeError(a + " is not extensible");
          return a;
        } : null;
      }
      var ma = ia;
      function na(a, b) {
        a.prototype = ha(b.prototype);
        a.prototype.constructor = a;
        if (ma)
          ma(a, b);
        else
          for (var c in b)
            if ("prototype" != c)
              if (Object.defineProperties) {
                var d = Object.getOwnPropertyDescriptor(b, c);
                d && Object.defineProperty(a, c, d);
              } else
                a[c] = b[c];
        a.za = b.prototype;
      }
      function oa() {
        this.m = false;
        this.j = null;
        this.i = void 0;
        this.h = 1;
        this.v = this.s = 0;
        this.l = null;
      }
      function pa(a) {
        if (a.m)
          throw new TypeError("Generator is already running");
        a.m = true;
      }
      oa.prototype.u = function(a) {
        this.i = a;
      };
      function qa(a, b) {
        a.l = { ma: b, na: true };
        a.h = a.s || a.v;
      }
      oa.prototype.return = function(a) {
        this.l = { return: a };
        this.h = this.v;
      };
      function D(a, b, c) {
        a.h = c;
        return { value: b };
      }
      function ra(a) {
        this.h = new oa();
        this.i = a;
      }
      function sa(a, b) {
        pa(a.h);
        var c = a.h.j;
        if (c)
          return ta(a, "return" in c ? c["return"] : function(d) {
            return { value: d, done: true };
          }, b, a.h.return);
        a.h.return(b);
        return ua(a);
      }
      function ta(a, b, c, d) {
        try {
          var e = b.call(a.h.j, c);
          if (!(e instanceof Object))
            throw new TypeError("Iterator result " + e + " is not an object");
          if (!e.done)
            return a.h.m = false, e;
          var g = e.value;
        } catch (f) {
          return a.h.j = null, qa(a.h, f), ua(a);
        }
        a.h.j = null;
        d.call(a.h, g);
        return ua(a);
      }
      function ua(a) {
        for (; a.h.h; )
          try {
            var b = a.i(a.h);
            if (b)
              return a.h.m = false, { value: b.value, done: false };
          } catch (c) {
            a.h.i = void 0, qa(a.h, c);
          }
        a.h.m = false;
        if (a.h.l) {
          b = a.h.l;
          a.h.l = null;
          if (b.na)
            throw b.ma;
          return { value: b.return, done: true };
        }
        return { value: void 0, done: true };
      }
      function va(a) {
        this.next = function(b) {
          pa(a.h);
          a.h.j ? b = ta(a, a.h.j.next, b, a.h.u) : (a.h.u(b), b = ua(a));
          return b;
        };
        this.throw = function(b) {
          pa(a.h);
          a.h.j ? b = ta(a, a.h.j["throw"], b, a.h.u) : (qa(a.h, b), b = ua(a));
          return b;
        };
        this.return = function(b) {
          return sa(a, b);
        };
        this[Symbol.iterator] = function() {
          return this;
        };
      }
      function wa(a) {
        function b(d) {
          return a.next(d);
        }
        function c(d) {
          return a.throw(d);
        }
        return new Promise(function(d, e) {
          function g(f) {
            f.done ? d(f.value) : Promise.resolve(f.value).then(b, c).then(g, e);
          }
          g(a.next());
        });
      }
      function E(a) {
        return wa(new va(new ra(a)));
      }
      z("Promise", function(a) {
        function b(f) {
          this.i = 0;
          this.j = void 0;
          this.h = [];
          this.u = false;
          var h = this.l();
          try {
            f(h.resolve, h.reject);
          } catch (k) {
            h.reject(k);
          }
        }
        function c() {
          this.h = null;
        }
        function d(f) {
          return f instanceof b ? f : new b(function(h) {
            h(f);
          });
        }
        if (a)
          return a;
        c.prototype.i = function(f) {
          if (null == this.h) {
            this.h = [];
            var h = this;
            this.j(function() {
              h.m();
            });
          }
          this.h.push(f);
        };
        var e = y.setTimeout;
        c.prototype.j = function(f) {
          e(f, 0);
        };
        c.prototype.m = function() {
          for (; this.h && this.h.length; ) {
            var f = this.h;
            this.h = [];
            for (var h = 0; h < f.length; ++h) {
              var k = f[h];
              f[h] = null;
              try {
                k();
              } catch (l) {
                this.l(l);
              }
            }
          }
          this.h = null;
        };
        c.prototype.l = function(f) {
          this.j(function() {
            throw f;
          });
        };
        b.prototype.l = function() {
          function f(l) {
            return function(m) {
              k || (k = true, l.call(h, m));
            };
          }
          var h = this, k = false;
          return { resolve: f(this.I), reject: f(this.m) };
        };
        b.prototype.I = function(f) {
          if (f === this)
            this.m(new TypeError("A Promise cannot resolve to itself"));
          else if (f instanceof b)
            this.L(f);
          else {
            a:
              switch (typeof f) {
                case "object":
                  var h = null != f;
                  break a;
                case "function":
                  h = true;
                  break a;
                default:
                  h = false;
              }
            h ? this.F(f) : this.s(f);
          }
        };
        b.prototype.F = function(f) {
          var h = void 0;
          try {
            h = f.then;
          } catch (k) {
            this.m(k);
            return;
          }
          "function" == typeof h ? this.M(h, f) : this.s(f);
        };
        b.prototype.m = function(f) {
          this.v(2, f);
        };
        b.prototype.s = function(f) {
          this.v(1, f);
        };
        b.prototype.v = function(f, h) {
          if (0 != this.i)
            throw Error("Cannot settle(" + f + ", " + h + "): Promise already settled in state" + this.i);
          this.i = f;
          this.j = h;
          2 === this.i && this.K();
          this.H();
        };
        b.prototype.K = function() {
          var f = this;
          e(function() {
            if (f.D()) {
              var h = y.console;
              "undefined" !== typeof h && h.error(f.j);
            }
          }, 1);
        };
        b.prototype.D = function() {
          if (this.u)
            return false;
          var f = y.CustomEvent, h = y.Event, k = y.dispatchEvent;
          if ("undefined" === typeof k)
            return true;
          "function" === typeof f ? f = new f("unhandledrejection", { cancelable: true }) : "function" === typeof h ? f = new h("unhandledrejection", { cancelable: true }) : (f = y.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", false, true, f));
          f.promise = this;
          f.reason = this.j;
          return k(f);
        };
        b.prototype.H = function() {
          if (null != this.h) {
            for (var f = 0; f < this.h.length; ++f)
              g.i(this.h[f]);
            this.h = null;
          }
        };
        var g = new c();
        b.prototype.L = function(f) {
          var h = this.l();
          f.T(h.resolve, h.reject);
        };
        b.prototype.M = function(f, h) {
          var k = this.l();
          try {
            f.call(h, k.resolve, k.reject);
          } catch (l) {
            k.reject(l);
          }
        };
        b.prototype.then = function(f, h) {
          function k(p, n) {
            return "function" == typeof p ? function(q) {
              try {
                l(p(q));
              } catch (t) {
                m(t);
              }
            } : n;
          }
          var l, m, r = new b(function(p, n) {
            l = p;
            m = n;
          });
          this.T(k(f, l), k(h, m));
          return r;
        };
        b.prototype.catch = function(f) {
          return this.then(void 0, f);
        };
        b.prototype.T = function(f, h) {
          function k() {
            switch (l.i) {
              case 1:
                f(l.j);
                break;
              case 2:
                h(l.j);
                break;
              default:
                throw Error("Unexpected state: " + l.i);
            }
          }
          var l = this;
          null == this.h ? g.i(k) : this.h.push(k);
          this.u = true;
        };
        b.resolve = d;
        b.reject = function(f) {
          return new b(function(h, k) {
            k(f);
          });
        };
        b.race = function(f) {
          return new b(function(h, k) {
            for (var l = A(f), m = l.next(); !m.done; m = l.next())
              d(m.value).T(h, k);
          });
        };
        b.all = function(f) {
          var h = A(f), k = h.next();
          return k.done ? d([]) : new b(function(l, m) {
            function r(q) {
              return function(t) {
                p[q] = t;
                n--;
                0 == n && l(p);
              };
            }
            var p = [], n = 0;
            do
              p.push(void 0), n++, d(k.value).T(r(p.length - 1), m), k = h.next();
            while (!k.done);
          });
        };
        return b;
      });
      function xa(a, b) {
        a instanceof String && (a += "");
        var c = 0, d = false, e = { next: function() {
          if (!d && c < a.length) {
            var g = c++;
            return { value: b(g, a[g]), done: false };
          }
          d = true;
          return { done: true, value: void 0 };
        } };
        e[Symbol.iterator] = function() {
          return e;
        };
        return e;
      }
      z("Array.prototype.keys", function(a) {
        return a ? a : function() {
          return xa(this, function(b) {
            return b;
          });
        };
      });
      z("Array.prototype.fill", function(a) {
        return a ? a : function(b, c, d) {
          var e = this.length || 0;
          0 > c && (c = Math.max(0, e + c));
          if (null == d || d > e)
            d = e;
          d = Number(d);
          0 > d && (d = Math.max(0, e + d));
          for (c = Number(c || 0); c < d; c++)
            this[c] = b;
          return this;
        };
      });
      function F(a) {
        return a ? a : Array.prototype.fill;
      }
      z("Int8Array.prototype.fill", F);
      z("Uint8Array.prototype.fill", F);
      z("Uint8ClampedArray.prototype.fill", F);
      z("Int16Array.prototype.fill", F);
      z("Uint16Array.prototype.fill", F);
      z("Int32Array.prototype.fill", F);
      z("Uint32Array.prototype.fill", F);
      z("Float32Array.prototype.fill", F);
      z("Float64Array.prototype.fill", F);
      z("Object.is", function(a) {
        return a ? a : function(b, c) {
          return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
        };
      });
      z("Array.prototype.includes", function(a) {
        return a ? a : function(b, c) {
          var d = this;
          d instanceof String && (d = String(d));
          var e = d.length;
          c = c || 0;
          for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
            var g = d[c];
            if (g === b || Object.is(g, b))
              return true;
          }
          return false;
        };
      });
      z("String.prototype.includes", function(a) {
        return a ? a : function(b, c) {
          if (null == this)
            throw new TypeError("The 'this' value for String.prototype.includes must not be null or undefined");
          if (b instanceof RegExp)
            throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
          return -1 !== this.indexOf(b, c || 0);
        };
      });
      var ya = this || self;
      function G(a, b) {
        a = a.split(".");
        var c = ya;
        a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift()); )
          a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b;
      }
      ;
      function Aa(a) {
        var b;
        a: {
          if (b = ya.navigator) {
            if (b = b.userAgent)
              break a;
          }
          b = "";
        }
        return -1 != b.indexOf(a);
      }
      ;
      var Ba = Array.prototype.map ? function(a, b) {
        return Array.prototype.map.call(a, b, void 0);
      } : function(a, b) {
        for (var c = a.length, d = Array(c), e = "string" === typeof a ? a.split("") : a, g = 0; g < c; g++)
          g in e && (d[g] = b.call(void 0, e[g], g, a));
        return d;
      };
      var Ca = {}, Da = null;
      function Ea(a) {
        var b = a.length, c = 3 * b / 4;
        c % 3 ? c = Math.floor(c) : -1 != "=.".indexOf(a[b - 1]) && (c = -1 != "=.".indexOf(a[b - 2]) ? c - 2 : c - 1);
        var d = new Uint8Array(c), e = 0;
        Fa(a, function(g) {
          d[e++] = g;
        });
        return e !== c ? d.subarray(0, e) : d;
      }
      function Fa(a, b) {
        function c(k) {
          for (; d < a.length; ) {
            var l = a.charAt(d++), m = Da[l];
            if (null != m)
              return m;
            if (!/^[\s\xa0]*$/.test(l))
              throw Error("Unknown base64 encoding at char: " + l);
          }
          return k;
        }
        Ga();
        for (var d = 0; ; ) {
          var e = c(-1), g = c(0), f = c(64), h = c(64);
          if (64 === h && -1 === e)
            break;
          b(e << 2 | g >> 4);
          64 != f && (b(g << 4 & 240 | f >> 2), 64 != h && b(f << 6 & 192 | h));
        }
      }
      function Ga() {
        if (!Da) {
          Da = {};
          for (var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), b = ["+/=", "+/", "-_=", "-_.", "-_"], c = 0; 5 > c; c++) {
            var d = a.concat(b[c].split(""));
            Ca[c] = d;
            for (var e = 0; e < d.length; e++) {
              var g = d[e];
              void 0 === Da[g] && (Da[g] = e);
            }
          }
        }
      }
      ;
      var Ha = "undefined" !== typeof Uint8Array, Ia = !(Aa("Trident") || Aa("MSIE")) && "function" === typeof ya.btoa;
      function Ja(a) {
        if (!Ia) {
          var b;
          void 0 === b && (b = 0);
          Ga();
          b = Ca[b];
          for (var c = Array(Math.floor(a.length / 3)), d = b[64] || "", e = 0, g = 0; e < a.length - 2; e += 3) {
            var f = a[e], h = a[e + 1], k = a[e + 2], l = b[f >> 2];
            f = b[(f & 3) << 4 | h >> 4];
            h = b[(h & 15) << 2 | k >> 6];
            k = b[k & 63];
            c[g++] = l + f + h + k;
          }
          l = 0;
          k = d;
          switch (a.length - e) {
            case 2:
              l = a[e + 1], k = b[(l & 15) << 2] || d;
            case 1:
              a = a[e], c[g] = b[a >> 2] + b[(a & 3) << 4 | l >> 4] + k + d;
          }
          return c.join("");
        }
        for (b = ""; 10240 < a.length; )
          b += String.fromCharCode.apply(null, a.subarray(0, 10240)), a = a.subarray(10240);
        b += String.fromCharCode.apply(
          null,
          a
        );
        return btoa(b);
      }
      var Ka = RegExp("[-_.]", "g");
      function La(a) {
        switch (a) {
          case "-":
            return "+";
          case "_":
            return "/";
          case ".":
            return "=";
          default:
            return "";
        }
      }
      function Ma(a) {
        if (!Ia)
          return Ea(a);
        Ka.test(a) && (a = a.replace(Ka, La));
        a = atob(a);
        for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++)
          b[c] = a.charCodeAt(c);
        return b;
      }
      var Na;
      function Oa() {
        return Na || (Na = new Uint8Array(0));
      }
      var Pa = {};
      var Qa = "function" === typeof Uint8Array.prototype.slice, H = 0, K = 0;
      function Ra(a) {
        var b = 0 > a;
        a = Math.abs(a);
        var c = a >>> 0;
        a = Math.floor((a - c) / 4294967296);
        b && (c = A(Sa(c, a)), b = c.next().value, a = c.next().value, c = b);
        H = c >>> 0;
        K = a >>> 0;
      }
      var Ta = "function" === typeof BigInt;
      function Sa(a, b) {
        b = ~b;
        a ? a = ~a + 1 : b += 1;
        return [a, b];
      }
      ;
      function Ua(a, b) {
        this.i = a >>> 0;
        this.h = b >>> 0;
      }
      function Va(a) {
        if (!a)
          return Wa || (Wa = new Ua(0, 0));
        if (!/^-?\d+$/.test(a))
          return null;
        if (16 > a.length)
          Ra(Number(a));
        else if (Ta)
          a = BigInt(a), H = Number(a & BigInt(4294967295)) >>> 0, K = Number(a >> BigInt(32) & BigInt(4294967295));
        else {
          var b = +("-" === a[0]);
          K = H = 0;
          for (var c = a.length, d = b, e = (c - b) % 6 + b; e <= c; d = e, e += 6)
            d = Number(a.slice(d, e)), K *= 1e6, H = 1e6 * H + d, 4294967296 <= H && (K += H / 4294967296 | 0, H %= 4294967296);
          b && (b = A(Sa(H, K)), a = b.next().value, b = b.next().value, H = a, K = b);
        }
        return new Ua(H, K);
      }
      var Wa;
      function Xa(a, b) {
        return Error("Invalid wire type: " + a + " (at position " + b + ")");
      }
      function Ya() {
        return Error("Failed to read varint, encoding is invalid.");
      }
      function Za(a, b) {
        return Error("Tried to read past the end of the data " + b + " > " + a);
      }
      ;
      function L() {
        throw Error("Invalid UTF8");
      }
      function $a(a, b) {
        b = String.fromCharCode.apply(null, b);
        return null == a ? b : a + b;
      }
      var ab = void 0, bb, cb = "undefined" !== typeof TextDecoder, db, eb = "undefined" !== typeof TextEncoder;
      var fb;
      function gb(a) {
        if (a !== Pa)
          throw Error("illegal external caller");
      }
      function hb(a, b) {
        gb(b);
        this.V = a;
        if (null != a && 0 === a.length)
          throw Error("ByteString should be constructed with non-empty values");
      }
      function ib() {
        return fb || (fb = new hb(null, Pa));
      }
      function jb(a) {
        gb(Pa);
        var b = a.V;
        b = null == b || Ha && null != b && b instanceof Uint8Array ? b : "string" === typeof b ? Ma(b) : null;
        return null == b ? b : a.V = b;
      }
      ;
      function kb(a) {
        if ("string" === typeof a)
          return { buffer: Ma(a), C: false };
        if (Array.isArray(a))
          return { buffer: new Uint8Array(a), C: false };
        if (a.constructor === Uint8Array)
          return { buffer: a, C: false };
        if (a.constructor === ArrayBuffer)
          return { buffer: new Uint8Array(a), C: false };
        if (a.constructor === hb)
          return { buffer: jb(a) || Oa(), C: true };
        if (a instanceof Uint8Array)
          return { buffer: new Uint8Array(a.buffer, a.byteOffset, a.byteLength), C: false };
        throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, a ByteString or an Array of numbers");
      }
      ;
      function lb(a, b) {
        this.i = null;
        this.m = false;
        this.h = this.j = this.l = 0;
        mb(this, a, b);
      }
      function mb(a, b, c) {
        c = void 0 === c ? {} : c;
        a.S = void 0 === c.S ? false : c.S;
        b && (b = kb(b), a.i = b.buffer, a.m = b.C, a.l = 0, a.j = a.i.length, a.h = a.l);
      }
      lb.prototype.reset = function() {
        this.h = this.l;
      };
      function M(a, b) {
        a.h = b;
        if (b > a.j)
          throw Za(a.j, b);
      }
      function nb(a) {
        var b = a.i, c = a.h, d = b[c++], e = d & 127;
        if (d & 128 && (d = b[c++], e |= (d & 127) << 7, d & 128 && (d = b[c++], e |= (d & 127) << 14, d & 128 && (d = b[c++], e |= (d & 127) << 21, d & 128 && (d = b[c++], e |= d << 28, d & 128 && b[c++] & 128 && b[c++] & 128 && b[c++] & 128 && b[c++] & 128 && b[c++] & 128)))))
          throw Ya();
        M(a, c);
        return e;
      }
      function ob(a, b) {
        if (0 > b)
          throw Error("Tried to read a negative byte length: " + b);
        var c = a.h, d = c + b;
        if (d > a.j)
          throw Za(b, a.j - c);
        a.h = d;
        return c;
      }
      var pb = [];
      function qb() {
        this.h = [];
      }
      qb.prototype.length = function() {
        return this.h.length;
      };
      qb.prototype.end = function() {
        var a = this.h;
        this.h = [];
        return a;
      };
      function rb(a, b, c) {
        for (; 0 < c || 127 < b; )
          a.h.push(b & 127 | 128), b = (b >>> 7 | c << 25) >>> 0, c >>>= 7;
        a.h.push(b);
      }
      function N(a, b) {
        for (; 127 < b; )
          a.h.push(b & 127 | 128), b >>>= 7;
        a.h.push(b);
      }
      ;
      function sb(a, b) {
        if (pb.length) {
          var c = pb.pop();
          mb(c, a, b);
          a = c;
        } else
          a = new lb(a, b);
        this.h = a;
        this.j = this.h.h;
        this.i = this.l = -1;
        this.setOptions(b);
      }
      sb.prototype.setOptions = function(a) {
        a = void 0 === a ? {} : a;
        this.ca = void 0 === a.ca ? false : a.ca;
      };
      sb.prototype.reset = function() {
        this.h.reset();
        this.j = this.h.h;
        this.i = this.l = -1;
      };
      function tb(a) {
        var b = a.h;
        if (b.h == b.j)
          return false;
        a.j = a.h.h;
        var c = nb(a.h) >>> 0;
        b = c >>> 3;
        c &= 7;
        if (!(0 <= c && 5 >= c))
          throw Xa(c, a.j);
        if (1 > b)
          throw Error("Invalid field number: " + b + " (at position " + a.j + ")");
        a.l = b;
        a.i = c;
        return true;
      }
      function ub(a) {
        switch (a.i) {
          case 0:
            if (0 != a.i)
              ub(a);
            else
              a: {
                a = a.h;
                for (var b = a.h, c = b + 10, d = a.i; b < c; )
                  if (0 === (d[b++] & 128)) {
                    M(a, b);
                    break a;
                  }
                throw Ya();
              }
            break;
          case 1:
            a = a.h;
            M(a, a.h + 8);
            break;
          case 2:
            2 != a.i ? ub(a) : (b = nb(a.h) >>> 0, a = a.h, M(a, a.h + b));
            break;
          case 5:
            a = a.h;
            M(a, a.h + 4);
            break;
          case 3:
            b = a.l;
            do {
              if (!tb(a))
                throw Error("Unmatched start-group tag: stream EOF");
              if (4 == a.i) {
                if (a.l != b)
                  throw Error("Unmatched end-group tag");
                break;
              }
              ub(a);
            } while (1);
            break;
          default:
            throw Xa(a.i, a.j);
        }
      }
      var vb = [];
      function wb() {
        this.j = [];
        this.i = 0;
        this.h = new qb();
      }
      function O(a, b) {
        0 !== b.length && (a.j.push(b), a.i += b.length);
      }
      function xb(a, b) {
        if (b = b.R) {
          O(a, a.h.end());
          for (var c = 0; c < b.length; c++)
            O(a, jb(b[c]) || Oa());
        }
      }
      ;
      var P = "function" === typeof Symbol && "symbol" === typeof Symbol() ? Symbol() : void 0;
      function Q(a, b) {
        if (P)
          return a[P] |= b;
        if (void 0 !== a.A)
          return a.A |= b;
        Object.defineProperties(a, { A: { value: b, configurable: true, writable: true, enumerable: false } });
        return b;
      }
      function yb(a, b) {
        P ? a[P] && (a[P] &= ~b) : void 0 !== a.A && (a.A &= ~b);
      }
      function R(a) {
        var b;
        P ? b = a[P] : b = a.A;
        return null == b ? 0 : b;
      }
      function S(a, b) {
        P ? a[P] = b : void 0 !== a.A ? a.A = b : Object.defineProperties(a, { A: { value: b, configurable: true, writable: true, enumerable: false } });
      }
      function zb(a) {
        Q(a, 1);
        return a;
      }
      function Ab(a, b) {
        S(b, (a | 0) & -51);
      }
      function Bb(a, b) {
        S(b, (a | 18) & -41);
      }
      ;
      var Cb = {};
      function Db(a) {
        return null !== a && "object" === typeof a && !Array.isArray(a) && a.constructor === Object;
      }
      var Eb, Fb = [];
      S(Fb, 23);
      Eb = Object.freeze(Fb);
      function Gb(a) {
        if (R(a.o) & 2)
          throw Error("Cannot mutate an immutable Message");
      }
      function Hb(a) {
        var b = a.length;
        (b = b ? a[b - 1] : void 0) && Db(b) ? b.g = 1 : (b = {}, a.push((b.g = 1, b)));
      }
      ;
      function Ib(a) {
        var b = a.i + a.G;
        return a.B || (a.B = a.o[b] = {});
      }
      function T(a, b) {
        return -1 === b ? null : b >= a.i ? a.B ? a.B[b] : void 0 : a.o[b + a.G];
      }
      function V(a, b, c, d) {
        Gb(a);
        Jb(a, b, c, d);
      }
      function Jb(a, b, c, d) {
        a.j && (a.j = void 0);
        b >= a.i || d ? Ib(a)[b] = c : (a.o[b + a.G] = c, (a = a.B) && b in a && delete a[b]);
      }
      function Kb(a, b, c, d) {
        var e = T(a, b);
        Array.isArray(e) || (e = Eb);
        var g = R(e);
        g & 1 || zb(e);
        if (d)
          g & 2 || Q(e, 2), c & 1 || Object.freeze(e);
        else {
          d = !(c & 2);
          var f = g & 2;
          c & 1 || !f ? d && g & 16 && !f && yb(e, 16) : (e = zb(Array.prototype.slice.call(e)), Jb(a, b, e));
        }
        return e;
      }
      function Lb(a, b) {
        var c = T(a, b);
        var d = null == c ? c : "number" === typeof c || "NaN" === c || "Infinity" === c || "-Infinity" === c ? Number(c) : void 0;
        null != d && d !== c && Jb(a, b, d);
        return d;
      }
      function Mb(a, b, c, d, e) {
        a.h || (a.h = {});
        var g = a.h[c], f = Kb(a, c, 3, e);
        if (!g) {
          var h = f;
          g = [];
          var k = !!(R(a.o) & 16);
          f = !!(R(h) & 2);
          var l = h;
          !e && f && (h = Array.prototype.slice.call(h));
          for (var m = f, r = 0; r < h.length; r++) {
            var p = h[r];
            var n = b, q = false;
            q = void 0 === q ? false : q;
            p = Array.isArray(p) ? new n(p) : q ? new n() : void 0;
            if (void 0 !== p) {
              n = p.o;
              var t = q = R(n);
              f && (t |= 2);
              k && (t |= 16);
              t != q && S(n, t);
              n = t;
              m = m || !!(2 & n);
              g.push(p);
            }
          }
          a.h[c] = g;
          k = R(h);
          b = k | 33;
          b = m ? b & -9 : b | 8;
          k != b && (m = h, Object.isFrozen(m) && (m = Array.prototype.slice.call(m)), S(m, b), h = m);
          l !== h && Jb(
            a,
            c,
            h
          );
          (e || d && f) && Q(g, 2);
          d && Object.freeze(g);
          return g;
        }
        e || (e = Object.isFrozen(g), d && !e ? Object.freeze(g) : !d && e && (g = Array.prototype.slice.call(g), a.h[c] = g));
        return g;
      }
      function Nb(a, b, c) {
        var d = !!(R(a.o) & 2);
        b = Mb(a, b, c, d, d);
        a = Kb(a, c, 3, d);
        if (!(d || R(a) & 8)) {
          for (d = 0; d < b.length; d++) {
            c = b[d];
            if (R(c.o) & 2) {
              var e = Ob(c, false);
              e.j = c;
            } else
              e = c;
            c !== e && (b[d] = e, a[d] = e.o);
          }
          Q(a, 8);
        }
        return b;
      }
      function W(a, b, c) {
        if (null != c && "number" !== typeof c)
          throw Error("Value of float/double field must be a number|null|undefined, found " + typeof c + ": " + c);
        V(a, b, c);
      }
      function Pb(a, b, c, d, e) {
        Gb(a);
        var g = Mb(a, c, b, false, false);
        c = null != d ? d : new c();
        a = Kb(a, b, 2, false);
        void 0 != e ? (g.splice(e, 0, c), a.splice(e, 0, c.o)) : (g.push(c), a.push(c.o));
        c.C() && yb(a, 8);
        return c;
      }
      function Qb(a, b) {
        return null == a ? b : a;
      }
      function X(a, b, c) {
        c = void 0 === c ? 0 : c;
        return Qb(Lb(a, b), c);
      }
      ;
      var Rb;
      function Sb(a) {
        switch (typeof a) {
          case "number":
            return isFinite(a) ? a : String(a);
          case "object":
            if (a)
              if (Array.isArray(a)) {
                if (0 !== (R(a) & 128))
                  return a = Array.prototype.slice.call(a), Hb(a), a;
              } else {
                if (Ha && null != a && a instanceof Uint8Array)
                  return Ja(a);
                if (a instanceof hb) {
                  var b = a.V;
                  return null == b ? "" : "string" === typeof b ? b : a.V = Ja(b);
                }
              }
        }
        return a;
      }
      ;
      function Tb(a, b, c, d) {
        if (null != a) {
          if (Array.isArray(a))
            a = Ub(a, b, c, void 0 !== d);
          else if (Db(a)) {
            var e = {}, g;
            for (g in a)
              e[g] = Tb(a[g], b, c, d);
            a = e;
          } else
            a = b(a, d);
          return a;
        }
      }
      function Ub(a, b, c, d) {
        var e = R(a);
        d = d ? !!(e & 16) : void 0;
        a = Array.prototype.slice.call(a);
        for (var g = 0; g < a.length; g++)
          a[g] = Tb(a[g], b, c, d);
        c(e, a);
        return a;
      }
      function Vb(a) {
        return a.ja === Cb ? a.toJSON() : Sb(a);
      }
      function Wb(a, b) {
        a & 128 && Hb(b);
      }
      ;
      function Xb(a, b, c) {
        c = void 0 === c ? Bb : c;
        if (null != a) {
          if (Ha && a instanceof Uint8Array)
            return a.length ? new hb(new Uint8Array(a), Pa) : ib();
          if (Array.isArray(a)) {
            var d = R(a);
            if (d & 2)
              return a;
            if (b && !(d & 32) && (d & 16 || 0 === d))
              return S(a, d | 2), a;
            a = Ub(a, Xb, d & 4 ? Bb : c, true);
            b = R(a);
            b & 4 && b & 2 && Object.freeze(a);
            return a;
          }
          return a.ja === Cb ? Yb(a) : a;
        }
      }
      function Zb(a, b, c, d, e, g, f) {
        if (a = a.h && a.h[c]) {
          d = R(a);
          d & 2 ? d = a : (g = Ba(a, Yb), Bb(d, g), Object.freeze(g), d = g);
          Gb(b);
          f = null == d ? Eb : zb([]);
          if (null != d) {
            g = !!d.length;
            for (a = 0; a < d.length; a++) {
              var h = d[a];
              g = g && !(R(h.o) & 2);
              f[a] = h.o;
            }
            g = (g ? 8 : 0) | 1;
            a = R(f);
            (a & g) !== g && (Object.isFrozen(f) && (f = Array.prototype.slice.call(f)), S(f, a | g));
            b.h || (b.h = {});
            b.h[c] = d;
          } else
            b.h && (b.h[c] = void 0);
          Jb(b, c, f, e);
        } else
          V(b, c, Xb(d, g, f), e);
      }
      function Yb(a) {
        if (R(a.o) & 2)
          return a;
        a = Ob(a, true);
        Q(a.o, 2);
        return a;
      }
      function Ob(a, b) {
        var c = a.o, d = [];
        Q(d, 16);
        var e = a.constructor.h;
        e && d.push(e);
        e = a.B;
        if (e) {
          d.length = c.length;
          d.fill(void 0, d.length, c.length);
          var g = {};
          d[d.length - 1] = g;
        }
        0 !== (R(c) & 128) && Hb(d);
        b = b || a.C() ? Bb : Ab;
        g = a.constructor;
        Rb = d;
        d = new g(d);
        Rb = void 0;
        a.R && (d.R = a.R.slice());
        g = !!(R(c) & 16);
        for (var f = e ? c.length - 1 : c.length, h = 0; h < f; h++)
          Zb(a, d, h - a.G, c[h], false, g, b);
        if (e)
          for (var k in e)
            Zb(a, d, +k, e[k], true, g, b);
        return d;
      }
      ;
      function Y(a, b, c) {
        null == a && (a = Rb);
        Rb = void 0;
        var d = this.constructor.i || 0, e = 0 < d, g = this.constructor.h, f = false;
        if (null == a) {
          a = g ? [g] : [];
          var h = 48;
          var k = true;
          e && (d = 0, h |= 128);
          S(a, h);
        } else {
          if (!Array.isArray(a))
            throw Error();
          if (g && g !== a[0])
            throw Error();
          var l = h = Q(a, 0);
          if (k = 0 !== (16 & l))
            (f = 0 !== (32 & l)) || (l |= 32);
          if (e)
            if (128 & l)
              d = 0;
            else {
              if (0 < a.length) {
                var m = a[a.length - 1];
                if (Db(m) && "g" in m) {
                  d = 0;
                  l |= 128;
                  delete m.g;
                  var r = true, p;
                  for (p in m) {
                    r = false;
                    break;
                  }
                  r && a.pop();
                }
              }
            }
          else if (128 & l)
            throw Error();
          h !== l && S(a, l);
        }
        this.G = (g ? 0 : -1) - d;
        this.h = void 0;
        this.o = a;
        a: {
          g = this.o.length;
          d = g - 1;
          if (g && (g = this.o[d], Db(g))) {
            this.B = g;
            this.i = d - this.G;
            break a;
          }
          void 0 !== b && -1 < b ? (this.i = Math.max(b, d + 1 - this.G), this.B = void 0) : this.i = Number.MAX_VALUE;
        }
        if (!e && this.B && "g" in this.B)
          throw Error('Unexpected "g" flag in sparse object of message that is not a group type.');
        if (c) {
          b = k && !f && true;
          e = this.i;
          var n;
          for (k = 0; k < c.length; k++)
            f = c[k], f < e ? (f += this.G, (d = a[f]) ? $b(d, b) : a[f] = Eb) : (n || (n = Ib(this)), (d = n[f]) ? $b(d, b) : n[f] = Eb);
        }
      }
      Y.prototype.toJSON = function() {
        return Ub(this.o, Vb, Wb);
      };
      Y.prototype.C = function() {
        return !!(R(this.o) & 2);
      };
      function $b(a, b) {
        if (Array.isArray(a)) {
          var c = R(a), d = 1;
          !b || c & 2 || (d |= 16);
          (c & d) !== d && S(a, c | d);
        }
      }
      Y.prototype.ja = Cb;
      Y.prototype.toString = function() {
        return this.o.toString();
      };
      function ac(a, b, c) {
        if (c) {
          var d = {}, e;
          for (e in c) {
            var g = c[e], f = g.ra;
            f || (d.J = g.xa || g.oa.W, g.ia ? (d.aa = bc(g.ia), f = function(h) {
              return function(k, l, m) {
                return h.J(k, l, m, h.aa);
              };
            }(d)) : g.ka ? (d.Z = cc(g.da.P, g.ka), f = function(h) {
              return function(k, l, m) {
                return h.J(k, l, m, h.Z);
              };
            }(d)) : f = d.J, g.ra = f);
            f(b, a, g.da);
            d = { J: d.J, aa: d.aa, Z: d.Z };
          }
        }
        xb(b, a);
      }
      var dc = Symbol();
      function ec(a, b, c) {
        return a[dc] || (a[dc] = function(d, e) {
          return b(d, e, c);
        });
      }
      function fc(a) {
        var b = a[dc];
        if (!b) {
          var c = gc(a);
          b = function(d, e) {
            return hc(d, e, c);
          };
          a[dc] = b;
        }
        return b;
      }
      function ic(a) {
        var b = a.ia;
        if (b)
          return fc(b);
        if (b = a.wa)
          return ec(a.da.P, b, a.ka);
      }
      function jc(a) {
        var b = ic(a), c = a.da, d = a.oa.U;
        return b ? function(e, g) {
          return d(e, g, c, b);
        } : function(e, g) {
          return d(e, g, c);
        };
      }
      function kc(a, b) {
        var c = a[b];
        "function" == typeof c && 0 === c.length && (c = c(), a[b] = c);
        return Array.isArray(c) && (lc in c || mc in c || 0 < c.length && "function" == typeof c[0]) ? c : void 0;
      }
      function nc(a, b, c, d, e, g) {
        b.P = a[0];
        var f = 1;
        if (a.length > f && "number" !== typeof a[f]) {
          var h = a[f++];
          c(b, h);
        }
        for (; f < a.length; ) {
          c = a[f++];
          for (var k = f + 1; k < a.length && "number" !== typeof a[k]; )
            k++;
          h = a[f++];
          k -= f;
          switch (k) {
            case 0:
              d(b, c, h);
              break;
            case 1:
              (k = kc(a, f)) ? (f++, e(b, c, h, k)) : d(b, c, h, a[f++]);
              break;
            case 2:
              k = f++;
              k = kc(a, k);
              e(b, c, h, k, a[f++]);
              break;
            case 3:
              g(b, c, h, a[f++], a[f++], a[f++]);
              break;
            case 4:
              g(b, c, h, a[f++], a[f++], a[f++], a[f++]);
              break;
            default:
              throw Error("unexpected number of binary field arguments: " + k);
          }
        }
        return b;
      }
      var oc = Symbol();
      function bc(a) {
        var b = a[oc];
        if (!b) {
          var c = pc(a);
          b = function(d, e) {
            return qc(d, e, c);
          };
          a[oc] = b;
        }
        return b;
      }
      function cc(a, b) {
        var c = a[oc];
        c || (c = function(d, e) {
          return ac(d, e, b);
        }, a[oc] = c);
        return c;
      }
      var mc = Symbol();
      function rc(a, b) {
        a.push(b);
      }
      function sc(a, b, c) {
        a.push(b, c.W);
      }
      function tc(a, b, c, d) {
        var e = bc(d), g = pc(d).P, f = c.W;
        a.push(b, function(h, k, l) {
          return f(h, k, l, g, e);
        });
      }
      function uc(a, b, c, d, e, g) {
        var f = cc(d, g), h = c.W;
        a.push(b, function(k, l, m) {
          return h(k, l, m, d, f);
        });
      }
      function pc(a) {
        var b = a[mc];
        if (b)
          return b;
        b = nc(a, a[mc] = [], rc, sc, tc, uc);
        lc in a && mc in a && (a.length = 0);
        return b;
      }
      var lc = Symbol();
      function vc(a, b) {
        a[0] = b;
      }
      function wc(a, b, c, d) {
        var e = c.U;
        a[b] = d ? function(g, f, h) {
          return e(g, f, h, d);
        } : e;
      }
      function xc(a, b, c, d, e) {
        var g = c.U, f = fc(d), h = gc(d).P;
        a[b] = function(k, l, m) {
          return g(k, l, m, h, f, e);
        };
      }
      function yc(a, b, c, d, e, g, f) {
        var h = c.U, k = ec(d, e, g);
        a[b] = function(l, m, r) {
          return h(l, m, r, d, k, f);
        };
      }
      function gc(a) {
        var b = a[lc];
        if (b)
          return b;
        b = nc(a, a[lc] = {}, vc, wc, xc, yc);
        lc in a && mc in a && (a.length = 0);
        return b;
      }
      function hc(a, b, c) {
        for (; tb(b) && 4 != b.i; ) {
          var d = b.l, e = c[d];
          if (!e) {
            var g = c[0];
            g && (g = g[d]) && (e = c[d] = jc(g));
          }
          if (!e || !e(b, a, d)) {
            e = b;
            d = a;
            g = e.j;
            ub(e);
            var f = e;
            if (!f.ca) {
              e = f.h.h - g;
              f.h.h = g;
              f = f.h;
              if (0 == e)
                e = ib();
              else {
                g = ob(f, e);
                if (f.S && f.m)
                  e = f.i.subarray(g, g + e);
                else {
                  f = f.i;
                  var h = g;
                  e = g + e;
                  e = h === e ? Oa() : Qa ? f.slice(h, e) : new Uint8Array(f.subarray(h, e));
                }
                e = 0 == e.length ? ib() : new hb(e, Pa);
              }
              (g = d.R) ? g.push(e) : d.R = [e];
            }
          }
        }
        return a;
      }
      function qc(a, b, c) {
        for (var d = c.length, e = 1 == d % 2, g = e ? 1 : 0; g < d; g += 2)
          (0, c[g + 1])(b, a, c[g]);
        ac(a, b, e ? c[0] : void 0);
      }
      function zc(a, b) {
        return { U: a, W: b };
      }
      var Z = zc(function(a, b, c) {
        if (5 !== a.i)
          return false;
        a = a.h;
        var d = a.i, e = a.h, g = d[e];
        var f = d[e + 1];
        var h = d[e + 2];
        d = d[e + 3];
        M(a, a.h + 4);
        f = (g << 0 | f << 8 | h << 16 | d << 24) >>> 0;
        a = 2 * (f >> 31) + 1;
        g = f >>> 23 & 255;
        f &= 8388607;
        V(b, c, 255 == g ? f ? NaN : Infinity * a : 0 == g ? a * Math.pow(2, -149) * f : a * Math.pow(2, g - 150) * (f + Math.pow(2, 23)));
        return true;
      }, function(a, b, c) {
        b = Lb(b, c);
        if (null != b) {
          N(a.h, 8 * c + 5);
          a = a.h;
          var d = +b;
          0 === d ? 0 < 1 / d ? H = K = 0 : (K = 0, H = 2147483648) : isNaN(d) ? (K = 0, H = 2147483647) : (d = (c = 0 > d ? -2147483648 : 0) ? -d : d, 34028234663852886e22 < d ? (K = 0, H = (c | 2139095040) >>> 0) : 11754943508222875e-54 > d ? (d = Math.round(d / Math.pow(2, -149)), K = 0, H = (c | d) >>> 0) : (b = Math.floor(Math.log(d) / Math.LN2), d *= Math.pow(2, -b), d = Math.round(8388608 * d), 16777216 <= d && ++b, K = 0, H = (c | b + 127 << 23 | d & 8388607) >>> 0));
          c = H;
          a.h.push(c >>> 0 & 255);
          a.h.push(c >>> 8 & 255);
          a.h.push(c >>> 16 & 255);
          a.h.push(c >>> 24 & 255);
        }
      }), Ac = zc(function(a, b, c) {
        if (0 !== a.i)
          return false;
        var d = a.h, e = 0, g = a = 0, f = d.i, h = d.h;
        do {
          var k = f[h++];
          e |= (k & 127) << g;
          g += 7;
        } while (32 > g && k & 128);
        32 < g && (a |= (k & 127) >> 4);
        for (g = 3; 32 > g && k & 128; g += 7)
          k = f[h++], a |= (k & 127) << g;
        M(
          d,
          h
        );
        if (128 > k) {
          d = e >>> 0;
          k = a >>> 0;
          if (a = k & 2147483648)
            d = ~d + 1 >>> 0, k = ~k >>> 0, 0 == d && (k = k + 1 >>> 0);
          d = 4294967296 * k + (d >>> 0);
        } else
          throw Ya();
        V(b, c, a ? -d : d);
        return true;
      }, function(a, b, c) {
        b = T(b, c);
        null != b && ("string" === typeof b && Va(b), null != b && (N(a.h, 8 * c), "number" === typeof b ? (a = a.h, Ra(b), rb(a, H, K)) : (c = Va(b), rb(a.h, c.i, c.h))));
      }), Bc = zc(function(a, b, c) {
        if (0 !== a.i)
          return false;
        V(b, c, nb(a.h));
        return true;
      }, function(a, b, c) {
        b = T(b, c);
        if (null != b && null != b)
          if (N(a.h, 8 * c), a = a.h, c = b, 0 <= c)
            N(a, c);
          else {
            for (b = 0; 9 > b; b++)
              a.h.push(c & 127 | 128), c >>= 7;
            a.h.push(1);
          }
      }), Cc = zc(function(a, b, c) {
        if (2 !== a.i)
          return false;
        var d = nb(a.h) >>> 0;
        a = a.h;
        var e = ob(a, d);
        a = a.i;
        if (cb) {
          var g = a, f;
          (f = bb) || (f = bb = new TextDecoder("utf-8", { fatal: true }));
          a = e + d;
          g = 0 === e && a === g.length ? g : g.subarray(e, a);
          try {
            var h = f.decode(g);
          } catch (r) {
            if (void 0 === ab) {
              try {
                f.decode(new Uint8Array([128]));
              } catch (p) {
              }
              try {
                f.decode(new Uint8Array([97])), ab = true;
              } catch (p) {
                ab = false;
              }
            }
            !ab && (bb = void 0);
            throw r;
          }
        } else {
          h = e;
          d = h + d;
          e = [];
          for (var k = null, l, m; h < d; )
            l = a[h++], 128 > l ? e.push(l) : 224 > l ? h >= d ? L() : (m = a[h++], 194 > l || 128 !== (m & 192) ? (h--, L()) : e.push((l & 31) << 6 | m & 63)) : 240 > l ? h >= d - 1 ? L() : (m = a[h++], 128 !== (m & 192) || 224 === l && 160 > m || 237 === l && 160 <= m || 128 !== ((g = a[h++]) & 192) ? (h--, L()) : e.push((l & 15) << 12 | (m & 63) << 6 | g & 63)) : 244 >= l ? h >= d - 2 ? L() : (m = a[h++], 128 !== (m & 192) || 0 !== (l << 28) + (m - 144) >> 30 || 128 !== ((g = a[h++]) & 192) || 128 !== ((f = a[h++]) & 192) ? (h--, L()) : (l = (l & 7) << 18 | (m & 63) << 12 | (g & 63) << 6 | f & 63, l -= 65536, e.push((l >> 10 & 1023) + 55296, (l & 1023) + 56320))) : L(), 8192 <= e.length && (k = $a(k, e), e.length = 0);
          h = $a(k, e);
        }
        V(b, c, h);
        return true;
      }, function(a, b, c) {
        b = T(b, c);
        if (null != b) {
          var d = false;
          d = void 0 === d ? false : d;
          if (eb) {
            if (d && /(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(b))
              throw Error("Found an unpaired surrogate");
            b = (db || (db = new TextEncoder())).encode(b);
          } else {
            for (var e = 0, g = new Uint8Array(3 * b.length), f = 0; f < b.length; f++) {
              var h = b.charCodeAt(f);
              if (128 > h)
                g[e++] = h;
              else {
                if (2048 > h)
                  g[e++] = h >> 6 | 192;
                else {
                  if (55296 <= h && 57343 >= h) {
                    if (56319 >= h && f < b.length) {
                      var k = b.charCodeAt(++f);
                      if (56320 <= k && 57343 >= k) {
                        h = 1024 * (h - 55296) + k - 56320 + 65536;
                        g[e++] = h >> 18 | 240;
                        g[e++] = h >> 12 & 63 | 128;
                        g[e++] = h >> 6 & 63 | 128;
                        g[e++] = h & 63 | 128;
                        continue;
                      } else
                        f--;
                    }
                    if (d)
                      throw Error("Found an unpaired surrogate");
                    h = 65533;
                  }
                  g[e++] = h >> 12 | 224;
                  g[e++] = h >> 6 & 63 | 128;
                }
                g[e++] = h & 63 | 128;
              }
            }
            b = e === g.length ? g : g.subarray(0, e);
          }
          N(a.h, 8 * c + 2);
          N(a.h, b.length);
          O(a, a.h.end());
          O(a, b);
        }
      }), Dc = zc(function(a, b, c, d, e) {
        if (2 !== a.i)
          return false;
        b = Pb(b, c, d);
        c = a.h.j;
        d = nb(a.h) >>> 0;
        var g = a.h.h + d, f = g - c;
        0 >= f && (a.h.j = g, e(b, a, void 0, void 0, void 0), f = g - a.h.h);
        if (f)
          throw Error("Message parsing ended unexpectedly. Expected to read " + (d + " bytes, instead read " + (d - f) + " bytes, either the data ended unexpectedly or the message misreported its own length"));
        a.h.h = g;
        a.h.j = c;
        return true;
      }, function(a, b, c, d, e) {
        b = Nb(b, d, c);
        if (null != b)
          for (d = 0; d < b.length; d++) {
            var g = a;
            N(g.h, 8 * c + 2);
            var f = g.h.end();
            O(g, f);
            f.push(g.i);
            g = f;
            e(b[d], a);
            f = a;
            var h = g.pop();
            for (h = f.i + f.h.length() - h; 127 < h; )
              g.push(h & 127 | 128), h >>>= 7, f.i++;
            g.push(h);
            f.i++;
          }
      });
      function Ec(a) {
        return function(b, c) {
          a: {
            if (vb.length) {
              var d = vb.pop();
              d.setOptions(c);
              mb(d.h, b, c);
              b = d;
            } else
              b = new sb(b, c);
            try {
              var e = gc(a);
              var g = hc(new e.P(), b, e);
              break a;
            } finally {
              e = b.h, e.i = null, e.m = false, e.l = 0, e.j = 0, e.h = 0, e.S = false, b.l = -1, b.i = -1, 100 > vb.length && vb.push(b);
            }
            g = void 0;
          }
          return g;
        };
      }
      function Fc(a) {
        return function() {
          var b = new wb();
          qc(this, b, pc(a));
          O(b, b.h.end());
          for (var c = new Uint8Array(b.i), d = b.j, e = d.length, g = 0, f = 0; f < e; f++) {
            var h = d[f];
            c.set(h, g);
            g += h.length;
          }
          b.j = [c];
          return c;
        };
      }
      ;
      function Gc(a) {
        Y.call(this, a);
      }
      na(Gc, Y);
      var Hc = [Gc, 1, Bc, 2, Z, 3, Cc, 4, Cc];
      Gc.prototype.l = Fc(Hc);
      function Ic(a) {
        Y.call(this, a, -1, Jc);
      }
      na(Ic, Y);
      Ic.prototype.addClassification = function(a, b) {
        Pb(this, 1, Gc, a, b);
        return this;
      };
      var Jc = [1], Kc = Ec([Ic, 1, Dc, Hc]);
      function Lc(a) {
        Y.call(this, a);
      }
      na(Lc, Y);
      var Mc = [Lc, 1, Z, 2, Z, 3, Z, 4, Z, 5, Z];
      Lc.prototype.l = Fc(Mc);
      function Nc(a) {
        Y.call(this, a, -1, Oc);
      }
      na(Nc, Y);
      var Oc = [1], Pc = Ec([Nc, 1, Dc, Mc]);
      function Qc(a) {
        Y.call(this, a);
      }
      na(Qc, Y);
      var Rc = [Qc, 1, Z, 2, Z, 3, Z, 4, Z, 5, Z, 6, Ac], Sc = Ec(Rc);
      Qc.prototype.l = Fc(Rc);
      function Tc(a, b, c) {
        c = a.createShader(0 === c ? a.VERTEX_SHADER : a.FRAGMENT_SHADER);
        a.shaderSource(c, b);
        a.compileShader(c);
        if (!a.getShaderParameter(c, a.COMPILE_STATUS))
          throw Error("Could not compile WebGL shader.\n\n" + a.getShaderInfoLog(c));
        return c;
      }
      ;
      function Uc(a) {
        return Nb(a, Gc, 1).map(function(b) {
          var c = T(b, 1);
          return { index: null == c ? 0 : c, qa: X(b, 2), label: null != T(b, 3) ? Qb(T(b, 3), "") : void 0, displayName: null != T(b, 4) ? Qb(T(b, 4), "") : void 0 };
        });
      }
      ;
      function Vc(a) {
        return { x: X(a, 1), y: X(a, 2), z: X(a, 3), visibility: null != Lb(a, 4) ? X(a, 4) : void 0 };
      }
      function Wc(a) {
        return Nb(Pc(a), Lc, 1).map(Vc);
      }
      ;
      function Xc(a, b) {
        this.i = a;
        this.h = b;
        this.m = 0;
      }
      function Yc(a, b, c) {
        Zc(a, b);
        if ("function" === typeof a.h.canvas.transferToImageBitmap)
          return Promise.resolve(a.h.canvas.transferToImageBitmap());
        if (c)
          return Promise.resolve(a.h.canvas);
        if ("function" === typeof createImageBitmap)
          return createImageBitmap(a.h.canvas);
        void 0 === a.j && (a.j = document.createElement("canvas"));
        return new Promise(function(d) {
          a.j.height = a.h.canvas.height;
          a.j.width = a.h.canvas.width;
          a.j.getContext("2d", {}).drawImage(a.h.canvas, 0, 0, a.h.canvas.width, a.h.canvas.height);
          d(a.j);
        });
      }
      function Zc(a, b) {
        var c = a.h;
        if (void 0 === a.s) {
          var d = Tc(c, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", 0), e = Tc(c, "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D sampler0;\n  void main(){\n    gl_FragColor = texture2D(sampler0, vTex);\n  }", 1), g = c.createProgram();
          c.attachShader(g, d);
          c.attachShader(g, e);
          c.linkProgram(g);
          if (!c.getProgramParameter(g, c.LINK_STATUS))
            throw Error("Could not compile WebGL program.\n\n" + c.getProgramInfoLog(g));
          d = a.s = g;
          c.useProgram(d);
          e = c.getUniformLocation(d, "sampler0");
          a.l = { O: c.getAttribLocation(d, "aVertex"), N: c.getAttribLocation(d, "aTex"), ya: e };
          a.v = c.createBuffer();
          c.bindBuffer(c.ARRAY_BUFFER, a.v);
          c.enableVertexAttribArray(a.l.O);
          c.vertexAttribPointer(a.l.O, 2, c.FLOAT, false, 0, 0);
          c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), c.STATIC_DRAW);
          c.bindBuffer(c.ARRAY_BUFFER, null);
          a.u = c.createBuffer();
          c.bindBuffer(c.ARRAY_BUFFER, a.u);
          c.enableVertexAttribArray(a.l.N);
          c.vertexAttribPointer(
            a.l.N,
            2,
            c.FLOAT,
            false,
            0,
            0
          );
          c.bufferData(c.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), c.STATIC_DRAW);
          c.bindBuffer(c.ARRAY_BUFFER, null);
          c.uniform1i(e, 0);
        }
        d = a.l;
        c.useProgram(a.s);
        c.canvas.width = b.width;
        c.canvas.height = b.height;
        c.viewport(0, 0, b.width, b.height);
        c.activeTexture(c.TEXTURE0);
        a.i.bindTexture2d(b.glName);
        c.enableVertexAttribArray(d.O);
        c.bindBuffer(c.ARRAY_BUFFER, a.v);
        c.vertexAttribPointer(d.O, 2, c.FLOAT, false, 0, 0);
        c.enableVertexAttribArray(d.N);
        c.bindBuffer(c.ARRAY_BUFFER, a.u);
        c.vertexAttribPointer(
          d.N,
          2,
          c.FLOAT,
          false,
          0,
          0
        );
        c.bindFramebuffer(c.DRAW_FRAMEBUFFER ? c.DRAW_FRAMEBUFFER : c.FRAMEBUFFER, null);
        c.clearColor(0, 0, 0, 0);
        c.clear(c.COLOR_BUFFER_BIT);
        c.colorMask(true, true, true, true);
        c.drawArrays(c.TRIANGLE_FAN, 0, 4);
        c.disableVertexAttribArray(d.O);
        c.disableVertexAttribArray(d.N);
        c.bindBuffer(c.ARRAY_BUFFER, null);
        a.i.bindTexture2d(0);
      }
      function $c(a) {
        this.h = a;
      }
      ;
      var ad = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11]);
      function bd(a, b) {
        return b + a;
      }
      function cd(a, b) {
        window[a] = b;
      }
      function dd(a) {
        var b = document.createElement("script");
        b.setAttribute("src", a);
        b.setAttribute("crossorigin", "anonymous");
        return new Promise(function(c) {
          b.addEventListener("load", function() {
            c();
          }, false);
          b.addEventListener("error", function() {
            c();
          }, false);
          document.body.appendChild(b);
        });
      }
      function ed() {
        return E(function(a) {
          switch (a.h) {
            case 1:
              return a.s = 2, D(a, WebAssembly.instantiate(ad), 4);
            case 4:
              a.h = 3;
              a.s = 0;
              break;
            case 2:
              return a.s = 0, a.l = null, a.return(false);
            case 3:
              return a.return(true);
          }
        });
      }
      function fd(a) {
        this.h = a;
        this.listeners = {};
        this.l = {};
        this.L = {};
        this.s = {};
        this.v = {};
        this.M = this.u = this.ga = true;
        this.I = Promise.resolve();
        this.fa = "";
        this.D = {};
        this.locateFile = a && a.locateFile || bd;
        if ("object" === typeof window)
          var b = window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/";
        else if ("undefined" !== typeof location)
          b = location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/";
        else
          throw Error("solutions can only be loaded on a web page or in a web worker");
        this.ha = b;
        if (a.options) {
          b = A(Object.keys(a.options));
          for (var c = b.next(); !c.done; c = b.next()) {
            c = c.value;
            var d = a.options[c].default;
            void 0 !== d && (this.l[c] = "function" === typeof d ? d() : d);
          }
        }
      }
      x = fd.prototype;
      x.close = function() {
        this.j && this.j.delete();
        return Promise.resolve();
      };
      function gd(a) {
        var b, c, d, e, g, f, h, k, l, m, r;
        return E(function(p) {
          switch (p.h) {
            case 1:
              if (!a.ga)
                return p.return();
              b = void 0 === a.h.files ? [] : "function" === typeof a.h.files ? a.h.files(a.l) : a.h.files;
              return D(p, ed(), 2);
            case 2:
              c = p.i;
              if ("object" === typeof window)
                return cd("createMediapipeSolutionsWasm", { locateFile: a.locateFile }), cd("createMediapipeSolutionsPackedAssets", { locateFile: a.locateFile }), f = b.filter(function(n) {
                  return void 0 !== n.data;
                }), h = b.filter(function(n) {
                  return void 0 === n.data;
                }), k = Promise.all(f.map(function(n) {
                  var q = hd(a, n.url);
                  if (void 0 !== n.path) {
                    var t = n.path;
                    q = q.then(function(w) {
                      a.overrideFile(t, w);
                      return Promise.resolve(w);
                    });
                  }
                  return q;
                })), l = Promise.all(h.map(function(n) {
                  return void 0 === n.simd || n.simd && c || !n.simd && !c ? dd(a.locateFile(n.url, a.ha)) : Promise.resolve();
                })).then(function() {
                  var n, q, t;
                  return E(function(w) {
                    if (1 == w.h)
                      return n = window.createMediapipeSolutionsWasm, q = window.createMediapipeSolutionsPackedAssets, t = a, D(w, n(q), 2);
                    t.i = w.i;
                    w.h = 0;
                  });
                }), m = function() {
                  return E(function(n) {
                    a.h.graph && a.h.graph.url ? n = D(
                      n,
                      hd(a, a.h.graph.url),
                      0
                    ) : (n.h = 0, n = void 0);
                    return n;
                  });
                }(), D(p, Promise.all([l, k, m]), 7);
              if ("function" !== typeof importScripts)
                throw Error("solutions can only be loaded on a web page or in a web worker");
              d = b.filter(function(n) {
                return void 0 === n.simd || n.simd && c || !n.simd && !c;
              }).map(function(n) {
                return a.locateFile(n.url, a.ha);
              });
              importScripts.apply(null, ea(d));
              e = a;
              return D(p, createMediapipeSolutionsWasm(Module), 6);
            case 6:
              e.i = p.i;
              a.m = new OffscreenCanvas(1, 1);
              a.i.canvas = a.m;
              g = a.i.GL.createContext(a.m, {
                antialias: false,
                alpha: false,
                va: "undefined" !== typeof WebGL2RenderingContext ? 2 : 1
              });
              a.i.GL.makeContextCurrent(g);
              p.h = 4;
              break;
            case 7:
              a.m = document.createElement("canvas");
              r = a.m.getContext("webgl2", {});
              if (!r && (r = a.m.getContext("webgl", {}), !r))
                return alert("Failed to create WebGL canvas context when passing video frame."), p.return();
              a.K = r;
              a.i.canvas = a.m;
              a.i.createContext(a.m, true, true, {});
            case 4:
              a.j = new a.i.SolutionWasm(), a.ga = false, p.h = 0;
          }
        });
      }
      function id(a) {
        var b, c, d, e, g, f, h, k;
        return E(function(l) {
          if (1 == l.h) {
            if (a.h.graph && a.h.graph.url && a.fa === a.h.graph.url)
              return l.return();
            a.u = true;
            if (!a.h.graph || !a.h.graph.url) {
              l.h = 2;
              return;
            }
            a.fa = a.h.graph.url;
            return D(l, hd(a, a.h.graph.url), 3);
          }
          2 != l.h && (b = l.i, a.j.loadGraph(b));
          c = A(Object.keys(a.D));
          for (d = c.next(); !d.done; d = c.next())
            e = d.value, a.j.overrideFile(e, a.D[e]);
          a.D = {};
          if (a.h.listeners)
            for (g = A(a.h.listeners), f = g.next(); !f.done; f = g.next())
              h = f.value, jd(a, h);
          k = a.l;
          a.l = {};
          a.setOptions(k);
          l.h = 0;
        });
      }
      x.reset = function() {
        var a = this;
        return E(function(b) {
          a.j && (a.j.reset(), a.s = {}, a.v = {});
          b.h = 0;
        });
      };
      x.setOptions = function(a, b) {
        var c = this;
        if (b = b || this.h.options) {
          for (var d = [], e = [], g = {}, f = A(Object.keys(a)), h = f.next(); !h.done; g = { X: g.X, Y: g.Y }, h = f.next())
            if (h = h.value, !(h in this.l && this.l[h] === a[h])) {
              this.l[h] = a[h];
              var k = b[h];
              void 0 !== k && (k.onChange && (g.X = k.onChange, g.Y = a[h], d.push(function(l) {
                return function() {
                  var m;
                  return E(function(r) {
                    if (1 == r.h)
                      return D(r, l.X(l.Y), 2);
                    m = r.i;
                    true === m && (c.u = true);
                    r.h = 0;
                  });
                };
              }(g))), k.graphOptionXref && (h = Object.assign(
                {},
                { calculatorName: "", calculatorIndex: 0 },
                k.graphOptionXref,
                { valueNumber: 1 === k.type ? a[h] : 0, valueBoolean: 0 === k.type ? a[h] : false, valueString: 2 === k.type ? a[h] : "" }
              ), e.push(h)));
            }
          if (0 !== d.length || 0 !== e.length)
            this.u = true, this.H = (void 0 === this.H ? [] : this.H).concat(e), this.F = (void 0 === this.F ? [] : this.F).concat(d);
        }
      };
      function kd(a) {
        var b, c, d, e, g, f, h;
        return E(function(k) {
          switch (k.h) {
            case 1:
              if (!a.u)
                return k.return();
              if (!a.F) {
                k.h = 2;
                break;
              }
              b = A(a.F);
              c = b.next();
            case 3:
              if (c.done) {
                k.h = 5;
                break;
              }
              d = c.value;
              return D(k, d(), 4);
            case 4:
              c = b.next();
              k.h = 3;
              break;
            case 5:
              a.F = void 0;
            case 2:
              if (a.H) {
                e = new a.i.GraphOptionChangeRequestList();
                g = A(a.H);
                for (f = g.next(); !f.done; f = g.next())
                  h = f.value, e.push_back(h);
                a.j.changeOptions(e);
                e.delete();
                a.H = void 0;
              }
              a.u = false;
              k.h = 0;
          }
        });
      }
      x.initialize = function() {
        var a = this;
        return E(function(b) {
          return 1 == b.h ? D(b, gd(a), 2) : 3 != b.h ? D(b, id(a), 3) : D(b, kd(a), 0);
        });
      };
      function hd(a, b) {
        var c, d;
        return E(function(e) {
          if (b in a.L)
            return e.return(a.L[b]);
          c = a.locateFile(b, "");
          d = fetch(c).then(function(g) {
            return g.arrayBuffer();
          });
          a.L[b] = d;
          return e.return(d);
        });
      }
      x.overrideFile = function(a, b) {
        this.j ? this.j.overrideFile(a, b) : this.D[a] = b;
      };
      x.clearOverriddenFiles = function() {
        this.D = {};
        this.j && this.j.clearOverriddenFiles();
      };
      x.send = function(a, b) {
        var c = this, d, e, g, f, h, k, l, m, r;
        return E(function(p) {
          switch (p.h) {
            case 1:
              if (!c.h.inputs)
                return p.return();
              d = 1e3 * (void 0 === b || null === b ? performance.now() : b);
              return D(p, c.I, 2);
            case 2:
              return D(p, c.initialize(), 3);
            case 3:
              e = new c.i.PacketDataList();
              g = A(Object.keys(a));
              for (f = g.next(); !f.done; f = g.next())
                if (h = f.value, k = c.h.inputs[h]) {
                  a: {
                    var n = a[h];
                    switch (k.type) {
                      case "video":
                        var q = c.s[k.stream];
                        q || (q = new Xc(c.i, c.K), c.s[k.stream] = q);
                        0 === q.m && (q.m = q.i.createTexture());
                        if ("undefined" !== typeof HTMLVideoElement && n instanceof HTMLVideoElement) {
                          var t = n.videoWidth;
                          var w = n.videoHeight;
                        } else
                          "undefined" !== typeof HTMLImageElement && n instanceof HTMLImageElement ? (t = n.naturalWidth, w = n.naturalHeight) : (t = n.width, w = n.height);
                        w = { glName: q.m, width: t, height: w };
                        t = q.h;
                        t.canvas.width = w.width;
                        t.canvas.height = w.height;
                        t.activeTexture(t.TEXTURE0);
                        q.i.bindTexture2d(q.m);
                        t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, n);
                        q.i.bindTexture2d(0);
                        q = w;
                        break a;
                      case "detections":
                        q = c.s[k.stream];
                        q || (q = new $c(c.i), c.s[k.stream] = q);
                        q.data || (q.data = new q.h.DetectionListData());
                        q.data.reset(n.length);
                        for (w = 0; w < n.length; ++w) {
                          t = n[w];
                          var v = q.data, B = v.setBoundingBox, J = w;
                          var I = t.la;
                          var u = new Qc();
                          W(u, 1, I.sa);
                          W(u, 2, I.ta);
                          W(u, 3, I.height);
                          W(u, 4, I.width);
                          W(u, 5, I.rotation);
                          V(u, 6, I.pa);
                          I = u.l();
                          B.call(v, J, I);
                          if (t.ea)
                            for (v = 0; v < t.ea.length; ++v) {
                              u = t.ea[v];
                              B = q.data;
                              J = B.addNormalizedLandmark;
                              I = w;
                              u = Object.assign({}, u, { visibility: u.visibility ? u.visibility : 0 });
                              var C = new Lc();
                              W(C, 1, u.x);
                              W(C, 2, u.y);
                              W(C, 3, u.z);
                              u.visibility && W(C, 4, u.visibility);
                              u = C.l();
                              J.call(
                                B,
                                I,
                                u
                              );
                            }
                          if (t.ba)
                            for (v = 0; v < t.ba.length; ++v)
                              B = q.data, J = B.addClassification, I = w, u = t.ba[v], C = new Gc(), W(C, 2, u.qa), u.index && V(C, 1, u.index), u.label && V(C, 3, u.label), u.displayName && V(C, 4, u.displayName), u = C.l(), J.call(B, I, u);
                        }
                        q = q.data;
                        break a;
                      default:
                        q = {};
                    }
                  }
                  l = q;
                  m = k.stream;
                  switch (k.type) {
                    case "video":
                      e.pushTexture2d(Object.assign({}, l, { stream: m, timestamp: d }));
                      break;
                    case "detections":
                      r = l;
                      r.stream = m;
                      r.timestamp = d;
                      e.pushDetectionList(r);
                      break;
                    default:
                      throw Error("Unknown input config type: '" + k.type + "'");
                  }
                }
              c.j.send(e);
              return D(p, c.I, 4);
            case 4:
              e.delete(), p.h = 0;
          }
        });
      };
      function ld(a, b, c) {
        var d, e, g, f, h, k, l, m, r, p, n, q, t, w;
        return E(function(v) {
          switch (v.h) {
            case 1:
              if (!c)
                return v.return(b);
              d = {};
              e = 0;
              g = A(Object.keys(c));
              for (f = g.next(); !f.done; f = g.next())
                h = f.value, k = c[h], "string" !== typeof k && "texture" === k.type && void 0 !== b[k.stream] && ++e;
              1 < e && (a.M = false);
              l = A(Object.keys(c));
              f = l.next();
            case 2:
              if (f.done) {
                v.h = 4;
                break;
              }
              m = f.value;
              r = c[m];
              if ("string" === typeof r)
                return t = d, w = m, D(v, md(a, m, b[r]), 14);
              p = b[r.stream];
              if ("detection_list" === r.type) {
                if (p) {
                  var B = p.getRectList();
                  for (var J = p.getLandmarksList(), I = p.getClassificationsList(), u = [], C = 0; C < B.size(); ++C) {
                    var U = Sc(B.get(C)), pd = X(U, 1), qd = X(U, 2), rd = X(U, 3), sd = X(U, 4), td = X(U, 5, 0), za = void 0;
                    za = void 0 === za ? 0 : za;
                    U = { la: { sa: pd, ta: qd, height: rd, width: sd, rotation: td, pa: Qb(T(U, 6), za) }, ea: Wc(J.get(C)), ba: Uc(Kc(I.get(C))) };
                    u.push(U);
                  }
                  B = u;
                } else
                  B = [];
                d[m] = B;
                v.h = 7;
                break;
              }
              if ("proto_list" === r.type) {
                if (p) {
                  B = Array(p.size());
                  for (J = 0; J < p.size(); J++)
                    B[J] = p.get(J);
                  p.delete();
                } else
                  B = [];
                d[m] = B;
                v.h = 7;
                break;
              }
              if (void 0 === p) {
                v.h = 3;
                break;
              }
              if ("float_list" === r.type) {
                d[m] = p;
                v.h = 7;
                break;
              }
              if ("proto" === r.type) {
                d[m] = p;
                v.h = 7;
                break;
              }
              if ("texture" !== r.type)
                throw Error("Unknown output config type: '" + r.type + "'");
              n = a.v[m];
              n || (n = new Xc(a.i, a.K), a.v[m] = n);
              return D(v, Yc(n, p, a.M), 13);
            case 13:
              q = v.i, d[m] = q;
            case 7:
              r.transform && d[m] && (d[m] = r.transform(d[m]));
              v.h = 3;
              break;
            case 14:
              t[w] = v.i;
            case 3:
              f = l.next();
              v.h = 2;
              break;
            case 4:
              return v.return(d);
          }
        });
      }
      function md(a, b, c) {
        var d;
        return E(function(e) {
          return "number" === typeof c || c instanceof Uint8Array || c instanceof a.i.Uint8BlobList ? e.return(c) : c instanceof a.i.Texture2dDataOut ? (d = a.v[b], d || (d = new Xc(a.i, a.K), a.v[b] = d), e.return(Yc(d, c, a.M))) : e.return(void 0);
        });
      }
      function jd(a, b) {
        for (var c = b.name || "$", d = [].concat(ea(b.wants)), e = new a.i.StringList(), g = A(b.wants), f = g.next(); !f.done; f = g.next())
          e.push_back(f.value);
        g = a.i.PacketListener.implement({ onResults: function(h) {
          for (var k = {}, l = 0; l < b.wants.length; ++l)
            k[d[l]] = h.get(l);
          var m = a.listeners[c];
          m && (a.I = ld(a, k, b.outs).then(function(r) {
            r = m(r);
            for (var p = 0; p < b.wants.length; ++p) {
              var n = k[d[p]];
              "object" === typeof n && n.hasOwnProperty && n.hasOwnProperty("delete") && n.delete();
            }
            r && (a.I = r);
          }));
        } });
        a.j.attachMultiListener(e, g);
        e.delete();
      }
      x.onResults = function(a, b) {
        this.listeners[b || "$"] = a;
      };
      G("Solution", fd);
      G("OptionType", { BOOL: 0, NUMBER: 1, ua: 2, 0: "BOOL", 1: "NUMBER", 2: "STRING" });
      function nd(a) {
        void 0 === a && (a = 0);
        switch (a) {
          case 1:
            return "pose_landmark_full.tflite";
          case 2:
            return "pose_landmark_heavy.tflite";
          default:
            return "pose_landmark_lite.tflite";
        }
      }
      function od(a) {
        var b = this;
        a = a || {};
        this.h = new fd({ locateFile: a.locateFile, files: function(c) {
          return [{ url: "pose_solution_packed_assets_loader.js" }, { simd: false, url: "pose_solution_wasm_bin.js" }, { simd: true, url: "pose_solution_simd_wasm_bin.js" }, { data: true, url: nd(c.modelComplexity) }];
        }, graph: { url: "pose_web.binarypb" }, listeners: [{ wants: ["pose_landmarks", "world_landmarks", "segmentation_mask", "image_transformed"], outs: { image: { type: "texture", stream: "image_transformed" }, poseLandmarks: {
          type: "proto",
          stream: "pose_landmarks",
          transform: Wc
        }, poseWorldLandmarks: { type: "proto", stream: "world_landmarks", transform: Wc }, segmentationMask: { type: "texture", stream: "segmentation_mask" } } }], inputs: { image: { type: "video", stream: "input_frames_gpu" } }, options: {
          useCpuInference: { type: 0, graphOptionXref: { calculatorType: "InferenceCalculator", fieldName: "use_cpu_inference" }, default: "object" !== typeof window || void 0 === window.navigator ? false : "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document },
          selfieMode: { type: 0, graphOptionXref: { calculatorType: "GlScalerCalculator", calculatorIndex: 1, fieldName: "flip_horizontal" } },
          modelComplexity: { type: 1, graphOptionXref: { calculatorType: "ConstantSidePacketCalculator", calculatorName: "ConstantSidePacketCalculatorModelComplexity", fieldName: "int_value" }, onChange: function(c) {
            var d, e, g;
            return E(function(f) {
              if (1 == f.h)
                return d = nd(c), e = "third_party/mediapipe/modules/pose_landmark/" + d, D(f, hd(b.h, d), 2);
              g = f.i;
              b.h.overrideFile(e, g);
              return f.return(true);
            });
          } },
          smoothLandmarks: { type: 0, graphOptionXref: { calculatorType: "ConstantSidePacketCalculator", calculatorName: "ConstantSidePacketCalculatorSmoothLandmarks", fieldName: "bool_value" } },
          enableSegmentation: { type: 0, graphOptionXref: { calculatorType: "ConstantSidePacketCalculator", calculatorName: "ConstantSidePacketCalculatorEnableSegmentation", fieldName: "bool_value" } },
          smoothSegmentation: { type: 0, graphOptionXref: {
            calculatorType: "ConstantSidePacketCalculator",
            calculatorName: "ConstantSidePacketCalculatorSmoothSegmentation",
            fieldName: "bool_value"
          } },
          minDetectionConfidence: { type: 1, graphOptionXref: { calculatorType: "TensorsToDetectionsCalculator", calculatorName: "poselandmarkgpu__posedetectiongpu__TensorsToDetectionsCalculator", fieldName: "min_score_thresh" } },
          minTrackingConfidence: { type: 1, graphOptionXref: { calculatorType: "ThresholdingCalculator", calculatorName: "poselandmarkgpu__poselandmarkbyroigpu__tensorstoposelandmarksandsegmentation__ThresholdingCalculator", fieldName: "threshold" } }
        } });
      }
      x = od.prototype;
      x.reset = function() {
        this.h.reset();
      };
      x.close = function() {
        this.h.close();
        return Promise.resolve();
      };
      x.onResults = function(a) {
        this.h.onResults(a);
      };
      x.initialize = function() {
        var a = this;
        return E(function(b) {
          return D(b, a.h.initialize(), 0);
        });
      };
      x.send = function(a, b) {
        var c = this;
        return E(function(d) {
          return D(d, c.h.send(a, b), 0);
        });
      };
      x.setOptions = function(a) {
        this.h.setOptions(a);
      };
      G("Pose", od);
      G("POSE_CONNECTIONS", [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]]);
      G("POSE_LANDMARKS", { NOSE: 0, LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3, RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6, LEFT_EAR: 7, RIGHT_EAR: 8, LEFT_RIGHT: 9, RIGHT_LEFT: 10, LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_ELBOW: 13, RIGHT_ELBOW: 14, LEFT_WRIST: 15, RIGHT_WRIST: 16, LEFT_PINKY: 17, RIGHT_PINKY: 18, LEFT_INDEX: 19, RIGHT_INDEX: 20, LEFT_THUMB: 21, RIGHT_THUMB: 22, LEFT_HIP: 23, RIGHT_HIP: 24, LEFT_KNEE: 25, RIGHT_KNEE: 26, LEFT_ANKLE: 27, RIGHT_ANKLE: 28, LEFT_HEEL: 29, RIGHT_HEEL: 30, LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32 });
      G("POSE_LANDMARKS_LEFT", { LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3, LEFT_EAR: 7, LEFT_RIGHT: 9, LEFT_SHOULDER: 11, LEFT_ELBOW: 13, LEFT_WRIST: 15, LEFT_PINKY: 17, LEFT_INDEX: 19, LEFT_THUMB: 21, LEFT_HIP: 23, LEFT_KNEE: 25, LEFT_ANKLE: 27, LEFT_HEEL: 29, LEFT_FOOT_INDEX: 31 });
      G("POSE_LANDMARKS_RIGHT", { RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6, RIGHT_EAR: 8, RIGHT_LEFT: 10, RIGHT_SHOULDER: 12, RIGHT_ELBOW: 14, RIGHT_WRIST: 16, RIGHT_PINKY: 18, RIGHT_INDEX: 20, RIGHT_THUMB: 22, RIGHT_HIP: 24, RIGHT_KNEE: 26, RIGHT_ANKLE: 28, RIGHT_HEEL: 30, RIGHT_FOOT_INDEX: 32 });
      G("POSE_LANDMARKS_NEUTRAL", { NOSE: 0 });
      G("VERSION", "0.5.1675469404");
    }).call(exports);
  }
});
export default require_pose();
//# sourceMappingURL=@mediapipe_pose.js.map
