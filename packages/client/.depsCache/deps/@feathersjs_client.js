import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@feathersjs/client/dist/feathers.js
var require_feathers = __commonJS({
  "../../node_modules/@feathersjs/client/dist/feathers.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define([], factory);
      else if (typeof exports === "object")
        exports["feathers"] = factory();
      else
        root["feathers"] = factory();
    })(exports, function() {
      return (
        /******/
        function() {
          var __webpack_modules__ = {
            /***/
            "../authentication-client/lib/core.js": (
              /*!********************************************!*\
                !*** ../authentication-client/lib/core.js ***!
                \********************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
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
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                function _iterableToArrayLimit(arr, i) {
                  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
                  if (null != _i) {
                    var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
                    try {
                      if (_x = (_i = _i.call(arr)).next, 0 === i) {
                        if (Object(_i) !== _i)
                          return;
                        _n = false;
                      } else
                        for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = true)
                          ;
                    } catch (err) {
                      _d = true, _e = err;
                    } finally {
                      try {
                        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r))
                          return;
                      } finally {
                        if (_d)
                          throw _e;
                      }
                    }
                    return _arr;
                  }
                }
                function _arrayWithHoles(arr) {
                  if (Array.isArray(arr))
                    return arr;
                }
                function _defineProperties(target, props) {
                  for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor)
                      descriptor.writable = true;
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _classCallCheck(instance, Constructor) {
                  if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function");
                  }
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.AuthenticationClient = void 0;
                var errors_1 = __webpack_require__2(
                  /*! @feathersjs/errors */
                  "../errors/lib/index.js"
                );
                var storage_1 = __webpack_require__2(
                  /*! ./storage */
                  "../authentication-client/lib/storage.js"
                );
                var OauthError = function(_errors_1$FeathersErr) {
                  _inherits(OauthError2, _errors_1$FeathersErr);
                  var _super = _createSuper(OauthError2);
                  function OauthError2(message, data) {
                    _classCallCheck(this, OauthError2);
                    return _super.call(this, message, "OauthError", 401, "oauth-error", data);
                  }
                  return _createClass(OauthError2);
                }(errors_1.FeathersError);
                var getMatch = function getMatch2(location, key) {
                  var regex = new RegExp("(?:&?)".concat(key, "=([^&]*)"));
                  var match = location.hash ? location.hash.match(regex) : null;
                  if (match !== null) {
                    var _match = _slicedToArray(match, 2), value = _match[1];
                    return [value, regex];
                  }
                  return [null, regex];
                };
                var AuthenticationClient = function() {
                  function AuthenticationClient2(app, options) {
                    _classCallCheck(this, AuthenticationClient2);
                    var socket = app.io;
                    var storage = new storage_1.StorageWrapper(app.get("storage") || options.storage);
                    this.app = app;
                    this.options = options;
                    this.authenticated = false;
                    this.app.set("storage", storage);
                    if (socket) {
                      this.handleSocket(socket);
                    }
                  }
                  _createClass(AuthenticationClient2, [{
                    key: "service",
                    get: function get() {
                      return this.app.service(this.options.path);
                    }
                  }, {
                    key: "storage",
                    get: function get() {
                      return this.app.get("storage");
                    }
                  }, {
                    key: "handleSocket",
                    value: function handleSocket(socket) {
                      var _this = this;
                      socket.on("disconnect", function() {
                        if (_this.authenticated) {
                          _this.reAuthenticate(true);
                        }
                      });
                    }
                    /**
                     * Parse the access token or authentication error from the window location hash. Will remove it from the hash
                     * if found.
                     *
                     * @param location The window location
                     * @returns The access token if available, will throw an error if found, otherwise null
                     */
                  }, {
                    key: "getFromLocation",
                    value: function getFromLocation(location) {
                      var _getMatch = getMatch(location, this.options.locationKey), _getMatch2 = _slicedToArray(_getMatch, 2), accessToken = _getMatch2[0], tokenRegex = _getMatch2[1];
                      if (accessToken !== null) {
                        location.hash = location.hash.replace(tokenRegex, "");
                        return Promise.resolve(accessToken);
                      }
                      var _getMatch3 = getMatch(location, this.options.locationErrorKey), _getMatch4 = _slicedToArray(_getMatch3, 2), message = _getMatch4[0], errorRegex = _getMatch4[1];
                      if (message !== null) {
                        location.hash = location.hash.replace(errorRegex, "");
                        return Promise.reject(new OauthError(decodeURIComponent(message)));
                      }
                      return Promise.resolve(null);
                    }
                    /**
                     * Set the access token in storage.
                     *
                     * @param accessToken The access token to set
                     * @returns
                     */
                  }, {
                    key: "setAccessToken",
                    value: function setAccessToken(accessToken) {
                      return this.storage.setItem(this.options.storageKey, accessToken);
                    }
                    /**
                     * Returns the access token from storage or the window location hash.
                     *
                     * @returns The access token from storage or location hash
                     */
                  }, {
                    key: "getAccessToken",
                    value: function getAccessToken() {
                      var _this2 = this;
                      return this.storage.getItem(this.options.storageKey).then(function(accessToken) {
                        if (!accessToken && typeof window !== "undefined" && window.location) {
                          return _this2.getFromLocation(window.location);
                        }
                        return accessToken || null;
                      });
                    }
                    /**
                     * Remove the access token from storage
                     * @returns The removed access token
                     */
                  }, {
                    key: "removeAccessToken",
                    value: function removeAccessToken() {
                      return this.storage.removeItem(this.options.storageKey);
                    }
                    /**
                     * Reset the internal authentication state. Usually not necessary to call directly.
                     *
                     * @returns null
                     */
                  }, {
                    key: "reset",
                    value: function reset() {
                      this.app.set("authentication", null);
                      this.authenticated = false;
                      return Promise.resolve(null);
                    }
                  }, {
                    key: "handleError",
                    value: function handleError(error, type) {
                      var _this3 = this;
                      if (error.code > 400 && error.code < 408) {
                        var promise = this.removeAccessToken().then(function() {
                          return _this3.reset();
                        });
                        return type === "logout" ? promise : promise.then(function() {
                          return Promise.reject(error);
                        });
                      }
                      return this.reset().then(function() {
                        return Promise.reject(error);
                      });
                    }
                    /**
                     * Try to reauthenticate using the token from storage. Will do nothing if already authenticated unless
                     * `force` is true.
                     *
                     * @param force force reauthentication with the server
                     * @param strategy The name of the strategy to use. Defaults to `options.jwtStrategy`
                     * @returns The reauthentication result
                     */
                  }, {
                    key: "reAuthenticate",
                    value: function reAuthenticate() {
                      var _this4 = this;
                      var force = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
                      var strategy = arguments.length > 1 ? arguments[1] : void 0;
                      var authPromise = this.app.get("authentication");
                      if (!authPromise || force === true) {
                        authPromise = this.getAccessToken().then(function(accessToken) {
                          if (!accessToken) {
                            return _this4.handleError(new errors_1.NotAuthenticated("No accessToken found in storage"), "authenticate");
                          }
                          return _this4.authenticate({
                            strategy: strategy || _this4.options.jwtStrategy,
                            accessToken
                          });
                        });
                        this.app.set("authentication", authPromise);
                      }
                      return authPromise;
                    }
                    /**
                     * Authenticate using a specific strategy and data.
                     *
                     * @param authentication The authentication data
                     * @param params Additional parameters
                     * @returns The authentication result
                     */
                  }, {
                    key: "authenticate",
                    value: function authenticate(authentication, params) {
                      var _this5 = this;
                      if (!authentication) {
                        return this.reAuthenticate();
                      }
                      var promise = this.service.create(authentication, params).then(function(authResult) {
                        var accessToken = authResult.accessToken;
                        _this5.authenticated = true;
                        _this5.app.emit("login", authResult);
                        _this5.app.emit("authenticated", authResult);
                        return _this5.setAccessToken(accessToken).then(function() {
                          return authResult;
                        });
                      }).catch(function(error) {
                        return _this5.handleError(error, "authenticate");
                      });
                      this.app.set("authentication", promise);
                      return promise;
                    }
                    /**
                     * Log out the current user and remove their token. Will do nothing
                     * if not authenticated.
                     *
                     * @returns The log out result.
                     */
                  }, {
                    key: "logout",
                    value: function logout() {
                      var _this6 = this;
                      return Promise.resolve(this.app.get("authentication")).then(function() {
                        return _this6.service.remove(null).then(function(authResult) {
                          return _this6.removeAccessToken().then(function() {
                            return _this6.reset();
                          }).then(function() {
                            _this6.app.emit("logout", authResult);
                            return authResult;
                          });
                        });
                      }).catch(function(error) {
                        return _this6.handleError(error, "logout");
                      });
                    }
                  }]);
                  return AuthenticationClient2;
                }();
                exports2.AuthenticationClient = AuthenticationClient;
              }
            ),
            /***/
            "../authentication-client/lib/hooks/authentication.js": (
              /*!************************************************************!*\
                !*** ../authentication-client/lib/hooks/authentication.js ***!
                \************************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.authentication = void 0;
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                var authentication = function authentication2() {
                  return function(context, next) {
                    var app = context.app, params = context.params, path = context.path, method = context.method, service = context.app.authentication;
                    if ((0, commons_1.stripSlashes)(service.options.path) === path && method === "create") {
                      return next();
                    }
                    return Promise.resolve(app.get("authentication")).then(function(authResult) {
                      if (authResult) {
                        context.params = Object.assign({}, authResult, params);
                      }
                    }).then(next);
                  };
                };
                exports2.authentication = authentication;
              }
            ),
            /***/
            "../authentication-client/lib/hooks/index.js": (
              /*!***************************************************!*\
                !*** ../authentication-client/lib/hooks/index.js ***!
                \***************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.populateHeader = exports2.authentication = void 0;
                var authentication_1 = __webpack_require__2(
                  /*! ./authentication */
                  "../authentication-client/lib/hooks/authentication.js"
                );
                Object.defineProperty(exports2, "authentication", {
                  enumerable: true,
                  get: function get() {
                    return authentication_1.authentication;
                  }
                });
                var populate_header_1 = __webpack_require__2(
                  /*! ./populate-header */
                  "../authentication-client/lib/hooks/populate-header.js"
                );
                Object.defineProperty(exports2, "populateHeader", {
                  enumerable: true,
                  get: function get() {
                    return populate_header_1.populateHeader;
                  }
                });
              }
            ),
            /***/
            "../authentication-client/lib/hooks/populate-header.js": (
              /*!*************************************************************!*\
                !*** ../authentication-client/lib/hooks/populate-header.js ***!
                \*************************************************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                function _defineProperty(obj, key, value) {
                  key = _toPropertyKey(key);
                  if (key in obj) {
                    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
                  } else {
                    obj[key] = value;
                  }
                  return obj;
                }
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.populateHeader = void 0;
                var populateHeader = function populateHeader2() {
                  return function(context, next) {
                    var app = context.app, accessToken = context.params.accessToken;
                    var authentication = app.authentication;
                    if (app.rest && accessToken) {
                      var _authentication$optio = authentication.options, scheme = _authentication$optio.scheme, header = _authentication$optio.header;
                      var authHeader = "".concat(scheme, " ").concat(accessToken);
                      context.params.headers = Object.assign({}, _defineProperty({}, header, authHeader), context.params.headers);
                    }
                    return next();
                  };
                };
                exports2.populateHeader = populateHeader;
              }
            ),
            /***/
            "../authentication-client/lib/index.js": (
              /*!*********************************************!*\
                !*** ../authentication-client/lib/index.js ***!
                \*********************************************/
              /***/
              function(module2, exports2, __webpack_require__2) {
                "use strict";
                var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  var desc = Object.getOwnPropertyDescriptor(m, k);
                  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                      enumerable: true,
                      get: function get() {
                        return m[k];
                      }
                    };
                  }
                  Object.defineProperty(o, k2, desc);
                } : function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  o[k2] = m[k];
                });
                var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
                  Object.defineProperty(o, "default", {
                    enumerable: true,
                    value: v
                  });
                } : function(o, v) {
                  o["default"] = v;
                });
                var __importStar = this && this.__importStar || function(mod) {
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
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.defaults = exports2.defaultStorage = exports2.hooks = exports2.MemoryStorage = exports2.AuthenticationClient = exports2.getDefaultStorage = void 0;
                var core_1 = __webpack_require__2(
                  /*! ./core */
                  "../authentication-client/lib/core.js"
                );
                Object.defineProperty(exports2, "AuthenticationClient", {
                  enumerable: true,
                  get: function get() {
                    return core_1.AuthenticationClient;
                  }
                });
                var hooks = __importStar(__webpack_require__2(
                  /*! ./hooks */
                  "../authentication-client/lib/hooks/index.js"
                ));
                exports2.hooks = hooks;
                var storage_1 = __webpack_require__2(
                  /*! ./storage */
                  "../authentication-client/lib/storage.js"
                );
                Object.defineProperty(exports2, "MemoryStorage", {
                  enumerable: true,
                  get: function get() {
                    return storage_1.MemoryStorage;
                  }
                });
                var getDefaultStorage = function getDefaultStorage2() {
                  try {
                    return new storage_1.StorageWrapper(window.localStorage);
                  } catch (error) {
                  }
                  return new storage_1.MemoryStorage();
                };
                exports2.getDefaultStorage = getDefaultStorage;
                exports2.defaultStorage = (0, exports2.getDefaultStorage)();
                exports2.defaults = {
                  header: "Authorization",
                  scheme: "Bearer",
                  storageKey: "feathers-jwt",
                  locationKey: "access_token",
                  locationErrorKey: "error",
                  jwtStrategy: "jwt",
                  path: "/authentication",
                  Authentication: core_1.AuthenticationClient,
                  storage: exports2.defaultStorage
                };
                var init = function init2() {
                  var _options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                  var options = Object.assign({}, exports2.defaults, _options);
                  var Authentication = options.Authentication;
                  return function(app) {
                    var authentication = new Authentication(app, options);
                    app.authentication = authentication;
                    app.authenticate = authentication.authenticate.bind(authentication);
                    app.reAuthenticate = authentication.reAuthenticate.bind(authentication);
                    app.logout = authentication.logout.bind(authentication);
                    app.hooks([hooks.authentication(), hooks.populateHeader()]);
                  };
                };
                exports2["default"] = init;
                if (true) {
                  module2.exports = Object.assign(init, module2.exports);
                }
              }
            ),
            /***/
            "../authentication-client/lib/storage.js": (
              /*!***********************************************!*\
                !*** ../authentication-client/lib/storage.js ***!
                \***********************************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.StorageWrapper = exports2.MemoryStorage = void 0;
                var MemoryStorage = function() {
                  function MemoryStorage2() {
                    _classCallCheck(this, MemoryStorage2);
                    this.store = {};
                  }
                  _createClass(MemoryStorage2, [{
                    key: "getItem",
                    value: function getItem(key) {
                      return Promise.resolve(this.store[key]);
                    }
                  }, {
                    key: "setItem",
                    value: function setItem(key, value) {
                      return Promise.resolve(this.store[key] = value);
                    }
                  }, {
                    key: "removeItem",
                    value: function removeItem(key) {
                      var value = this.store[key];
                      delete this.store[key];
                      return Promise.resolve(value);
                    }
                  }]);
                  return MemoryStorage2;
                }();
                exports2.MemoryStorage = MemoryStorage;
                var StorageWrapper = function() {
                  function StorageWrapper2(storage) {
                    _classCallCheck(this, StorageWrapper2);
                    this.storage = storage;
                  }
                  _createClass(StorageWrapper2, [{
                    key: "getItem",
                    value: function getItem(key) {
                      return Promise.resolve(this.storage.getItem(key));
                    }
                  }, {
                    key: "setItem",
                    value: function setItem(key, value) {
                      return Promise.resolve(this.storage.setItem(key, value));
                    }
                  }, {
                    key: "removeItem",
                    value: function removeItem(key) {
                      return Promise.resolve(this.storage.removeItem(key));
                    }
                  }]);
                  return StorageWrapper2;
                }();
                exports2.StorageWrapper = StorageWrapper;
              }
            ),
            /***/
            "../commons/lib/debug.js": (
              /*!*******************************!*\
                !*** ../commons/lib/debug.js ***!
                \*******************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.createDebug = exports2.setDebug = exports2.noopDebug = void 0;
                var debuggers = {};
                function noopDebug() {
                  return function() {
                  };
                }
                exports2.noopDebug = noopDebug;
                var defaultInitializer = noopDebug;
                function setDebug(debug) {
                  defaultInitializer = debug;
                  Object.keys(debuggers).forEach(function(name) {
                    debuggers[name] = debug(name);
                  });
                }
                exports2.setDebug = setDebug;
                function createDebug(name) {
                  if (!debuggers[name]) {
                    debuggers[name] = defaultInitializer(name);
                  }
                  return function() {
                    return debuggers[name].apply(debuggers, arguments);
                  };
                }
                exports2.createDebug = createDebug;
              }
            ),
            /***/
            "../commons/lib/index.js": (
              /*!*******************************!*\
                !*** ../commons/lib/index.js ***!
                \*******************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _defineProperty(obj, key, value) {
                  key = _toPropertyKey(key);
                  if (key in obj) {
                    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
                  } else {
                    obj[key] = value;
                  }
                  return obj;
                }
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
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
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                function _iterableToArrayLimit(arr, i) {
                  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
                  if (null != _i) {
                    var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
                    try {
                      if (_x = (_i = _i.call(arr)).next, 0 === i) {
                        if (Object(_i) !== _i)
                          return;
                        _n = false;
                      } else
                        for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = true)
                          ;
                    } catch (err) {
                      _d = true, _e = err;
                    } finally {
                      try {
                        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r))
                          return;
                      } finally {
                        if (_d)
                          throw _e;
                      }
                    }
                    return _arr;
                  }
                }
                function _arrayWithHoles(arr) {
                  if (Array.isArray(arr))
                    return arr;
                }
                var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  var desc = Object.getOwnPropertyDescriptor(m, k);
                  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                      enumerable: true,
                      get: function get() {
                        return m[k];
                      }
                    };
                  }
                  Object.defineProperty(o, k2, desc);
                } : function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  o[k2] = m[k];
                });
                var __exportStar = this && this.__exportStar || function(m, exports3) {
                  for (var p in m)
                    if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                      __createBinding(exports3, m, p);
                };
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.createSymbol = exports2.isPromise = exports2._ = exports2.stripSlashes = void 0;
                function stripSlashes(name) {
                  return name.replace(/^(\/+)|(\/+)$/g, "");
                }
                exports2.stripSlashes = stripSlashes;
                exports2._ = {
                  each: function each(obj, callback) {
                    if (obj && typeof obj.forEach === "function") {
                      obj.forEach(callback);
                    } else if (exports2._.isObject(obj)) {
                      Object.keys(obj).forEach(function(key) {
                        return callback(obj[key], key);
                      });
                    }
                  },
                  some: function some(value, callback) {
                    return Object.keys(value).map(function(key) {
                      return [value[key], key];
                    }).some(function(_ref) {
                      var _ref2 = _slicedToArray(_ref, 2), val = _ref2[0], key = _ref2[1];
                      return callback(val, key);
                    });
                  },
                  every: function every(value, callback) {
                    return Object.keys(value).map(function(key) {
                      return [value[key], key];
                    }).every(function(_ref3) {
                      var _ref4 = _slicedToArray(_ref3, 2), val = _ref4[0], key = _ref4[1];
                      return callback(val, key);
                    });
                  },
                  keys: function keys(obj) {
                    return Object.keys(obj);
                  },
                  values: function values(obj) {
                    return exports2._.keys(obj).map(function(key) {
                      return obj[key];
                    });
                  },
                  isMatch: function isMatch(obj, item) {
                    return exports2._.keys(item).every(function(key) {
                      return obj[key] === item[key];
                    });
                  },
                  isEmpty: function isEmpty(obj) {
                    return exports2._.keys(obj).length === 0;
                  },
                  isObject: function isObject(item) {
                    return _typeof(item) === "object" && !Array.isArray(item) && item !== null;
                  },
                  isObjectOrArray: function isObjectOrArray(value) {
                    return _typeof(value) === "object" && value !== null;
                  },
                  extend: function extend(first) {
                    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                      rest[_key - 1] = arguments[_key];
                    }
                    return Object.assign.apply(Object, [first].concat(rest));
                  },
                  omit: function omit(obj) {
                    var result = exports2._.extend({}, obj);
                    for (var _len2 = arguments.length, keys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                      keys[_key2 - 1] = arguments[_key2];
                    }
                    keys.forEach(function(key) {
                      return delete result[key];
                    });
                    return result;
                  },
                  pick: function pick(source) {
                    for (var _len3 = arguments.length, keys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                      keys[_key3 - 1] = arguments[_key3];
                    }
                    return keys.reduce(function(result, key) {
                      if (source[key] !== void 0) {
                        result[key] = source[key];
                      }
                      return result;
                    }, {});
                  },
                  // Recursively merge the source object into the target object
                  merge: function merge(target, source) {
                    if (exports2._.isObject(target) && exports2._.isObject(source)) {
                      Object.keys(source).forEach(function(key) {
                        if (exports2._.isObject(source[key])) {
                          if (!target[key]) {
                            Object.assign(target, _defineProperty({}, key, {}));
                          }
                          exports2._.merge(target[key], source[key]);
                        } else {
                          Object.assign(target, _defineProperty({}, key, source[key]));
                        }
                      });
                    }
                    return target;
                  }
                };
                function isPromise(result) {
                  return exports2._.isObject(result) && typeof result.then === "function";
                }
                exports2.isPromise = isPromise;
                function createSymbol(name) {
                  return typeof Symbol !== "undefined" ? Symbol(name) : name;
                }
                exports2.createSymbol = createSymbol;
                __exportStar(__webpack_require__2(
                  /*! ./debug */
                  "../commons/lib/debug.js"
                ), exports2);
              }
            ),
            /***/
            "../errors/lib/index.js": (
              /*!******************************!*\
                !*** ../errors/lib/index.js ***!
                \******************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                var _excluded = ["message", "errors"];
                function _objectWithoutProperties(source, excluded) {
                  if (source == null)
                    return {};
                  var target = _objectWithoutPropertiesLoose(source, excluded);
                  var key, i;
                  if (Object.getOwnPropertySymbols) {
                    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
                    for (i = 0; i < sourceSymbolKeys.length; i++) {
                      key = sourceSymbolKeys[i];
                      if (excluded.indexOf(key) >= 0)
                        continue;
                      if (!Object.prototype.propertyIsEnumerable.call(source, key))
                        continue;
                      target[key] = source[key];
                    }
                  }
                  return target;
                }
                function _objectWithoutPropertiesLoose(source, excluded) {
                  if (source == null)
                    return {};
                  var target = {};
                  var sourceKeys = Object.keys(source);
                  var key, i;
                  for (i = 0; i < sourceKeys.length; i++) {
                    key = sourceKeys[i];
                    if (excluded.indexOf(key) >= 0)
                      continue;
                    target[key] = source[key];
                  }
                  return target;
                }
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _wrapNativeSuper(Class) {
                  var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
                  _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
                    if (Class2 === null || !_isNativeFunction(Class2))
                      return Class2;
                    if (typeof Class2 !== "function") {
                      throw new TypeError("Super expression must either be null or a function");
                    }
                    if (typeof _cache !== "undefined") {
                      if (_cache.has(Class2))
                        return _cache.get(Class2);
                      _cache.set(Class2, Wrapper);
                    }
                    function Wrapper() {
                      return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
                    }
                    Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
                    return _setPrototypeOf(Wrapper, Class2);
                  };
                  return _wrapNativeSuper(Class);
                }
                function _construct(Parent, args, Class) {
                  if (_isNativeReflectConstruct()) {
                    _construct = Reflect.construct.bind();
                  } else {
                    _construct = function _construct2(Parent2, args2, Class2) {
                      var a = [null];
                      a.push.apply(a, args2);
                      var Constructor = Function.bind.apply(Parent2, a);
                      var instance = new Constructor();
                      if (Class2)
                        _setPrototypeOf(instance, Class2.prototype);
                      return instance;
                    };
                  }
                  return _construct.apply(null, arguments);
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _isNativeFunction(fn) {
                  return Function.toString.call(fn).indexOf("[native code]") !== -1;
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.convert = exports2.errors = exports2.Unavailable = exports2.BadGateway = exports2.NotImplemented = exports2.GeneralError = exports2.TooManyRequests = exports2.Unprocessable = exports2.LengthRequired = exports2.Gone = exports2.Conflict = exports2.Timeout = exports2.NotAcceptable = exports2.MethodNotAllowed = exports2.NotFound = exports2.Forbidden = exports2.PaymentError = exports2.NotAuthenticated = exports2.BadRequest = exports2.FeathersError = void 0;
                var FeathersError = function(_Error) {
                  _inherits(FeathersError2, _Error);
                  var _super = _createSuper(FeathersError2);
                  function FeathersError2(err, name, code, className, _data) {
                    var _this;
                    _classCallCheck(this, FeathersError2);
                    var msg = typeof err === "string" ? err : "Error";
                    var properties = {
                      name,
                      code,
                      className,
                      type: "FeathersError"
                    };
                    if (Array.isArray(_data)) {
                      properties.data = _data;
                    } else if (_typeof(err) === "object" || _data !== void 0) {
                      var _ref = err !== null && _typeof(err) === "object" ? err : _data, message = _ref.message, errors = _ref.errors, rest = _objectWithoutProperties(_ref, _excluded);
                      msg = message || msg;
                      properties.errors = errors;
                      properties.data = rest;
                    }
                    _this = _super.call(this, msg);
                    Object.assign(_assertThisInitialized(_this), properties);
                    return _this;
                  }
                  _createClass(FeathersError2, [{
                    key: "toJSON",
                    value: function toJSON() {
                      var result = {
                        name: this.name,
                        message: this.message,
                        code: this.code,
                        className: this.className
                      };
                      if (this.data !== void 0) {
                        result.data = this.data;
                      }
                      if (this.errors !== void 0) {
                        result.errors = this.errors;
                      }
                      return result;
                    }
                  }]);
                  return FeathersError2;
                }(_wrapNativeSuper(Error));
                exports2.FeathersError = FeathersError;
                var BadRequest = function(_FeathersError) {
                  _inherits(BadRequest2, _FeathersError);
                  var _super2 = _createSuper(BadRequest2);
                  function BadRequest2(message, data) {
                    _classCallCheck(this, BadRequest2);
                    return _super2.call(this, message, "BadRequest", 400, "bad-request", data);
                  }
                  return _createClass(BadRequest2);
                }(FeathersError);
                exports2.BadRequest = BadRequest;
                var NotAuthenticated = function(_FeathersError2) {
                  _inherits(NotAuthenticated2, _FeathersError2);
                  var _super3 = _createSuper(NotAuthenticated2);
                  function NotAuthenticated2(message, data) {
                    _classCallCheck(this, NotAuthenticated2);
                    return _super3.call(this, message, "NotAuthenticated", 401, "not-authenticated", data);
                  }
                  return _createClass(NotAuthenticated2);
                }(FeathersError);
                exports2.NotAuthenticated = NotAuthenticated;
                var PaymentError = function(_FeathersError3) {
                  _inherits(PaymentError2, _FeathersError3);
                  var _super4 = _createSuper(PaymentError2);
                  function PaymentError2(message, data) {
                    _classCallCheck(this, PaymentError2);
                    return _super4.call(this, message, "PaymentError", 402, "payment-error", data);
                  }
                  return _createClass(PaymentError2);
                }(FeathersError);
                exports2.PaymentError = PaymentError;
                var Forbidden = function(_FeathersError4) {
                  _inherits(Forbidden2, _FeathersError4);
                  var _super5 = _createSuper(Forbidden2);
                  function Forbidden2(message, data) {
                    _classCallCheck(this, Forbidden2);
                    return _super5.call(this, message, "Forbidden", 403, "forbidden", data);
                  }
                  return _createClass(Forbidden2);
                }(FeathersError);
                exports2.Forbidden = Forbidden;
                var NotFound = function(_FeathersError5) {
                  _inherits(NotFound2, _FeathersError5);
                  var _super6 = _createSuper(NotFound2);
                  function NotFound2(message, data) {
                    _classCallCheck(this, NotFound2);
                    return _super6.call(this, message, "NotFound", 404, "not-found", data);
                  }
                  return _createClass(NotFound2);
                }(FeathersError);
                exports2.NotFound = NotFound;
                var MethodNotAllowed = function(_FeathersError6) {
                  _inherits(MethodNotAllowed2, _FeathersError6);
                  var _super7 = _createSuper(MethodNotAllowed2);
                  function MethodNotAllowed2(message, data) {
                    _classCallCheck(this, MethodNotAllowed2);
                    return _super7.call(this, message, "MethodNotAllowed", 405, "method-not-allowed", data);
                  }
                  return _createClass(MethodNotAllowed2);
                }(FeathersError);
                exports2.MethodNotAllowed = MethodNotAllowed;
                var NotAcceptable = function(_FeathersError7) {
                  _inherits(NotAcceptable2, _FeathersError7);
                  var _super8 = _createSuper(NotAcceptable2);
                  function NotAcceptable2(message, data) {
                    _classCallCheck(this, NotAcceptable2);
                    return _super8.call(this, message, "NotAcceptable", 406, "not-acceptable", data);
                  }
                  return _createClass(NotAcceptable2);
                }(FeathersError);
                exports2.NotAcceptable = NotAcceptable;
                var Timeout = function(_FeathersError8) {
                  _inherits(Timeout2, _FeathersError8);
                  var _super9 = _createSuper(Timeout2);
                  function Timeout2(message, data) {
                    _classCallCheck(this, Timeout2);
                    return _super9.call(this, message, "Timeout", 408, "timeout", data);
                  }
                  return _createClass(Timeout2);
                }(FeathersError);
                exports2.Timeout = Timeout;
                var Conflict = function(_FeathersError9) {
                  _inherits(Conflict2, _FeathersError9);
                  var _super10 = _createSuper(Conflict2);
                  function Conflict2(message, data) {
                    _classCallCheck(this, Conflict2);
                    return _super10.call(this, message, "Conflict", 409, "conflict", data);
                  }
                  return _createClass(Conflict2);
                }(FeathersError);
                exports2.Conflict = Conflict;
                var Gone = function(_FeathersError10) {
                  _inherits(Gone2, _FeathersError10);
                  var _super11 = _createSuper(Gone2);
                  function Gone2(message, data) {
                    _classCallCheck(this, Gone2);
                    return _super11.call(this, message, "Gone", 410, "gone", data);
                  }
                  return _createClass(Gone2);
                }(FeathersError);
                exports2.Gone = Gone;
                var LengthRequired = function(_FeathersError11) {
                  _inherits(LengthRequired2, _FeathersError11);
                  var _super12 = _createSuper(LengthRequired2);
                  function LengthRequired2(message, data) {
                    _classCallCheck(this, LengthRequired2);
                    return _super12.call(this, message, "LengthRequired", 411, "length-required", data);
                  }
                  return _createClass(LengthRequired2);
                }(FeathersError);
                exports2.LengthRequired = LengthRequired;
                var Unprocessable = function(_FeathersError12) {
                  _inherits(Unprocessable2, _FeathersError12);
                  var _super13 = _createSuper(Unprocessable2);
                  function Unprocessable2(message, data) {
                    _classCallCheck(this, Unprocessable2);
                    return _super13.call(this, message, "Unprocessable", 422, "unprocessable", data);
                  }
                  return _createClass(Unprocessable2);
                }(FeathersError);
                exports2.Unprocessable = Unprocessable;
                var TooManyRequests = function(_FeathersError13) {
                  _inherits(TooManyRequests2, _FeathersError13);
                  var _super14 = _createSuper(TooManyRequests2);
                  function TooManyRequests2(message, data) {
                    _classCallCheck(this, TooManyRequests2);
                    return _super14.call(this, message, "TooManyRequests", 429, "too-many-requests", data);
                  }
                  return _createClass(TooManyRequests2);
                }(FeathersError);
                exports2.TooManyRequests = TooManyRequests;
                var GeneralError = function(_FeathersError14) {
                  _inherits(GeneralError2, _FeathersError14);
                  var _super15 = _createSuper(GeneralError2);
                  function GeneralError2(message, data) {
                    _classCallCheck(this, GeneralError2);
                    return _super15.call(this, message, "GeneralError", 500, "general-error", data);
                  }
                  return _createClass(GeneralError2);
                }(FeathersError);
                exports2.GeneralError = GeneralError;
                var NotImplemented = function(_FeathersError15) {
                  _inherits(NotImplemented2, _FeathersError15);
                  var _super16 = _createSuper(NotImplemented2);
                  function NotImplemented2(message, data) {
                    _classCallCheck(this, NotImplemented2);
                    return _super16.call(this, message, "NotImplemented", 501, "not-implemented", data);
                  }
                  return _createClass(NotImplemented2);
                }(FeathersError);
                exports2.NotImplemented = NotImplemented;
                var BadGateway = function(_FeathersError16) {
                  _inherits(BadGateway2, _FeathersError16);
                  var _super17 = _createSuper(BadGateway2);
                  function BadGateway2(message, data) {
                    _classCallCheck(this, BadGateway2);
                    return _super17.call(this, message, "BadGateway", 502, "bad-gateway", data);
                  }
                  return _createClass(BadGateway2);
                }(FeathersError);
                exports2.BadGateway = BadGateway;
                var Unavailable = function(_FeathersError17) {
                  _inherits(Unavailable2, _FeathersError17);
                  var _super18 = _createSuper(Unavailable2);
                  function Unavailable2(message, data) {
                    _classCallCheck(this, Unavailable2);
                    return _super18.call(this, message, "Unavailable", 503, "unavailable", data);
                  }
                  return _createClass(Unavailable2);
                }(FeathersError);
                exports2.Unavailable = Unavailable;
                exports2.errors = {
                  FeathersError,
                  BadRequest,
                  NotAuthenticated,
                  PaymentError,
                  Forbidden,
                  NotFound,
                  MethodNotAllowed,
                  NotAcceptable,
                  Timeout,
                  Conflict,
                  LengthRequired,
                  Unprocessable,
                  TooManyRequests,
                  GeneralError,
                  NotImplemented,
                  BadGateway,
                  Unavailable,
                  400: BadRequest,
                  401: NotAuthenticated,
                  402: PaymentError,
                  403: Forbidden,
                  404: NotFound,
                  405: MethodNotAllowed,
                  406: NotAcceptable,
                  408: Timeout,
                  409: Conflict,
                  410: Gone,
                  411: LengthRequired,
                  422: Unprocessable,
                  429: TooManyRequests,
                  500: GeneralError,
                  501: NotImplemented,
                  502: BadGateway,
                  503: Unavailable
                };
                function convert(error) {
                  if (!error) {
                    return error;
                  }
                  var FeathersError2 = exports2.errors[error.name];
                  var result = FeathersError2 ? new FeathersError2(error.message, error.data) : new Error(error.message || error);
                  if (_typeof(error) === "object") {
                    Object.assign(result, error);
                  }
                  return result;
                }
                exports2.convert = convert;
              }
            ),
            /***/
            "../feathers/lib/application.js": (
              /*!**************************************!*\
                !*** ../feathers/lib/application.js ***!
                \**************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                function _regeneratorRuntime() {
                  "use strict";
                  _regeneratorRuntime = function _regeneratorRuntime2() {
                    return exports3;
                  };
                  var exports3 = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function(obj, key, desc) {
                    obj[key] = desc.value;
                  }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
                  function define2(obj, key, value) {
                    return Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true }), obj[key];
                  }
                  try {
                    define2({}, "");
                  } catch (err) {
                    define2 = function define3(obj, key, value) {
                      return obj[key] = value;
                    };
                  }
                  function wrap(innerFn, outerFn, self, tryLocsList) {
                    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []);
                    return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator;
                  }
                  function tryCatch(fn, obj, arg) {
                    try {
                      return { type: "normal", arg: fn.call(obj, arg) };
                    } catch (err) {
                      return { type: "throw", arg: err };
                    }
                  }
                  exports3.wrap = wrap;
                  var ContinueSentinel = {};
                  function Generator() {
                  }
                  function GeneratorFunction() {
                  }
                  function GeneratorFunctionPrototype() {
                  }
                  var IteratorPrototype = {};
                  define2(IteratorPrototype, iteratorSymbol, function() {
                    return this;
                  });
                  var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
                  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
                  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
                  function defineIteratorMethods(prototype) {
                    ["next", "throw", "return"].forEach(function(method) {
                      define2(prototype, method, function(arg) {
                        return this._invoke(method, arg);
                      });
                    });
                  }
                  function AsyncIterator(generator, PromiseImpl) {
                    function invoke(method, arg, resolve, reject) {
                      var record = tryCatch(generator[method], generator, arg);
                      if ("throw" !== record.type) {
                        var result = record.arg, value = result.value;
                        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function(value2) {
                          invoke("next", value2, resolve, reject);
                        }, function(err) {
                          invoke("throw", err, resolve, reject);
                        }) : PromiseImpl.resolve(value).then(function(unwrapped) {
                          result.value = unwrapped, resolve(result);
                        }, function(error) {
                          return invoke("throw", error, resolve, reject);
                        });
                      }
                      reject(record.arg);
                    }
                    var previousPromise;
                    defineProperty(this, "_invoke", { value: function value(method, arg) {
                      function callInvokeWithMethodAndArg() {
                        return new PromiseImpl(function(resolve, reject) {
                          invoke(method, arg, resolve, reject);
                        });
                      }
                      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
                    } });
                  }
                  function makeInvokeMethod(innerFn, self, context) {
                    var state = "suspendedStart";
                    return function(method, arg) {
                      if ("executing" === state)
                        throw new Error("Generator is already running");
                      if ("completed" === state) {
                        if ("throw" === method)
                          throw arg;
                        return doneResult();
                      }
                      for (context.method = method, context.arg = arg; ; ) {
                        var delegate = context.delegate;
                        if (delegate) {
                          var delegateResult = maybeInvokeDelegate(delegate, context);
                          if (delegateResult) {
                            if (delegateResult === ContinueSentinel)
                              continue;
                            return delegateResult;
                          }
                        }
                        if ("next" === context.method)
                          context.sent = context._sent = context.arg;
                        else if ("throw" === context.method) {
                          if ("suspendedStart" === state)
                            throw state = "completed", context.arg;
                          context.dispatchException(context.arg);
                        } else
                          "return" === context.method && context.abrupt("return", context.arg);
                        state = "executing";
                        var record = tryCatch(innerFn, self, context);
                        if ("normal" === record.type) {
                          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel)
                            continue;
                          return { value: record.arg, done: context.done };
                        }
                        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
                      }
                    };
                  }
                  function maybeInvokeDelegate(delegate, context) {
                    var methodName = context.method, method = delegate.iterator[methodName];
                    if (void 0 === method)
                      return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
                    var record = tryCatch(method, delegate.iterator, context.arg);
                    if ("throw" === record.type)
                      return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
                    var info = record.arg;
                    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
                  }
                  function pushTryEntry(locs) {
                    var entry = { tryLoc: locs[0] };
                    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
                  }
                  function resetTryEntry(entry) {
                    var record = entry.completion || {};
                    record.type = "normal", delete record.arg, entry.completion = record;
                  }
                  function Context(tryLocsList) {
                    this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(true);
                  }
                  function values(iterable) {
                    if (iterable) {
                      var iteratorMethod = iterable[iteratorSymbol];
                      if (iteratorMethod)
                        return iteratorMethod.call(iterable);
                      if ("function" == typeof iterable.next)
                        return iterable;
                      if (!isNaN(iterable.length)) {
                        var i = -1, next = function next2() {
                          for (; ++i < iterable.length; )
                            if (hasOwn.call(iterable, i))
                              return next2.value = iterable[i], next2.done = false, next2;
                          return next2.value = void 0, next2.done = true, next2;
                        };
                        return next.next = next;
                      }
                    }
                    return { next: doneResult };
                  }
                  function doneResult() {
                    return { value: void 0, done: true };
                  }
                  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define2(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports3.isGeneratorFunction = function(genFun) {
                    var ctor = "function" == typeof genFun && genFun.constructor;
                    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
                  }, exports3.mark = function(genFun) {
                    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define2(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
                  }, exports3.awrap = function(arg) {
                    return { __await: arg };
                  }, defineIteratorMethods(AsyncIterator.prototype), define2(AsyncIterator.prototype, asyncIteratorSymbol, function() {
                    return this;
                  }), exports3.AsyncIterator = AsyncIterator, exports3.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
                    void 0 === PromiseImpl && (PromiseImpl = Promise);
                    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
                    return exports3.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
                      return result.done ? result.value : iter.next();
                    });
                  }, defineIteratorMethods(Gp), define2(Gp, toStringTagSymbol, "Generator"), define2(Gp, iteratorSymbol, function() {
                    return this;
                  }), define2(Gp, "toString", function() {
                    return "[object Generator]";
                  }), exports3.keys = function(val) {
                    var object = Object(val), keys = [];
                    for (var key in object)
                      keys.push(key);
                    return keys.reverse(), function next() {
                      for (; keys.length; ) {
                        var key2 = keys.pop();
                        if (key2 in object)
                          return next.value = key2, next.done = false, next;
                      }
                      return next.done = true, next;
                    };
                  }, exports3.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) {
                    if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = false, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset)
                      for (var name in this)
                        "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
                  }, stop: function stop() {
                    this.done = true;
                    var rootRecord = this.tryEntries[0].completion;
                    if ("throw" === rootRecord.type)
                      throw rootRecord.arg;
                    return this.rval;
                  }, dispatchException: function dispatchException(exception) {
                    if (this.done)
                      throw exception;
                    var context = this;
                    function handle(loc, caught) {
                      return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = void 0), !!caught;
                    }
                    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                      var entry = this.tryEntries[i], record = entry.completion;
                      if ("root" === entry.tryLoc)
                        return handle("end");
                      if (entry.tryLoc <= this.prev) {
                        var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc");
                        if (hasCatch && hasFinally) {
                          if (this.prev < entry.catchLoc)
                            return handle(entry.catchLoc, true);
                          if (this.prev < entry.finallyLoc)
                            return handle(entry.finallyLoc);
                        } else if (hasCatch) {
                          if (this.prev < entry.catchLoc)
                            return handle(entry.catchLoc, true);
                        } else {
                          if (!hasFinally)
                            throw new Error("try statement without catch or finally");
                          if (this.prev < entry.finallyLoc)
                            return handle(entry.finallyLoc);
                        }
                      }
                    }
                  }, abrupt: function abrupt(type, arg) {
                    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                      var entry = this.tryEntries[i];
                      if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                        var finallyEntry = entry;
                        break;
                      }
                    }
                    finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
                    var record = finallyEntry ? finallyEntry.completion : {};
                    return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
                  }, complete: function complete(record, afterLoc) {
                    if ("throw" === record.type)
                      throw record.arg;
                    return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
                  }, finish: function finish(finallyLoc) {
                    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                      var entry = this.tryEntries[i];
                      if (entry.finallyLoc === finallyLoc)
                        return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
                    }
                  }, catch: function _catch(tryLoc) {
                    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                      var entry = this.tryEntries[i];
                      if (entry.tryLoc === tryLoc) {
                        var record = entry.completion;
                        if ("throw" === record.type) {
                          var thrown = record.arg;
                          resetTryEntry(entry);
                        }
                        return thrown;
                      }
                    }
                    throw new Error("illegal catch attempt");
                  }, delegateYield: function delegateYield(iterable, resultName, nextLoc) {
                    return this.delegate = { iterator: values(iterable), resultName, nextLoc }, "next" === this.method && (this.arg = void 0), ContinueSentinel;
                  } }, exports3;
                }
                function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
                  try {
                    var info = gen[key](arg);
                    var value = info.value;
                  } catch (error) {
                    reject(error);
                    return;
                  }
                  if (info.done) {
                    resolve(value);
                  } else {
                    Promise.resolve(value).then(_next, _throw);
                  }
                }
                function _asyncToGenerator(fn) {
                  return function() {
                    var self = this, args = arguments;
                    return new Promise(function(resolve, reject) {
                      var gen = fn.apply(self, args);
                      function _next(value) {
                        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                      }
                      function _throw(err) {
                        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                      }
                      _next(void 0);
                    });
                  };
                }
                function _createForOfIteratorHelper(o, allowArrayLike) {
                  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
                  if (!it) {
                    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                      if (it)
                        o = it;
                      var i = 0;
                      var F = function F2() {
                      };
                      return { s: F, n: function n() {
                        if (i >= o.length)
                          return { done: true };
                        return { done: false, value: o[i++] };
                      }, e: function e(_e) {
                        throw _e;
                      }, f: F };
                    }
                    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                  }
                  var normalCompletion = true, didErr = false, err;
                  return { s: function s() {
                    it = it.call(o);
                  }, n: function n() {
                    var step = it.next();
                    normalCompletion = step.done;
                    return step;
                  }, e: function e(_e2) {
                    didErr = true;
                    err = _e2;
                  }, f: function f() {
                    try {
                      if (!normalCompletion && it.return != null)
                        it.return();
                    } finally {
                      if (didErr)
                        throw err;
                    }
                  } };
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
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                var __importDefault = this && this.__importDefault || function(mod) {
                  return mod && mod.__esModule ? mod : {
                    "default": mod
                  };
                };
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.Feathers = void 0;
                var version_1 = __importDefault(__webpack_require__2(
                  /*! ./version */
                  "../feathers/lib/version.js"
                ));
                var events_1 = __webpack_require__2(
                  /*! events */
                  "../../node_modules/events/events.js"
                );
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                var hooks_1 = __webpack_require__2(
                  /*! @feathersjs/hooks */
                  "../../node_modules/@feathersjs/hooks/script/index.js"
                );
                var events_2 = __webpack_require__2(
                  /*! ./events */
                  "../feathers/lib/events.js"
                );
                var hooks_2 = __webpack_require__2(
                  /*! ./hooks */
                  "../feathers/lib/hooks.js"
                );
                var service_1 = __webpack_require__2(
                  /*! ./service */
                  "../feathers/lib/service.js"
                );
                var hooks_3 = __webpack_require__2(
                  /*! ./hooks */
                  "../feathers/lib/hooks.js"
                );
                var debug = (0, commons_1.createDebug)("@feathersjs/feathers");
                var Feathers = function(_events_1$EventEmitte) {
                  _inherits(Feathers2, _events_1$EventEmitte);
                  var _super = _createSuper(Feathers2);
                  function Feathers2() {
                    var _this;
                    _classCallCheck(this, Feathers2);
                    _this = _super.call(this);
                    _this.services = {};
                    _this.settings = {};
                    _this.mixins = [hooks_2.hookMixin, events_2.eventMixin];
                    _this.version = version_1.default;
                    _this._isSetup = false;
                    _this.registerHooks = (0, hooks_3.enableHooks)(_assertThisInitialized(_this));
                    _this.registerHooks({
                      around: [events_2.eventHook]
                    });
                    return _this;
                  }
                  _createClass(Feathers2, [{
                    key: "get",
                    value: function get(name) {
                      return this.settings[name];
                    }
                  }, {
                    key: "set",
                    value: function set(name, value) {
                      this.settings[name] = value;
                      return this;
                    }
                  }, {
                    key: "configure",
                    value: function configure(callback) {
                      callback.call(this, this);
                      return this;
                    }
                  }, {
                    key: "defaultService",
                    value: function defaultService(location) {
                      throw new Error("Can not find service '".concat(location, "'"));
                    }
                  }, {
                    key: "service",
                    value: function service(location) {
                      var path = (0, commons_1.stripSlashes)(location) || "/";
                      var current = this.services[path];
                      if (typeof current === "undefined") {
                        this.use(path, this.defaultService(path));
                        return this.service(path);
                      }
                      return current;
                    }
                  }, {
                    key: "_setup",
                    value: function _setup() {
                      var _this2 = this;
                      this._isSetup = true;
                      return Object.keys(this.services).reduce(function(current, path) {
                        return current.then(function() {
                          var service = _this2.service(path);
                          if (typeof service.setup === "function") {
                            debug("Setting up service for `".concat(path, "`"));
                            return service.setup(_this2, path);
                          }
                        });
                      }, Promise.resolve()).then(function() {
                        return _this2;
                      });
                    }
                  }, {
                    key: "setup",
                    get: function get() {
                      return this._setup;
                    },
                    set: function set(value) {
                      this._setup = value[hooks_1.HOOKS] ? value : (0, hooks_1.hooks)(value, (0, hooks_1.middleware)().params("server").props({
                        app: this
                      }));
                    }
                  }, {
                    key: "_teardown",
                    value: function _teardown() {
                      var _this3 = this;
                      this._isSetup = false;
                      return Object.keys(this.services).reduce(function(current, path) {
                        return current.then(function() {
                          var service = _this3.service(path);
                          if (typeof service.teardown === "function") {
                            debug("Tearing down service for `".concat(path, "`"));
                            return service.teardown(_this3, path);
                          }
                        });
                      }, Promise.resolve()).then(function() {
                        return _this3;
                      });
                    }
                  }, {
                    key: "teardown",
                    get: function get() {
                      return this._teardown;
                    },
                    set: function set(value) {
                      this._teardown = value[hooks_1.HOOKS] ? value : (0, hooks_1.hooks)(value, (0, hooks_1.middleware)().params("server").props({
                        app: this
                      }));
                    }
                  }, {
                    key: "use",
                    value: function use(path, service, options) {
                      var _this4 = this;
                      if (typeof path !== "string") {
                        throw new Error("'".concat(path, "' is not a valid service path."));
                      }
                      var location = (0, commons_1.stripSlashes)(path) || "/";
                      var subApp = service;
                      var isSubApp = typeof subApp.service === "function" && subApp.services;
                      if (isSubApp) {
                        Object.keys(subApp.services).forEach(function(subPath) {
                          return _this4.use("".concat(location, "/").concat(subPath), subApp.service(subPath));
                        });
                        return this;
                      }
                      var protoService = (0, service_1.wrapService)(location, service, options);
                      var serviceOptions = (0, service_1.getServiceOptions)(protoService);
                      var _iterator = _createForOfIteratorHelper(service_1.protectedMethods), _step;
                      try {
                        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                          var name = _step.value;
                          if (serviceOptions.methods.includes(name)) {
                            throw new Error("'".concat(name, "' on service '").concat(location, "' is not allowed as a custom method name"));
                          }
                        }
                      } catch (err) {
                        _iterator.e(err);
                      } finally {
                        _iterator.f();
                      }
                      debug("Registering new service at `".concat(location, "`"));
                      this.mixins.forEach(function(fn) {
                        return fn.call(_this4, protoService, location, serviceOptions);
                      });
                      this.services[location] = protoService;
                      if (this._isSetup && typeof protoService.setup === "function") {
                        debug("Setting up service for `".concat(location, "`"));
                        protoService.setup(this, location);
                      }
                      return this;
                    }
                  }, {
                    key: "unuse",
                    value: function() {
                      var _unuse = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(location) {
                        var path, service;
                        return _regeneratorRuntime().wrap(function _callee$(_context) {
                          while (1)
                            switch (_context.prev = _context.next) {
                              case 0:
                                path = (0, commons_1.stripSlashes)(location) || "/";
                                service = this.services[path];
                                if (!(service && typeof service.teardown === "function")) {
                                  _context.next = 5;
                                  break;
                                }
                                _context.next = 5;
                                return service.teardown(this, path);
                              case 5:
                                delete this.services[path];
                                return _context.abrupt("return", service);
                              case 7:
                              case "end":
                                return _context.stop();
                            }
                        }, _callee, this);
                      }));
                      function unuse(_x) {
                        return _unuse.apply(this, arguments);
                      }
                      return unuse;
                    }()
                  }, {
                    key: "hooks",
                    value: function hooks(hookMap) {
                      var untypedMap = hookMap;
                      if (untypedMap.before || untypedMap.after || untypedMap.error || untypedMap.around) {
                        this.registerHooks(untypedMap);
                      } else if (untypedMap.setup || untypedMap.teardown) {
                        (0, hooks_1.hooks)(this, untypedMap);
                      } else {
                        this.registerHooks({
                          around: untypedMap
                        });
                      }
                      return this;
                    }
                  }]);
                  return Feathers2;
                }(events_1.EventEmitter);
                exports2.Feathers = Feathers;
              }
            ),
            /***/
            "../feathers/lib/declarations.js": (
              /*!***************************************!*\
                !*** ../feathers/lib/declarations.js ***!
                \***************************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
              }
            ),
            /***/
            "../feathers/lib/events.js": (
              /*!*********************************!*\
                !*** ../feathers/lib/events.js ***!
                \*********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.eventMixin = exports2.eventHook = void 0;
                var events_1 = __webpack_require__2(
                  /*! events */
                  "../../node_modules/events/events.js"
                );
                var service_1 = __webpack_require__2(
                  /*! ./service */
                  "../feathers/lib/service.js"
                );
                function eventHook(context, next) {
                  var _ref = (0, service_1.getServiceOptions)(context.self), events = _ref.events;
                  var defaultEvent = service_1.defaultEventMap[context.method] || null;
                  context.event = defaultEvent;
                  return next().then(function() {
                    if (typeof context.event === "string" && !events.includes(context.event)) {
                      var results = Array.isArray(context.result) ? context.result : [context.result];
                      results.forEach(function(element) {
                        return context.self.emit(context.event, element, context);
                      });
                    }
                  });
                }
                exports2.eventHook = eventHook;
                function eventMixin(service) {
                  var isEmitter = typeof service.on === "function" && typeof service.emit === "function";
                  if (!isEmitter) {
                    Object.assign(service, events_1.EventEmitter.prototype);
                  }
                  return service;
                }
                exports2.eventMixin = eventMixin;
              }
            ),
            /***/
            "../feathers/lib/hooks.js": (
              /*!********************************!*\
                !*** ../feathers/lib/hooks.js ***!
                \********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _get() {
                  if (typeof Reflect !== "undefined" && Reflect.get) {
                    _get = Reflect.get.bind();
                  } else {
                    _get = function _get2(target, property, receiver) {
                      var base = _superPropBase(target, property);
                      if (!base)
                        return;
                      var desc = Object.getOwnPropertyDescriptor(base, property);
                      if (desc.get) {
                        return desc.get.call(arguments.length < 3 ? target : receiver);
                      }
                      return desc.value;
                    };
                  }
                  return _get.apply(this, arguments);
                }
                function _superPropBase(object, property) {
                  while (!Object.prototype.hasOwnProperty.call(object, property)) {
                    object = _getPrototypeOf(object);
                    if (object === null)
                      break;
                  }
                  return object;
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.hookMixin = exports2.FeathersHookManager = exports2.createContext = exports2.enableHooks = exports2.collectHooks = exports2.convertHookData = void 0;
                var hooks_1 = __webpack_require__2(
                  /*! @feathersjs/hooks */
                  "../../node_modules/@feathersjs/hooks/script/index.js"
                );
                var service_1 = __webpack_require__2(
                  /*! ./service */
                  "../feathers/lib/service.js"
                );
                var types = ["before", "after", "error", "around"];
                var isType = function isType2(value) {
                  return types.includes(value);
                };
                function convertHookData(input) {
                  var result = {};
                  if (Array.isArray(input)) {
                    result.all = input;
                  } else if (_typeof(input) !== "object") {
                    result.all = [input];
                  } else {
                    for (var _i = 0, _Object$keys = Object.keys(input); _i < _Object$keys.length; _i++) {
                      var key = _Object$keys[_i];
                      var value = input[key];
                      result[key] = Array.isArray(value) ? value : [value];
                    }
                  }
                  return result;
                }
                exports2.convertHookData = convertHookData;
                function collectHooks(target, method) {
                  var _target$__hooks = target.__hooks, collected = _target$__hooks.collected, collectedAll = _target$__hooks.collectedAll, around = _target$__hooks.around;
                  return [].concat(_toConsumableArray(around.all || []), _toConsumableArray(around[method] || []), _toConsumableArray(collectedAll.before || []), _toConsumableArray(collected[method] || []), _toConsumableArray(collectedAll.after || []));
                }
                exports2.collectHooks = collectHooks;
                function enableHooks(object) {
                  var store = {
                    around: {},
                    before: {},
                    after: {},
                    error: {},
                    collected: {},
                    collectedAll: {}
                  };
                  Object.defineProperty(object, "__hooks", {
                    configurable: true,
                    value: store,
                    writable: true
                  });
                  return function registerHooks(input) {
                    var store2 = this.__hooks;
                    var map = Object.keys(input).reduce(function(map2, type) {
                      if (!isType(type)) {
                        throw new Error("'".concat(type, "' is not a valid hook type"));
                      }
                      map2[type] = convertHookData(input[type]);
                      return map2;
                    }, {});
                    var types2 = Object.keys(map);
                    types2.forEach(function(type) {
                      return Object.keys(map[type]).forEach(function(method) {
                        var _a;
                        var mapHooks = map[type][method];
                        var storeHooks = (_a = store2[type])[method] || (_a[method] = []);
                        storeHooks.push.apply(storeHooks, _toConsumableArray(mapHooks));
                        if (method === "all") {
                          if (store2.before[method] || store2.error[method]) {
                            var beforeAll = (0, hooks_1.collect)({
                              before: store2.before[method] || [],
                              error: store2.error[method] || []
                            });
                            store2.collectedAll.before = [beforeAll];
                          }
                          if (store2.after[method]) {
                            var afterAll = (0, hooks_1.collect)({
                              after: store2.after[method] || []
                            });
                            store2.collectedAll.after = [afterAll];
                          }
                        } else {
                          if (store2.before[method] || store2.after[method] || store2.error[method]) {
                            var collected = (0, hooks_1.collect)({
                              before: store2.before[method] || [],
                              after: store2.after[method] || [],
                              error: store2.error[method] || []
                            });
                            store2.collected[method] = [collected];
                          }
                        }
                      });
                    });
                    return this;
                  };
                }
                exports2.enableHooks = enableHooks;
                function createContext(service, method) {
                  var data = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                  var createContext2 = service[method].createContext;
                  if (typeof createContext2 !== "function") {
                    throw new Error("Can not create context for method ".concat(method));
                  }
                  return createContext2(data);
                }
                exports2.createContext = createContext;
                var FeathersHookManager = function(_hooks_1$HookManager) {
                  _inherits(FeathersHookManager2, _hooks_1$HookManager);
                  var _super = _createSuper(FeathersHookManager2);
                  function FeathersHookManager2(app, method) {
                    var _this;
                    _classCallCheck(this, FeathersHookManager2);
                    _this = _super.call(this);
                    _this.app = app;
                    _this.method = method;
                    _this._middleware = [];
                    return _this;
                  }
                  _createClass(FeathersHookManager2, [{
                    key: "collectMiddleware",
                    value: function collectMiddleware(self, args) {
                      var appHooks = collectHooks(this.app, this.method);
                      var middleware = _get(_getPrototypeOf(FeathersHookManager2.prototype), "collectMiddleware", this).call(this, self, args);
                      var methodHooks = collectHooks(self, this.method);
                      return [].concat(_toConsumableArray(appHooks), _toConsumableArray(middleware), _toConsumableArray(methodHooks));
                    }
                  }, {
                    key: "initializeContext",
                    value: function initializeContext(self, args, context) {
                      var ctx = _get(_getPrototypeOf(FeathersHookManager2.prototype), "initializeContext", this).call(this, self, args, context);
                      ctx.params = ctx.params || {};
                      return ctx;
                    }
                  }, {
                    key: "middleware",
                    value: function middleware(mw) {
                      var _this$_middleware;
                      (_this$_middleware = this._middleware).push.apply(_this$_middleware, _toConsumableArray(mw));
                      return this;
                    }
                  }]);
                  return FeathersHookManager2;
                }(hooks_1.HookManager);
                exports2.FeathersHookManager = FeathersHookManager;
                function hookMixin(service, path, options) {
                  var _this2 = this;
                  if (typeof service.hooks === "function") {
                    return service;
                  }
                  var hookMethods = (0, service_1.getHookMethods)(service, options);
                  var serviceMethodHooks = hookMethods.reduce(function(res, method) {
                    var _FeathersHookManager;
                    var params = service_1.defaultServiceArguments[method] || ["data", "params"];
                    res[method] = (_FeathersHookManager = new FeathersHookManager(_this2, method)).params.apply(_FeathersHookManager, _toConsumableArray(params)).props({
                      app: _this2,
                      path,
                      method,
                      service,
                      event: null,
                      type: "around",
                      get statusCode() {
                        var _a;
                        return (_a = this.http) === null || _a === void 0 ? void 0 : _a.status;
                      },
                      set statusCode(value) {
                        this.http = this.http || {};
                        this.http.status = value;
                      }
                    });
                    return res;
                  }, {});
                  var registerHooks = enableHooks(service);
                  (0, hooks_1.hooks)(service, serviceMethodHooks);
                  service.hooks = function(hookOptions) {
                    var _this3 = this;
                    if (hookOptions.before || hookOptions.after || hookOptions.error || hookOptions.around) {
                      return registerHooks.call(this, hookOptions);
                    }
                    if (Array.isArray(hookOptions)) {
                      return (0, hooks_1.hooks)(this, hookOptions);
                    }
                    Object.keys(hookOptions).forEach(function(method) {
                      var manager = (0, hooks_1.getManager)(_this3[method]);
                      if (!(manager instanceof FeathersHookManager)) {
                        throw new Error("Method ".concat(method, " is not a Feathers hooks enabled service method"));
                      }
                      manager.middleware(hookOptions[method]);
                    });
                    return this;
                  };
                  return service;
                }
                exports2.hookMixin = hookMixin;
              }
            ),
            /***/
            "../feathers/lib/index.js": (
              /*!********************************!*\
                !*** ../feathers/lib/index.js ***!
                \********************************/
              /***/
              function(module2, exports2, __webpack_require__2) {
                "use strict";
                var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  var desc = Object.getOwnPropertyDescriptor(m, k);
                  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                    desc = {
                      enumerable: true,
                      get: function get() {
                        return m[k];
                      }
                    };
                  }
                  Object.defineProperty(o, k2, desc);
                } : function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  o[k2] = m[k];
                });
                var __exportStar = this && this.__exportStar || function(m, exports3) {
                  for (var p in m)
                    if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                      __createBinding(exports3, m, p);
                };
                var __importDefault = this && this.__importDefault || function(mod) {
                  return mod && mod.__esModule ? mod : {
                    "default": mod
                  };
                };
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.Feathers = exports2.version = exports2.feathers = void 0;
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                var version_1 = __importDefault(__webpack_require__2(
                  /*! ./version */
                  "../feathers/lib/version.js"
                ));
                exports2.version = version_1.default;
                var application_1 = __webpack_require__2(
                  /*! ./application */
                  "../feathers/lib/application.js"
                );
                Object.defineProperty(exports2, "Feathers", {
                  enumerable: true,
                  get: function get() {
                    return application_1.Feathers;
                  }
                });
                function feathers() {
                  return new application_1.Feathers();
                }
                exports2.feathers = feathers;
                feathers.setDebug = commons_1.setDebug;
                __exportStar(__webpack_require__2(
                  /*! ./hooks */
                  "../feathers/lib/hooks.js"
                ), exports2);
                __exportStar(__webpack_require__2(
                  /*! ./declarations */
                  "../feathers/lib/declarations.js"
                ), exports2);
                __exportStar(__webpack_require__2(
                  /*! ./service */
                  "../feathers/lib/service.js"
                ), exports2);
                if (true) {
                  module2.exports = Object.assign(feathers, module2.exports);
                }
              }
            ),
            /***/
            "../feathers/lib/service.js": (
              /*!**********************************!*\
                !*** ../feathers/lib/service.js ***!
                \**********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
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
                  key = _toPropertyKey(key);
                  if (key in obj) {
                    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
                  } else {
                    obj[key] = value;
                  }
                  return obj;
                }
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.wrapService = exports2.normalizeServiceOptions = exports2.getServiceOptions = exports2.getHookMethods = exports2.protectedMethods = exports2.defaultServiceEvents = exports2.defaultEventMap = exports2.defaultServiceMethods = exports2.defaultServiceArguments = exports2.SERVICE = void 0;
                var events_1 = __webpack_require__2(
                  /*! events */
                  "../../node_modules/events/events.js"
                );
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                exports2.SERVICE = (0, commons_1.createSymbol)("@feathersjs/service");
                exports2.defaultServiceArguments = {
                  find: ["params"],
                  get: ["id", "params"],
                  create: ["data", "params"],
                  update: ["id", "data", "params"],
                  patch: ["id", "data", "params"],
                  remove: ["id", "params"]
                };
                exports2.defaultServiceMethods = ["find", "get", "create", "update", "patch", "remove"];
                exports2.defaultEventMap = {
                  create: "created",
                  update: "updated",
                  patch: "patched",
                  remove: "removed"
                };
                exports2.defaultServiceEvents = Object.values(exports2.defaultEventMap);
                exports2.protectedMethods = Object.keys(Object.prototype).concat(Object.keys(events_1.EventEmitter.prototype)).concat(["all", "around", "before", "after", "error", "hooks", "setup", "teardown", "publish"]);
                function getHookMethods(service, options) {
                  var methods = options.methods;
                  return exports2.defaultServiceMethods.filter(function(m) {
                    return typeof service[m] === "function" && !methods.includes(m);
                  }).concat(methods);
                }
                exports2.getHookMethods = getHookMethods;
                function getServiceOptions(service) {
                  return service[exports2.SERVICE];
                }
                exports2.getServiceOptions = getServiceOptions;
                var normalizeServiceOptions = function normalizeServiceOptions2(service) {
                  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                  var _options$methods = options.methods, methods = _options$methods === void 0 ? exports2.defaultServiceMethods.filter(function(method) {
                    return typeof service[method] === "function";
                  }) : _options$methods, _options$events = options.events, events = _options$events === void 0 ? service.events || [] : _options$events;
                  var serviceEvents = options.serviceEvents || exports2.defaultServiceEvents.concat(events);
                  return _objectSpread(_objectSpread({}, options), {}, {
                    events,
                    methods,
                    serviceEvents
                  });
                };
                exports2.normalizeServiceOptions = normalizeServiceOptions;
                function wrapService(location, service, options) {
                  if (service[exports2.SERVICE]) {
                    return service;
                  }
                  var protoService = Object.create(service);
                  var serviceOptions = (0, exports2.normalizeServiceOptions)(service, options);
                  if (Object.keys(serviceOptions.methods).length === 0 && ![].concat(_toConsumableArray(exports2.defaultServiceMethods), ["setup", "teardown"]).some(function(method) {
                    return typeof service[method] === "function";
                  })) {
                    throw new Error("Invalid service object passed for path `".concat(location, "`"));
                  }
                  Object.defineProperty(protoService, exports2.SERVICE, {
                    value: serviceOptions
                  });
                  return protoService;
                }
                exports2.wrapService = wrapService;
              }
            ),
            /***/
            "../feathers/lib/version.js": (
              /*!**********************************!*\
                !*** ../feathers/lib/version.js ***!
                \**********************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2["default"] = "development";
              }
            ),
            /***/
            "../rest-client/lib/axios.js": (
              /*!***********************************!*\
                !*** ../rest-client/lib/axios.js ***!
                \***********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.AxiosClient = void 0;
                var base_1 = __webpack_require__2(
                  /*! ./base */
                  "../rest-client/lib/base.js"
                );
                var AxiosClient = function(_base_1$Base) {
                  _inherits(AxiosClient2, _base_1$Base);
                  var _super = _createSuper(AxiosClient2);
                  function AxiosClient2() {
                    _classCallCheck(this, AxiosClient2);
                    return _super.apply(this, arguments);
                  }
                  _createClass(AxiosClient2, [{
                    key: "request",
                    value: function request(options, params) {
                      var config = Object.assign({
                        url: options.url,
                        method: options.method,
                        data: options.body,
                        headers: Object.assign({
                          Accept: "application/json"
                        }, this.options.headers, options.headers)
                      }, params.connection);
                      return this.connection.request(config).then(function(res) {
                        return res.data;
                      }).catch(function(error) {
                        var response = error.response || error;
                        throw response instanceof Error ? response : response.data || response;
                      });
                    }
                  }]);
                  return AxiosClient2;
                }(base_1.Base);
                exports2.AxiosClient = AxiosClient;
              }
            ),
            /***/
            "../rest-client/lib/base.js": (
              /*!**********************************!*\
                !*** ../rest-client/lib/base.js ***!
                \**********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                var __importDefault = this && this.__importDefault || function(mod) {
                  return mod && mod.__esModule ? mod : {
                    "default": mod
                  };
                };
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.Base = void 0;
                var qs_1 = __importDefault(__webpack_require__2(
                  /*! qs */
                  "../../node_modules/qs/lib/index.js"
                ));
                var errors_1 = __webpack_require__2(
                  /*! @feathersjs/errors */
                  "../errors/lib/index.js"
                );
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                function toError(error) {
                  if (error.code === "ECONNREFUSED") {
                    throw new errors_1.Unavailable(error.message, commons_1._.pick(error, "address", "port", "config"));
                  }
                  throw (0, errors_1.convert)(error);
                }
                var Base = function() {
                  function Base2(settings) {
                    _classCallCheck(this, Base2);
                    this.name = (0, commons_1.stripSlashes)(settings.name);
                    this.options = settings.options;
                    this.connection = settings.connection;
                    this.base = "".concat(settings.base, "/").concat(this.name);
                  }
                  _createClass(Base2, [{
                    key: "makeUrl",
                    value: function makeUrl(query, id) {
                      var url = this.base;
                      query = query || {};
                      if (typeof id !== "undefined" && id !== null) {
                        url += "/".concat(encodeURIComponent(id));
                      }
                      return url + this.getQuery(query);
                    }
                  }, {
                    key: "getQuery",
                    value: function getQuery(query) {
                      if (Object.keys(query).length !== 0) {
                        var queryString = qs_1.default.stringify(query);
                        return "?".concat(queryString);
                      }
                      return "";
                    }
                  }, {
                    key: "methods",
                    value: function methods() {
                      var _this = this;
                      for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
                        names[_key] = arguments[_key];
                      }
                      names.forEach(function(method) {
                        _this[method] = function(body) {
                          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                          return this.request({
                            body,
                            url: this.makeUrl(params.query),
                            method: "POST",
                            headers: Object.assign({
                              "Content-Type": "application/json",
                              "X-Service-Method": method
                            }, params.headers)
                          }, params).catch(toError);
                        };
                      });
                      return this;
                    }
                  }, {
                    key: "find",
                    value: function find(params) {
                      return this.request({
                        url: this.makeUrl(params.query),
                        method: "GET",
                        headers: Object.assign({}, params.headers)
                      }, params).catch(toError);
                    }
                  }, {
                    key: "get",
                    value: function get(id, params) {
                      if (typeof id === "undefined") {
                        return Promise.reject(new Error("id for 'get' can not be undefined"));
                      }
                      return this.request({
                        url: this.makeUrl(params.query, id),
                        method: "GET",
                        headers: Object.assign({}, params.headers)
                      }, params).catch(toError);
                    }
                  }, {
                    key: "create",
                    value: function create(body, params) {
                      return this.request({
                        url: this.makeUrl(params.query),
                        body,
                        method: "POST",
                        headers: Object.assign({
                          "Content-Type": "application/json"
                        }, params.headers)
                      }, params).catch(toError);
                    }
                  }, {
                    key: "update",
                    value: function update(id, body, params) {
                      if (typeof id === "undefined") {
                        return Promise.reject(new Error("id for 'update' can not be undefined, only 'null' when updating multiple entries"));
                      }
                      return this.request({
                        url: this.makeUrl(params.query, id),
                        body,
                        method: "PUT",
                        headers: Object.assign({
                          "Content-Type": "application/json"
                        }, params.headers)
                      }, params).catch(toError);
                    }
                  }, {
                    key: "patch",
                    value: function patch(id, body, params) {
                      if (typeof id === "undefined") {
                        return Promise.reject(new Error("id for 'patch' can not be undefined, only 'null' when updating multiple entries"));
                      }
                      return this.request({
                        url: this.makeUrl(params.query, id),
                        body,
                        method: "PATCH",
                        headers: Object.assign({
                          "Content-Type": "application/json"
                        }, params.headers)
                      }, params).catch(toError);
                    }
                  }, {
                    key: "remove",
                    value: function remove(id, params) {
                      if (typeof id === "undefined") {
                        return Promise.reject(new Error("id for 'remove' can not be undefined, only 'null' when removing multiple entries"));
                      }
                      return this.request({
                        url: this.makeUrl(params.query, id),
                        method: "DELETE",
                        headers: Object.assign({}, params.headers)
                      }, params).catch(toError);
                    }
                  }]);
                  return Base2;
                }();
                exports2.Base = Base;
              }
            ),
            /***/
            "../rest-client/lib/fetch.js": (
              /*!***********************************!*\
                !*** ../rest-client/lib/fetch.js ***!
                \***********************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.FetchClient = void 0;
                var errors_1 = __webpack_require__2(
                  /*! @feathersjs/errors */
                  "../errors/lib/index.js"
                );
                var base_1 = __webpack_require__2(
                  /*! ./base */
                  "../rest-client/lib/base.js"
                );
                var FetchClient = function(_base_1$Base) {
                  _inherits(FetchClient2, _base_1$Base);
                  var _super = _createSuper(FetchClient2);
                  function FetchClient2() {
                    _classCallCheck(this, FetchClient2);
                    return _super.apply(this, arguments);
                  }
                  _createClass(FetchClient2, [{
                    key: "request",
                    value: function request(options, params) {
                      var fetchOptions = Object.assign({}, options, params.connection);
                      fetchOptions.headers = Object.assign({
                        Accept: "application/json"
                      }, this.options.headers, fetchOptions.headers);
                      if (options.body) {
                        fetchOptions.body = JSON.stringify(options.body);
                      }
                      return this.connection(options.url, fetchOptions).then(this.checkStatus).then(function(response) {
                        if (response.status === 204) {
                          return null;
                        }
                        return response.json();
                      });
                    }
                  }, {
                    key: "checkStatus",
                    value: function checkStatus(response) {
                      if (response.ok) {
                        return response;
                      }
                      return response.json().catch(function() {
                        var ErrorClass = errors_1.errors[response.status] || Error;
                        return new ErrorClass("JSON parsing error");
                      }).then(function(error) {
                        error.response = response;
                        throw error;
                      });
                    }
                  }]);
                  return FetchClient2;
                }(base_1.Base);
                exports2.FetchClient = FetchClient;
              }
            ),
            /***/
            "../rest-client/lib/index.js": (
              /*!***********************************!*\
                !*** ../rest-client/lib/index.js ***!
                \***********************************/
              /***/
              function(module2, exports2, __webpack_require__2) {
                "use strict";
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.SuperagentClient = exports2.FetchClient = exports2.AxiosClient = void 0;
                var feathers_1 = __webpack_require__2(
                  /*! @feathersjs/feathers */
                  "../feathers/lib/index.js"
                );
                var base_1 = __webpack_require__2(
                  /*! ./base */
                  "../rest-client/lib/base.js"
                );
                var axios_1 = __webpack_require__2(
                  /*! ./axios */
                  "../rest-client/lib/axios.js"
                );
                Object.defineProperty(exports2, "AxiosClient", {
                  enumerable: true,
                  get: function get() {
                    return axios_1.AxiosClient;
                  }
                });
                var fetch_1 = __webpack_require__2(
                  /*! ./fetch */
                  "../rest-client/lib/fetch.js"
                );
                Object.defineProperty(exports2, "FetchClient", {
                  enumerable: true,
                  get: function get() {
                    return fetch_1.FetchClient;
                  }
                });
                var superagent_1 = __webpack_require__2(
                  /*! ./superagent */
                  "../rest-client/lib/superagent.js"
                );
                Object.defineProperty(exports2, "SuperagentClient", {
                  enumerable: true,
                  get: function get() {
                    return superagent_1.SuperagentClient;
                  }
                });
                var transports = {
                  superagent: superagent_1.SuperagentClient,
                  fetch: fetch_1.FetchClient,
                  axios: axios_1.AxiosClient
                };
                function restClient() {
                  var base = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
                  var result = {
                    Base: base_1.Base
                  };
                  Object.keys(transports).forEach(function(key) {
                    result[key] = function(connection) {
                      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      var Service = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : transports[key];
                      if (!connection) {
                        throw new Error("".concat(key, " has to be provided to feathers-rest"));
                      }
                      if (typeof options === "function") {
                        Service = options;
                        options = {};
                      }
                      var defaultService = function defaultService2(name) {
                        return new Service({
                          base,
                          name,
                          connection,
                          options
                        });
                      };
                      var initialize = function initialize2(app) {
                        if (app.rest !== void 0) {
                          throw new Error("Only one default client provider can be configured");
                        }
                        app.rest = connection;
                        app.defaultService = defaultService;
                        app.mixins.unshift(function(service, _location, options2) {
                          if (options2 && options2.methods && service instanceof base_1.Base) {
                            var customMethods = options2.methods.filter(function(name) {
                              return !feathers_1.defaultServiceMethods.includes(name);
                            });
                            service.methods.apply(service, _toConsumableArray(customMethods));
                          }
                        });
                      };
                      initialize.Service = Service;
                      initialize.service = defaultService;
                      return initialize;
                    };
                  });
                  return result;
                }
                exports2["default"] = restClient;
                if (true) {
                  module2.exports = Object.assign(restClient, module2.exports);
                }
              }
            ),
            /***/
            "../rest-client/lib/superagent.js": (
              /*!****************************************!*\
                !*** ../rest-client/lib/superagent.js ***!
                \****************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.SuperagentClient = void 0;
                var base_1 = __webpack_require__2(
                  /*! ./base */
                  "../rest-client/lib/base.js"
                );
                var SuperagentClient = function(_base_1$Base) {
                  _inherits(SuperagentClient2, _base_1$Base);
                  var _super = _createSuper(SuperagentClient2);
                  function SuperagentClient2() {
                    _classCallCheck(this, SuperagentClient2);
                    return _super.apply(this, arguments);
                  }
                  _createClass(SuperagentClient2, [{
                    key: "request",
                    value: function request(options, params) {
                      var superagent = this.connection(options.method, options.url).set(this.options.headers || {}).set("Accept", "application/json").set(params.connection || {}).set(options.headers || {}).type(options.type || "json");
                      return new Promise(function(resolve, reject) {
                        superagent.set(options.headers);
                        if (options.body) {
                          superagent.send(options.body);
                        }
                        superagent.end(function(error, res) {
                          if (error) {
                            try {
                              var response = error.response;
                              error = JSON.parse(error.response.text);
                              error.response = response;
                            } catch (e) {
                            }
                            return reject(error);
                          }
                          resolve(res && res.body);
                        });
                      });
                    }
                  }]);
                  return SuperagentClient2;
                }(base_1.Base);
                exports2.SuperagentClient = SuperagentClient;
              }
            ),
            /***/
            "../socketio-client/lib/index.js": (
              /*!***************************************!*\
                !*** ../socketio-client/lib/index.js ***!
                \***************************************/
              /***/
              function(module2, exports2, __webpack_require__2) {
                "use strict";
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                var client_1 = __webpack_require__2(
                  /*! @feathersjs/transport-commons/client */
                  "../transport-commons/client.js"
                );
                var feathers_1 = __webpack_require__2(
                  /*! @feathersjs/feathers */
                  "../feathers/lib/index.js"
                );
                function socketioClient(connection, options) {
                  if (!connection) {
                    throw new Error("Socket.io connection needs to be provided");
                  }
                  var defaultService = function defaultService2(name) {
                    var events = Object.values(feathers_1.defaultEventMap);
                    var settings = Object.assign({}, options, {
                      events,
                      name,
                      connection,
                      method: "emit"
                    });
                    return new client_1.Service(settings);
                  };
                  var initialize = function initialize2(app) {
                    if (app.io !== void 0) {
                      throw new Error("Only one default client provider can be configured");
                    }
                    app.io = connection;
                    app.defaultService = defaultService;
                    app.mixins.unshift(function(service, _location, options2) {
                      if (options2 && options2.methods && service instanceof client_1.Service) {
                        var customMethods = options2.methods.filter(function(name) {
                          return !feathers_1.defaultServiceMethods.includes(name);
                        });
                        service.methods.apply(service, _toConsumableArray(customMethods));
                      }
                    });
                  };
                  initialize.Service = client_1.Service;
                  initialize.service = defaultService;
                  return initialize;
                }
                exports2["default"] = socketioClient;
                if (true) {
                  module2.exports = Object.assign(socketioClient, module2.exports);
                }
              }
            ),
            /***/
            "../transport-commons/client.js": (
              /*!**************************************!*\
                !*** ../transport-commons/client.js ***!
                \**************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                module2.exports = __webpack_require__2(
                  /*! ./lib/client */
                  "../transport-commons/lib/client.js"
                );
              }
            ),
            /***/
            "../transport-commons/lib/client.js": (
              /*!******************************************!*\
                !*** ../transport-commons/lib/client.js ***!
                \******************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.Service = void 0;
                var errors_1 = __webpack_require__2(
                  /*! @feathersjs/errors */
                  "../errors/lib/index.js"
                );
                var commons_1 = __webpack_require__2(
                  /*! @feathersjs/commons */
                  "../commons/lib/index.js"
                );
                var debug = (0, commons_1.createDebug)("@feathersjs/transport-commons/client");
                var namespacedEmitterMethods = ["addListener", "addEventListener", "emit", "listenerCount", "listeners", "on", "once", "prependListener", "prependOnceListener", "removeAllListeners", "removeEventListener", "removeListener"];
                var otherEmitterMethods = ["eventNames", "getMaxListeners", "setMaxListeners"];
                var addEmitterMethods = function addEmitterMethods2(service) {
                  otherEmitterMethods.forEach(function(method) {
                    service[method] = function() {
                      var _this$connection;
                      if (typeof this.connection[method] !== "function") {
                        throw new Error("Can not call '".concat(method, "' on the client service connection"));
                      }
                      return (_this$connection = this.connection)[method].apply(_this$connection, arguments);
                    };
                  });
                  namespacedEmitterMethods.forEach(function(method) {
                    service[method] = function(name) {
                      var _this$connection2;
                      if (typeof this.connection[method] !== "function") {
                        throw new Error("Can not call '".concat(method, "' on the client service connection"));
                      }
                      var eventName = "".concat(this.path, " ").concat(name);
                      debug("Calling emitter method ".concat(method, " with ") + "namespaced event '".concat(eventName, "'"));
                      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                      }
                      var result = (_this$connection2 = this.connection)[method].apply(_this$connection2, [eventName].concat(args));
                      return result === this.connection ? this : result;
                    };
                  });
                };
                var Service = function() {
                  function Service2(options) {
                    _classCallCheck(this, Service2);
                    this.events = options.events;
                    this.path = options.name;
                    this.connection = options.connection;
                    this.method = options.method;
                    addEmitterMethods(this);
                  }
                  _createClass(Service2, [{
                    key: "send",
                    value: function send(method) {
                      var _this = this;
                      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        args[_key2 - 1] = arguments[_key2];
                      }
                      return new Promise(function(resolve, reject) {
                        var _this$connection3;
                        args.unshift(method, _this.path);
                        args.push(function(error, data) {
                          return error ? reject((0, errors_1.convert)(error)) : resolve(data);
                        });
                        debug("Sending socket.".concat(_this.method), args);
                        (_this$connection3 = _this.connection)[_this.method].apply(_this$connection3, args);
                      });
                    }
                  }, {
                    key: "methods",
                    value: function methods() {
                      var _this2 = this;
                      for (var _len3 = arguments.length, names = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                        names[_key3] = arguments[_key3];
                      }
                      names.forEach(function(name) {
                        _this2[name] = function(data) {
                          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                          return this.send(name, data, params.query || {});
                        };
                      });
                      return this;
                    }
                  }, {
                    key: "find",
                    value: function find() {
                      var params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                      return this.send("find", params.query || {});
                    }
                  }, {
                    key: "get",
                    value: function get(id) {
                      var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      return this.send("get", id, params.query || {});
                    }
                  }, {
                    key: "create",
                    value: function create(data) {
                      var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      return this.send("create", data, params.query || {});
                    }
                  }, {
                    key: "update",
                    value: function update(id, data) {
                      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                      return this.send("update", id, data, params.query || {});
                    }
                  }, {
                    key: "patch",
                    value: function patch(id, data) {
                      var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                      return this.send("patch", id, data, params.query || {});
                    }
                  }, {
                    key: "remove",
                    value: function remove(id) {
                      var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                      return this.send("remove", id, params.query || {});
                    }
                    // `off` is actually not part of the Node event emitter spec
                    // but we are adding it since everybody is expecting it because
                    // of the emitter-component Socket.io is using
                  }, {
                    key: "off",
                    value: function off(name) {
                      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                        args[_key4 - 1] = arguments[_key4];
                      }
                      if (typeof this.connection.off === "function") {
                        var _this$connection4;
                        var result = (_this$connection4 = this.connection).off.apply(_this$connection4, ["".concat(this.path, " ").concat(name)].concat(args));
                        return result === this.connection ? this : result;
                      } else if (args.length === 0) {
                        return this.removeAllListeners(name);
                      }
                      return this.removeListener.apply(this, [name].concat(args));
                    }
                  }]);
                  return Service2;
                }();
                exports2.Service = Service;
              }
            ),
            /***/
            "../../node_modules/call-bind/callBound.js": (
              /*!*************************************************!*\
                !*** ../../node_modules/call-bind/callBound.js ***!
                \*************************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var GetIntrinsic = __webpack_require__2(
                  /*! get-intrinsic */
                  "../../node_modules/get-intrinsic/index.js"
                );
                var callBind = __webpack_require__2(
                  /*! ./ */
                  "../../node_modules/call-bind/index.js"
                );
                var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
                module2.exports = function callBoundIntrinsic(name, allowMissing) {
                  var intrinsic = GetIntrinsic(name, !!allowMissing);
                  if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
                    return callBind(intrinsic);
                  }
                  return intrinsic;
                };
              }
            ),
            /***/
            "../../node_modules/call-bind/index.js": (
              /*!*********************************************!*\
                !*** ../../node_modules/call-bind/index.js ***!
                \*********************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var bind = __webpack_require__2(
                  /*! function-bind */
                  "../../node_modules/function-bind/index.js"
                );
                var GetIntrinsic = __webpack_require__2(
                  /*! get-intrinsic */
                  "../../node_modules/get-intrinsic/index.js"
                );
                var $apply = GetIntrinsic("%Function.prototype.apply%");
                var $call = GetIntrinsic("%Function.prototype.call%");
                var $reflectApply = GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);
                var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
                var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
                var $max = GetIntrinsic("%Math.max%");
                if ($defineProperty) {
                  try {
                    $defineProperty({}, "a", { value: 1 });
                  } catch (e) {
                    $defineProperty = null;
                  }
                }
                module2.exports = function callBind(originalFunction) {
                  var func = $reflectApply(bind, $call, arguments);
                  if ($gOPD && $defineProperty) {
                    var desc = $gOPD(func, "length");
                    if (desc.configurable) {
                      $defineProperty(
                        func,
                        "length",
                        { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
                      );
                    }
                  }
                  return func;
                };
                var applyBind = function applyBind2() {
                  return $reflectApply(bind, $apply, arguments);
                };
                if ($defineProperty) {
                  $defineProperty(module2.exports, "apply", { value: applyBind });
                } else {
                  module2.exports.apply = applyBind;
                }
              }
            ),
            /***/
            "../../node_modules/events/events.js": (
              /*!*******************************************!*\
                !*** ../../node_modules/events/events.js ***!
                \*******************************************/
              /***/
              function(module2) {
                "use strict";
                var R = typeof Reflect === "object" ? Reflect : null;
                var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
                  return Function.prototype.apply.call(target, receiver, args);
                };
                var ReflectOwnKeys;
                if (R && typeof R.ownKeys === "function") {
                  ReflectOwnKeys = R.ownKeys;
                } else if (Object.getOwnPropertySymbols) {
                  ReflectOwnKeys = function ReflectOwnKeys2(target) {
                    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
                  };
                } else {
                  ReflectOwnKeys = function ReflectOwnKeys2(target) {
                    return Object.getOwnPropertyNames(target);
                  };
                }
                function ProcessEmitWarning(warning) {
                  if (console && console.warn)
                    console.warn(warning);
                }
                var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
                  return value !== value;
                };
                function EventEmitter() {
                  EventEmitter.init.call(this);
                }
                module2.exports = EventEmitter;
                module2.exports.once = once;
                EventEmitter.EventEmitter = EventEmitter;
                EventEmitter.prototype._events = void 0;
                EventEmitter.prototype._eventsCount = 0;
                EventEmitter.prototype._maxListeners = void 0;
                var defaultMaxListeners = 10;
                function checkListener(listener) {
                  if (typeof listener !== "function") {
                    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
                  }
                }
                Object.defineProperty(EventEmitter, "defaultMaxListeners", {
                  enumerable: true,
                  get: function() {
                    return defaultMaxListeners;
                  },
                  set: function(arg) {
                    if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
                      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
                    }
                    defaultMaxListeners = arg;
                  }
                });
                EventEmitter.init = function() {
                  if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
                    this._events = /* @__PURE__ */ Object.create(null);
                    this._eventsCount = 0;
                  }
                  this._maxListeners = this._maxListeners || void 0;
                };
                EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
                  if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
                    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
                  }
                  this._maxListeners = n;
                  return this;
                };
                function _getMaxListeners(that) {
                  if (that._maxListeners === void 0)
                    return EventEmitter.defaultMaxListeners;
                  return that._maxListeners;
                }
                EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
                  return _getMaxListeners(this);
                };
                EventEmitter.prototype.emit = function emit(type) {
                  var args = [];
                  for (var i = 1; i < arguments.length; i++)
                    args.push(arguments[i]);
                  var doError = type === "error";
                  var events = this._events;
                  if (events !== void 0)
                    doError = doError && events.error === void 0;
                  else if (!doError)
                    return false;
                  if (doError) {
                    var er;
                    if (args.length > 0)
                      er = args[0];
                    if (er instanceof Error) {
                      throw er;
                    }
                    var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
                    err.context = er;
                    throw err;
                  }
                  var handler = events[type];
                  if (handler === void 0)
                    return false;
                  if (typeof handler === "function") {
                    ReflectApply(handler, this, args);
                  } else {
                    var len = handler.length;
                    var listeners = arrayClone(handler, len);
                    for (var i = 0; i < len; ++i)
                      ReflectApply(listeners[i], this, args);
                  }
                  return true;
                };
                function _addListener(target, type, listener, prepend) {
                  var m;
                  var events;
                  var existing;
                  checkListener(listener);
                  events = target._events;
                  if (events === void 0) {
                    events = target._events = /* @__PURE__ */ Object.create(null);
                    target._eventsCount = 0;
                  } else {
                    if (events.newListener !== void 0) {
                      target.emit(
                        "newListener",
                        type,
                        listener.listener ? listener.listener : listener
                      );
                      events = target._events;
                    }
                    existing = events[type];
                  }
                  if (existing === void 0) {
                    existing = events[type] = listener;
                    ++target._eventsCount;
                  } else {
                    if (typeof existing === "function") {
                      existing = events[type] = prepend ? [listener, existing] : [existing, listener];
                    } else if (prepend) {
                      existing.unshift(listener);
                    } else {
                      existing.push(listener);
                    }
                    m = _getMaxListeners(target);
                    if (m > 0 && existing.length > m && !existing.warned) {
                      existing.warned = true;
                      var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
                      w.name = "MaxListenersExceededWarning";
                      w.emitter = target;
                      w.type = type;
                      w.count = existing.length;
                      ProcessEmitWarning(w);
                    }
                  }
                  return target;
                }
                EventEmitter.prototype.addListener = function addListener(type, listener) {
                  return _addListener(this, type, listener, false);
                };
                EventEmitter.prototype.on = EventEmitter.prototype.addListener;
                EventEmitter.prototype.prependListener = function prependListener(type, listener) {
                  return _addListener(this, type, listener, true);
                };
                function onceWrapper() {
                  if (!this.fired) {
                    this.target.removeListener(this.type, this.wrapFn);
                    this.fired = true;
                    if (arguments.length === 0)
                      return this.listener.call(this.target);
                    return this.listener.apply(this.target, arguments);
                  }
                }
                function _onceWrap(target, type, listener) {
                  var state = { fired: false, wrapFn: void 0, target, type, listener };
                  var wrapped = onceWrapper.bind(state);
                  wrapped.listener = listener;
                  state.wrapFn = wrapped;
                  return wrapped;
                }
                EventEmitter.prototype.once = function once2(type, listener) {
                  checkListener(listener);
                  this.on(type, _onceWrap(this, type, listener));
                  return this;
                };
                EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
                  checkListener(listener);
                  this.prependListener(type, _onceWrap(this, type, listener));
                  return this;
                };
                EventEmitter.prototype.removeListener = function removeListener(type, listener) {
                  var list, events, position, i, originalListener;
                  checkListener(listener);
                  events = this._events;
                  if (events === void 0)
                    return this;
                  list = events[type];
                  if (list === void 0)
                    return this;
                  if (list === listener || list.listener === listener) {
                    if (--this._eventsCount === 0)
                      this._events = /* @__PURE__ */ Object.create(null);
                    else {
                      delete events[type];
                      if (events.removeListener)
                        this.emit("removeListener", type, list.listener || listener);
                    }
                  } else if (typeof list !== "function") {
                    position = -1;
                    for (i = list.length - 1; i >= 0; i--) {
                      if (list[i] === listener || list[i].listener === listener) {
                        originalListener = list[i].listener;
                        position = i;
                        break;
                      }
                    }
                    if (position < 0)
                      return this;
                    if (position === 0)
                      list.shift();
                    else {
                      spliceOne(list, position);
                    }
                    if (list.length === 1)
                      events[type] = list[0];
                    if (events.removeListener !== void 0)
                      this.emit("removeListener", type, originalListener || listener);
                  }
                  return this;
                };
                EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
                EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
                  var listeners, events, i;
                  events = this._events;
                  if (events === void 0)
                    return this;
                  if (events.removeListener === void 0) {
                    if (arguments.length === 0) {
                      this._events = /* @__PURE__ */ Object.create(null);
                      this._eventsCount = 0;
                    } else if (events[type] !== void 0) {
                      if (--this._eventsCount === 0)
                        this._events = /* @__PURE__ */ Object.create(null);
                      else
                        delete events[type];
                    }
                    return this;
                  }
                  if (arguments.length === 0) {
                    var keys = Object.keys(events);
                    var key;
                    for (i = 0; i < keys.length; ++i) {
                      key = keys[i];
                      if (key === "removeListener")
                        continue;
                      this.removeAllListeners(key);
                    }
                    this.removeAllListeners("removeListener");
                    this._events = /* @__PURE__ */ Object.create(null);
                    this._eventsCount = 0;
                    return this;
                  }
                  listeners = events[type];
                  if (typeof listeners === "function") {
                    this.removeListener(type, listeners);
                  } else if (listeners !== void 0) {
                    for (i = listeners.length - 1; i >= 0; i--) {
                      this.removeListener(type, listeners[i]);
                    }
                  }
                  return this;
                };
                function _listeners(target, type, unwrap) {
                  var events = target._events;
                  if (events === void 0)
                    return [];
                  var evlistener = events[type];
                  if (evlistener === void 0)
                    return [];
                  if (typeof evlistener === "function")
                    return unwrap ? [evlistener.listener || evlistener] : [evlistener];
                  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
                }
                EventEmitter.prototype.listeners = function listeners(type) {
                  return _listeners(this, type, true);
                };
                EventEmitter.prototype.rawListeners = function rawListeners(type) {
                  return _listeners(this, type, false);
                };
                EventEmitter.listenerCount = function(emitter, type) {
                  if (typeof emitter.listenerCount === "function") {
                    return emitter.listenerCount(type);
                  } else {
                    return listenerCount.call(emitter, type);
                  }
                };
                EventEmitter.prototype.listenerCount = listenerCount;
                function listenerCount(type) {
                  var events = this._events;
                  if (events !== void 0) {
                    var evlistener = events[type];
                    if (typeof evlistener === "function") {
                      return 1;
                    } else if (evlistener !== void 0) {
                      return evlistener.length;
                    }
                  }
                  return 0;
                }
                EventEmitter.prototype.eventNames = function eventNames() {
                  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
                };
                function arrayClone(arr, n) {
                  var copy = new Array(n);
                  for (var i = 0; i < n; ++i)
                    copy[i] = arr[i];
                  return copy;
                }
                function spliceOne(list, index) {
                  for (; index + 1 < list.length; index++)
                    list[index] = list[index + 1];
                  list.pop();
                }
                function unwrapListeners(arr) {
                  var ret = new Array(arr.length);
                  for (var i = 0; i < ret.length; ++i) {
                    ret[i] = arr[i].listener || arr[i];
                  }
                  return ret;
                }
                function once(emitter, name) {
                  return new Promise(function(resolve, reject) {
                    function errorListener(err) {
                      emitter.removeListener(name, resolver);
                      reject(err);
                    }
                    function resolver() {
                      if (typeof emitter.removeListener === "function") {
                        emitter.removeListener("error", errorListener);
                      }
                      resolve([].slice.call(arguments));
                    }
                    ;
                    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
                    if (name !== "error") {
                      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
                    }
                  });
                }
                function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
                  if (typeof emitter.on === "function") {
                    eventTargetAgnosticAddListener(emitter, "error", handler, flags);
                  }
                }
                function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
                  if (typeof emitter.on === "function") {
                    if (flags.once) {
                      emitter.once(name, listener);
                    } else {
                      emitter.on(name, listener);
                    }
                  } else if (typeof emitter.addEventListener === "function") {
                    emitter.addEventListener(name, function wrapListener(arg) {
                      if (flags.once) {
                        emitter.removeEventListener(name, wrapListener);
                      }
                      listener(arg);
                    });
                  } else {
                    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
                  }
                }
              }
            ),
            /***/
            "../../node_modules/function-bind/implementation.js": (
              /*!**********************************************************!*\
                !*** ../../node_modules/function-bind/implementation.js ***!
                \**********************************************************/
              /***/
              function(module2) {
                "use strict";
                var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
                var slice = Array.prototype.slice;
                var toStr = Object.prototype.toString;
                var funcType = "[object Function]";
                module2.exports = function bind(that) {
                  var target = this;
                  if (typeof target !== "function" || toStr.call(target) !== funcType) {
                    throw new TypeError(ERROR_MESSAGE + target);
                  }
                  var args = slice.call(arguments, 1);
                  var bound;
                  var binder = function() {
                    if (this instanceof bound) {
                      var result = target.apply(
                        this,
                        args.concat(slice.call(arguments))
                      );
                      if (Object(result) === result) {
                        return result;
                      }
                      return this;
                    } else {
                      return target.apply(
                        that,
                        args.concat(slice.call(arguments))
                      );
                    }
                  };
                  var boundLength = Math.max(0, target.length - args.length);
                  var boundArgs = [];
                  for (var i = 0; i < boundLength; i++) {
                    boundArgs.push("$" + i);
                  }
                  bound = Function("binder", "return function (" + boundArgs.join(",") + "){ return binder.apply(this,arguments); }")(binder);
                  if (target.prototype) {
                    var Empty = function Empty2() {
                    };
                    Empty.prototype = target.prototype;
                    bound.prototype = new Empty();
                    Empty.prototype = null;
                  }
                  return bound;
                };
              }
            ),
            /***/
            "../../node_modules/function-bind/index.js": (
              /*!*************************************************!*\
                !*** ../../node_modules/function-bind/index.js ***!
                \*************************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var implementation = __webpack_require__2(
                  /*! ./implementation */
                  "../../node_modules/function-bind/implementation.js"
                );
                module2.exports = Function.prototype.bind || implementation;
              }
            ),
            /***/
            "../../node_modules/get-intrinsic/index.js": (
              /*!*************************************************!*\
                !*** ../../node_modules/get-intrinsic/index.js ***!
                \*************************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var undefined2;
                var $SyntaxError = SyntaxError;
                var $Function = Function;
                var $TypeError = TypeError;
                var getEvalledConstructor = function(expressionSyntax) {
                  try {
                    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
                  } catch (e) {
                  }
                };
                var $gOPD = Object.getOwnPropertyDescriptor;
                if ($gOPD) {
                  try {
                    $gOPD({}, "");
                  } catch (e) {
                    $gOPD = null;
                  }
                }
                var throwTypeError = function() {
                  throw new $TypeError();
                };
                var ThrowTypeError = $gOPD ? function() {
                  try {
                    arguments.callee;
                    return throwTypeError;
                  } catch (calleeThrows) {
                    try {
                      return $gOPD(arguments, "callee").get;
                    } catch (gOPDthrows) {
                      return throwTypeError;
                    }
                  }
                }() : throwTypeError;
                var hasSymbols = __webpack_require__2(
                  /*! has-symbols */
                  "../../node_modules/has-symbols/index.js"
                )();
                var getProto = Object.getPrototypeOf || function(x) {
                  return x.__proto__;
                };
                var needsEval = {};
                var TypedArray = typeof Uint8Array === "undefined" ? undefined2 : getProto(Uint8Array);
                var INTRINSICS = {
                  "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
                  "%Array%": Array,
                  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
                  "%ArrayIteratorPrototype%": hasSymbols ? getProto([][Symbol.iterator]()) : undefined2,
                  "%AsyncFromSyncIteratorPrototype%": undefined2,
                  "%AsyncFunction%": needsEval,
                  "%AsyncGenerator%": needsEval,
                  "%AsyncGeneratorFunction%": needsEval,
                  "%AsyncIteratorPrototype%": needsEval,
                  "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
                  "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
                  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
                  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
                  "%Boolean%": Boolean,
                  "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
                  "%Date%": Date,
                  "%decodeURI%": decodeURI,
                  "%decodeURIComponent%": decodeURIComponent,
                  "%encodeURI%": encodeURI,
                  "%encodeURIComponent%": encodeURIComponent,
                  "%Error%": Error,
                  "%eval%": eval,
                  // eslint-disable-line no-eval
                  "%EvalError%": EvalError,
                  "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
                  "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
                  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
                  "%Function%": $Function,
                  "%GeneratorFunction%": needsEval,
                  "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
                  "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
                  "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
                  "%isFinite%": isFinite,
                  "%isNaN%": isNaN,
                  "%IteratorPrototype%": hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined2,
                  "%JSON%": typeof JSON === "object" ? JSON : undefined2,
                  "%Map%": typeof Map === "undefined" ? undefined2 : Map,
                  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
                  "%Math%": Math,
                  "%Number%": Number,
                  "%Object%": Object,
                  "%parseFloat%": parseFloat,
                  "%parseInt%": parseInt,
                  "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
                  "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
                  "%RangeError%": RangeError,
                  "%ReferenceError%": ReferenceError,
                  "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
                  "%RegExp%": RegExp,
                  "%Set%": typeof Set === "undefined" ? undefined2 : Set,
                  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
                  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
                  "%String%": String,
                  "%StringIteratorPrototype%": hasSymbols ? getProto(""[Symbol.iterator]()) : undefined2,
                  "%Symbol%": hasSymbols ? Symbol : undefined2,
                  "%SyntaxError%": $SyntaxError,
                  "%ThrowTypeError%": ThrowTypeError,
                  "%TypedArray%": TypedArray,
                  "%TypeError%": $TypeError,
                  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
                  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
                  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
                  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
                  "%URIError%": URIError,
                  "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
                  "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
                  "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet
                };
                try {
                  null.error;
                } catch (e) {
                  var errorProto = getProto(getProto(e));
                  INTRINSICS["%Error.prototype%"] = errorProto;
                }
                var doEval = function doEval2(name) {
                  var value;
                  if (name === "%AsyncFunction%") {
                    value = getEvalledConstructor("async function () {}");
                  } else if (name === "%GeneratorFunction%") {
                    value = getEvalledConstructor("function* () {}");
                  } else if (name === "%AsyncGeneratorFunction%") {
                    value = getEvalledConstructor("async function* () {}");
                  } else if (name === "%AsyncGenerator%") {
                    var fn = doEval2("%AsyncGeneratorFunction%");
                    if (fn) {
                      value = fn.prototype;
                    }
                  } else if (name === "%AsyncIteratorPrototype%") {
                    var gen = doEval2("%AsyncGenerator%");
                    if (gen) {
                      value = getProto(gen.prototype);
                    }
                  }
                  INTRINSICS[name] = value;
                  return value;
                };
                var LEGACY_ALIASES = {
                  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
                  "%ArrayPrototype%": ["Array", "prototype"],
                  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
                  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
                  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
                  "%ArrayProto_values%": ["Array", "prototype", "values"],
                  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
                  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
                  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
                  "%BooleanPrototype%": ["Boolean", "prototype"],
                  "%DataViewPrototype%": ["DataView", "prototype"],
                  "%DatePrototype%": ["Date", "prototype"],
                  "%ErrorPrototype%": ["Error", "prototype"],
                  "%EvalErrorPrototype%": ["EvalError", "prototype"],
                  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
                  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
                  "%FunctionPrototype%": ["Function", "prototype"],
                  "%Generator%": ["GeneratorFunction", "prototype"],
                  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
                  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
                  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
                  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
                  "%JSONParse%": ["JSON", "parse"],
                  "%JSONStringify%": ["JSON", "stringify"],
                  "%MapPrototype%": ["Map", "prototype"],
                  "%NumberPrototype%": ["Number", "prototype"],
                  "%ObjectPrototype%": ["Object", "prototype"],
                  "%ObjProto_toString%": ["Object", "prototype", "toString"],
                  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
                  "%PromisePrototype%": ["Promise", "prototype"],
                  "%PromiseProto_then%": ["Promise", "prototype", "then"],
                  "%Promise_all%": ["Promise", "all"],
                  "%Promise_reject%": ["Promise", "reject"],
                  "%Promise_resolve%": ["Promise", "resolve"],
                  "%RangeErrorPrototype%": ["RangeError", "prototype"],
                  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
                  "%RegExpPrototype%": ["RegExp", "prototype"],
                  "%SetPrototype%": ["Set", "prototype"],
                  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
                  "%StringPrototype%": ["String", "prototype"],
                  "%SymbolPrototype%": ["Symbol", "prototype"],
                  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
                  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
                  "%TypeErrorPrototype%": ["TypeError", "prototype"],
                  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
                  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
                  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
                  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
                  "%URIErrorPrototype%": ["URIError", "prototype"],
                  "%WeakMapPrototype%": ["WeakMap", "prototype"],
                  "%WeakSetPrototype%": ["WeakSet", "prototype"]
                };
                var bind = __webpack_require__2(
                  /*! function-bind */
                  "../../node_modules/function-bind/index.js"
                );
                var hasOwn = __webpack_require__2(
                  /*! has */
                  "../../node_modules/has/src/index.js"
                );
                var $concat = bind.call(Function.call, Array.prototype.concat);
                var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
                var $replace = bind.call(Function.call, String.prototype.replace);
                var $strSlice = bind.call(Function.call, String.prototype.slice);
                var $exec = bind.call(Function.call, RegExp.prototype.exec);
                var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
                var reEscapeChar = /\\(\\)?/g;
                var stringToPath = function stringToPath2(string) {
                  var first = $strSlice(string, 0, 1);
                  var last = $strSlice(string, -1);
                  if (first === "%" && last !== "%") {
                    throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
                  } else if (last === "%" && first !== "%") {
                    throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
                  }
                  var result = [];
                  $replace(string, rePropName, function(match, number, quote, subString) {
                    result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
                  });
                  return result;
                };
                var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
                  var intrinsicName = name;
                  var alias;
                  if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
                    alias = LEGACY_ALIASES[intrinsicName];
                    intrinsicName = "%" + alias[0] + "%";
                  }
                  if (hasOwn(INTRINSICS, intrinsicName)) {
                    var value = INTRINSICS[intrinsicName];
                    if (value === needsEval) {
                      value = doEval(intrinsicName);
                    }
                    if (typeof value === "undefined" && !allowMissing) {
                      throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
                    }
                    return {
                      alias,
                      name: intrinsicName,
                      value
                    };
                  }
                  throw new $SyntaxError("intrinsic " + name + " does not exist!");
                };
                module2.exports = function GetIntrinsic(name, allowMissing) {
                  if (typeof name !== "string" || name.length === 0) {
                    throw new $TypeError("intrinsic name must be a non-empty string");
                  }
                  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
                    throw new $TypeError('"allowMissing" argument must be a boolean');
                  }
                  if ($exec(/^%?[^%]*%?$/, name) === null) {
                    throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
                  }
                  var parts = stringToPath(name);
                  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
                  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
                  var intrinsicRealName = intrinsic.name;
                  var value = intrinsic.value;
                  var skipFurtherCaching = false;
                  var alias = intrinsic.alias;
                  if (alias) {
                    intrinsicBaseName = alias[0];
                    $spliceApply(parts, $concat([0, 1], alias));
                  }
                  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
                    var part = parts[i];
                    var first = $strSlice(part, 0, 1);
                    var last = $strSlice(part, -1);
                    if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
                      throw new $SyntaxError("property names with quotes must have matching quotes");
                    }
                    if (part === "constructor" || !isOwn) {
                      skipFurtherCaching = true;
                    }
                    intrinsicBaseName += "." + part;
                    intrinsicRealName = "%" + intrinsicBaseName + "%";
                    if (hasOwn(INTRINSICS, intrinsicRealName)) {
                      value = INTRINSICS[intrinsicRealName];
                    } else if (value != null) {
                      if (!(part in value)) {
                        if (!allowMissing) {
                          throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
                        }
                        return void 0;
                      }
                      if ($gOPD && i + 1 >= parts.length) {
                        var desc = $gOPD(value, part);
                        isOwn = !!desc;
                        if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                          value = desc.get;
                        } else {
                          value = value[part];
                        }
                      } else {
                        isOwn = hasOwn(value, part);
                        value = value[part];
                      }
                      if (isOwn && !skipFurtherCaching) {
                        INTRINSICS[intrinsicRealName] = value;
                      }
                    }
                  }
                  return value;
                };
              }
            ),
            /***/
            "../../node_modules/has-symbols/index.js": (
              /*!***********************************************!*\
                !*** ../../node_modules/has-symbols/index.js ***!
                \***********************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var origSymbol = typeof Symbol !== "undefined" && Symbol;
                var hasSymbolSham = __webpack_require__2(
                  /*! ./shams */
                  "../../node_modules/has-symbols/shams.js"
                );
                module2.exports = function hasNativeSymbols() {
                  if (typeof origSymbol !== "function") {
                    return false;
                  }
                  if (typeof Symbol !== "function") {
                    return false;
                  }
                  if (typeof origSymbol("foo") !== "symbol") {
                    return false;
                  }
                  if (typeof Symbol("bar") !== "symbol") {
                    return false;
                  }
                  return hasSymbolSham();
                };
              }
            ),
            /***/
            "../../node_modules/has-symbols/shams.js": (
              /*!***********************************************!*\
                !*** ../../node_modules/has-symbols/shams.js ***!
                \***********************************************/
              /***/
              function(module2) {
                "use strict";
                module2.exports = function hasSymbols() {
                  if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
                    return false;
                  }
                  if (typeof Symbol.iterator === "symbol") {
                    return true;
                  }
                  var obj = {};
                  var sym = Symbol("test");
                  var symObj = Object(sym);
                  if (typeof sym === "string") {
                    return false;
                  }
                  if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
                    return false;
                  }
                  if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
                    return false;
                  }
                  var symVal = 42;
                  obj[sym] = symVal;
                  for (sym in obj) {
                    return false;
                  }
                  if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
                    return false;
                  }
                  if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
                    return false;
                  }
                  var syms = Object.getOwnPropertySymbols(obj);
                  if (syms.length !== 1 || syms[0] !== sym) {
                    return false;
                  }
                  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
                    return false;
                  }
                  if (typeof Object.getOwnPropertyDescriptor === "function") {
                    var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
                    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
                      return false;
                    }
                  }
                  return true;
                };
              }
            ),
            /***/
            "../../node_modules/has/src/index.js": (
              /*!*******************************************!*\
                !*** ../../node_modules/has/src/index.js ***!
                \*******************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var bind = __webpack_require__2(
                  /*! function-bind */
                  "../../node_modules/function-bind/index.js"
                );
                module2.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
              }
            ),
            /***/
            "../../node_modules/object-inspect/index.js": (
              /*!**************************************************!*\
                !*** ../../node_modules/object-inspect/index.js ***!
                \**************************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                var hasMap = typeof Map === "function" && Map.prototype;
                var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
                var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
                var mapForEach = hasMap && Map.prototype.forEach;
                var hasSet = typeof Set === "function" && Set.prototype;
                var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
                var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
                var setForEach = hasSet && Set.prototype.forEach;
                var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
                var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
                var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
                var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
                var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
                var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
                var booleanValueOf = Boolean.prototype.valueOf;
                var objectToString = Object.prototype.toString;
                var functionToString = Function.prototype.toString;
                var $match = String.prototype.match;
                var $slice = String.prototype.slice;
                var $replace = String.prototype.replace;
                var $toUpperCase = String.prototype.toUpperCase;
                var $toLowerCase = String.prototype.toLowerCase;
                var $test = RegExp.prototype.test;
                var $concat = Array.prototype.concat;
                var $join = Array.prototype.join;
                var $arrSlice = Array.prototype.slice;
                var $floor = Math.floor;
                var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
                var gOPS = Object.getOwnPropertySymbols;
                var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
                var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
                var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
                var isEnumerable = Object.prototype.propertyIsEnumerable;
                var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
                  return O.__proto__;
                } : null);
                function addNumericSeparator(num, str) {
                  if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
                    return str;
                  }
                  var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
                  if (typeof num === "number") {
                    var int = num < 0 ? -$floor(-num) : $floor(num);
                    if (int !== num) {
                      var intStr = String(int);
                      var dec = $slice.call(str, intStr.length + 1);
                      return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
                    }
                  }
                  return $replace.call(str, sepRegex, "$&_");
                }
                var utilInspect = __webpack_require__2(
                  /*! ./util.inspect */
                  "?c95a"
                );
                var inspectCustom = utilInspect.custom;
                var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
                module2.exports = function inspect_(obj, options, depth, seen) {
                  var opts = options || {};
                  if (has(opts, "quoteStyle") && (opts.quoteStyle !== "single" && opts.quoteStyle !== "double")) {
                    throw new TypeError('option "quoteStyle" must be "single" or "double"');
                  }
                  if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
                    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
                  }
                  var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
                  if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
                    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
                  }
                  if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
                    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
                  }
                  if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
                    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
                  }
                  var numericSeparator = opts.numericSeparator;
                  if (typeof obj === "undefined") {
                    return "undefined";
                  }
                  if (obj === null) {
                    return "null";
                  }
                  if (typeof obj === "boolean") {
                    return obj ? "true" : "false";
                  }
                  if (typeof obj === "string") {
                    return inspectString(obj, opts);
                  }
                  if (typeof obj === "number") {
                    if (obj === 0) {
                      return Infinity / obj > 0 ? "0" : "-0";
                    }
                    var str = String(obj);
                    return numericSeparator ? addNumericSeparator(obj, str) : str;
                  }
                  if (typeof obj === "bigint") {
                    var bigIntStr = String(obj) + "n";
                    return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
                  }
                  var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
                  if (typeof depth === "undefined") {
                    depth = 0;
                  }
                  if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
                    return isArray(obj) ? "[Array]" : "[Object]";
                  }
                  var indent = getIndent(opts, depth);
                  if (typeof seen === "undefined") {
                    seen = [];
                  } else if (indexOf(seen, obj) >= 0) {
                    return "[Circular]";
                  }
                  function inspect(value, from, noIndent) {
                    if (from) {
                      seen = $arrSlice.call(seen);
                      seen.push(from);
                    }
                    if (noIndent) {
                      var newOpts = {
                        depth: opts.depth
                      };
                      if (has(opts, "quoteStyle")) {
                        newOpts.quoteStyle = opts.quoteStyle;
                      }
                      return inspect_(value, newOpts, depth + 1, seen);
                    }
                    return inspect_(value, opts, depth + 1, seen);
                  }
                  if (typeof obj === "function" && !isRegExp(obj)) {
                    var name = nameOf(obj);
                    var keys = arrObjKeys(obj, inspect);
                    return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
                  }
                  if (isSymbol(obj)) {
                    var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
                    return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
                  }
                  if (isElement(obj)) {
                    var s = "<" + $toLowerCase.call(String(obj.nodeName));
                    var attrs = obj.attributes || [];
                    for (var i = 0; i < attrs.length; i++) {
                      s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
                    }
                    s += ">";
                    if (obj.childNodes && obj.childNodes.length) {
                      s += "...";
                    }
                    s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
                    return s;
                  }
                  if (isArray(obj)) {
                    if (obj.length === 0) {
                      return "[]";
                    }
                    var xs = arrObjKeys(obj, inspect);
                    if (indent && !singleLineValues(xs)) {
                      return "[" + indentedJoin(xs, indent) + "]";
                    }
                    return "[ " + $join.call(xs, ", ") + " ]";
                  }
                  if (isError(obj)) {
                    var parts = arrObjKeys(obj, inspect);
                    if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
                      return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
                    }
                    if (parts.length === 0) {
                      return "[" + String(obj) + "]";
                    }
                    return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
                  }
                  if (typeof obj === "object" && customInspect) {
                    if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
                      return utilInspect(obj, { depth: maxDepth - depth });
                    } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
                      return obj.inspect();
                    }
                  }
                  if (isMap(obj)) {
                    var mapParts = [];
                    if (mapForEach) {
                      mapForEach.call(obj, function(value, key) {
                        mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
                      });
                    }
                    return collectionOf("Map", mapSize.call(obj), mapParts, indent);
                  }
                  if (isSet(obj)) {
                    var setParts = [];
                    if (setForEach) {
                      setForEach.call(obj, function(value) {
                        setParts.push(inspect(value, obj));
                      });
                    }
                    return collectionOf("Set", setSize.call(obj), setParts, indent);
                  }
                  if (isWeakMap(obj)) {
                    return weakCollectionOf("WeakMap");
                  }
                  if (isWeakSet(obj)) {
                    return weakCollectionOf("WeakSet");
                  }
                  if (isWeakRef(obj)) {
                    return weakCollectionOf("WeakRef");
                  }
                  if (isNumber(obj)) {
                    return markBoxed(inspect(Number(obj)));
                  }
                  if (isBigInt(obj)) {
                    return markBoxed(inspect(bigIntValueOf.call(obj)));
                  }
                  if (isBoolean(obj)) {
                    return markBoxed(booleanValueOf.call(obj));
                  }
                  if (isString(obj)) {
                    return markBoxed(inspect(String(obj)));
                  }
                  if (!isDate(obj) && !isRegExp(obj)) {
                    var ys = arrObjKeys(obj, inspect);
                    var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
                    var protoTag = obj instanceof Object ? "" : "null prototype";
                    var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
                    var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
                    var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
                    if (ys.length === 0) {
                      return tag + "{}";
                    }
                    if (indent) {
                      return tag + "{" + indentedJoin(ys, indent) + "}";
                    }
                    return tag + "{ " + $join.call(ys, ", ") + " }";
                  }
                  return String(obj);
                };
                function wrapQuotes(s, defaultStyle, opts) {
                  var quoteChar = (opts.quoteStyle || defaultStyle) === "double" ? '"' : "'";
                  return quoteChar + s + quoteChar;
                }
                function quote(s) {
                  return $replace.call(String(s), /"/g, "&quot;");
                }
                function isArray(obj) {
                  return toStr(obj) === "[object Array]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isDate(obj) {
                  return toStr(obj) === "[object Date]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isRegExp(obj) {
                  return toStr(obj) === "[object RegExp]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isError(obj) {
                  return toStr(obj) === "[object Error]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isString(obj) {
                  return toStr(obj) === "[object String]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isNumber(obj) {
                  return toStr(obj) === "[object Number]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isBoolean(obj) {
                  return toStr(obj) === "[object Boolean]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
                }
                function isSymbol(obj) {
                  if (hasShammedSymbols) {
                    return obj && typeof obj === "object" && obj instanceof Symbol;
                  }
                  if (typeof obj === "symbol") {
                    return true;
                  }
                  if (!obj || typeof obj !== "object" || !symToString) {
                    return false;
                  }
                  try {
                    symToString.call(obj);
                    return true;
                  } catch (e) {
                  }
                  return false;
                }
                function isBigInt(obj) {
                  if (!obj || typeof obj !== "object" || !bigIntValueOf) {
                    return false;
                  }
                  try {
                    bigIntValueOf.call(obj);
                    return true;
                  } catch (e) {
                  }
                  return false;
                }
                var hasOwn = Object.prototype.hasOwnProperty || function(key) {
                  return key in this;
                };
                function has(obj, key) {
                  return hasOwn.call(obj, key);
                }
                function toStr(obj) {
                  return objectToString.call(obj);
                }
                function nameOf(f) {
                  if (f.name) {
                    return f.name;
                  }
                  var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
                  if (m) {
                    return m[1];
                  }
                  return null;
                }
                function indexOf(xs, x) {
                  if (xs.indexOf) {
                    return xs.indexOf(x);
                  }
                  for (var i = 0, l = xs.length; i < l; i++) {
                    if (xs[i] === x) {
                      return i;
                    }
                  }
                  return -1;
                }
                function isMap(x) {
                  if (!mapSize || !x || typeof x !== "object") {
                    return false;
                  }
                  try {
                    mapSize.call(x);
                    try {
                      setSize.call(x);
                    } catch (s) {
                      return true;
                    }
                    return x instanceof Map;
                  } catch (e) {
                  }
                  return false;
                }
                function isWeakMap(x) {
                  if (!weakMapHas || !x || typeof x !== "object") {
                    return false;
                  }
                  try {
                    weakMapHas.call(x, weakMapHas);
                    try {
                      weakSetHas.call(x, weakSetHas);
                    } catch (s) {
                      return true;
                    }
                    return x instanceof WeakMap;
                  } catch (e) {
                  }
                  return false;
                }
                function isWeakRef(x) {
                  if (!weakRefDeref || !x || typeof x !== "object") {
                    return false;
                  }
                  try {
                    weakRefDeref.call(x);
                    return true;
                  } catch (e) {
                  }
                  return false;
                }
                function isSet(x) {
                  if (!setSize || !x || typeof x !== "object") {
                    return false;
                  }
                  try {
                    setSize.call(x);
                    try {
                      mapSize.call(x);
                    } catch (m) {
                      return true;
                    }
                    return x instanceof Set;
                  } catch (e) {
                  }
                  return false;
                }
                function isWeakSet(x) {
                  if (!weakSetHas || !x || typeof x !== "object") {
                    return false;
                  }
                  try {
                    weakSetHas.call(x, weakSetHas);
                    try {
                      weakMapHas.call(x, weakMapHas);
                    } catch (s) {
                      return true;
                    }
                    return x instanceof WeakSet;
                  } catch (e) {
                  }
                  return false;
                }
                function isElement(x) {
                  if (!x || typeof x !== "object") {
                    return false;
                  }
                  if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
                    return true;
                  }
                  return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
                }
                function inspectString(str, opts) {
                  if (str.length > opts.maxStringLength) {
                    var remaining = str.length - opts.maxStringLength;
                    var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
                    return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
                  }
                  var s = $replace.call($replace.call(str, /(['\\])/g, "\\$1"), /[\x00-\x1f]/g, lowbyte);
                  return wrapQuotes(s, "single", opts);
                }
                function lowbyte(c) {
                  var n = c.charCodeAt(0);
                  var x = {
                    8: "b",
                    9: "t",
                    10: "n",
                    12: "f",
                    13: "r"
                  }[n];
                  if (x) {
                    return "\\" + x;
                  }
                  return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
                }
                function markBoxed(str) {
                  return "Object(" + str + ")";
                }
                function weakCollectionOf(type) {
                  return type + " { ? }";
                }
                function collectionOf(type, size, entries, indent) {
                  var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
                  return type + " (" + size + ") {" + joinedEntries + "}";
                }
                function singleLineValues(xs) {
                  for (var i = 0; i < xs.length; i++) {
                    if (indexOf(xs[i], "\n") >= 0) {
                      return false;
                    }
                  }
                  return true;
                }
                function getIndent(opts, depth) {
                  var baseIndent;
                  if (opts.indent === "	") {
                    baseIndent = "	";
                  } else if (typeof opts.indent === "number" && opts.indent > 0) {
                    baseIndent = $join.call(Array(opts.indent + 1), " ");
                  } else {
                    return null;
                  }
                  return {
                    base: baseIndent,
                    prev: $join.call(Array(depth + 1), baseIndent)
                  };
                }
                function indentedJoin(xs, indent) {
                  if (xs.length === 0) {
                    return "";
                  }
                  var lineJoiner = "\n" + indent.prev + indent.base;
                  return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
                }
                function arrObjKeys(obj, inspect) {
                  var isArr = isArray(obj);
                  var xs = [];
                  if (isArr) {
                    xs.length = obj.length;
                    for (var i = 0; i < obj.length; i++) {
                      xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
                    }
                  }
                  var syms = typeof gOPS === "function" ? gOPS(obj) : [];
                  var symMap;
                  if (hasShammedSymbols) {
                    symMap = {};
                    for (var k = 0; k < syms.length; k++) {
                      symMap["$" + syms[k]] = syms[k];
                    }
                  }
                  for (var key in obj) {
                    if (!has(obj, key)) {
                      continue;
                    }
                    if (isArr && String(Number(key)) === key && key < obj.length) {
                      continue;
                    }
                    if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
                      continue;
                    } else if ($test.call(/[^\w$]/, key)) {
                      xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
                    } else {
                      xs.push(key + ": " + inspect(obj[key], obj));
                    }
                  }
                  if (typeof gOPS === "function") {
                    for (var j = 0; j < syms.length; j++) {
                      if (isEnumerable.call(obj, syms[j])) {
                        xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
                      }
                    }
                  }
                  return xs;
                }
              }
            ),
            /***/
            "../../node_modules/qs/lib/formats.js": (
              /*!********************************************!*\
                !*** ../../node_modules/qs/lib/formats.js ***!
                \********************************************/
              /***/
              function(module2) {
                "use strict";
                var replace = String.prototype.replace;
                var percentTwenties = /%20/g;
                var Format = {
                  RFC1738: "RFC1738",
                  RFC3986: "RFC3986"
                };
                module2.exports = {
                  "default": Format.RFC3986,
                  formatters: {
                    RFC1738: function(value) {
                      return replace.call(value, percentTwenties, "+");
                    },
                    RFC3986: function(value) {
                      return String(value);
                    }
                  },
                  RFC1738: Format.RFC1738,
                  RFC3986: Format.RFC3986
                };
              }
            ),
            /***/
            "../../node_modules/qs/lib/index.js": (
              /*!******************************************!*\
                !*** ../../node_modules/qs/lib/index.js ***!
                \******************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var stringify = __webpack_require__2(
                  /*! ./stringify */
                  "../../node_modules/qs/lib/stringify.js"
                );
                var parse = __webpack_require__2(
                  /*! ./parse */
                  "../../node_modules/qs/lib/parse.js"
                );
                var formats = __webpack_require__2(
                  /*! ./formats */
                  "../../node_modules/qs/lib/formats.js"
                );
                module2.exports = {
                  formats,
                  parse,
                  stringify
                };
              }
            ),
            /***/
            "../../node_modules/qs/lib/parse.js": (
              /*!******************************************!*\
                !*** ../../node_modules/qs/lib/parse.js ***!
                \******************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var utils = __webpack_require__2(
                  /*! ./utils */
                  "../../node_modules/qs/lib/utils.js"
                );
                var has = Object.prototype.hasOwnProperty;
                var isArray = Array.isArray;
                var defaults = {
                  allowDots: false,
                  allowPrototypes: false,
                  allowSparse: false,
                  arrayLimit: 20,
                  charset: "utf-8",
                  charsetSentinel: false,
                  comma: false,
                  decoder: utils.decode,
                  delimiter: "&",
                  depth: 5,
                  ignoreQueryPrefix: false,
                  interpretNumericEntities: false,
                  parameterLimit: 1e3,
                  parseArrays: true,
                  plainObjects: false,
                  strictNullHandling: false
                };
                var interpretNumericEntities = function(str) {
                  return str.replace(/&#(\d+);/g, function($0, numberStr) {
                    return String.fromCharCode(parseInt(numberStr, 10));
                  });
                };
                var parseArrayValue = function(val, options) {
                  if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
                    return val.split(",");
                  }
                  return val;
                };
                var isoSentinel = "utf8=%26%2310003%3B";
                var charsetSentinel = "utf8=%E2%9C%93";
                var parseValues = function parseQueryStringValues(str, options) {
                  var obj = {};
                  var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
                  var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
                  var parts = cleanStr.split(options.delimiter, limit);
                  var skipIndex = -1;
                  var i;
                  var charset = options.charset;
                  if (options.charsetSentinel) {
                    for (i = 0; i < parts.length; ++i) {
                      if (parts[i].indexOf("utf8=") === 0) {
                        if (parts[i] === charsetSentinel) {
                          charset = "utf-8";
                        } else if (parts[i] === isoSentinel) {
                          charset = "iso-8859-1";
                        }
                        skipIndex = i;
                        i = parts.length;
                      }
                    }
                  }
                  for (i = 0; i < parts.length; ++i) {
                    if (i === skipIndex) {
                      continue;
                    }
                    var part = parts[i];
                    var bracketEqualsPos = part.indexOf("]=");
                    var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
                    var key, val;
                    if (pos === -1) {
                      key = options.decoder(part, defaults.decoder, charset, "key");
                      val = options.strictNullHandling ? null : "";
                    } else {
                      key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
                      val = utils.maybeMap(
                        parseArrayValue(part.slice(pos + 1), options),
                        function(encodedVal) {
                          return options.decoder(encodedVal, defaults.decoder, charset, "value");
                        }
                      );
                    }
                    if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
                      val = interpretNumericEntities(val);
                    }
                    if (part.indexOf("[]=") > -1) {
                      val = isArray(val) ? [val] : val;
                    }
                    if (has.call(obj, key)) {
                      obj[key] = utils.combine(obj[key], val);
                    } else {
                      obj[key] = val;
                    }
                  }
                  return obj;
                };
                var parseObject = function(chain, val, options, valuesParsed) {
                  var leaf = valuesParsed ? val : parseArrayValue(val, options);
                  for (var i = chain.length - 1; i >= 0; --i) {
                    var obj;
                    var root = chain[i];
                    if (root === "[]" && options.parseArrays) {
                      obj = [].concat(leaf);
                    } else {
                      obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
                      var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
                      var index = parseInt(cleanRoot, 10);
                      if (!options.parseArrays && cleanRoot === "") {
                        obj = { 0: leaf };
                      } else if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
                        obj = [];
                        obj[index] = leaf;
                      } else if (cleanRoot !== "__proto__") {
                        obj[cleanRoot] = leaf;
                      }
                    }
                    leaf = obj;
                  }
                  return leaf;
                };
                var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
                  if (!givenKey) {
                    return;
                  }
                  var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
                  var brackets = /(\[[^[\]]*])/;
                  var child = /(\[[^[\]]*])/g;
                  var segment = options.depth > 0 && brackets.exec(key);
                  var parent = segment ? key.slice(0, segment.index) : key;
                  var keys = [];
                  if (parent) {
                    if (!options.plainObjects && has.call(Object.prototype, parent)) {
                      if (!options.allowPrototypes) {
                        return;
                      }
                    }
                    keys.push(parent);
                  }
                  var i = 0;
                  while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
                    i += 1;
                    if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
                      if (!options.allowPrototypes) {
                        return;
                      }
                    }
                    keys.push(segment[1]);
                  }
                  if (segment) {
                    keys.push("[" + key.slice(segment.index) + "]");
                  }
                  return parseObject(keys, val, options, valuesParsed);
                };
                var normalizeParseOptions = function normalizeParseOptions2(opts) {
                  if (!opts) {
                    return defaults;
                  }
                  if (opts.decoder !== null && opts.decoder !== void 0 && typeof opts.decoder !== "function") {
                    throw new TypeError("Decoder has to be a function.");
                  }
                  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
                    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
                  }
                  var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
                  return {
                    allowDots: typeof opts.allowDots === "undefined" ? defaults.allowDots : !!opts.allowDots,
                    allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
                    allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
                    arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
                    charset,
                    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
                    comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
                    decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
                    delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
                    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
                    depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
                    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
                    interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
                    parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
                    parseArrays: opts.parseArrays !== false,
                    plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
                    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
                  };
                };
                module2.exports = function(str, opts) {
                  var options = normalizeParseOptions(opts);
                  if (str === "" || str === null || typeof str === "undefined") {
                    return options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
                  }
                  var tempObj = typeof str === "string" ? parseValues(str, options) : str;
                  var obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
                  var keys = Object.keys(tempObj);
                  for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
                    obj = utils.merge(obj, newObj, options);
                  }
                  if (options.allowSparse === true) {
                    return obj;
                  }
                  return utils.compact(obj);
                };
              }
            ),
            /***/
            "../../node_modules/qs/lib/stringify.js": (
              /*!**********************************************!*\
                !*** ../../node_modules/qs/lib/stringify.js ***!
                \**********************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var getSideChannel = __webpack_require__2(
                  /*! side-channel */
                  "../../node_modules/side-channel/index.js"
                );
                var utils = __webpack_require__2(
                  /*! ./utils */
                  "../../node_modules/qs/lib/utils.js"
                );
                var formats = __webpack_require__2(
                  /*! ./formats */
                  "../../node_modules/qs/lib/formats.js"
                );
                var has = Object.prototype.hasOwnProperty;
                var arrayPrefixGenerators = {
                  brackets: function brackets(prefix) {
                    return prefix + "[]";
                  },
                  comma: "comma",
                  indices: function indices(prefix, key) {
                    return prefix + "[" + key + "]";
                  },
                  repeat: function repeat(prefix) {
                    return prefix;
                  }
                };
                var isArray = Array.isArray;
                var split = String.prototype.split;
                var push = Array.prototype.push;
                var pushToArray = function(arr, valueOrArray) {
                  push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
                };
                var toISO = Date.prototype.toISOString;
                var defaultFormat = formats["default"];
                var defaults = {
                  addQueryPrefix: false,
                  allowDots: false,
                  charset: "utf-8",
                  charsetSentinel: false,
                  delimiter: "&",
                  encode: true,
                  encoder: utils.encode,
                  encodeValuesOnly: false,
                  format: defaultFormat,
                  formatter: formats.formatters[defaultFormat],
                  // deprecated
                  indices: false,
                  serializeDate: function serializeDate(date) {
                    return toISO.call(date);
                  },
                  skipNulls: false,
                  strictNullHandling: false
                };
                var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
                  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
                };
                var sentinel = {};
                var stringify = function stringify2(object, prefix, generateArrayPrefix, commaRoundTrip, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
                  var obj = object;
                  var tmpSc = sideChannel;
                  var step = 0;
                  var findFlag = false;
                  while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
                    var pos = tmpSc.get(object);
                    step += 1;
                    if (typeof pos !== "undefined") {
                      if (pos === step) {
                        throw new RangeError("Cyclic object value");
                      } else {
                        findFlag = true;
                      }
                    }
                    if (typeof tmpSc.get(sentinel) === "undefined") {
                      step = 0;
                    }
                  }
                  if (typeof filter === "function") {
                    obj = filter(prefix, obj);
                  } else if (obj instanceof Date) {
                    obj = serializeDate(obj);
                  } else if (generateArrayPrefix === "comma" && isArray(obj)) {
                    obj = utils.maybeMap(obj, function(value2) {
                      if (value2 instanceof Date) {
                        return serializeDate(value2);
                      }
                      return value2;
                    });
                  }
                  if (obj === null) {
                    if (strictNullHandling) {
                      return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
                    }
                    obj = "";
                  }
                  if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
                    if (encoder) {
                      var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
                      if (generateArrayPrefix === "comma" && encodeValuesOnly) {
                        var valuesArray = split.call(String(obj), ",");
                        var valuesJoined = "";
                        for (var i = 0; i < valuesArray.length; ++i) {
                          valuesJoined += (i === 0 ? "" : ",") + formatter(encoder(valuesArray[i], defaults.encoder, charset, "value", format));
                        }
                        return [formatter(keyValue) + (commaRoundTrip && isArray(obj) && valuesArray.length === 1 ? "[]" : "") + "=" + valuesJoined];
                      }
                      return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
                    }
                    return [formatter(prefix) + "=" + formatter(String(obj))];
                  }
                  var values = [];
                  if (typeof obj === "undefined") {
                    return values;
                  }
                  var objKeys;
                  if (generateArrayPrefix === "comma" && isArray(obj)) {
                    objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
                  } else if (isArray(filter)) {
                    objKeys = filter;
                  } else {
                    var keys = Object.keys(obj);
                    objKeys = sort ? keys.sort(sort) : keys;
                  }
                  var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? prefix + "[]" : prefix;
                  for (var j = 0; j < objKeys.length; ++j) {
                    var key = objKeys[j];
                    var value = typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key];
                    if (skipNulls && value === null) {
                      continue;
                    }
                    var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, key) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + key : "[" + key + "]");
                    sideChannel.set(object, step);
                    var valueSideChannel = getSideChannel();
                    valueSideChannel.set(sentinel, sideChannel);
                    pushToArray(values, stringify2(
                      value,
                      keyPrefix,
                      generateArrayPrefix,
                      commaRoundTrip,
                      strictNullHandling,
                      skipNulls,
                      encoder,
                      filter,
                      sort,
                      allowDots,
                      serializeDate,
                      format,
                      formatter,
                      encodeValuesOnly,
                      charset,
                      valueSideChannel
                    ));
                  }
                  return values;
                };
                var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
                  if (!opts) {
                    return defaults;
                  }
                  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
                    throw new TypeError("Encoder has to be a function.");
                  }
                  var charset = opts.charset || defaults.charset;
                  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
                    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
                  }
                  var format = formats["default"];
                  if (typeof opts.format !== "undefined") {
                    if (!has.call(formats.formatters, opts.format)) {
                      throw new TypeError("Unknown format option provided.");
                    }
                    format = opts.format;
                  }
                  var formatter = formats.formatters[format];
                  var filter = defaults.filter;
                  if (typeof opts.filter === "function" || isArray(opts.filter)) {
                    filter = opts.filter;
                  }
                  return {
                    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
                    allowDots: typeof opts.allowDots === "undefined" ? defaults.allowDots : !!opts.allowDots,
                    charset,
                    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
                    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
                    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
                    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
                    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
                    filter,
                    format,
                    formatter,
                    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
                    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
                    sort: typeof opts.sort === "function" ? opts.sort : null,
                    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
                  };
                };
                module2.exports = function(object, opts) {
                  var obj = object;
                  var options = normalizeStringifyOptions(opts);
                  var objKeys;
                  var filter;
                  if (typeof options.filter === "function") {
                    filter = options.filter;
                    obj = filter("", obj);
                  } else if (isArray(options.filter)) {
                    filter = options.filter;
                    objKeys = filter;
                  }
                  var keys = [];
                  if (typeof obj !== "object" || obj === null) {
                    return "";
                  }
                  var arrayFormat;
                  if (opts && opts.arrayFormat in arrayPrefixGenerators) {
                    arrayFormat = opts.arrayFormat;
                  } else if (opts && "indices" in opts) {
                    arrayFormat = opts.indices ? "indices" : "repeat";
                  } else {
                    arrayFormat = "indices";
                  }
                  var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
                  if (opts && "commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
                    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
                  }
                  var commaRoundTrip = generateArrayPrefix === "comma" && opts && opts.commaRoundTrip;
                  if (!objKeys) {
                    objKeys = Object.keys(obj);
                  }
                  if (options.sort) {
                    objKeys.sort(options.sort);
                  }
                  var sideChannel = getSideChannel();
                  for (var i = 0; i < objKeys.length; ++i) {
                    var key = objKeys[i];
                    if (options.skipNulls && obj[key] === null) {
                      continue;
                    }
                    pushToArray(keys, stringify(
                      obj[key],
                      key,
                      generateArrayPrefix,
                      commaRoundTrip,
                      options.strictNullHandling,
                      options.skipNulls,
                      options.encode ? options.encoder : null,
                      options.filter,
                      options.sort,
                      options.allowDots,
                      options.serializeDate,
                      options.format,
                      options.formatter,
                      options.encodeValuesOnly,
                      options.charset,
                      sideChannel
                    ));
                  }
                  var joined = keys.join(options.delimiter);
                  var prefix = options.addQueryPrefix === true ? "?" : "";
                  if (options.charsetSentinel) {
                    if (options.charset === "iso-8859-1") {
                      prefix += "utf8=%26%2310003%3B&";
                    } else {
                      prefix += "utf8=%E2%9C%93&";
                    }
                  }
                  return joined.length > 0 ? prefix + joined : "";
                };
              }
            ),
            /***/
            "../../node_modules/qs/lib/utils.js": (
              /*!******************************************!*\
                !*** ../../node_modules/qs/lib/utils.js ***!
                \******************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var formats = __webpack_require__2(
                  /*! ./formats */
                  "../../node_modules/qs/lib/formats.js"
                );
                var has = Object.prototype.hasOwnProperty;
                var isArray = Array.isArray;
                var hexTable = function() {
                  var array = [];
                  for (var i = 0; i < 256; ++i) {
                    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
                  }
                  return array;
                }();
                var compactQueue = function compactQueue2(queue) {
                  while (queue.length > 1) {
                    var item = queue.pop();
                    var obj = item.obj[item.prop];
                    if (isArray(obj)) {
                      var compacted = [];
                      for (var j = 0; j < obj.length; ++j) {
                        if (typeof obj[j] !== "undefined") {
                          compacted.push(obj[j]);
                        }
                      }
                      item.obj[item.prop] = compacted;
                    }
                  }
                };
                var arrayToObject = function arrayToObject2(source, options) {
                  var obj = options && options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
                  for (var i = 0; i < source.length; ++i) {
                    if (typeof source[i] !== "undefined") {
                      obj[i] = source[i];
                    }
                  }
                  return obj;
                };
                var merge = function merge2(target, source, options) {
                  if (!source) {
                    return target;
                  }
                  if (typeof source !== "object") {
                    if (isArray(target)) {
                      target.push(source);
                    } else if (target && typeof target === "object") {
                      if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
                        target[source] = true;
                      }
                    } else {
                      return [target, source];
                    }
                    return target;
                  }
                  if (!target || typeof target !== "object") {
                    return [target].concat(source);
                  }
                  var mergeTarget = target;
                  if (isArray(target) && !isArray(source)) {
                    mergeTarget = arrayToObject(target, options);
                  }
                  if (isArray(target) && isArray(source)) {
                    source.forEach(function(item, i) {
                      if (has.call(target, i)) {
                        var targetItem = target[i];
                        if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
                          target[i] = merge2(targetItem, item, options);
                        } else {
                          target.push(item);
                        }
                      } else {
                        target[i] = item;
                      }
                    });
                    return target;
                  }
                  return Object.keys(source).reduce(function(acc, key) {
                    var value = source[key];
                    if (has.call(acc, key)) {
                      acc[key] = merge2(acc[key], value, options);
                    } else {
                      acc[key] = value;
                    }
                    return acc;
                  }, mergeTarget);
                };
                var assign = function assignSingleSource(target, source) {
                  return Object.keys(source).reduce(function(acc, key) {
                    acc[key] = source[key];
                    return acc;
                  }, target);
                };
                var decode = function(str, decoder, charset) {
                  var strWithoutPlus = str.replace(/\+/g, " ");
                  if (charset === "iso-8859-1") {
                    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
                  }
                  try {
                    return decodeURIComponent(strWithoutPlus);
                  } catch (e) {
                    return strWithoutPlus;
                  }
                };
                var encode = function encode2(str, defaultEncoder, charset, kind, format) {
                  if (str.length === 0) {
                    return str;
                  }
                  var string = str;
                  if (typeof str === "symbol") {
                    string = Symbol.prototype.toString.call(str);
                  } else if (typeof str !== "string") {
                    string = String(str);
                  }
                  if (charset === "iso-8859-1") {
                    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
                      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
                    });
                  }
                  var out = "";
                  for (var i = 0; i < string.length; ++i) {
                    var c = string.charCodeAt(i);
                    if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
                      out += string.charAt(i);
                      continue;
                    }
                    if (c < 128) {
                      out = out + hexTable[c];
                      continue;
                    }
                    if (c < 2048) {
                      out = out + (hexTable[192 | c >> 6] + hexTable[128 | c & 63]);
                      continue;
                    }
                    if (c < 55296 || c >= 57344) {
                      out = out + (hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63]);
                      continue;
                    }
                    i += 1;
                    c = 65536 + ((c & 1023) << 10 | string.charCodeAt(i) & 1023);
                    out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
                  }
                  return out;
                };
                var compact = function compact2(value) {
                  var queue = [{ obj: { o: value }, prop: "o" }];
                  var refs = [];
                  for (var i = 0; i < queue.length; ++i) {
                    var item = queue[i];
                    var obj = item.obj[item.prop];
                    var keys = Object.keys(obj);
                    for (var j = 0; j < keys.length; ++j) {
                      var key = keys[j];
                      var val = obj[key];
                      if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
                        queue.push({ obj, prop: key });
                        refs.push(val);
                      }
                    }
                  }
                  compactQueue(queue);
                  return value;
                };
                var isRegExp = function isRegExp2(obj) {
                  return Object.prototype.toString.call(obj) === "[object RegExp]";
                };
                var isBuffer = function isBuffer2(obj) {
                  if (!obj || typeof obj !== "object") {
                    return false;
                  }
                  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
                };
                var combine = function combine2(a, b) {
                  return [].concat(a, b);
                };
                var maybeMap = function maybeMap2(val, fn) {
                  if (isArray(val)) {
                    var mapped = [];
                    for (var i = 0; i < val.length; i += 1) {
                      mapped.push(fn(val[i]));
                    }
                    return mapped;
                  }
                  return fn(val);
                };
                module2.exports = {
                  arrayToObject,
                  assign,
                  combine,
                  compact,
                  decode,
                  encode,
                  isBuffer,
                  isRegExp,
                  maybeMap,
                  merge
                };
              }
            ),
            /***/
            "../../node_modules/side-channel/index.js": (
              /*!************************************************!*\
                !*** ../../node_modules/side-channel/index.js ***!
                \************************************************/
              /***/
              function(module2, __unused_webpack_exports, __webpack_require__2) {
                "use strict";
                var GetIntrinsic = __webpack_require__2(
                  /*! get-intrinsic */
                  "../../node_modules/get-intrinsic/index.js"
                );
                var callBound = __webpack_require__2(
                  /*! call-bind/callBound */
                  "../../node_modules/call-bind/callBound.js"
                );
                var inspect = __webpack_require__2(
                  /*! object-inspect */
                  "../../node_modules/object-inspect/index.js"
                );
                var $TypeError = GetIntrinsic("%TypeError%");
                var $WeakMap = GetIntrinsic("%WeakMap%", true);
                var $Map = GetIntrinsic("%Map%", true);
                var $weakMapGet = callBound("WeakMap.prototype.get", true);
                var $weakMapSet = callBound("WeakMap.prototype.set", true);
                var $weakMapHas = callBound("WeakMap.prototype.has", true);
                var $mapGet = callBound("Map.prototype.get", true);
                var $mapSet = callBound("Map.prototype.set", true);
                var $mapHas = callBound("Map.prototype.has", true);
                var listGetNode = function(list, key) {
                  for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
                    if (curr.key === key) {
                      prev.next = curr.next;
                      curr.next = list.next;
                      list.next = curr;
                      return curr;
                    }
                  }
                };
                var listGet = function(objects, key) {
                  var node = listGetNode(objects, key);
                  return node && node.value;
                };
                var listSet = function(objects, key, value) {
                  var node = listGetNode(objects, key);
                  if (node) {
                    node.value = value;
                  } else {
                    objects.next = {
                      // eslint-disable-line no-param-reassign
                      key,
                      next: objects.next,
                      value
                    };
                  }
                };
                var listHas = function(objects, key) {
                  return !!listGetNode(objects, key);
                };
                module2.exports = function getSideChannel() {
                  var $wm;
                  var $m;
                  var $o;
                  var channel = {
                    assert: function(key) {
                      if (!channel.has(key)) {
                        throw new $TypeError("Side channel does not contain " + inspect(key));
                      }
                    },
                    get: function(key) {
                      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                        if ($wm) {
                          return $weakMapGet($wm, key);
                        }
                      } else if ($Map) {
                        if ($m) {
                          return $mapGet($m, key);
                        }
                      } else {
                        if ($o) {
                          return listGet($o, key);
                        }
                      }
                    },
                    has: function(key) {
                      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                        if ($wm) {
                          return $weakMapHas($wm, key);
                        }
                      } else if ($Map) {
                        if ($m) {
                          return $mapHas($m, key);
                        }
                      } else {
                        if ($o) {
                          return listHas($o, key);
                        }
                      }
                      return false;
                    },
                    set: function(key, value) {
                      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
                        if (!$wm) {
                          $wm = new $WeakMap();
                        }
                        $weakMapSet($wm, key, value);
                      } else if ($Map) {
                        if (!$m) {
                          $m = new $Map();
                        }
                        $mapSet($m, key, value);
                      } else {
                        if (!$o) {
                          $o = { key: {}, next: null };
                        }
                        listSet($o, key, value);
                      }
                    }
                  };
                  return channel;
                };
              }
            ),
            /***/
            "./src/feathers.ts": (
              /*!*************************!*\
                !*** ./src/feathers.ts ***!
                \*************************/
              /***/
              function(module2, exports2, __webpack_require__2) {
                "use strict";
                var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
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
                var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
                  Object.defineProperty(o, "default", { enumerable: true, value: v });
                } : function(o, v) {
                  o["default"] = v;
                });
                var __exportStar = this && this.__exportStar || function(m, exports3) {
                  for (var p in m)
                    if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                      __createBinding(exports3, m, p);
                };
                var __importStar = this && this.__importStar || function(mod) {
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
                var __importDefault = this && this.__importDefault || function(mod) {
                  return mod && mod.__esModule ? mod : { "default": mod };
                };
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.socketio = exports2.rest = exports2.authentication = exports2.errors = void 0;
                const feathers_1 = __webpack_require__2(
                  /*! @feathersjs/feathers */
                  "../feathers/lib/index.js"
                );
                const authentication_client_1 = __importDefault(__webpack_require__2(
                  /*! @feathersjs/authentication-client */
                  "../authentication-client/lib/index.js"
                ));
                exports2.authentication = authentication_client_1.default;
                const rest_client_1 = __importDefault(__webpack_require__2(
                  /*! @feathersjs/rest-client */
                  "../rest-client/lib/index.js"
                ));
                exports2.rest = rest_client_1.default;
                const socketio_client_1 = __importDefault(__webpack_require__2(
                  /*! @feathersjs/socketio-client */
                  "../socketio-client/lib/index.js"
                ));
                exports2.socketio = socketio_client_1.default;
                __exportStar(__webpack_require__2(
                  /*! @feathersjs/feathers */
                  "../feathers/lib/index.js"
                ), exports2);
                exports2.errors = __importStar(__webpack_require__2(
                  /*! @feathersjs/errors */
                  "../errors/lib/index.js"
                ));
                exports2["default"] = feathers_1.feathers;
                if (true) {
                  module2.exports = Object.assign(feathers_1.feathers, module2.exports);
                }
              }
            ),
            /***/
            "?c95a": (
              /*!********************************!*\
                !*** ./util.inspect (ignored) ***!
                \********************************/
              /***/
              function() {
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/base.js": (
              /*!***********************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/base.js ***!
                \***********************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _inherits(subClass, superClass) {
                  if (typeof superClass !== "function" && superClass !== null) {
                    throw new TypeError("Super expression must either be null or a function");
                  }
                  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                  Object.defineProperty(subClass, "prototype", { writable: false });
                  if (superClass)
                    _setPrototypeOf(subClass, superClass);
                }
                function _setPrototypeOf(o, p) {
                  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
                    o2.__proto__ = p2;
                    return o2;
                  };
                  return _setPrototypeOf(o, p);
                }
                function _createSuper(Derived) {
                  var hasNativeReflectConstruct = _isNativeReflectConstruct();
                  return function _createSuperInternal() {
                    var Super = _getPrototypeOf(Derived), result;
                    if (hasNativeReflectConstruct) {
                      var NewTarget = _getPrototypeOf(this).constructor;
                      result = Reflect.construct(Super, arguments, NewTarget);
                    } else {
                      result = Super.apply(this, arguments);
                    }
                    return _possibleConstructorReturn(this, result);
                  };
                }
                function _possibleConstructorReturn(self, call) {
                  if (call && (_typeof(call) === "object" || typeof call === "function")) {
                    return call;
                  } else if (call !== void 0) {
                    throw new TypeError("Derived constructors may only return object or undefined");
                  }
                  return _assertThisInitialized(self);
                }
                function _assertThisInitialized(self) {
                  if (self === void 0) {
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  }
                  return self;
                }
                function _isNativeReflectConstruct() {
                  if (typeof Reflect === "undefined" || !Reflect.construct)
                    return false;
                  if (Reflect.construct.sham)
                    return false;
                  if (typeof Proxy === "function")
                    return true;
                  try {
                    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
                    }));
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
                function _getPrototypeOf(o) {
                  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
                    return o2.__proto__ || Object.getPrototypeOf(o2);
                  };
                  return _getPrototypeOf(o);
                }
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
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
                    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
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
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.setMiddleware = exports2.getMiddleware = exports2.setManager = exports2.getManager = exports2.convertOptions = exports2.HookManager = exports2.BaseHookContext = exports2.HOOKS = void 0;
                var utils_js_1 = __webpack_require__2(
                  /*! ./utils.js */
                  "../../node_modules/@feathersjs/hooks/script/utils.js"
                );
                exports2.HOOKS = Symbol("@feathersjs/hooks");
                var BaseHookContext = function() {
                  function BaseHookContext2() {
                    var data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                    _classCallCheck(this, BaseHookContext2);
                    Object.defineProperty(this, "self", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: void 0
                    });
                    Object.assign(this, data);
                  }
                  _createClass(BaseHookContext2, [{
                    key: "toJSON",
                    value: function toJSON() {
                      var _this = this;
                      var keys = Object.keys(this);
                      var proto = Object.getPrototypeOf(this);
                      while (proto) {
                        keys.push.apply(keys, _toConsumableArray(Object.keys(proto)));
                        proto = Object.getPrototypeOf(proto);
                      }
                      return keys.reduce(function(result, key) {
                        result[key] = _this[key];
                        return result;
                      }, {});
                    }
                  }]);
                  return BaseHookContext2;
                }();
                exports2.BaseHookContext = BaseHookContext;
                var HookManager = function() {
                  function HookManager2() {
                    _classCallCheck(this, HookManager2);
                    Object.defineProperty(this, "_parent", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: null
                    });
                    Object.defineProperty(this, "_params", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: null
                    });
                    Object.defineProperty(this, "_middleware", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: null
                    });
                    Object.defineProperty(this, "_props", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: null
                    });
                    Object.defineProperty(this, "_defaults", {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: void 0
                    });
                  }
                  _createClass(HookManager2, [{
                    key: "parent",
                    value: function parent(_parent) {
                      this._parent = _parent;
                      return this;
                    }
                  }, {
                    key: "middleware",
                    value: function middleware(_middleware) {
                      this._middleware = _middleware !== null && _middleware !== void 0 && _middleware.length ? _middleware : null;
                      return this;
                    }
                  }, {
                    key: "getMiddleware",
                    value: function getMiddleware2() {
                      var _this$_parent;
                      var previous = (_this$_parent = this._parent) === null || _this$_parent === void 0 ? void 0 : _this$_parent.getMiddleware();
                      if (previous && this._middleware) {
                        return previous.concat(this._middleware);
                      }
                      return previous || this._middleware;
                    }
                  }, {
                    key: "collectMiddleware",
                    value: function collectMiddleware(self, _args) {
                      var otherMiddleware = getMiddleware(self);
                      var middleware = this.getMiddleware();
                      if (otherMiddleware && middleware) {
                        return otherMiddleware.concat(middleware);
                      }
                      return otherMiddleware || middleware || [];
                    }
                  }, {
                    key: "props",
                    value: function props(_props) {
                      if (!this._props) {
                        this._props = {};
                      }
                      (0, utils_js_1.copyProperties)(this._props, _props);
                      return this;
                    }
                  }, {
                    key: "getProps",
                    value: function getProps() {
                      var _this$_parent2;
                      var previous = (_this$_parent2 = this._parent) === null || _this$_parent2 === void 0 ? void 0 : _this$_parent2.getProps();
                      if (previous && this._props) {
                        return (0, utils_js_1.copyProperties)({}, previous, this._props);
                      }
                      return previous || this._props || null;
                    }
                  }, {
                    key: "params",
                    value: function params() {
                      for (var _len = arguments.length, _params = new Array(_len), _key = 0; _key < _len; _key++) {
                        _params[_key] = arguments[_key];
                      }
                      this._params = _params;
                      return this;
                    }
                  }, {
                    key: "getParams",
                    value: function getParams() {
                      var _this$_parent3;
                      var previous = (_this$_parent3 = this._parent) === null || _this$_parent3 === void 0 ? void 0 : _this$_parent3.getParams();
                      if (previous && this._params) {
                        return previous.concat(this._params);
                      }
                      return previous || this._params;
                    }
                  }, {
                    key: "defaults",
                    value: function defaults(_defaults) {
                      this._defaults = _defaults;
                      return this;
                    }
                  }, {
                    key: "getDefaults",
                    value: function getDefaults(self, args, context) {
                      var _this$_parent4;
                      var defaults = typeof this._defaults === "function" ? this._defaults(self, args, context) : null;
                      var previous = (_this$_parent4 = this._parent) === null || _this$_parent4 === void 0 ? void 0 : _this$_parent4.getDefaults(self, args, context);
                      if (previous && defaults) {
                        return Object.assign({}, previous, defaults);
                      }
                      return previous || defaults;
                    }
                  }, {
                    key: "getContextClass",
                    value: function getContextClass() {
                      var Base = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : BaseHookContext;
                      var ContextClass = function(_Base) {
                        _inherits(ContextClass2, _Base);
                        var _super = _createSuper(ContextClass2);
                        function ContextClass2(data) {
                          _classCallCheck(this, ContextClass2);
                          return _super.call(this, data);
                        }
                        return _createClass(ContextClass2);
                      }(Base);
                      var params = this.getParams();
                      var props = this.getProps();
                      if (params) {
                        params.forEach(function(name, index) {
                          if ((props === null || props === void 0 ? void 0 : props[name]) !== void 0) {
                            throw new Error("Hooks can not have a property and param named '".concat(name, "'. Use .defaults instead."));
                          }
                          Object.defineProperty(ContextClass.prototype, name, {
                            enumerable: true,
                            get: function get() {
                              return this === null || this === void 0 ? void 0 : this.arguments[index];
                            },
                            set: function set(value) {
                              this.arguments[index] = value;
                            }
                          });
                        });
                      }
                      if (props) {
                        (0, utils_js_1.copyProperties)(ContextClass.prototype, props);
                      }
                      return ContextClass;
                    }
                  }, {
                    key: "initializeContext",
                    value: function initializeContext(self, args, context) {
                      var ctx = this._parent ? this._parent.initializeContext(self, args, context) : context;
                      var defaults = this.getDefaults(self, args, ctx);
                      if (self) {
                        ctx.self = self;
                      }
                      ctx.arguments = args;
                      if (defaults) {
                        for (var _i = 0, _Object$keys = Object.keys(defaults); _i < _Object$keys.length; _i++) {
                          var name = _Object$keys[_i];
                          if (ctx[name] === void 0) {
                            ctx[name] = defaults[name];
                          }
                        }
                      }
                      return ctx;
                    }
                  }]);
                  return HookManager2;
                }();
                exports2.HookManager = HookManager;
                function convertOptions() {
                  var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
                  if (!options) {
                    return new HookManager();
                  }
                  return Array.isArray(options) ? new HookManager().middleware(options) : options;
                }
                exports2.convertOptions = convertOptions;
                function getManager(target) {
                  return target && target[exports2.HOOKS] || null;
                }
                exports2.getManager = getManager;
                function setManager(target, manager) {
                  var parent = getManager(target);
                  target[exports2.HOOKS] = manager.parent(parent);
                  return target;
                }
                exports2.setManager = setManager;
                function getMiddleware(target) {
                  var manager = getManager(target);
                  return manager ? manager.getMiddleware() : null;
                }
                exports2.getMiddleware = getMiddleware;
                function setMiddleware(target, middleware) {
                  var manager = new HookManager().middleware(middleware);
                  return setManager(target, manager);
                }
                exports2.setMiddleware = setMiddleware;
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/compose.js": (
              /*!**************************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/compose.js ***!
                \**************************************************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                function _createForOfIteratorHelper(o, allowArrayLike) {
                  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
                  if (!it) {
                    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                      if (it)
                        o = it;
                      var i = 0;
                      var F = function F2() {
                      };
                      return { s: F, n: function n() {
                        if (i >= o.length)
                          return { done: true };
                        return { done: false, value: o[i++] };
                      }, e: function e(_e) {
                        throw _e;
                      }, f: F };
                    }
                    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                  }
                  var normalCompletion = true, didErr = false, err;
                  return { s: function s() {
                    it = it.call(o);
                  }, n: function n() {
                    var step = it.next();
                    normalCompletion = step.done;
                    return step;
                  }, e: function e(_e2) {
                    didErr = true;
                    err = _e2;
                  }, f: function f() {
                    try {
                      if (!normalCompletion && it.return != null)
                        it.return();
                    } finally {
                      if (didErr)
                        throw err;
                    }
                  } };
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
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.compose = void 0;
                function compose(middleware) {
                  if (!Array.isArray(middleware)) {
                    throw new TypeError("Middleware stack must be an array!");
                  }
                  var _iterator = _createForOfIteratorHelper(middleware), _step;
                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                      var fn = _step.value;
                      if (typeof fn !== "function") {
                        throw new TypeError("Middleware must be composed of functions!");
                      }
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }
                  return function(context, next) {
                    var index = -1;
                    return dispatch.call(this, 0);
                    function dispatch(i) {
                      if (i <= index) {
                        return Promise.reject(new Error("next() called multiple times"));
                      }
                      index = i;
                      var fn2 = middleware[i];
                      if (i === middleware.length) {
                        fn2 = next;
                      }
                      if (!fn2) {
                        return Promise.resolve();
                      }
                      try {
                        return Promise.resolve(fn2.call(this, context, dispatch.bind(this, i + 1)));
                      } catch (err) {
                        return Promise.reject(err);
                      }
                    }
                  };
                }
                exports2.compose = compose;
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/hooks.js": (
              /*!************************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/hooks.js ***!
                \************************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.hookDecorator = exports2.objectHooks = exports2.functionHooks = exports2.getOriginal = void 0;
                var compose_js_1 = __webpack_require__2(
                  /*! ./compose.js */
                  "../../node_modules/@feathersjs/hooks/script/compose.js"
                );
                var base_js_1 = __webpack_require__2(
                  /*! ./base.js */
                  "../../node_modules/@feathersjs/hooks/script/base.js"
                );
                var utils_js_1 = __webpack_require__2(
                  /*! ./utils.js */
                  "../../node_modules/@feathersjs/hooks/script/utils.js"
                );
                function getOriginal(fn) {
                  return typeof fn.original === "function" ? getOriginal(fn.original) : fn;
                }
                exports2.getOriginal = getOriginal;
                function functionHooks(fn, managerOrMiddleware) {
                  if (typeof fn !== "function") {
                    throw new Error("Can not apply hooks to non-function");
                  }
                  var manager = (0, base_js_1.convertOptions)(managerOrMiddleware);
                  var wrapper = function wrapper2() {
                    var _this = this;
                    var Context = wrapper2.Context, original = wrapper2.original;
                    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                      args[_key] = arguments[_key];
                    }
                    var returnContext = args[args.length - 1] instanceof Context;
                    var base = returnContext ? args.pop() : new Context();
                    var context = manager.initializeContext(this, args, base);
                    var hookChain = [
                      // Return `ctx.result` or the context
                      function(ctx, next) {
                        return next().then(function() {
                          return returnContext ? ctx : ctx.result;
                        });
                      }
                    ];
                    var mw = manager.collectMiddleware(this, args);
                    if (mw) {
                      Array.prototype.push.apply(hookChain, mw);
                    }
                    hookChain.push(function(ctx, next) {
                      if (!Object.prototype.hasOwnProperty.call(context, "result")) {
                        return Promise.resolve(original.apply(_this, ctx.arguments)).then(function(result) {
                          ctx.result = result;
                          return next();
                        });
                      }
                      return next();
                    });
                    return (0, compose_js_1.compose)(hookChain).call(this, context);
                  };
                  (0, utils_js_1.copyFnProperties)(wrapper, fn);
                  (0, utils_js_1.copyProperties)(wrapper, fn);
                  (0, base_js_1.setManager)(wrapper, manager);
                  return Object.assign(wrapper, {
                    original: getOriginal(fn),
                    Context: manager.getContextClass(),
                    createContext: function createContext() {
                      var data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                      return new wrapper.Context(data);
                    }
                  });
                }
                exports2.functionHooks = functionHooks;
                function objectHooks(obj, hooks) {
                  if (Array.isArray(hooks)) {
                    return (0, base_js_1.setMiddleware)(obj, hooks);
                  }
                  for (var _i = 0, _Object$keys = Object.keys(hooks); _i < _Object$keys.length; _i++) {
                    var method = _Object$keys[_i];
                    var target = typeof obj[method] === "function" ? obj : obj.prototype;
                    var fn = target && target[method];
                    if (typeof fn !== "function") {
                      throw new Error("Can not apply hooks. '".concat(method, "' is not a function"));
                    }
                    var manager = (0, base_js_1.convertOptions)(hooks[method]);
                    target[method] = functionHooks(fn, manager.props({
                      method
                    }));
                  }
                  return obj;
                }
                exports2.objectHooks = objectHooks;
                var hookDecorator = function hookDecorator2(managerOrMiddleware) {
                  var wrapper = function wrapper2(_target, method, descriptor) {
                    var manager = (0, base_js_1.convertOptions)(managerOrMiddleware);
                    if (!descriptor) {
                      (0, base_js_1.setManager)(_target.prototype, manager);
                      return _target;
                    }
                    var fn = descriptor.value;
                    if (typeof fn !== "function") {
                      throw new Error("Can not apply hooks. '".concat(method, "' is not a function"));
                    }
                    descriptor.value = functionHooks(fn, manager.props({
                      method
                    }));
                    return descriptor;
                  };
                  return wrapper;
                };
                exports2.hookDecorator = hookDecorator;
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/index.js": (
              /*!************************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/index.js ***!
                \************************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  Object.defineProperty(o, k2, {
                    enumerable: true,
                    get: function get() {
                      return m[k];
                    }
                  });
                } : function(o, m, k, k2) {
                  if (k2 === void 0)
                    k2 = k;
                  o[k2] = m[k];
                });
                var __exportStar = this && this.__exportStar || function(m, exports3) {
                  for (var p in m)
                    if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                      __createBinding(exports3, m, p);
                };
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.hooks = exports2.middleware = void 0;
                var base_js_1 = __webpack_require__2(
                  /*! ./base.js */
                  "../../node_modules/@feathersjs/hooks/script/base.js"
                );
                var hooks_js_1 = __webpack_require__2(
                  /*! ./hooks.js */
                  "../../node_modules/@feathersjs/hooks/script/hooks.js"
                );
                __exportStar(__webpack_require__2(
                  /*! ./hooks.js */
                  "../../node_modules/@feathersjs/hooks/script/hooks.js"
                ), exports2);
                __exportStar(__webpack_require__2(
                  /*! ./compose.js */
                  "../../node_modules/@feathersjs/hooks/script/compose.js"
                ), exports2);
                __exportStar(__webpack_require__2(
                  /*! ./base.js */
                  "../../node_modules/@feathersjs/hooks/script/base.js"
                ), exports2);
                __exportStar(__webpack_require__2(
                  /*! ./regular.js */
                  "../../node_modules/@feathersjs/hooks/script/regular.js"
                ), exports2);
                function middleware(mw, options) {
                  var manager = new base_js_1.HookManager().middleware(mw);
                  if (options) {
                    if (options.params) {
                      manager.params.apply(manager, _toConsumableArray(options.params));
                    }
                    if (options.defaults) {
                      manager.defaults(options.defaults);
                    }
                    if (options.props) {
                      manager.props(options.props);
                    }
                  }
                  return manager;
                }
                exports2.middleware = middleware;
                function hooks() {
                  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                  }
                  var target = args[0], _hooks = args[1];
                  if (typeof target === "function" && (_hooks instanceof base_js_1.HookManager || Array.isArray(_hooks) || args.length === 1)) {
                    return (0, hooks_js_1.functionHooks)(target, _hooks);
                  }
                  if (args.length === 2) {
                    return (0, hooks_js_1.objectHooks)(target, _hooks);
                  }
                  return (0, hooks_js_1.hookDecorator)(target);
                }
                exports2.hooks = hooks;
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/regular.js": (
              /*!**************************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/regular.js ***!
                \**************************************************************/
              /***/
              function(__unused_webpack_module, exports2, __webpack_require__2) {
                "use strict";
                function _typeof(obj) {
                  "@babel/helpers - typeof";
                  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
                    return typeof obj2;
                  } : function(obj2) {
                    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                  }, _typeof(obj);
                }
                function _toConsumableArray(arr) {
                  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
                }
                function _nonIterableSpread() {
                  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
                function _iterableToArray(iter) {
                  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
                    return Array.from(iter);
                }
                function _arrayWithoutHoles(arr) {
                  if (Array.isArray(arr))
                    return _arrayLikeToArray(arr);
                }
                function _arrayLikeToArray(arr, len) {
                  if (len == null || len > arr.length)
                    len = arr.length;
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
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
                  key = _toPropertyKey(key);
                  if (key in obj) {
                    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
                  } else {
                    obj[key] = value;
                  }
                  return obj;
                }
                function _toPropertyKey(arg) {
                  var key = _toPrimitive(arg, "string");
                  return _typeof(key) === "symbol" ? key : String(key);
                }
                function _toPrimitive(input, hint) {
                  if (_typeof(input) !== "object" || input === null)
                    return input;
                  var prim = input[Symbol.toPrimitive];
                  if (prim !== void 0) {
                    var res = prim.call(input, hint || "default");
                    if (_typeof(res) !== "object")
                      return res;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                  }
                  return (hint === "string" ? String : Number)(input);
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.collect = exports2.fromErrorHook = exports2.fromAfterHook = exports2.fromBeforeHook = exports2.runHooks = exports2.runHook = void 0;
                var compose_js_1 = __webpack_require__2(
                  /*! ./compose.js */
                  "../../node_modules/@feathersjs/hooks/script/compose.js"
                );
                var runHook = function runHook2(hook, context, type) {
                  var typeBefore = context.type;
                  if (type)
                    context.type = type;
                  return Promise.resolve(hook.call(context.self, context)).then(function(res) {
                    if (type)
                      context.type = typeBefore;
                    if (res && res !== context) {
                      Object.assign(context, res);
                    }
                  });
                };
                exports2.runHook = runHook;
                var runHooks = function runHooks2(hooks) {
                  return function(context) {
                    return hooks.reduce(function(promise, hook) {
                      return promise.then(function() {
                        return (0, exports2.runHook)(hook, context);
                      });
                    }, Promise.resolve(context));
                  };
                };
                exports2.runHooks = runHooks;
                function fromBeforeHook(hook) {
                  return function(context, next) {
                    return (0, exports2.runHook)(hook, context, "before").then(next);
                  };
                }
                exports2.fromBeforeHook = fromBeforeHook;
                function fromAfterHook(hook) {
                  return function(context, next) {
                    return next().then(function() {
                      return (0, exports2.runHook)(hook, context, "after");
                    });
                  };
                }
                exports2.fromAfterHook = fromAfterHook;
                function fromErrorHook(hook) {
                  return function(context, next) {
                    return next().catch(function(error) {
                      if (context.error !== error || context.result !== void 0) {
                        context.original = _objectSpread({}, context);
                        context.error = error;
                        delete context.result;
                      }
                      return (0, exports2.runHook)(hook, context, "error").then(function() {
                        if (context.result === void 0 && context.error !== void 0) {
                          throw context.error;
                        }
                      }).catch(function(error2) {
                        context.error = error2;
                        throw context.error;
                      });
                    });
                  };
                }
                exports2.fromErrorHook = fromErrorHook;
                function collect(_ref) {
                  var _ref$before = _ref.before, before = _ref$before === void 0 ? [] : _ref$before, _ref$after = _ref.after, after = _ref$after === void 0 ? [] : _ref$after, _ref$error = _ref.error, error = _ref$error === void 0 ? [] : _ref$error;
                  var beforeHooks = before.map(fromBeforeHook);
                  var afterHooks = _toConsumableArray(after).reverse().map(fromAfterHook);
                  var errorHooks = error.length ? [fromErrorHook((0, exports2.runHooks)(error))] : [];
                  return (0, compose_js_1.compose)([].concat(errorHooks, _toConsumableArray(beforeHooks), _toConsumableArray(afterHooks)));
                }
                exports2.collect = collect;
              }
            ),
            /***/
            "../../node_modules/@feathersjs/hooks/script/utils.js": (
              /*!************************************************************!*\
                !*** ../../node_modules/@feathersjs/hooks/script/utils.js ***!
                \************************************************************/
              /***/
              function(__unused_webpack_module, exports2) {
                "use strict";
                function _createForOfIteratorHelper(o, allowArrayLike) {
                  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
                  if (!it) {
                    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
                      if (it)
                        o = it;
                      var i = 0;
                      var F = function F2() {
                      };
                      return { s: F, n: function n() {
                        if (i >= o.length)
                          return { done: true };
                        return { done: false, value: o[i++] };
                      }, e: function e(_e2) {
                        throw _e2;
                      }, f: F };
                    }
                    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                  }
                  var normalCompletion = true, didErr = false, err;
                  return { s: function s() {
                    it = it.call(o);
                  }, n: function n() {
                    var step = it.next();
                    normalCompletion = step.done;
                    return step;
                  }, e: function e(_e3) {
                    didErr = true;
                    err = _e3;
                  }, f: function f() {
                    try {
                      if (!normalCompletion && it.return != null)
                        it.return();
                    } finally {
                      if (didErr)
                        throw err;
                    }
                  } };
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
                  for (var i = 0, arr2 = new Array(len); i < len; i++)
                    arr2[i] = arr[i];
                  return arr2;
                }
                Object.defineProperty(exports2, "__esModule", {
                  value: true
                });
                exports2.copyFnProperties = exports2.copyProperties = void 0;
                function copyProperties(target) {
                  for (var _len = arguments.length, originals = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    originals[_key - 1] = arguments[_key];
                  }
                  for (var _i = 0, _originals = originals; _i < _originals.length; _i++) {
                    var original = _originals[_i];
                    var originalProps = Object.keys(original).concat(Object.getOwnPropertySymbols(original));
                    var _iterator = _createForOfIteratorHelper(originalProps), _step;
                    try {
                      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                        var prop = _step.value;
                        var propDescriptor = Object.getOwnPropertyDescriptor(original, prop);
                        if (propDescriptor && !Object.prototype.hasOwnProperty.call(target, prop)) {
                          Object.defineProperty(target, prop, propDescriptor);
                        }
                      }
                    } catch (err) {
                      _iterator.e(err);
                    } finally {
                      _iterator.f();
                    }
                  }
                  return target;
                }
                exports2.copyProperties = copyProperties;
                function copyFnProperties(target, original) {
                  var internalProps = ["name", "length"];
                  try {
                    for (var _i2 = 0, _internalProps = internalProps; _i2 < _internalProps.length; _i2++) {
                      var prop = _internalProps[_i2];
                      var value = original[prop];
                      Object.defineProperty(target, prop, {
                        value
                      });
                    }
                  } catch (_e) {
                  }
                  return target;
                }
                exports2.copyFnProperties = copyFnProperties;
              }
            )
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          var __webpack_exports__ = __webpack_require__("./src/feathers.ts");
          return __webpack_exports__;
        }()
      );
    });
  }
});
export default require_feathers();
/*! Bundled license information:

@feathersjs/client/dist/feathers.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE *)
*/
//# sourceMappingURL=@feathersjs_client.js.map
