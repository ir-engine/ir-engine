import {
  __commonJS,
  __require
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/primus-client/index.js
var require_primus_client = __commonJS({
  "../../node_modules/primus-client/index.js"(exports, module) {
    (function UMDish(name, context, definition, plugins) {
      context[name] = definition.call(context);
      for (let i = 0; i < plugins.length; i++) {
        plugins[i](context[name]);
      }
      if (typeof module !== "undefined" && module.exports) {
        module.exports = context[name];
      } else if (typeof define === "function" && define.amd) {
        define(function reference() {
          return context[name];
        });
      }
    })(
      "Primus",
      exports || {},
      function wrapper() {
        let define2;
        let module2;
        let exports2;
        const Primus = function() {
          function r(e, n, t) {
            function o(i2, f) {
              if (!n[i2]) {
                if (!e[i2]) {
                  const c = typeof __require === "function" && __require;
                  if (!f && c)
                    return c(i2, true);
                  if (u)
                    return u(i2, true);
                  const a = new Error(`Cannot find module '${i2}'`);
                  throw a.code = "MODULE_NOT_FOUND", a;
                }
                const p = n[i2] = { exports: {} };
                e[i2][0].call(p.exports, function(r2) {
                  const n2 = e[i2][1][r2];
                  return o(n2 || r2);
                }, p, p.exports, r, e, n, t);
              }
              return n[i2].exports;
            }
            for (var u = typeof __require === "function" && __require, i = 0; i < t.length; i++)
              o(t[i]);
            return o;
          }
          return r;
        }()({
          1: [function(_dereq_, module3, exports3) {
            module3.exports = function demolish(keys, options) {
              const split = /[, ]+/;
              options = options || {};
              keys = keys || [];
              if (typeof keys === "string")
                keys = keys.split(split);
              function run(key, selfie) {
                if (!options[key])
                  return;
                if (typeof options[key] === "string")
                  options[key] = options[key].split(split);
                if (typeof options[key] === "function")
                  return options[key].call(selfie);
                for (var i = 0, type, what; i < options[key].length; i++) {
                  what = options[key][i];
                  type = typeof what;
                  if (type === "function") {
                    what.call(selfie);
                  } else if (type === "string" && typeof selfie[what] === "function") {
                    selfie[what]();
                  }
                }
              }
              return function destroy() {
                const selfie = this;
                let i = 0;
                let prop;
                if (selfie[keys[0]] === null)
                  return false;
                run("before", selfie);
                for (; i < keys.length; i++) {
                  prop = keys[i];
                  if (selfie[prop]) {
                    if (typeof selfie[prop].destroy === "function")
                      selfie[prop].destroy();
                    selfie[prop] = null;
                  }
                }
                if (selfie.emit)
                  selfie.emit("destroy");
                run("after", selfie);
                return true;
              };
            };
          }, {}],
          2: [function(_dereq_, module3, exports3) {
            module3.exports = function emits() {
              const self2 = this;
              let parser;
              for (var i = 0, l = arguments.length, args = new Array(l); i < l; i++) {
                args[i] = arguments[i];
              }
              if (typeof args[args.length - 1] !== "function") {
                return function emitter() {
                  for (var i2 = 0, l2 = arguments.length, arg = new Array(l2); i2 < l2; i2++) {
                    arg[i2] = arguments[i2];
                  }
                  return self2.emit.apply(self2, args.concat(arg));
                };
              }
              parser = args.pop();
              return function emitter() {
                for (var i2 = 0, l2 = arguments.length, arg = new Array(l2 + 1); i2 < l2; i2++) {
                  arg[i2 + 1] = arguments[i2];
                }
                arg[0] = function next(err, returned) {
                  if (err)
                    return self2.emit("error", err);
                  arg = returned === void 0 ? arg.slice(1) : returned === null ? [] : returned;
                  self2.emit.apply(self2, args.concat(arg));
                };
                parser.apply(self2, arg);
                return true;
              };
            };
          }, {}],
          3: [function(_dereq_, module3, exports3) {
            const has = Object.prototype.hasOwnProperty;
            let prefix = "~";
            function Events() {
            }
            if (Object.create) {
              Events.prototype = /* @__PURE__ */ Object.create(null);
              if (!new Events().__proto__)
                prefix = false;
            }
            function EE(fn, context, once) {
              this.fn = fn;
              this.context = context;
              this.once = once || false;
            }
            function addListener(emitter, event, fn, context, once) {
              if (typeof fn !== "function") {
                throw new TypeError("The listener must be a function");
              }
              const listener = new EE(fn, context || emitter, once);
              const evt = prefix ? prefix + event : event;
              if (!emitter._events[evt])
                emitter._events[evt] = listener, emitter._eventsCount++;
              else if (!emitter._events[evt].fn)
                emitter._events[evt].push(listener);
              else
                emitter._events[evt] = [emitter._events[evt], listener];
              return emitter;
            }
            function clearEvent(emitter, evt) {
              if (--emitter._eventsCount === 0)
                emitter._events = new Events();
              else
                delete emitter._events[evt];
            }
            function EventEmitter() {
              this._events = new Events();
              this._eventsCount = 0;
            }
            EventEmitter.prototype.eventNames = function eventNames() {
              const names = [];
              let events;
              let name;
              if (this._eventsCount === 0)
                return names;
              for (name in events = this._events) {
                if (has.call(events, name))
                  names.push(prefix ? name.slice(1) : name);
              }
              if (Object.getOwnPropertySymbols) {
                return names.concat(Object.getOwnPropertySymbols(events));
              }
              return names;
            };
            EventEmitter.prototype.listeners = function listeners(event) {
              const evt = prefix ? prefix + event : event;
              const handlers = this._events[evt];
              if (!handlers)
                return [];
              if (handlers.fn)
                return [handlers.fn];
              for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
                ee[i] = handlers[i].fn;
              }
              return ee;
            };
            EventEmitter.prototype.listenerCount = function listenerCount(event) {
              const evt = prefix ? prefix + event : event;
              const listeners = this._events[evt];
              if (!listeners)
                return 0;
              if (listeners.fn)
                return 1;
              return listeners.length;
            };
            EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
              const evt = prefix ? prefix + event : event;
              if (!this._events[evt])
                return false;
              const listeners = this._events[evt];
              const len = arguments.length;
              let args;
              let i;
              if (listeners.fn) {
                if (listeners.once)
                  this.removeListener(event, listeners.fn, void 0, true);
                switch (len) {
                  case 1:
                    return listeners.fn.call(listeners.context), true;
                  case 2:
                    return listeners.fn.call(listeners.context, a1), true;
                  case 3:
                    return listeners.fn.call(listeners.context, a1, a2), true;
                  case 4:
                    return listeners.fn.call(listeners.context, a1, a2, a3), true;
                  case 5:
                    return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
                  case 6:
                    return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
                }
                for (i = 1, args = new Array(len - 1); i < len; i++) {
                  args[i - 1] = arguments[i];
                }
                listeners.fn.apply(listeners.context, args);
              } else {
                const { length } = listeners;
                let j;
                for (i = 0; i < length; i++) {
                  if (listeners[i].once)
                    this.removeListener(event, listeners[i].fn, void 0, true);
                  switch (len) {
                    case 1:
                      listeners[i].fn.call(listeners[i].context);
                      break;
                    case 2:
                      listeners[i].fn.call(listeners[i].context, a1);
                      break;
                    case 3:
                      listeners[i].fn.call(listeners[i].context, a1, a2);
                      break;
                    case 4:
                      listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                      break;
                    default:
                      if (!args) {
                        for (j = 1, args = new Array(len - 1); j < len; j++) {
                          args[j - 1] = arguments[j];
                        }
                      }
                      listeners[i].fn.apply(listeners[i].context, args);
                  }
                }
              }
              return true;
            };
            EventEmitter.prototype.on = function on(event, fn, context) {
              return addListener(this, event, fn, context, false);
            };
            EventEmitter.prototype.once = function once(event, fn, context) {
              return addListener(this, event, fn, context, true);
            };
            EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
              const evt = prefix ? prefix + event : event;
              if (!this._events[evt])
                return this;
              if (!fn) {
                clearEvent(this, evt);
                return this;
              }
              const listeners = this._events[evt];
              if (listeners.fn) {
                if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
                  clearEvent(this, evt);
                }
              } else {
                for (var i = 0, events = [], { length } = listeners; i < length; i++) {
                  if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                    events.push(listeners[i]);
                  }
                }
                if (events.length)
                  this._events[evt] = events.length === 1 ? events[0] : events;
                else
                  clearEvent(this, evt);
              }
              return this;
            };
            EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
              let evt;
              if (event) {
                evt = prefix ? prefix + event : event;
                if (this._events[evt])
                  clearEvent(this, evt);
              } else {
                this._events = new Events();
                this._eventsCount = 0;
              }
              return this;
            };
            EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prefixed = prefix;
            EventEmitter.EventEmitter = EventEmitter;
            if (typeof module3 !== "undefined") {
              module3.exports = EventEmitter;
            }
          }, {}],
          4: [function(_dereq_, module3, exports3) {
            if (typeof Object.create === "function") {
              module3.exports = function inherits(ctor, superCtor) {
                if (superCtor) {
                  ctor.super_ = superCtor;
                  ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                      value: ctor,
                      enumerable: false,
                      writable: true,
                      configurable: true
                    }
                  });
                }
              };
            } else {
              module3.exports = function inherits(ctor, superCtor) {
                if (superCtor) {
                  ctor.super_ = superCtor;
                  const TempCtor = function() {
                  };
                  TempCtor.prototype = superCtor.prototype;
                  ctor.prototype = new TempCtor();
                  ctor.prototype.constructor = ctor;
                }
              };
            }
          }, {}],
          5: [function(_dereq_, module3, exports3) {
            const regex = new RegExp(`^((?:\\d+)?\\.?\\d+) *(${[
              "milliseconds?",
              "msecs?",
              "ms",
              "seconds?",
              "secs?",
              "s",
              "minutes?",
              "mins?",
              "m",
              "hours?",
              "hrs?",
              "h",
              "days?",
              "d",
              "weeks?",
              "wks?",
              "w",
              "years?",
              "yrs?",
              "y"
            ].join("|")})?$`, "i");
            const second = 1e3;
            const minute = second * 60;
            const hour = minute * 60;
            const day = hour * 24;
            const week = day * 7;
            const year = day * 365;
            module3.exports = function millisecond(ms) {
              const type = typeof ms;
              let amount;
              let match;
              if (type === "number")
                return ms;
              if (type !== "string" || ms === "0" || !ms)
                return 0;
              if (+ms)
                return +ms;
              if (ms.length > 1e4 || !(match = regex.exec(ms)))
                return 0;
              amount = parseFloat(match[1]);
              switch (match[2].toLowerCase()) {
                case "years":
                case "year":
                case "yrs":
                case "yr":
                case "y":
                  return amount * year;
                case "weeks":
                case "week":
                case "wks":
                case "wk":
                case "w":
                  return amount * week;
                case "days":
                case "day":
                case "d":
                  return amount * day;
                case "hours":
                case "hour":
                case "hrs":
                case "hr":
                case "h":
                  return amount * hour;
                case "minutes":
                case "minute":
                case "mins":
                case "min":
                case "m":
                  return amount * minute;
                case "seconds":
                case "second":
                case "secs":
                case "sec":
                case "s":
                  return amount * second;
                default:
                  return amount;
              }
            };
          }, {}],
          6: [function(_dereq_, module3, exports3) {
            module3.exports = function one(fn) {
              let called = 0;
              let value;
              function onetime() {
                if (called)
                  return value;
                called = 1;
                value = fn.apply(this, arguments);
                fn = null;
                return value;
              }
              onetime.displayName = fn.displayName || fn.name || onetime.displayName || onetime.name;
              return onetime;
            };
          }, {}],
          7: [function(_dereq_, module3, exports3) {
            const process = module3.exports = {};
            let cachedSetTimeout;
            let cachedClearTimeout;
            function defaultSetTimout() {
              throw new Error("setTimeout has not been defined");
            }
            function defaultClearTimeout() {
              throw new Error("clearTimeout has not been defined");
            }
            (function() {
              try {
                if (typeof setTimeout === "function") {
                  cachedSetTimeout = setTimeout;
                } else {
                  cachedSetTimeout = defaultSetTimout;
                }
              } catch (e) {
                cachedSetTimeout = defaultSetTimout;
              }
              try {
                if (typeof clearTimeout === "function") {
                  cachedClearTimeout = clearTimeout;
                } else {
                  cachedClearTimeout = defaultClearTimeout;
                }
              } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
              }
            })();
            function runTimeout(fun) {
              if (cachedSetTimeout === setTimeout) {
                return setTimeout(fun, 0);
              }
              if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
              }
              try {
                return cachedSetTimeout(fun, 0);
              } catch (e) {
                try {
                  return cachedSetTimeout.call(null, fun, 0);
                } catch (e2) {
                  return cachedSetTimeout.call(this, fun, 0);
                }
              }
            }
            function runClearTimeout(marker) {
              if (cachedClearTimeout === clearTimeout) {
                return clearTimeout(marker);
              }
              if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
              }
              try {
                return cachedClearTimeout(marker);
              } catch (e) {
                try {
                  return cachedClearTimeout.call(null, marker);
                } catch (e2) {
                  return cachedClearTimeout.call(this, marker);
                }
              }
            }
            let queue = [];
            let draining = false;
            let currentQueue;
            let queueIndex = -1;
            function cleanUpNextTick() {
              if (!draining || !currentQueue) {
                return;
              }
              draining = false;
              if (currentQueue.length) {
                queue = currentQueue.concat(queue);
              } else {
                queueIndex = -1;
              }
              if (queue.length) {
                drainQueue();
              }
            }
            function drainQueue() {
              if (draining) {
                return;
              }
              const timeout = runTimeout(cleanUpNextTick);
              draining = true;
              let len = queue.length;
              while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                  if (currentQueue) {
                    currentQueue[queueIndex].run();
                  }
                }
                queueIndex = -1;
                len = queue.length;
              }
              currentQueue = null;
              draining = false;
              runClearTimeout(timeout);
            }
            process.nextTick = function(fun) {
              const args = new Array(arguments.length - 1);
              if (arguments.length > 1) {
                for (let i = 1; i < arguments.length; i++) {
                  args[i - 1] = arguments[i];
                }
              }
              queue.push(new Item(fun, args));
              if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
              }
            };
            function Item(fun, array) {
              this.fun = fun;
              this.array = array;
            }
            Item.prototype.run = function() {
              this.fun.apply(null, this.array);
            };
            process.title = "browser";
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = "";
            process.versions = {};
            function noop() {
            }
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.prependListener = noop;
            process.prependOnceListener = noop;
            process.listeners = function(name) {
              return [];
            };
            process.binding = function(name) {
              throw new Error("process.binding is not supported");
            };
            process.cwd = function() {
              return "/";
            };
            process.chdir = function(dir) {
              throw new Error("process.chdir is not supported");
            };
            process.umask = function() {
              return 0;
            };
          }, {}],
          8: [function(_dereq_, module3, exports3) {
            const has = Object.prototype.hasOwnProperty;
            let undef;
            function decode(input) {
              try {
                return decodeURIComponent(input.replace(/\+/g, " "));
              } catch (e) {
                return null;
              }
            }
            function encode(input) {
              try {
                return encodeURIComponent(input);
              } catch (e) {
                return null;
              }
            }
            function querystring(query) {
              const parser = /([^=?&]+)=?([^&]*)/g;
              const result = {};
              let part;
              while (part = parser.exec(query)) {
                const key = decode(part[1]);
                const value = decode(part[2]);
                if (key === null || value === null || key in result)
                  continue;
                result[key] = value;
              }
              return result;
            }
            function querystringify(obj, prefix) {
              prefix = prefix || "";
              const pairs = [];
              let value;
              let key;
              if (typeof prefix !== "string")
                prefix = "?";
              for (key in obj) {
                if (has.call(obj, key)) {
                  value = obj[key];
                  if (!value && (value === null || value === undef || isNaN(value))) {
                    value = "";
                  }
                  key = encodeURIComponent(key);
                  value = encodeURIComponent(value);
                  if (key === null || value === null)
                    continue;
                  pairs.push(`${key}=${value}`);
                }
              }
              return pairs.length ? prefix + pairs.join("&") : "";
            }
            exports3.stringify = querystringify;
            exports3.parse = querystring;
          }, {}],
          9: [function(_dereq_, module3, exports3) {
            const EventEmitter = _dereq_("eventemitter3");
            const millisecond = _dereq_("millisecond");
            const destroy = _dereq_("demolish");
            const Tick = _dereq_("tick-tock");
            const one = _dereq_("one-time");
            function defaults(name, selfie, opts) {
              return millisecond(
                name in opts ? opts[name] : name in selfie ? selfie[name] : Recovery[name]
              );
            }
            function Recovery(options) {
              const recovery = this;
              if (!(recovery instanceof Recovery))
                return new Recovery(options);
              options = options || {};
              recovery.attempt = null;
              recovery._fn = null;
              recovery["reconnect timeout"] = defaults("reconnect timeout", recovery, options);
              recovery.retries = defaults("retries", recovery, options);
              recovery.factor = defaults("factor", recovery, options);
              recovery.max = defaults("max", recovery, options);
              recovery.min = defaults("min", recovery, options);
              recovery.timers = new Tick(recovery);
            }
            Recovery.prototype = new EventEmitter();
            Recovery.prototype.constructor = Recovery;
            Recovery["reconnect timeout"] = "30 seconds";
            Recovery.max = Infinity;
            Recovery.min = "500 ms";
            Recovery.retries = 10;
            Recovery.factor = 2;
            Recovery.prototype.reconnect = function reconnect() {
              const recovery = this;
              return recovery.backoff(function backedoff(err, opts) {
                opts.duration = +new Date() - opts.start;
                if (err)
                  return recovery.emit("reconnect failed", err, opts);
                recovery.emit("reconnected", opts);
              }, recovery.attempt);
            };
            Recovery.prototype.backoff = function backoff(fn, opts) {
              const recovery = this;
              opts = opts || recovery.attempt || {};
              if (opts.backoff)
                return recovery;
              opts["reconnect timeout"] = defaults("reconnect timeout", recovery, opts);
              opts.retries = defaults("retries", recovery, opts);
              opts.factor = defaults("factor", recovery, opts);
              opts.max = defaults("max", recovery, opts);
              opts.min = defaults("min", recovery, opts);
              opts.start = +opts.start || +new Date();
              opts.duration = +opts.duration || 0;
              opts.attempt = +opts.attempt || 0;
              if (opts.attempt === opts.retries) {
                fn.call(recovery, new Error("Unable to recover"), opts);
                return recovery;
              }
              opts.backoff = true;
              opts.attempt++;
              recovery.attempt = opts;
              opts.scheduled = opts.attempt !== 1 ? Math.min(Math.round(
                (Math.random() + 1) * opts.min * Math.pow(opts.factor, opts.attempt - 1)
              ), opts.max) : opts.min;
              recovery.timers.setTimeout("reconnect", function delay() {
                opts.duration = +new Date() - opts.start;
                opts.backoff = false;
                recovery.timers.clear("reconnect, timeout");
                const connect = recovery._fn = one(function connect2(err) {
                  recovery.reset();
                  if (err)
                    return recovery.backoff(fn, opts);
                  fn.call(recovery, void 0, opts);
                });
                recovery.emit("reconnect", opts, connect);
                recovery.timers.setTimeout("timeout", function timeout() {
                  const err = new Error("Failed to reconnect in a timely manner");
                  opts.duration = +new Date() - opts.start;
                  recovery.emit("reconnect timeout", err, opts);
                  connect(err);
                }, opts["reconnect timeout"]);
              }, opts.scheduled);
              recovery.emit("reconnect scheduled", opts);
              return recovery;
            };
            Recovery.prototype.reconnecting = function reconnecting() {
              return !!this.attempt;
            };
            Recovery.prototype.reconnected = function reconnected(err) {
              if (this._fn)
                this._fn(err);
              return this;
            };
            Recovery.prototype.reset = function reset() {
              this._fn = this.attempt = null;
              this.timers.clear("reconnect, timeout");
              return this;
            };
            Recovery.prototype.destroy = destroy("timers attempt _fn");
            module3.exports = Recovery;
          }, { demolish: 1, eventemitter3: 10, millisecond: 5, "one-time": 6, "tick-tock": 12 }],
          10: [function(_dereq_, module3, exports3) {
            const prefix = typeof Object.create !== "function" ? "~" : false;
            function EE(fn, context, once) {
              this.fn = fn;
              this.context = context;
              this.once = once || false;
            }
            function EventEmitter() {
            }
            EventEmitter.prototype._events = void 0;
            EventEmitter.prototype.listeners = function listeners(event, exists) {
              const evt = prefix ? prefix + event : event;
              const available = this._events && this._events[evt];
              if (exists)
                return !!available;
              if (!available)
                return [];
              if (available.fn)
                return [available.fn];
              for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
                ee[i] = available[i].fn;
              }
              return ee;
            };
            EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
              const evt = prefix ? prefix + event : event;
              if (!this._events || !this._events[evt])
                return false;
              const listeners = this._events[evt];
              const len = arguments.length;
              let args;
              let i;
              if (typeof listeners.fn === "function") {
                if (listeners.once)
                  this.removeListener(event, listeners.fn, void 0, true);
                switch (len) {
                  case 1:
                    return listeners.fn.call(listeners.context), true;
                  case 2:
                    return listeners.fn.call(listeners.context, a1), true;
                  case 3:
                    return listeners.fn.call(listeners.context, a1, a2), true;
                  case 4:
                    return listeners.fn.call(listeners.context, a1, a2, a3), true;
                  case 5:
                    return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
                  case 6:
                    return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
                }
                for (i = 1, args = new Array(len - 1); i < len; i++) {
                  args[i - 1] = arguments[i];
                }
                listeners.fn.apply(listeners.context, args);
              } else {
                const { length } = listeners;
                let j;
                for (i = 0; i < length; i++) {
                  if (listeners[i].once)
                    this.removeListener(event, listeners[i].fn, void 0, true);
                  switch (len) {
                    case 1:
                      listeners[i].fn.call(listeners[i].context);
                      break;
                    case 2:
                      listeners[i].fn.call(listeners[i].context, a1);
                      break;
                    case 3:
                      listeners[i].fn.call(listeners[i].context, a1, a2);
                      break;
                    default:
                      if (!args) {
                        for (j = 1, args = new Array(len - 1); j < len; j++) {
                          args[j - 1] = arguments[j];
                        }
                      }
                      listeners[i].fn.apply(listeners[i].context, args);
                  }
                }
              }
              return true;
            };
            EventEmitter.prototype.on = function on(event, fn, context) {
              const listener = new EE(fn, context || this);
              const evt = prefix ? prefix + event : event;
              if (!this._events)
                this._events = prefix ? {} : /* @__PURE__ */ Object.create(null);
              if (!this._events[evt])
                this._events[evt] = listener;
              else if (!this._events[evt].fn)
                this._events[evt].push(listener);
              else {
                this._events[evt] = [
                  this._events[evt],
                  listener
                ];
              }
              return this;
            };
            EventEmitter.prototype.once = function once(event, fn, context) {
              const listener = new EE(fn, context || this, true);
              const evt = prefix ? prefix + event : event;
              if (!this._events)
                this._events = prefix ? {} : /* @__PURE__ */ Object.create(null);
              if (!this._events[evt])
                this._events[evt] = listener;
              else if (!this._events[evt].fn)
                this._events[evt].push(listener);
              else {
                this._events[evt] = [
                  this._events[evt],
                  listener
                ];
              }
              return this;
            };
            EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
              const evt = prefix ? prefix + event : event;
              if (!this._events || !this._events[evt])
                return this;
              const listeners = this._events[evt];
              const events = [];
              if (fn) {
                if (listeners.fn) {
                  if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
                    events.push(listeners);
                  }
                } else {
                  for (let i = 0, { length } = listeners; i < length; i++) {
                    if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                      events.push(listeners[i]);
                    }
                  }
                }
              }
              if (events.length) {
                this._events[evt] = events.length === 1 ? events[0] : events;
              } else {
                delete this._events[evt];
              }
              return this;
            };
            EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
              if (!this._events)
                return this;
              if (event)
                delete this._events[prefix ? prefix + event : event];
              else
                this._events = prefix ? {} : /* @__PURE__ */ Object.create(null);
              return this;
            };
            EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
            EventEmitter.prototype.addListener = EventEmitter.prototype.on;
            EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
              return this;
            };
            EventEmitter.prefixed = prefix;
            if (typeof module3 !== "undefined") {
              module3.exports = EventEmitter;
            }
          }, {}],
          11: [function(_dereq_, module3, exports3) {
            module3.exports = function required(port, protocol) {
              protocol = protocol.split(":")[0];
              port = +port;
              if (!port)
                return false;
              switch (protocol) {
                case "http":
                case "ws":
                  return port !== 80;
                case "https":
                case "wss":
                  return port !== 443;
                case "ftp":
                  return port !== 21;
                case "gopher":
                  return port !== 70;
                case "file":
                  return false;
              }
              return port !== 0;
            };
          }, {}],
          12: [function(_dereq_, module3, exports3) {
            (function(setImmediate, clearImmediate) {
              const has = Object.prototype.hasOwnProperty;
              const ms = _dereq_("millisecond");
              function Timer(timer, clear, duration, fn) {
                this.start = +new Date();
                this.duration = duration;
                this.clear = clear;
                this.timer = timer;
                this.fns = [fn];
              }
              Timer.prototype.remaining = function remaining() {
                return this.duration - this.taken();
              };
              Timer.prototype.taken = function taken() {
                return +new Date() - this.start;
              };
              function unsetTimeout(id) {
                clearTimeout(id);
              }
              function unsetInterval(id) {
                clearInterval(id);
              }
              function unsetImmediate(id) {
                clearImmediate(id);
              }
              function Tick(context) {
                if (!(this instanceof Tick))
                  return new Tick(context);
                this.timers = {};
                this.context = context || this;
              }
              Tick.prototype.tock = function ticktock(name, clear) {
                const tock = this;
                return function tickedtock() {
                  if (!(name in tock.timers))
                    return;
                  const timer = tock.timers[name];
                  const fns = timer.fns.slice();
                  const l = fns.length;
                  let i = 0;
                  if (clear)
                    tock.clear(name);
                  else
                    tock.start = +new Date();
                  for (; i < l; i++) {
                    fns[i].call(tock.context);
                  }
                };
              };
              Tick.prototype.setTimeout = function timeout(name, fn, time) {
                const tick = this;
                let tock;
                if (tick.timers[name]) {
                  tick.timers[name].fns.push(fn);
                  return tick;
                }
                tock = ms(time);
                tick.timers[name] = new Timer(
                  setTimeout(tick.tock(name, true), ms(time)),
                  unsetTimeout,
                  tock,
                  fn
                );
                return tick;
              };
              Tick.prototype.setInterval = function interval(name, fn, time) {
                const tick = this;
                let tock;
                if (tick.timers[name]) {
                  tick.timers[name].fns.push(fn);
                  return tick;
                }
                tock = ms(time);
                tick.timers[name] = new Timer(
                  setInterval(tick.tock(name), ms(time)),
                  unsetInterval,
                  tock,
                  fn
                );
                return tick;
              };
              Tick.prototype.setImmediate = function immediate(name, fn) {
                const tick = this;
                if (typeof setImmediate !== "function")
                  return tick.setTimeout(name, fn, 0);
                if (tick.timers[name]) {
                  tick.timers[name].fns.push(fn);
                  return tick;
                }
                tick.timers[name] = new Timer(
                  setImmediate(tick.tock(name, true)),
                  unsetImmediate,
                  0,
                  fn
                );
                return tick;
              };
              Tick.prototype.active = function active(name) {
                return name in this.timers;
              };
              Tick.prototype.clear = function clear() {
                let args = arguments.length ? arguments : [];
                const tick = this;
                let timer;
                let i;
                let l;
                if (args.length === 1 && typeof args[0] === "string") {
                  args = args[0].split(/[, ]+/);
                }
                if (!args.length) {
                  for (timer in tick.timers) {
                    if (has.call(tick.timers, timer))
                      args.push(timer);
                  }
                }
                for (i = 0, l = args.length; i < l; i++) {
                  timer = tick.timers[args[i]];
                  if (!timer)
                    continue;
                  timer.clear(timer.timer);
                  timer.fns = timer.timer = timer.clear = null;
                  delete tick.timers[args[i]];
                }
                return tick;
              };
              Tick.prototype.adjust = function adjust(name, time) {
                let interval;
                const tick = this;
                const tock = ms(time);
                const timer = tick.timers[name];
                if (!timer)
                  return tick;
                interval = timer.clear === unsetInterval;
                timer.clear(timer.timer);
                timer.start = +new Date();
                timer.duration = tock;
                timer.timer = (interval ? setInterval : setTimeout)(tick.tock(name, !interval), tock);
                return tick;
              };
              Tick.prototype.end = Tick.prototype.destroy = function end() {
                if (!this.context)
                  return false;
                this.clear();
                this.context = this.timers = null;
                return true;
              };
              Tick.Timer = Timer;
              module3.exports = Tick;
            }).call(this, _dereq_("timers").setImmediate, _dereq_("timers").clearImmediate);
          }, { millisecond: 5, timers: 13 }],
          13: [function(_dereq_, module3, exports3) {
            (function(setImmediate, clearImmediate) {
              const { nextTick } = _dereq_("process/browser.js");
              const { apply } = Function.prototype;
              const { slice } = Array.prototype;
              const immediateIds = {};
              let nextImmediateId = 0;
              exports3.setTimeout = function() {
                return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
              };
              exports3.setInterval = function() {
                return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
              };
              exports3.clearTimeout = exports3.clearInterval = function(timeout) {
                timeout.close();
              };
              function Timeout(id, clearFn) {
                this._id = id;
                this._clearFn = clearFn;
              }
              Timeout.prototype.unref = Timeout.prototype.ref = function() {
              };
              Timeout.prototype.close = function() {
                this._clearFn.call(window, this._id);
              };
              exports3.enroll = function(item, msecs) {
                clearTimeout(item._idleTimeoutId);
                item._idleTimeout = msecs;
              };
              exports3.unenroll = function(item) {
                clearTimeout(item._idleTimeoutId);
                item._idleTimeout = -1;
              };
              exports3._unrefActive = exports3.active = function(item) {
                clearTimeout(item._idleTimeoutId);
                const msecs = item._idleTimeout;
                if (msecs >= 0) {
                  item._idleTimeoutId = setTimeout(function onTimeout() {
                    if (item._onTimeout)
                      item._onTimeout();
                  }, msecs);
                }
              };
              exports3.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
                const id = nextImmediateId++;
                const args = arguments.length < 2 ? false : slice.call(arguments, 1);
                immediateIds[id] = true;
                nextTick(function onNextTick() {
                  if (immediateIds[id]) {
                    if (args) {
                      fn.apply(null, args);
                    } else {
                      fn.call(null);
                    }
                    exports3.clearImmediate(id);
                  }
                });
                return id;
              };
              exports3.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
                delete immediateIds[id];
              };
            }).call(this, _dereq_("timers").setImmediate, _dereq_("timers").clearImmediate);
          }, { "process/browser.js": 7, timers: 13 }],
          14: [function(_dereq_, module3, exports3) {
            (function(global2) {
              const required = _dereq_("requires-port");
              const qs = _dereq_("querystringify");
              const slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
              const protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;
              const whitespace = "[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]";
              const left = new RegExp(`^${whitespace}+`);
              function trimLeft(str) {
                return (str || "").toString().replace(left, "");
              }
              const rules = [
                ["#", "hash"],
                // Extract from the back.
                ["?", "query"],
                // Extract from the back.
                function sanitize(address) {
                  return address.replace("\\", "/");
                },
                ["/", "pathname"],
                // Extract from the back.
                ["@", "auth", 1],
                // Extract from the front.
                [NaN, "host", void 0, 1, 1],
                // Set left over value.
                [/:(\d+)$/, "port", void 0, 1],
                // RegExp the back.
                [NaN, "hostname", void 0, 1, 1]
                // Set left over.
              ];
              const ignore = { hash: 1, query: 1 };
              function lolcation(loc) {
                let globalVar;
                if (typeof window !== "undefined")
                  globalVar = window;
                else if (typeof global2 !== "undefined")
                  globalVar = global2;
                else if (typeof self !== "undefined")
                  globalVar = self;
                else
                  globalVar = {};
                const location2 = globalVar.location || {};
                loc = loc || location2;
                let finaldestination = {};
                const type = typeof loc;
                let key;
                if (loc.protocol === "blob:") {
                  finaldestination = new Url(unescape(loc.pathname), {});
                } else if (type === "string") {
                  finaldestination = new Url(loc, {});
                  for (key in ignore)
                    delete finaldestination[key];
                } else if (type === "object") {
                  for (key in loc) {
                    if (key in ignore)
                      continue;
                    finaldestination[key] = loc[key];
                  }
                  if (finaldestination.slashes === void 0) {
                    finaldestination.slashes = slashes.test(loc.href);
                  }
                }
                return finaldestination;
              }
              function extractProtocol(address) {
                address = trimLeft(address);
                const match = protocolre.exec(address);
                return {
                  protocol: match[1] ? match[1].toLowerCase() : "",
                  slashes: !!match[2],
                  rest: match[3]
                };
              }
              function resolve(relative, base) {
                if (relative === "")
                  return base;
                const path = (base || "/").split("/").slice(0, -1).concat(relative.split("/"));
                let i = path.length;
                const last = path[i - 1];
                let unshift = false;
                let up = 0;
                while (i--) {
                  if (path[i] === ".") {
                    path.splice(i, 1);
                  } else if (path[i] === "..") {
                    path.splice(i, 1);
                    up++;
                  } else if (up) {
                    if (i === 0)
                      unshift = true;
                    path.splice(i, 1);
                    up--;
                  }
                }
                if (unshift)
                  path.unshift("");
                if (last === "." || last === "..")
                  path.push("");
                return path.join("/");
              }
              function Url(address, location2, parser) {
                address = trimLeft(address);
                if (!(this instanceof Url)) {
                  return new Url(address, location2, parser);
                }
                let relative;
                let extracted;
                let parse;
                let instruction;
                let index;
                let key;
                const instructions = rules.slice();
                const type = typeof location2;
                const url = this;
                let i = 0;
                if (type !== "object" && type !== "string") {
                  parser = location2;
                  location2 = null;
                }
                if (parser && typeof parser !== "function")
                  parser = qs.parse;
                location2 = lolcation(location2);
                extracted = extractProtocol(address || "");
                relative = !extracted.protocol && !extracted.slashes;
                url.slashes = extracted.slashes || relative && location2.slashes;
                url.protocol = extracted.protocol || location2.protocol || "";
                address = extracted.rest;
                if (!extracted.slashes)
                  instructions[3] = [/(.*)/, "pathname"];
                for (; i < instructions.length; i++) {
                  instruction = instructions[i];
                  if (typeof instruction === "function") {
                    address = instruction(address);
                    continue;
                  }
                  parse = instruction[0];
                  key = instruction[1];
                  if (parse !== parse) {
                    url[key] = address;
                  } else if (typeof parse === "string") {
                    if (~(index = address.indexOf(parse))) {
                      if (typeof instruction[2] === "number") {
                        url[key] = address.slice(0, index);
                        address = address.slice(index + instruction[2]);
                      } else {
                        url[key] = address.slice(index);
                        address = address.slice(0, index);
                      }
                    }
                  } else if (index = parse.exec(address)) {
                    url[key] = index[1];
                    address = address.slice(0, index.index);
                  }
                  url[key] = url[key] || (relative && instruction[3] ? location2[key] || "" : "");
                  if (instruction[4])
                    url[key] = url[key].toLowerCase();
                }
                if (parser)
                  url.query = parser(url.query);
                if (relative && location2.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location2.pathname !== "")) {
                  url.pathname = resolve(url.pathname, location2.pathname);
                }
                if (!required(url.port, url.protocol)) {
                  url.host = url.hostname;
                  url.port = "";
                }
                url.username = url.password = "";
                if (url.auth) {
                  instruction = url.auth.split(":");
                  url.username = instruction[0] || "";
                  url.password = instruction[1] || "";
                }
                url.origin = url.protocol && url.host && url.protocol !== "file:" ? `${url.protocol}//${url.host}` : "null";
                url.href = url.toString();
              }
              function set(part, value, fn) {
                const url = this;
                switch (part) {
                  case "query":
                    if (typeof value === "string" && value.length) {
                      value = (fn || qs.parse)(value);
                    }
                    url[part] = value;
                    break;
                  case "port":
                    url[part] = value;
                    if (!required(value, url.protocol)) {
                      url.host = url.hostname;
                      url[part] = "";
                    } else if (value) {
                      url.host = `${url.hostname}:${value}`;
                    }
                    break;
                  case "hostname":
                    url[part] = value;
                    if (url.port)
                      value += `:${url.port}`;
                    url.host = value;
                    break;
                  case "host":
                    url[part] = value;
                    if (/:\d+$/.test(value)) {
                      value = value.split(":");
                      url.port = value.pop();
                      url.hostname = value.join(":");
                    } else {
                      url.hostname = value;
                      url.port = "";
                    }
                    break;
                  case "protocol":
                    url.protocol = value.toLowerCase();
                    url.slashes = !fn;
                    break;
                  case "pathname":
                  case "hash":
                    if (value) {
                      const char = part === "pathname" ? "/" : "#";
                      url[part] = value.charAt(0) !== char ? char + value : value;
                    } else {
                      url[part] = value;
                    }
                    break;
                  default:
                    url[part] = value;
                }
                for (let i = 0; i < rules.length; i++) {
                  const ins = rules[i];
                  if (ins[4])
                    url[ins[1]] = url[ins[1]].toLowerCase();
                }
                url.origin = url.protocol && url.host && url.protocol !== "file:" ? `${url.protocol}//${url.host}` : "null";
                url.href = url.toString();
                return url;
              }
              function toString(stringify) {
                if (!stringify || typeof stringify !== "function")
                  stringify = qs.stringify;
                let query;
                const url = this;
                let { protocol } = url;
                if (protocol && protocol.charAt(protocol.length - 1) !== ":")
                  protocol += ":";
                let result = protocol + (url.slashes ? "//" : "");
                if (url.username) {
                  result += url.username;
                  if (url.password)
                    result += `:${url.password}`;
                  result += "@";
                }
                result += url.host + url.pathname;
                query = typeof url.query === "object" ? stringify(url.query) : url.query;
                if (query)
                  result += query.charAt(0) !== "?" ? `?${query}` : query;
                if (url.hash)
                  result += url.hash;
                return result;
              }
              Url.prototype = { set, toString };
              Url.extractProtocol = extractProtocol;
              Url.location = lolcation;
              Url.trimLeft = trimLeft;
              Url.qs = qs;
              module3.exports = Url;
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
          }, { querystringify: 8, "requires-port": 11 }],
          15: [function(_dereq_, module3, exports3) {
            const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
            const length = 64;
            const map = {};
            let seed = 0;
            let i = 0;
            let prev;
            function encode(num) {
              let encoded = "";
              do {
                encoded = alphabet[num % length] + encoded;
                num = Math.floor(num / length);
              } while (num > 0);
              return encoded;
            }
            function decode(str) {
              let decoded = 0;
              for (i = 0; i < str.length; i++) {
                decoded = decoded * length + map[str.charAt(i)];
              }
              return decoded;
            }
            function yeast() {
              const now = encode(+new Date());
              if (now !== prev)
                return seed = 0, prev = now;
              return `${now}.${encode(seed++)}`;
            }
            for (; i < length; i++)
              map[alphabet[i]] = i;
            yeast.encode = encode;
            yeast.decode = decode;
            module3.exports = yeast;
          }, {}],
          16: [function(_dereq_, module3, exports3) {
            const EventEmitter = _dereq_("eventemitter3");
            const TickTock = _dereq_("tick-tock");
            const Recovery = _dereq_("recovery");
            const qs = _dereq_("querystringify");
            const inherits = _dereq_("inherits");
            const destroy = _dereq_("demolish");
            const yeast = _dereq_("yeast");
            const u2028 = /\u2028/g;
            const u2029 = /\u2029/g;
            function context(self2, method) {
              if (self2 instanceof Primus2)
                return;
              const failure = new Error(`Primus#${method}'s context should called with a Primus instance`);
              if (typeof self2.listeners !== "function" || !self2.listeners("error").length) {
                throw failure;
              }
              self2.emit("error", failure);
            }
            let defaultUrl;
            try {
              if (location.origin) {
                defaultUrl = location.origin;
              } else {
                defaultUrl = `${location.protocol}//${location.host}`;
              }
            } catch (e) {
              defaultUrl = "http://127.0.0.1";
            }
            function Primus2(url, options) {
              if (!(this instanceof Primus2))
                return new Primus2(url, options);
              Primus2.Stream.call(this);
              if (typeof this.client !== "function") {
                return this.critical(new Error(
                  "The client library has not been compiled correctly, see https://github.com/primus/primus#client-library for more details"
                ));
              }
              if (typeof url === "object") {
                options = url;
                url = options.url || options.uri || defaultUrl;
              } else {
                options = options || {};
              }
              if ("ping" in options || "pong" in options) {
                return this.critical(new Error(
                  "The `ping` and `pong` options have been removed"
                ));
              }
              const primus = this;
              options.queueSize = "queueSize" in options ? options.queueSize : Infinity;
              options.timeout = "timeout" in options ? options.timeout : 1e4;
              options.reconnect = "reconnect" in options ? options.reconnect : {};
              options.pingTimeout = "pingTimeout" in options ? options.pingTimeout : 45e3;
              options.strategy = "strategy" in options ? options.strategy : [];
              options.transport = "transport" in options ? options.transport : {};
              primus.buffer = [];
              primus.writable = true;
              primus.readable = true;
              primus.url = primus.parse(url || defaultUrl);
              primus.readyState = Primus2.CLOSED;
              primus.options = options;
              primus.timers = new TickTock(this);
              primus.socket = null;
              primus.disconnect = false;
              primus.transport = options.transport;
              primus.transformers = {
                // Message transformers.
                outgoing: [],
                incoming: []
              };
              primus.recovery = new Recovery(options.reconnect);
              if (typeof options.strategy === "string") {
                options.strategy = options.strategy.split(/\s?,\s?/g);
              }
              if (options.strategy === false) {
                options.strategy = [];
              } else if (!options.strategy.length) {
                options.strategy.push("disconnect", "online");
                if (!this.authorization)
                  options.strategy.push("timeout");
              }
              options.strategy = options.strategy.join(",").toLowerCase();
              if ("websockets" in options) {
                primus.AVOID_WEBSOCKETS = !options.websockets;
              }
              if ("network" in options) {
                primus.NETWORK_EVENTS = options.network;
              }
              if (!options.manual) {
                primus.timers.setTimeout("open", function open() {
                  primus.timers.clear("open");
                  primus.open();
                }, 0);
              }
              primus.initialise(options);
            }
            Primus2.requires = Primus2.require = function requires(name) {
              if (typeof _dereq_ !== "function")
                return void 0;
              return !(typeof define2 === "function" && define2.amd) ? _dereq_(name) : void 0;
            };
            try {
              Primus2.Stream = Primus2.requires("stream");
            } catch (e) {
            }
            if (!Primus2.Stream)
              Primus2.Stream = EventEmitter;
            inherits(Primus2, Primus2.Stream);
            Primus2.OPENING = 1;
            Primus2.CLOSED = 2;
            Primus2.OPEN = 3;
            Primus2.prototype.AVOID_WEBSOCKETS = false;
            Primus2.prototype.NETWORK_EVENTS = false;
            Primus2.prototype.online = true;
            try {
              if (Primus2.prototype.NETWORK_EVENTS = "onLine" in navigator && (window.addEventListener || document.body.attachEvent)) {
                if (!navigator.onLine) {
                  Primus2.prototype.online = false;
                }
              }
            } catch (e) {
            }
            Primus2.prototype.ark = {};
            Primus2.prototype.emits = _dereq_("emits");
            Primus2.prototype.plugin = function plugin(name) {
              context(this, "plugin");
              if (name)
                return this.ark[name];
              const plugins = {};
              for (name in this.ark) {
                plugins[name] = this.ark[name];
              }
              return plugins;
            };
            Primus2.prototype.reserved = function reserved(evt) {
              return /^(incoming|outgoing)::/.test(evt) || evt in this.reserved.events;
            };
            Primus2.prototype.reserved.events = {
              "reconnect scheduled": 1,
              "reconnect timeout": 1,
              readyStateChange: 1,
              "reconnect failed": 1,
              reconnected: 1,
              reconnect: 1,
              offline: 1,
              timeout: 1,
              destroy: 1,
              online: 1,
              error: 1,
              close: 1,
              open: 1,
              data: 1,
              end: 1
            };
            Primus2.prototype.initialise = function initialise(options) {
              const primus = this;
              primus.recovery.on("reconnected", primus.emits("reconnected")).on("reconnect failed", primus.emits("reconnect failed", function failed(next) {
                primus.emit("end");
                next();
              })).on("reconnect timeout", primus.emits("reconnect timeout")).on("reconnect scheduled", primus.emits("reconnect scheduled")).on("reconnect", primus.emits("reconnect", function reconnect(next) {
                primus.emit("outgoing::reconnect");
                next();
              }));
              primus.on("outgoing::open", function opening() {
                const { readyState } = primus;
                primus.readyState = Primus2.OPENING;
                if (readyState !== primus.readyState) {
                  primus.emit("readyStateChange", "opening");
                }
              });
              primus.on("incoming::open", function opened() {
                const { readyState } = primus;
                if (primus.recovery.reconnecting()) {
                  primus.recovery.reconnected();
                }
                primus.writable = true;
                primus.readable = true;
                if (!primus.online) {
                  primus.online = true;
                  primus.emit("online");
                }
                primus.readyState = Primus2.OPEN;
                if (readyState !== primus.readyState) {
                  primus.emit("readyStateChange", "open");
                }
                primus.heartbeat();
                if (primus.buffer.length) {
                  const data = primus.buffer.slice();
                  const { length } = data;
                  let i = 0;
                  primus.buffer.length = 0;
                  for (; i < length; i++) {
                    primus._write(data[i]);
                  }
                }
                primus.emit("open");
              });
              primus.on("incoming::ping", function ping(time) {
                primus.online = true;
                primus.heartbeat();
                primus.emit("outgoing::pong", time);
                primus._write(`primus::pong::${time}`);
              });
              primus.on("incoming::error", function error(e) {
                const connect = primus.timers.active("connect");
                let err = e;
                if (typeof e === "string") {
                  err = new Error(e);
                } else if (!(e instanceof Error) && typeof e === "object") {
                  err = new Error(e.message || e.reason);
                  for (const key in e) {
                    if (Object.prototype.hasOwnProperty.call(e, key))
                      err[key] = e[key];
                  }
                }
                if (primus.recovery.reconnecting())
                  return primus.recovery.reconnected(err);
                if (primus.listeners("error").length)
                  primus.emit("error", err);
                if (connect) {
                  if (~primus.options.strategy.indexOf("timeout")) {
                    primus.recovery.reconnect();
                  } else {
                    primus.end();
                  }
                }
              });
              primus.on("incoming::data", function message(raw) {
                primus.decoder(raw, function decoding(err, data) {
                  if (err)
                    return primus.listeners("error").length && primus.emit("error", err);
                  if (primus.protocol(data))
                    return;
                  primus.transforms(primus, primus, "incoming", data, raw);
                });
              });
              primus.on("incoming::end", function end() {
                const { readyState } = primus;
                if (primus.disconnect) {
                  primus.disconnect = false;
                  return primus.end();
                }
                primus.readyState = Primus2.CLOSED;
                if (readyState !== primus.readyState) {
                  primus.emit("readyStateChange", "end");
                }
                if (primus.timers.active("connect"))
                  primus.end();
                if (readyState !== Primus2.OPEN) {
                  return primus.recovery.reconnecting() ? primus.recovery.reconnect() : false;
                }
                this.writable = false;
                this.readable = false;
                this.timers.clear();
                primus.emit("close");
                if (~primus.options.strategy.indexOf("disconnect")) {
                  return primus.recovery.reconnect();
                }
                primus.emit("outgoing::end");
                primus.emit("end");
              });
              primus.client();
              for (const plugin in primus.ark) {
                primus.ark[plugin].call(primus, primus, options);
              }
              if (!primus.NETWORK_EVENTS)
                return primus;
              primus.offlineHandler = function offline() {
                if (!primus.online)
                  return;
                primus.online = false;
                primus.emit("offline");
                primus.end();
                primus.recovery.reset();
              };
              primus.onlineHandler = function online() {
                if (primus.online)
                  return;
                primus.online = true;
                primus.emit("online");
                if (~primus.options.strategy.indexOf("online")) {
                  primus.recovery.reconnect();
                }
              };
              if (window.addEventListener) {
                window.addEventListener("offline", primus.offlineHandler, false);
                window.addEventListener("online", primus.onlineHandler, false);
              } else if (document.body.attachEvent) {
                document.body.attachEvent("onoffline", primus.offlineHandler);
                document.body.attachEvent("ononline", primus.onlineHandler);
              }
              return primus;
            };
            Primus2.prototype.protocol = function protocol(msg) {
              if (typeof msg !== "string" || msg.indexOf("primus::") !== 0)
                return false;
              const last = msg.indexOf(":", 8);
              const value = msg.slice(last + 2);
              switch (msg.slice(8, last)) {
                case "ping":
                  this.emit("incoming::ping", +value);
                  break;
                case "server":
                  if (value === "close") {
                    this.disconnect = true;
                  }
                  break;
                case "id":
                  this.emit("incoming::id", value);
                  break;
                default:
                  return false;
              }
              return true;
            };
            Primus2.prototype.transforms = function transforms(primus, connection, type, data, raw) {
              const packet = { data };
              const fns = primus.transformers[type];
              (function transform(index, done) {
                const transformer = fns[index++];
                if (!transformer)
                  return done();
                if (transformer.length === 1) {
                  if (transformer.call(connection, packet) === false) {
                    return;
                  }
                  return transform(index, done);
                }
                transformer.call(connection, packet, function finished(err, arg) {
                  if (err)
                    return connection.emit("error", err);
                  if (arg === false)
                    return;
                  transform(index, done);
                });
              })(0, function done() {
                if (type === "incoming")
                  return connection.emit("data", packet.data, raw);
                connection._write(packet.data);
              });
              return this;
            };
            Primus2.prototype.id = function id(fn) {
              if (this.socket && this.socket.id)
                return fn(this.socket.id);
              this._write("primus::id::");
              return this.once("incoming::id", fn);
            };
            Primus2.prototype.open = function open() {
              context(this, "open");
              if (!this.recovery.reconnecting() && this.options.timeout)
                this.timeout();
              this.emit("outgoing::open");
              return this;
            };
            Primus2.prototype.write = function write(data) {
              context(this, "write");
              this.transforms(this, this, "outgoing", data);
              return true;
            };
            Primus2.prototype._write = function write(data) {
              const primus = this;
              if (Primus2.OPEN !== primus.readyState) {
                if (this.buffer.length === this.options.queueSize) {
                  this.buffer.splice(0, 1);
                }
                this.buffer.push(data);
                return false;
              }
              primus.encoder(data, function encoded(err, packet) {
                if (err)
                  return primus.listeners("error").length && primus.emit("error", err);
                if (typeof packet === "string") {
                  if (~packet.indexOf("\u2028"))
                    packet = packet.replace(u2028, "\\u2028");
                  if (~packet.indexOf("\u2029"))
                    packet = packet.replace(u2029, "\\u2029");
                }
                primus.emit("outgoing::data", packet);
              });
              return true;
            };
            Primus2.prototype.heartbeat = function heartbeat() {
              if (!this.options.pingTimeout)
                return this;
              this.timers.clear("heartbeat");
              this.timers.setTimeout("heartbeat", function expired() {
                if (!this.online)
                  return;
                this.online = false;
                this.emit("offline");
                this.emit("incoming::end");
              }, this.options.pingTimeout);
              return this;
            };
            Primus2.prototype.timeout = function timeout() {
              const primus = this;
              function remove() {
                primus.removeListener("error", remove).removeListener("open", remove).removeListener("end", remove).timers.clear("connect");
              }
              primus.timers.setTimeout("connect", function expired() {
                remove();
                if (primus.readyState === Primus2.OPEN || primus.recovery.reconnecting()) {
                  return;
                }
                primus.emit("timeout");
                if (~primus.options.strategy.indexOf("timeout")) {
                  primus.recovery.reconnect();
                } else {
                  primus.end();
                }
              }, primus.options.timeout);
              return primus.on("error", remove).on("open", remove).on("end", remove);
            };
            Primus2.prototype.end = function end(data) {
              context(this, "end");
              if (this.readyState === Primus2.CLOSED && !this.timers.active("connect") && !this.timers.active("open")) {
                if (this.recovery.reconnecting()) {
                  this.recovery.reset();
                  this.emit("end");
                }
                return this;
              }
              if (data !== void 0)
                this.write(data);
              this.writable = false;
              this.readable = false;
              const { readyState } = this;
              this.readyState = Primus2.CLOSED;
              if (readyState !== this.readyState) {
                this.emit("readyStateChange", "end");
              }
              this.timers.clear();
              this.emit("outgoing::end");
              this.emit("close");
              this.emit("end");
              return this;
            };
            Primus2.prototype.destroy = destroy("url timers options recovery socket transport transformers", {
              before: "end",
              after: ["removeAllListeners", function detach() {
                if (!this.NETWORK_EVENTS)
                  return;
                if (window.addEventListener) {
                  window.removeEventListener("offline", this.offlineHandler);
                  window.removeEventListener("online", this.onlineHandler);
                } else if (document.body.attachEvent) {
                  document.body.detachEvent("onoffline", this.offlineHandler);
                  document.body.detachEvent("ononline", this.onlineHandler);
                }
              }]
            });
            Primus2.prototype.clone = function clone(obj) {
              return this.merge({}, obj);
            };
            Primus2.prototype.merge = function merge(target) {
              for (var i = 1, key, obj; i < arguments.length; i++) {
                obj = arguments[i];
                for (key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key))
                    target[key] = obj[key];
                }
              }
              return target;
            };
            Primus2.prototype.parse = _dereq_("url-parse");
            Primus2.prototype.querystring = qs.parse;
            Primus2.prototype.querystringify = qs.stringify;
            Primus2.prototype.uri = function uri(options) {
              const { url } = this;
              const server = [];
              let qsa = false;
              if (options.query)
                qsa = true;
              options = options || {};
              options.protocol = "protocol" in options ? options.protocol : "http:";
              options.query = url.query && qsa ? url.query.slice(1) : false;
              options.secure = "secure" in options ? options.secure : url.protocol === "https:" || url.protocol === "wss:";
              options.auth = "auth" in options ? options.auth : url.auth;
              options.pathname = "pathname" in options ? options.pathname : this.pathname;
              options.port = "port" in options ? +options.port : +url.port || (options.secure ? 443 : 80);
              const querystring = this.querystring(options.query || "");
              querystring._primuscb = yeast();
              options.query = this.querystringify(querystring);
              this.emit("outgoing::url", options);
              server.push(options.secure ? options.protocol.replace(":", "s:") : options.protocol, "");
              server.push(options.auth ? `${options.auth}@${url.host}` : url.host);
              if (options.pathname)
                server.push(options.pathname.slice(1));
              if (qsa)
                server[server.length - 1] += `?${options.query}`;
              else
                delete options.query;
              if (options.object)
                return options;
              return server.join("/");
            };
            Primus2.prototype.transform = function transform(type, fn) {
              context(this, "transform");
              if (!(type in this.transformers)) {
                return this.critical(new Error("Invalid transformer type"));
              }
              this.transformers[type].push(fn);
              return this;
            };
            Primus2.prototype.critical = function critical(err) {
              if (this.emit("error", err))
                return this;
              throw err;
            };
            Primus2.connect = function connect(url, options) {
              return new Primus2(url, options);
            };
            Primus2.EventEmitter = EventEmitter;
            Primus2.prototype.client = function client() {
              const primus = this;
              let socket;
              const Factory = function factory() {
                if (typeof WebSocket !== "undefined")
                  return WebSocket;
                if (typeof MozWebSocket !== "undefined")
                  return MozWebSocket;
                try {
                  return Primus2.requires("ws");
                } catch (e) {
                }
                return void 0;
              }();
              if (!Factory) {
                return primus.critical(new Error(
                  "Missing required `ws` module. Please run `npm install --save ws`"
                ));
              }
              primus.on("outgoing::open", function opening() {
                primus.emit("outgoing::end");
                try {
                  const options = {
                    protocol: primus.url.protocol === "ws+unix:" ? "ws+unix:" : "ws:",
                    query: true
                  };
                  if (Factory.length === 3) {
                    if (options.protocol === "ws+unix:") {
                      options.pathname = `${primus.url.pathname}:${primus.pathname}`;
                    }
                    primus.socket = socket = new Factory(
                      primus.uri(options),
                      // URL
                      [],
                      // Sub protocols
                      primus.transport
                      // options.
                    );
                  } else {
                    primus.socket = socket = new Factory(primus.uri(options));
                    socket.binaryType = "arraybuffer";
                  }
                } catch (e) {
                  return primus.emit("error", e);
                }
                socket.onopen = primus.emits("incoming::open");
                socket.onerror = primus.emits("incoming::error");
                socket.onclose = primus.emits("incoming::end");
                socket.onmessage = primus.emits("incoming::data", function parse(next, evt) {
                  next(void 0, evt.data);
                });
              });
              primus.on("outgoing::data", function write(message) {
                if (!socket || socket.readyState !== Factory.OPEN)
                  return;
                try {
                  socket.send(message);
                } catch (e) {
                  primus.emit("incoming::error", e);
                }
              });
              primus.on("outgoing::reconnect", function reconnect() {
                primus.emit("outgoing::open");
              });
              primus.on("outgoing::end", function close() {
                if (!socket)
                  return;
                socket.onerror = socket.onopen = socket.onclose = socket.onmessage = function() {
                };
                socket.close();
                socket = null;
              });
            };
            Primus2.prototype.authorization = false;
            Primus2.prototype.pathname = "/primus";
            Primus2.prototype.encoder = function encoder(data, fn) {
              let err;
              try {
                data = JSON.stringify(data);
              } catch (e) {
                err = e;
              }
              fn(err, data);
            };
            Primus2.prototype.decoder = function decoder(data, fn) {
              let err;
              if (typeof data !== "string")
                return fn(err, data);
              try {
                data = JSON.parse(data);
              } catch (e) {
                err = e;
              }
              fn(err, data);
            };
            Primus2.prototype.version = "7.3.4";
            if (typeof document !== "undefined" && typeof navigator !== "undefined") {
              if (document.addEventListener) {
                document.addEventListener("keydown", function keydown(e) {
                  if (e.keyCode !== 27 || !e.preventDefault)
                    return;
                  e.preventDefault();
                }, false);
              }
              const ua = (navigator.userAgent || "").toLowerCase();
              const parsed = ua.match(/.+(?:rv|it|ra|ie)[/: ](\d+)\.(\d+)(?:\.(\d+))?/) || [];
              const version = +[parsed[1], parsed[2]].join(".");
              if (!~ua.indexOf("chrome") && ~ua.indexOf("safari") && version < 534.54) {
                Primus2.prototype.AVOID_WEBSOCKETS = true;
              }
            }
            module3.exports = Primus2;
          }, { demolish: 1, emits: 2, eventemitter3: 3, inherits: 4, querystringify: 8, recovery: 9, "tick-tock": 12, "url-parse": 14, yeast: 15 }]
        }, {}, [16])(16);
        Primus.prototype.ark.emitter = function() {
        };
        return Primus;
      },
      [
        function(Primus) {
          (function(Primus2, undefined2) {
            function spark(Spark, Emitter) {
              const { initialise } = Spark.prototype;
              Spark.prototype.initialise = function init() {
                if (!this.emitter)
                  this.emitter = new Emitter(this);
                if (!this.__initialise)
                  initialise.apply(this, arguments);
              };
              if (!Spark.readable)
                Spark.prototype.send = send;
              else if (!Spark.prototype.send)
                Spark.readable("send", send);
              function send(ev, data, fn) {
                if (/^(newListener|removeListener)/.test(ev))
                  return this;
                this.emitter.send.apply(this.emitter, arguments);
                return this;
              }
            }
            function emitter() {
              const { toString } = Object.prototype;
              const { slice } = Array.prototype;
              const isArray = Array.isArray || function isArray2(value) {
                return toString.call(value) === "[object Array]";
              };
              const packets = {
                EVENT: 0,
                ACK: 1
              };
              function Emitter(conn) {
                if (!(this instanceof Emitter))
                  return new Emitter(conn);
                this.ids = 1;
                this.acks = {};
                this.conn = conn;
                if (this.conn)
                  this.bind();
              }
              Emitter.prototype.bind = function bind() {
                const em = this;
                this.conn.on("data", function ondata(packet) {
                  em.ondata.call(em, packet);
                });
                return this;
              };
              Emitter.prototype.ondata = function ondata(packet) {
                if (!isArray(packet.data) || packet.id && typeof packet.id !== "number") {
                  return this;
                }
                switch (packet.type) {
                  case packets.EVENT:
                    this.onevent(packet);
                    break;
                  case packets.ACK:
                    this.onack(packet);
                }
                return this;
              };
              Emitter.prototype.send = function send() {
                const args = slice.call(arguments);
                this.conn.write(this.packet(args));
                return this;
              };
              Emitter.prototype.packet = function pack(args) {
                const packet = { type: packets.EVENT, data: args };
                if (typeof args[args.length - 1] === "function") {
                  const id = this.ids++;
                  this.acks[id] = args.pop();
                  packet.id = id;
                }
                return packet;
              };
              Emitter.prototype.onevent = function onevent(packet) {
                const args = packet.data;
                if (this.conn.reserved(args[0]))
                  return this;
                if (packet.id)
                  args.push(this.ack(packet.id));
                this.conn.emit.apply(this.conn, args);
                return this;
              };
              Emitter.prototype.ack = function ack(id) {
                const { conn } = this;
                let sent = false;
                return function() {
                  if (sent)
                    return;
                  sent = true;
                  conn.write({
                    id,
                    type: packets.ACK,
                    data: slice.call(arguments)
                  });
                };
              };
              Emitter.prototype.onack = function onack(packet) {
                const ack = this.acks[packet.id];
                if (typeof ack === "function") {
                  ack.apply(this, packet.data);
                  delete this.acks[packet.id];
                }
                return this;
              };
              Emitter.packets = packets;
              return Emitter;
            }
            if (undefined2 === Primus2)
              return;
            Primus2.$ = Primus2.$ || {};
            Primus2.$.emitter = {};
            Primus2.$.emitter.spark = spark;
            Primus2.$.emitter.emitter = emitter;
            spark(Primus2, emitter());
          })(Primus);
        }
      ]
    );
  }
});
export default require_primus_client();
//# sourceMappingURL=primus-client.js.map
