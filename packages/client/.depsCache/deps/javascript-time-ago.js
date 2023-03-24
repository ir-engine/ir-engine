import "./chunk-TFWDKVI3.js";

// ../../node_modules/relative-time-format/modules/LocaleDataStore.js
var defaultLocale = "en";
var localesData = {};
var lowercaseLocaleLookup = {};
function getDefaultLocale() {
  return defaultLocale;
}
function setDefaultLocale(locale) {
  defaultLocale = locale;
}
function getLocaleData(locale) {
  return localesData[locale];
}
function addLocaleData(localeData) {
  if (!localeData) {
    throw new Error("No locale data passed");
  }
  localesData[localeData.locale] = localeData;
  lowercaseLocaleLookup[localeData.locale.toLowerCase()] = localeData.locale;
}
function resolveLocale(locale) {
  if (localesData[locale]) {
    return locale;
  }
  if (lowercaseLocaleLookup[locale.toLowerCase()]) {
    return lowercaseLocaleLookup[locale.toLowerCase()];
  }
}

// ../../node_modules/relative-time-format/modules/resolveLocale.js
function resolveLocale2(locale) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var localeMatcher = options.localeMatcher || "lookup";
  switch (localeMatcher) {
    case "lookup":
      return resolveLocaleLookup(locale);
    case "best fit":
      return resolveLocaleLookup(locale);
    default:
      throw new RangeError('Invalid "localeMatcher" option: '.concat(localeMatcher));
  }
}
function resolveLocaleLookup(locale) {
  var resolvedLocale = resolveLocale(locale);
  if (resolvedLocale) {
    return resolvedLocale;
  }
  var parts = locale.split("-");
  while (locale.length > 1) {
    parts.pop();
    locale = parts.join("-");
    var _resolvedLocale = resolveLocale(locale);
    if (_resolvedLocale) {
      return _resolvedLocale;
    }
  }
}

// ../../node_modules/relative-time-format/modules/PluralRuleFunctions.js
var $ = {
  af: function af(n) {
    return n == 1 ? "one" : "other";
  },
  am: function am(n) {
    return n >= 0 && n <= 1 ? "one" : "other";
  },
  ar: function ar(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n, n100 = t0 && s[0].slice(-2);
    return n == 0 ? "zero" : n == 1 ? "one" : n == 2 ? "two" : n100 >= 3 && n100 <= 10 ? "few" : n100 >= 11 && n100 <= 99 ? "many" : "other";
  },
  ast: function ast(n) {
    var s = String(n).split("."), v0 = !s[1];
    return n == 1 && v0 ? "one" : "other";
  },
  be: function be(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
    return n10 == 1 && n100 != 11 ? "one" : n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14) ? "few" : t0 && n10 == 0 || n10 >= 5 && n10 <= 9 || n100 >= 11 && n100 <= 14 ? "many" : "other";
  },
  br: function br(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2), n1000000 = t0 && s[0].slice(-6);
    return n10 == 1 && n100 != 11 && n100 != 71 && n100 != 91 ? "one" : n10 == 2 && n100 != 12 && n100 != 72 && n100 != 92 ? "two" : (n10 == 3 || n10 == 4 || n10 == 9) && (n100 < 10 || n100 > 19) && (n100 < 70 || n100 > 79) && (n100 < 90 || n100 > 99) ? "few" : n != 0 && t0 && n1000000 == 0 ? "many" : "other";
  },
  bs: function bs(n) {
    var s = String(n).split("."), i = s[0], f = s[1] || "", v0 = !s[1], i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
    return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? "one" : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) || f10 >= 2 && f10 <= 4 && (f100 < 12 || f100 > 14) ? "few" : "other";
  },
  ca: function ca(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i1000000 = i.slice(-6);
    return n == 1 && v0 ? "one" : i != 0 && i1000000 == 0 && v0 ? "many" : "other";
  },
  ceb: function ceb(n) {
    var s = String(n).split("."), i = s[0], f = s[1] || "", v0 = !s[1], i10 = i.slice(-1), f10 = f.slice(-1);
    return v0 && (i == 1 || i == 2 || i == 3) || v0 && i10 != 4 && i10 != 6 && i10 != 9 || !v0 && f10 != 4 && f10 != 6 && f10 != 9 ? "one" : "other";
  },
  cs: function cs(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1];
    return n == 1 && v0 ? "one" : i >= 2 && i <= 4 && v0 ? "few" : !v0 ? "many" : "other";
  },
  cy: function cy(n) {
    return n == 0 ? "zero" : n == 1 ? "one" : n == 2 ? "two" : n == 3 ? "few" : n == 6 ? "many" : "other";
  },
  da: function da(n) {
    var s = String(n).split("."), i = s[0], t0 = Number(s[0]) == n;
    return n == 1 || !t0 && (i == 0 || i == 1) ? "one" : "other";
  },
  dsb: function dsb(n) {
    var s = String(n).split("."), i = s[0], f = s[1] || "", v0 = !s[1], i100 = i.slice(-2), f100 = f.slice(-2);
    return v0 && i100 == 1 || f100 == 1 ? "one" : v0 && i100 == 2 || f100 == 2 ? "two" : v0 && (i100 == 3 || i100 == 4) || f100 == 3 || f100 == 4 ? "few" : "other";
  },
  dz: function dz(n) {
    return "other";
  },
  es: function es(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i1000000 = i.slice(-6);
    return n == 1 ? "one" : i != 0 && i1000000 == 0 && v0 ? "many" : "other";
  },
  ff: function ff(n) {
    return n >= 0 && n < 2 ? "one" : "other";
  },
  fr: function fr(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i1000000 = i.slice(-6);
    return n >= 0 && n < 2 ? "one" : i != 0 && i1000000 == 0 && v0 ? "many" : "other";
  },
  ga: function ga(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n;
    return n == 1 ? "one" : n == 2 ? "two" : t0 && n >= 3 && n <= 6 ? "few" : t0 && n >= 7 && n <= 10 ? "many" : "other";
  },
  gd: function gd(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n;
    return n == 1 || n == 11 ? "one" : n == 2 || n == 12 ? "two" : t0 && n >= 3 && n <= 10 || t0 && n >= 13 && n <= 19 ? "few" : "other";
  },
  he: function he(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1];
    return i == 1 && v0 || i == 0 && !v0 ? "one" : i == 2 && v0 ? "two" : "other";
  },
  is: function is(n) {
    var s = String(n).split("."), i = s[0], t = (s[1] || "").replace(/0+$/, ""), t0 = Number(s[0]) == n, i10 = i.slice(-1), i100 = i.slice(-2);
    return t0 && i10 == 1 && i100 != 11 || t % 10 == 1 && t % 100 != 11 ? "one" : "other";
  },
  ksh: function ksh(n) {
    return n == 0 ? "zero" : n == 1 ? "one" : "other";
  },
  lt: function lt(n) {
    var s = String(n).split("."), f = s[1] || "", t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
    return n10 == 1 && (n100 < 11 || n100 > 19) ? "one" : n10 >= 2 && n10 <= 9 && (n100 < 11 || n100 > 19) ? "few" : f != 0 ? "many" : "other";
  },
  lv: function lv(n) {
    var s = String(n).split("."), f = s[1] || "", v = f.length, t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2), f100 = f.slice(-2), f10 = f.slice(-1);
    return t0 && n10 == 0 || n100 >= 11 && n100 <= 19 || v == 2 && f100 >= 11 && f100 <= 19 ? "zero" : n10 == 1 && n100 != 11 || v == 2 && f10 == 1 && f100 != 11 || v != 2 && f10 == 1 ? "one" : "other";
  },
  mk: function mk(n) {
    var s = String(n).split("."), i = s[0], f = s[1] || "", v0 = !s[1], i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
    return v0 && i10 == 1 && i100 != 11 || f10 == 1 && f100 != 11 ? "one" : "other";
  },
  mt: function mt(n) {
    var s = String(n).split("."), t0 = Number(s[0]) == n, n100 = t0 && s[0].slice(-2);
    return n == 1 ? "one" : n == 2 ? "two" : n == 0 || n100 >= 3 && n100 <= 10 ? "few" : n100 >= 11 && n100 <= 19 ? "many" : "other";
  },
  pa: function pa(n) {
    return n == 0 || n == 1 ? "one" : "other";
  },
  pl: function pl(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i10 = i.slice(-1), i100 = i.slice(-2);
    return n == 1 && v0 ? "one" : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) ? "few" : v0 && i != 1 && (i10 == 0 || i10 == 1) || v0 && i10 >= 5 && i10 <= 9 || v0 && i100 >= 12 && i100 <= 14 ? "many" : "other";
  },
  pt: function pt(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i1000000 = i.slice(-6);
    return i == 0 || i == 1 ? "one" : i != 0 && i1000000 == 0 && v0 ? "many" : "other";
  },
  ro: function ro(n) {
    var s = String(n).split("."), v0 = !s[1], t0 = Number(s[0]) == n, n100 = t0 && s[0].slice(-2);
    return n == 1 && v0 ? "one" : !v0 || n == 0 || n != 1 && n100 >= 1 && n100 <= 19 ? "few" : "other";
  },
  ru: function ru(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i10 = i.slice(-1), i100 = i.slice(-2);
    return v0 && i10 == 1 && i100 != 11 ? "one" : v0 && i10 >= 2 && i10 <= 4 && (i100 < 12 || i100 > 14) ? "few" : v0 && i10 == 0 || v0 && i10 >= 5 && i10 <= 9 || v0 && i100 >= 11 && i100 <= 14 ? "many" : "other";
  },
  se: function se(n) {
    return n == 1 ? "one" : n == 2 ? "two" : "other";
  },
  si: function si(n) {
    var s = String(n).split("."), i = s[0], f = s[1] || "";
    return n == 0 || n == 1 || i == 0 && f == 1 ? "one" : "other";
  },
  sl: function sl(n) {
    var s = String(n).split("."), i = s[0], v0 = !s[1], i100 = i.slice(-2);
    return v0 && i100 == 1 ? "one" : v0 && i100 == 2 ? "two" : v0 && (i100 == 3 || i100 == 4) || !v0 ? "few" : "other";
  }
};
$.as = $.am;
$.az = $.af;
$.bg = $.af;
$.bn = $.am;
$.brx = $.af;
$.ce = $.af;
$.chr = $.af;
$.de = $.ast;
$.ee = $.af;
$.el = $.af;
$.en = $.ast;
$.et = $.ast;
$.eu = $.af;
$.fa = $.am;
$.fi = $.ast;
$.fil = $.ceb;
$.fo = $.af;
$.fur = $.af;
$.fy = $.ast;
$.gl = $.ast;
$.gu = $.am;
$.ha = $.af;
$.hi = $.am;
$.hr = $.bs;
$.hsb = $.dsb;
$.hu = $.af;
$.hy = $.ff;
$.ia = $.ast;
$.id = $.dz;
$.ig = $.dz;
$.it = $.ca;
$.ja = $.dz;
$.jgo = $.af;
$.jv = $.dz;
$.ka = $.af;
$.kea = $.dz;
$.kk = $.af;
$.kl = $.af;
$.km = $.dz;
$.kn = $.am;
$.ko = $.dz;
$.ks = $.af;
$.ku = $.af;
$.ky = $.af;
$.lb = $.af;
$.lkt = $.dz;
$.lo = $.dz;
$.ml = $.af;
$.mn = $.af;
$.mr = $.af;
$.ms = $.dz;
$.my = $.dz;
$.nb = $.af;
$.ne = $.af;
$.nl = $.ast;
$.nn = $.af;
$.no = $.af;
$.or = $.af;
$.pcm = $.am;
$.ps = $.af;
$.rm = $.af;
$.sah = $.dz;
$.sc = $.ast;
$.sd = $.af;
$.sk = $.cs;
$.so = $.af;
$.sq = $.af;
$.sr = $.bs;
$.su = $.dz;
$.sv = $.ast;
$.sw = $.ast;
$.ta = $.af;
$.te = $.af;
$.th = $.dz;
$.ti = $.pa;
$.tk = $.af;
$.to = $.dz;
$.tr = $.af;
$.ug = $.af;
$.uk = $.ru;
$.ur = $.ast;
$.uz = $.af;
$.vi = $.dz;
$.wae = $.af;
$.wo = $.dz;
$.xh = $.af;
$.yi = $.ast;
$.yo = $.dz;
$.yue = $.dz;
$.zh = $.dz;
$.zu = $.am;
var PluralRuleFunctions_default = $;

// ../../node_modules/relative-time-format/modules/getPluralRulesLocale.js
function getPluralRulesLocale(locale) {
  if (locale === "pt-PT") {
    return locale;
  }
  return getLanguageFromLanguageTag(locale);
}
var LANGUAGE_REG_EXP = /^([a-z0-9]+)/i;
function getLanguageFromLanguageTag(languageTag) {
  var match = languageTag.match(LANGUAGE_REG_EXP);
  if (!match) {
    throw new TypeError("Invalid locale: ".concat(languageTag));
  }
  return match[1];
}

// ../../node_modules/relative-time-format/modules/PluralRules.js
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
var PluralRules = function() {
  function PluralRules2(locale, options) {
    _classCallCheck(this, PluralRules2);
    var locales = PluralRules2.supportedLocalesOf(locale);
    if (locales.length === 0) {
      throw new RangeError("Unsupported locale: " + locale);
    }
    if (options && options.type !== "cardinal") {
      throw new RangeError('Only "cardinal" "type" is supported');
    }
    this.$ = PluralRuleFunctions_default[getPluralRulesLocale(locales[0])];
  }
  _createClass(PluralRules2, [{
    key: "select",
    value: function select(number) {
      return this.$(number);
    }
  }], [{
    key: "supportedLocalesOf",
    value: function supportedLocalesOf(locales) {
      if (typeof locales === "string") {
        locales = [locales];
      }
      return locales.filter(function(locale) {
        return PluralRuleFunctions_default[getPluralRulesLocale(locale)];
      });
    }
  }]);
  return PluralRules2;
}();

// ../../node_modules/relative-time-format/modules/RelativeTimeFormat.js
function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i)
        break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null)
        _i["return"]();
    } finally {
      if (_d)
        throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties2(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass2(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties2(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
var UNITS = ["second", "minute", "hour", "day", "week", "month", "quarter", "year"];
var NUMERIC_VALUES = ["auto", "always"];
var STYLE_VALUES = ["long", "short", "narrow"];
var LOCALE_MATCHER_VALUES = ["lookup", "best fit"];
var RelativeTimeFormat = function() {
  function RelativeTimeFormat2() {
    var locales = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    _classCallCheck2(this, RelativeTimeFormat2);
    var numeric = options.numeric, style = options.style, localeMatcher = options.localeMatcher;
    this.numeric = "always";
    this.style = "long";
    this.localeMatcher = "lookup";
    if (numeric !== void 0) {
      if (NUMERIC_VALUES.indexOf(numeric) < 0) {
        throw new RangeError('Invalid "numeric" option: '.concat(numeric));
      }
      this.numeric = numeric;
    }
    if (style !== void 0) {
      if (STYLE_VALUES.indexOf(style) < 0) {
        throw new RangeError('Invalid "style" option: '.concat(style));
      }
      this.style = style;
    }
    if (localeMatcher !== void 0) {
      if (LOCALE_MATCHER_VALUES.indexOf(localeMatcher) < 0) {
        throw new RangeError('Invalid "localeMatcher" option: '.concat(localeMatcher));
      }
      this.localeMatcher = localeMatcher;
    }
    if (typeof locales === "string") {
      locales = [locales];
    }
    locales.push(getDefaultLocale());
    this.locale = RelativeTimeFormat2.supportedLocalesOf(locales, {
      localeMatcher: this.localeMatcher
    })[0];
    if (!this.locale) {
      throw new Error("No supported locale was found");
    }
    if (PluralRules.supportedLocalesOf(this.locale).length > 0) {
      this.pluralRules = new PluralRules(this.locale);
    } else {
      console.warn('"'.concat(this.locale, '" locale is not supported'));
    }
    if (typeof Intl !== "undefined" && Intl.NumberFormat) {
      this.numberFormat = new Intl.NumberFormat(this.locale);
      this.numberingSystem = this.numberFormat.resolvedOptions().numberingSystem;
    } else {
      this.numberingSystem = "latn";
    }
    this.locale = resolveLocale2(this.locale, {
      localeMatcher: this.localeMatcher
    });
  }
  _createClass2(RelativeTimeFormat2, [{
    key: "format",
    value: function format3() {
      var _parseFormatArgs = parseFormatArgs(arguments), _parseFormatArgs2 = _slicedToArray(_parseFormatArgs, 2), number = _parseFormatArgs2[0], unit = _parseFormatArgs2[1];
      return this.getRule(number, unit).replace("{0}", this.formatNumber(Math.abs(number)));
    }
    /**
     * Formats time `number` in `units` (either in past or in future).
     * @param {number} number - Time interval value.
     * @param {string} unit - Time interval measurement unit.
     * @return {Object[]} The parts (`{ type, value, unit? }`).
     * @throws {RangeError} If unit is not one of "second", "minute", "hour", "day", "week", "month", "quarter".
     * @example
     * // Version 1 (deprecated).
     * // Returns [
     * //   { type: "literal", value: "in " },
     * //   { type: "day", value: "100" },
     * //   { type: "literal", value: " days" }
     * // ]
     * rtf.formatToParts(100, "day")
     * //
     * // Version 2.
     * // Returns [
     * //   { type: "literal", value: "in " },
     * //   { type: "integer", value: "100", unit: "day" },
     * //   { type: "literal", value: " days" }
     * // ]
     * rtf.formatToParts(100, "day")
     */
  }, {
    key: "formatToParts",
    value: function formatToParts() {
      var _parseFormatArgs3 = parseFormatArgs(arguments), _parseFormatArgs4 = _slicedToArray(_parseFormatArgs3, 2), number = _parseFormatArgs4[0], unit = _parseFormatArgs4[1];
      var rule = this.getRule(number, unit);
      var valueIndex = rule.indexOf("{0}");
      if (valueIndex < 0) {
        return [{
          type: "literal",
          value: rule
        }];
      }
      var parts = [];
      if (valueIndex > 0) {
        parts.push({
          type: "literal",
          value: rule.slice(0, valueIndex)
        });
      }
      parts = parts.concat(this.formatNumberToParts(Math.abs(number)).map(function(part) {
        return _objectSpread(_objectSpread({}, part), {}, {
          unit
        });
      }));
      if (valueIndex + "{0}".length < rule.length - 1) {
        parts.push({
          type: "literal",
          value: rule.slice(valueIndex + "{0}".length)
        });
      }
      return parts;
    }
    /**
     * Returns formatting rule for `value` in `units` (either in past or in future).
     * @param {number} value - Time interval value.
     * @param {string} unit - Time interval measurement unit.
     * @return {string}
     * @throws {RangeError} If unit is not one of "second", "minute", "hour", "day", "week", "month", "quarter".
     * @example
     * // Returns "{0} days ago"
     * getRule(-2, "day")
     */
  }, {
    key: "getRule",
    value: function getRule(value, unit) {
      var unitMessages = getLocaleData(this.locale)[this.style][unit];
      if (typeof unitMessages === "string") {
        return unitMessages;
      }
      if (this.numeric === "auto") {
        if (value === -2 || value === -1) {
          var message = unitMessages["previous".concat(value === -1 ? "" : "-" + Math.abs(value))];
          if (message) {
            return message;
          }
        } else if (value === 1 || value === 2) {
          var _message = unitMessages["next".concat(value === 1 ? "" : "-" + Math.abs(value))];
          if (_message) {
            return _message;
          }
        } else if (value === 0) {
          if (unitMessages.current) {
            return unitMessages.current;
          }
        }
      }
      var pluralizedMessages = unitMessages[isNegative(value) ? "past" : "future"];
      if (typeof pluralizedMessages === "string") {
        return pluralizedMessages;
      }
      var quantifier = this.pluralRules && this.pluralRules.select(Math.abs(value)) || "other";
      return pluralizedMessages[quantifier] || pluralizedMessages.other;
    }
    /**
     * Formats a number into a string.
     * Uses `Intl.NumberFormat` when available.
     * @param  {number} number
     * @return {string}
     */
  }, {
    key: "formatNumber",
    value: function formatNumber(number) {
      return this.numberFormat ? this.numberFormat.format(number) : String(number);
    }
    /**
     * Formats a number into a list of parts.
     * Uses `Intl.NumberFormat` when available.
     * @param  {number} number
     * @return {object[]}
     */
  }, {
    key: "formatNumberToParts",
    value: function formatNumberToParts(number) {
      return this.numberFormat && this.numberFormat.formatToParts ? this.numberFormat.formatToParts(number) : [{
        type: "integer",
        value: this.formatNumber(number)
      }];
    }
    /**
     * Returns a new object with properties reflecting the locale and date and time formatting options computed during initialization of this DateTimeFormat object.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/resolvedOptions
     * @return {Object}
     */
  }, {
    key: "resolvedOptions",
    value: function resolvedOptions() {
      return {
        locale: this.locale,
        style: this.style,
        numeric: this.numeric,
        numberingSystem: this.numberingSystem
      };
    }
  }]);
  return RelativeTimeFormat2;
}();
RelativeTimeFormat.supportedLocalesOf = function(locales) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  if (typeof locales === "string") {
    locales = [locales];
  } else if (!Array.isArray(locales)) {
    throw new TypeError('Invalid "locales" argument');
  }
  return locales.filter(function(locale) {
    return resolveLocale2(locale, options);
  });
};
RelativeTimeFormat.addLocale = addLocaleData;
RelativeTimeFormat.setDefaultLocale = setDefaultLocale;
RelativeTimeFormat.getDefaultLocale = getDefaultLocale;
RelativeTimeFormat.PluralRules = PluralRules;
var UNIT_ERROR = 'Invalid "unit" argument';
function parseUnit(unit) {
  if (_typeof(unit) === "symbol") {
    throw new TypeError(UNIT_ERROR);
  }
  if (typeof unit !== "string") {
    throw new RangeError("".concat(UNIT_ERROR, ": ").concat(unit));
  }
  if (unit[unit.length - 1] === "s") {
    unit = unit.slice(0, unit.length - 1);
  }
  if (UNITS.indexOf(unit) < 0) {
    throw new RangeError("".concat(UNIT_ERROR, ": ").concat(unit));
  }
  return unit;
}
var NUMBER_ERROR = 'Invalid "number" argument';
function parseNumber(value) {
  value = Number(value);
  if (Number.isFinite) {
    if (!Number.isFinite(value)) {
      throw new RangeError("".concat(NUMBER_ERROR, ": ").concat(value));
    }
  }
  return value;
}
function isNegativeZero(number) {
  return 1 / number === -Infinity;
}
function isNegative(number) {
  return number < 0 || number === 0 && isNegativeZero(number);
}
function parseFormatArgs(args) {
  if (args.length < 2) {
    throw new TypeError('"unit" argument is required');
  }
  return [parseNumber(args[0]), parseUnit(args[1])];
}

// ../../node_modules/javascript-time-ago/modules/cache.js
function _typeof2(obj) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof2(obj);
}
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties3(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass3(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties3(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties3(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
var Cache = function() {
  function Cache2() {
    _classCallCheck3(this, Cache2);
    this.cache = {};
  }
  _createClass3(Cache2, [{
    key: "get",
    value: function get() {
      var cache = this.cache;
      for (var _len = arguments.length, keys = new Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }
      for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
        var key = _keys[_i];
        if (_typeof2(cache) !== "object") {
          return;
        }
        cache = cache[key];
      }
      return cache;
    }
  }, {
    key: "put",
    value: function put() {
      for (var _len2 = arguments.length, keys = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        keys[_key2] = arguments[_key2];
      }
      var value = keys.pop();
      var lastKey = keys.pop();
      var cache = this.cache;
      for (var _i2 = 0, _keys2 = keys; _i2 < _keys2.length; _i2++) {
        var key = _keys2[_i2];
        if (_typeof2(cache[key]) !== "object") {
          cache[key] = {};
        }
        cache = cache[key];
      }
      return cache[lastKey] = value;
    }
  }]);
  return Cache2;
}();

// ../../node_modules/javascript-time-ago/modules/locale.js
function _typeof3(obj) {
  "@babel/helpers - typeof";
  return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof3(obj);
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it)
    return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray2(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it)
      o = it;
    var i = 0;
    return function() {
      if (i >= o.length)
        return { done: true };
      return { done: false, value: o[i++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray2(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray2(o, minLen);
}
function _arrayLikeToArray2(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function chooseLocale(locales, isLocaleDataAvailable) {
  for (var _iterator = _createForOfIteratorHelperLoose(locales), _step; !(_step = _iterator()).done; ) {
    var locale = _step.value;
    if (isLocaleDataAvailable(locale)) {
      return locale;
    }
    var parts = locale.split("-");
    while (parts.length > 1) {
      parts.pop();
      locale = parts.join("-");
      if (isLocaleDataAvailable(locale)) {
        return locale;
      }
    }
  }
  throw new Error("No locale data has been registered for any of the locales: ".concat(locales.join(", ")));
}
function intlDateTimeFormatSupportedLocale(locales) {
  if (intlDateTimeFormatSupported()) {
    return Intl.DateTimeFormat.supportedLocalesOf(locales)[0];
  }
}
function intlDateTimeFormatSupported() {
  var isIntlAvailable = (typeof Intl === "undefined" ? "undefined" : _typeof3(Intl)) === "object";
  return isIntlAvailable && typeof Intl.DateTimeFormat === "function";
}

// ../../node_modules/javascript-time-ago/modules/isStyleObject.js
function _typeof4(obj) {
  "@babel/helpers - typeof";
  return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof4(obj);
}
function isStyleObject(object) {
  return isObject(object) && (Array.isArray(object.steps) || // `gradation` property is deprecated: it has been renamed to `steps`.
  Array.isArray(object.gradation) || // `flavour` property is deprecated: it has been renamed to `labels`.
  Array.isArray(object.flavour) || typeof object.flavour === "string" || Array.isArray(object.labels) || typeof object.labels === "string" || // `units` property is deprecated.
  Array.isArray(object.units) || // `custom` property is deprecated.
  typeof object.custom === "function");
}
var OBJECT_CONSTRUCTOR = {}.constructor;
function isObject(object) {
  return _typeof4(object) !== void 0 && object !== null && object.constructor === OBJECT_CONSTRUCTOR;
}

// ../../node_modules/javascript-time-ago/modules/steps/units.js
var minute = 60;
var hour = 60 * minute;
var day = 24 * hour;
var week = 7 * day;
var month = 30.44 * day;
var year = 146097 / 400 * day;
function getSecondsInUnit(unit) {
  switch (unit) {
    case "second":
      return 1;
    case "minute":
      return minute;
    case "hour":
      return hour;
    case "day":
      return day;
    case "week":
      return week;
    case "month":
      return month;
    case "year":
      return year;
  }
}

// ../../node_modules/javascript-time-ago/modules/steps/getStepDenominator.js
function getStepDenominator(step) {
  if (step.factor !== void 0) {
    return step.factor;
  }
  return getSecondsInUnit(step.unit || step.formatAs) || 1;
}

// ../../node_modules/javascript-time-ago/modules/round.js
function getRoundFunction(round) {
  switch (round) {
    case "floor":
      return Math.floor;
    default:
      return Math.round;
  }
}
function getDiffRatioToNextRoundedNumber(round) {
  switch (round) {
    case "floor":
      return 1;
    default:
      return 0.5;
  }
}

// ../../node_modules/javascript-time-ago/modules/steps/getStepMinTime.js
function _typeof5(obj) {
  "@babel/helpers - typeof";
  return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof5(obj);
}
function getStepMinTime(step, _ref) {
  var prevStep = _ref.prevStep, timestamp = _ref.timestamp, now = _ref.now, future = _ref.future, round = _ref.round;
  var minTime3;
  if (prevStep) {
    if (prevStep.id || prevStep.unit) {
      minTime3 = step["threshold_for_".concat(prevStep.id || prevStep.unit)];
    }
  }
  if (minTime3 === void 0) {
    if (step.threshold !== void 0) {
      minTime3 = step.threshold;
      if (typeof minTime3 === "function") {
        minTime3 = minTime3(now, future);
      }
    }
  }
  if (minTime3 === void 0) {
    minTime3 = step.minTime;
  }
  if (_typeof5(minTime3) === "object") {
    if (prevStep && prevStep.id && minTime3[prevStep.id] !== void 0) {
      minTime3 = minTime3[prevStep.id];
    } else {
      minTime3 = minTime3["default"];
    }
  }
  if (typeof minTime3 === "function") {
    minTime3 = minTime3(timestamp, {
      future,
      getMinTimeForUnit: function getMinTimeForUnit(toUnit, fromUnit) {
        return _getMinTimeForUnit(toUnit, fromUnit || prevStep && prevStep.formatAs, {
          round
        });
      }
    });
  }
  if (minTime3 === void 0) {
    if (step.test) {
      if (step.test(timestamp, {
        now,
        future
      })) {
        minTime3 = 0;
      } else {
        minTime3 = 9007199254740991;
      }
    }
  }
  if (minTime3 === void 0) {
    if (prevStep) {
      if (step.formatAs && prevStep.formatAs) {
        minTime3 = _getMinTimeForUnit(step.formatAs, prevStep.formatAs, {
          round
        });
      }
    } else {
      minTime3 = 0;
    }
  }
  if (minTime3 === void 0) {
    console.warn("[javascript-time-ago] A step should specify `minTime`:\n" + JSON.stringify(step, null, 2));
  }
  return minTime3;
}
function _getMinTimeForUnit(toUnit, fromUnit, _ref2) {
  var round = _ref2.round;
  var toUnitAmount = getSecondsInUnit(toUnit);
  var fromUnitAmount;
  if (fromUnit === "now") {
    fromUnitAmount = getSecondsInUnit(toUnit);
  } else {
    fromUnitAmount = getSecondsInUnit(fromUnit);
  }
  if (toUnitAmount !== void 0 && fromUnitAmount !== void 0) {
    return toUnitAmount - fromUnitAmount * (1 - getDiffRatioToNextRoundedNumber(round));
  }
}

// ../../node_modules/javascript-time-ago/modules/steps/getStep.js
function ownKeys2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys2(Object(source), true).forEach(function(key) {
      _defineProperty2(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function getStep(steps2, secondsPassed, _ref) {
  var now = _ref.now, future = _ref.future, round = _ref.round, units = _ref.units, getNextStep = _ref.getNextStep;
  steps2 = filterStepsByUnits(steps2, units);
  var step = _getStep(steps2, secondsPassed, {
    now,
    future,
    round
  });
  if (getNextStep) {
    if (step) {
      var prevStep = steps2[steps2.indexOf(step) - 1];
      var nextStep = steps2[steps2.indexOf(step) + 1];
      return [prevStep, step, nextStep];
    }
    return [void 0, void 0, steps2[0]];
  }
  return step;
}
function _getStep(steps2, secondsPassed, _ref2) {
  var now = _ref2.now, future = _ref2.future, round = _ref2.round;
  if (steps2.length === 0) {
    return;
  }
  var i = getStepIndex(steps2, secondsPassed, {
    now,
    future: future || secondsPassed < 0,
    round
  });
  if (i === -1) {
    return;
  }
  var step = steps2[i];
  if (step.granularity) {
    var secondsPassedGranular = getRoundFunction(round)(Math.abs(secondsPassed) / getStepDenominator(step) / step.granularity) * step.granularity;
    if (secondsPassedGranular === 0 && i > 0) {
      return steps2[i - 1];
    }
  }
  return step;
}
function getStepIndex(steps2, secondsPassed, options) {
  var i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
  var minTime3 = getStepMinTime(steps2[i], _objectSpread2({
    prevStep: steps2[i - 1],
    timestamp: options.now - secondsPassed * 1e3
  }, options));
  if (minTime3 === void 0) {
    return i - 1;
  }
  if (Math.abs(secondsPassed) < minTime3) {
    return i - 1;
  }
  if (i === steps2.length - 1) {
    return i;
  }
  return getStepIndex(steps2, secondsPassed, options, i + 1);
}
function filterStepsByUnits(steps2, units) {
  return steps2.filter(function(_ref3) {
    var unit = _ref3.unit, formatAs = _ref3.formatAs;
    unit = unit || formatAs;
    if (unit) {
      return units.indexOf(unit) >= 0;
    }
    return true;
  });
}

// ../../node_modules/javascript-time-ago/modules/steps/getTimeToNextUpdateForUnit.js
function getTimeToNextUpdateForUnit(unit, timestamp, _ref) {
  var now = _ref.now, round = _ref.round;
  if (!getSecondsInUnit(unit)) {
    return;
  }
  var unitDenominator = getSecondsInUnit(unit) * 1e3;
  var future = timestamp > now;
  var preciseAmount = Math.abs(timestamp - now);
  var roundedAmount = getRoundFunction(round)(preciseAmount / unitDenominator) * unitDenominator;
  if (future) {
    if (roundedAmount > 0) {
      return preciseAmount - roundedAmount + getDiffToPreviousRoundedNumber(round, unitDenominator);
    } else {
      return preciseAmount - roundedAmount + 1;
    }
  }
  return -(preciseAmount - roundedAmount) + getDiffToNextRoundedNumber(round, unitDenominator);
}
function getDiffToNextRoundedNumber(round, unitDenominator) {
  return getDiffRatioToNextRoundedNumber(round) * unitDenominator;
}
function getDiffToPreviousRoundedNumber(round, unitDenominator) {
  return (1 - getDiffRatioToNextRoundedNumber(round)) * unitDenominator + 1;
}

// ../../node_modules/javascript-time-ago/modules/steps/getTimeToNextUpdate.js
var YEAR = 365 * 24 * 60 * 60 * 1e3;
var INFINITY = 1e3 * YEAR;
function getTimeToNextUpdate(date, step, _ref) {
  var prevStep = _ref.prevStep, nextStep = _ref.nextStep, now = _ref.now, future = _ref.future, round = _ref.round;
  var timestamp = date.getTime ? date.getTime() : date;
  var getTimeToNextUpdateForUnit2 = function getTimeToNextUpdateForUnit3(unit2) {
    return getTimeToNextUpdateForUnit(unit2, timestamp, {
      now,
      round
    });
  };
  var timeToStepChange = getTimeToStepChange(future ? step : nextStep, timestamp, {
    future,
    now,
    round,
    prevStep: future ? prevStep : step
    // isFirstStep: future && isFirstStep
  });
  if (timeToStepChange === void 0) {
    return;
  }
  var timeToNextUpdate;
  if (step) {
    if (step.getTimeToNextUpdate) {
      timeToNextUpdate = step.getTimeToNextUpdate(timestamp, {
        getTimeToNextUpdateForUnit: getTimeToNextUpdateForUnit2,
        getRoundFunction,
        now,
        future,
        round
      });
    }
    if (timeToNextUpdate === void 0) {
      var unit = step.unit || step.formatAs;
      if (unit) {
        timeToNextUpdate = getTimeToNextUpdateForUnit2(unit);
      }
    }
  }
  if (timeToNextUpdate === void 0) {
    return timeToStepChange;
  }
  return Math.min(timeToNextUpdate, timeToStepChange);
}
function getStepChangesAt(currentOrNextStep, timestamp, _ref2) {
  var now = _ref2.now, future = _ref2.future, round = _ref2.round, prevStep = _ref2.prevStep;
  var minTime3 = getStepMinTime(currentOrNextStep, {
    timestamp,
    now,
    future,
    round,
    prevStep
  });
  if (minTime3 === void 0) {
    return;
  }
  if (future) {
    return timestamp - minTime3 * 1e3 + 1;
  } else {
    if (minTime3 === 0 && timestamp === now) {
      return INFINITY;
    }
    return timestamp + minTime3 * 1e3;
  }
}
function getTimeToStepChange(step, timestamp, _ref3) {
  var now = _ref3.now, future = _ref3.future, round = _ref3.round, prevStep = _ref3.prevStep;
  if (step) {
    var stepChangesAt = getStepChangesAt(step, timestamp, {
      now,
      future,
      round,
      prevStep
    });
    if (stepChangesAt === void 0) {
      return;
    }
    return stepChangesAt - now;
  } else {
    if (future) {
      return timestamp - now + 1;
    } else {
      return INFINITY;
    }
  }
}

// ../../node_modules/javascript-time-ago/modules/LocaleDataStore.js
var localesData2 = {};
function getLocaleData2(locale) {
  return localesData2[locale];
}
function addLocaleData2(localeData) {
  if (!localeData) {
    throw new Error("[javascript-time-ago] No locale data passed.");
  }
  localesData2[localeData.locale] = localeData;
}

// ../../node_modules/javascript-time-ago/modules/steps/round.js
var round_default = [{
  formatAs: "now"
}, {
  formatAs: "second"
}, {
  formatAs: "minute"
}, {
  formatAs: "hour"
}, {
  formatAs: "day"
}, {
  formatAs: "week"
}, {
  formatAs: "month"
}, {
  formatAs: "year"
}];

// ../../node_modules/javascript-time-ago/modules/style/round.js
var round_default2 = {
  steps: round_default,
  labels: "long"
};

// ../../node_modules/javascript-time-ago/modules/style/roundMinute.js
function ownKeys3(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread3(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys3(Object(source), true).forEach(function(key) {
      _defineProperty3(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys3(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty3(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var roundMinute_default = _objectSpread3(_objectSpread3({}, round_default2), {}, {
  // Skip "seconds".
  steps: round_default2.steps.filter(function(step) {
    return step.formatAs !== "second";
  })
});

// ../../node_modules/javascript-time-ago/modules/steps/approximate.js
var approximate_default = [{
  // This step returns the amount of seconds
  // by dividing the amount of seconds by `1`.
  factor: 1,
  // "now" labels are used for formatting the output.
  unit: "now"
}, {
  // When the language doesn't support `now` unit,
  // the first step is ignored, and it uses this `second` unit.
  threshold: 1,
  // `threshold_for_now` should be the same as `threshold` on minutes.
  threshold_for_now: 45.5,
  // This step returns the amount of seconds
  // by dividing the amount of seconds by `1`.
  factor: 1,
  // "second" labels are used for formatting the output.
  unit: "second"
}, {
  // `threshold` should be the same as `threshold_for_now` on seconds.
  threshold: 45.5,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a minute.
  factor: minute,
  // "minute" labels are used for formatting the output.
  unit: "minute"
}, {
  // This step is effective starting from 2.5 minutes.
  threshold: 2.5 * minute,
  // Allow only 5-minute increments of minutes starting from 2.5 minutes.
  // `granularity` — (advanced) Time interval value "granularity".
  // For example, it could be set to `5` for minutes to allow only 5-minute increments
  // when formatting time intervals: `0 minutes`, `5 minutes`, `10 minutes`, etc.
  // Perhaps this feature will be removed because there seem to be no use cases
  // of it in the real world.
  granularity: 5,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a minute.
  factor: minute,
  // "minute" labels are used for formatting the output.
  unit: "minute"
}, {
  // This step is effective starting from 22.5 minutes.
  threshold: 22.5 * minute,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in  half-an-hour.
  factor: 0.5 * hour,
  // "half-hour" labels are used for formatting the output.
  // (if available, which is no longer the case)
  unit: "half-hour"
}, {
  // This step is effective starting from 42.5 minutes.
  threshold: 42.5 * minute,
  threshold_for_minute: 52.5 * minute,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in an hour.
  factor: hour,
  // "hour" labels are used for formatting the output.
  unit: "hour"
}, {
  // This step is effective starting from 20.5 hours.
  threshold: 20.5 / 24 * day,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a day.
  factor: day,
  // "day" labels are used for formatting the output.
  unit: "day"
}, {
  // This step is effective starting from 5.5 days.
  threshold: 5.5 * day,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a week.
  factor: week,
  // "week" labels are used for formatting the output.
  unit: "week"
}, {
  // This step is effective starting from 3.5 weeks.
  threshold: 3.5 * week,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a month.
  factor: month,
  // "month" labels are used for formatting the output.
  unit: "month"
}, {
  // This step is effective starting from 10.5 months.
  threshold: 10.5 * month,
  // Return the amount of minutes by dividing the amount
  // of seconds by the amount of seconds in a year.
  factor: year,
  // "year" labels are used for formatting the output.
  unit: "year"
}];

// ../../node_modules/javascript-time-ago/modules/style/approximate.js
var approximate_default2 = {
  gradation: approximate_default,
  flavour: "long",
  units: ["now", "minute", "hour", "day", "week", "month", "year"]
};

// ../../node_modules/javascript-time-ago/modules/style/approximateTime.js
var approximateTime_default = {
  gradation: approximate_default,
  flavour: "long-time",
  units: ["now", "minute", "hour", "day", "week", "month", "year"]
};

// ../../node_modules/javascript-time-ago/modules/steps/helpers.js
function getDate(value) {
  return value instanceof Date ? value : new Date(value);
}

// ../../node_modules/javascript-time-ago/modules/style/twitter.js
var steps = [{
  formatAs: "second"
}, {
  formatAs: "minute"
}, {
  formatAs: "hour"
}];
var formatters = {};
var monthAndDay = {
  minTime: function minTime(timestamp, _ref) {
    var future = _ref.future, getMinTimeForUnit = _ref.getMinTimeForUnit;
    return getMinTimeForUnit("day");
  },
  format: function format(value, locale) {
    if (!formatters[locale]) {
      formatters[locale] = {};
    }
    if (!formatters[locale].dayMonth) {
      formatters[locale].dayMonth = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric"
      });
    }
    return formatters[locale].dayMonth.format(getDate(value));
  }
};
var yearMonthAndDay = {
  minTime: function minTime2(timestamp, _ref2) {
    var future = _ref2.future;
    if (future) {
      var maxFittingNow = new Date(new Date(timestamp).getFullYear(), 0).getTime() - 1;
      return (timestamp - maxFittingNow) / 1e3;
    } else {
      var minFittingNow = new Date(new Date(timestamp).getFullYear() + 1, 0).getTime();
      return (minFittingNow - timestamp) / 1e3;
    }
  },
  format: function format2(value, locale) {
    if (!formatters[locale]) {
      formatters[locale] = {};
    }
    if (!formatters[locale].dayMonthYear) {
      formatters[locale].dayMonthYear = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
    return formatters[locale].dayMonthYear.format(getDate(value));
  }
};
if (intlDateTimeFormatSupported()) {
  steps.push(monthAndDay, yearMonthAndDay);
} else {
  steps.push({
    formatAs: "day"
  }, {
    formatAs: "week"
  }, {
    formatAs: "month"
  }, {
    formatAs: "year"
  });
}
var twitter_default = {
  steps,
  labels: [
    // "mini" labels are only defined for a few languages.
    "mini",
    // "short-time" labels are only defined for a few languages.
    "short-time",
    // "narrow" and "short" labels are defined for all languages.
    // "narrow" labels can sometimes be weird (like "+5d."),
    // but "short" labels have the " ago" part, so "narrow" seem
    // more appropriate.
    // "short" labels would have been more appropriate if they
    // didn't have the " ago" part, hence the "short-time" above.
    "narrow",
    // Since "narrow" labels are always present, "short" element
    // of this array can be removed.
    "short"
  ]
};

// ../../node_modules/javascript-time-ago/modules/style/twitterNow.js
function ownKeys4(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread4(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys4(Object(source), true).forEach(function(key) {
      _defineProperty4(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys4(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty4(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var twitterNow_default = _objectSpread4(_objectSpread4({}, twitter_default), {}, {
  // Add "now".
  steps: [{
    formatAs: "now"
  }].concat(twitter_default.steps)
});

// ../../node_modules/javascript-time-ago/modules/style/twitterMinute.js
function ownKeys5(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread5(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys5(Object(source), true).forEach(function(key) {
      _defineProperty5(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys5(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty5(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var twitterMinute_default = _objectSpread5(_objectSpread5({}, twitter_default), {}, {
  // Skip "seconds".
  steps: twitter_default.steps.filter(function(step) {
    return step.formatAs !== "second";
  })
});

// ../../node_modules/javascript-time-ago/modules/style/twitterMinuteNow.js
function ownKeys6(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread6(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys6(Object(source), true).forEach(function(key) {
      _defineProperty6(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys6(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty6(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var twitterMinuteNow_default = _objectSpread6(_objectSpread6({}, twitterMinute_default), {}, {
  // Add "now".
  steps: [{
    formatAs: "now"
  }].concat(twitterMinute_default.steps)
});

// ../../node_modules/javascript-time-ago/modules/style/twitterFirstMinute.js
function ownKeys7(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread7(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys7(Object(source), true).forEach(function(key) {
      _defineProperty7(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys7(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty7(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var twitterFirstMinute_default = _objectSpread7(_objectSpread7({}, twitter_default), {}, {
  // Skip "seconds".
  steps: twitter_default.steps.filter(function(step) {
    return step.formatAs !== "second";
  }).map(function(step) {
    return step.formatAs === "minute" ? _objectSpread7(_objectSpread7({}, step), {}, {
      minTime: minute
    }) : step;
  })
});

// ../../node_modules/javascript-time-ago/modules/style/mini.js
var mini_default = {
  steps: [{
    formatAs: "second"
  }, {
    formatAs: "minute"
  }, {
    formatAs: "hour"
  }, {
    formatAs: "day"
  }, {
    formatAs: "month"
  }, {
    formatAs: "year"
  }],
  labels: [
    // "mini" labels are only defined for a few languages.
    "mini",
    // "short-time" labels are only defined for a few languages.
    "short-time",
    // "narrow" and "short" labels are defined for all languages.
    // "narrow" labels can sometimes be weird (like "+5d."),
    // but "short" labels have the " ago" part, so "narrow" seem
    // more appropriate.
    // "short" labels would have been more appropriate if they
    // didn't have the " ago" part, hence the "short-time" above.
    "narrow",
    // Since "narrow" labels are always present, "short" element
    // of this array can be removed.
    "short"
  ]
};

// ../../node_modules/javascript-time-ago/modules/style/miniNow.js
function ownKeys8(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread8(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys8(Object(source), true).forEach(function(key) {
      _defineProperty8(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys8(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty8(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var miniNow_default = _objectSpread8(_objectSpread8({}, mini_default), {}, {
  // Add "now".
  steps: [{
    formatAs: "now"
  }].concat(mini_default.steps)
});

// ../../node_modules/javascript-time-ago/modules/style/miniMinute.js
function ownKeys9(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread9(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys9(Object(source), true).forEach(function(key) {
      _defineProperty9(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys9(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty9(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var miniMinute_default = _objectSpread9(_objectSpread9({}, mini_default), {}, {
  // Skip "seconds".
  steps: mini_default.steps.filter(function(step) {
    return step.formatAs !== "second";
  })
});

// ../../node_modules/javascript-time-ago/modules/style/miniMinuteNow.js
function ownKeys10(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread10(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys10(Object(source), true).forEach(function(key) {
      _defineProperty10(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys10(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty10(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
var miniMinuteNow_default = _objectSpread10(_objectSpread10({}, miniMinute_default), {}, {
  // Add "now".
  steps: [{
    formatAs: "now"
  }].concat(miniMinute_default.steps)
});

// ../../node_modules/javascript-time-ago/modules/style/getStyleByName.js
function getStyleByName(style) {
  switch (style) {
    case "default":
    case "round":
      return round_default2;
    case "round-minute":
      return roundMinute_default;
    case "approximate":
      return approximate_default2;
    case "time":
    case "approximate-time":
      return approximateTime_default;
    case "mini":
      return mini_default;
    case "mini-now":
      return miniNow_default;
    case "mini-minute":
      return miniMinute_default;
    case "mini-minute-now":
      return miniMinuteNow_default;
    case "twitter":
      return twitter_default;
    case "twitter-now":
      return twitterNow_default;
    case "twitter-minute":
      return twitterMinute_default;
    case "twitter-minute-now":
      return twitterMinuteNow_default;
    case "twitter-first-minute":
      return twitterFirstMinute_default;
    default:
      return approximate_default2;
  }
}

// ../../node_modules/javascript-time-ago/modules/TimeAgo.js
function _typeof6(obj) {
  "@babel/helpers - typeof";
  return _typeof6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof6(obj);
}
function _createForOfIteratorHelperLoose2(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it)
    return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray3(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it)
      o = it;
    var i = 0;
    return function() {
      if (i >= o.length)
        return { done: true };
      return { done: false, value: o[i++] };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray2(arr, i) {
  return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i) || _unsupportedIterableToArray3(arr, i) || _nonIterableRest2();
}
function _nonIterableRest2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray3(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray3(o, minLen);
}
function _arrayLikeToArray3(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function _iterableToArrayLimit2(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i)
        break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null)
        _i["return"]();
    } finally {
      if (_d)
        throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles2(arr) {
  if (Array.isArray(arr))
    return arr;
}
function _classCallCheck4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties4(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass4(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties4(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties4(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
var TimeAgo = function() {
  function TimeAgo2() {
    var locales = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, polyfill = _ref.polyfill;
    _classCallCheck4(this, TimeAgo2);
    if (typeof locales === "string") {
      locales = [locales];
    }
    this.locale = chooseLocale(locales.concat(TimeAgo2.getDefaultLocale()), getLocaleData2);
    if (typeof Intl !== "undefined") {
      if (Intl.NumberFormat) {
        this.numberFormat = new Intl.NumberFormat(this.locale);
      }
    }
    if (polyfill === false) {
      this.IntlRelativeTimeFormat = Intl.RelativeTimeFormat;
      this.IntlPluralRules = Intl.PluralRules;
    } else {
      this.IntlRelativeTimeFormat = RelativeTimeFormat;
      this.IntlPluralRules = RelativeTimeFormat.PluralRules;
    }
    this.relativeTimeFormatCache = new Cache();
    this.pluralRulesCache = new Cache();
  }
  _createClass4(TimeAgo2, [{
    key: "format",
    value: function format3(input, style, options) {
      if (!options) {
        if (style && !isStyle(style)) {
          options = style;
          style = void 0;
        } else {
          options = {};
        }
      }
      if (!style) {
        style = roundMinute_default;
      }
      if (typeof style === "string") {
        style = getStyleByName(style);
      }
      var timestamp = getTimestamp(input);
      var _this$getLabels = this.getLabels(style.flavour || style.labels), labels = _this$getLabels.labels, labelsType = _this$getLabels.labelsType;
      var now;
      if (style.now !== void 0) {
        now = style.now;
      }
      if (now === void 0 && options.now !== void 0) {
        now = options.now;
      }
      if (now === void 0) {
        now = Date.now();
      }
      var secondsPassed = (now - timestamp) / 1e3;
      var future = options.future || secondsPassed < 0;
      var nowLabel = getNowLabel(labels, getLocaleData2(this.locale).now, getLocaleData2(this.locale)["long"], future);
      if (style.custom) {
        var custom = style.custom({
          now,
          date: new Date(timestamp),
          time: timestamp,
          elapsed: secondsPassed,
          locale: this.locale
        });
        if (custom !== void 0) {
          return custom;
        }
      }
      var units = getTimeIntervalMeasurementUnits(
        // Controlling `style.steps` through `style.units` seems to be deprecated:
        // create a new custom `style` instead.
        style.units,
        labels,
        nowLabel
      );
      var round = options.round || style.round;
      var _getStep2 = getStep(
        // "gradation" is a legacy name for "steps".
        // For historical reasons, "approximate" steps are used by default.
        // In the next major version, there'll be no default for `steps`.
        style.gradation || style.steps || roundMinute_default.steps,
        secondsPassed,
        {
          now,
          units,
          round,
          future,
          getNextStep: true
        }
      ), _getStep22 = _slicedToArray2(_getStep2, 3), prevStep = _getStep22[0], step = _getStep22[1], nextStep = _getStep22[2];
      var formattedDate = this.formatDateForStep(timestamp, step, secondsPassed, {
        labels,
        labelsType,
        nowLabel,
        now,
        future,
        round
      }) || "";
      if (options.getTimeToNextUpdate) {
        var timeToNextUpdate = getTimeToNextUpdate(timestamp, step, {
          nextStep,
          prevStep,
          now,
          future,
          round
        });
        return [formattedDate, timeToNextUpdate];
      }
      return formattedDate;
    }
  }, {
    key: "formatDateForStep",
    value: function formatDateForStep(timestamp, step, secondsPassed, _ref2) {
      var _this = this;
      var labels = _ref2.labels, labelsType = _ref2.labelsType, nowLabel = _ref2.nowLabel, now = _ref2.now, future = _ref2.future, round = _ref2.round;
      if (!step) {
        return;
      }
      if (step.format) {
        return step.format(timestamp, this.locale, {
          formatAs: function formatAs(unit2, value) {
            return _this.formatValue(value, unit2, {
              labels,
              future
            });
          },
          now,
          future
        });
      }
      var unit = step.unit || step.formatAs;
      if (!unit) {
        throw new Error("[javascript-time-ago] Each step must define either `formatAs` or `format()`. Step: ".concat(JSON.stringify(step)));
      }
      if (unit === "now") {
        return nowLabel;
      }
      var amount = Math.abs(secondsPassed) / getStepDenominator(step);
      if (step.granularity) {
        amount = getRoundFunction(round)(amount / step.granularity) * step.granularity;
      }
      var valueForFormatting = -1 * Math.sign(secondsPassed) * getRoundFunction(round)(amount);
      if (valueForFormatting === 0) {
        if (future) {
          valueForFormatting = 0;
        } else {
          valueForFormatting = -0;
        }
      }
      switch (labelsType) {
        case "long":
        case "short":
        case "narrow":
          return this.getFormatter(labelsType).format(valueForFormatting, unit);
        default:
          return this.formatValue(valueForFormatting, unit, {
            labels,
            future
          });
      }
    }
    /**
     * Mimicks what `Intl.RelativeTimeFormat` does for additional locale styles.
     * @param  {number} value
     * @param  {string} unit
     * @param  {object} options.labels — Relative time labels.
     * @param  {boolean} [options.future] — Tells how to format value `0`: as "future" (`true`) or "past" (`false`). Is `false` by default, but should have been `true` actually.
     * @return {string}
     */
  }, {
    key: "formatValue",
    value: function formatValue(value, unit, _ref3) {
      var labels = _ref3.labels, future = _ref3.future;
      return this.getFormattingRule(labels, unit, value, {
        future
      }).replace("{0}", this.formatNumber(Math.abs(value)));
    }
    /**
     * Returns formatting rule for `value` in `units` (either in past or in future).
     * @param {object} formattingRules — Relative time labels for different units.
     * @param {string} unit - Time interval measurement unit.
     * @param {number} value - Time interval value.
     * @param  {boolean} [options.future] — Tells how to format value `0`: as "future" (`true`) or "past" (`false`). Is `false` by default.
     * @return {string}
     * @example
     * // Returns "{0} days ago"
     * getFormattingRule(en.long, "day", -2, 'en')
     */
  }, {
    key: "getFormattingRule",
    value: function getFormattingRule(formattingRules, unit, value, _ref4) {
      var future = _ref4.future;
      var locale = this.locale;
      formattingRules = formattingRules[unit];
      if (typeof formattingRules === "string") {
        return formattingRules;
      }
      var pastOrFuture = value === 0 ? future ? "future" : "past" : value < 0 ? "past" : "future";
      var quantifierRules = formattingRules[pastOrFuture] || formattingRules;
      if (typeof quantifierRules === "string") {
        return quantifierRules;
      }
      var quantifier = this.getPluralRules().select(Math.abs(value));
      return quantifierRules[quantifier] || quantifierRules.other;
    }
    /**
     * Formats a number into a string.
     * Uses `Intl.NumberFormat` when available.
     * @param  {number} number
     * @return {string}
     */
  }, {
    key: "formatNumber",
    value: function formatNumber(number) {
      return this.numberFormat ? this.numberFormat.format(number) : String(number);
    }
    /**
     * Returns an `Intl.RelativeTimeFormat` for a given `labelsType`.
     * @param {string} labelsType
     * @return {object} `Intl.RelativeTimeFormat` instance
     */
  }, {
    key: "getFormatter",
    value: function getFormatter(labelsType) {
      return this.relativeTimeFormatCache.get(this.locale, labelsType) || this.relativeTimeFormatCache.put(this.locale, labelsType, new this.IntlRelativeTimeFormat(this.locale, {
        style: labelsType
      }));
    }
    /**
     * Returns an `Intl.PluralRules` instance.
     * @return {object} `Intl.PluralRules` instance
     */
  }, {
    key: "getPluralRules",
    value: function getPluralRules() {
      return this.pluralRulesCache.get(this.locale) || this.pluralRulesCache.put(this.locale, new this.IntlPluralRules(this.locale));
    }
    /**
     * Gets localized labels for this type of labels.
     *
     * @param {(string|string[])} labelsType - Relative date/time labels type.
     *                                     If it's an array then all label types are tried
     *                                     until a suitable one is found.
     *
     * @returns {Object} Returns an object of shape { labelsType, labels }
     */
  }, {
    key: "getLabels",
    value: function getLabels() {
      var labelsType = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      if (typeof labelsType === "string") {
        labelsType = [labelsType];
      }
      labelsType = labelsType.map(function(labelsType2) {
        switch (labelsType2) {
          case "tiny":
          case "mini-time":
            return "mini";
          default:
            return labelsType2;
        }
      });
      labelsType = labelsType.concat("long");
      var localeData = getLocaleData2(this.locale);
      for (var _iterator = _createForOfIteratorHelperLoose2(labelsType), _step; !(_step = _iterator()).done; ) {
        var _labelsType = _step.value;
        if (localeData[_labelsType]) {
          return {
            labelsType: _labelsType,
            labels: localeData[_labelsType]
          };
        }
      }
    }
  }]);
  return TimeAgo2;
}();
var defaultLocale2 = "en";
TimeAgo.getDefaultLocale = function() {
  return defaultLocale2;
};
TimeAgo.setDefaultLocale = function(locale) {
  return defaultLocale2 = locale;
};
TimeAgo.addDefaultLocale = function(localeData) {
  if (defaultLocaleHasBeenSpecified) {
    return console.error("[javascript-time-ago] `TimeAgo.addDefaultLocale()` can only be called once. To add other locales, use `TimeAgo.addLocale()`.");
  }
  defaultLocaleHasBeenSpecified = true;
  TimeAgo.setDefaultLocale(localeData.locale);
  TimeAgo.addLocale(localeData);
};
var defaultLocaleHasBeenSpecified;
TimeAgo.addLocale = function(localeData) {
  addLocaleData2(localeData);
  RelativeTimeFormat.addLocale(localeData);
};
TimeAgo.locale = TimeAgo.addLocale;
TimeAgo.addLabels = function(locale, name, labels) {
  var localeData = getLocaleData2(locale);
  if (!localeData) {
    addLocaleData2({
      locale
    });
    localeData = getLocaleData2(locale);
  }
  localeData[name] = labels;
};
function getTimestamp(input) {
  if (input.constructor === Date || isMockedDate(input)) {
    return input.getTime();
  }
  if (typeof input === "number") {
    return input;
  }
  throw new Error("Unsupported relative time formatter input: ".concat(_typeof6(input), ", ").concat(input));
}
function isMockedDate(object) {
  return _typeof6(object) === "object" && typeof object.getTime === "function";
}
function getTimeIntervalMeasurementUnits(allowedUnits, labels, nowLabel) {
  var units = Object.keys(labels);
  if (nowLabel) {
    units.push("now");
  }
  if (allowedUnits) {
    units = allowedUnits.filter(function(unit) {
      return unit === "now" || units.indexOf(unit) >= 0;
    });
  }
  return units;
}
function getNowLabel(labels, nowLabels, longLabels, future) {
  var nowLabel = labels.now || nowLabels && nowLabels.now;
  if (nowLabel) {
    if (typeof nowLabel === "string") {
      return nowLabel;
    }
    if (future) {
      return nowLabel.future;
    } else {
      return nowLabel.past;
    }
  }
  if (longLabels && longLabels.second && longLabels.second.current) {
    return longLabels.second.current;
  }
}
function isStyle(variable) {
  return typeof variable === "string" || isStyleObject(variable);
}
export {
  TimeAgo as default,
  intlDateTimeFormatSupported,
  intlDateTimeFormatSupportedLocale
};
//# sourceMappingURL=javascript-time-ago.js.map
