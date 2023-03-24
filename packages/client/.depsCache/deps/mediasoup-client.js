import {
  require_es5
} from "./chunk-NNDZTC3B.js";
import {
  require_events
} from "./chunk-737UOI5K.js";
import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/ms/index.js
var require_ms = __commonJS({
  "../../node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../../node_modules/debug/src/common.js
var require_common = __commonJS({
  "../../node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// ../../node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "../../node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// ../../node_modules/mediasoup-client/lib/Logger.js
var require_Logger = __commonJS({
  "../../node_modules/mediasoup-client/lib/Logger.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Logger = void 0;
    var debug_1 = __importDefault(require_browser());
    var APP_NAME = "mediasoup-client";
    var Logger = class {
      constructor(prefix) {
        if (prefix) {
          this._debug = (0, debug_1.default)(`${APP_NAME}:${prefix}`);
          this._warn = (0, debug_1.default)(`${APP_NAME}:WARN:${prefix}`);
          this._error = (0, debug_1.default)(`${APP_NAME}:ERROR:${prefix}`);
        } else {
          this._debug = (0, debug_1.default)(APP_NAME);
          this._warn = (0, debug_1.default)(`${APP_NAME}:WARN`);
          this._error = (0, debug_1.default)(`${APP_NAME}:ERROR`);
        }
        this._debug.log = console.info.bind(console);
        this._warn.log = console.warn.bind(console);
        this._error.log = console.error.bind(console);
      }
      get debug() {
        return this._debug;
      }
      get warn() {
        return this._warn;
      }
      get error() {
        return this._error;
      }
    };
    exports.Logger = Logger;
  }
});

// ../../node_modules/mediasoup-client/lib/EnhancedEventEmitter.js
var require_EnhancedEventEmitter = __commonJS({
  "../../node_modules/mediasoup-client/lib/EnhancedEventEmitter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnhancedEventEmitter = void 0;
    var events_1 = require_events();
    var Logger_1 = require_Logger();
    var logger = new Logger_1.Logger("EnhancedEventEmitter");
    var EnhancedEventEmitter = class extends events_1.EventEmitter {
      constructor() {
        super();
        this.setMaxListeners(Infinity);
      }
      emit(eventName, ...args) {
        return super.emit(eventName, ...args);
      }
      /**
       * Special addition to the EventEmitter API.
       */
      safeEmit(eventName, ...args) {
        const numListeners = super.listenerCount(eventName);
        try {
          return super.emit(eventName, ...args);
        } catch (error) {
          logger.error("safeEmit() | event listener threw an error [eventName:%s]:%o", eventName, error);
          return Boolean(numListeners);
        }
      }
      on(eventName, listener) {
        super.on(eventName, listener);
        return this;
      }
      off(eventName, listener) {
        super.off(eventName, listener);
        return this;
      }
      addListener(eventName, listener) {
        super.on(eventName, listener);
        return this;
      }
      prependListener(eventName, listener) {
        super.prependListener(eventName, listener);
        return this;
      }
      once(eventName, listener) {
        super.once(eventName, listener);
        return this;
      }
      prependOnceListener(eventName, listener) {
        super.prependOnceListener(eventName, listener);
        return this;
      }
      removeListener(eventName, listener) {
        super.off(eventName, listener);
        return this;
      }
      removeAllListeners(eventName) {
        super.removeAllListeners(eventName);
        return this;
      }
      listenerCount(eventName) {
        return super.listenerCount(eventName);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      rawListeners(eventName) {
        return super.rawListeners(eventName);
      }
    };
    exports.EnhancedEventEmitter = EnhancedEventEmitter;
  }
});

// ../../node_modules/mediasoup-client/lib/errors.js
var require_errors = __commonJS({
  "../../node_modules/mediasoup-client/lib/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidStateError = exports.UnsupportedError = void 0;
    var UnsupportedError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "UnsupportedError";
        if (Error.hasOwnProperty("captureStackTrace")) {
          Error.captureStackTrace(this, UnsupportedError);
        } else {
          this.stack = new Error(message).stack;
        }
      }
    };
    exports.UnsupportedError = UnsupportedError;
    var InvalidStateError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "InvalidStateError";
        if (Error.hasOwnProperty("captureStackTrace")) {
          Error.captureStackTrace(this, InvalidStateError);
        } else {
          this.stack = new Error(message).stack;
        }
      }
    };
    exports.InvalidStateError = InvalidStateError;
  }
});

// ../../node_modules/mediasoup-client/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/mediasoup-client/lib/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateRandomNumber = exports.clone = void 0;
    function clone(data, defaultValue) {
      if (typeof data === "undefined")
        return defaultValue;
      return JSON.parse(JSON.stringify(data));
    }
    exports.clone = clone;
    function generateRandomNumber() {
      return Math.round(Math.random() * 1e7);
    }
    exports.generateRandomNumber = generateRandomNumber;
  }
});

// ../../node_modules/h264-profile-level-id/index.js
var require_h264_profile_level_id = __commonJS({
  "../../node_modules/h264-profile-level-id/index.js"(exports) {
    var debug = require_browser()("h264-profile-level-id");
    debug.log = console.info.bind(console);
    var ProfileConstrainedBaseline = 1;
    var ProfileBaseline = 2;
    var ProfileMain = 3;
    var ProfileConstrainedHigh = 4;
    var ProfileHigh = 5;
    exports.ProfileConstrainedBaseline = ProfileConstrainedBaseline;
    exports.ProfileBaseline = ProfileBaseline;
    exports.ProfileMain = ProfileMain;
    exports.ProfileConstrainedHigh = ProfileConstrainedHigh;
    exports.ProfileHigh = ProfileHigh;
    var Level1_b = 0;
    var Level1 = 10;
    var Level1_1 = 11;
    var Level1_2 = 12;
    var Level1_3 = 13;
    var Level2 = 20;
    var Level2_1 = 21;
    var Level2_2 = 22;
    var Level3 = 30;
    var Level3_1 = 31;
    var Level3_2 = 32;
    var Level4 = 40;
    var Level4_1 = 41;
    var Level4_2 = 42;
    var Level5 = 50;
    var Level5_1 = 51;
    var Level5_2 = 52;
    exports.Level1_b = Level1_b;
    exports.Level1 = Level1;
    exports.Level1_1 = Level1_1;
    exports.Level1_2 = Level1_2;
    exports.Level1_3 = Level1_3;
    exports.Level2 = Level2;
    exports.Level2_1 = Level2_1;
    exports.Level2_2 = Level2_2;
    exports.Level3 = Level3;
    exports.Level3_1 = Level3_1;
    exports.Level3_2 = Level3_2;
    exports.Level4 = Level4;
    exports.Level4_1 = Level4_1;
    exports.Level4_2 = Level4_2;
    exports.Level5 = Level5;
    exports.Level5_1 = Level5_1;
    exports.Level5_2 = Level5_2;
    var ProfileLevelId = class {
      constructor(profile, level) {
        this.profile = profile;
        this.level = level;
      }
    };
    exports.ProfileLevelId = ProfileLevelId;
    var DefaultProfileLevelId = new ProfileLevelId(ProfileConstrainedBaseline, Level3_1);
    var ConstraintSet3Flag = 16;
    var BitPattern = class {
      constructor(str) {
        this._mask = ~byteMaskString("x", str);
        this._maskedValue = byteMaskString("1", str);
      }
      isMatch(value) {
        return this._maskedValue === (value & this._mask);
      }
    };
    var ProfilePattern = class {
      constructor(profile_idc, profile_iop, profile) {
        this.profile_idc = profile_idc;
        this.profile_iop = profile_iop;
        this.profile = profile;
      }
    };
    var ProfilePatterns = [
      new ProfilePattern(66, new BitPattern("x1xx0000"), ProfileConstrainedBaseline),
      new ProfilePattern(77, new BitPattern("1xxx0000"), ProfileConstrainedBaseline),
      new ProfilePattern(88, new BitPattern("11xx0000"), ProfileConstrainedBaseline),
      new ProfilePattern(66, new BitPattern("x0xx0000"), ProfileBaseline),
      new ProfilePattern(88, new BitPattern("10xx0000"), ProfileBaseline),
      new ProfilePattern(77, new BitPattern("0x0x0000"), ProfileMain),
      new ProfilePattern(100, new BitPattern("00000000"), ProfileHigh),
      new ProfilePattern(100, new BitPattern("00001100"), ProfileConstrainedHigh)
    ];
    exports.parseProfileLevelId = function(str) {
      if (typeof str !== "string" || str.length !== 6)
        return null;
      const profile_level_id_numeric = parseInt(str, 16);
      if (profile_level_id_numeric === 0)
        return null;
      const level_idc = profile_level_id_numeric & 255;
      const profile_iop = profile_level_id_numeric >> 8 & 255;
      const profile_idc = profile_level_id_numeric >> 16 & 255;
      let level;
      switch (level_idc) {
        case Level1_1: {
          level = (profile_iop & ConstraintSet3Flag) !== 0 ? Level1_b : Level1_1;
          break;
        }
        case Level1:
        case Level1_2:
        case Level1_3:
        case Level2:
        case Level2_1:
        case Level2_2:
        case Level3:
        case Level3_1:
        case Level3_2:
        case Level4:
        case Level4_1:
        case Level4_2:
        case Level5:
        case Level5_1:
        case Level5_2: {
          level = level_idc;
          break;
        }
        default: {
          debug("parseProfileLevelId() | unrecognized level_idc:%s", level_idc);
          return null;
        }
      }
      for (const pattern of ProfilePatterns) {
        if (profile_idc === pattern.profile_idc && pattern.profile_iop.isMatch(profile_iop)) {
          return new ProfileLevelId(pattern.profile, level);
        }
      }
      debug("parseProfileLevelId() | unrecognized profile_idc/profile_iop combination");
      return null;
    };
    exports.profileLevelIdToString = function(profile_level_id) {
      if (profile_level_id.level == Level1_b) {
        switch (profile_level_id.profile) {
          case ProfileConstrainedBaseline: {
            return "42f00b";
          }
          case ProfileBaseline: {
            return "42100b";
          }
          case ProfileMain: {
            return "4d100b";
          }
          default: {
            debug(
              "profileLevelIdToString() | Level 1_b not is allowed for profile:%s",
              profile_level_id.profile
            );
            return null;
          }
        }
      }
      let profile_idc_iop_string;
      switch (profile_level_id.profile) {
        case ProfileConstrainedBaseline: {
          profile_idc_iop_string = "42e0";
          break;
        }
        case ProfileBaseline: {
          profile_idc_iop_string = "4200";
          break;
        }
        case ProfileMain: {
          profile_idc_iop_string = "4d00";
          break;
        }
        case ProfileConstrainedHigh: {
          profile_idc_iop_string = "640c";
          break;
        }
        case ProfileHigh: {
          profile_idc_iop_string = "6400";
          break;
        }
        default: {
          debug(
            "profileLevelIdToString() | unrecognized profile:%s",
            profile_level_id.profile
          );
          return null;
        }
      }
      let levelStr = profile_level_id.level.toString(16);
      if (levelStr.length === 1)
        levelStr = `0${levelStr}`;
      return `${profile_idc_iop_string}${levelStr}`;
    };
    exports.parseSdpProfileLevelId = function(params = {}) {
      const profile_level_id = params["profile-level-id"];
      return !profile_level_id ? DefaultProfileLevelId : exports.parseProfileLevelId(profile_level_id);
    };
    exports.isSameProfile = function(params1 = {}, params2 = {}) {
      const profile_level_id_1 = exports.parseSdpProfileLevelId(params1);
      const profile_level_id_2 = exports.parseSdpProfileLevelId(params2);
      return Boolean(
        profile_level_id_1 && profile_level_id_2 && profile_level_id_1.profile === profile_level_id_2.profile
      );
    };
    exports.generateProfileLevelIdForAnswer = function(local_supported_params = {}, remote_offered_params = {}) {
      if (!local_supported_params["profile-level-id"] && !remote_offered_params["profile-level-id"]) {
        debug(
          "generateProfileLevelIdForAnswer() | no profile-level-id in local and remote params"
        );
        return null;
      }
      const local_profile_level_id = exports.parseSdpProfileLevelId(local_supported_params);
      const remote_profile_level_id = exports.parseSdpProfileLevelId(remote_offered_params);
      if (!local_profile_level_id)
        throw new TypeError("invalid local_profile_level_id");
      if (!remote_profile_level_id)
        throw new TypeError("invalid remote_profile_level_id");
      if (local_profile_level_id.profile !== remote_profile_level_id.profile)
        throw new TypeError("H264 Profile mismatch");
      const level_asymmetry_allowed = isLevelAsymmetryAllowed(local_supported_params) && isLevelAsymmetryAllowed(remote_offered_params);
      const local_level = local_profile_level_id.level;
      const remote_level = remote_profile_level_id.level;
      const min_level = minLevel(local_level, remote_level);
      const answer_level = level_asymmetry_allowed ? local_level : min_level;
      debug(
        "generateProfileLevelIdForAnswer() | result: [profile:%s, level:%s]",
        local_profile_level_id.profile,
        answer_level
      );
      return exports.profileLevelIdToString(
        new ProfileLevelId(local_profile_level_id.profile, answer_level)
      );
    };
    function byteMaskString(c, str) {
      return (str[0] === c) << 7 | (str[1] === c) << 6 | (str[2] === c) << 5 | (str[3] === c) << 4 | (str[4] === c) << 3 | (str[5] === c) << 2 | (str[6] === c) << 1 | (str[7] === c) << 0;
    }
    function isLessLevel(a, b) {
      if (a === Level1_b)
        return b !== Level1 && b !== Level1_b;
      if (b === Level1_b)
        return a !== Level1;
      return a < b;
    }
    function minLevel(a, b) {
      return isLessLevel(a, b) ? a : b;
    }
    function isLevelAsymmetryAllowed(params = {}) {
      const level_asymmetry_allowed = params["level-asymmetry-allowed"];
      return level_asymmetry_allowed === 1 || level_asymmetry_allowed === "1";
    }
  }
});

// ../../node_modules/mediasoup-client/lib/ortc.js
var require_ortc = __commonJS({
  "../../node_modules/mediasoup-client/lib/ortc.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.canReceive = exports.canSend = exports.generateProbatorRtpParameters = exports.reduceCodecs = exports.getSendingRemoteRtpParameters = exports.getSendingRtpParameters = exports.getRecvRtpCapabilities = exports.getExtendedRtpCapabilities = exports.validateSctpStreamParameters = exports.validateSctpParameters = exports.validateNumSctpStreams = exports.validateSctpCapabilities = exports.validateRtcpParameters = exports.validateRtpEncodingParameters = exports.validateRtpHeaderExtensionParameters = exports.validateRtpCodecParameters = exports.validateRtpParameters = exports.validateRtpHeaderExtension = exports.validateRtcpFeedback = exports.validateRtpCodecCapability = exports.validateRtpCapabilities = void 0;
    var h264 = __importStar(require_h264_profile_level_id());
    var utils = __importStar(require_utils());
    var RTP_PROBATOR_MID = "probator";
    var RTP_PROBATOR_SSRC = 1234;
    var RTP_PROBATOR_CODEC_PAYLOAD_TYPE = 127;
    function validateRtpCapabilities(caps) {
      if (typeof caps !== "object")
        throw new TypeError("caps is not an object");
      if (caps.codecs && !Array.isArray(caps.codecs))
        throw new TypeError("caps.codecs is not an array");
      else if (!caps.codecs)
        caps.codecs = [];
      for (const codec of caps.codecs) {
        validateRtpCodecCapability(codec);
      }
      if (caps.headerExtensions && !Array.isArray(caps.headerExtensions))
        throw new TypeError("caps.headerExtensions is not an array");
      else if (!caps.headerExtensions)
        caps.headerExtensions = [];
      for (const ext of caps.headerExtensions) {
        validateRtpHeaderExtension(ext);
      }
    }
    exports.validateRtpCapabilities = validateRtpCapabilities;
    function validateRtpCodecCapability(codec) {
      const MimeTypeRegex = new RegExp("^(audio|video)/(.+)", "i");
      if (typeof codec !== "object")
        throw new TypeError("codec is not an object");
      if (!codec.mimeType || typeof codec.mimeType !== "string")
        throw new TypeError("missing codec.mimeType");
      const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
      if (!mimeTypeMatch)
        throw new TypeError("invalid codec.mimeType");
      codec.kind = mimeTypeMatch[1].toLowerCase();
      if (codec.preferredPayloadType && typeof codec.preferredPayloadType !== "number")
        throw new TypeError("invalid codec.preferredPayloadType");
      if (typeof codec.clockRate !== "number")
        throw new TypeError("missing codec.clockRate");
      if (codec.kind === "audio") {
        if (typeof codec.channels !== "number")
          codec.channels = 1;
      } else {
        delete codec.channels;
      }
      if (!codec.parameters || typeof codec.parameters !== "object")
        codec.parameters = {};
      for (const key of Object.keys(codec.parameters)) {
        let value = codec.parameters[key];
        if (value === void 0) {
          codec.parameters[key] = "";
          value = "";
        }
        if (typeof value !== "string" && typeof value !== "number") {
          throw new TypeError(`invalid codec parameter [key:${key}s, value:${value}]`);
        }
        if (key === "apt") {
          if (typeof value !== "number")
            throw new TypeError("invalid codec apt parameter");
        }
      }
      if (!codec.rtcpFeedback || !Array.isArray(codec.rtcpFeedback))
        codec.rtcpFeedback = [];
      for (const fb of codec.rtcpFeedback) {
        validateRtcpFeedback(fb);
      }
    }
    exports.validateRtpCodecCapability = validateRtpCodecCapability;
    function validateRtcpFeedback(fb) {
      if (typeof fb !== "object")
        throw new TypeError("fb is not an object");
      if (!fb.type || typeof fb.type !== "string")
        throw new TypeError("missing fb.type");
      if (!fb.parameter || typeof fb.parameter !== "string")
        fb.parameter = "";
    }
    exports.validateRtcpFeedback = validateRtcpFeedback;
    function validateRtpHeaderExtension(ext) {
      if (typeof ext !== "object")
        throw new TypeError("ext is not an object");
      if (ext.kind !== "audio" && ext.kind !== "video")
        throw new TypeError("invalid ext.kind");
      if (!ext.uri || typeof ext.uri !== "string")
        throw new TypeError("missing ext.uri");
      if (typeof ext.preferredId !== "number")
        throw new TypeError("missing ext.preferredId");
      if (ext.preferredEncrypt && typeof ext.preferredEncrypt !== "boolean")
        throw new TypeError("invalid ext.preferredEncrypt");
      else if (!ext.preferredEncrypt)
        ext.preferredEncrypt = false;
      if (ext.direction && typeof ext.direction !== "string")
        throw new TypeError("invalid ext.direction");
      else if (!ext.direction)
        ext.direction = "sendrecv";
    }
    exports.validateRtpHeaderExtension = validateRtpHeaderExtension;
    function validateRtpParameters(params) {
      if (typeof params !== "object")
        throw new TypeError("params is not an object");
      if (params.mid && typeof params.mid !== "string")
        throw new TypeError("params.mid is not a string");
      if (!Array.isArray(params.codecs))
        throw new TypeError("missing params.codecs");
      for (const codec of params.codecs) {
        validateRtpCodecParameters(codec);
      }
      if (params.headerExtensions && !Array.isArray(params.headerExtensions))
        throw new TypeError("params.headerExtensions is not an array");
      else if (!params.headerExtensions)
        params.headerExtensions = [];
      for (const ext of params.headerExtensions) {
        validateRtpHeaderExtensionParameters(ext);
      }
      if (params.encodings && !Array.isArray(params.encodings))
        throw new TypeError("params.encodings is not an array");
      else if (!params.encodings)
        params.encodings = [];
      for (const encoding of params.encodings) {
        validateRtpEncodingParameters(encoding);
      }
      if (params.rtcp && typeof params.rtcp !== "object")
        throw new TypeError("params.rtcp is not an object");
      else if (!params.rtcp)
        params.rtcp = {};
      validateRtcpParameters(params.rtcp);
    }
    exports.validateRtpParameters = validateRtpParameters;
    function validateRtpCodecParameters(codec) {
      const MimeTypeRegex = new RegExp("^(audio|video)/(.+)", "i");
      if (typeof codec !== "object")
        throw new TypeError("codec is not an object");
      if (!codec.mimeType || typeof codec.mimeType !== "string")
        throw new TypeError("missing codec.mimeType");
      const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
      if (!mimeTypeMatch)
        throw new TypeError("invalid codec.mimeType");
      if (typeof codec.payloadType !== "number")
        throw new TypeError("missing codec.payloadType");
      if (typeof codec.clockRate !== "number")
        throw new TypeError("missing codec.clockRate");
      const kind = mimeTypeMatch[1].toLowerCase();
      if (kind === "audio") {
        if (typeof codec.channels !== "number")
          codec.channels = 1;
      } else {
        delete codec.channels;
      }
      if (!codec.parameters || typeof codec.parameters !== "object")
        codec.parameters = {};
      for (const key of Object.keys(codec.parameters)) {
        let value = codec.parameters[key];
        if (value === void 0) {
          codec.parameters[key] = "";
          value = "";
        }
        if (typeof value !== "string" && typeof value !== "number") {
          throw new TypeError(`invalid codec parameter [key:${key}s, value:${value}]`);
        }
        if (key === "apt") {
          if (typeof value !== "number")
            throw new TypeError("invalid codec apt parameter");
        }
      }
      if (!codec.rtcpFeedback || !Array.isArray(codec.rtcpFeedback))
        codec.rtcpFeedback = [];
      for (const fb of codec.rtcpFeedback) {
        validateRtcpFeedback(fb);
      }
    }
    exports.validateRtpCodecParameters = validateRtpCodecParameters;
    function validateRtpHeaderExtensionParameters(ext) {
      if (typeof ext !== "object")
        throw new TypeError("ext is not an object");
      if (!ext.uri || typeof ext.uri !== "string")
        throw new TypeError("missing ext.uri");
      if (typeof ext.id !== "number")
        throw new TypeError("missing ext.id");
      if (ext.encrypt && typeof ext.encrypt !== "boolean")
        throw new TypeError("invalid ext.encrypt");
      else if (!ext.encrypt)
        ext.encrypt = false;
      if (!ext.parameters || typeof ext.parameters !== "object")
        ext.parameters = {};
      for (const key of Object.keys(ext.parameters)) {
        let value = ext.parameters[key];
        if (value === void 0) {
          ext.parameters[key] = "";
          value = "";
        }
        if (typeof value !== "string" && typeof value !== "number")
          throw new TypeError("invalid header extension parameter");
      }
    }
    exports.validateRtpHeaderExtensionParameters = validateRtpHeaderExtensionParameters;
    function validateRtpEncodingParameters(encoding) {
      if (typeof encoding !== "object")
        throw new TypeError("encoding is not an object");
      if (encoding.ssrc && typeof encoding.ssrc !== "number")
        throw new TypeError("invalid encoding.ssrc");
      if (encoding.rid && typeof encoding.rid !== "string")
        throw new TypeError("invalid encoding.rid");
      if (encoding.rtx && typeof encoding.rtx !== "object") {
        throw new TypeError("invalid encoding.rtx");
      } else if (encoding.rtx) {
        if (typeof encoding.rtx.ssrc !== "number")
          throw new TypeError("missing encoding.rtx.ssrc");
      }
      if (!encoding.dtx || typeof encoding.dtx !== "boolean")
        encoding.dtx = false;
      if (encoding.scalabilityMode && typeof encoding.scalabilityMode !== "string")
        throw new TypeError("invalid encoding.scalabilityMode");
    }
    exports.validateRtpEncodingParameters = validateRtpEncodingParameters;
    function validateRtcpParameters(rtcp) {
      if (typeof rtcp !== "object")
        throw new TypeError("rtcp is not an object");
      if (rtcp.cname && typeof rtcp.cname !== "string")
        throw new TypeError("invalid rtcp.cname");
      if (!rtcp.reducedSize || typeof rtcp.reducedSize !== "boolean")
        rtcp.reducedSize = true;
    }
    exports.validateRtcpParameters = validateRtcpParameters;
    function validateSctpCapabilities(caps) {
      if (typeof caps !== "object")
        throw new TypeError("caps is not an object");
      if (!caps.numStreams || typeof caps.numStreams !== "object")
        throw new TypeError("missing caps.numStreams");
      validateNumSctpStreams(caps.numStreams);
    }
    exports.validateSctpCapabilities = validateSctpCapabilities;
    function validateNumSctpStreams(numStreams) {
      if (typeof numStreams !== "object")
        throw new TypeError("numStreams is not an object");
      if (typeof numStreams.OS !== "number")
        throw new TypeError("missing numStreams.OS");
      if (typeof numStreams.MIS !== "number")
        throw new TypeError("missing numStreams.MIS");
    }
    exports.validateNumSctpStreams = validateNumSctpStreams;
    function validateSctpParameters(params) {
      if (typeof params !== "object")
        throw new TypeError("params is not an object");
      if (typeof params.port !== "number")
        throw new TypeError("missing params.port");
      if (typeof params.OS !== "number")
        throw new TypeError("missing params.OS");
      if (typeof params.MIS !== "number")
        throw new TypeError("missing params.MIS");
      if (typeof params.maxMessageSize !== "number")
        throw new TypeError("missing params.maxMessageSize");
    }
    exports.validateSctpParameters = validateSctpParameters;
    function validateSctpStreamParameters(params) {
      if (typeof params !== "object")
        throw new TypeError("params is not an object");
      if (typeof params.streamId !== "number")
        throw new TypeError("missing params.streamId");
      let orderedGiven = false;
      if (typeof params.ordered === "boolean")
        orderedGiven = true;
      else
        params.ordered = true;
      if (params.maxPacketLifeTime && typeof params.maxPacketLifeTime !== "number")
        throw new TypeError("invalid params.maxPacketLifeTime");
      if (params.maxRetransmits && typeof params.maxRetransmits !== "number")
        throw new TypeError("invalid params.maxRetransmits");
      if (params.maxPacketLifeTime && params.maxRetransmits)
        throw new TypeError("cannot provide both maxPacketLifeTime and maxRetransmits");
      if (orderedGiven && params.ordered && (params.maxPacketLifeTime || params.maxRetransmits)) {
        throw new TypeError("cannot be ordered with maxPacketLifeTime or maxRetransmits");
      } else if (!orderedGiven && (params.maxPacketLifeTime || params.maxRetransmits)) {
        params.ordered = false;
      }
      if (params.label && typeof params.label !== "string")
        throw new TypeError("invalid params.label");
      if (params.protocol && typeof params.protocol !== "string")
        throw new TypeError("invalid params.protocol");
    }
    exports.validateSctpStreamParameters = validateSctpStreamParameters;
    function getExtendedRtpCapabilities(localCaps, remoteCaps) {
      const extendedRtpCapabilities = {
        codecs: [],
        headerExtensions: []
      };
      for (const remoteCodec of remoteCaps.codecs || []) {
        if (isRtxCodec(remoteCodec))
          continue;
        const matchingLocalCodec = (localCaps.codecs || []).find((localCodec) => matchCodecs(localCodec, remoteCodec, { strict: true, modify: true }));
        if (!matchingLocalCodec)
          continue;
        const extendedCodec = {
          mimeType: matchingLocalCodec.mimeType,
          kind: matchingLocalCodec.kind,
          clockRate: matchingLocalCodec.clockRate,
          channels: matchingLocalCodec.channels,
          localPayloadType: matchingLocalCodec.preferredPayloadType,
          localRtxPayloadType: void 0,
          remotePayloadType: remoteCodec.preferredPayloadType,
          remoteRtxPayloadType: void 0,
          localParameters: matchingLocalCodec.parameters,
          remoteParameters: remoteCodec.parameters,
          rtcpFeedback: reduceRtcpFeedback(matchingLocalCodec, remoteCodec)
        };
        extendedRtpCapabilities.codecs.push(extendedCodec);
      }
      for (const extendedCodec of extendedRtpCapabilities.codecs) {
        const matchingLocalRtxCodec = localCaps.codecs.find((localCodec) => isRtxCodec(localCodec) && localCodec.parameters.apt === extendedCodec.localPayloadType);
        const matchingRemoteRtxCodec = remoteCaps.codecs.find((remoteCodec) => isRtxCodec(remoteCodec) && remoteCodec.parameters.apt === extendedCodec.remotePayloadType);
        if (matchingLocalRtxCodec && matchingRemoteRtxCodec) {
          extendedCodec.localRtxPayloadType = matchingLocalRtxCodec.preferredPayloadType;
          extendedCodec.remoteRtxPayloadType = matchingRemoteRtxCodec.preferredPayloadType;
        }
      }
      for (const remoteExt of remoteCaps.headerExtensions) {
        const matchingLocalExt = localCaps.headerExtensions.find((localExt) => matchHeaderExtensions(localExt, remoteExt));
        if (!matchingLocalExt)
          continue;
        const extendedExt = {
          kind: remoteExt.kind,
          uri: remoteExt.uri,
          sendId: matchingLocalExt.preferredId,
          recvId: remoteExt.preferredId,
          encrypt: matchingLocalExt.preferredEncrypt,
          direction: "sendrecv"
        };
        switch (remoteExt.direction) {
          case "sendrecv":
            extendedExt.direction = "sendrecv";
            break;
          case "recvonly":
            extendedExt.direction = "sendonly";
            break;
          case "sendonly":
            extendedExt.direction = "recvonly";
            break;
          case "inactive":
            extendedExt.direction = "inactive";
            break;
        }
        extendedRtpCapabilities.headerExtensions.push(extendedExt);
      }
      return extendedRtpCapabilities;
    }
    exports.getExtendedRtpCapabilities = getExtendedRtpCapabilities;
    function getRecvRtpCapabilities(extendedRtpCapabilities) {
      const rtpCapabilities = {
        codecs: [],
        headerExtensions: []
      };
      for (const extendedCodec of extendedRtpCapabilities.codecs) {
        const codec = {
          mimeType: extendedCodec.mimeType,
          kind: extendedCodec.kind,
          preferredPayloadType: extendedCodec.remotePayloadType,
          clockRate: extendedCodec.clockRate,
          channels: extendedCodec.channels,
          parameters: extendedCodec.localParameters,
          rtcpFeedback: extendedCodec.rtcpFeedback
        };
        rtpCapabilities.codecs.push(codec);
        if (!extendedCodec.remoteRtxPayloadType)
          continue;
        const rtxCodec = {
          mimeType: `${extendedCodec.kind}/rtx`,
          kind: extendedCodec.kind,
          preferredPayloadType: extendedCodec.remoteRtxPayloadType,
          clockRate: extendedCodec.clockRate,
          parameters: {
            apt: extendedCodec.remotePayloadType
          },
          rtcpFeedback: []
        };
        rtpCapabilities.codecs.push(rtxCodec);
      }
      for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
        if (extendedExtension.direction !== "sendrecv" && extendedExtension.direction !== "recvonly") {
          continue;
        }
        const ext = {
          kind: extendedExtension.kind,
          uri: extendedExtension.uri,
          preferredId: extendedExtension.recvId,
          preferredEncrypt: extendedExtension.encrypt,
          direction: extendedExtension.direction
        };
        rtpCapabilities.headerExtensions.push(ext);
      }
      return rtpCapabilities;
    }
    exports.getRecvRtpCapabilities = getRecvRtpCapabilities;
    function getSendingRtpParameters(kind, extendedRtpCapabilities) {
      const rtpParameters = {
        mid: void 0,
        codecs: [],
        headerExtensions: [],
        encodings: [],
        rtcp: {}
      };
      for (const extendedCodec of extendedRtpCapabilities.codecs) {
        if (extendedCodec.kind !== kind)
          continue;
        const codec = {
          mimeType: extendedCodec.mimeType,
          payloadType: extendedCodec.localPayloadType,
          clockRate: extendedCodec.clockRate,
          channels: extendedCodec.channels,
          parameters: extendedCodec.localParameters,
          rtcpFeedback: extendedCodec.rtcpFeedback
        };
        rtpParameters.codecs.push(codec);
        if (extendedCodec.localRtxPayloadType) {
          const rtxCodec = {
            mimeType: `${extendedCodec.kind}/rtx`,
            payloadType: extendedCodec.localRtxPayloadType,
            clockRate: extendedCodec.clockRate,
            parameters: {
              apt: extendedCodec.localPayloadType
            },
            rtcpFeedback: []
          };
          rtpParameters.codecs.push(rtxCodec);
        }
      }
      for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
        if (extendedExtension.kind && extendedExtension.kind !== kind || extendedExtension.direction !== "sendrecv" && extendedExtension.direction !== "sendonly") {
          continue;
        }
        const ext = {
          uri: extendedExtension.uri,
          id: extendedExtension.sendId,
          encrypt: extendedExtension.encrypt,
          parameters: {}
        };
        rtpParameters.headerExtensions.push(ext);
      }
      return rtpParameters;
    }
    exports.getSendingRtpParameters = getSendingRtpParameters;
    function getSendingRemoteRtpParameters(kind, extendedRtpCapabilities) {
      const rtpParameters = {
        mid: void 0,
        codecs: [],
        headerExtensions: [],
        encodings: [],
        rtcp: {}
      };
      for (const extendedCodec of extendedRtpCapabilities.codecs) {
        if (extendedCodec.kind !== kind)
          continue;
        const codec = {
          mimeType: extendedCodec.mimeType,
          payloadType: extendedCodec.localPayloadType,
          clockRate: extendedCodec.clockRate,
          channels: extendedCodec.channels,
          parameters: extendedCodec.remoteParameters,
          rtcpFeedback: extendedCodec.rtcpFeedback
        };
        rtpParameters.codecs.push(codec);
        if (extendedCodec.localRtxPayloadType) {
          const rtxCodec = {
            mimeType: `${extendedCodec.kind}/rtx`,
            payloadType: extendedCodec.localRtxPayloadType,
            clockRate: extendedCodec.clockRate,
            parameters: {
              apt: extendedCodec.localPayloadType
            },
            rtcpFeedback: []
          };
          rtpParameters.codecs.push(rtxCodec);
        }
      }
      for (const extendedExtension of extendedRtpCapabilities.headerExtensions) {
        if (extendedExtension.kind && extendedExtension.kind !== kind || extendedExtension.direction !== "sendrecv" && extendedExtension.direction !== "sendonly") {
          continue;
        }
        const ext = {
          uri: extendedExtension.uri,
          id: extendedExtension.sendId,
          encrypt: extendedExtension.encrypt,
          parameters: {}
        };
        rtpParameters.headerExtensions.push(ext);
      }
      if (rtpParameters.headerExtensions.some((ext) => ext.uri === "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01")) {
        for (const codec of rtpParameters.codecs) {
          codec.rtcpFeedback = (codec.rtcpFeedback || []).filter((fb) => fb.type !== "goog-remb");
        }
      } else if (rtpParameters.headerExtensions.some((ext) => ext.uri === "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time")) {
        for (const codec of rtpParameters.codecs) {
          codec.rtcpFeedback = (codec.rtcpFeedback || []).filter((fb) => fb.type !== "transport-cc");
        }
      } else {
        for (const codec of rtpParameters.codecs) {
          codec.rtcpFeedback = (codec.rtcpFeedback || []).filter((fb) => fb.type !== "transport-cc" && fb.type !== "goog-remb");
        }
      }
      return rtpParameters;
    }
    exports.getSendingRemoteRtpParameters = getSendingRemoteRtpParameters;
    function reduceCodecs(codecs, capCodec) {
      const filteredCodecs = [];
      if (!capCodec) {
        filteredCodecs.push(codecs[0]);
        if (isRtxCodec(codecs[1]))
          filteredCodecs.push(codecs[1]);
      } else {
        for (let idx = 0; idx < codecs.length; ++idx) {
          if (matchCodecs(codecs[idx], capCodec)) {
            filteredCodecs.push(codecs[idx]);
            if (isRtxCodec(codecs[idx + 1]))
              filteredCodecs.push(codecs[idx + 1]);
            break;
          }
        }
        if (filteredCodecs.length === 0)
          throw new TypeError("no matching codec found");
      }
      return filteredCodecs;
    }
    exports.reduceCodecs = reduceCodecs;
    function generateProbatorRtpParameters(videoRtpParameters) {
      videoRtpParameters = utils.clone(videoRtpParameters, {});
      validateRtpParameters(videoRtpParameters);
      const rtpParameters = {
        mid: RTP_PROBATOR_MID,
        codecs: [],
        headerExtensions: [],
        encodings: [{ ssrc: RTP_PROBATOR_SSRC }],
        rtcp: { cname: "probator" }
      };
      rtpParameters.codecs.push(videoRtpParameters.codecs[0]);
      rtpParameters.codecs[0].payloadType = RTP_PROBATOR_CODEC_PAYLOAD_TYPE;
      rtpParameters.headerExtensions = videoRtpParameters.headerExtensions;
      return rtpParameters;
    }
    exports.generateProbatorRtpParameters = generateProbatorRtpParameters;
    function canSend(kind, extendedRtpCapabilities) {
      return extendedRtpCapabilities.codecs.some((codec) => codec.kind === kind);
    }
    exports.canSend = canSend;
    function canReceive(rtpParameters, extendedRtpCapabilities) {
      validateRtpParameters(rtpParameters);
      if (rtpParameters.codecs.length === 0)
        return false;
      const firstMediaCodec = rtpParameters.codecs[0];
      return extendedRtpCapabilities.codecs.some((codec) => codec.remotePayloadType === firstMediaCodec.payloadType);
    }
    exports.canReceive = canReceive;
    function isRtxCodec(codec) {
      if (!codec)
        return false;
      return /.+\/rtx$/i.test(codec.mimeType);
    }
    function matchCodecs(aCodec, bCodec, { strict = false, modify = false } = {}) {
      const aMimeType = aCodec.mimeType.toLowerCase();
      const bMimeType = bCodec.mimeType.toLowerCase();
      if (aMimeType !== bMimeType)
        return false;
      if (aCodec.clockRate !== bCodec.clockRate)
        return false;
      if (aCodec.channels !== bCodec.channels)
        return false;
      switch (aMimeType) {
        case "video/h264": {
          if (strict) {
            const aPacketizationMode = aCodec.parameters["packetization-mode"] || 0;
            const bPacketizationMode = bCodec.parameters["packetization-mode"] || 0;
            if (aPacketizationMode !== bPacketizationMode)
              return false;
            if (!h264.isSameProfile(aCodec.parameters, bCodec.parameters))
              return false;
            let selectedProfileLevelId;
            try {
              selectedProfileLevelId = h264.generateProfileLevelIdForAnswer(aCodec.parameters, bCodec.parameters);
            } catch (error) {
              return false;
            }
            if (modify) {
              if (selectedProfileLevelId) {
                aCodec.parameters["profile-level-id"] = selectedProfileLevelId;
                bCodec.parameters["profile-level-id"] = selectedProfileLevelId;
              } else {
                delete aCodec.parameters["profile-level-id"];
                delete bCodec.parameters["profile-level-id"];
              }
            }
          }
          break;
        }
        case "video/vp9": {
          if (strict) {
            const aProfileId = aCodec.parameters["profile-id"] || 0;
            const bProfileId = bCodec.parameters["profile-id"] || 0;
            if (aProfileId !== bProfileId)
              return false;
          }
          break;
        }
      }
      return true;
    }
    function matchHeaderExtensions(aExt, bExt) {
      if (aExt.kind && bExt.kind && aExt.kind !== bExt.kind)
        return false;
      if (aExt.uri !== bExt.uri)
        return false;
      return true;
    }
    function reduceRtcpFeedback(codecA, codecB) {
      const reducedRtcpFeedback = [];
      for (const aFb of codecA.rtcpFeedback || []) {
        const matchingBFb = (codecB.rtcpFeedback || []).find((bFb) => bFb.type === aFb.type && (bFb.parameter === aFb.parameter || !bFb.parameter && !aFb.parameter));
        if (matchingBFb)
          reducedRtcpFeedback.push(matchingBFb);
      }
      return reducedRtcpFeedback;
    }
  }
});

// ../../node_modules/awaitqueue/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/awaitqueue/lib/index.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var AwaitQueue = class {
      constructor({ ClosedErrorClass = Error, StoppedErrorClass = Error, RemovedTaskErrorClass = Error } = {
        ClosedErrorClass: Error,
        StoppedErrorClass: Error,
        RemovedTaskErrorClass: Error
      }) {
        this.closed = false;
        this.pendingTasks = [];
        this.ClosedErrorClass = Error;
        this.StoppedErrorClass = Error;
        this.RemovedTaskErrorClass = Error;
        this.ClosedErrorClass = ClosedErrorClass;
        this.StoppedErrorClass = StoppedErrorClass;
        this.RemovedTaskErrorClass = RemovedTaskErrorClass;
      }
      get size() {
        return this.pendingTasks.length;
      }
      close() {
        if (this.closed)
          return;
        this.closed = true;
        for (const pendingTask of this.pendingTasks) {
          pendingTask.stopped = true;
          pendingTask.reject(new this.ClosedErrorClass("AwaitQueue closed"));
        }
        this.pendingTasks.length = 0;
      }
      push(task, name) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this.closed)
            throw new this.ClosedErrorClass("AwaitQueue closed");
          if (typeof task !== "function")
            throw new TypeError("given task is not a function");
          if (!task.name && name) {
            try {
              Object.defineProperty(task, "name", { value: name });
            } catch (error) {
            }
          }
          return new Promise((resolve, reject) => {
            const pendingTask = {
              task,
              name,
              resolve,
              reject,
              stopped: false,
              enqueuedAt: new Date(),
              executedAt: void 0
            };
            this.pendingTasks.push(pendingTask);
            if (this.pendingTasks.length === 1)
              this.next();
          });
        });
      }
      removeTask(idx) {
        if (idx === 0) {
          throw new TypeError("cannot remove task with index 0");
        }
        const pendingTask = this.pendingTasks[idx];
        if (!pendingTask)
          return;
        this.pendingTasks.splice(idx, 1);
        pendingTask.reject(new this.RemovedTaskErrorClass("task removed from the queue"));
      }
      stop() {
        if (this.closed)
          return;
        for (const pendingTask of this.pendingTasks) {
          pendingTask.stopped = true;
          pendingTask.reject(new this.StoppedErrorClass("AwaitQueue stopped"));
        }
        this.pendingTasks.length = 0;
      }
      dump() {
        const now = new Date();
        let idx = 0;
        return this.pendingTasks.map((pendingTask) => ({
          idx: idx++,
          task: pendingTask.task,
          name: pendingTask.name,
          enqueuedTime: pendingTask.executedAt ? pendingTask.executedAt.getTime() - pendingTask.enqueuedAt.getTime() : now.getTime() - pendingTask.enqueuedAt.getTime(),
          executingTime: pendingTask.executedAt ? now.getTime() - pendingTask.executedAt.getTime() : 0
        }));
      }
      next() {
        return __awaiter(this, void 0, void 0, function* () {
          const pendingTask = this.pendingTasks[0];
          if (!pendingTask)
            return;
          yield this.executeTask(pendingTask);
          this.pendingTasks.shift();
          this.next();
        });
      }
      executeTask(pendingTask) {
        return __awaiter(this, void 0, void 0, function* () {
          if (pendingTask.stopped)
            return;
          pendingTask.executedAt = new Date();
          try {
            const result = yield pendingTask.task();
            if (pendingTask.stopped)
              return;
            pendingTask.resolve(result);
          } catch (error) {
            if (pendingTask.stopped)
              return;
            pendingTask.reject(error);
          }
        });
      }
    };
    exports.AwaitQueue = AwaitQueue;
  }
});

// ../../node_modules/mediasoup-client/lib/Producer.js
var require_Producer = __commonJS({
  "../../node_modules/mediasoup-client/lib/Producer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Producer = void 0;
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var errors_1 = require_errors();
    var logger = new Logger_1.Logger("Producer");
    var Producer = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor({ id, localId, rtpSender, track, rtpParameters, stopTracks, disableTrackOnPause, zeroRtpOnPause, appData }) {
        super();
        this._closed = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor()");
        this._id = id;
        this._localId = localId;
        this._rtpSender = rtpSender;
        this._track = track;
        this._kind = track.kind;
        this._rtpParameters = rtpParameters;
        this._paused = disableTrackOnPause ? !track.enabled : false;
        this._maxSpatialLayer = void 0;
        this._stopTracks = stopTracks;
        this._disableTrackOnPause = disableTrackOnPause;
        this._zeroRtpOnPause = zeroRtpOnPause;
        this._appData = appData || {};
        this._onTrackEnded = this._onTrackEnded.bind(this);
        this._handleTrack();
      }
      /**
       * Producer id.
       */
      get id() {
        return this._id;
      }
      /**
       * Local id.
       */
      get localId() {
        return this._localId;
      }
      /**
       * Whether the Producer is closed.
       */
      get closed() {
        return this._closed;
      }
      /**
       * Media kind.
       */
      get kind() {
        return this._kind;
      }
      /**
       * Associated RTCRtpSender.
       */
      get rtpSender() {
        return this._rtpSender;
      }
      /**
       * The associated track.
       */
      get track() {
        return this._track;
      }
      /**
       * RTP parameters.
       */
      get rtpParameters() {
        return this._rtpParameters;
      }
      /**
       * Whether the Producer is paused.
       */
      get paused() {
        return this._paused;
      }
      /**
       * Max spatial layer.
       *
       * @type {Number | undefined}
       */
      get maxSpatialLayer() {
        return this._maxSpatialLayer;
      }
      /**
       * App custom data.
       */
      get appData() {
        return this._appData;
      }
      /**
       * Invalid setter.
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set appData(appData) {
        throw new Error("cannot override appData object");
      }
      get observer() {
        return this._observer;
      }
      /**
       * Closes the Producer.
       */
      close() {
        if (this._closed)
          return;
        logger.debug("close()");
        this._closed = true;
        this._destroyTrack();
        this.emit("@close");
        this._observer.safeEmit("close");
      }
      /**
       * Transport was closed.
       */
      transportClosed() {
        if (this._closed)
          return;
        logger.debug("transportClosed()");
        this._closed = true;
        this._destroyTrack();
        this.safeEmit("transportclose");
        this._observer.safeEmit("close");
      }
      /**
       * Get associated RTCRtpSender stats.
       */
      async getStats() {
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        return new Promise((resolve, reject) => {
          this.safeEmit("@getstats", resolve, reject);
        });
      }
      /**
       * Pauses sending media.
       */
      pause() {
        logger.debug("pause()");
        if (this._closed) {
          logger.error("pause() | Producer closed");
          return;
        }
        this._paused = true;
        if (this._track && this._disableTrackOnPause) {
          this._track.enabled = false;
        }
        if (this._zeroRtpOnPause) {
          new Promise((resolve, reject) => {
            this.safeEmit("@pause", resolve, reject);
          }).catch(() => {
          });
        }
        this._observer.safeEmit("pause");
      }
      /**
       * Resumes sending media.
       */
      resume() {
        logger.debug("resume()");
        if (this._closed) {
          logger.error("resume() | Producer closed");
          return;
        }
        this._paused = false;
        if (this._track && this._disableTrackOnPause) {
          this._track.enabled = true;
        }
        if (this._zeroRtpOnPause) {
          new Promise((resolve, reject) => {
            this.safeEmit("@resume", resolve, reject);
          }).catch(() => {
          });
        }
        this._observer.safeEmit("resume");
      }
      /**
       * Replaces the current track with a new one or null.
       */
      async replaceTrack({ track }) {
        logger.debug("replaceTrack() [track:%o]", track);
        if (this._closed) {
          if (track && this._stopTracks) {
            try {
              track.stop();
            } catch (error) {
            }
          }
          throw new errors_1.InvalidStateError("closed");
        } else if (track && track.readyState === "ended") {
          throw new errors_1.InvalidStateError("track ended");
        }
        if (track === this._track) {
          logger.debug("replaceTrack() | same track, ignored");
          return;
        }
        await new Promise((resolve, reject) => {
          this.safeEmit("@replacetrack", track, resolve, reject);
        });
        this._destroyTrack();
        this._track = track;
        if (this._track && this._disableTrackOnPause) {
          if (!this._paused)
            this._track.enabled = true;
          else if (this._paused)
            this._track.enabled = false;
        }
        this._handleTrack();
      }
      /**
       * Sets the video max spatial layer to be sent.
       */
      async setMaxSpatialLayer(spatialLayer) {
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (this._kind !== "video")
          throw new errors_1.UnsupportedError("not a video Producer");
        else if (typeof spatialLayer !== "number")
          throw new TypeError("invalid spatialLayer");
        if (spatialLayer === this._maxSpatialLayer)
          return;
        await new Promise((resolve, reject) => {
          this.safeEmit("@setmaxspatiallayer", spatialLayer, resolve, reject);
        }).catch(() => {
        });
        this._maxSpatialLayer = spatialLayer;
      }
      async setRtpEncodingParameters(params) {
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (typeof params !== "object")
          throw new TypeError("invalid params");
        await new Promise((resolve, reject) => {
          this.safeEmit("@setrtpencodingparameters", params, resolve, reject);
        });
      }
      _onTrackEnded() {
        logger.debug('track "ended" event');
        this.safeEmit("trackended");
        this._observer.safeEmit("trackended");
      }
      _handleTrack() {
        if (!this._track)
          return;
        this._track.addEventListener("ended", this._onTrackEnded);
      }
      _destroyTrack() {
        if (!this._track)
          return;
        try {
          this._track.removeEventListener("ended", this._onTrackEnded);
          if (this._stopTracks)
            this._track.stop();
        } catch (error) {
        }
      }
    };
    exports.Producer = Producer;
  }
});

// ../../node_modules/mediasoup-client/lib/Consumer.js
var require_Consumer = __commonJS({
  "../../node_modules/mediasoup-client/lib/Consumer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Consumer = void 0;
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var errors_1 = require_errors();
    var logger = new Logger_1.Logger("Consumer");
    var Consumer = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor({ id, localId, producerId, rtpReceiver, track, rtpParameters, appData }) {
        super();
        this._closed = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor()");
        this._id = id;
        this._localId = localId;
        this._producerId = producerId;
        this._rtpReceiver = rtpReceiver;
        this._track = track;
        this._rtpParameters = rtpParameters;
        this._paused = !track.enabled;
        this._appData = appData || {};
        this._onTrackEnded = this._onTrackEnded.bind(this);
        this._handleTrack();
      }
      /**
       * Consumer id.
       */
      get id() {
        return this._id;
      }
      /**
       * Local id.
       */
      get localId() {
        return this._localId;
      }
      /**
       * Associated Producer id.
       */
      get producerId() {
        return this._producerId;
      }
      /**
       * Whether the Consumer is closed.
       */
      get closed() {
        return this._closed;
      }
      /**
       * Media kind.
       */
      get kind() {
        return this._track.kind;
      }
      /**
       * Associated RTCRtpReceiver.
       */
      get rtpReceiver() {
        return this._rtpReceiver;
      }
      /**
       * The associated track.
       */
      get track() {
        return this._track;
      }
      /**
       * RTP parameters.
       */
      get rtpParameters() {
        return this._rtpParameters;
      }
      /**
       * Whether the Consumer is paused.
       */
      get paused() {
        return this._paused;
      }
      /**
       * App custom data.
       */
      get appData() {
        return this._appData;
      }
      /**
       * Invalid setter.
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set appData(appData) {
        throw new Error("cannot override appData object");
      }
      get observer() {
        return this._observer;
      }
      /**
       * Closes the Consumer.
       */
      close() {
        if (this._closed)
          return;
        logger.debug("close()");
        this._closed = true;
        this._destroyTrack();
        this.emit("@close");
        this._observer.safeEmit("close");
      }
      /**
       * Transport was closed.
       */
      transportClosed() {
        if (this._closed)
          return;
        logger.debug("transportClosed()");
        this._closed = true;
        this._destroyTrack();
        this.safeEmit("transportclose");
        this._observer.safeEmit("close");
      }
      /**
       * Get associated RTCRtpReceiver stats.
       */
      async getStats() {
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        return new Promise((resolve, reject) => {
          this.safeEmit("@getstats", resolve, reject);
        });
      }
      /**
       * Pauses receiving media.
       */
      pause() {
        logger.debug("pause()");
        if (this._closed) {
          logger.error("pause() | Consumer closed");
          return;
        }
        if (this._paused) {
          logger.debug("pause() | Consumer is already paused");
          return;
        }
        this._paused = true;
        this._track.enabled = false;
        this.emit("@pause");
        this._observer.safeEmit("pause");
      }
      /**
       * Resumes receiving media.
       */
      resume() {
        logger.debug("resume()");
        if (this._closed) {
          logger.error("resume() | Consumer closed");
          return;
        }
        if (!this._paused) {
          logger.debug("resume() | Consumer is already resumed");
          return;
        }
        this._paused = false;
        this._track.enabled = true;
        this.emit("@resume");
        this._observer.safeEmit("resume");
      }
      _onTrackEnded() {
        logger.debug('track "ended" event');
        this.safeEmit("trackended");
        this._observer.safeEmit("trackended");
      }
      _handleTrack() {
        this._track.addEventListener("ended", this._onTrackEnded);
      }
      _destroyTrack() {
        try {
          this._track.removeEventListener("ended", this._onTrackEnded);
          this._track.stop();
        } catch (error) {
        }
      }
    };
    exports.Consumer = Consumer;
  }
});

// ../../node_modules/mediasoup-client/lib/DataProducer.js
var require_DataProducer = __commonJS({
  "../../node_modules/mediasoup-client/lib/DataProducer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataProducer = void 0;
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var errors_1 = require_errors();
    var logger = new Logger_1.Logger("DataProducer");
    var DataProducer = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor({ id, dataChannel, sctpStreamParameters, appData }) {
        super();
        this._closed = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor()");
        this._id = id;
        this._dataChannel = dataChannel;
        this._sctpStreamParameters = sctpStreamParameters;
        this._appData = appData || {};
        this._handleDataChannel();
      }
      /**
       * DataProducer id.
       */
      get id() {
        return this._id;
      }
      /**
       * Whether the DataProducer is closed.
       */
      get closed() {
        return this._closed;
      }
      /**
       * SCTP stream parameters.
       */
      get sctpStreamParameters() {
        return this._sctpStreamParameters;
      }
      /**
       * DataChannel readyState.
       */
      get readyState() {
        return this._dataChannel.readyState;
      }
      /**
       * DataChannel label.
       */
      get label() {
        return this._dataChannel.label;
      }
      /**
       * DataChannel protocol.
       */
      get protocol() {
        return this._dataChannel.protocol;
      }
      /**
       * DataChannel bufferedAmount.
       */
      get bufferedAmount() {
        return this._dataChannel.bufferedAmount;
      }
      /**
       * DataChannel bufferedAmountLowThreshold.
       */
      get bufferedAmountLowThreshold() {
        return this._dataChannel.bufferedAmountLowThreshold;
      }
      /**
       * Set DataChannel bufferedAmountLowThreshold.
       */
      set bufferedAmountLowThreshold(bufferedAmountLowThreshold) {
        this._dataChannel.bufferedAmountLowThreshold = bufferedAmountLowThreshold;
      }
      /**
       * App custom data.
       */
      get appData() {
        return this._appData;
      }
      /**
       * Invalid setter.
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set appData(appData) {
        throw new Error("cannot override appData object");
      }
      get observer() {
        return this._observer;
      }
      /**
       * Closes the DataProducer.
       */
      close() {
        if (this._closed)
          return;
        logger.debug("close()");
        this._closed = true;
        this._dataChannel.close();
        this.emit("@close");
        this._observer.safeEmit("close");
      }
      /**
       * Transport was closed.
       */
      transportClosed() {
        if (this._closed)
          return;
        logger.debug("transportClosed()");
        this._closed = true;
        this._dataChannel.close();
        this.safeEmit("transportclose");
        this._observer.safeEmit("close");
      }
      /**
       * Send a message.
       *
       * @param {String|Blob|ArrayBuffer|ArrayBufferView} data.
       */
      send(data) {
        logger.debug("send()");
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        this._dataChannel.send(data);
      }
      _handleDataChannel() {
        this._dataChannel.addEventListener("open", () => {
          if (this._closed)
            return;
          logger.debug('DataChannel "open" event');
          this.safeEmit("open");
        });
        this._dataChannel.addEventListener("error", (event) => {
          if (this._closed)
            return;
          let { error } = event;
          if (!error)
            error = new Error("unknown DataChannel error");
          if (error.errorDetail === "sctp-failure") {
            logger.error("DataChannel SCTP error [sctpCauseCode:%s]: %s", error.sctpCauseCode, error.message);
          } else {
            logger.error('DataChannel "error" event: %o', error);
          }
          this.safeEmit("error", error);
        });
        this._dataChannel.addEventListener("close", () => {
          if (this._closed)
            return;
          logger.warn('DataChannel "close" event');
          this._closed = true;
          this.emit("@close");
          this.safeEmit("close");
        });
        this._dataChannel.addEventListener("message", () => {
          if (this._closed)
            return;
          logger.warn('DataChannel "message" event in a DataProducer, message discarded');
        });
        this._dataChannel.addEventListener("bufferedamountlow", () => {
          if (this._closed)
            return;
          this.safeEmit("bufferedamountlow");
        });
      }
    };
    exports.DataProducer = DataProducer;
  }
});

// ../../node_modules/mediasoup-client/lib/DataConsumer.js
var require_DataConsumer = __commonJS({
  "../../node_modules/mediasoup-client/lib/DataConsumer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataConsumer = void 0;
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var logger = new Logger_1.Logger("DataConsumer");
    var DataConsumer = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor({ id, dataProducerId, dataChannel, sctpStreamParameters, appData }) {
        super();
        this._closed = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor()");
        this._id = id;
        this._dataProducerId = dataProducerId;
        this._dataChannel = dataChannel;
        this._sctpStreamParameters = sctpStreamParameters;
        this._appData = appData || {};
        this._handleDataChannel();
      }
      /**
       * DataConsumer id.
       */
      get id() {
        return this._id;
      }
      /**
       * Associated DataProducer id.
       */
      get dataProducerId() {
        return this._dataProducerId;
      }
      /**
       * Whether the DataConsumer is closed.
       */
      get closed() {
        return this._closed;
      }
      /**
       * SCTP stream parameters.
       */
      get sctpStreamParameters() {
        return this._sctpStreamParameters;
      }
      /**
       * DataChannel readyState.
       */
      get readyState() {
        return this._dataChannel.readyState;
      }
      /**
       * DataChannel label.
       */
      get label() {
        return this._dataChannel.label;
      }
      /**
       * DataChannel protocol.
       */
      get protocol() {
        return this._dataChannel.protocol;
      }
      /**
       * DataChannel binaryType.
       */
      get binaryType() {
        return this._dataChannel.binaryType;
      }
      /**
       * Set DataChannel binaryType.
       */
      set binaryType(binaryType) {
        this._dataChannel.binaryType = binaryType;
      }
      /**
       * App custom data.
       */
      get appData() {
        return this._appData;
      }
      /**
       * Invalid setter.
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set appData(appData) {
        throw new Error("cannot override appData object");
      }
      get observer() {
        return this._observer;
      }
      /**
       * Closes the DataConsumer.
       */
      close() {
        if (this._closed)
          return;
        logger.debug("close()");
        this._closed = true;
        this._dataChannel.close();
        this.emit("@close");
        this._observer.safeEmit("close");
      }
      /**
       * Transport was closed.
       */
      transportClosed() {
        if (this._closed)
          return;
        logger.debug("transportClosed()");
        this._closed = true;
        this._dataChannel.close();
        this.safeEmit("transportclose");
        this._observer.safeEmit("close");
      }
      _handleDataChannel() {
        this._dataChannel.addEventListener("open", () => {
          if (this._closed)
            return;
          logger.debug('DataChannel "open" event');
          this.safeEmit("open");
        });
        this._dataChannel.addEventListener("error", (event) => {
          if (this._closed)
            return;
          let { error } = event;
          if (!error)
            error = new Error("unknown DataChannel error");
          if (error.errorDetail === "sctp-failure") {
            logger.error("DataChannel SCTP error [sctpCauseCode:%s]: %s", error.sctpCauseCode, error.message);
          } else {
            logger.error('DataChannel "error" event: %o', error);
          }
          this.safeEmit("error", error);
        });
        this._dataChannel.addEventListener("close", () => {
          if (this._closed)
            return;
          logger.warn('DataChannel "close" event');
          this._closed = true;
          this.emit("@close");
          this.safeEmit("close");
        });
        this._dataChannel.addEventListener("message", (event) => {
          if (this._closed)
            return;
          this.safeEmit("message", event.data);
        });
      }
    };
    exports.DataConsumer = DataConsumer;
  }
});

// ../../node_modules/mediasoup-client/lib/Transport.js
var require_Transport = __commonJS({
  "../../node_modules/mediasoup-client/lib/Transport.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Transport = void 0;
    var awaitqueue_1 = require_lib();
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var Producer_1 = require_Producer();
    var Consumer_1 = require_Consumer();
    var DataProducer_1 = require_DataProducer();
    var DataConsumer_1 = require_DataConsumer();
    var logger = new Logger_1.Logger("Transport");
    var ConsumerCreationTask = class {
      constructor(consumerOptions) {
        this.consumerOptions = consumerOptions;
        this.promise = new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
      }
    };
    var Transport = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor({ direction, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData, handlerFactory, extendedRtpCapabilities, canProduceByKind }) {
        super();
        this._closed = false;
        this._connectionState = "new";
        this._producers = /* @__PURE__ */ new Map();
        this._consumers = /* @__PURE__ */ new Map();
        this._dataProducers = /* @__PURE__ */ new Map();
        this._dataConsumers = /* @__PURE__ */ new Map();
        this._probatorConsumerCreated = false;
        this._awaitQueue = new awaitqueue_1.AwaitQueue({ ClosedErrorClass: errors_1.InvalidStateError });
        this._pendingConsumerTasks = [];
        this._consumerCreationInProgress = false;
        this._pendingPauseConsumers = /* @__PURE__ */ new Map();
        this._consumerPauseInProgress = false;
        this._pendingResumeConsumers = /* @__PURE__ */ new Map();
        this._consumerResumeInProgress = false;
        this._pendingCloseConsumers = /* @__PURE__ */ new Map();
        this._consumerCloseInProgress = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor() [id:%s, direction:%s]", id, direction);
        this._id = id;
        this._direction = direction;
        this._extendedRtpCapabilities = extendedRtpCapabilities;
        this._canProduceByKind = canProduceByKind;
        this._maxSctpMessageSize = sctpParameters ? sctpParameters.maxMessageSize : null;
        additionalSettings = utils.clone(additionalSettings, {});
        delete additionalSettings.iceServers;
        delete additionalSettings.iceTransportPolicy;
        delete additionalSettings.bundlePolicy;
        delete additionalSettings.rtcpMuxPolicy;
        delete additionalSettings.sdpSemantics;
        this._handler = handlerFactory();
        this._handler.run({
          direction,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          iceServers,
          iceTransportPolicy,
          additionalSettings,
          proprietaryConstraints,
          extendedRtpCapabilities
        });
        this._appData = appData || {};
        this._handleHandler();
      }
      /**
       * Transport id.
       */
      get id() {
        return this._id;
      }
      /**
       * Whether the Transport is closed.
       */
      get closed() {
        return this._closed;
      }
      /**
       * Transport direction.
       */
      get direction() {
        return this._direction;
      }
      /**
       * RTC handler instance.
       */
      get handler() {
        return this._handler;
      }
      /**
       * Connection state.
       */
      get connectionState() {
        return this._connectionState;
      }
      /**
       * App custom data.
       */
      get appData() {
        return this._appData;
      }
      /**
       * Invalid setter.
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set appData(appData) {
        throw new Error("cannot override appData object");
      }
      get observer() {
        return this._observer;
      }
      /**
       * Close the Transport.
       */
      close() {
        if (this._closed)
          return;
        logger.debug("close()");
        this._closed = true;
        this._awaitQueue.close();
        this._handler.close();
        for (const producer of this._producers.values()) {
          producer.transportClosed();
        }
        this._producers.clear();
        for (const consumer of this._consumers.values()) {
          consumer.transportClosed();
        }
        this._consumers.clear();
        for (const dataProducer of this._dataProducers.values()) {
          dataProducer.transportClosed();
        }
        this._dataProducers.clear();
        for (const dataConsumer of this._dataConsumers.values()) {
          dataConsumer.transportClosed();
        }
        this._dataConsumers.clear();
        this._observer.safeEmit("close");
      }
      /**
       * Get associated Transport (RTCPeerConnection) stats.
       *
       * @returns {RTCStatsReport}
       */
      async getStats() {
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        return this._handler.getTransportStats();
      }
      /**
       * Restart ICE connection.
       */
      async restartIce({ iceParameters }) {
        logger.debug("restartIce()");
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (!iceParameters)
          throw new TypeError("missing iceParameters");
        return this._awaitQueue.push(async () => this._handler.restartIce(iceParameters), "transport.restartIce()");
      }
      /**
       * Update ICE servers.
       */
      async updateIceServers({ iceServers } = {}) {
        logger.debug("updateIceServers()");
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (!Array.isArray(iceServers))
          throw new TypeError("missing iceServers");
        return this._awaitQueue.push(async () => this._handler.updateIceServers(iceServers), "transport.updateIceServers()");
      }
      /**
       * Create a Producer.
       */
      async produce({ track, encodings, codecOptions, codec, stopTracks = true, disableTrackOnPause = true, zeroRtpOnPause = false, appData = {} } = {}) {
        logger.debug("produce() [track:%o]", track);
        if (!track)
          throw new TypeError("missing track");
        else if (this._direction !== "send")
          throw new errors_1.UnsupportedError("not a sending Transport");
        else if (!this._canProduceByKind[track.kind])
          throw new errors_1.UnsupportedError(`cannot produce ${track.kind}`);
        else if (track.readyState === "ended")
          throw new errors_1.InvalidStateError("track ended");
        else if (this.listenerCount("connect") === 0 && this._connectionState === "new")
          throw new TypeError('no "connect" listener set into this transport');
        else if (this.listenerCount("produce") === 0)
          throw new TypeError('no "produce" listener set into this transport');
        else if (appData && typeof appData !== "object")
          throw new TypeError("if given, appData must be an object");
        return this._awaitQueue.push(async () => {
          let normalizedEncodings;
          if (encodings && !Array.isArray(encodings)) {
            throw TypeError("encodings must be an array");
          } else if (encodings && encodings.length === 0) {
            normalizedEncodings = void 0;
          } else if (encodings) {
            normalizedEncodings = encodings.map((encoding) => {
              const normalizedEncoding = { active: true };
              if (encoding.active === false)
                normalizedEncoding.active = false;
              if (typeof encoding.dtx === "boolean")
                normalizedEncoding.dtx = encoding.dtx;
              if (typeof encoding.scalabilityMode === "string")
                normalizedEncoding.scalabilityMode = encoding.scalabilityMode;
              if (typeof encoding.scaleResolutionDownBy === "number")
                normalizedEncoding.scaleResolutionDownBy = encoding.scaleResolutionDownBy;
              if (typeof encoding.maxBitrate === "number")
                normalizedEncoding.maxBitrate = encoding.maxBitrate;
              if (typeof encoding.maxFramerate === "number")
                normalizedEncoding.maxFramerate = encoding.maxFramerate;
              if (typeof encoding.adaptivePtime === "boolean")
                normalizedEncoding.adaptivePtime = encoding.adaptivePtime;
              if (typeof encoding.priority === "string")
                normalizedEncoding.priority = encoding.priority;
              if (typeof encoding.networkPriority === "string")
                normalizedEncoding.networkPriority = encoding.networkPriority;
              return normalizedEncoding;
            });
          }
          const { localId, rtpParameters, rtpSender } = await this._handler.send({
            track,
            encodings: normalizedEncodings,
            codecOptions,
            codec
          });
          try {
            ortc.validateRtpParameters(rtpParameters);
            const { id } = await new Promise((resolve, reject) => {
              this.safeEmit("produce", {
                kind: track.kind,
                rtpParameters,
                appData
              }, resolve, reject);
            });
            const producer = new Producer_1.Producer({
              id,
              localId,
              rtpSender,
              track,
              rtpParameters,
              stopTracks,
              disableTrackOnPause,
              zeroRtpOnPause,
              appData
            });
            this._producers.set(producer.id, producer);
            this._handleProducer(producer);
            this._observer.safeEmit("newproducer", producer);
            return producer;
          } catch (error) {
            this._handler.stopSending(localId).catch(() => {
            });
            throw error;
          }
        }, "transport.produce()").catch((error) => {
          if (stopTracks) {
            try {
              track.stop();
            } catch (error2) {
            }
          }
          throw error;
        });
      }
      /**
       * Create a Consumer to consume a remote Producer.
       */
      async consume({ id, producerId, kind, rtpParameters, appData = {} }) {
        logger.debug("consume()");
        rtpParameters = utils.clone(rtpParameters, void 0);
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (this._direction !== "recv")
          throw new errors_1.UnsupportedError("not a receiving Transport");
        else if (typeof id !== "string")
          throw new TypeError("missing id");
        else if (typeof producerId !== "string")
          throw new TypeError("missing producerId");
        else if (kind !== "audio" && kind !== "video")
          throw new TypeError(`invalid kind '${kind}'`);
        else if (this.listenerCount("connect") === 0 && this._connectionState === "new")
          throw new TypeError('no "connect" listener set into this transport');
        else if (appData && typeof appData !== "object")
          throw new TypeError("if given, appData must be an object");
        const canConsume = ortc.canReceive(rtpParameters, this._extendedRtpCapabilities);
        if (!canConsume)
          throw new errors_1.UnsupportedError("cannot consume this Producer");
        const consumerCreationTask = new ConsumerCreationTask({
          id,
          producerId,
          kind,
          rtpParameters,
          appData
        });
        this._pendingConsumerTasks.push(consumerCreationTask);
        if (this._consumerCreationInProgress === false) {
          this._createPendingConsumers();
        }
        return consumerCreationTask.promise;
      }
      /**
       * Create a DataProducer
       */
      async produceData({ ordered = true, maxPacketLifeTime, maxRetransmits, label = "", protocol = "", appData = {} } = {}) {
        logger.debug("produceData()");
        if (this._direction !== "send")
          throw new errors_1.UnsupportedError("not a sending Transport");
        else if (!this._maxSctpMessageSize)
          throw new errors_1.UnsupportedError("SCTP not enabled by remote Transport");
        else if (this.listenerCount("connect") === 0 && this._connectionState === "new")
          throw new TypeError('no "connect" listener set into this transport');
        else if (this.listenerCount("producedata") === 0)
          throw new TypeError('no "producedata" listener set into this transport');
        else if (appData && typeof appData !== "object")
          throw new TypeError("if given, appData must be an object");
        if (maxPacketLifeTime || maxRetransmits)
          ordered = false;
        return this._awaitQueue.push(async () => {
          const { dataChannel, sctpStreamParameters } = await this._handler.sendDataChannel({
            ordered,
            maxPacketLifeTime,
            maxRetransmits,
            label,
            protocol
          });
          ortc.validateSctpStreamParameters(sctpStreamParameters);
          const { id } = await new Promise((resolve, reject) => {
            this.safeEmit("producedata", {
              sctpStreamParameters,
              label,
              protocol,
              appData
            }, resolve, reject);
          });
          const dataProducer = new DataProducer_1.DataProducer({ id, dataChannel, sctpStreamParameters, appData });
          this._dataProducers.set(dataProducer.id, dataProducer);
          this._handleDataProducer(dataProducer);
          this._observer.safeEmit("newdataproducer", dataProducer);
          return dataProducer;
        }, "transport.produceData()");
      }
      /**
       * Create a DataConsumer
       */
      async consumeData({ id, dataProducerId, sctpStreamParameters, label = "", protocol = "", appData = {} }) {
        logger.debug("consumeData()");
        sctpStreamParameters = utils.clone(sctpStreamParameters, void 0);
        if (this._closed)
          throw new errors_1.InvalidStateError("closed");
        else if (this._direction !== "recv")
          throw new errors_1.UnsupportedError("not a receiving Transport");
        else if (!this._maxSctpMessageSize)
          throw new errors_1.UnsupportedError("SCTP not enabled by remote Transport");
        else if (typeof id !== "string")
          throw new TypeError("missing id");
        else if (typeof dataProducerId !== "string")
          throw new TypeError("missing dataProducerId");
        else if (this.listenerCount("connect") === 0 && this._connectionState === "new")
          throw new TypeError('no "connect" listener set into this transport');
        else if (appData && typeof appData !== "object")
          throw new TypeError("if given, appData must be an object");
        ortc.validateSctpStreamParameters(sctpStreamParameters);
        return this._awaitQueue.push(async () => {
          const { dataChannel } = await this._handler.receiveDataChannel({
            sctpStreamParameters,
            label,
            protocol
          });
          const dataConsumer = new DataConsumer_1.DataConsumer({
            id,
            dataProducerId,
            dataChannel,
            sctpStreamParameters,
            appData
          });
          this._dataConsumers.set(dataConsumer.id, dataConsumer);
          this._handleDataConsumer(dataConsumer);
          this._observer.safeEmit("newdataconsumer", dataConsumer);
          return dataConsumer;
        }, "transport.consumeData()");
      }
      // This method is guaranteed to never throw.
      async _createPendingConsumers() {
        this._consumerCreationInProgress = true;
        this._awaitQueue.push(async () => {
          if (this._pendingConsumerTasks.length === 0) {
            logger.debug("_createPendingConsumers() | there is no Consumer to be created");
            return;
          }
          const pendingConsumerTasks = [...this._pendingConsumerTasks];
          this._pendingConsumerTasks = [];
          let videoConsumerForProbator = void 0;
          const optionsList = [];
          for (const task of pendingConsumerTasks) {
            const { id, kind, rtpParameters } = task.consumerOptions;
            optionsList.push({
              trackId: id,
              kind,
              rtpParameters
            });
          }
          try {
            const results = await this._handler.receive(optionsList);
            for (let idx = 0; idx < results.length; idx++) {
              const task = pendingConsumerTasks[idx];
              const result = results[idx];
              const { id, producerId, kind, rtpParameters, appData } = task.consumerOptions;
              const { localId, rtpReceiver, track } = result;
              const consumer = new Consumer_1.Consumer({
                id,
                localId,
                producerId,
                rtpReceiver,
                track,
                rtpParameters,
                appData
              });
              this._consumers.set(consumer.id, consumer);
              this._handleConsumer(consumer);
              if (!this._probatorConsumerCreated && !videoConsumerForProbator && kind === "video") {
                videoConsumerForProbator = consumer;
              }
              this._observer.safeEmit("newconsumer", consumer);
              task.resolve(consumer);
            }
          } catch (error) {
            for (const task of pendingConsumerTasks) {
              task.reject(error);
            }
          }
          if (videoConsumerForProbator) {
            try {
              const probatorRtpParameters = ortc.generateProbatorRtpParameters(videoConsumerForProbator.rtpParameters);
              await this._handler.receive([{
                trackId: "probator",
                kind: "video",
                rtpParameters: probatorRtpParameters
              }]);
              logger.debug("_createPendingConsumers() | Consumer for RTP probation created");
              this._probatorConsumerCreated = true;
            } catch (error) {
              logger.error("_createPendingConsumers() | failed to create Consumer for RTP probation:%o", error);
            }
          }
        }, "transport._createPendingConsumers()").then(() => {
          this._consumerCreationInProgress = false;
          if (this._pendingConsumerTasks.length > 0) {
            this._createPendingConsumers();
          }
        }).catch(() => {
        });
      }
      _pausePendingConsumers() {
        this._consumerPauseInProgress = true;
        this._awaitQueue.push(async () => {
          if (this._pendingPauseConsumers.size === 0) {
            logger.debug("_pausePendingConsumers() | there is no Consumer to be paused");
            return;
          }
          const pendingPauseConsumers = Array.from(this._pendingPauseConsumers.values());
          this._pendingPauseConsumers.clear();
          try {
            const localIds = pendingPauseConsumers.map((consumer) => consumer.localId);
            await this._handler.pauseReceiving(localIds);
          } catch (error) {
            logger.error("_pausePendingConsumers() | failed to pause Consumers:", error);
          }
        }, "transport._pausePendingConsumers").then(() => {
          this._consumerPauseInProgress = false;
          if (this._pendingPauseConsumers.size > 0) {
            this._pausePendingConsumers();
          }
        }).catch(() => {
        });
      }
      _resumePendingConsumers() {
        this._consumerResumeInProgress = true;
        this._awaitQueue.push(async () => {
          if (this._pendingResumeConsumers.size === 0) {
            logger.debug("_resumePendingConsumers() | there is no Consumer to be resumed");
            return;
          }
          const pendingResumeConsumers = Array.from(this._pendingResumeConsumers.values());
          this._pendingResumeConsumers.clear();
          try {
            const localIds = pendingResumeConsumers.map((consumer) => consumer.localId);
            await this._handler.resumeReceiving(localIds);
          } catch (error) {
            logger.error("_resumePendingConsumers() | failed to resume Consumers:", error);
          }
        }, "transport._resumePendingConsumers").then(() => {
          this._consumerResumeInProgress = false;
          if (this._pendingResumeConsumers.size > 0) {
            this._resumePendingConsumers();
          }
        }).catch(() => {
        });
      }
      _closePendingConsumers() {
        this._consumerCloseInProgress = true;
        this._awaitQueue.push(async () => {
          if (this._pendingCloseConsumers.size === 0) {
            logger.debug("_closePendingConsumers() | there is no Consumer to be closed");
            return;
          }
          const pendingCloseConsumers = Array.from(this._pendingCloseConsumers.values());
          this._pendingCloseConsumers.clear();
          try {
            await this._handler.stopReceiving(pendingCloseConsumers.map((consumer) => consumer.localId));
          } catch (error) {
            logger.error("_closePendingConsumers() | failed to close Consumers:", error);
          }
        }, "transport._closePendingConsumers").then(() => {
          this._consumerCloseInProgress = false;
          if (this._pendingCloseConsumers.size > 0) {
            this._closePendingConsumers();
          }
        }).catch(() => {
        });
      }
      _handleHandler() {
        const handler = this._handler;
        handler.on("@connect", ({ dtlsParameters }, callback, errback) => {
          if (this._closed) {
            errback(new errors_1.InvalidStateError("closed"));
            return;
          }
          this.safeEmit("connect", { dtlsParameters }, callback, errback);
        });
        handler.on("@connectionstatechange", (connectionState) => {
          if (connectionState === this._connectionState)
            return;
          logger.debug("connection state changed to %s", connectionState);
          this._connectionState = connectionState;
          if (!this._closed)
            this.safeEmit("connectionstatechange", connectionState);
        });
      }
      _handleProducer(producer) {
        producer.on("@close", () => {
          this._producers.delete(producer.id);
          if (this._closed)
            return;
          this._awaitQueue.push(async () => this._handler.stopSending(producer.localId), "producer @close event").catch((error) => logger.warn("producer.close() failed:%o", error));
        });
        producer.on("@pause", (callback, errback) => {
          this._awaitQueue.push(async () => this._handler.pauseSending(producer.localId), "producer @pause event").then(callback).catch(errback);
        });
        producer.on("@resume", (callback, errback) => {
          this._awaitQueue.push(async () => this._handler.resumeSending(producer.localId), "producer @resume event").then(callback).catch(errback);
        });
        producer.on("@replacetrack", (track, callback, errback) => {
          this._awaitQueue.push(async () => this._handler.replaceTrack(producer.localId, track), "producer @replacetrack event").then(callback).catch(errback);
        });
        producer.on("@setmaxspatiallayer", (spatialLayer, callback, errback) => {
          this._awaitQueue.push(async () => this._handler.setMaxSpatialLayer(producer.localId, spatialLayer), "producer @setmaxspatiallayer event").then(callback).catch(errback);
        });
        producer.on("@setrtpencodingparameters", (params, callback, errback) => {
          this._awaitQueue.push(async () => this._handler.setRtpEncodingParameters(producer.localId, params), "producer @setrtpencodingparameters event").then(callback).catch(errback);
        });
        producer.on("@getstats", (callback, errback) => {
          if (this._closed)
            return errback(new errors_1.InvalidStateError("closed"));
          this._handler.getSenderStats(producer.localId).then(callback).catch(errback);
        });
      }
      _handleConsumer(consumer) {
        consumer.on("@close", () => {
          this._consumers.delete(consumer.id);
          this._pendingPauseConsumers.delete(consumer.id);
          this._pendingResumeConsumers.delete(consumer.id);
          if (this._closed)
            return;
          this._pendingCloseConsumers.set(consumer.id, consumer);
          if (this._consumerCloseInProgress === false) {
            this._closePendingConsumers();
          }
        });
        consumer.on("@pause", () => {
          if (this._pendingResumeConsumers.has(consumer.id)) {
            this._pendingResumeConsumers.delete(consumer.id);
          }
          this._pendingPauseConsumers.set(consumer.id, consumer);
          if (this._consumerPauseInProgress === false) {
            this._pausePendingConsumers();
          }
        });
        consumer.on("@resume", () => {
          if (this._pendingPauseConsumers.has(consumer.id)) {
            this._pendingPauseConsumers.delete(consumer.id);
          }
          this._pendingResumeConsumers.set(consumer.id, consumer);
          if (this._consumerResumeInProgress === false) {
            this._resumePendingConsumers();
          }
        });
        consumer.on("@getstats", (callback, errback) => {
          if (this._closed)
            return errback(new errors_1.InvalidStateError("closed"));
          this._handler.getReceiverStats(consumer.localId).then(callback).catch(errback);
        });
      }
      _handleDataProducer(dataProducer) {
        dataProducer.on("@close", () => {
          this._dataProducers.delete(dataProducer.id);
        });
      }
      _handleDataConsumer(dataConsumer) {
        dataConsumer.on("@close", () => {
          this._dataConsumers.delete(dataConsumer.id);
        });
      }
    };
    exports.Transport = Transport;
  }
});

// ../../node_modules/sdp-transform/lib/grammar.js
var require_grammar = __commonJS({
  "../../node_modules/sdp-transform/lib/grammar.js"(exports, module) {
    var grammar = module.exports = {
      v: [{
        name: "version",
        reg: /^(\d*)$/
      }],
      o: [{
        // o=- 20518 0 IN IP4 203.0.113.1
        // NB: sessionId will be a String in most cases because it is huge
        name: "origin",
        reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
        names: ["username", "sessionId", "sessionVersion", "netType", "ipVer", "address"],
        format: "%s %s %d %s IP%d %s"
      }],
      // default parsing of these only (though some of these feel outdated)
      s: [{ name: "name" }],
      i: [{ name: "description" }],
      u: [{ name: "uri" }],
      e: [{ name: "email" }],
      p: [{ name: "phone" }],
      z: [{ name: "timezones" }],
      // TODO: this one can actually be parsed properly...
      r: [{ name: "repeats" }],
      // TODO: this one can also be parsed properly
      // k: [{}], // outdated thing ignored
      t: [{
        // t=0 0
        name: "timing",
        reg: /^(\d*) (\d*)/,
        names: ["start", "stop"],
        format: "%d %d"
      }],
      c: [{
        // c=IN IP4 10.47.197.26
        name: "connection",
        reg: /^IN IP(\d) (\S*)/,
        names: ["version", "ip"],
        format: "IN IP%d %s"
      }],
      b: [{
        // b=AS:4000
        push: "bandwidth",
        reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
        names: ["type", "limit"],
        format: "%s:%s"
      }],
      m: [{
        // m=video 51744 RTP/AVP 126 97 98 34 31
        // NB: special - pushes to session
        // TODO: rtp/fmtp should be filtered by the payloads found here?
        reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
        names: ["type", "port", "protocol", "payloads"],
        format: "%s %d %s %s"
      }],
      a: [
        {
          // a=rtpmap:110 opus/48000/2
          push: "rtp",
          reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
          names: ["payload", "codec", "rate", "encoding"],
          format: function(o) {
            return o.encoding ? "rtpmap:%d %s/%s/%s" : o.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s";
          }
        },
        {
          // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
          // a=fmtp:111 minptime=10; useinbandfec=1
          push: "fmtp",
          reg: /^fmtp:(\d*) ([\S| ]*)/,
          names: ["payload", "config"],
          format: "fmtp:%d %s"
        },
        {
          // a=control:streamid=0
          name: "control",
          reg: /^control:(.*)/,
          format: "control:%s"
        },
        {
          // a=rtcp:65179 IN IP4 193.84.77.194
          name: "rtcp",
          reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
          names: ["port", "netType", "ipVer", "address"],
          format: function(o) {
            return o.address != null ? "rtcp:%d %s IP%d %s" : "rtcp:%d";
          }
        },
        {
          // a=rtcp-fb:98 trr-int 100
          push: "rtcpFbTrrInt",
          reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
          names: ["payload", "value"],
          format: "rtcp-fb:%s trr-int %d"
        },
        {
          // a=rtcp-fb:98 nack rpsi
          push: "rtcpFb",
          reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
          names: ["payload", "type", "subtype"],
          format: function(o) {
            return o.subtype != null ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s";
          }
        },
        {
          // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
          // a=extmap:1/recvonly URI-gps-string
          // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
          push: "ext",
          reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
          names: ["value", "direction", "encrypt-uri", "uri", "config"],
          format: function(o) {
            return "extmap:%d" + (o.direction ? "/%s" : "%v") + (o["encrypt-uri"] ? " %s" : "%v") + " %s" + (o.config ? " %s" : "");
          }
        },
        {
          // a=extmap-allow-mixed
          name: "extmapAllowMixed",
          reg: /^(extmap-allow-mixed)/
        },
        {
          // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
          push: "crypto",
          reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
          names: ["id", "suite", "config", "sessionConfig"],
          format: function(o) {
            return o.sessionConfig != null ? "crypto:%d %s %s %s" : "crypto:%d %s %s";
          }
        },
        {
          // a=setup:actpass
          name: "setup",
          reg: /^setup:(\w*)/,
          format: "setup:%s"
        },
        {
          // a=connection:new
          name: "connectionType",
          reg: /^connection:(new|existing)/,
          format: "connection:%s"
        },
        {
          // a=mid:1
          name: "mid",
          reg: /^mid:([^\s]*)/,
          format: "mid:%s"
        },
        {
          // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
          name: "msid",
          reg: /^msid:(.*)/,
          format: "msid:%s"
        },
        {
          // a=ptime:20
          name: "ptime",
          reg: /^ptime:(\d*(?:\.\d*)*)/,
          format: "ptime:%d"
        },
        {
          // a=maxptime:60
          name: "maxptime",
          reg: /^maxptime:(\d*(?:\.\d*)*)/,
          format: "maxptime:%d"
        },
        {
          // a=sendrecv
          name: "direction",
          reg: /^(sendrecv|recvonly|sendonly|inactive)/
        },
        {
          // a=ice-lite
          name: "icelite",
          reg: /^(ice-lite)/
        },
        {
          // a=ice-ufrag:F7gI
          name: "iceUfrag",
          reg: /^ice-ufrag:(\S*)/,
          format: "ice-ufrag:%s"
        },
        {
          // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
          name: "icePwd",
          reg: /^ice-pwd:(\S*)/,
          format: "ice-pwd:%s"
        },
        {
          // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
          name: "fingerprint",
          reg: /^fingerprint:(\S*) (\S*)/,
          names: ["type", "hash"],
          format: "fingerprint:%s %s"
        },
        {
          // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
          // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
          // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
          push: "candidates",
          reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
          names: ["foundation", "component", "transport", "priority", "ip", "port", "type", "raddr", "rport", "tcptype", "generation", "network-id", "network-cost"],
          format: function(o) {
            var str = "candidate:%s %d %s %d %s %d typ %s";
            str += o.raddr != null ? " raddr %s rport %d" : "%v%v";
            str += o.tcptype != null ? " tcptype %s" : "%v";
            if (o.generation != null) {
              str += " generation %d";
            }
            str += o["network-id"] != null ? " network-id %d" : "%v";
            str += o["network-cost"] != null ? " network-cost %d" : "%v";
            return str;
          }
        },
        {
          // a=end-of-candidates (keep after the candidates line for readability)
          name: "endOfCandidates",
          reg: /^(end-of-candidates)/
        },
        {
          // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
          name: "remoteCandidates",
          reg: /^remote-candidates:(.*)/,
          format: "remote-candidates:%s"
        },
        {
          // a=ice-options:google-ice
          name: "iceOptions",
          reg: /^ice-options:(\S*)/,
          format: "ice-options:%s"
        },
        {
          // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
          push: "ssrcs",
          reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
          names: ["id", "attribute", "value"],
          format: function(o) {
            var str = "ssrc:%d";
            if (o.attribute != null) {
              str += " %s";
              if (o.value != null) {
                str += ":%s";
              }
            }
            return str;
          }
        },
        {
          // a=ssrc-group:FEC 1 2
          // a=ssrc-group:FEC-FR 3004364195 1080772241
          push: "ssrcGroups",
          // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
          reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
          names: ["semantics", "ssrcs"],
          format: "ssrc-group:%s %s"
        },
        {
          // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
          name: "msidSemantic",
          reg: /^msid-semantic:\s?(\w*) (\S*)/,
          names: ["semantic", "token"],
          format: "msid-semantic: %s %s"
          // space after ':' is not accidental
        },
        {
          // a=group:BUNDLE audio video
          push: "groups",
          reg: /^group:(\w*) (.*)/,
          names: ["type", "mids"],
          format: "group:%s %s"
        },
        {
          // a=rtcp-mux
          name: "rtcpMux",
          reg: /^(rtcp-mux)/
        },
        {
          // a=rtcp-rsize
          name: "rtcpRsize",
          reg: /^(rtcp-rsize)/
        },
        {
          // a=sctpmap:5000 webrtc-datachannel 1024
          name: "sctpmap",
          reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
          names: ["sctpmapNumber", "app", "maxMessageSize"],
          format: function(o) {
            return o.maxMessageSize != null ? "sctpmap:%s %s %s" : "sctpmap:%s %s";
          }
        },
        {
          // a=x-google-flag:conference
          name: "xGoogleFlag",
          reg: /^x-google-flag:([^\s]*)/,
          format: "x-google-flag:%s"
        },
        {
          // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
          push: "rids",
          reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
          names: ["id", "direction", "params"],
          format: function(o) {
            return o.params ? "rid:%s %s %s" : "rid:%s %s";
          }
        },
        {
          // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
          // a=imageattr:* send [x=800,y=640] recv *
          // a=imageattr:100 recv [x=320,y=240]
          push: "imageattrs",
          reg: new RegExp(
            // a=imageattr:97
            "^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"
          ),
          names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
          format: function(o) {
            return "imageattr:%s %s %s" + (o.dir2 ? " %s %s" : "");
          }
        },
        {
          // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
          // a=simulcast:recv 1;4,5 send 6;7
          name: "simulcast",
          reg: new RegExp(
            // a=simulcast:
            "^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"
          ),
          names: ["dir1", "list1", "dir2", "list2"],
          format: function(o) {
            return "simulcast:%s %s" + (o.dir2 ? " %s %s" : "");
          }
        },
        {
          // old simulcast draft 03 (implemented by Firefox)
          //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
          // a=simulcast: recv pt=97;98 send pt=97
          // a=simulcast: send rid=5;6;7 paused=6,7
          name: "simulcast_03",
          reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
          names: ["value"],
          format: "simulcast: %s"
        },
        {
          // a=framerate:25
          // a=framerate:29.97
          name: "framerate",
          reg: /^framerate:(\d+(?:$|\.\d+))/,
          format: "framerate:%s"
        },
        {
          // RFC4570
          // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
          name: "sourceFilter",
          reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
          names: ["filterMode", "netType", "addressTypes", "destAddress", "srcList"],
          format: "source-filter: %s %s %s %s %s"
        },
        {
          // a=bundle-only
          name: "bundleOnly",
          reg: /^(bundle-only)/
        },
        {
          // a=label:1
          name: "label",
          reg: /^label:(.+)/,
          format: "label:%s"
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
          name: "sctpPort",
          reg: /^sctp-port:(\d+)$/,
          format: "sctp-port:%s"
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
          name: "maxMessageSize",
          reg: /^max-message-size:(\d+)$/,
          format: "max-message-size:%s"
        },
        {
          // RFC7273
          // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
          push: "tsRefClocks",
          reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
          names: ["clksrc", "clksrcExt"],
          format: function(o) {
            return "ts-refclk:%s" + (o.clksrcExt != null ? "=%s" : "");
          }
        },
        {
          // RFC7273
          // a=mediaclk:direct=963214424
          name: "mediaClk",
          reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
          names: ["id", "mediaClockName", "mediaClockValue", "rateNumerator", "rateDenominator"],
          format: function(o) {
            var str = "mediaclk:";
            str += o.id != null ? "id=%s %s" : "%v%s";
            str += o.mediaClockValue != null ? "=%s" : "";
            str += o.rateNumerator != null ? " rate=%s" : "";
            str += o.rateDenominator != null ? "/%s" : "";
            return str;
          }
        },
        {
          // a=keywds:keywords
          name: "keywords",
          reg: /^keywds:(.+)$/,
          format: "keywds:%s"
        },
        {
          // a=content:main
          name: "content",
          reg: /^content:(.+)/,
          format: "content:%s"
        },
        // BFCP https://tools.ietf.org/html/rfc4583
        {
          // a=floorctrl:c-s
          name: "bfcpFloorCtrl",
          reg: /^floorctrl:(c-only|s-only|c-s)/,
          format: "floorctrl:%s"
        },
        {
          // a=confid:1
          name: "bfcpConfId",
          reg: /^confid:(\d+)/,
          format: "confid:%s"
        },
        {
          // a=userid:1
          name: "bfcpUserId",
          reg: /^userid:(\d+)/,
          format: "userid:%s"
        },
        {
          // a=floorid:1
          name: "bfcpFloorId",
          reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
          names: ["id", "mStream"],
          format: "floorid:%s mstrm:%s"
        },
        {
          // any a= that we don't understand is kept verbatim on media.invalid
          push: "invalid",
          names: ["value"]
        }
      ]
    };
    Object.keys(grammar).forEach(function(key) {
      var objs = grammar[key];
      objs.forEach(function(obj) {
        if (!obj.reg) {
          obj.reg = /(.*)/;
        }
        if (!obj.format) {
          obj.format = "%s";
        }
      });
    });
  }
});

// ../../node_modules/sdp-transform/lib/parser.js
var require_parser = __commonJS({
  "../../node_modules/sdp-transform/lib/parser.js"(exports) {
    var toIntIfInt = function(v) {
      return String(Number(v)) === v ? Number(v) : v;
    };
    var attachProperties = function(match, location, names, rawName) {
      if (rawName && !names) {
        location[rawName] = toIntIfInt(match[1]);
      } else {
        for (var i = 0; i < names.length; i += 1) {
          if (match[i + 1] != null) {
            location[names[i]] = toIntIfInt(match[i + 1]);
          }
        }
      }
    };
    var parseReg = function(obj, location, content) {
      var needsBlank = obj.name && obj.names;
      if (obj.push && !location[obj.push]) {
        location[obj.push] = [];
      } else if (needsBlank && !location[obj.name]) {
        location[obj.name] = {};
      }
      var keyLocation = obj.push ? {} : (
        // blank object that will be pushed
        needsBlank ? location[obj.name] : location
      );
      attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);
      if (obj.push) {
        location[obj.push].push(keyLocation);
      }
    };
    var grammar = require_grammar();
    var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    exports.parse = function(sdp) {
      var session = {}, media = [], location = session;
      sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function(l) {
        var type = l[0];
        var content = l.slice(2);
        if (type === "m") {
          media.push({ rtp: [], fmtp: [] });
          location = media[media.length - 1];
        }
        for (var j = 0; j < (grammar[type] || []).length; j += 1) {
          var obj = grammar[type][j];
          if (obj.reg.test(content)) {
            return parseReg(obj, location, content);
          }
        }
      });
      session.media = media;
      return session;
    };
    var paramReducer = function(acc, expr) {
      var s = expr.split(/=(.+)/, 2);
      if (s.length === 2) {
        acc[s[0]] = toIntIfInt(s[1]);
      } else if (s.length === 1 && expr.length > 1) {
        acc[s[0]] = void 0;
      }
      return acc;
    };
    exports.parseParams = function(str) {
      return str.split(/;\s?/).reduce(paramReducer, {});
    };
    exports.parseFmtpConfig = exports.parseParams;
    exports.parsePayloads = function(str) {
      return str.toString().split(" ").map(Number);
    };
    exports.parseRemoteCandidates = function(str) {
      var candidates = [];
      var parts = str.split(" ").map(toIntIfInt);
      for (var i = 0; i < parts.length; i += 3) {
        candidates.push({
          component: parts[i],
          ip: parts[i + 1],
          port: parts[i + 2]
        });
      }
      return candidates;
    };
    exports.parseImageAttributes = function(str) {
      return str.split(" ").map(function(item) {
        return item.substring(1, item.length - 1).split(",").reduce(paramReducer, {});
      });
    };
    exports.parseSimulcastStreamList = function(str) {
      return str.split(";").map(function(stream) {
        return stream.split(",").map(function(format) {
          var scid, paused = false;
          if (format[0] !== "~") {
            scid = toIntIfInt(format);
          } else {
            scid = toIntIfInt(format.substring(1, format.length));
            paused = true;
          }
          return {
            scid,
            paused
          };
        });
      });
    };
  }
});

// ../../node_modules/sdp-transform/lib/writer.js
var require_writer = __commonJS({
  "../../node_modules/sdp-transform/lib/writer.js"(exports, module) {
    var grammar = require_grammar();
    var formatRegExp = /%[sdv%]/g;
    var format = function(formatStr) {
      var i = 1;
      var args = arguments;
      var len = args.length;
      return formatStr.replace(formatRegExp, function(x) {
        if (i >= len) {
          return x;
        }
        var arg = args[i];
        i += 1;
        switch (x) {
          case "%%":
            return "%";
          case "%s":
            return String(arg);
          case "%d":
            return Number(arg);
          case "%v":
            return "";
        }
      });
    };
    var makeLine = function(type, obj, location) {
      var str = obj.format instanceof Function ? obj.format(obj.push ? location : location[obj.name]) : obj.format;
      var args = [type + "=" + str];
      if (obj.names) {
        for (var i = 0; i < obj.names.length; i += 1) {
          var n = obj.names[i];
          if (obj.name) {
            args.push(location[obj.name][n]);
          } else {
            args.push(location[obj.names[i]]);
          }
        }
      } else {
        args.push(location[obj.name]);
      }
      return format.apply(null, args);
    };
    var defaultOuterOrder = [
      "v",
      "o",
      "s",
      "i",
      "u",
      "e",
      "p",
      "c",
      "b",
      "t",
      "r",
      "z",
      "a"
    ];
    var defaultInnerOrder = ["i", "c", "b", "a"];
    module.exports = function(session, opts) {
      opts = opts || {};
      if (session.version == null) {
        session.version = 0;
      }
      if (session.name == null) {
        session.name = " ";
      }
      session.media.forEach(function(mLine) {
        if (mLine.payloads == null) {
          mLine.payloads = "";
        }
      });
      var outerOrder = opts.outerOrder || defaultOuterOrder;
      var innerOrder = opts.innerOrder || defaultInnerOrder;
      var sdp = [];
      outerOrder.forEach(function(type) {
        grammar[type].forEach(function(obj) {
          if (obj.name in session && session[obj.name] != null) {
            sdp.push(makeLine(type, obj, session));
          } else if (obj.push in session && session[obj.push] != null) {
            session[obj.push].forEach(function(el) {
              sdp.push(makeLine(type, obj, el));
            });
          }
        });
      });
      session.media.forEach(function(mLine) {
        sdp.push(makeLine("m", grammar.m[0], mLine));
        innerOrder.forEach(function(type) {
          grammar[type].forEach(function(obj) {
            if (obj.name in mLine && mLine[obj.name] != null) {
              sdp.push(makeLine(type, obj, mLine));
            } else if (obj.push in mLine && mLine[obj.push] != null) {
              mLine[obj.push].forEach(function(el) {
                sdp.push(makeLine(type, obj, el));
              });
            }
          });
        });
      });
      return sdp.join("\r\n") + "\r\n";
    };
  }
});

// ../../node_modules/sdp-transform/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/sdp-transform/lib/index.js"(exports) {
    var parser = require_parser();
    var writer = require_writer();
    exports.write = writer;
    exports.parse = parser.parse;
    exports.parseParams = parser.parseParams;
    exports.parseFmtpConfig = parser.parseFmtpConfig;
    exports.parsePayloads = parser.parsePayloads;
    exports.parseRemoteCandidates = parser.parseRemoteCandidates;
    exports.parseImageAttributes = parser.parseImageAttributes;
    exports.parseSimulcastStreamList = parser.parseSimulcastStreamList;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/sdp/commonUtils.js
var require_commonUtils = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/sdp/commonUtils.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyCodecParameters = exports.getCname = exports.extractDtlsParameters = exports.extractRtpCapabilities = void 0;
    var sdpTransform = __importStar(require_lib2());
    function extractRtpCapabilities({ sdpObject }) {
      const codecsMap = /* @__PURE__ */ new Map();
      const headerExtensions = [];
      let gotAudio = false;
      let gotVideo = false;
      for (const m of sdpObject.media) {
        const kind = m.type;
        switch (kind) {
          case "audio": {
            if (gotAudio)
              continue;
            gotAudio = true;
            break;
          }
          case "video": {
            if (gotVideo)
              continue;
            gotVideo = true;
            break;
          }
          default: {
            continue;
          }
        }
        for (const rtp of m.rtp) {
          const codec = {
            kind,
            mimeType: `${kind}/${rtp.codec}`,
            preferredPayloadType: rtp.payload,
            clockRate: rtp.rate,
            channels: rtp.encoding,
            parameters: {},
            rtcpFeedback: []
          };
          codecsMap.set(codec.preferredPayloadType, codec);
        }
        for (const fmtp of m.fmtp || []) {
          const parameters = sdpTransform.parseParams(fmtp.config);
          const codec = codecsMap.get(fmtp.payload);
          if (!codec)
            continue;
          if (parameters && parameters.hasOwnProperty("profile-level-id"))
            parameters["profile-level-id"] = String(parameters["profile-level-id"]);
          codec.parameters = parameters;
        }
        for (const fb of m.rtcpFb || []) {
          const codec = codecsMap.get(fb.payload);
          if (!codec)
            continue;
          const feedback = {
            type: fb.type,
            parameter: fb.subtype
          };
          if (!feedback.parameter)
            delete feedback.parameter;
          codec.rtcpFeedback.push(feedback);
        }
        for (const ext of m.ext || []) {
          if (ext["encrypt-uri"])
            continue;
          const headerExtension = {
            kind,
            uri: ext.uri,
            preferredId: ext.value
          };
          headerExtensions.push(headerExtension);
        }
      }
      const rtpCapabilities = {
        codecs: Array.from(codecsMap.values()),
        headerExtensions
      };
      return rtpCapabilities;
    }
    exports.extractRtpCapabilities = extractRtpCapabilities;
    function extractDtlsParameters({ sdpObject }) {
      const mediaObject = (sdpObject.media || []).find((m) => m.iceUfrag && m.port !== 0);
      if (!mediaObject)
        throw new Error("no active media section found");
      const fingerprint = mediaObject.fingerprint || sdpObject.fingerprint;
      let role;
      switch (mediaObject.setup) {
        case "active":
          role = "client";
          break;
        case "passive":
          role = "server";
          break;
        case "actpass":
          role = "auto";
          break;
      }
      const dtlsParameters = {
        role,
        fingerprints: [
          {
            algorithm: fingerprint.type,
            value: fingerprint.hash
          }
        ]
      };
      return dtlsParameters;
    }
    exports.extractDtlsParameters = extractDtlsParameters;
    function getCname({ offerMediaObject }) {
      const ssrcCnameLine = (offerMediaObject.ssrcs || []).find((line) => line.attribute === "cname");
      if (!ssrcCnameLine)
        return "";
      return ssrcCnameLine.value;
    }
    exports.getCname = getCname;
    function applyCodecParameters({ offerRtpParameters, answerMediaObject }) {
      for (const codec of offerRtpParameters.codecs) {
        const mimeType = codec.mimeType.toLowerCase();
        if (mimeType !== "audio/opus")
          continue;
        const rtp = (answerMediaObject.rtp || []).find((r) => r.payload === codec.payloadType);
        if (!rtp)
          continue;
        answerMediaObject.fmtp = answerMediaObject.fmtp || [];
        let fmtp = answerMediaObject.fmtp.find((f) => f.payload === codec.payloadType);
        if (!fmtp) {
          fmtp = { payload: codec.payloadType, config: "" };
          answerMediaObject.fmtp.push(fmtp);
        }
        const parameters = sdpTransform.parseParams(fmtp.config);
        switch (mimeType) {
          case "audio/opus": {
            const spropStereo = codec.parameters["sprop-stereo"];
            if (spropStereo !== void 0)
              parameters.stereo = spropStereo ? 1 : 0;
            break;
          }
        }
        fmtp.config = "";
        for (const key of Object.keys(parameters)) {
          if (fmtp.config)
            fmtp.config += ";";
          fmtp.config += `${key}=${parameters[key]}`;
        }
      }
    }
    exports.applyCodecParameters = applyCodecParameters;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/sdp/unifiedPlanUtils.js
var require_unifiedPlanUtils = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/sdp/unifiedPlanUtils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addLegacySimulcast = exports.getRtpEncodings = void 0;
    function getRtpEncodings({ offerMediaObject }) {
      const ssrcs = /* @__PURE__ */ new Set();
      for (const line of offerMediaObject.ssrcs || []) {
        const ssrc = line.id;
        ssrcs.add(ssrc);
      }
      if (ssrcs.size === 0)
        throw new Error("no a=ssrc lines found");
      const ssrcToRtxSsrc = /* @__PURE__ */ new Map();
      for (const line of offerMediaObject.ssrcGroups || []) {
        if (line.semantics !== "FID")
          continue;
        let [ssrc, rtxSsrc] = line.ssrcs.split(/\s+/);
        ssrc = Number(ssrc);
        rtxSsrc = Number(rtxSsrc);
        if (ssrcs.has(ssrc)) {
          ssrcs.delete(ssrc);
          ssrcs.delete(rtxSsrc);
          ssrcToRtxSsrc.set(ssrc, rtxSsrc);
        }
      }
      for (const ssrc of ssrcs) {
        ssrcToRtxSsrc.set(ssrc, null);
      }
      const encodings = [];
      for (const [ssrc, rtxSsrc] of ssrcToRtxSsrc) {
        const encoding = { ssrc };
        if (rtxSsrc)
          encoding.rtx = { ssrc: rtxSsrc };
        encodings.push(encoding);
      }
      return encodings;
    }
    exports.getRtpEncodings = getRtpEncodings;
    function addLegacySimulcast({ offerMediaObject, numStreams }) {
      if (numStreams <= 1)
        throw new TypeError("numStreams must be greater than 1");
      const ssrcMsidLine = (offerMediaObject.ssrcs || []).find((line) => line.attribute === "msid");
      if (!ssrcMsidLine)
        throw new Error("a=ssrc line with msid information not found");
      const [streamId, trackId] = ssrcMsidLine.value.split(" ");
      const firstSsrc = ssrcMsidLine.id;
      let firstRtxSsrc;
      (offerMediaObject.ssrcGroups || []).some((line) => {
        if (line.semantics !== "FID")
          return false;
        const ssrcs2 = line.ssrcs.split(/\s+/);
        if (Number(ssrcs2[0]) === firstSsrc) {
          firstRtxSsrc = Number(ssrcs2[1]);
          return true;
        } else {
          return false;
        }
      });
      const ssrcCnameLine = offerMediaObject.ssrcs.find((line) => line.attribute === "cname");
      if (!ssrcCnameLine)
        throw new Error("a=ssrc line with cname information not found");
      const cname = ssrcCnameLine.value;
      const ssrcs = [];
      const rtxSsrcs = [];
      for (let i = 0; i < numStreams; ++i) {
        ssrcs.push(firstSsrc + i);
        if (firstRtxSsrc)
          rtxSsrcs.push(firstRtxSsrc + i);
      }
      offerMediaObject.ssrcGroups = [];
      offerMediaObject.ssrcs = [];
      offerMediaObject.ssrcGroups.push({
        semantics: "SIM",
        ssrcs: ssrcs.join(" ")
      });
      for (let i = 0; i < ssrcs.length; ++i) {
        const ssrc = ssrcs[i];
        offerMediaObject.ssrcs.push({
          id: ssrc,
          attribute: "cname",
          value: cname
        });
        offerMediaObject.ssrcs.push({
          id: ssrc,
          attribute: "msid",
          value: `${streamId} ${trackId}`
        });
      }
      for (let i = 0; i < rtxSsrcs.length; ++i) {
        const ssrc = ssrcs[i];
        const rtxSsrc = rtxSsrcs[i];
        offerMediaObject.ssrcs.push({
          id: rtxSsrc,
          attribute: "cname",
          value: cname
        });
        offerMediaObject.ssrcs.push({
          id: rtxSsrc,
          attribute: "msid",
          value: `${streamId} ${trackId}`
        });
        offerMediaObject.ssrcGroups.push({
          semantics: "FID",
          ssrcs: `${ssrc} ${rtxSsrc}`
        });
      }
    }
    exports.addLegacySimulcast = addLegacySimulcast;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/HandlerInterface.js
var require_HandlerInterface = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/HandlerInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HandlerInterface = void 0;
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var HandlerInterface = class extends EnhancedEventEmitter_1.EnhancedEventEmitter {
      constructor() {
        super();
      }
    };
    exports.HandlerInterface = HandlerInterface;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/sdp/MediaSection.js
var require_MediaSection = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/sdp/MediaSection.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OfferMediaSection = exports.AnswerMediaSection = exports.MediaSection = void 0;
    var utils = __importStar(require_utils());
    var MediaSection = class {
      constructor({ iceParameters, iceCandidates, dtlsParameters, planB = false }) {
        this._mediaObject = {};
        this._planB = planB;
        if (iceParameters) {
          this.setIceParameters(iceParameters);
        }
        if (iceCandidates) {
          this._mediaObject.candidates = [];
          for (const candidate of iceCandidates) {
            const candidateObject = {};
            candidateObject.component = 1;
            candidateObject.foundation = candidate.foundation;
            candidateObject.ip = candidate.ip;
            candidateObject.port = candidate.port;
            candidateObject.priority = candidate.priority;
            candidateObject.transport = candidate.protocol;
            candidateObject.type = candidate.type;
            if (candidate.tcpType)
              candidateObject.tcptype = candidate.tcpType;
            this._mediaObject.candidates.push(candidateObject);
          }
          this._mediaObject.endOfCandidates = "end-of-candidates";
          this._mediaObject.iceOptions = "renomination";
        }
        if (dtlsParameters) {
          this.setDtlsRole(dtlsParameters.role);
        }
      }
      get mid() {
        return String(this._mediaObject.mid);
      }
      get closed() {
        return this._mediaObject.port === 0;
      }
      getObject() {
        return this._mediaObject;
      }
      setIceParameters(iceParameters) {
        this._mediaObject.iceUfrag = iceParameters.usernameFragment;
        this._mediaObject.icePwd = iceParameters.password;
      }
      disable() {
        this._mediaObject.direction = "inactive";
        delete this._mediaObject.ext;
        delete this._mediaObject.ssrcs;
        delete this._mediaObject.ssrcGroups;
        delete this._mediaObject.simulcast;
        delete this._mediaObject.simulcast_03;
        delete this._mediaObject.rids;
      }
      close() {
        this._mediaObject.direction = "inactive";
        this._mediaObject.port = 0;
        delete this._mediaObject.ext;
        delete this._mediaObject.ssrcs;
        delete this._mediaObject.ssrcGroups;
        delete this._mediaObject.simulcast;
        delete this._mediaObject.simulcast_03;
        delete this._mediaObject.rids;
        delete this._mediaObject.extmapAllowMixed;
      }
    };
    exports.MediaSection = MediaSection;
    var AnswerMediaSection = class extends MediaSection {
      constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB = false, offerMediaObject, offerRtpParameters, answerRtpParameters, codecOptions, extmapAllowMixed = false }) {
        super({ iceParameters, iceCandidates, dtlsParameters, planB });
        this._mediaObject.mid = String(offerMediaObject.mid);
        this._mediaObject.type = offerMediaObject.type;
        this._mediaObject.protocol = offerMediaObject.protocol;
        if (!plainRtpParameters) {
          this._mediaObject.connection = { ip: "127.0.0.1", version: 4 };
          this._mediaObject.port = 7;
        } else {
          this._mediaObject.connection = {
            ip: plainRtpParameters.ip,
            version: plainRtpParameters.ipVersion
          };
          this._mediaObject.port = plainRtpParameters.port;
        }
        switch (offerMediaObject.type) {
          case "audio":
          case "video": {
            this._mediaObject.direction = "recvonly";
            this._mediaObject.rtp = [];
            this._mediaObject.rtcpFb = [];
            this._mediaObject.fmtp = [];
            for (const codec of answerRtpParameters.codecs) {
              const rtp = {
                payload: codec.payloadType,
                codec: getCodecName(codec),
                rate: codec.clockRate
              };
              if (codec.channels > 1)
                rtp.encoding = codec.channels;
              this._mediaObject.rtp.push(rtp);
              const codecParameters = utils.clone(codec.parameters, {});
              if (codecOptions) {
                const { opusStereo, opusFec, opusDtx, opusMaxPlaybackRate, opusMaxAverageBitrate, opusPtime, videoGoogleStartBitrate, videoGoogleMaxBitrate, videoGoogleMinBitrate } = codecOptions;
                const offerCodec = offerRtpParameters.codecs.find((c) => c.payloadType === codec.payloadType);
                switch (codec.mimeType.toLowerCase()) {
                  case "audio/opus": {
                    if (opusStereo !== void 0) {
                      offerCodec.parameters["sprop-stereo"] = opusStereo ? 1 : 0;
                      codecParameters.stereo = opusStereo ? 1 : 0;
                    }
                    if (opusFec !== void 0) {
                      offerCodec.parameters.useinbandfec = opusFec ? 1 : 0;
                      codecParameters.useinbandfec = opusFec ? 1 : 0;
                    }
                    if (opusDtx !== void 0) {
                      offerCodec.parameters.usedtx = opusDtx ? 1 : 0;
                      codecParameters.usedtx = opusDtx ? 1 : 0;
                    }
                    if (opusMaxPlaybackRate !== void 0) {
                      codecParameters.maxplaybackrate = opusMaxPlaybackRate;
                    }
                    if (opusMaxAverageBitrate !== void 0) {
                      codecParameters.maxaveragebitrate = opusMaxAverageBitrate;
                    }
                    if (opusPtime !== void 0) {
                      offerCodec.parameters.ptime = opusPtime;
                      codecParameters.ptime = opusPtime;
                    }
                    break;
                  }
                  case "video/vp8":
                  case "video/vp9":
                  case "video/h264":
                  case "video/h265": {
                    if (videoGoogleStartBitrate !== void 0)
                      codecParameters["x-google-start-bitrate"] = videoGoogleStartBitrate;
                    if (videoGoogleMaxBitrate !== void 0)
                      codecParameters["x-google-max-bitrate"] = videoGoogleMaxBitrate;
                    if (videoGoogleMinBitrate !== void 0)
                      codecParameters["x-google-min-bitrate"] = videoGoogleMinBitrate;
                    break;
                  }
                }
              }
              const fmtp = {
                payload: codec.payloadType,
                config: ""
              };
              for (const key of Object.keys(codecParameters)) {
                if (fmtp.config)
                  fmtp.config += ";";
                fmtp.config += `${key}=${codecParameters[key]}`;
              }
              if (fmtp.config)
                this._mediaObject.fmtp.push(fmtp);
              for (const fb of codec.rtcpFeedback) {
                this._mediaObject.rtcpFb.push({
                  payload: codec.payloadType,
                  type: fb.type,
                  subtype: fb.parameter
                });
              }
            }
            this._mediaObject.payloads = answerRtpParameters.codecs.map((codec) => codec.payloadType).join(" ");
            this._mediaObject.ext = [];
            for (const ext of answerRtpParameters.headerExtensions) {
              const found = (offerMediaObject.ext || []).some((localExt) => localExt.uri === ext.uri);
              if (!found)
                continue;
              this._mediaObject.ext.push({
                uri: ext.uri,
                value: ext.id
              });
            }
            if (extmapAllowMixed && offerMediaObject.extmapAllowMixed === "extmap-allow-mixed") {
              this._mediaObject.extmapAllowMixed = "extmap-allow-mixed";
            }
            if (offerMediaObject.simulcast) {
              this._mediaObject.simulcast = {
                dir1: "recv",
                list1: offerMediaObject.simulcast.list1
              };
              this._mediaObject.rids = [];
              for (const rid of offerMediaObject.rids || []) {
                if (rid.direction !== "send")
                  continue;
                this._mediaObject.rids.push({
                  id: rid.id,
                  direction: "recv"
                });
              }
            } else if (offerMediaObject.simulcast_03) {
              this._mediaObject.simulcast_03 = {
                value: offerMediaObject.simulcast_03.value.replace(/send/g, "recv")
              };
              this._mediaObject.rids = [];
              for (const rid of offerMediaObject.rids || []) {
                if (rid.direction !== "send")
                  continue;
                this._mediaObject.rids.push({
                  id: rid.id,
                  direction: "recv"
                });
              }
            }
            this._mediaObject.rtcpMux = "rtcp-mux";
            this._mediaObject.rtcpRsize = "rtcp-rsize";
            if (this._planB && this._mediaObject.type === "video")
              this._mediaObject.xGoogleFlag = "conference";
            break;
          }
          case "application": {
            if (typeof offerMediaObject.sctpPort === "number") {
              this._mediaObject.payloads = "webrtc-datachannel";
              this._mediaObject.sctpPort = sctpParameters.port;
              this._mediaObject.maxMessageSize = sctpParameters.maxMessageSize;
            } else if (offerMediaObject.sctpmap) {
              this._mediaObject.payloads = sctpParameters.port;
              this._mediaObject.sctpmap = {
                app: "webrtc-datachannel",
                sctpmapNumber: sctpParameters.port,
                maxMessageSize: sctpParameters.maxMessageSize
              };
            }
            break;
          }
        }
      }
      setDtlsRole(role) {
        switch (role) {
          case "client":
            this._mediaObject.setup = "active";
            break;
          case "server":
            this._mediaObject.setup = "passive";
            break;
          case "auto":
            this._mediaObject.setup = "actpass";
            break;
        }
      }
    };
    exports.AnswerMediaSection = AnswerMediaSection;
    var OfferMediaSection = class extends MediaSection {
      constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB = false, mid, kind, offerRtpParameters, streamId, trackId, oldDataChannelSpec = false }) {
        super({ iceParameters, iceCandidates, dtlsParameters, planB });
        this._mediaObject.mid = String(mid);
        this._mediaObject.type = kind;
        if (!plainRtpParameters) {
          this._mediaObject.connection = { ip: "127.0.0.1", version: 4 };
          if (!sctpParameters)
            this._mediaObject.protocol = "UDP/TLS/RTP/SAVPF";
          else
            this._mediaObject.protocol = "UDP/DTLS/SCTP";
          this._mediaObject.port = 7;
        } else {
          this._mediaObject.connection = {
            ip: plainRtpParameters.ip,
            version: plainRtpParameters.ipVersion
          };
          this._mediaObject.protocol = "RTP/AVP";
          this._mediaObject.port = plainRtpParameters.port;
        }
        switch (kind) {
          case "audio":
          case "video": {
            this._mediaObject.direction = "sendonly";
            this._mediaObject.rtp = [];
            this._mediaObject.rtcpFb = [];
            this._mediaObject.fmtp = [];
            if (!this._planB)
              this._mediaObject.msid = `${streamId || "-"} ${trackId}`;
            for (const codec of offerRtpParameters.codecs) {
              const rtp = {
                payload: codec.payloadType,
                codec: getCodecName(codec),
                rate: codec.clockRate
              };
              if (codec.channels > 1)
                rtp.encoding = codec.channels;
              this._mediaObject.rtp.push(rtp);
              const fmtp = {
                payload: codec.payloadType,
                config: ""
              };
              for (const key of Object.keys(codec.parameters)) {
                if (fmtp.config)
                  fmtp.config += ";";
                fmtp.config += `${key}=${codec.parameters[key]}`;
              }
              if (fmtp.config)
                this._mediaObject.fmtp.push(fmtp);
              for (const fb of codec.rtcpFeedback) {
                this._mediaObject.rtcpFb.push({
                  payload: codec.payloadType,
                  type: fb.type,
                  subtype: fb.parameter
                });
              }
            }
            this._mediaObject.payloads = offerRtpParameters.codecs.map((codec) => codec.payloadType).join(" ");
            this._mediaObject.ext = [];
            for (const ext of offerRtpParameters.headerExtensions) {
              this._mediaObject.ext.push({
                uri: ext.uri,
                value: ext.id
              });
            }
            this._mediaObject.rtcpMux = "rtcp-mux";
            this._mediaObject.rtcpRsize = "rtcp-rsize";
            const encoding = offerRtpParameters.encodings[0];
            const ssrc = encoding.ssrc;
            const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : void 0;
            this._mediaObject.ssrcs = [];
            this._mediaObject.ssrcGroups = [];
            if (offerRtpParameters.rtcp.cname) {
              this._mediaObject.ssrcs.push({
                id: ssrc,
                attribute: "cname",
                value: offerRtpParameters.rtcp.cname
              });
            }
            if (this._planB) {
              this._mediaObject.ssrcs.push({
                id: ssrc,
                attribute: "msid",
                value: `${streamId || "-"} ${trackId}`
              });
            }
            if (rtxSsrc) {
              if (offerRtpParameters.rtcp.cname) {
                this._mediaObject.ssrcs.push({
                  id: rtxSsrc,
                  attribute: "cname",
                  value: offerRtpParameters.rtcp.cname
                });
              }
              if (this._planB) {
                this._mediaObject.ssrcs.push({
                  id: rtxSsrc,
                  attribute: "msid",
                  value: `${streamId || "-"} ${trackId}`
                });
              }
              this._mediaObject.ssrcGroups.push({
                semantics: "FID",
                ssrcs: `${ssrc} ${rtxSsrc}`
              });
            }
            break;
          }
          case "application": {
            if (!oldDataChannelSpec) {
              this._mediaObject.payloads = "webrtc-datachannel";
              this._mediaObject.sctpPort = sctpParameters.port;
              this._mediaObject.maxMessageSize = sctpParameters.maxMessageSize;
            } else {
              this._mediaObject.payloads = sctpParameters.port;
              this._mediaObject.sctpmap = {
                app: "webrtc-datachannel",
                sctpmapNumber: sctpParameters.port,
                maxMessageSize: sctpParameters.maxMessageSize
              };
            }
            break;
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setDtlsRole(role) {
        this._mediaObject.setup = "actpass";
      }
      planBReceive({ offerRtpParameters, streamId, trackId }) {
        const encoding = offerRtpParameters.encodings[0];
        const ssrc = encoding.ssrc;
        const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : void 0;
        const payloads = this._mediaObject.payloads.split(" ");
        for (const codec of offerRtpParameters.codecs) {
          if (payloads.includes(String(codec.payloadType))) {
            continue;
          }
          const rtp = {
            payload: codec.payloadType,
            codec: getCodecName(codec),
            rate: codec.clockRate
          };
          if (codec.channels > 1)
            rtp.encoding = codec.channels;
          this._mediaObject.rtp.push(rtp);
          const fmtp = {
            payload: codec.payloadType,
            config: ""
          };
          for (const key of Object.keys(codec.parameters)) {
            if (fmtp.config)
              fmtp.config += ";";
            fmtp.config += `${key}=${codec.parameters[key]}`;
          }
          if (fmtp.config)
            this._mediaObject.fmtp.push(fmtp);
          for (const fb of codec.rtcpFeedback) {
            this._mediaObject.rtcpFb.push({
              payload: codec.payloadType,
              type: fb.type,
              subtype: fb.parameter
            });
          }
        }
        this._mediaObject.payloads += ` ${offerRtpParameters.codecs.filter((codec) => !this._mediaObject.payloads.includes(codec.payloadType)).map((codec) => codec.payloadType).join(" ")}`;
        this._mediaObject.payloads = this._mediaObject.payloads.trim();
        if (offerRtpParameters.rtcp.cname) {
          this._mediaObject.ssrcs.push({
            id: ssrc,
            attribute: "cname",
            value: offerRtpParameters.rtcp.cname
          });
        }
        this._mediaObject.ssrcs.push({
          id: ssrc,
          attribute: "msid",
          value: `${streamId || "-"} ${trackId}`
        });
        if (rtxSsrc) {
          if (offerRtpParameters.rtcp.cname) {
            this._mediaObject.ssrcs.push({
              id: rtxSsrc,
              attribute: "cname",
              value: offerRtpParameters.rtcp.cname
            });
          }
          this._mediaObject.ssrcs.push({
            id: rtxSsrc,
            attribute: "msid",
            value: `${streamId || "-"} ${trackId}`
          });
          this._mediaObject.ssrcGroups.push({
            semantics: "FID",
            ssrcs: `${ssrc} ${rtxSsrc}`
          });
        }
      }
      planBStopReceiving({ offerRtpParameters }) {
        const encoding = offerRtpParameters.encodings[0];
        const ssrc = encoding.ssrc;
        const rtxSsrc = encoding.rtx && encoding.rtx.ssrc ? encoding.rtx.ssrc : void 0;
        this._mediaObject.ssrcs = this._mediaObject.ssrcs.filter((s) => s.id !== ssrc && s.id !== rtxSsrc);
        if (rtxSsrc) {
          this._mediaObject.ssrcGroups = this._mediaObject.ssrcGroups.filter((group) => group.ssrcs !== `${ssrc} ${rtxSsrc}`);
        }
      }
    };
    exports.OfferMediaSection = OfferMediaSection;
    function getCodecName(codec) {
      const MimeTypeRegex = new RegExp("^(audio|video)/(.+)", "i");
      const mimeTypeMatch = MimeTypeRegex.exec(codec.mimeType);
      if (!mimeTypeMatch)
        throw new TypeError("invalid codec.mimeType");
      return mimeTypeMatch[2];
    }
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/sdp/RemoteSdp.js
var require_RemoteSdp = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/sdp/RemoteSdp.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteSdp = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var MediaSection_1 = require_MediaSection();
    var logger = new Logger_1.Logger("RemoteSdp");
    var RemoteSdp = class {
      constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB = false }) {
        this._mediaSections = [];
        this._midToIndex = /* @__PURE__ */ new Map();
        this._iceParameters = iceParameters;
        this._iceCandidates = iceCandidates;
        this._dtlsParameters = dtlsParameters;
        this._sctpParameters = sctpParameters;
        this._plainRtpParameters = plainRtpParameters;
        this._planB = planB;
        this._sdpObject = {
          version: 0,
          origin: {
            address: "0.0.0.0",
            ipVer: 4,
            netType: "IN",
            sessionId: 1e4,
            sessionVersion: 0,
            username: "mediasoup-client"
          },
          name: "-",
          timing: { start: 0, stop: 0 },
          media: []
        };
        if (iceParameters && iceParameters.iceLite) {
          this._sdpObject.icelite = "ice-lite";
        }
        if (dtlsParameters) {
          this._sdpObject.msidSemantic = { semantic: "WMS", token: "*" };
          const numFingerprints = this._dtlsParameters.fingerprints.length;
          this._sdpObject.fingerprint = {
            type: dtlsParameters.fingerprints[numFingerprints - 1].algorithm,
            hash: dtlsParameters.fingerprints[numFingerprints - 1].value
          };
          this._sdpObject.groups = [{ type: "BUNDLE", mids: "" }];
        }
        if (plainRtpParameters) {
          this._sdpObject.origin.address = plainRtpParameters.ip;
          this._sdpObject.origin.ipVer = plainRtpParameters.ipVersion;
        }
      }
      updateIceParameters(iceParameters) {
        logger.debug("updateIceParameters() [iceParameters:%o]", iceParameters);
        this._iceParameters = iceParameters;
        this._sdpObject.icelite = iceParameters.iceLite ? "ice-lite" : void 0;
        for (const mediaSection of this._mediaSections) {
          mediaSection.setIceParameters(iceParameters);
        }
      }
      updateDtlsRole(role) {
        logger.debug("updateDtlsRole() [role:%s]", role);
        this._dtlsParameters.role = role;
        for (const mediaSection of this._mediaSections) {
          mediaSection.setDtlsRole(role);
        }
      }
      getNextMediaSectionIdx() {
        for (let idx = 0; idx < this._mediaSections.length; ++idx) {
          const mediaSection = this._mediaSections[idx];
          if (mediaSection.closed)
            return { idx, reuseMid: mediaSection.mid };
        }
        return { idx: this._mediaSections.length };
      }
      send({ offerMediaObject, reuseMid, offerRtpParameters, answerRtpParameters, codecOptions, extmapAllowMixed = false }) {
        const mediaSection = new MediaSection_1.AnswerMediaSection({
          iceParameters: this._iceParameters,
          iceCandidates: this._iceCandidates,
          dtlsParameters: this._dtlsParameters,
          plainRtpParameters: this._plainRtpParameters,
          planB: this._planB,
          offerMediaObject,
          offerRtpParameters,
          answerRtpParameters,
          codecOptions,
          extmapAllowMixed
        });
        if (reuseMid) {
          this._replaceMediaSection(mediaSection, reuseMid);
        } else if (!this._midToIndex.has(mediaSection.mid)) {
          this._addMediaSection(mediaSection);
        } else {
          this._replaceMediaSection(mediaSection);
        }
      }
      receive({ mid, kind, offerRtpParameters, streamId, trackId }) {
        const idx = this._midToIndex.get(mid);
        let mediaSection;
        if (idx !== void 0)
          mediaSection = this._mediaSections[idx];
        if (!mediaSection) {
          mediaSection = new MediaSection_1.OfferMediaSection({
            iceParameters: this._iceParameters,
            iceCandidates: this._iceCandidates,
            dtlsParameters: this._dtlsParameters,
            plainRtpParameters: this._plainRtpParameters,
            planB: this._planB,
            mid,
            kind,
            offerRtpParameters,
            streamId,
            trackId
          });
          const oldMediaSection = this._mediaSections.find((m) => m.closed);
          if (oldMediaSection) {
            this._replaceMediaSection(mediaSection, oldMediaSection.mid);
          } else {
            this._addMediaSection(mediaSection);
          }
        } else {
          mediaSection.planBReceive({ offerRtpParameters, streamId, trackId });
          this._replaceMediaSection(mediaSection);
        }
      }
      disableMediaSection(mid) {
        const idx = this._midToIndex.get(mid);
        if (idx === void 0) {
          throw new Error(`no media section found with mid '${mid}'`);
        }
        const mediaSection = this._mediaSections[idx];
        mediaSection.disable();
      }
      closeMediaSection(mid) {
        const idx = this._midToIndex.get(mid);
        if (idx === void 0) {
          throw new Error(`no media section found with mid '${mid}'`);
        }
        const mediaSection = this._mediaSections[idx];
        if (mid === this._firstMid) {
          logger.debug("closeMediaSection() | cannot close first media section, disabling it instead [mid:%s]", mid);
          this.disableMediaSection(mid);
          return;
        }
        mediaSection.close();
        this._regenerateBundleMids();
      }
      planBStopReceiving({ mid, offerRtpParameters }) {
        const idx = this._midToIndex.get(mid);
        if (idx === void 0) {
          throw new Error(`no media section found with mid '${mid}'`);
        }
        const mediaSection = this._mediaSections[idx];
        mediaSection.planBStopReceiving({ offerRtpParameters });
        this._replaceMediaSection(mediaSection);
      }
      sendSctpAssociation({ offerMediaObject }) {
        const mediaSection = new MediaSection_1.AnswerMediaSection({
          iceParameters: this._iceParameters,
          iceCandidates: this._iceCandidates,
          dtlsParameters: this._dtlsParameters,
          sctpParameters: this._sctpParameters,
          plainRtpParameters: this._plainRtpParameters,
          offerMediaObject
        });
        this._addMediaSection(mediaSection);
      }
      receiveSctpAssociation({ oldDataChannelSpec = false } = {}) {
        const mediaSection = new MediaSection_1.OfferMediaSection({
          iceParameters: this._iceParameters,
          iceCandidates: this._iceCandidates,
          dtlsParameters: this._dtlsParameters,
          sctpParameters: this._sctpParameters,
          plainRtpParameters: this._plainRtpParameters,
          mid: "datachannel",
          kind: "application",
          oldDataChannelSpec
        });
        this._addMediaSection(mediaSection);
      }
      getSdp() {
        this._sdpObject.origin.sessionVersion++;
        return sdpTransform.write(this._sdpObject);
      }
      _addMediaSection(newMediaSection) {
        if (!this._firstMid)
          this._firstMid = newMediaSection.mid;
        this._mediaSections.push(newMediaSection);
        this._midToIndex.set(newMediaSection.mid, this._mediaSections.length - 1);
        this._sdpObject.media.push(newMediaSection.getObject());
        this._regenerateBundleMids();
      }
      _replaceMediaSection(newMediaSection, reuseMid) {
        if (typeof reuseMid === "string") {
          const idx = this._midToIndex.get(reuseMid);
          if (idx === void 0) {
            throw new Error(`no media section found for reuseMid '${reuseMid}'`);
          }
          const oldMediaSection = this._mediaSections[idx];
          this._mediaSections[idx] = newMediaSection;
          this._midToIndex.delete(oldMediaSection.mid);
          this._midToIndex.set(newMediaSection.mid, idx);
          this._sdpObject.media[idx] = newMediaSection.getObject();
          this._regenerateBundleMids();
        } else {
          const idx = this._midToIndex.get(newMediaSection.mid);
          if (idx === void 0) {
            throw new Error(`no media section found with mid '${newMediaSection.mid}'`);
          }
          this._mediaSections[idx] = newMediaSection;
          this._sdpObject.media[idx] = newMediaSection.getObject();
        }
      }
      _regenerateBundleMids() {
        if (!this._dtlsParameters)
          return;
        this._sdpObject.groups[0].mids = this._mediaSections.filter((mediaSection) => !mediaSection.closed).map((mediaSection) => mediaSection.mid).join(" ");
      }
    };
    exports.RemoteSdp = RemoteSdp;
  }
});

// ../../node_modules/mediasoup-client/lib/scalabilityModes.js
var require_scalabilityModes = __commonJS({
  "../../node_modules/mediasoup-client/lib/scalabilityModes.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    var ScalabilityModeRegex = new RegExp("^[LS]([1-9]\\d{0,1})T([1-9]\\d{0,1})");
    function parse(scalabilityMode) {
      const match = ScalabilityModeRegex.exec(scalabilityMode || "");
      if (match) {
        return {
          spatialLayers: Number(match[1]),
          temporalLayers: Number(match[2])
        };
      } else {
        return {
          spatialLayers: 1,
          temporalLayers: 1
        };
      }
    }
    exports.parse = parse;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Chrome74.js
var require_Chrome74 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Chrome74.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chrome74 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpUnifiedPlanUtils = __importStar(require_unifiedPlanUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var scalabilityModes_1 = require_scalabilityModes();
    var logger = new Logger_1.Logger("Chrome74");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Chrome74 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._mapMidTransceiver = /* @__PURE__ */ new Map();
        this._sendStream = new MediaStream();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Chrome74();
      }
      get name() {
        return "Chrome74";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "unified-plan"
        });
        try {
          pc.addTransceiver("audio");
          pc.addTransceiver("video");
          const offer = await pc.createOffer();
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "unified-plan",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (encodings && encodings.length > 1) {
          encodings.forEach((encoding, idx) => {
            encoding.rid = `r${idx}`;
          });
        }
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);
        const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();
        const transceiver = this._pc.addTransceiver(track, {
          direction: "sendonly",
          streams: [this._sendStream],
          sendEncodings: encodings
        });
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        let hackVp9Svc = false;
        const layers = (0, scalabilityModes_1.parse)((encodings || [{}])[0].scalabilityMode);
        if (encodings && encodings.length === 1 && layers.spatialLayers > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp9") {
          logger.debug("send() | enabling legacy simulcast for VP9 SVC");
          hackVp9Svc = true;
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
          sdpUnifiedPlanUtils.addLegacySimulcast({
            offerMediaObject,
            numStreams: layers.spatialLayers
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const localId = transceiver.mid;
        sendingRtpParameters.mid = localId;
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        if (!encodings) {
          sendingRtpParameters.encodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
        } else if (encodings.length === 1) {
          let newEncodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
          Object.assign(newEncodings[0], encodings[0]);
          if (hackVp9Svc)
            newEncodings = [newEncodings[0]];
          sendingRtpParameters.encodings = newEncodings;
        } else {
          sendingRtpParameters.encodings = encodings;
        }
        if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8" || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/h264")) {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          reuseMid: mediaSectionIdx.reuseMid,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions,
          extmapAllowMixed: true
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.set(localId, transceiver);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender: transceiver.sender
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.sender.replaceTrack(null);
        this._pc.removeTrack(transceiver.sender);
        this._remoteSdp.closeMediaSection(transceiver.mid);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.delete(localId);
      }
      async pauseSending(localId) {
        this._assertSendDirection();
        logger.debug("pauseSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "inactive";
        const offer = await this._pc.createOffer();
        logger.debug("pauseSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      async resumeSending(localId) {
        this._assertSendDirection();
        logger.debug("resumeSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "sendonly";
        const offer = await this._pc.createOffer();
        logger.debug("resumeSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        await transceiver.sender.replaceTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await transceiver.sender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await transceiver.sender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.sender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        const mapLocalId = /* @__PURE__ */ new Map();
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);
          mapLocalId.set(trackId, localId);
          this._remoteSdp.receive({
            mid: localId,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { trackId, rtpParameters } = options;
          const localId = mapLocalId.get(trackId);
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === localId);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { trackId } = options;
          const localId = mapLocalId.get(trackId);
          const transceiver = this._pc.getTransceivers().find((t) => t.mid === localId);
          if (!transceiver) {
            throw new Error("new RTCRtpTransceiver not found");
          } else {
            this._mapMidTransceiver.set(localId, transceiver);
            results.push({
              localId,
              track: transceiver.receiver.track,
              rtpReceiver: transceiver.receiver
            });
          }
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          this._remoteSdp.closeMediaSection(transceiver.mid);
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const localId of localIds) {
          this._mapMidTransceiver.delete(localId);
        }
      }
      async pauseReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("pauseReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "inactive";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("pauseReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async resumeReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("resumeReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "recvonly";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("resumeReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.receiver.getStats();
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation();
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Chrome74 = Chrome74;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Chrome70.js
var require_Chrome70 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Chrome70.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chrome70 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpUnifiedPlanUtils = __importStar(require_unifiedPlanUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var scalabilityModes_1 = require_scalabilityModes();
    var logger = new Logger_1.Logger("Chrome70");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Chrome70 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._mapMidTransceiver = /* @__PURE__ */ new Map();
        this._sendStream = new MediaStream();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Chrome70();
      }
      get name() {
        return "Chrome70";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "unified-plan"
        });
        try {
          pc.addTransceiver("audio");
          pc.addTransceiver("video");
          const offer = await pc.createOffer();
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "unified-plan",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);
        const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();
        const transceiver = this._pc.addTransceiver(track, { direction: "sendonly", streams: [this._sendStream] });
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (encodings && encodings.length > 1) {
          logger.debug("send() | enabling legacy simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
          sdpUnifiedPlanUtils.addLegacySimulcast({
            offerMediaObject,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        let hackVp9Svc = false;
        const layers = (0, scalabilityModes_1.parse)((encodings || [{}])[0].scalabilityMode);
        if (encodings && encodings.length === 1 && layers.spatialLayers > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp9") {
          logger.debug("send() | enabling legacy simulcast for VP9 SVC");
          hackVp9Svc = true;
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
          sdpUnifiedPlanUtils.addLegacySimulcast({
            offerMediaObject,
            numStreams: layers.spatialLayers
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        if (encodings) {
          logger.debug("send() | applying given encodings");
          const parameters = transceiver.sender.getParameters();
          for (let idx = 0; idx < (parameters.encodings || []).length; ++idx) {
            const encoding = parameters.encodings[idx];
            const desiredEncoding = encodings[idx];
            if (!desiredEncoding)
              break;
            parameters.encodings[idx] = Object.assign(encoding, desiredEncoding);
          }
          await transceiver.sender.setParameters(parameters);
        }
        const localId = transceiver.mid;
        sendingRtpParameters.mid = localId;
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (hackVp9Svc) {
          sendingRtpParameters.encodings = [sendingRtpParameters.encodings[0]];
        }
        if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8" || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/h264")) {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          reuseMid: mediaSectionIdx.reuseMid,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.set(localId, transceiver);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender: transceiver.sender
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.sender.replaceTrack(null);
        this._pc.removeTrack(transceiver.sender);
        this._remoteSdp.closeMediaSection(transceiver.mid);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.delete(localId);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        await transceiver.sender.replaceTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await transceiver.sender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await transceiver.sender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.sender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        const mapLocalId = /* @__PURE__ */ new Map();
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);
          mapLocalId.set(trackId, localId);
          this._remoteSdp.receive({
            mid: localId,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { trackId, rtpParameters } = options;
          const localId = mapLocalId.get(trackId);
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === localId);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { trackId } = options;
          const localId = mapLocalId.get(trackId);
          const transceiver = this._pc.getTransceivers().find((t) => t.mid === localId);
          if (!transceiver)
            throw new Error("new RTCRtpTransceiver not found");
          this._mapMidTransceiver.set(localId, transceiver);
          results.push({
            localId,
            track: transceiver.receiver.track,
            rtpReceiver: transceiver.receiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          this._remoteSdp.closeMediaSection(transceiver.mid);
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const localId of localIds) {
          this._mapMidTransceiver.delete(localId);
        }
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.receiver.getStats();
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation();
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Chrome70 = Chrome70;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/sdp/planBUtils.js
var require_planBUtils = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/sdp/planBUtils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addLegacySimulcast = exports.getRtpEncodings = void 0;
    function getRtpEncodings({ offerMediaObject, track }) {
      let firstSsrc;
      const ssrcs = /* @__PURE__ */ new Set();
      for (const line of offerMediaObject.ssrcs || []) {
        if (line.attribute !== "msid")
          continue;
        const trackId = line.value.split(" ")[1];
        if (trackId === track.id) {
          const ssrc = line.id;
          ssrcs.add(ssrc);
          if (!firstSsrc)
            firstSsrc = ssrc;
        }
      }
      if (ssrcs.size === 0)
        throw new Error(`a=ssrc line with msid information not found [track.id:${track.id}]`);
      const ssrcToRtxSsrc = /* @__PURE__ */ new Map();
      for (const line of offerMediaObject.ssrcGroups || []) {
        if (line.semantics !== "FID")
          continue;
        let [ssrc, rtxSsrc] = line.ssrcs.split(/\s+/);
        ssrc = Number(ssrc);
        rtxSsrc = Number(rtxSsrc);
        if (ssrcs.has(ssrc)) {
          ssrcs.delete(ssrc);
          ssrcs.delete(rtxSsrc);
          ssrcToRtxSsrc.set(ssrc, rtxSsrc);
        }
      }
      for (const ssrc of ssrcs) {
        ssrcToRtxSsrc.set(ssrc, null);
      }
      const encodings = [];
      for (const [ssrc, rtxSsrc] of ssrcToRtxSsrc) {
        const encoding = { ssrc };
        if (rtxSsrc)
          encoding.rtx = { ssrc: rtxSsrc };
        encodings.push(encoding);
      }
      return encodings;
    }
    exports.getRtpEncodings = getRtpEncodings;
    function addLegacySimulcast({ offerMediaObject, track, numStreams }) {
      if (numStreams <= 1)
        throw new TypeError("numStreams must be greater than 1");
      let firstSsrc;
      let firstRtxSsrc;
      let streamId;
      const ssrcMsidLine = (offerMediaObject.ssrcs || []).find((line) => {
        if (line.attribute !== "msid")
          return false;
        const trackId = line.value.split(" ")[1];
        if (trackId === track.id) {
          firstSsrc = line.id;
          streamId = line.value.split(" ")[0];
          return true;
        } else {
          return false;
        }
      });
      if (!ssrcMsidLine)
        throw new Error(`a=ssrc line with msid information not found [track.id:${track.id}]`);
      (offerMediaObject.ssrcGroups || []).some((line) => {
        if (line.semantics !== "FID")
          return false;
        const ssrcs2 = line.ssrcs.split(/\s+/);
        if (Number(ssrcs2[0]) === firstSsrc) {
          firstRtxSsrc = Number(ssrcs2[1]);
          return true;
        } else {
          return false;
        }
      });
      const ssrcCnameLine = offerMediaObject.ssrcs.find((line) => line.attribute === "cname" && line.id === firstSsrc);
      if (!ssrcCnameLine)
        throw new Error(`a=ssrc line with cname information not found [track.id:${track.id}]`);
      const cname = ssrcCnameLine.value;
      const ssrcs = [];
      const rtxSsrcs = [];
      for (let i = 0; i < numStreams; ++i) {
        ssrcs.push(firstSsrc + i);
        if (firstRtxSsrc)
          rtxSsrcs.push(firstRtxSsrc + i);
      }
      offerMediaObject.ssrcGroups = offerMediaObject.ssrcGroups || [];
      offerMediaObject.ssrcs = offerMediaObject.ssrcs || [];
      offerMediaObject.ssrcGroups.push({
        semantics: "SIM",
        ssrcs: ssrcs.join(" ")
      });
      for (let i = 0; i < ssrcs.length; ++i) {
        const ssrc = ssrcs[i];
        offerMediaObject.ssrcs.push({
          id: ssrc,
          attribute: "cname",
          value: cname
        });
        offerMediaObject.ssrcs.push({
          id: ssrc,
          attribute: "msid",
          value: `${streamId} ${track.id}`
        });
      }
      for (let i = 0; i < rtxSsrcs.length; ++i) {
        const ssrc = ssrcs[i];
        const rtxSsrc = rtxSsrcs[i];
        offerMediaObject.ssrcs.push({
          id: rtxSsrc,
          attribute: "cname",
          value: cname
        });
        offerMediaObject.ssrcs.push({
          id: rtxSsrc,
          attribute: "msid",
          value: `${streamId} ${track.id}`
        });
        offerMediaObject.ssrcGroups.push({
          semantics: "FID",
          ssrcs: `${ssrc} ${rtxSsrc}`
        });
      }
    }
    exports.addLegacySimulcast = addLegacySimulcast;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Chrome67.js
var require_Chrome67 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Chrome67.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chrome67 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpPlanBUtils = __importStar(require_planBUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("Chrome67");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Chrome67 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._sendStream = new MediaStream();
        this._mapSendLocalIdRtpSender = /* @__PURE__ */ new Map();
        this._nextSendLocalId = 0;
        this._mapRecvLocalIdInfo = /* @__PURE__ */ new Map();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Chrome67();
      }
      get name() {
        return "Chrome67";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b"
        });
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          planB: true
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (codec) {
          logger.warn("send() | codec selection is not available in %s handler", this.name);
        }
        this._sendStream.addTrack(track);
        this._pc.addTrack(track, this._sendStream);
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (track.kind === "video" && encodings && encodings.length > 1) {
          logger.debug("send() | enabling simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media.find((m) => m.type === "video");
          sdpPlanBUtils.addLegacySimulcast({
            offerMediaObject,
            track,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media.find((m) => m.type === track.kind);
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpPlanBUtils.getRtpEncodings({ offerMediaObject, track });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8") {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        const localId = String(this._nextSendLocalId);
        this._nextSendLocalId++;
        const rtpSender = this._pc.getSenders().find((s) => s.track === track);
        this._mapSendLocalIdRtpSender.set(localId, rtpSender);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        this._pc.removeTrack(rtpSender);
        if (rtpSender.track)
          this._sendStream.removeTrack(rtpSender.track);
        this._mapSendLocalIdRtpSender.delete(localId);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        try {
          await this._pc.setLocalDescription(offer);
        } catch (error) {
          if (this._sendStream.getTracks().length === 0) {
            logger.warn("stopSending() | ignoring expected error due no sending tracks: %s", error.toString());
            return;
          }
          throw error;
        }
        if (this._pc.signalingState === "stable")
          return;
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const oldTrack = rtpSender.track;
        await rtpSender.replaceTrack(track);
        if (oldTrack)
          this._sendStream.removeTrack(oldTrack);
        if (track)
          this._sendStream.addTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await rtpSender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await rtpSender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        return rtpSender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const mid = kind;
          this._remoteSdp.receive({
            mid,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { kind, rtpParameters } = options;
          const mid = kind;
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === mid);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { kind, trackId, rtpParameters } = options;
          const localId = trackId;
          const mid = kind;
          const rtpReceiver = this._pc.getReceivers().find((r) => r.track && r.track.id === localId);
          if (!rtpReceiver)
            throw new Error("new RTCRtpReceiver not");
          this._mapRecvLocalIdInfo.set(localId, { mid, rtpParameters, rtpReceiver });
          results.push({
            localId,
            track: rtpReceiver.track,
            rtpReceiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const { mid, rtpParameters } = this._mapRecvLocalIdInfo.get(localId) || {};
          this._mapRecvLocalIdInfo.delete(localId);
          this._remoteSdp.planBStopReceiving({ mid, offerRtpParameters: rtpParameters });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const { rtpReceiver } = this._mapRecvLocalIdInfo.get(localId) || {};
        if (!rtpReceiver)
          throw new Error("associated RTCRtpReceiver not found");
        return rtpReceiver.getStats();
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation({ oldDataChannelSpec: true });
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Chrome67 = Chrome67;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Chrome55.js
var require_Chrome55 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Chrome55.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Chrome55 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpPlanBUtils = __importStar(require_planBUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("Chrome55");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Chrome55 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._sendStream = new MediaStream();
        this._mapSendLocalIdTrack = /* @__PURE__ */ new Map();
        this._nextSendLocalId = 0;
        this._mapRecvLocalIdInfo = /* @__PURE__ */ new Map();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Chrome55();
      }
      get name() {
        return "Chrome55";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b"
        });
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          planB: true
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (codec) {
          logger.warn("send() | codec selection is not available in %s handler", this.name);
        }
        this._sendStream.addTrack(track);
        this._pc.addStream(this._sendStream);
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (track.kind === "video" && encodings && encodings.length > 1) {
          logger.debug("send() | enabling simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media.find((m) => m.type === "video");
          sdpPlanBUtils.addLegacySimulcast({
            offerMediaObject,
            track,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media.find((m) => m.type === track.kind);
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpPlanBUtils.getRtpEncodings({ offerMediaObject, track });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8") {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        const localId = String(this._nextSendLocalId);
        this._nextSendLocalId++;
        this._mapSendLocalIdTrack.set(localId, track);
        return {
          localId,
          rtpParameters: sendingRtpParameters
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const track = this._mapSendLocalIdTrack.get(localId);
        if (!track)
          throw new Error("track not found");
        this._mapSendLocalIdTrack.delete(localId);
        this._sendStream.removeTrack(track);
        this._pc.addStream(this._sendStream);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        try {
          await this._pc.setLocalDescription(offer);
        } catch (error) {
          if (this._sendStream.getTracks().length === 0) {
            logger.warn("stopSending() | ignoring expected error due no sending tracks: %s", error.toString());
            return;
          }
          throw error;
        }
        if (this._pc.signalingState === "stable")
          return;
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async setMaxSpatialLayer(localId, spatialLayer) {
        throw new errors_1.UnsupportedError(" not implemented");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async setRtpEncodingParameters(localId, params) {
        throw new errors_1.UnsupportedError("not supported");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async getSenderStats(localId) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const mid = kind;
          const streamId = rtpParameters.rtcp.cname;
          this._remoteSdp.receive({
            mid,
            kind,
            offerRtpParameters: rtpParameters,
            streamId,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { kind, rtpParameters } = options;
          const mid = kind;
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === mid);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { kind, trackId, rtpParameters } = options;
          const mid = kind;
          const localId = trackId;
          const streamId = rtpParameters.rtcp.cname;
          const stream = this._pc.getRemoteStreams().find((s) => s.id === streamId);
          const track = stream.getTrackById(localId);
          if (!track)
            throw new Error("remote track not found");
          this._mapRecvLocalIdInfo.set(localId, { mid, rtpParameters });
          results.push({ localId, track });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const { mid, rtpParameters } = this._mapRecvLocalIdInfo.get(localId) || {};
          this._mapRecvLocalIdInfo.delete(localId);
          this._remoteSdp.planBStopReceiving({ mid, offerRtpParameters: rtpParameters });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async getReceiverStats(localId) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation({ oldDataChannelSpec: true });
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Chrome55 = Chrome55;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Firefox60.js
var require_Firefox60 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Firefox60.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Firefox60 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpUnifiedPlanUtils = __importStar(require_unifiedPlanUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("Firefox60");
    var SCTP_NUM_STREAMS = { OS: 16, MIS: 2048 };
    var Firefox60 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._mapMidTransceiver = /* @__PURE__ */ new Map();
        this._sendStream = new MediaStream();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Firefox60();
      }
      get name() {
        return "Firefox60";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require"
        });
        const canvas = document.createElement("canvas");
        canvas.getContext("2d");
        const fakeStream = canvas.captureStream();
        const fakeVideoTrack = fakeStream.getVideoTracks()[0];
        try {
          pc.addTransceiver("audio", { direction: "sendrecv" });
          const videoTransceiver = pc.addTransceiver(fakeVideoTrack, { direction: "sendrecv" });
          const parameters = videoTransceiver.sender.getParameters();
          const encodings = [
            { rid: "r0", maxBitrate: 1e5 },
            { rid: "r1", maxBitrate: 5e5 }
          ];
          parameters.encodings = encodings;
          await videoTransceiver.sender.setParameters(parameters);
          const offer = await pc.createOffer();
          try {
            canvas.remove();
          } catch (error) {
          }
          try {
            fakeVideoTrack.stop();
          } catch (error) {
          }
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            canvas.remove();
          } catch (error2) {
          }
          try {
            fakeVideoTrack.stop();
          } catch (error2) {
          }
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async updateIceServers(iceServers) {
        throw new errors_1.UnsupportedError("not supported");
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (encodings) {
          encodings = utils.clone(encodings, []);
          if (encodings.length > 1) {
            encodings.forEach((encoding, idx) => {
              encoding.rid = `r${idx}`;
            });
            encodings.reverse();
          }
        }
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);
        const transceiver = this._pc.addTransceiver(track, { direction: "sendonly", streams: [this._sendStream] });
        if (encodings) {
          const parameters = transceiver.sender.getParameters();
          parameters.encodings = encodings;
          await transceiver.sender.setParameters(parameters);
        }
        const offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        if (!this._transportReady)
          await this._setupTransport({ localDtlsRole: "client", localSdpObject });
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const localId = transceiver.mid;
        sendingRtpParameters.mid = localId;
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const offerMediaObject = localSdpObject.media[localSdpObject.media.length - 1];
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        if (!encodings) {
          sendingRtpParameters.encodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
        } else if (encodings.length === 1) {
          const newEncodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
          Object.assign(newEncodings[0], encodings[0]);
          sendingRtpParameters.encodings = newEncodings;
        } else {
          sendingRtpParameters.encodings = encodings.reverse();
        }
        if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8" || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/h264")) {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions,
          extmapAllowMixed: true
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.set(localId, transceiver);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender: transceiver.sender
        };
      }
      async stopSending(localId) {
        logger.debug("stopSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated transceiver not found");
        transceiver.sender.replaceTrack(null);
        this._pc.removeTrack(transceiver.sender);
        this._remoteSdp.disableMediaSection(transceiver.mid);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.delete(localId);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
        this._assertSendDirection();
        logger.debug("pauseSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "inactive";
        const offer = await this._pc.createOffer();
        logger.debug("pauseSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
        this._assertSendDirection();
        logger.debug("resumeSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "sendonly";
        const offer = await this._pc.createOffer();
        logger.debug("resumeSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        await transceiver.sender.replaceTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated transceiver not found");
        const parameters = transceiver.sender.getParameters();
        spatialLayer = parameters.encodings.length - 1 - spatialLayer;
        parameters.encodings.forEach((encoding, idx) => {
          if (idx >= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await transceiver.sender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await transceiver.sender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.sender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady)
            await this._setupTransport({ localDtlsRole: "client", localSdpObject });
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        this._assertRecvDirection();
        const results = [];
        const mapLocalId = /* @__PURE__ */ new Map();
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);
          mapLocalId.set(trackId, localId);
          this._remoteSdp.receive({
            mid: localId,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { trackId, rtpParameters } = options;
          const localId = mapLocalId.get(trackId);
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === localId);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
          answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        }
        if (!this._transportReady)
          await this._setupTransport({ localDtlsRole: "client", localSdpObject });
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { trackId } = options;
          const localId = mapLocalId.get(trackId);
          const transceiver = this._pc.getTransceivers().find((t) => t.mid === localId);
          if (!transceiver)
            throw new Error("new RTCRtpTransceiver not found");
          this._mapMidTransceiver.set(localId, transceiver);
          results.push({
            localId,
            track: transceiver.receiver.track,
            rtpReceiver: transceiver.receiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          this._remoteSdp.closeMediaSection(transceiver.mid);
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const localId of localIds) {
          this._mapMidTransceiver.delete(localId);
        }
      }
      async pauseReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("pauseReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "inactive";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("pauseReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async resumeReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("resumeReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "recvonly";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("resumeReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.receiver.getStats();
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation();
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({ localDtlsRole: "client", localSdpObject });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Firefox60 = Firefox60;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Safari12.js
var require_Safari12 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Safari12.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Safari12 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpUnifiedPlanUtils = __importStar(require_unifiedPlanUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("Safari12");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Safari12 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._mapMidTransceiver = /* @__PURE__ */ new Map();
        this._sendStream = new MediaStream();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Safari12();
      }
      get name() {
        return "Safari12";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require"
        });
        try {
          pc.addTransceiver("audio");
          pc.addTransceiver("video");
          const offer = await pc.createOffer();
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs, codec);
        const mediaSectionIdx = this._remoteSdp.getNextMediaSectionIdx();
        const transceiver = this._pc.addTransceiver(track, { direction: "sendonly", streams: [this._sendStream] });
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (encodings && encodings.length > 1) {
          logger.debug("send() | enabling legacy simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
          sdpUnifiedPlanUtils.addLegacySimulcast({
            offerMediaObject,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const localId = transceiver.mid;
        sendingRtpParameters.mid = localId;
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media[mediaSectionIdx.idx];
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpUnifiedPlanUtils.getRtpEncodings({ offerMediaObject });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8" || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/h264")) {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          reuseMid: mediaSectionIdx.reuseMid,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.set(localId, transceiver);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender: transceiver.sender
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.sender.replaceTrack(null);
        this._pc.removeTrack(transceiver.sender);
        this._remoteSdp.closeMediaSection(transceiver.mid);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        this._mapMidTransceiver.delete(localId);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
        this._assertSendDirection();
        logger.debug("pauseSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "inactive";
        const offer = await this._pc.createOffer();
        logger.debug("pauseSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
        this._assertSendDirection();
        logger.debug("resumeSending() [localId:%s]", localId);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        transceiver.direction = "sendonly";
        const offer = await this._pc.createOffer();
        logger.debug("resumeSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        await transceiver.sender.replaceTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await transceiver.sender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        const parameters = transceiver.sender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await transceiver.sender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.sender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        const mapLocalId = /* @__PURE__ */ new Map();
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const localId = rtpParameters.mid || String(this._mapMidTransceiver.size);
          mapLocalId.set(trackId, localId);
          this._remoteSdp.receive({
            mid: localId,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { trackId, rtpParameters } = options;
          const localId = mapLocalId.get(trackId);
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === localId);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { trackId } = options;
          const localId = mapLocalId.get(trackId);
          const transceiver = this._pc.getTransceivers().find((t) => t.mid === localId);
          if (!transceiver)
            throw new Error("new RTCRtpTransceiver not found");
          this._mapMidTransceiver.set(localId, transceiver);
          results.push({
            localId,
            track: transceiver.receiver.track,
            rtpReceiver: transceiver.receiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          this._remoteSdp.closeMediaSection(transceiver.mid);
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const localId of localIds) {
          this._mapMidTransceiver.delete(localId);
        }
      }
      async pauseReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("pauseReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "inactive";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("pauseReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("pauseReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async resumeReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("resumeReceiving() [localId:%s]", localId);
          const transceiver = this._mapMidTransceiver.get(localId);
          if (!transceiver)
            throw new Error("associated RTCRtpTransceiver not found");
          transceiver.direction = "recvonly";
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("resumeReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("resumeReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const transceiver = this._mapMidTransceiver.get(localId);
        if (!transceiver)
          throw new Error("associated RTCRtpTransceiver not found");
        return transceiver.receiver.getStats();
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation();
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Safari12 = Safari12;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Safari11.js
var require_Safari11 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Safari11.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Safari11 = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpPlanBUtils = __importStar(require_planBUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("Safari11");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var Safari11 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._sendStream = new MediaStream();
        this._mapSendLocalIdRtpSender = /* @__PURE__ */ new Map();
        this._nextSendLocalId = 0;
        this._mapRecvLocalIdInfo = /* @__PURE__ */ new Map();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Safari11();
      }
      get name() {
        return "Safari11";
      }
      close() {
        logger.debug("close()");
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b"
        });
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          planB: true
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (codec) {
          logger.warn("send() | codec selection is not available in %s handler", this.name);
        }
        this._sendStream.addTrack(track);
        this._pc.addTrack(track, this._sendStream);
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (track.kind === "video" && encodings && encodings.length > 1) {
          logger.debug("send() | enabling simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media.find((m) => m.type === "video");
          sdpPlanBUtils.addLegacySimulcast({
            offerMediaObject,
            track,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media.find((m) => m.type === track.kind);
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpPlanBUtils.getRtpEncodings({ offerMediaObject, track });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (sendingRtpParameters.encodings.length > 1 && sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8") {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        const localId = String(this._nextSendLocalId);
        this._nextSendLocalId++;
        const rtpSender = this._pc.getSenders().find((s) => s.track === track);
        this._mapSendLocalIdRtpSender.set(localId, rtpSender);
        return {
          localId,
          rtpParameters: sendingRtpParameters,
          rtpSender
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        if (rtpSender.track)
          this._sendStream.removeTrack(rtpSender.track);
        this._mapSendLocalIdRtpSender.delete(localId);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        try {
          await this._pc.setLocalDescription(offer);
        } catch (error) {
          if (this._sendStream.getTracks().length === 0) {
            logger.warn("stopSending() | ignoring expected error due no sending tracks: %s", error.toString());
            return;
          }
          throw error;
        }
        if (this._pc.signalingState === "stable")
          return;
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        this._assertSendDirection();
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const oldTrack = rtpSender.track;
        await rtpSender.replaceTrack(track);
        if (oldTrack)
          this._sendStream.removeTrack(oldTrack);
        if (track)
          this._sendStream.addTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        this._assertSendDirection();
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await rtpSender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        this._assertSendDirection();
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await rtpSender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        this._assertSendDirection();
        const rtpSender = this._mapSendLocalIdRtpSender.get(localId);
        if (!rtpSender)
          throw new Error("associated RTCRtpSender not found");
        return rtpSender.getStats();
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const mid = kind;
          this._remoteSdp.receive({
            mid,
            kind,
            offerRtpParameters: rtpParameters,
            streamId: rtpParameters.rtcp.cname,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { kind, rtpParameters } = options;
          const mid = kind;
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === mid);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { kind, trackId, rtpParameters } = options;
          const mid = kind;
          const localId = trackId;
          const rtpReceiver = this._pc.getReceivers().find((r) => r.track && r.track.id === localId);
          if (!rtpReceiver)
            throw new Error("new RTCRtpReceiver not");
          this._mapRecvLocalIdInfo.set(localId, { mid, rtpParameters, rtpReceiver });
          results.push({
            localId,
            track: rtpReceiver.track,
            rtpReceiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const { mid, rtpParameters } = this._mapRecvLocalIdInfo.get(localId) || {};
          this._mapRecvLocalIdInfo.delete(localId);
          this._remoteSdp.planBStopReceiving({ mid, offerRtpParameters: rtpParameters });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async getReceiverStats(localId) {
        this._assertRecvDirection();
        const { rtpReceiver } = this._mapRecvLocalIdInfo.get(localId) || {};
        if (!rtpReceiver)
          throw new Error("associated RTCRtpReceiver not found");
        return rtpReceiver.getStats();
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation({ oldDataChannelSpec: true });
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.Safari11 = Safari11;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/ortc/edgeUtils.js
var require_edgeUtils = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/ortc/edgeUtils.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mangleRtpParameters = exports.getCapabilities = void 0;
    var utils = __importStar(require_utils());
    function getCapabilities() {
      const nativeCaps = RTCRtpReceiver.getCapabilities();
      const caps = utils.clone(nativeCaps, {});
      for (const codec of caps.codecs) {
        codec.channels = codec.numChannels;
        delete codec.numChannels;
        codec.mimeType = codec.mimeType || `${codec.kind}/${codec.name}`;
        if (codec.parameters) {
          const parameters = codec.parameters;
          if (parameters.apt)
            parameters.apt = Number(parameters.apt);
          if (parameters["packetization-mode"])
            parameters["packetization-mode"] = Number(parameters["packetization-mode"]);
        }
        for (const feedback of codec.rtcpFeedback || []) {
          if (!feedback.parameter)
            feedback.parameter = "";
        }
      }
      return caps;
    }
    exports.getCapabilities = getCapabilities;
    function mangleRtpParameters(rtpParameters) {
      const params = utils.clone(rtpParameters, {});
      if (params.mid) {
        params.muxId = params.mid;
        delete params.mid;
      }
      for (const codec of params.codecs) {
        if (codec.channels) {
          codec.numChannels = codec.channels;
          delete codec.channels;
        }
        if (codec.mimeType && !codec.name)
          codec.name = codec.mimeType.split("/")[1];
        delete codec.mimeType;
      }
      return params;
    }
    exports.mangleRtpParameters = mangleRtpParameters;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/Edge11.js
var require_Edge11 = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/Edge11.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Edge11 = void 0;
    var Logger_1 = require_Logger();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var edgeUtils = __importStar(require_edgeUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var logger = new Logger_1.Logger("Edge11");
    var Edge11 = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._rtpSenders = /* @__PURE__ */ new Map();
        this._rtpReceivers = /* @__PURE__ */ new Map();
        this._nextSendLocalId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new Edge11();
      }
      get name() {
        return "Edge11";
      }
      close() {
        logger.debug("close()");
        try {
          this._iceGatherer.close();
        } catch (error) {
        }
        try {
          this._iceTransport.stop();
        } catch (error) {
        }
        try {
          this._dtlsTransport.stop();
        } catch (error) {
        }
        for (const rtpSender of this._rtpSenders.values()) {
          try {
            rtpSender.stop();
          } catch (error) {
          }
        }
        for (const rtpReceiver of this._rtpReceivers.values()) {
          try {
            rtpReceiver.stop();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        return edgeUtils.getCapabilities();
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: { OS: 0, MIS: 0 }
        };
      }
      run({
        direction,
        // eslint-disable-line @typescript-eslint/no-unused-vars
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        // eslint-disable-line @typescript-eslint/no-unused-vars
        iceServers,
        iceTransportPolicy,
        additionalSettings,
        // eslint-disable-line @typescript-eslint/no-unused-vars
        proprietaryConstraints,
        // eslint-disable-line @typescript-eslint/no-unused-vars
        extendedRtpCapabilities
      }) {
        logger.debug("run()");
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._remoteIceParameters = iceParameters;
        this._remoteIceCandidates = iceCandidates;
        this._remoteDtlsParameters = dtlsParameters;
        this._cname = `CNAME-${utils.generateRandomNumber()}`;
        this._setIceGatherer({ iceServers, iceTransportPolicy });
        this._setIceTransport();
        this._setDtlsTransport();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async updateIceServers(iceServers) {
        throw new errors_1.UnsupportedError("not supported");
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteIceParameters = iceParameters;
        if (!this._transportReady)
          return;
        logger.debug("restartIce() | calling iceTransport.start()");
        this._iceTransport.start(this._iceGatherer, iceParameters, "controlling");
        for (const candidate of this._remoteIceCandidates) {
          this._iceTransport.addRemoteCandidate(candidate);
        }
        this._iceTransport.addRemoteCandidate({});
      }
      async getTransportStats() {
        return this._iceTransport.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (!this._transportReady)
          await this._setupTransport({ localDtlsRole: "server" });
        logger.debug("send() | calling new RTCRtpSender()");
        const rtpSender = new RTCRtpSender(track, this._dtlsTransport);
        const rtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        rtpParameters.codecs = ortc.reduceCodecs(rtpParameters.codecs, codec);
        const useRtx = rtpParameters.codecs.some((_codec) => /.+\/rtx$/i.test(_codec.mimeType));
        if (!encodings)
          encodings = [{}];
        for (const encoding of encodings) {
          encoding.ssrc = utils.generateRandomNumber();
          if (useRtx)
            encoding.rtx = { ssrc: utils.generateRandomNumber() };
        }
        rtpParameters.encodings = encodings;
        rtpParameters.rtcp = {
          cname: this._cname,
          reducedSize: true,
          mux: true
        };
        const edgeRtpParameters = edgeUtils.mangleRtpParameters(rtpParameters);
        logger.debug("send() | calling rtpSender.send() [params:%o]", edgeRtpParameters);
        await rtpSender.send(edgeRtpParameters);
        const localId = String(this._nextSendLocalId);
        this._nextSendLocalId++;
        this._rtpSenders.set(localId, rtpSender);
        return { localId, rtpParameters, rtpSender };
      }
      async stopSending(localId) {
        logger.debug("stopSending() [localId:%s]", localId);
        const rtpSender = this._rtpSenders.get(localId);
        if (!rtpSender)
          throw new Error("RTCRtpSender not found");
        this._rtpSenders.delete(localId);
        try {
          logger.debug("stopSending() | calling rtpSender.stop()");
          rtpSender.stop();
        } catch (error) {
          logger.warn("stopSending() | rtpSender.stop() failed:%o", error);
          throw error;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        if (track) {
          logger.debug("replaceTrack() [localId:%s, track.id:%s]", localId, track.id);
        } else {
          logger.debug("replaceTrack() [localId:%s, no track]", localId);
        }
        const rtpSender = this._rtpSenders.get(localId);
        if (!rtpSender)
          throw new Error("RTCRtpSender not found");
        rtpSender.setTrack(track);
      }
      async setMaxSpatialLayer(localId, spatialLayer) {
        logger.debug("setMaxSpatialLayer() [localId:%s, spatialLayer:%s]", localId, spatialLayer);
        const rtpSender = this._rtpSenders.get(localId);
        if (!rtpSender)
          throw new Error("RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          if (idx <= spatialLayer)
            encoding.active = true;
          else
            encoding.active = false;
        });
        await rtpSender.setParameters(parameters);
      }
      async setRtpEncodingParameters(localId, params) {
        logger.debug("setRtpEncodingParameters() [localId:%s, params:%o]", localId, params);
        const rtpSender = this._rtpSenders.get(localId);
        if (!rtpSender)
          throw new Error("RTCRtpSender not found");
        const parameters = rtpSender.getParameters();
        parameters.encodings.forEach((encoding, idx) => {
          parameters.encodings[idx] = { ...encoding, ...params };
        });
        await rtpSender.setParameters(parameters);
      }
      async getSenderStats(localId) {
        const rtpSender = this._rtpSenders.get(localId);
        if (!rtpSender)
          throw new Error("RTCRtpSender not found");
        return rtpSender.getStats();
      }
      async sendDataChannel(options) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      async receive(optionsList) {
        const results = [];
        for (const options of optionsList) {
          const { trackId, kind } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
        }
        if (!this._transportReady)
          await this._setupTransport({ localDtlsRole: "server" });
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() | calling new RTCRtpReceiver()");
          const rtpReceiver = new RTCRtpReceiver(this._dtlsTransport, kind);
          rtpReceiver.addEventListener("error", (event) => {
            logger.error('rtpReceiver "error" event [event:%o]', event);
          });
          const edgeRtpParameters = edgeUtils.mangleRtpParameters(rtpParameters);
          logger.debug("receive() | calling rtpReceiver.receive() [params:%o]", edgeRtpParameters);
          await rtpReceiver.receive(edgeRtpParameters);
          const localId = trackId;
          this._rtpReceivers.set(localId, rtpReceiver);
          results.push({
            localId,
            track: rtpReceiver.track,
            rtpReceiver
          });
        }
        return results;
      }
      async stopReceiving(localIds) {
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const rtpReceiver = this._rtpReceivers.get(localId);
          if (!rtpReceiver)
            throw new Error("RTCRtpReceiver not found");
          this._rtpReceivers.delete(localId);
          try {
            logger.debug("stopReceiving() | calling rtpReceiver.stop()");
            rtpReceiver.stop();
          } catch (error) {
            logger.warn("stopReceiving() | rtpReceiver.stop() failed:%o", error);
          }
        }
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      async getReceiverStats(localId) {
        const rtpReceiver = this._rtpReceivers.get(localId);
        if (!rtpReceiver)
          throw new Error("RTCRtpReceiver not found");
        return rtpReceiver.getStats();
      }
      async receiveDataChannel(options) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      _setIceGatherer({ iceServers, iceTransportPolicy }) {
        const iceGatherer = new RTCIceGatherer({
          iceServers: iceServers || [],
          gatherPolicy: iceTransportPolicy || "all"
        });
        iceGatherer.addEventListener("error", (event) => {
          logger.error('iceGatherer "error" event [event:%o]', event);
        });
        try {
          iceGatherer.gather();
        } catch (error) {
          logger.debug("_setIceGatherer() | iceGatherer.gather() failed: %s", error.toString());
        }
        this._iceGatherer = iceGatherer;
      }
      _setIceTransport() {
        const iceTransport = new RTCIceTransport(this._iceGatherer);
        iceTransport.addEventListener("statechange", () => {
          switch (iceTransport.state) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
        iceTransport.addEventListener("icestatechange", () => {
          switch (iceTransport.state) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
        iceTransport.addEventListener("candidatepairchange", (event) => {
          logger.debug('iceTransport "candidatepairchange" event [pair:%o]', event.pair);
        });
        this._iceTransport = iceTransport;
      }
      _setDtlsTransport() {
        const dtlsTransport = new RTCDtlsTransport(this._iceTransport);
        dtlsTransport.addEventListener("statechange", () => {
          logger.debug('dtlsTransport "statechange" event [state:%s]', dtlsTransport.state);
        });
        dtlsTransport.addEventListener("dtlsstatechange", () => {
          logger.debug('dtlsTransport "dtlsstatechange" event [state:%s]', dtlsTransport.state);
          if (dtlsTransport.state === "closed")
            this.emit("@connectionstatechange", "closed");
        });
        dtlsTransport.addEventListener("error", (event) => {
          logger.error('dtlsTransport "error" event [event:%o]', event);
        });
        this._dtlsTransport = dtlsTransport;
      }
      async _setupTransport({ localDtlsRole }) {
        logger.debug("_setupTransport()");
        const dtlsParameters = this._dtlsTransport.getLocalParameters();
        dtlsParameters.role = localDtlsRole;
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._iceTransport.start(this._iceGatherer, this._remoteIceParameters, "controlling");
        for (const candidate of this._remoteIceCandidates) {
          this._iceTransport.addRemoteCandidate(candidate);
        }
        this._iceTransport.addRemoteCandidate({});
        this._remoteDtlsParameters.fingerprints = this._remoteDtlsParameters.fingerprints.filter((fingerprint) => {
          return fingerprint.algorithm === "sha-256" || fingerprint.algorithm === "sha-384" || fingerprint.algorithm === "sha-512";
        });
        this._dtlsTransport.start(this._remoteDtlsParameters);
        this._transportReady = true;
      }
    };
    exports.Edge11 = Edge11;
  }
});

// ../../node_modules/mediasoup-client/lib/handlers/ReactNative.js
var require_ReactNative = __commonJS({
  "../../node_modules/mediasoup-client/lib/handlers/ReactNative.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReactNative = void 0;
    var sdpTransform = __importStar(require_lib2());
    var Logger_1 = require_Logger();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var sdpCommonUtils = __importStar(require_commonUtils());
    var sdpPlanBUtils = __importStar(require_planBUtils());
    var HandlerInterface_1 = require_HandlerInterface();
    var RemoteSdp_1 = require_RemoteSdp();
    var logger = new Logger_1.Logger("ReactNative");
    var SCTP_NUM_STREAMS = { OS: 1024, MIS: 1024 };
    var ReactNative = class extends HandlerInterface_1.HandlerInterface {
      constructor() {
        super();
        this._sendStream = new MediaStream();
        this._mapSendLocalIdTrack = /* @__PURE__ */ new Map();
        this._nextSendLocalId = 0;
        this._mapRecvLocalIdInfo = /* @__PURE__ */ new Map();
        this._hasDataChannelMediaSection = false;
        this._nextSendSctpStreamId = 0;
        this._transportReady = false;
      }
      /**
       * Creates a factory function.
       */
      static createFactory() {
        return () => new ReactNative();
      }
      get name() {
        return "ReactNative";
      }
      close() {
        logger.debug("close()");
        this._sendStream.release(
          /* releaseTracks */
          false
        );
        if (this._pc) {
          try {
            this._pc.close();
          } catch (error) {
          }
        }
        this.emit("@close");
      }
      async getNativeRtpCapabilities() {
        logger.debug("getNativeRtpCapabilities()");
        const pc = new RTCPeerConnection({
          iceServers: [],
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b"
        });
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          try {
            pc.close();
          } catch (error) {
          }
          const sdpObject = sdpTransform.parse(offer.sdp);
          const nativeRtpCapabilities = sdpCommonUtils.extractRtpCapabilities({ sdpObject });
          return nativeRtpCapabilities;
        } catch (error) {
          try {
            pc.close();
          } catch (error2) {
          }
          throw error;
        }
      }
      async getNativeSctpCapabilities() {
        logger.debug("getNativeSctpCapabilities()");
        return {
          numStreams: SCTP_NUM_STREAMS
        };
      }
      run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, extendedRtpCapabilities }) {
        logger.debug("run()");
        this._direction = direction;
        this._remoteSdp = new RemoteSdp_1.RemoteSdp({
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          planB: true
        });
        this._sendingRtpParametersByKind = {
          audio: ortc.getSendingRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRtpParameters("video", extendedRtpCapabilities)
        };
        this._sendingRemoteRtpParametersByKind = {
          audio: ortc.getSendingRemoteRtpParameters("audio", extendedRtpCapabilities),
          video: ortc.getSendingRemoteRtpParameters("video", extendedRtpCapabilities)
        };
        if (dtlsParameters.role && dtlsParameters.role !== "auto") {
          this._forcedLocalDtlsRole = dtlsParameters.role === "server" ? "client" : "server";
        }
        this._pc = new RTCPeerConnection({
          iceServers: iceServers || [],
          iceTransportPolicy: iceTransportPolicy || "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          sdpSemantics: "plan-b",
          ...additionalSettings
        }, proprietaryConstraints);
        this._pc.addEventListener("iceconnectionstatechange", () => {
          switch (this._pc.iceConnectionState) {
            case "checking":
              this.emit("@connectionstatechange", "connecting");
              break;
            case "connected":
            case "completed":
              this.emit("@connectionstatechange", "connected");
              break;
            case "failed":
              this.emit("@connectionstatechange", "failed");
              break;
            case "disconnected":
              this.emit("@connectionstatechange", "disconnected");
              break;
            case "closed":
              this.emit("@connectionstatechange", "closed");
              break;
          }
        });
      }
      async updateIceServers(iceServers) {
        logger.debug("updateIceServers()");
        const configuration = this._pc.getConfiguration();
        configuration.iceServers = iceServers;
        this._pc.setConfiguration(configuration);
      }
      async restartIce(iceParameters) {
        logger.debug("restartIce()");
        this._remoteSdp.updateIceParameters(iceParameters);
        if (!this._transportReady)
          return;
        if (this._direction === "send") {
          const offer = await this._pc.createOffer({ iceRestart: true });
          logger.debug("restartIce() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
        } else {
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("restartIce() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          logger.debug("restartIce() | calling pc.setLocalDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
        }
      }
      async getTransportStats() {
        return this._pc.getStats();
      }
      async send({ track, encodings, codecOptions, codec }) {
        var _a;
        this._assertSendDirection();
        logger.debug("send() [kind:%s, track.id:%s]", track.kind, track.id);
        if (codec) {
          logger.warn("send() | codec selection is not available in %s handler", this.name);
        }
        this._sendStream.addTrack(track);
        this._pc.addStream(this._sendStream);
        let offer = await this._pc.createOffer();
        let localSdpObject = sdpTransform.parse(offer.sdp);
        let offerMediaObject;
        const sendingRtpParameters = utils.clone(this._sendingRtpParametersByKind[track.kind], {});
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs);
        const sendingRemoteRtpParameters = utils.clone(this._sendingRemoteRtpParametersByKind[track.kind], {});
        sendingRemoteRtpParameters.codecs = ortc.reduceCodecs(sendingRemoteRtpParameters.codecs);
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        if (track.kind === "video" && encodings && encodings.length > 1) {
          logger.debug("send() | enabling simulcast");
          localSdpObject = sdpTransform.parse(offer.sdp);
          offerMediaObject = localSdpObject.media.find((m) => m.type === "video");
          sdpPlanBUtils.addLegacySimulcast({
            offerMediaObject,
            track,
            numStreams: encodings.length
          });
          offer = { type: "offer", sdp: sdpTransform.write(localSdpObject) };
        }
        logger.debug("send() | calling pc.setLocalDescription() [offer:%o]", offer);
        await this._pc.setLocalDescription(offer);
        localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        offerMediaObject = localSdpObject.media.find((m) => m.type === track.kind);
        sendingRtpParameters.rtcp.cname = sdpCommonUtils.getCname({ offerMediaObject });
        sendingRtpParameters.encodings = sdpPlanBUtils.getRtpEncodings({ offerMediaObject, track });
        if (encodings) {
          for (let idx = 0; idx < sendingRtpParameters.encodings.length; ++idx) {
            if (encodings[idx])
              Object.assign(sendingRtpParameters.encodings[idx], encodings[idx]);
          }
        }
        if (sendingRtpParameters.encodings.length > 1 && (sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/vp8" || sendingRtpParameters.codecs[0].mimeType.toLowerCase() === "video/h264")) {
          for (const encoding of sendingRtpParameters.encodings) {
            encoding.scalabilityMode = "S1T3";
          }
        }
        this._remoteSdp.send({
          offerMediaObject,
          offerRtpParameters: sendingRtpParameters,
          answerRtpParameters: sendingRemoteRtpParameters,
          codecOptions
        });
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("send() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
        const localId = String(this._nextSendLocalId);
        this._nextSendLocalId++;
        this._mapSendLocalIdTrack.set(localId, track);
        return {
          localId,
          rtpParameters: sendingRtpParameters
        };
      }
      async stopSending(localId) {
        this._assertSendDirection();
        logger.debug("stopSending() [localId:%s]", localId);
        const track = this._mapSendLocalIdTrack.get(localId);
        if (!track)
          throw new Error("track not found");
        this._mapSendLocalIdTrack.delete(localId);
        this._sendStream.removeTrack(track);
        this._pc.addStream(this._sendStream);
        const offer = await this._pc.createOffer();
        logger.debug("stopSending() | calling pc.setLocalDescription() [offer:%o]", offer);
        try {
          await this._pc.setLocalDescription(offer);
        } catch (error) {
          if (this._sendStream.getTracks().length === 0) {
            logger.warn("stopSending() | ignoring expected error due no sending tracks: %s", error.toString());
            return;
          }
          throw error;
        }
        if (this._pc.signalingState === "stable")
          return;
        const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopSending() | calling pc.setRemoteDescription() [answer:%o]", answer);
        await this._pc.setRemoteDescription(answer);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async pauseSending(localId) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async resumeSending(localId) {
      }
      async replaceTrack(localId, track) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async setMaxSpatialLayer(localId, spatialLayer) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async setRtpEncodingParameters(localId, params) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async getSenderStats(localId) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol }) {
        var _a;
        this._assertSendDirection();
        const options = {
          negotiated: true,
          id: this._nextSendSctpStreamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("sendDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        this._nextSendSctpStreamId = ++this._nextSendSctpStreamId % SCTP_NUM_STREAMS.MIS;
        if (!this._hasDataChannelMediaSection) {
          const offer = await this._pc.createOffer();
          const localSdpObject = sdpTransform.parse(offer.sdp);
          const offerMediaObject = localSdpObject.media.find((m) => m.type === "application");
          if (!this._transportReady) {
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("sendDataChannel() | calling pc.setLocalDescription() [offer:%o]", offer);
          await this._pc.setLocalDescription(offer);
          this._remoteSdp.sendSctpAssociation({ offerMediaObject });
          const answer = { type: "answer", sdp: this._remoteSdp.getSdp() };
          logger.debug("sendDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setRemoteDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        const sctpStreamParameters = {
          streamId: options.id,
          ordered: options.ordered,
          maxPacketLifeTime: options.maxPacketLifeTime,
          maxRetransmits: options.maxRetransmits
        };
        return { dataChannel, sctpStreamParameters };
      }
      async receive(optionsList) {
        var _a;
        this._assertRecvDirection();
        const results = [];
        const mapStreamId = /* @__PURE__ */ new Map();
        for (const options of optionsList) {
          const { trackId, kind, rtpParameters } = options;
          logger.debug("receive() [trackId:%s, kind:%s]", trackId, kind);
          const mid = kind;
          let streamId = rtpParameters.rtcp.cname;
          logger.debug("receive() | forcing a random remote streamId to avoid well known bug in react-native-webrtc");
          streamId += `-hack-${utils.generateRandomNumber()}`;
          mapStreamId.set(trackId, streamId);
          this._remoteSdp.receive({
            mid,
            kind,
            offerRtpParameters: rtpParameters,
            streamId,
            trackId
          });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("receive() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        let answer = await this._pc.createAnswer();
        const localSdpObject = sdpTransform.parse(answer.sdp);
        for (const options of optionsList) {
          const { kind, rtpParameters } = options;
          const mid = kind;
          const answerMediaObject = localSdpObject.media.find((m) => String(m.mid) === mid);
          sdpCommonUtils.applyCodecParameters({
            offerRtpParameters: rtpParameters,
            answerMediaObject
          });
        }
        answer = { type: "answer", sdp: sdpTransform.write(localSdpObject) };
        if (!this._transportReady) {
          await this._setupTransport({
            localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
            localSdpObject
          });
        }
        logger.debug("receive() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
        for (const options of optionsList) {
          const { kind, trackId, rtpParameters } = options;
          const localId = trackId;
          const mid = kind;
          const streamId = mapStreamId.get(trackId);
          const stream = this._pc.getRemoteStreams().find((s) => s.id === streamId);
          const track = stream.getTrackById(localId);
          if (!track)
            throw new Error("remote track not found");
          this._mapRecvLocalIdInfo.set(localId, { mid, rtpParameters });
          results.push({ localId, track });
        }
        return results;
      }
      async stopReceiving(localIds) {
        this._assertRecvDirection();
        for (const localId of localIds) {
          logger.debug("stopReceiving() [localId:%s]", localId);
          const { mid, rtpParameters } = this._mapRecvLocalIdInfo.get(localId) || {};
          this._mapRecvLocalIdInfo.delete(localId);
          this._remoteSdp.planBStopReceiving({ mid, offerRtpParameters: rtpParameters });
        }
        const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
        logger.debug("stopReceiving() | calling pc.setRemoteDescription() [offer:%o]", offer);
        await this._pc.setRemoteDescription(offer);
        const answer = await this._pc.createAnswer();
        logger.debug("stopReceiving() | calling pc.setLocalDescription() [answer:%o]", answer);
        await this._pc.setLocalDescription(answer);
      }
      async pauseReceiving(localIds) {
      }
      async resumeReceiving(localIds) {
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async getReceiverStats(localId) {
        throw new errors_1.UnsupportedError("not implemented");
      }
      async receiveDataChannel({ sctpStreamParameters, label, protocol }) {
        var _a;
        this._assertRecvDirection();
        const { streamId, ordered, maxPacketLifeTime, maxRetransmits } = sctpStreamParameters;
        const options = {
          negotiated: true,
          id: streamId,
          ordered,
          maxPacketLifeTime,
          maxRetransmitTime: maxPacketLifeTime,
          maxRetransmits,
          protocol
        };
        logger.debug("receiveDataChannel() [options:%o]", options);
        const dataChannel = this._pc.createDataChannel(label, options);
        if (!this._hasDataChannelMediaSection) {
          this._remoteSdp.receiveSctpAssociation({ oldDataChannelSpec: true });
          const offer = { type: "offer", sdp: this._remoteSdp.getSdp() };
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [offer:%o]", offer);
          await this._pc.setRemoteDescription(offer);
          const answer = await this._pc.createAnswer();
          if (!this._transportReady) {
            const localSdpObject = sdpTransform.parse(answer.sdp);
            await this._setupTransport({
              localDtlsRole: (_a = this._forcedLocalDtlsRole) !== null && _a !== void 0 ? _a : "client",
              localSdpObject
            });
          }
          logger.debug("receiveDataChannel() | calling pc.setRemoteDescription() [answer:%o]", answer);
          await this._pc.setLocalDescription(answer);
          this._hasDataChannelMediaSection = true;
        }
        return { dataChannel };
      }
      async _setupTransport({ localDtlsRole, localSdpObject }) {
        if (!localSdpObject)
          localSdpObject = sdpTransform.parse(this._pc.localDescription.sdp);
        const dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject });
        dtlsParameters.role = localDtlsRole;
        this._remoteSdp.updateDtlsRole(localDtlsRole === "client" ? "server" : "client");
        await new Promise((resolve, reject) => {
          this.safeEmit("@connect", { dtlsParameters }, resolve, reject);
        });
        this._transportReady = true;
      }
      _assertSendDirection() {
        if (this._direction !== "send") {
          throw new Error('method can just be called for handlers with "send" direction');
        }
      }
      _assertRecvDirection() {
        if (this._direction !== "recv") {
          throw new Error('method can just be called for handlers with "recv" direction');
        }
      }
    };
    exports.ReactNative = ReactNative;
  }
});

// ../../node_modules/mediasoup-client/lib/Device.js
var require_Device = __commonJS({
  "../../node_modules/mediasoup-client/lib/Device.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Device = exports.detectDevice = void 0;
    var bowser_1 = __importDefault(require_es5());
    var Logger_1 = require_Logger();
    var EnhancedEventEmitter_1 = require_EnhancedEventEmitter();
    var errors_1 = require_errors();
    var utils = __importStar(require_utils());
    var ortc = __importStar(require_ortc());
    var Transport_1 = require_Transport();
    var Chrome74_1 = require_Chrome74();
    var Chrome70_1 = require_Chrome70();
    var Chrome67_1 = require_Chrome67();
    var Chrome55_1 = require_Chrome55();
    var Firefox60_1 = require_Firefox60();
    var Safari12_1 = require_Safari12();
    var Safari11_1 = require_Safari11();
    var Edge11_1 = require_Edge11();
    var ReactNative_1 = require_ReactNative();
    var logger = new Logger_1.Logger("Device");
    function detectDevice() {
      if (typeof navigator === "object" && navigator.product === "ReactNative") {
        if (typeof RTCPeerConnection === "undefined") {
          logger.warn("this._detectDevice() | unsupported ReactNative without RTCPeerConnection");
          return void 0;
        }
        logger.debug("this._detectDevice() | ReactNative handler chosen");
        return "ReactNative";
      } else if (typeof navigator === "object" && typeof navigator.userAgent === "string") {
        const ua = navigator.userAgent;
        const browser = bowser_1.default.getParser(ua);
        const engine = browser.getEngine();
        if (browser.satisfies({ chrome: ">=74", chromium: ">=74", "microsoft edge": ">=88" })) {
          return "Chrome74";
        } else if (browser.satisfies({ chrome: ">=70", chromium: ">=70" })) {
          return "Chrome70";
        } else if (browser.satisfies({ chrome: ">=67", chromium: ">=67" })) {
          return "Chrome67";
        } else if (browser.satisfies({ chrome: ">=55", chromium: ">=55" })) {
          return "Chrome55";
        } else if (browser.satisfies({ firefox: ">=60" })) {
          return "Firefox60";
        } else if (browser.satisfies({ ios: { OS: ">=14.3", firefox: ">=30.0" } })) {
          return "Safari12";
        } else if (browser.satisfies({ safari: ">=12.0" }) && typeof RTCRtpTransceiver !== "undefined" && RTCRtpTransceiver.prototype.hasOwnProperty("currentDirection")) {
          return "Safari12";
        } else if (browser.satisfies({ safari: ">=11" })) {
          return "Safari11";
        } else if (browser.satisfies({ "microsoft edge": ">=11" }) && browser.satisfies({ "microsoft edge": "<=18" })) {
          return "Edge11";
        } else if (engine.name && engine.name.toLowerCase() === "blink") {
          const match = ua.match(/(?:(?:Chrome|Chromium))[ /](\w+)/i);
          if (match) {
            const version = Number(match[1]);
            if (version >= 74) {
              return "Chrome74";
            } else if (version >= 70) {
              return "Chrome70";
            } else if (version >= 67) {
              return "Chrome67";
            } else {
              return "Chrome55";
            }
          } else {
            return "Chrome74";
          }
        } else {
          logger.warn("this._detectDevice() | browser not supported [name:%s, version:%s]", browser.getBrowserName(), browser.getBrowserVersion());
          return void 0;
        }
      } else {
        logger.warn("this._detectDevice() | unknown device");
        return void 0;
      }
    }
    exports.detectDevice = detectDevice;
    var Device = class {
      /**
       * Create a new Device to connect to mediasoup server.
       *
       * @throws {UnsupportedError} if device is not supported.
       */
      constructor({ handlerName, handlerFactory, Handler } = {}) {
        this._loaded = false;
        this._observer = new EnhancedEventEmitter_1.EnhancedEventEmitter();
        logger.debug("constructor()");
        if (Handler) {
          logger.warn("constructor() | Handler option is DEPRECATED, use handlerName or handlerFactory instead");
          if (typeof Handler === "string")
            handlerName = Handler;
          else
            throw new TypeError("non string Handler option no longer supported, use handlerFactory instead");
        }
        if (handlerName && handlerFactory) {
          throw new TypeError("just one of handlerName or handlerInterface can be given");
        }
        if (handlerFactory) {
          this._handlerFactory = handlerFactory;
        } else {
          if (handlerName) {
            logger.debug("constructor() | handler given: %s", handlerName);
          } else {
            handlerName = detectDevice();
            if (handlerName)
              logger.debug("constructor() | detected handler: %s", handlerName);
            else
              throw new errors_1.UnsupportedError("device not supported");
          }
          switch (handlerName) {
            case "Chrome74":
              this._handlerFactory = Chrome74_1.Chrome74.createFactory();
              break;
            case "Chrome70":
              this._handlerFactory = Chrome70_1.Chrome70.createFactory();
              break;
            case "Chrome67":
              this._handlerFactory = Chrome67_1.Chrome67.createFactory();
              break;
            case "Chrome55":
              this._handlerFactory = Chrome55_1.Chrome55.createFactory();
              break;
            case "Firefox60":
              this._handlerFactory = Firefox60_1.Firefox60.createFactory();
              break;
            case "Safari12":
              this._handlerFactory = Safari12_1.Safari12.createFactory();
              break;
            case "Safari11":
              this._handlerFactory = Safari11_1.Safari11.createFactory();
              break;
            case "Edge11":
              this._handlerFactory = Edge11_1.Edge11.createFactory();
              break;
            case "ReactNative":
              this._handlerFactory = ReactNative_1.ReactNative.createFactory();
              break;
            default:
              throw new TypeError(`unknown handlerName "${handlerName}"`);
          }
        }
        const handler = this._handlerFactory();
        this._handlerName = handler.name;
        handler.close();
        this._extendedRtpCapabilities = void 0;
        this._recvRtpCapabilities = void 0;
        this._canProduceByKind = {
          audio: false,
          video: false
        };
        this._sctpCapabilities = void 0;
      }
      /**
       * The RTC handler name.
       */
      get handlerName() {
        return this._handlerName;
      }
      /**
       * Whether the Device is loaded.
       */
      get loaded() {
        return this._loaded;
      }
      /**
       * RTP capabilities of the Device for receiving media.
       *
       * @throws {InvalidStateError} if not loaded.
       */
      get rtpCapabilities() {
        if (!this._loaded)
          throw new errors_1.InvalidStateError("not loaded");
        return this._recvRtpCapabilities;
      }
      /**
       * SCTP capabilities of the Device.
       *
       * @throws {InvalidStateError} if not loaded.
       */
      get sctpCapabilities() {
        if (!this._loaded)
          throw new errors_1.InvalidStateError("not loaded");
        return this._sctpCapabilities;
      }
      get observer() {
        return this._observer;
      }
      /**
       * Initialize the Device.
       */
      async load({ routerRtpCapabilities }) {
        logger.debug("load() [routerRtpCapabilities:%o]", routerRtpCapabilities);
        routerRtpCapabilities = utils.clone(routerRtpCapabilities, void 0);
        let handler;
        try {
          if (this._loaded)
            throw new errors_1.InvalidStateError("already loaded");
          ortc.validateRtpCapabilities(routerRtpCapabilities);
          handler = this._handlerFactory();
          const nativeRtpCapabilities = await handler.getNativeRtpCapabilities();
          logger.debug("load() | got native RTP capabilities:%o", nativeRtpCapabilities);
          ortc.validateRtpCapabilities(nativeRtpCapabilities);
          this._extendedRtpCapabilities = ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, routerRtpCapabilities);
          logger.debug("load() | got extended RTP capabilities:%o", this._extendedRtpCapabilities);
          this._canProduceByKind.audio = ortc.canSend("audio", this._extendedRtpCapabilities);
          this._canProduceByKind.video = ortc.canSend("video", this._extendedRtpCapabilities);
          this._recvRtpCapabilities = ortc.getRecvRtpCapabilities(this._extendedRtpCapabilities);
          ortc.validateRtpCapabilities(this._recvRtpCapabilities);
          logger.debug("load() | got receiving RTP capabilities:%o", this._recvRtpCapabilities);
          this._sctpCapabilities = await handler.getNativeSctpCapabilities();
          logger.debug("load() | got native SCTP capabilities:%o", this._sctpCapabilities);
          ortc.validateSctpCapabilities(this._sctpCapabilities);
          logger.debug("load() succeeded");
          this._loaded = true;
          handler.close();
        } catch (error) {
          if (handler)
            handler.close();
          throw error;
        }
      }
      /**
       * Whether we can produce audio/video.
       *
       * @throws {InvalidStateError} if not loaded.
       * @throws {TypeError} if wrong arguments.
       */
      canProduce(kind) {
        if (!this._loaded)
          throw new errors_1.InvalidStateError("not loaded");
        else if (kind !== "audio" && kind !== "video")
          throw new TypeError(`invalid kind "${kind}"`);
        return this._canProduceByKind[kind];
      }
      /**
       * Creates a Transport for sending media.
       *
       * @throws {InvalidStateError} if not loaded.
       * @throws {TypeError} if wrong arguments.
       */
      createSendTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        logger.debug("createSendTransport()");
        return this._createTransport({
          direction: "send",
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          iceServers,
          iceTransportPolicy,
          additionalSettings,
          proprietaryConstraints,
          appData
        });
      }
      /**
       * Creates a Transport for receiving media.
       *
       * @throws {InvalidStateError} if not loaded.
       * @throws {TypeError} if wrong arguments.
       */
      createRecvTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        logger.debug("createRecvTransport()");
        return this._createTransport({
          direction: "recv",
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          iceServers,
          iceTransportPolicy,
          additionalSettings,
          proprietaryConstraints,
          appData
        });
      }
      _createTransport({ direction, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, proprietaryConstraints, appData }) {
        if (!this._loaded)
          throw new errors_1.InvalidStateError("not loaded");
        else if (typeof id !== "string")
          throw new TypeError("missing id");
        else if (typeof iceParameters !== "object")
          throw new TypeError("missing iceParameters");
        else if (!Array.isArray(iceCandidates))
          throw new TypeError("missing iceCandidates");
        else if (typeof dtlsParameters !== "object")
          throw new TypeError("missing dtlsParameters");
        else if (sctpParameters && typeof sctpParameters !== "object")
          throw new TypeError("wrong sctpParameters");
        else if (appData && typeof appData !== "object")
          throw new TypeError("if given, appData must be an object");
        const transport = new Transport_1.Transport({
          direction,
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
          iceServers,
          iceTransportPolicy,
          additionalSettings,
          proprietaryConstraints,
          appData,
          handlerFactory: this._handlerFactory,
          extendedRtpCapabilities: this._extendedRtpCapabilities,
          canProduceByKind: this._canProduceByKind
        });
        this._observer.safeEmit("newtransport", transport);
        return transport;
      }
    };
    exports.Device = Device;
  }
});

// ../../node_modules/mediasoup-client/lib/RtpParameters.js
var require_RtpParameters = __commonJS({
  "../../node_modules/mediasoup-client/lib/RtpParameters.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../../node_modules/mediasoup-client/lib/SctpParameters.js
var require_SctpParameters = __commonJS({
  "../../node_modules/mediasoup-client/lib/SctpParameters.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../../node_modules/mediasoup-client/lib/types.js
var require_types = __commonJS({
  "../../node_modules/mediasoup-client/lib/types.js"(exports) {
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
    __exportStar(require_Device(), exports);
    __exportStar(require_Transport(), exports);
    __exportStar(require_Producer(), exports);
    __exportStar(require_Consumer(), exports);
    __exportStar(require_DataProducer(), exports);
    __exportStar(require_DataConsumer(), exports);
    __exportStar(require_RtpParameters(), exports);
    __exportStar(require_SctpParameters(), exports);
    __exportStar(require_HandlerInterface(), exports);
    __exportStar(require_errors(), exports);
  }
});

// ../../node_modules/mediasoup-client/lib/index.js
var require_lib3 = __commonJS({
  "../../node_modules/mediasoup-client/lib/index.js"(exports) {
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
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.debug = exports.parseScalabilityMode = exports.detectDevice = exports.Device = exports.version = exports.types = void 0;
    var debug_1 = __importDefault(require_browser());
    exports.debug = debug_1.default;
    var Device_1 = require_Device();
    Object.defineProperty(exports, "Device", { enumerable: true, get: function() {
      return Device_1.Device;
    } });
    Object.defineProperty(exports, "detectDevice", { enumerable: true, get: function() {
      return Device_1.detectDevice;
    } });
    var types = __importStar(require_types());
    exports.types = types;
    exports.version = "3.6.57";
    var scalabilityModes_1 = require_scalabilityModes();
    Object.defineProperty(exports, "parseScalabilityMode", { enumerable: true, get: function() {
      return scalabilityModes_1.parse;
    } });
  }
});
export default require_lib3();
//# sourceMappingURL=mediasoup-client.js.map
