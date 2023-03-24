import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@feathersjs/errors/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/@feathersjs/errors/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convert = exports.errors = exports.Unavailable = exports.BadGateway = exports.NotImplemented = exports.GeneralError = exports.TooManyRequests = exports.Unprocessable = exports.LengthRequired = exports.Gone = exports.Conflict = exports.Timeout = exports.NotAcceptable = exports.MethodNotAllowed = exports.NotFound = exports.Forbidden = exports.PaymentError = exports.NotAuthenticated = exports.BadRequest = exports.FeathersError = void 0;
    var FeathersError = class extends Error {
      constructor(err, name, code, className, _data) {
        let msg = typeof err === "string" ? err : "Error";
        const properties = {
          name,
          code,
          className,
          type: "FeathersError"
        };
        if (Array.isArray(_data)) {
          properties.data = _data;
        } else if (typeof err === "object" || _data !== void 0) {
          const { message, errors, ...rest } = err !== null && typeof err === "object" ? err : _data;
          msg = message || msg;
          properties.errors = errors;
          properties.data = rest;
        }
        super(msg);
        Object.assign(this, properties);
      }
      toJSON() {
        const result = {
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
    };
    exports.FeathersError = FeathersError;
    var BadRequest = class extends FeathersError {
      constructor(message, data) {
        super(message, "BadRequest", 400, "bad-request", data);
      }
    };
    exports.BadRequest = BadRequest;
    var NotAuthenticated = class extends FeathersError {
      constructor(message, data) {
        super(message, "NotAuthenticated", 401, "not-authenticated", data);
      }
    };
    exports.NotAuthenticated = NotAuthenticated;
    var PaymentError = class extends FeathersError {
      constructor(message, data) {
        super(message, "PaymentError", 402, "payment-error", data);
      }
    };
    exports.PaymentError = PaymentError;
    var Forbidden = class extends FeathersError {
      constructor(message, data) {
        super(message, "Forbidden", 403, "forbidden", data);
      }
    };
    exports.Forbidden = Forbidden;
    var NotFound = class extends FeathersError {
      constructor(message, data) {
        super(message, "NotFound", 404, "not-found", data);
      }
    };
    exports.NotFound = NotFound;
    var MethodNotAllowed = class extends FeathersError {
      constructor(message, data) {
        super(message, "MethodNotAllowed", 405, "method-not-allowed", data);
      }
    };
    exports.MethodNotAllowed = MethodNotAllowed;
    var NotAcceptable = class extends FeathersError {
      constructor(message, data) {
        super(message, "NotAcceptable", 406, "not-acceptable", data);
      }
    };
    exports.NotAcceptable = NotAcceptable;
    var Timeout = class extends FeathersError {
      constructor(message, data) {
        super(message, "Timeout", 408, "timeout", data);
      }
    };
    exports.Timeout = Timeout;
    var Conflict = class extends FeathersError {
      constructor(message, data) {
        super(message, "Conflict", 409, "conflict", data);
      }
    };
    exports.Conflict = Conflict;
    var Gone = class extends FeathersError {
      constructor(message, data) {
        super(message, "Gone", 410, "gone", data);
      }
    };
    exports.Gone = Gone;
    var LengthRequired = class extends FeathersError {
      constructor(message, data) {
        super(message, "LengthRequired", 411, "length-required", data);
      }
    };
    exports.LengthRequired = LengthRequired;
    var Unprocessable = class extends FeathersError {
      constructor(message, data) {
        super(message, "Unprocessable", 422, "unprocessable", data);
      }
    };
    exports.Unprocessable = Unprocessable;
    var TooManyRequests = class extends FeathersError {
      constructor(message, data) {
        super(message, "TooManyRequests", 429, "too-many-requests", data);
      }
    };
    exports.TooManyRequests = TooManyRequests;
    var GeneralError = class extends FeathersError {
      constructor(message, data) {
        super(message, "GeneralError", 500, "general-error", data);
      }
    };
    exports.GeneralError = GeneralError;
    var NotImplemented = class extends FeathersError {
      constructor(message, data) {
        super(message, "NotImplemented", 501, "not-implemented", data);
      }
    };
    exports.NotImplemented = NotImplemented;
    var BadGateway = class extends FeathersError {
      constructor(message, data) {
        super(message, "BadGateway", 502, "bad-gateway", data);
      }
    };
    exports.BadGateway = BadGateway;
    var Unavailable = class extends FeathersError {
      constructor(message, data) {
        super(message, "Unavailable", 503, "unavailable", data);
      }
    };
    exports.Unavailable = Unavailable;
    exports.errors = {
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
      const FeathersError2 = exports.errors[error.name];
      const result = FeathersError2 ? new FeathersError2(error.message, error.data) : new Error(error.message || error);
      if (typeof error === "object") {
        Object.assign(result, error);
      }
      return result;
    }
    exports.convert = convert;
  }
});

export {
  require_lib
};
//# sourceMappingURL=chunk-XS4VL3SZ.js.map
