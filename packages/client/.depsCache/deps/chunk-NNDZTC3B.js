import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/bowser/es5.js
var require_es5 = __commonJS({
  "../../node_modules/bowser/es5.js"(exports, module) {
    !function(e, t) {
      "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.bowser = t() : e.bowser = t();
    }(exports, function() {
      return function(e) {
        var t = {};
        function r(n) {
          if (t[n])
            return t[n].exports;
          var i = t[n] = { i: n, l: false, exports: {} };
          return e[n].call(i.exports, i, i.exports, r), i.l = true, i.exports;
        }
        return r.m = e, r.c = t, r.d = function(e2, t2, n) {
          r.o(e2, t2) || Object.defineProperty(e2, t2, { enumerable: true, get: n });
        }, r.r = function(e2) {
          "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
        }, r.t = function(e2, t2) {
          if (1 & t2 && (e2 = r(e2)), 8 & t2)
            return e2;
          if (4 & t2 && "object" == typeof e2 && e2 && e2.__esModule)
            return e2;
          var n = /* @__PURE__ */ Object.create(null);
          if (r.r(n), Object.defineProperty(n, "default", { enumerable: true, value: e2 }), 2 & t2 && "string" != typeof e2)
            for (var i in e2)
              r.d(n, i, function(t3) {
                return e2[t3];
              }.bind(null, i));
          return n;
        }, r.n = function(e2) {
          var t2 = e2 && e2.__esModule ? function() {
            return e2.default;
          } : function() {
            return e2;
          };
          return r.d(t2, "a", t2), t2;
        }, r.o = function(e2, t2) {
          return Object.prototype.hasOwnProperty.call(e2, t2);
        }, r.p = "", r(r.s = 90);
      }({ 17: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n = r(18), i = function() {
          function e2() {
          }
          return e2.getFirstMatch = function(e3, t2) {
            var r2 = t2.match(e3);
            return r2 && r2.length > 0 && r2[1] || "";
          }, e2.getSecondMatch = function(e3, t2) {
            var r2 = t2.match(e3);
            return r2 && r2.length > 1 && r2[2] || "";
          }, e2.matchAndReturnConst = function(e3, t2, r2) {
            if (e3.test(t2))
              return r2;
          }, e2.getWindowsVersionName = function(e3) {
            switch (e3) {
              case "NT":
                return "NT";
              case "XP":
                return "XP";
              case "NT 5.0":
                return "2000";
              case "NT 5.1":
                return "XP";
              case "NT 5.2":
                return "2003";
              case "NT 6.0":
                return "Vista";
              case "NT 6.1":
                return "7";
              case "NT 6.2":
                return "8";
              case "NT 6.3":
                return "8.1";
              case "NT 10.0":
                return "10";
              default:
                return;
            }
          }, e2.getMacOSVersionName = function(e3) {
            var t2 = e3.split(".").splice(0, 2).map(function(e4) {
              return parseInt(e4, 10) || 0;
            });
            if (t2.push(0), 10 === t2[0])
              switch (t2[1]) {
                case 5:
                  return "Leopard";
                case 6:
                  return "Snow Leopard";
                case 7:
                  return "Lion";
                case 8:
                  return "Mountain Lion";
                case 9:
                  return "Mavericks";
                case 10:
                  return "Yosemite";
                case 11:
                  return "El Capitan";
                case 12:
                  return "Sierra";
                case 13:
                  return "High Sierra";
                case 14:
                  return "Mojave";
                case 15:
                  return "Catalina";
                default:
                  return;
              }
          }, e2.getAndroidVersionName = function(e3) {
            var t2 = e3.split(".").splice(0, 2).map(function(e4) {
              return parseInt(e4, 10) || 0;
            });
            if (t2.push(0), !(1 === t2[0] && t2[1] < 5))
              return 1 === t2[0] && t2[1] < 6 ? "Cupcake" : 1 === t2[0] && t2[1] >= 6 ? "Donut" : 2 === t2[0] && t2[1] < 2 ? "Eclair" : 2 === t2[0] && 2 === t2[1] ? "Froyo" : 2 === t2[0] && t2[1] > 2 ? "Gingerbread" : 3 === t2[0] ? "Honeycomb" : 4 === t2[0] && t2[1] < 1 ? "Ice Cream Sandwich" : 4 === t2[0] && t2[1] < 4 ? "Jelly Bean" : 4 === t2[0] && t2[1] >= 4 ? "KitKat" : 5 === t2[0] ? "Lollipop" : 6 === t2[0] ? "Marshmallow" : 7 === t2[0] ? "Nougat" : 8 === t2[0] ? "Oreo" : 9 === t2[0] ? "Pie" : void 0;
          }, e2.getVersionPrecision = function(e3) {
            return e3.split(".").length;
          }, e2.compareVersions = function(t2, r2, n2) {
            void 0 === n2 && (n2 = false);
            var i2 = e2.getVersionPrecision(t2), s = e2.getVersionPrecision(r2), a = Math.max(i2, s), o = 0, u = e2.map([t2, r2], function(t3) {
              var r3 = a - e2.getVersionPrecision(t3), n3 = t3 + new Array(r3 + 1).join(".0");
              return e2.map(n3.split("."), function(e3) {
                return new Array(20 - e3.length).join("0") + e3;
              }).reverse();
            });
            for (n2 && (o = a - Math.min(i2, s)), a -= 1; a >= o; ) {
              if (u[0][a] > u[1][a])
                return 1;
              if (u[0][a] === u[1][a]) {
                if (a === o)
                  return 0;
                a -= 1;
              } else if (u[0][a] < u[1][a])
                return -1;
            }
          }, e2.map = function(e3, t2) {
            var r2, n2 = [];
            if (Array.prototype.map)
              return Array.prototype.map.call(e3, t2);
            for (r2 = 0; r2 < e3.length; r2 += 1)
              n2.push(t2(e3[r2]));
            return n2;
          }, e2.find = function(e3, t2) {
            var r2, n2;
            if (Array.prototype.find)
              return Array.prototype.find.call(e3, t2);
            for (r2 = 0, n2 = e3.length; r2 < n2; r2 += 1) {
              var i2 = e3[r2];
              if (t2(i2, r2))
                return i2;
            }
          }, e2.assign = function(e3) {
            for (var t2, r2, n2 = e3, i2 = arguments.length, s = new Array(i2 > 1 ? i2 - 1 : 0), a = 1; a < i2; a++)
              s[a - 1] = arguments[a];
            if (Object.assign)
              return Object.assign.apply(Object, [e3].concat(s));
            var o = function() {
              var e4 = s[t2];
              "object" == typeof e4 && null !== e4 && Object.keys(e4).forEach(function(t3) {
                n2[t3] = e4[t3];
              });
            };
            for (t2 = 0, r2 = s.length; t2 < r2; t2 += 1)
              o();
            return e3;
          }, e2.getBrowserAlias = function(e3) {
            return n.BROWSER_ALIASES_MAP[e3];
          }, e2.getBrowserTypeByAlias = function(e3) {
            return n.BROWSER_MAP[e3] || "";
          }, e2;
        }();
        t.default = i, e.exports = t.default;
      }, 18: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.ENGINE_MAP = t.OS_MAP = t.PLATFORMS_MAP = t.BROWSER_MAP = t.BROWSER_ALIASES_MAP = void 0;
        t.BROWSER_ALIASES_MAP = { "Amazon Silk": "amazon_silk", "Android Browser": "android", Bada: "bada", BlackBerry: "blackberry", Chrome: "chrome", Chromium: "chromium", Electron: "electron", Epiphany: "epiphany", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", "Internet Explorer": "ie", "K-Meleon": "k_meleon", Maxthon: "maxthon", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", Opera: "opera", "Opera Coast": "opera_coast", PhantomJS: "phantomjs", Puffin: "puffin", QupZilla: "qupzilla", QQ: "qq", QQLite: "qqlite", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", "Yandex Browser": "yandex", Roku: "roku" };
        t.BROWSER_MAP = { amazon_silk: "Amazon Silk", android: "Android Browser", bada: "Bada", blackberry: "BlackBerry", chrome: "Chrome", chromium: "Chromium", electron: "Electron", epiphany: "Epiphany", firefox: "Firefox", focus: "Focus", generic: "Generic", googlebot: "Googlebot", google_search: "Google Search", ie: "Internet Explorer", k_meleon: "K-Meleon", maxthon: "Maxthon", edge: "Microsoft Edge", mz: "MZ Browser", naver: "NAVER Whale Browser", opera: "Opera", opera_coast: "Opera Coast", phantomjs: "PhantomJS", puffin: "Puffin", qupzilla: "QupZilla", qq: "QQ Browser", qqlite: "QQ Browser Lite", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", sleipnir: "Sleipnir", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yandex: "Yandex Browser" };
        t.PLATFORMS_MAP = { tablet: "tablet", mobile: "mobile", desktop: "desktop", tv: "tv" };
        t.OS_MAP = { WindowsPhone: "Windows Phone", Windows: "Windows", MacOS: "macOS", iOS: "iOS", Android: "Android", WebOS: "WebOS", BlackBerry: "BlackBerry", Bada: "Bada", Tizen: "Tizen", Linux: "Linux", ChromeOS: "Chrome OS", PlayStation4: "PlayStation 4", Roku: "Roku" };
        t.ENGINE_MAP = { EdgeHTML: "EdgeHTML", Blink: "Blink", Trident: "Trident", Presto: "Presto", Gecko: "Gecko", WebKit: "WebKit" };
      }, 90: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n, i = (n = r(91)) && n.__esModule ? n : { default: n }, s = r(18);
        function a(e2, t2) {
          for (var r2 = 0; r2 < t2.length; r2++) {
            var n2 = t2[r2];
            n2.enumerable = n2.enumerable || false, n2.configurable = true, "value" in n2 && (n2.writable = true), Object.defineProperty(e2, n2.key, n2);
          }
        }
        var o = function() {
          function e2() {
          }
          var t2, r2, n2;
          return e2.getParser = function(e3, t3) {
            if (void 0 === t3 && (t3 = false), "string" != typeof e3)
              throw new Error("UserAgent should be a string");
            return new i.default(e3, t3);
          }, e2.parse = function(e3) {
            return new i.default(e3).getResult();
          }, t2 = e2, n2 = [{ key: "BROWSER_MAP", get: function() {
            return s.BROWSER_MAP;
          } }, { key: "ENGINE_MAP", get: function() {
            return s.ENGINE_MAP;
          } }, { key: "OS_MAP", get: function() {
            return s.OS_MAP;
          } }, { key: "PLATFORMS_MAP", get: function() {
            return s.PLATFORMS_MAP;
          } }], (r2 = null) && a(t2.prototype, r2), n2 && a(t2, n2), e2;
        }();
        t.default = o, e.exports = t.default;
      }, 91: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n = u(r(92)), i = u(r(93)), s = u(r(94)), a = u(r(95)), o = u(r(17));
        function u(e2) {
          return e2 && e2.__esModule ? e2 : { default: e2 };
        }
        var d = function() {
          function e2(e3, t3) {
            if (void 0 === t3 && (t3 = false), null == e3 || "" === e3)
              throw new Error("UserAgent parameter can't be empty");
            this._ua = e3, this.parsedResult = {}, true !== t3 && this.parse();
          }
          var t2 = e2.prototype;
          return t2.getUA = function() {
            return this._ua;
          }, t2.test = function(e3) {
            return e3.test(this._ua);
          }, t2.parseBrowser = function() {
            var e3 = this;
            this.parsedResult.browser = {};
            var t3 = o.default.find(n.default, function(t4) {
              if ("function" == typeof t4.test)
                return t4.test(e3);
              if (t4.test instanceof Array)
                return t4.test.some(function(t5) {
                  return e3.test(t5);
                });
              throw new Error("Browser's test function is not valid");
            });
            return t3 && (this.parsedResult.browser = t3.describe(this.getUA())), this.parsedResult.browser;
          }, t2.getBrowser = function() {
            return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
          }, t2.getBrowserName = function(e3) {
            return e3 ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
          }, t2.getBrowserVersion = function() {
            return this.getBrowser().version;
          }, t2.getOS = function() {
            return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
          }, t2.parseOS = function() {
            var e3 = this;
            this.parsedResult.os = {};
            var t3 = o.default.find(i.default, function(t4) {
              if ("function" == typeof t4.test)
                return t4.test(e3);
              if (t4.test instanceof Array)
                return t4.test.some(function(t5) {
                  return e3.test(t5);
                });
              throw new Error("Browser's test function is not valid");
            });
            return t3 && (this.parsedResult.os = t3.describe(this.getUA())), this.parsedResult.os;
          }, t2.getOSName = function(e3) {
            var t3 = this.getOS().name;
            return e3 ? String(t3).toLowerCase() || "" : t3 || "";
          }, t2.getOSVersion = function() {
            return this.getOS().version;
          }, t2.getPlatform = function() {
            return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
          }, t2.getPlatformType = function(e3) {
            void 0 === e3 && (e3 = false);
            var t3 = this.getPlatform().type;
            return e3 ? String(t3).toLowerCase() || "" : t3 || "";
          }, t2.parsePlatform = function() {
            var e3 = this;
            this.parsedResult.platform = {};
            var t3 = o.default.find(s.default, function(t4) {
              if ("function" == typeof t4.test)
                return t4.test(e3);
              if (t4.test instanceof Array)
                return t4.test.some(function(t5) {
                  return e3.test(t5);
                });
              throw new Error("Browser's test function is not valid");
            });
            return t3 && (this.parsedResult.platform = t3.describe(this.getUA())), this.parsedResult.platform;
          }, t2.getEngine = function() {
            return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
          }, t2.getEngineName = function(e3) {
            return e3 ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
          }, t2.parseEngine = function() {
            var e3 = this;
            this.parsedResult.engine = {};
            var t3 = o.default.find(a.default, function(t4) {
              if ("function" == typeof t4.test)
                return t4.test(e3);
              if (t4.test instanceof Array)
                return t4.test.some(function(t5) {
                  return e3.test(t5);
                });
              throw new Error("Browser's test function is not valid");
            });
            return t3 && (this.parsedResult.engine = t3.describe(this.getUA())), this.parsedResult.engine;
          }, t2.parse = function() {
            return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
          }, t2.getResult = function() {
            return o.default.assign({}, this.parsedResult);
          }, t2.satisfies = function(e3) {
            var t3 = this, r2 = {}, n2 = 0, i2 = {}, s2 = 0;
            if (Object.keys(e3).forEach(function(t4) {
              var a3 = e3[t4];
              "string" == typeof a3 ? (i2[t4] = a3, s2 += 1) : "object" == typeof a3 && (r2[t4] = a3, n2 += 1);
            }), n2 > 0) {
              var a2 = Object.keys(r2), u2 = o.default.find(a2, function(e4) {
                return t3.isOS(e4);
              });
              if (u2) {
                var d2 = this.satisfies(r2[u2]);
                if (void 0 !== d2)
                  return d2;
              }
              var c = o.default.find(a2, function(e4) {
                return t3.isPlatform(e4);
              });
              if (c) {
                var f = this.satisfies(r2[c]);
                if (void 0 !== f)
                  return f;
              }
            }
            if (s2 > 0) {
              var l = Object.keys(i2), h = o.default.find(l, function(e4) {
                return t3.isBrowser(e4, true);
              });
              if (void 0 !== h)
                return this.compareVersion(i2[h]);
            }
          }, t2.isBrowser = function(e3, t3) {
            void 0 === t3 && (t3 = false);
            var r2 = this.getBrowserName().toLowerCase(), n2 = e3.toLowerCase(), i2 = o.default.getBrowserTypeByAlias(n2);
            return t3 && i2 && (n2 = i2.toLowerCase()), n2 === r2;
          }, t2.compareVersion = function(e3) {
            var t3 = [0], r2 = e3, n2 = false, i2 = this.getBrowserVersion();
            if ("string" == typeof i2)
              return ">" === e3[0] || "<" === e3[0] ? (r2 = e3.substr(1), "=" === e3[1] ? (n2 = true, r2 = e3.substr(2)) : t3 = [], ">" === e3[0] ? t3.push(1) : t3.push(-1)) : "=" === e3[0] ? r2 = e3.substr(1) : "~" === e3[0] && (n2 = true, r2 = e3.substr(1)), t3.indexOf(o.default.compareVersions(i2, r2, n2)) > -1;
          }, t2.isOS = function(e3) {
            return this.getOSName(true) === String(e3).toLowerCase();
          }, t2.isPlatform = function(e3) {
            return this.getPlatformType(true) === String(e3).toLowerCase();
          }, t2.isEngine = function(e3) {
            return this.getEngineName(true) === String(e3).toLowerCase();
          }, t2.is = function(e3, t3) {
            return void 0 === t3 && (t3 = false), this.isBrowser(e3, t3) || this.isOS(e3) || this.isPlatform(e3);
          }, t2.some = function(e3) {
            var t3 = this;
            return void 0 === e3 && (e3 = []), e3.some(function(e4) {
              return t3.is(e4);
            });
          }, e2;
        }();
        t.default = d, e.exports = t.default;
      }, 92: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n, i = (n = r(17)) && n.__esModule ? n : { default: n };
        var s = /version\/(\d+(\.?_?\d+)+)/i, a = [{ test: [/googlebot/i], describe: function(e2) {
          var t2 = { name: "Googlebot" }, r2 = i.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/opera/i], describe: function(e2) {
          var t2 = { name: "Opera" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/opr\/|opios/i], describe: function(e2) {
          var t2 = { name: "Opera" }, r2 = i.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/SamsungBrowser/i], describe: function(e2) {
          var t2 = { name: "Samsung Internet for Android" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/Whale/i], describe: function(e2) {
          var t2 = { name: "NAVER Whale Browser" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/MZBrowser/i], describe: function(e2) {
          var t2 = { name: "MZ Browser" }, r2 = i.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/focus/i], describe: function(e2) {
          var t2 = { name: "Focus" }, r2 = i.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/swing/i], describe: function(e2) {
          var t2 = { name: "Swing" }, r2 = i.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/coast/i], describe: function(e2) {
          var t2 = { name: "Opera Coast" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/opt\/\d+(?:.?_?\d+)+/i], describe: function(e2) {
          var t2 = { name: "Opera Touch" }, r2 = i.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/yabrowser/i], describe: function(e2) {
          var t2 = { name: "Yandex Browser" }, r2 = i.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/ucbrowser/i], describe: function(e2) {
          var t2 = { name: "UC Browser" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/Maxthon|mxios/i], describe: function(e2) {
          var t2 = { name: "Maxthon" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/epiphany/i], describe: function(e2) {
          var t2 = { name: "Epiphany" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/puffin/i], describe: function(e2) {
          var t2 = { name: "Puffin" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/sleipnir/i], describe: function(e2) {
          var t2 = { name: "Sleipnir" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/k-meleon/i], describe: function(e2) {
          var t2 = { name: "K-Meleon" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/micromessenger/i], describe: function(e2) {
          var t2 = { name: "WeChat" }, r2 = i.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/qqbrowser/i], describe: function(e2) {
          var t2 = { name: /qqbrowserlite/i.test(e2) ? "QQ Browser Lite" : "QQ Browser" }, r2 = i.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/msie|trident/i], describe: function(e2) {
          var t2 = { name: "Internet Explorer" }, r2 = i.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/\sedg\//i], describe: function(e2) {
          var t2 = { name: "Microsoft Edge" }, r2 = i.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/edg([ea]|ios)/i], describe: function(e2) {
          var t2 = { name: "Microsoft Edge" }, r2 = i.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/vivaldi/i], describe: function(e2) {
          var t2 = { name: "Vivaldi" }, r2 = i.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/seamonkey/i], describe: function(e2) {
          var t2 = { name: "SeaMonkey" }, r2 = i.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/sailfish/i], describe: function(e2) {
          var t2 = { name: "Sailfish" }, r2 = i.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/silk/i], describe: function(e2) {
          var t2 = { name: "Amazon Silk" }, r2 = i.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/phantom/i], describe: function(e2) {
          var t2 = { name: "PhantomJS" }, r2 = i.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/slimerjs/i], describe: function(e2) {
          var t2 = { name: "SlimerJS" }, r2 = i.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e2) {
          var t2 = { name: "BlackBerry" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/(web|hpw)[o0]s/i], describe: function(e2) {
          var t2 = { name: "WebOS Browser" }, r2 = i.default.getFirstMatch(s, e2) || i.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/bada/i], describe: function(e2) {
          var t2 = { name: "Bada" }, r2 = i.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/tizen/i], describe: function(e2) {
          var t2 = { name: "Tizen" }, r2 = i.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/qupzilla/i], describe: function(e2) {
          var t2 = { name: "QupZilla" }, r2 = i.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/firefox|iceweasel|fxios/i], describe: function(e2) {
          var t2 = { name: "Firefox" }, r2 = i.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/electron/i], describe: function(e2) {
          var t2 = { name: "Electron" }, r2 = i.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/MiuiBrowser/i], describe: function(e2) {
          var t2 = { name: "Miui" }, r2 = i.default.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/chromium/i], describe: function(e2) {
          var t2 = { name: "Chromium" }, r2 = i.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e2) || i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/chrome|crios|crmo/i], describe: function(e2) {
          var t2 = { name: "Chrome" }, r2 = i.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/GSA/i], describe: function(e2) {
          var t2 = { name: "Google Search" }, r2 = i.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: function(e2) {
          var t2 = !e2.test(/like android/i), r2 = e2.test(/android/i);
          return t2 && r2;
        }, describe: function(e2) {
          var t2 = { name: "Android Browser" }, r2 = i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/playstation 4/i], describe: function(e2) {
          var t2 = { name: "PlayStation 4" }, r2 = i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/safari|applewebkit/i], describe: function(e2) {
          var t2 = { name: "Safari" }, r2 = i.default.getFirstMatch(s, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/.*/i], describe: function(e2) {
          var t2 = -1 !== e2.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
          return { name: i.default.getFirstMatch(t2, e2), version: i.default.getSecondMatch(t2, e2) };
        } }];
        t.default = a, e.exports = t.default;
      }, 93: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n, i = (n = r(17)) && n.__esModule ? n : { default: n }, s = r(18);
        var a = [{ test: [/Roku\/DVP/], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e2);
          return { name: s.OS_MAP.Roku, version: t2 };
        } }, { test: [/windows phone/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e2);
          return { name: s.OS_MAP.WindowsPhone, version: t2 };
        } }, { test: [/windows /i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e2), r2 = i.default.getWindowsVersionName(t2);
          return { name: s.OS_MAP.Windows, version: t2, versionName: r2 };
        } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function(e2) {
          var t2 = { name: s.OS_MAP.iOS }, r2 = i.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/macintosh/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e2).replace(/[_\s]/g, "."), r2 = i.default.getMacOSVersionName(t2), n2 = { name: s.OS_MAP.MacOS, version: t2 };
          return r2 && (n2.versionName = r2), n2;
        } }, { test: [/(ipod|iphone|ipad)/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e2).replace(/[_\s]/g, ".");
          return { name: s.OS_MAP.iOS, version: t2 };
        } }, { test: function(e2) {
          var t2 = !e2.test(/like android/i), r2 = e2.test(/android/i);
          return t2 && r2;
        }, describe: function(e2) {
          var t2 = i.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e2), r2 = i.default.getAndroidVersionName(t2), n2 = { name: s.OS_MAP.Android, version: t2 };
          return r2 && (n2.versionName = r2), n2;
        } }, { test: [/(web|hpw)[o0]s/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e2), r2 = { name: s.OS_MAP.WebOS };
          return t2 && t2.length && (r2.version = t2), r2;
        } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e2) || i.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e2) || i.default.getFirstMatch(/\bbb(\d+)/i, e2);
          return { name: s.OS_MAP.BlackBerry, version: t2 };
        } }, { test: [/bada/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e2);
          return { name: s.OS_MAP.Bada, version: t2 };
        } }, { test: [/tizen/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e2);
          return { name: s.OS_MAP.Tizen, version: t2 };
        } }, { test: [/linux/i], describe: function() {
          return { name: s.OS_MAP.Linux };
        } }, { test: [/CrOS/], describe: function() {
          return { name: s.OS_MAP.ChromeOS };
        } }, { test: [/PlayStation 4/], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e2);
          return { name: s.OS_MAP.PlayStation4, version: t2 };
        } }];
        t.default = a, e.exports = t.default;
      }, 94: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n, i = (n = r(17)) && n.__esModule ? n : { default: n }, s = r(18);
        var a = [{ test: [/googlebot/i], describe: function() {
          return { type: "bot", vendor: "Google" };
        } }, { test: [/huawei/i], describe: function(e2) {
          var t2 = i.default.getFirstMatch(/(can-l01)/i, e2) && "Nova", r2 = { type: s.PLATFORMS_MAP.mobile, vendor: "Huawei" };
          return t2 && (r2.model = t2), r2;
        } }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet, vendor: "Nexus" };
        } }, { test: [/ipad/i], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
        } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
        } }, { test: [/kftt build/i], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" };
        } }, { test: [/silk/i], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet, vendor: "Amazon" };
        } }, { test: [/tablet(?! pc)/i], describe: function() {
          return { type: s.PLATFORMS_MAP.tablet };
        } }, { test: function(e2) {
          var t2 = e2.test(/ipod|iphone/i), r2 = e2.test(/like (ipod|iphone)/i);
          return t2 && !r2;
        }, describe: function(e2) {
          var t2 = i.default.getFirstMatch(/(ipod|iphone)/i, e2);
          return { type: s.PLATFORMS_MAP.mobile, vendor: "Apple", model: t2 };
        } }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: function() {
          return { type: s.PLATFORMS_MAP.mobile, vendor: "Nexus" };
        } }, { test: [/[^-]mobi/i], describe: function() {
          return { type: s.PLATFORMS_MAP.mobile };
        } }, { test: function(e2) {
          return "blackberry" === e2.getBrowserName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.mobile, vendor: "BlackBerry" };
        } }, { test: function(e2) {
          return "bada" === e2.getBrowserName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.mobile };
        } }, { test: function(e2) {
          return "windows phone" === e2.getBrowserName();
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.mobile, vendor: "Microsoft" };
        } }, { test: function(e2) {
          var t2 = Number(String(e2.getOSVersion()).split(".")[0]);
          return "android" === e2.getOSName(true) && t2 >= 3;
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.tablet };
        } }, { test: function(e2) {
          return "android" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.mobile };
        } }, { test: function(e2) {
          return "macos" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.desktop, vendor: "Apple" };
        } }, { test: function(e2) {
          return "windows" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.desktop };
        } }, { test: function(e2) {
          return "linux" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.desktop };
        } }, { test: function(e2) {
          return "playstation 4" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.tv };
        } }, { test: function(e2) {
          return "roku" === e2.getOSName(true);
        }, describe: function() {
          return { type: s.PLATFORMS_MAP.tv };
        } }];
        t.default = a, e.exports = t.default;
      }, 95: function(e, t, r) {
        "use strict";
        t.__esModule = true, t.default = void 0;
        var n, i = (n = r(17)) && n.__esModule ? n : { default: n }, s = r(18);
        var a = [{ test: function(e2) {
          return "microsoft edge" === e2.getBrowserName(true);
        }, describe: function(e2) {
          if (/\sedg\//i.test(e2))
            return { name: s.ENGINE_MAP.Blink };
          var t2 = i.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e2);
          return { name: s.ENGINE_MAP.EdgeHTML, version: t2 };
        } }, { test: [/trident/i], describe: function(e2) {
          var t2 = { name: s.ENGINE_MAP.Trident }, r2 = i.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: function(e2) {
          return e2.test(/presto/i);
        }, describe: function(e2) {
          var t2 = { name: s.ENGINE_MAP.Presto }, r2 = i.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: function(e2) {
          var t2 = e2.test(/gecko/i), r2 = e2.test(/like gecko/i);
          return t2 && !r2;
        }, describe: function(e2) {
          var t2 = { name: s.ENGINE_MAP.Gecko }, r2 = i.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }, { test: [/(apple)?webkit\/537\.36/i], describe: function() {
          return { name: s.ENGINE_MAP.Blink };
        } }, { test: [/(apple)?webkit/i], describe: function(e2) {
          var t2 = { name: s.ENGINE_MAP.WebKit }, r2 = i.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e2);
          return r2 && (t2.version = r2), t2;
        } }];
        t.default = a, e.exports = t.default;
      } });
    });
  }
});

export {
  require_es5
};
//# sourceMappingURL=chunk-NNDZTC3B.js.map
