import {
  require_lib
} from "./chunk-XS4VL3SZ.js";
import {
  require_lib as require_lib2
} from "./chunk-B6F77PSE.js";
import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@feathersjs/authentication-client/lib/storage.js
var require_storage = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/storage.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageWrapper = exports.MemoryStorage = void 0;
    var MemoryStorage = class {
      constructor() {
        this.store = {};
      }
      getItem(key) {
        return Promise.resolve(this.store[key]);
      }
      setItem(key, value) {
        return Promise.resolve(this.store[key] = value);
      }
      removeItem(key) {
        const value = this.store[key];
        delete this.store[key];
        return Promise.resolve(value);
      }
    };
    exports.MemoryStorage = MemoryStorage;
    var StorageWrapper = class {
      constructor(storage) {
        this.storage = storage;
      }
      getItem(key) {
        return Promise.resolve(this.storage.getItem(key));
      }
      setItem(key, value) {
        return Promise.resolve(this.storage.setItem(key, value));
      }
      removeItem(key) {
        return Promise.resolve(this.storage.removeItem(key));
      }
    };
    exports.StorageWrapper = StorageWrapper;
  }
});

// ../../node_modules/@feathersjs/authentication-client/lib/core.js
var require_core = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthenticationClient = void 0;
    var errors_1 = require_lib();
    var storage_1 = require_storage();
    var OauthError = class extends errors_1.FeathersError {
      constructor(message, data) {
        super(message, "OauthError", 401, "oauth-error", data);
      }
    };
    var getMatch = (location, key) => {
      const regex = new RegExp(`(?:&?)${key}=([^&]*)`);
      const match = location.hash ? location.hash.match(regex) : null;
      if (match !== null) {
        const [, value] = match;
        return [value, regex];
      }
      return [null, regex];
    };
    var AuthenticationClient = class {
      constructor(app, options) {
        const socket = app.io;
        const storage = new storage_1.StorageWrapper(app.get("storage") || options.storage);
        this.app = app;
        this.options = options;
        this.authenticated = false;
        this.app.set("storage", storage);
        if (socket) {
          this.handleSocket(socket);
        }
      }
      get service() {
        return this.app.service(this.options.path);
      }
      get storage() {
        return this.app.get("storage");
      }
      handleSocket(socket) {
        socket.on("disconnect", () => {
          if (this.authenticated) {
            this.reAuthenticate(true);
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
      getFromLocation(location) {
        const [accessToken, tokenRegex] = getMatch(location, this.options.locationKey);
        if (accessToken !== null) {
          location.hash = location.hash.replace(tokenRegex, "");
          return Promise.resolve(accessToken);
        }
        const [message, errorRegex] = getMatch(location, this.options.locationErrorKey);
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
      setAccessToken(accessToken) {
        return this.storage.setItem(this.options.storageKey, accessToken);
      }
      /**
       * Returns the access token from storage or the window location hash.
       *
       * @returns The access token from storage or location hash
       */
      getAccessToken() {
        return this.storage.getItem(this.options.storageKey).then((accessToken) => {
          if (!accessToken && typeof window !== "undefined" && window.location) {
            return this.getFromLocation(window.location);
          }
          return accessToken || null;
        });
      }
      /**
       * Remove the access token from storage
       * @returns The removed access token
       */
      removeAccessToken() {
        return this.storage.removeItem(this.options.storageKey);
      }
      /**
       * Reset the internal authentication state. Usually not necessary to call directly.
       *
       * @returns null
       */
      reset() {
        this.app.set("authentication", null);
        this.authenticated = false;
        return Promise.resolve(null);
      }
      handleError(error, type) {
        if (error.code > 400 && error.code < 408) {
          const promise = this.removeAccessToken().then(() => this.reset());
          return type === "logout" ? promise : promise.then(() => Promise.reject(error));
        }
        return this.reset().then(() => Promise.reject(error));
      }
      /**
       * Try to reauthenticate using the token from storage. Will do nothing if already authenticated unless
       * `force` is true.
       *
       * @param force force reauthentication with the server
       * @param strategy The name of the strategy to use. Defaults to `options.jwtStrategy`
       * @returns The reauthentication result
       */
      reAuthenticate(force = false, strategy) {
        let authPromise = this.app.get("authentication");
        if (!authPromise || force === true) {
          authPromise = this.getAccessToken().then((accessToken) => {
            if (!accessToken) {
              return this.handleError(new errors_1.NotAuthenticated("No accessToken found in storage"), "authenticate");
            }
            return this.authenticate({
              strategy: strategy || this.options.jwtStrategy,
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
      authenticate(authentication, params) {
        if (!authentication) {
          return this.reAuthenticate();
        }
        const promise = this.service.create(authentication, params).then((authResult) => {
          const { accessToken } = authResult;
          this.authenticated = true;
          this.app.emit("login", authResult);
          this.app.emit("authenticated", authResult);
          return this.setAccessToken(accessToken).then(() => authResult);
        }).catch((error) => this.handleError(error, "authenticate"));
        this.app.set("authentication", promise);
        return promise;
      }
      /**
       * Log out the current user and remove their token. Will do nothing
       * if not authenticated.
       *
       * @returns The log out result.
       */
      logout() {
        return Promise.resolve(this.app.get("authentication")).then(() => this.service.remove(null).then((authResult) => this.removeAccessToken().then(() => this.reset()).then(() => {
          this.app.emit("logout", authResult);
          return authResult;
        }))).catch((error) => this.handleError(error, "logout"));
      }
    };
    exports.AuthenticationClient = AuthenticationClient;
  }
});

// ../../node_modules/@feathersjs/authentication-client/lib/hooks/authentication.js
var require_authentication = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/hooks/authentication.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.authentication = void 0;
    var commons_1 = require_lib2();
    var authentication = () => {
      return (context, next) => {
        const { app, params, path, method, app: { authentication: service } } = context;
        if ((0, commons_1.stripSlashes)(service.options.path) === path && method === "create") {
          return next();
        }
        return Promise.resolve(app.get("authentication")).then((authResult) => {
          if (authResult) {
            context.params = Object.assign({}, authResult, params);
          }
        }).then(next);
      };
    };
    exports.authentication = authentication;
  }
});

// ../../node_modules/@feathersjs/authentication-client/lib/hooks/populate-header.js
var require_populate_header = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/hooks/populate-header.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.populateHeader = void 0;
    var populateHeader = () => {
      return (context, next) => {
        const { app, params: { accessToken } } = context;
        const authentication = app.authentication;
        if (app.rest && accessToken) {
          const { scheme, header } = authentication.options;
          const authHeader = `${scheme} ${accessToken}`;
          context.params.headers = Object.assign({}, {
            [header]: authHeader
          }, context.params.headers);
        }
        return next();
      };
    };
    exports.populateHeader = populateHeader;
  }
});

// ../../node_modules/@feathersjs/authentication-client/lib/hooks/index.js
var require_hooks = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/hooks/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.populateHeader = exports.authentication = void 0;
    var authentication_1 = require_authentication();
    Object.defineProperty(exports, "authentication", { enumerable: true, get: function() {
      return authentication_1.authentication;
    } });
    var populate_header_1 = require_populate_header();
    Object.defineProperty(exports, "populateHeader", { enumerable: true, get: function() {
      return populate_header_1.populateHeader;
    } });
  }
});

// ../../node_modules/@feathersjs/authentication-client/lib/index.js
var require_lib3 = __commonJS({
  "../../node_modules/@feathersjs/authentication-client/lib/index.js"(exports, module) {
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
    exports.defaults = exports.defaultStorage = exports.hooks = exports.MemoryStorage = exports.AuthenticationClient = exports.getDefaultStorage = void 0;
    var core_1 = require_core();
    Object.defineProperty(exports, "AuthenticationClient", { enumerable: true, get: function() {
      return core_1.AuthenticationClient;
    } });
    var hooks = __importStar(require_hooks());
    exports.hooks = hooks;
    var storage_1 = require_storage();
    Object.defineProperty(exports, "MemoryStorage", { enumerable: true, get: function() {
      return storage_1.MemoryStorage;
    } });
    var getDefaultStorage = () => {
      try {
        return new storage_1.StorageWrapper(window.localStorage);
      } catch (error) {
      }
      return new storage_1.MemoryStorage();
    };
    exports.getDefaultStorage = getDefaultStorage;
    exports.defaultStorage = (0, exports.getDefaultStorage)();
    exports.defaults = {
      header: "Authorization",
      scheme: "Bearer",
      storageKey: "feathers-jwt",
      locationKey: "access_token",
      locationErrorKey: "error",
      jwtStrategy: "jwt",
      path: "/authentication",
      Authentication: core_1.AuthenticationClient,
      storage: exports.defaultStorage
    };
    var init = (_options = {}) => {
      const options = Object.assign({}, exports.defaults, _options);
      const { Authentication } = options;
      return (app) => {
        const authentication = new Authentication(app, options);
        app.authentication = authentication;
        app.authenticate = authentication.authenticate.bind(authentication);
        app.reAuthenticate = authentication.reAuthenticate.bind(authentication);
        app.logout = authentication.logout.bind(authentication);
        app.hooks([hooks.authentication(), hooks.populateHeader()]);
      };
    };
    exports.default = init;
    if (typeof module !== "undefined") {
      module.exports = Object.assign(init, module.exports);
    }
  }
});
export default require_lib3();
//# sourceMappingURL=@feathersjs_authentication-client.js.map
