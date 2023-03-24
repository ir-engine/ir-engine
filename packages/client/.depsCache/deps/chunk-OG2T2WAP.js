import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@hookstate/core/dist/index.es.js
var import_react = __toESM(require_react());
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2)
      if (Object.prototype.hasOwnProperty.call(b2, p))
        d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var hasOwnProperty = Object.prototype.hasOwnProperty;
function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
var none = Symbol("none");
var __state = Symbol("__state");
function createState(initial) {
  return hookstate(initial);
}
function createHookstate(initial) {
  return hookstate(initial);
}
function hookstate(initial, extension) {
  var store = createStore(initial);
  store.activate(extension);
  var methods = store.toMethods();
  var devtools = createState[DevToolsID];
  if (devtools) {
    methods.attach(devtools);
  }
  return methods.self();
}
function useState(source) {
  return useHookstate(source);
}
function extend(e1, e2, e3, e4, e5) {
  function extended(extensions) {
    var exts = extensions.map(function(i) {
      return i();
    });
    var onInitCbs = exts.map(function(i) {
      return i.onInit;
    }).filter(function(i) {
      return i;
    });
    var onPremergeCbs = exts.map(function(i) {
      return i.onPremerge;
    }).filter(function(i) {
      return i;
    });
    var onPresetCbs = exts.map(function(i) {
      return i.onPreset;
    }).filter(function(i) {
      return i;
    });
    var onSetCbs = exts.map(function(i) {
      return i.onSet;
    }).filter(function(i) {
      return i;
    });
    var onDestroyCbs = exts.map(function(i) {
      return i.onDestroy;
    }).filter(function(i) {
      return i;
    });
    var result = {
      onCreate: function(instanceFactory, combinedMethods) {
        for (var _i = 0, exts_1 = exts; _i < exts_1.length; _i++) {
          var ext = exts_1[_i];
          if (ext.onCreate) {
            var extMethods = ext.onCreate(instanceFactory, combinedMethods);
            Object.assign(combinedMethods, extMethods);
          }
        }
        return combinedMethods;
      }
    };
    if (onInitCbs.length > 0) {
      result.onInit = function(s, e) {
        for (var _i = 0, onInitCbs_1 = onInitCbs; _i < onInitCbs_1.length; _i++) {
          var cb = onInitCbs_1[_i];
          cb(s, e);
        }
      };
    }
    if (onPremergeCbs.length > 0) {
      result.onPremerge = function(s, d) {
        for (var _i = 0, onPremergeCbs_1 = onPremergeCbs; _i < onPremergeCbs_1.length; _i++) {
          var cb = onPremergeCbs_1[_i];
          cb(s, d);
        }
      };
    }
    if (onPresetCbs.length > 0) {
      result.onPreset = function(s, d) {
        for (var _i = 0, onPresetCbs_1 = onPresetCbs; _i < onPresetCbs_1.length; _i++) {
          var cb = onPresetCbs_1[_i];
          cb(s, d);
        }
      };
    }
    if (onSetCbs.length > 0) {
      result.onSet = function(s, d) {
        for (var _i = 0, onSetCbs_1 = onSetCbs; _i < onSetCbs_1.length; _i++) {
          var cb = onSetCbs_1[_i];
          cb(s, d);
        }
      };
    }
    if (onDestroyCbs.length > 0) {
      result.onDestroy = function(s) {
        for (var _i = 0, onDestroyCbs_1 = onDestroyCbs; _i < onDestroyCbs_1.length; _i++) {
          var cb = onDestroyCbs_1[_i];
          cb(s);
        }
      };
    }
    return result;
  }
  return function() {
    return extended([e1, e2, e3, e4, e5].filter(function(i) {
      return i;
    }));
  };
}
function useHookstate(source, extension) {
  var parentMethods = Object(source) === source ? source[self] : void 0;
  if (parentMethods) {
    if (parentMethods.isMounted) {
      var initializer = function() {
        var store = parentMethods.store;
        var onSetUsedCallback = function() {
          return setValue_1({
            store,
            state: state2,
            source: value_1.source
            // mutable, get the latest from value
          });
        };
        var state2 = new StateMethodsImpl(store, parentMethods.path, store.get(parentMethods.path), store.edition, onSetUsedCallback);
        return {
          store,
          state: state2,
          source
        };
      };
      var _a = import_react.default.useState(initializer), value_1 = _a[0], setValue_1 = _a[1];
      if (value_1.store !== parentMethods.store || !("source" in value_1)) {
        throw new StateInvalidUsageError(parentMethods.path, ErrorId.InitStateStoreSwitchover);
      }
      Object.defineProperty(value_1, "store", { enumerable: false });
      Object.defineProperty(value_1, "state", { enumerable: false });
      Object.defineProperty(value_1, "source", { enumerable: false });
      value_1.state.reconstruct(
        parentMethods.path,
        value_1.store.get(parentMethods.path),
        value_1.store.edition,
        // parent state object has changed its reference object
        // so the scopped state should change too
        value_1.source !== source
      );
      value_1.source = source;
      parentMethods.subscribe(value_1.state);
      useIsomorphicLayoutEffect(function() {
        value_1.state.onMount();
        parentMethods.subscribe(value_1.state);
        return function() {
          value_1.state.onUnmount();
          parentMethods.unsubscribe(value_1.state);
        };
      }, []);
      var state = value_1.state.self();
      value_1["[hookstate(scoped)]"] = state;
      return state;
    } else {
      var initializer = function() {
        var store = parentMethods.store;
        var onSetUsedCallback = function() {
          return setValue_2({
            store,
            state: state2,
            source: value_2.source
            // mutable, get the latest from value
          });
        };
        var state2 = new StateMethodsImpl(store, RootPath, store.get(RootPath), store.edition, onSetUsedCallback);
        return {
          store,
          state: state2,
          source
        };
      };
      var _b = import_react.default.useState(initializer), value_2 = _b[0], setValue_2 = _b[1];
      if (value_2.store !== parentMethods.store || !("source" in value_2)) {
        throw new StateInvalidUsageError(parentMethods.path, ErrorId.InitStateStoreSwitchover);
      }
      Object.defineProperty(value_2, "store", { enumerable: false });
      Object.defineProperty(value_2, "state", { enumerable: false });
      Object.defineProperty(value_2, "source", { enumerable: false });
      value_2.state.reconstruct(
        RootPath,
        value_2.store.get(RootPath),
        value_2.store.edition,
        // parent state object has changed its reference object
        // so the scopped state should change too
        value_2.source !== source
      );
      value_2.source = source;
      value_2.store.subscribe(value_2.state);
      useIsomorphicLayoutEffect(function() {
        value_2.state.onMount();
        value_2.store.subscribe(value_2.state);
        return function() {
          value_2.state.onUnmount();
          value_2.store.unsubscribe(value_2.state);
        };
      }, []);
      var state = value_2.state.self();
      for (var ind = 0; ind < parentMethods.path.length; ind += 1) {
        state = state.nested(parentMethods.path[ind]);
      }
      value_2["[hookstate(global)]"] = state;
      return state;
    }
  } else {
    var initializer = function() {
      var store = createStore(source);
      var onSetUsedCallback = function() {
        return setValue_3({
          store,
          state: state2
        });
      };
      var state2 = new StateMethodsImpl(store, RootPath, store.get(RootPath), store.edition, onSetUsedCallback);
      return {
        store,
        state: state2
      };
    };
    var _c = import_react.default.useState(initializer), value_3 = _c[0], setValue_3 = _c[1];
    if ("source" in value_3) {
      throw new StateInvalidUsageError(RootPath, ErrorId.InitStateStoreSwitchover);
    }
    Object.defineProperty(value_3, "store", { enumerable: false });
    Object.defineProperty(value_3, "state", { enumerable: false });
    value_3.state.reconstruct(RootPath, value_3.store.get(RootPath), value_3.store.edition, false);
    value_3.store.subscribe(value_3.state);
    value_3.store.activate(extension);
    useIsomorphicLayoutEffect(function() {
      value_3.state.onMount();
      value_3.store.subscribe(value_3.state);
      value_3.store.activate(extension);
      return function() {
        value_3.state.onUnmount();
        value_3.store.unsubscribe(value_3.state);
        value_3.store.deactivate();
      };
    }, []);
    var devtools = useState[DevToolsID];
    if (devtools) {
      value_3.state.attach(devtools);
    }
    var state = value_3.state.self();
    value_3["[hookstate(local)]"] = state;
    return state;
  }
}
function StateFragment(props) {
  var scoped = useHookstate(props.state, props.extension);
  return props.suspend && suspend(scoped) || props.children(scoped);
}
function suspend(state) {
  var p = state.promise;
  return p && import_react.default.createElement(import_react.default.lazy(function() {
    return p;
  }));
}
function Downgraded() {
  return {
    id: DowngradedID
  };
}
var DevToolsID = Symbol("DevTools");
function DevTools(state) {
  var plugin = state.attach(DevToolsID);
  if (plugin[0] instanceof Error) {
    return EmptyDevToolsExtensions;
  }
  return plugin[0];
}
var self = Symbol("self");
var EmptyDevToolsExtensions = {
  label: function() {
  },
  log: function() {
  }
};
var ErrorId;
(function(ErrorId2) {
  ErrorId2[ErrorId2["StateUsedInDependencyList"] = 100] = "StateUsedInDependencyList";
  ErrorId2[ErrorId2["InitStateToValueFromState"] = 101] = "InitStateToValueFromState";
  ErrorId2[ErrorId2["SetStateToValueFromState"] = 102] = "SetStateToValueFromState";
  ErrorId2[ErrorId2["GetStateWhenPromised"] = 103] = "GetStateWhenPromised";
  ErrorId2[ErrorId2["SetStateWhenPromised"] = 104] = "SetStateWhenPromised";
  ErrorId2[ErrorId2["SetStateNestedToPromised"] = 105] = "SetStateNestedToPromised";
  ErrorId2[ErrorId2["SetStateWhenDestroyed"] = 106] = "SetStateWhenDestroyed";
  ErrorId2[ErrorId2["ToJson_Value"] = 108] = "ToJson_Value";
  ErrorId2[ErrorId2["ToJson_State"] = 109] = "ToJson_State";
  ErrorId2[ErrorId2["GetProperty_Function"] = 110] = "GetProperty_Function";
  ErrorId2[ErrorId2["InitStateStoreSwitchover"] = 111] = "InitStateStoreSwitchover";
  ErrorId2[ErrorId2["GetUnknownPlugin"] = 120] = "GetUnknownPlugin";
  ErrorId2[ErrorId2["SetProperty_State"] = 201] = "SetProperty_State";
  ErrorId2[ErrorId2["SetProperty_Value"] = 202] = "SetProperty_Value";
  ErrorId2[ErrorId2["SetPrototypeOf_State"] = 203] = "SetPrototypeOf_State";
  ErrorId2[ErrorId2["SetPrototypeOf_Value"] = 204] = "SetPrototypeOf_Value";
  ErrorId2[ErrorId2["PreventExtensions_State"] = 205] = "PreventExtensions_State";
  ErrorId2[ErrorId2["PreventExtensions_Value"] = 206] = "PreventExtensions_Value";
  ErrorId2[ErrorId2["DefineProperty_State"] = 207] = "DefineProperty_State";
  ErrorId2[ErrorId2["DefineProperty_Value"] = 208] = "DefineProperty_Value";
  ErrorId2[ErrorId2["DeleteProperty_State"] = 209] = "DeleteProperty_State";
  ErrorId2[ErrorId2["DeleteProperty_Value"] = 210] = "DeleteProperty_Value";
  ErrorId2[ErrorId2["Construct_State"] = 211] = "Construct_State";
  ErrorId2[ErrorId2["Construct_Value"] = 212] = "Construct_Value";
  ErrorId2[ErrorId2["Apply_State"] = 213] = "Apply_State";
  ErrorId2[ErrorId2["Apply_Value"] = 214] = "Apply_Value";
})(ErrorId || (ErrorId = {}));
var StateInvalidUsageError = (
  /** @class */
  function(_super) {
    __extends(StateInvalidUsageError2, _super);
    function StateInvalidUsageError2(path, id, details) {
      return _super.call(this, "Error: HOOKSTATE-".concat(id, " [path: /").concat(path.join("/")).concat(details ? ", details: ".concat(details) : "", "]. ") + "See https://hookstate.js.org/docs/exceptions#hookstate-".concat(id)) || this;
    }
    return StateInvalidUsageError2;
  }(Error)
);
var DowngradedID = Symbol("Downgraded");
var SelfMethodsID = Symbol("ProxyMarker");
var RootPath = [];
var Store = (
  /** @class */
  function() {
    function Store2(_value) {
      var _this = this;
      this._value = _value;
      this.edition = 1;
      this._subscribers = /* @__PURE__ */ new Set();
      this._setSubscribers = /* @__PURE__ */ new Set();
      this._destroySubscribers = /* @__PURE__ */ new Set();
      this._plugins = /* @__PURE__ */ new Map();
      if (Object(_value) === _value && configuration.promiseDetector(_value)) {
        this.setPromised(_value);
      } else if (_value === none) {
        this.setPromised(void 0);
      }
      var onSetUsedStoreStateMethods = function() {
        _this._stateMethods.reconstruct(RootPath, _this.get(RootPath), _this.edition, false);
      };
      onSetUsedStoreStateMethods[IsUnmounted] = true;
      this._stateMethods = new StateMethodsImpl(this, RootPath, this.get(RootPath), this.edition, onSetUsedStoreStateMethods);
      this.subscribe(this._stateMethods);
    }
    Store2.prototype.setPromised = function(promise) {
      var _this = this;
      this._value = none;
      this._promiseError = void 0;
      this._promiseResolver = void 0;
      if (!promise) {
        this._promise = new Promise(function(resolve) {
          _this._promiseResolver = resolve;
        });
        return;
      }
      promise = promise.then(function(r) {
        if (_this._promise === promise) {
          _this._promise = void 0;
          _this._promiseError = void 0;
          _this._promiseResolver === void 0;
          _this.update(_this._stateMethods.self(), _this.set(RootPath, r, void 0));
        }
      }).catch(function(err) {
        if (_this._promise === promise) {
          _this._promise = void 0;
          _this._promiseResolver = void 0;
          _this._promiseError = err;
          _this.edition += 1;
          var ad = { path: RootPath };
          _this.update(_this._stateMethods.self(), ad);
        }
      });
      this._promise = promise;
    };
    Store2.prototype.activate = function(extensionFactory) {
      var _a, _b, _c, _d;
      if (this.edition < 0) {
        this.edition = -this.edition;
      }
      if (this._extension === void 0) {
        this._extension = extensionFactory === null || extensionFactory === void 0 ? void 0 : extensionFactory();
        this._extensionMethods = (_b = (_a = this._extension) === null || _a === void 0 ? void 0 : _a.onCreate) === null || _b === void 0 ? void 0 : _b.call(_a, this._stateMethods.self(), {});
        (_d = (_c = this._extension) === null || _c === void 0 ? void 0 : _c.onInit) === null || _d === void 0 ? void 0 : _d.call(_c, this._stateMethods.self(), this._extensionMethods || {});
      }
    };
    Store2.prototype.deactivate = function() {
      var _a, _b;
      var params = this._value !== none ? { state: this._value } : {};
      this._destroySubscribers.forEach(function(cb) {
        return cb(params);
      });
      if (this._extension) {
        (_b = (_a = this._extension).onDestroy) === null || _b === void 0 ? void 0 : _b.call(_a, this._stateMethods.self());
        delete this._extension;
        delete this._extensionMethods;
      }
      if (this.edition > 0) {
        this.edition = -this.edition;
      }
    };
    Object.defineProperty(Store2.prototype, "extension", {
      get: function() {
        return this._extensionMethods;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Store2.prototype, "promise", {
      get: function() {
        return this._promise;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Store2.prototype, "promiseError", {
      get: function() {
        return this._promiseError;
      },
      enumerable: false,
      configurable: true
    });
    Store2.prototype.get = function(path) {
      var result = this._value;
      if (result === none) {
        return result;
      }
      path.forEach(function(p) {
        result = result[p];
      });
      return result;
    };
    Store2.prototype.set = function(path, value, mergeValue) {
      var _a, _b;
      if (this.edition < 0) {
        throw new StateInvalidUsageError(path, ErrorId.SetStateWhenDestroyed);
      }
      if (path.length === 0) {
        var onSetArg = {
          path,
          state: value,
          value,
          previous: this._value,
          merged: mergeValue
        };
        if (value === none) {
          this.setPromised(void 0);
          delete onSetArg.value;
          delete onSetArg.state;
        } else if (Object(value) === value && configuration.promiseDetector(value)) {
          this.setPromised(value);
          value = none;
          delete onSetArg.value;
          delete onSetArg.state;
        } else if (this._promise && !this._promiseResolver) {
          throw new StateInvalidUsageError(path, ErrorId.SetStateWhenPromised);
        } else {
          this._promiseError = void 0;
        }
        var prevValue = this._value;
        if (prevValue === none) {
          delete onSetArg.previous;
        }
        this._value = value;
        this.afterSet(onSetArg);
        if (prevValue === none && this._value !== none && this._promiseResolver) {
          this._promise = void 0;
          this._promiseError = void 0;
          var resolver = this._promiseResolver;
          this._promiseResolver === void 0;
          resolver(this._value);
        }
        return {
          path
        };
      }
      if (Object(value) === value && configuration.promiseDetector(value)) {
        throw new StateInvalidUsageError(path, ErrorId.SetStateNestedToPromised);
      }
      var target = this._value;
      for (var i = 0; i < path.length - 1; i += 1) {
        target = target[path[i]];
      }
      var p = path[path.length - 1];
      if (p in target) {
        if (value !== none) {
          var prevValue = target[p];
          target[p] = value;
          this.afterSet({
            path,
            state: this._value,
            value,
            previous: prevValue,
            merged: mergeValue
          });
          return {
            path
          };
        } else {
          var prevValue = target[p];
          if (Array.isArray(target) && typeof p === "number") {
            target.splice(p, 1);
          } else {
            delete target[p];
          }
          this.afterSet({
            path,
            state: this._value,
            previous: prevValue,
            merged: mergeValue
          });
          return {
            path: path.slice(0, -1),
            actions: (_a = {}, _a[p] = "D", _a)
          };
        }
      }
      if (value !== none) {
        target[p] = value;
        this.afterSet({
          path,
          state: this._value,
          value,
          merged: mergeValue
        });
        return {
          path: path.slice(0, -1),
          actions: (_b = {}, _b[p] = "I", _b)
        };
      }
      return {
        path
      };
    };
    Store2.prototype.preset = function(state, value) {
      var _a, _b;
      (_b = (_a = this._extension) === null || _a === void 0 ? void 0 : _a.onPreset) === null || _b === void 0 ? void 0 : _b.call(_a, state, value);
    };
    Store2.prototype.premerge = function(state, value) {
      var _a, _b;
      (_b = (_a = this._extension) === null || _a === void 0 ? void 0 : _a.onPremerge) === null || _b === void 0 ? void 0 : _b.call(_a, state, value);
    };
    Store2.prototype.update = function(state, ad) {
      var _this = this;
      var _a, _b;
      (_b = (_a = this._extension) === null || _a === void 0 ? void 0 : _a.onSet) === null || _b === void 0 ? void 0 : _b.call(_a, state, ad);
      var actions = /* @__PURE__ */ new Set();
      if (ad.actions && Object.values(ad.actions).findIndex(function(i) {
        return i !== "U";
      }) === -1) {
        Object.keys(ad.actions).forEach(function(key) {
          _this._subscribers.forEach(function(s) {
            return s.onSet({ path: ad.path.concat(key) }, actions);
          });
        });
      } else {
        this._subscribers.forEach(function(s) {
          return s.onSet(ad, actions);
        });
      }
      actions.forEach(function(a) {
        return a();
      });
    };
    Store2.prototype.afterSet = function(params) {
      if (this.edition > 0) {
        this.edition += 1;
      }
      if (this.edition < 0) {
        this.edition -= 1;
      }
      this._setSubscribers.forEach(function(cb) {
        return cb(params);
      });
    };
    Store2.prototype.getPlugin = function(pluginId) {
      return this._plugins.get(pluginId);
    };
    Store2.prototype.register = function(plugin) {
      var existingInstance = this._plugins.get(plugin.id);
      if (existingInstance) {
        return;
      }
      var pluginCallbacks = plugin.init ? plugin.init(this._stateMethods.self()) : {};
      this._plugins.set(plugin.id, pluginCallbacks);
      if (pluginCallbacks.onSet) {
        this._setSubscribers.add(function(p) {
          return pluginCallbacks.onSet(p);
        });
      }
      if (pluginCallbacks.onDestroy) {
        this._destroySubscribers.add(function(p) {
          return pluginCallbacks.onDestroy(p);
        });
      }
    };
    Store2.prototype.toMethods = function() {
      return this._stateMethods;
    };
    Store2.prototype.subscribe = function(l) {
      this._subscribers.add(l);
    };
    Store2.prototype.unsubscribe = function(l) {
      this._subscribers.delete(l);
    };
    Store2.prototype.destroy = function() {
      this.deactivate();
    };
    Store2.prototype.toJSON = function() {
      throw new StateInvalidUsageError(RootPath, ErrorId.ToJson_Value);
    };
    return Store2;
  }()
);
var UnusedValue = Symbol("UnusedValue");
var IsUnmounted = Symbol("IsUnmounted");
var StateMethodsImpl = (
  /** @class */
  function() {
    function StateMethodsImpl2(store, path, valueSource, valueEdition, onSetUsed) {
      this.store = store;
      this.path = path;
      this.valueSource = valueSource;
      this.valueEdition = valueEdition;
      this.onSetUsed = onSetUsed;
      this.valueUsed = UnusedValue;
    }
    Object.defineProperty(StateMethodsImpl2.prototype, __state, {
      get: function() {
        return [this.get(), this.self()];
      },
      enumerable: false,
      configurable: true
    });
    StateMethodsImpl2.prototype.reconstruct = function(path, valueSource, valueEdition, reset) {
      this.path = path;
      this.valueSource = valueSource;
      this.valueEdition = valueEdition;
      this.valueUsed = UnusedValue;
      if (reset) {
        delete this.selfUsed;
        delete this.childrenCreated;
        delete this.childrenUsedPrevious;
      } else {
        this.valueUsedNoProxyPrevious = this.valueUsedNoProxy;
        this.childrenUsedPrevious = this.childrenUsed;
      }
      delete this.valueUsedNoProxy;
      delete this.childrenUsed;
    };
    StateMethodsImpl2.prototype.reconnect = function() {
      this.get({ __internalAllowPromised: true, noproxy: this.valueUsedNoProxyPrevious });
      this.childrenUsed = __assign(__assign({}, this.childrenUsedPrevious), this.childrenUsed);
    };
    StateMethodsImpl2.prototype.getUntracked = function(__internalAllowPromised) {
      if (this.valueEdition !== this.store.edition) {
        this.valueSource = this.store.get(this.path);
        this.valueEdition = this.store.edition;
        if (this.valueUsed !== UnusedValue) {
          this.valueUsed = UnusedValue;
          this.get({ __internalAllowPromised: true });
        }
      }
      if (__internalAllowPromised) {
        return this.valueSource;
      }
      if (this.store.promiseError) {
        throw this.store.promiseError;
      }
      if (this.store.promise) {
        throw new StateInvalidUsageError(this.path, ErrorId.GetStateWhenPromised);
      }
      return this.valueSource;
    };
    StateMethodsImpl2.prototype.get = function(options) {
      var _a;
      var valueSource = this.getUntracked(options === null || options === void 0 ? void 0 : options.__internalAllowPromised);
      if (options === null || options === void 0 ? void 0 : options.stealth) {
        return valueSource;
      }
      if (this.valueUsed === UnusedValue) {
        if (Array.isArray(valueSource)) {
          this.valueUsed = this.valueArrayImpl(valueSource);
        } else if (Object(valueSource) === valueSource) {
          if (((_a = valueSource.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Object") {
            this.valueUsed = this.valueObjectImpl(valueSource);
          } else {
            this.valueUsedNoProxy = true;
            this.valueUsed = valueSource;
          }
        } else {
          this.valueUsed = valueSource;
        }
      }
      if (options === null || options === void 0 ? void 0 : options.noproxy) {
        this.valueUsedNoProxy = true;
        return valueSource;
      }
      return this.valueUsed;
    };
    Object.defineProperty(StateMethodsImpl2.prototype, "value", {
      get: function() {
        return this.get();
      },
      enumerable: false,
      configurable: true
    });
    StateMethodsImpl2.prototype.setUntracked = function(newValue, mergeValue) {
      var r = this.setUntrackedV4(newValue, mergeValue);
      if (r) {
        return [r.path];
      }
      return [];
    };
    StateMethodsImpl2.prototype.setUntrackedV4 = function(newValue, mergeValue) {
      if (typeof newValue === "function") {
        newValue = newValue(this.getUntracked());
      }
      this.store.preset(this.self(), newValue);
      if (Object(newValue) === newValue && newValue[SelfMethodsID]) {
        throw new StateInvalidUsageError(this.path, ErrorId.SetStateToValueFromState);
      }
      if (newValue !== Object(newValue) && newValue === this.getUntracked(true)) {
        return null;
      }
      return this.store.set(this.path, newValue, mergeValue);
    };
    StateMethodsImpl2.prototype.set = function(newValue) {
      var ad = this.setUntrackedV4(newValue);
      if (ad) {
        this.store.update(this.self(), ad);
      }
    };
    StateMethodsImpl2.prototype.mergeUntracked = function(sourceValue) {
      var r = this.mergeUntrackedV4(sourceValue);
      if (r) {
        return [r.path];
      }
      return [];
    };
    StateMethodsImpl2.prototype.mergeUntrackedV4 = function(sourceValue) {
      var currentValue = this.getUntracked();
      if (typeof sourceValue === "function") {
        sourceValue = sourceValue(currentValue);
      }
      this.store.premerge(this.self(), sourceValue);
      if (Array.isArray(currentValue)) {
        if (Array.isArray(sourceValue)) {
          var ad_1 = { path: this.path, actions: {} };
          sourceValue.forEach(function(e, i) {
            ad_1.actions[currentValue.push(e) - 1] = "I";
          });
          if (Object.keys(ad_1.actions).length > 0) {
            this.setUntrackedV4(currentValue, sourceValue);
            return ad_1;
          }
          return null;
        } else {
          var ad_2 = { path: this.path, actions: {} };
          var deletedIndexes_1 = [];
          Object.keys(sourceValue).sort().forEach(function(i) {
            var index = Number(i);
            var newPropValue = sourceValue[index];
            if (newPropValue === none) {
              ad_2.actions[index] = "D";
              deletedIndexes_1.push(index);
            } else {
              if (index in currentValue) {
                ad_2.actions[index] = "U";
              } else {
                ad_2.actions[index] = "I";
              }
              currentValue[index] = newPropValue;
            }
          });
          deletedIndexes_1.reverse().forEach(function(p) {
            currentValue.splice(p, 1);
          });
          if (Object.keys(ad_2.actions).length > 0) {
            this.setUntrackedV4(currentValue, sourceValue);
            return ad_2;
          }
          return null;
        }
      } else if (Object(currentValue) === currentValue) {
        var ad_3 = { path: this.path, actions: {} };
        Object.keys(sourceValue).forEach(function(key) {
          var newPropValue = sourceValue[key];
          if (newPropValue === none) {
            ad_3.actions[key] = "D";
            delete currentValue[key];
          } else {
            if (key in currentValue) {
              ad_3.actions[key] = "U";
            } else {
              ad_3.actions[key] = "I";
            }
            currentValue[key] = newPropValue;
          }
        });
        if (Object.keys(ad_3.actions).length > 0) {
          this.setUntrackedV4(currentValue, sourceValue);
          return ad_3;
        }
        return null;
      } else if (typeof currentValue === "string") {
        return this.setUntrackedV4(currentValue + String(sourceValue), sourceValue);
      } else {
        return this.setUntrackedV4(sourceValue);
      }
    };
    StateMethodsImpl2.prototype.merge = function(sourceValue) {
      var r = this.mergeUntrackedV4(sourceValue);
      if (r) {
        this.store.update(this.self(), r);
      }
    };
    StateMethodsImpl2.prototype.nested = function(key) {
      return this.child(key).self();
    };
    StateMethodsImpl2.prototype.rerender = function(paths) {
      for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var path = paths_1[_i];
        this.store.update(this.self(), { path });
      }
    };
    StateMethodsImpl2.prototype.destroy = function() {
      this.store.destroy();
    };
    StateMethodsImpl2.prototype.subscribe = function(l) {
      if (this.subscribers === void 0) {
        this.subscribers = /* @__PURE__ */ new Set();
      }
      this.subscribers.add(l);
    };
    StateMethodsImpl2.prototype.unsubscribe = function(l) {
      if (this.subscribers) {
        this.subscribers.delete(l);
      }
    };
    Object.defineProperty(StateMethodsImpl2.prototype, "isMounted", {
      get: function() {
        return !this.onSetUsed[IsUnmounted];
      },
      enumerable: false,
      configurable: true
    });
    StateMethodsImpl2.prototype.onMount = function() {
      delete this.onSetUsed[IsUnmounted];
    };
    StateMethodsImpl2.prototype.onUnmount = function() {
      this.onSetUsed[IsUnmounted] = true;
    };
    StateMethodsImpl2.prototype.onSet = function(ad, actions) {
      var _this = this;
      var update = function() {
        var _a;
        var isAffected = false;
        if (_this.valueUsedNoProxy && _this.valueUsed !== UnusedValue) {
          actions.add(_this.onSetUsed);
          delete _this.selfUsed;
          isAffected = true;
        }
        var path = ad.path;
        var nextChildKey = path[_this.path.length];
        if (nextChildKey === void 0) {
          if (_this.valueUsed !== UnusedValue) {
            actions.add(_this.onSetUsed);
            delete _this.selfUsed;
            delete _this.childrenUsed;
            if (ad.actions && _this.childrenCreated) {
              if (Array.isArray(_this.valueSource) && Object.values(ad.actions).includes("D")) {
                var firstDeletedIndex = Object.keys(ad.actions).map(function(i) {
                  return Number(i);
                }).sort().find(function(i) {
                  var _a2;
                  return ((_a2 = ad.actions) === null || _a2 === void 0 ? void 0 : _a2[i]) === "D";
                });
                for (var childKey in _this.childrenCreated) {
                  if (Number(childKey) >= firstDeletedIndex || childKey in ad.actions) {
                    delete _this.childrenCreated[childKey];
                  }
                }
              } else {
                for (var childKey in ad.actions) {
                  delete _this.childrenCreated[childKey];
                }
              }
            } else {
              delete _this.childrenCreated;
            }
            return true;
          }
        } else {
          var nextChild = (_a = _this.childrenUsed) === null || _a === void 0 ? void 0 : _a[nextChildKey];
          if (nextChild && nextChild.onSet(ad, actions)) {
            delete _this.selfUsed;
            return true;
          }
        }
        return isAffected;
      };
      var updated = update();
      if (!updated && this.subscribers !== void 0) {
        this.subscribers.forEach(function(s) {
          if (s.onSet(ad, actions)) {
            delete _this.selfUsed;
          }
        });
      }
      return updated;
    };
    Object.defineProperty(StateMethodsImpl2.prototype, "keys", {
      get: function() {
        var value = this.get();
        if (Array.isArray(value)) {
          return Object.keys(value).map(function(i) {
            return Number(i);
          }).filter(function(i) {
            return Number.isInteger(i);
          });
        }
        if (Object(value) === value) {
          return Object.keys(value);
        }
        return void 0;
      },
      enumerable: false,
      configurable: true
    });
    StateMethodsImpl2.prototype.child = function(key) {
      this.childrenUsed = this.childrenUsed || {};
      var cachedChild = this.childrenUsed.hasOwnProperty(key) && this.childrenUsed[key];
      if (cachedChild) {
        return cachedChild;
      }
      var valueSource = this.valueSource[key];
      if (typeof valueSource === "function") {
        throw new StateInvalidUsageError(this.path, ErrorId.GetProperty_Function);
      }
      this.childrenCreated = this.childrenCreated || {};
      var child = this.childrenCreated[key];
      var r;
      if (child) {
        child.reconstruct(this.path.concat(key), valueSource, this.valueEdition, false);
        r = child;
      } else {
        r = new StateMethodsImpl2(this.store, this.path.concat(key), valueSource, this.valueEdition, this.onSetUsed);
        this.childrenCreated[key] = r;
      }
      if (this.valueUsedNoProxy) {
        r.valueUsedNoProxy = true;
      }
      this.childrenUsed[key] = r;
      return r;
    };
    StateMethodsImpl2.prototype.valueArrayImpl = function(currentValue) {
      var _this = this;
      return proxyWrap(this.path, currentValue, function() {
        return currentValue;
      }, function(target, key) {
        if (key === "length") {
          return target.length;
        }
        if (key in Array.prototype) {
          return Array.prototype[key];
        }
        if (key === SelfMethodsID) {
          return _this;
        }
        if (typeof key === "symbol") {
          return target[key];
        }
        var index = Number(key);
        if (!Number.isInteger(index)) {
          return void 0;
        }
        return _this.child(index).get();
      }, function(target, key, value) {
        if (typeof key === "symbol") {
          target[key] = value;
          return true;
        }
        throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
      }, true);
    };
    StateMethodsImpl2.prototype.valueObjectImpl = function(currentValue) {
      var _this = this;
      return proxyWrap(this.path, currentValue, function() {
        return currentValue;
      }, function(target, key) {
        if (key in Object.prototype) {
          return Object.prototype[key];
        }
        if (key === SelfMethodsID) {
          return _this;
        }
        if (typeof key === "symbol") {
          return target[key];
        }
        return _this.child(key).get();
      }, function(target, key, value) {
        if (typeof key === "symbol") {
          target[key] = value;
          return true;
        }
        throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_Value);
      }, true);
    };
    StateMethodsImpl2.prototype.self = function() {
      var _this = this;
      if (this.selfUsed) {
        return this.selfUsed;
      }
      var getter = function(_, key) {
        if (key === self) {
          return _this;
        }
        if (typeof key === "symbol") {
          return void 0;
        }
        if (key === "toJSON") {
          throw new StateInvalidUsageError(_this.path, ErrorId.ToJson_State);
        }
        var nestedGetter = function(prop) {
          var currentValue = _this.get({ __internalAllowPromised: prop === "$$typeof" || prop === "constructor" });
          if (prop in Object.prototype) {
            return Object.prototype[prop];
          }
          if (
            // if currentValue is primitive type
            Object(currentValue) !== currentValue && // if promised, it will be none
            currentValue !== none
          ) {
            return void 0;
          }
          if (Array.isArray(currentValue)) {
            if (prop === "length") {
              return currentValue.length;
            }
            if (prop in Array.prototype) {
              return Array.prototype[prop];
            }
            var index = Number(prop);
            if (!Number.isInteger(index)) {
              return void 0;
            }
            return _this.nested(index);
          }
          return _this.nested(prop.toString());
        };
        switch (key) {
          case "path":
            return _this.path;
          case "keys":
            return _this.keys;
          case "value":
            return _this.value;
          case "ornull":
            return _this.ornull;
          case "promised":
            return _this.promised;
          case "promise":
            return _this.promise;
          case "error":
            return _this.error;
          case "get":
            return function(opts) {
              return _this.get(opts);
            };
          case "set":
            return function(p) {
              return _this.set(p);
            };
          case "merge":
            return function(p) {
              return _this.merge(p);
            };
          case "nested":
            return function(p) {
              return nestedGetter(p);
            };
          case "attach":
            return function(p) {
              return _this.attach(p);
            };
          case "destroy":
            return function() {
              return _this.destroy();
            };
          default:
            var ext = _this.store.extension;
            if (ext && key in ext) {
              return ext[key](_this.self());
            }
            return nestedGetter(key);
        }
      };
      this.selfUsed = proxyWrap(this.path, this.valueSource, function(opts) {
        return _this.get({ __internalAllowPromised: true, stealth: opts === null || opts === void 0 ? void 0 : opts.stealth });
      }, getter, function(_, key, value) {
        throw new StateInvalidUsageError(_this.path, ErrorId.SetProperty_State);
      }, false);
      return this.selfUsed;
    };
    Object.defineProperty(StateMethodsImpl2.prototype, "promised", {
      get: function() {
        this.get({ __internalAllowPromised: true });
        return !!this.store.promise;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateMethodsImpl2.prototype, "promise", {
      get: function() {
        var _this = this;
        var _a;
        this.get({ __internalAllowPromised: true });
        return (_a = this.store.promise) === null || _a === void 0 ? void 0 : _a.then(function(_) {
          return _this.self();
        });
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateMethodsImpl2.prototype, "error", {
      get: function() {
        this.get({ __internalAllowPromised: !!this.store.promiseError });
        return this.store.promiseError;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateMethodsImpl2.prototype, "ornull", {
      get: function() {
        var value = this.get();
        if (value === null || value === void 0) {
          return value;
        }
        return this.self();
      },
      enumerable: false,
      configurable: true
    });
    StateMethodsImpl2.prototype.attach = function(p) {
      if (typeof p === "function") {
        var pluginMeta = p();
        if (pluginMeta.id === DowngradedID) {
          this.valueUsedNoProxy = true;
          if (this.valueUsed !== UnusedValue) {
            var currentValue = this.getUntracked(true);
            this.valueUsed = currentValue;
          }
          return this.self();
        }
        this.store.register(pluginMeta);
        return this.self();
      } else {
        return [
          this.store.getPlugin(p) || new StateInvalidUsageError(this.path, ErrorId.GetUnknownPlugin, p.toString()),
          this
        ];
      }
    };
    return StateMethodsImpl2;
  }()
);
function proxyWrap(path, targetBootstrap, targetGetter, propertyGetter, propertySetter, isValueProxy) {
  var onInvalidUsage = function(op) {
    throw new StateInvalidUsageError(path, op);
  };
  if (Object(targetBootstrap) !== targetBootstrap) {
    targetBootstrap = {};
  }
  return new Proxy(targetBootstrap, {
    getPrototypeOf: function(_target) {
      var targetReal = targetGetter();
      if (targetReal === void 0 || targetReal === null) {
        return null;
      }
      if (targetReal === none) {
        return Object.getPrototypeOf(new Promise(function() {
        }));
      }
      return Object.getPrototypeOf(targetReal);
    },
    setPrototypeOf: function(_target, v) {
      return onInvalidUsage(isValueProxy ? ErrorId.SetPrototypeOf_State : ErrorId.SetPrototypeOf_Value);
    },
    isExtensible: function(_target) {
      return true;
    },
    preventExtensions: function(_target) {
      return onInvalidUsage(isValueProxy ? ErrorId.PreventExtensions_State : ErrorId.PreventExtensions_Value);
    },
    getOwnPropertyDescriptor: function(_target, p) {
      var targetReal = targetGetter();
      if (Object(targetReal) === targetReal) {
        var origin_1 = Object.getOwnPropertyDescriptor(targetReal, p);
        if (Array.isArray(targetReal) && p in Array.prototype) {
          return origin_1;
        }
        return origin_1 && {
          // should be configurable as may not exist on proxy target
          configurable: true,
          enumerable: origin_1.enumerable,
          get: function() {
            return propertyGetter(targetReal, p);
          },
          set: void 0
        };
      }
      if (isValueProxy || targetReal === none) {
        return void 0;
      }
      if (p === "value") {
        return {
          // should be configurable as does not exist on proxy target
          configurable: true,
          enumerable: true,
          get: function() {
            return targetGetter({ stealth: true });
          },
          set: void 0
        };
      }
      if (p === "path") {
        return {
          // should be configurable as does not exist on proxy target
          configurable: true,
          enumerable: true,
          get: function() {
            return path;
          },
          set: void 0
        };
      }
      return void 0;
    },
    has: function(_target, p) {
      if (typeof p === "symbol") {
        return false;
      }
      var targetReal = targetGetter();
      if (Object(targetReal) === targetReal) {
        return p in targetReal;
      }
      if (isValueProxy || targetReal === none) {
        return false;
      }
      return p === "value" || p === "path";
    },
    get: propertyGetter,
    set: propertySetter,
    deleteProperty: function(_target, p) {
      return onInvalidUsage(isValueProxy ? ErrorId.DeleteProperty_State : ErrorId.DeleteProperty_Value);
    },
    defineProperty: function(_target, p, attributes) {
      return onInvalidUsage(isValueProxy ? ErrorId.DefineProperty_State : ErrorId.DefineProperty_Value);
    },
    ownKeys: function(_target) {
      var targetReal = targetGetter();
      if (Array.isArray(targetReal)) {
        if (_target.length === void 0) {
          Object.defineProperty(targetBootstrap, "length", {
            value: 0,
            writable: true,
            enumerable: false,
            configurable: false
          });
        }
      }
      if (Object(targetReal) === targetReal) {
        return Object.getOwnPropertyNames(targetReal);
      }
      if (isValueProxy || targetReal === none) {
        return [];
      }
      return ["value", "path"];
    },
    apply: function(_target, thisArg, argArray) {
      return onInvalidUsage(isValueProxy ? ErrorId.Apply_State : ErrorId.Apply_Value);
    },
    construct: function(_target, argArray, newTarget) {
      return onInvalidUsage(isValueProxy ? ErrorId.Construct_State : ErrorId.Construct_Value);
    }
  });
}
function createStore(initial) {
  var initialValue = initial;
  if (typeof initial === "function") {
    initialValue = initial();
  }
  if (Object(initialValue) === initialValue && initialValue[SelfMethodsID]) {
    throw new StateInvalidUsageError(RootPath, ErrorId.InitStateToValueFromState);
  }
  return new Store(initialValue);
}
var configuration = {
  interceptDependencyListsMode: "always",
  // TODO this does not always work, so it is better if it is set by the app explictly. Document this
  isDevelopmentMode: typeof process === "object" && typeof process.env === "object" && true,
  promiseDetector: function(p) {
    return Promise.resolve(p) === p;
  },
  hiddenInterceptDependencyListsModeDebug: false
};
function configure(config) {
  var _a, _b, _c;
  configuration = {
    interceptDependencyListsMode: (_a = config.interceptDependencyListsMode) !== null && _a !== void 0 ? _a : configuration.interceptDependencyListsMode,
    isDevelopmentMode: (_b = config.isDevelopmentMode) !== null && _b !== void 0 ? _b : configuration.isDevelopmentMode,
    promiseDetector: (_c = config.promiseDetector) !== null && _c !== void 0 ? _c : configuration.promiseDetector,
    hiddenInterceptDependencyListsModeDebug: false
  };
  interceptReactHooks();
  if (configuration.interceptDependencyListsMode === "never") {
    configuration.hiddenInterceptDependencyListsModeDebug = false;
    import_react.default["useEffect"] = import_react.default["useEffect"] && useEffectOrigin;
    import_react.default["useLayoutEffect"] = import_react.default["useLayoutEffect"] && useLayoutEffectOrigin;
    import_react.default["useInsertionEffect"] = import_react.default["useInsertionEffect"] && useInsertionEffectOrigin;
    import_react.default["useImperativeHandle"] = import_react.default["useImperativeHandle"] && useImperativeHandleOrigin;
    import_react.default["useMemo"] = import_react.default["useMemo"] && useMemoOrigin;
    import_react.default["useCallback"] = import_react.default["useCallback"] && useCallbackOrigin;
    import_react.default["memo"] = import_react.default["memo"] && memoOrigin;
  } else {
    import_react.default["useEffect"] = import_react.default["useEffect"] && useEffectIntercept;
    import_react.default["useLayoutEffect"] = import_react.default["useLayoutEffect"] && useLayoutEffectIntercept;
    import_react.default["useInsertionEffect"] = import_react.default["useLayoutEffect"] && useInsertionEffectIntercept;
    import_react.default["useImperativeHandle"] = import_react.default["useImperativeHandle"] && useImperativeHandleIntercept;
    import_react.default["useMemo"] = import_react.default["useMemo"] && useMemoIntercept;
    import_react.default["useCallback"] = import_react.default["useCallback"] && useCallbackIntercept;
    import_react.default["memo"] = import_react.default["memo"] && memoIntercept;
    if (configuration.interceptDependencyListsMode === "development" && configuration.isDevelopmentMode) {
      configuration.hiddenInterceptDependencyListsModeDebug = true;
    }
  }
}
function reconnectDependencies(deps, fromIntercept) {
  for (var _i = 0, _a = deps || []; _i < _a.length; _i++) {
    var i = _a[_i];
    if (i === Object(i)) {
      var state = i[self];
      if (state) {
        if (fromIntercept && configuration.hiddenInterceptDependencyListsModeDebug) {
          throw new StateInvalidUsageError(state.path, ErrorId.StateUsedInDependencyList);
        }
        state.reconnect();
      }
    }
  }
  return deps;
}
var useEffectOrigin;
function useHookstateEffect(effect, deps) {
  reconnectDependencies(deps);
  return useEffectOrigin(effect, deps);
}
function useEffectIntercept(effect, deps) {
  reconnectDependencies(deps, true);
  return useEffectOrigin(effect, deps);
}
var useLayoutEffectOrigin;
function useHookstateLayoutEffect(effect, deps) {
  reconnectDependencies(deps);
  return useLayoutEffectOrigin(effect, deps);
}
function useLayoutEffectIntercept(effect, deps) {
  reconnectDependencies(deps, true);
  return useLayoutEffectOrigin(effect, deps);
}
var useInsertionEffectOrigin;
function useHookstateInsertionEffect(effect, deps) {
  reconnectDependencies(deps);
  return useInsertionEffectOrigin(effect, deps);
}
function useInsertionEffectIntercept(effect, deps) {
  reconnectDependencies(deps, true);
  return useInsertionEffectOrigin(effect, deps);
}
var useImperativeHandleOrigin;
function useHookstateImperativeHandle(ref, init, deps) {
  reconnectDependencies(deps);
  return useImperativeHandleOrigin(ref, init, deps);
}
function useImperativeHandleIntercept(ref, init, deps) {
  reconnectDependencies(deps, true);
  return useImperativeHandleOrigin(ref, init, deps);
}
var useMemoOrigin;
function useHookstateMemo(factory, deps) {
  reconnectDependencies(deps);
  return useMemoOrigin(factory, deps);
}
function useMemoIntercept(factory, deps) {
  reconnectDependencies(deps, true);
  return useMemoOrigin(factory, deps);
}
var useCallbackOrigin;
function useHookstateCallback(callback, deps) {
  reconnectDependencies(deps);
  return useCallbackOrigin(callback, deps);
}
function useCallbackIntercept(callback, deps) {
  reconnectDependencies(deps, true);
  return useCallbackOrigin(callback, deps);
}
var memoOrigin;
function hookstateMemo(Component, propsAreEqual) {
  return memoOrigin(Component, function(prevProps, nextProps) {
    reconnectDependencies(Object.keys(nextProps).map(function(i) {
      return nextProps[i];
    }));
    return (propsAreEqual || shallowEqual)(prevProps, nextProps);
  });
}
function memoIntercept(Component, propsAreEqual) {
  return memoOrigin(Component, function(prevProps, nextProps) {
    reconnectDependencies(Object.keys(nextProps).map(function(i) {
      return nextProps[i];
    }), true);
    return (propsAreEqual || shallowEqual)(prevProps, nextProps);
  });
}
function interceptReactHooks() {
  if (!useEffectOrigin && import_react.default["useEffect"]) {
    useEffectOrigin = import_react.default["useEffect"];
    import_react.default["useEffect"] = useEffectIntercept;
  }
  if (!useLayoutEffectOrigin && import_react.default["useLayoutEffect"]) {
    useLayoutEffectOrigin = import_react.default["useLayoutEffect"];
    import_react.default["useLayoutEffect"] = useLayoutEffectIntercept;
  }
  if (!useInsertionEffectOrigin && import_react.default["useInsertionEffect"]) {
    useInsertionEffectOrigin = import_react.default["useInsertionEffect"];
    import_react.default["useInsertionEffect"] = useInsertionEffectIntercept;
  }
  if (!useImperativeHandleOrigin && import_react.default["useImperativeHandle"]) {
    useImperativeHandleOrigin = import_react.default["useImperativeHandle"];
    import_react.default["useImperativeHandle"] = useImperativeHandleIntercept;
  }
  if (!useMemoOrigin && import_react.default["useMemo"]) {
    useMemoOrigin = import_react.default["useMemo"];
    import_react.default["useMemo"] = useMemoIntercept;
  }
  if (!useCallbackOrigin && import_react.default["useCallback"]) {
    useCallbackOrigin = import_react.default["useCallback"];
    import_react.default["useCallback"] = useCallbackIntercept;
  }
  if (!memoOrigin && import_react.default["memo"]) {
    memoOrigin = import_react.default["memo"];
    import_react.default["memo"] = memoIntercept;
  }
}
interceptReactHooks();
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffectOrigin : useEffectOrigin;

export {
  none,
  __state,
  createState,
  createHookstate,
  hookstate,
  useState,
  extend,
  useHookstate,
  StateFragment,
  suspend,
  Downgraded,
  DevToolsID,
  DevTools,
  configure,
  useHookstateEffect,
  useHookstateLayoutEffect,
  useHookstateInsertionEffect,
  useHookstateImperativeHandle,
  useHookstateMemo,
  useMemoIntercept,
  useHookstateCallback,
  hookstateMemo
};
//# sourceMappingURL=chunk-OG2T2WAP.js.map
