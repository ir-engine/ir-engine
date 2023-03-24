import {
  require_debounce
} from "./chunk-JGYLCJBX.js";
import {
  require_Stack,
  require_arrayEach,
  require_baseAssignValue,
  require_baseEach,
  require_baseFor,
  require_castFunction,
  require_cloneBuffer,
  require_cloneTypedArray,
  require_copyArray,
  require_copyObject,
  require_defineProperty,
  require_eq,
  require_identity,
  require_initCloneObject,
  require_isArguments,
  require_isArray,
  require_isArrayLike,
  require_isBuffer,
  require_isFunction,
  require_isIndex,
  require_isPlainObject,
  require_isTypedArray,
  require_keysIn,
  require_lib
} from "./chunk-5G3JAHHK.js";
import {
  require_isObject,
  require_isObjectLike
} from "./chunk-R6B3NM7Z.js";
import {
  require_prop_types
} from "./chunk-WM2OC5CN.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/lodash/_assignMergeValue.js
var require_assignMergeValue = __commonJS({
  "../../node_modules/lodash/_assignMergeValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignMergeValue;
  }
});

// ../../node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS({
  "../../node_modules/lodash/isArrayLikeObject.js"(exports, module) {
    var isArrayLike = require_isArrayLike();
    var isObjectLike = require_isObjectLike();
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    module.exports = isArrayLikeObject;
  }
});

// ../../node_modules/lodash/_safeGet.js
var require_safeGet = __commonJS({
  "../../node_modules/lodash/_safeGet.js"(exports, module) {
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    module.exports = safeGet;
  }
});

// ../../node_modules/lodash/toPlainObject.js
var require_toPlainObject = __commonJS({
  "../../node_modules/lodash/toPlainObject.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    module.exports = toPlainObject;
  }
});

// ../../node_modules/lodash/_baseMergeDeep.js
var require_baseMergeDeep = __commonJS({
  "../../node_modules/lodash/_baseMergeDeep.js"(exports, module) {
    var assignMergeValue = require_assignMergeValue();
    var cloneBuffer = require_cloneBuffer();
    var cloneTypedArray = require_cloneTypedArray();
    var copyArray = require_copyArray();
    var initCloneObject = require_initCloneObject();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isArrayLikeObject = require_isArrayLikeObject();
    var isBuffer = require_isBuffer();
    var isFunction = require_isFunction();
    var isObject = require_isObject();
    var isPlainObject = require_isPlainObject();
    var isTypedArray = require_isTypedArray();
    var safeGet = require_safeGet();
    var toPlainObject = require_toPlainObject();
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    module.exports = baseMergeDeep;
  }
});

// ../../node_modules/lodash/_baseMerge.js
var require_baseMerge = __commonJS({
  "../../node_modules/lodash/_baseMerge.js"(exports, module) {
    var Stack = require_Stack();
    var assignMergeValue = require_assignMergeValue();
    var baseFor = require_baseFor();
    var baseMergeDeep = require_baseMergeDeep();
    var isObject = require_isObject();
    var keysIn = require_keysIn();
    var safeGet = require_safeGet();
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    module.exports = baseMerge;
  }
});

// ../../node_modules/lodash/_apply.js
var require_apply = __commonJS({
  "../../node_modules/lodash/_apply.js"(exports, module) {
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    module.exports = apply;
  }
});

// ../../node_modules/lodash/_overRest.js
var require_overRest = __commonJS({
  "../../node_modules/lodash/_overRest.js"(exports, module) {
    var apply = require_apply();
    var nativeMax = Math.max;
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    module.exports = overRest;
  }
});

// ../../node_modules/lodash/constant.js
var require_constant = __commonJS({
  "../../node_modules/lodash/constant.js"(exports, module) {
    function constant(value) {
      return function() {
        return value;
      };
    }
    module.exports = constant;
  }
});

// ../../node_modules/lodash/_baseSetToString.js
var require_baseSetToString = __commonJS({
  "../../node_modules/lodash/_baseSetToString.js"(exports, module) {
    var constant = require_constant();
    var defineProperty = require_defineProperty();
    var identity = require_identity();
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    module.exports = baseSetToString;
  }
});

// ../../node_modules/lodash/_shortOut.js
var require_shortOut = __commonJS({
  "../../node_modules/lodash/_shortOut.js"(exports, module) {
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var nativeNow = Date.now;
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    module.exports = shortOut;
  }
});

// ../../node_modules/lodash/_setToString.js
var require_setToString = __commonJS({
  "../../node_modules/lodash/_setToString.js"(exports, module) {
    var baseSetToString = require_baseSetToString();
    var shortOut = require_shortOut();
    var setToString = shortOut(baseSetToString);
    module.exports = setToString;
  }
});

// ../../node_modules/lodash/_baseRest.js
var require_baseRest = __commonJS({
  "../../node_modules/lodash/_baseRest.js"(exports, module) {
    var identity = require_identity();
    var overRest = require_overRest();
    var setToString = require_setToString();
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    module.exports = baseRest;
  }
});

// ../../node_modules/lodash/_isIterateeCall.js
var require_isIterateeCall = __commonJS({
  "../../node_modules/lodash/_isIterateeCall.js"(exports, module) {
    var eq = require_eq();
    var isArrayLike = require_isArrayLike();
    var isIndex = require_isIndex();
    var isObject = require_isObject();
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    module.exports = isIterateeCall;
  }
});

// ../../node_modules/lodash/_createAssigner.js
var require_createAssigner = __commonJS({
  "../../node_modules/lodash/_createAssigner.js"(exports, module) {
    var baseRest = require_baseRest();
    var isIterateeCall = require_isIterateeCall();
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    module.exports = createAssigner;
  }
});

// ../../node_modules/lodash/merge.js
var require_merge = __commonJS({
  "../../node_modules/lodash/merge.js"(exports, module) {
    var baseMerge = require_baseMerge();
    var createAssigner = require_createAssigner();
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    module.exports = merge;
  }
});

// ../../node_modules/react-color/lib/helpers/alpha.js
var require_alpha = __commonJS({
  "../../node_modules/react-color/lib/helpers/alpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var calculateChange = exports.calculateChange = function calculateChange2(e, hsl, direction, initialA, container) {
      var containerWidth = container.clientWidth;
      var containerHeight = container.clientHeight;
      var x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
      var y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
      var left = x - (container.getBoundingClientRect().left + window.pageXOffset);
      var top = y - (container.getBoundingClientRect().top + window.pageYOffset);
      if (direction === "vertical") {
        var a = void 0;
        if (top < 0) {
          a = 0;
        } else if (top > containerHeight) {
          a = 1;
        } else {
          a = Math.round(top * 100 / containerHeight) / 100;
        }
        if (hsl.a !== a) {
          return {
            h: hsl.h,
            s: hsl.s,
            l: hsl.l,
            a,
            source: "rgb"
          };
        }
      } else {
        var _a = void 0;
        if (left < 0) {
          _a = 0;
        } else if (left > containerWidth) {
          _a = 1;
        } else {
          _a = Math.round(left * 100 / containerWidth) / 100;
        }
        if (initialA !== _a) {
          return {
            h: hsl.h,
            s: hsl.s,
            l: hsl.l,
            a: _a,
            source: "rgb"
          };
        }
      }
      return null;
    };
  }
});

// ../../node_modules/react-color/lib/helpers/checkboard.js
var require_checkboard = __commonJS({
  "../../node_modules/react-color/lib/helpers/checkboard.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var checkboardCache = {};
    var render = exports.render = function render2(c1, c2, size, serverCanvas) {
      if (typeof document === "undefined" && !serverCanvas) {
        return null;
      }
      var canvas = serverCanvas ? new serverCanvas() : document.createElement("canvas");
      canvas.width = size * 2;
      canvas.height = size * 2;
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        return null;
      }
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = c2;
      ctx.fillRect(0, 0, size, size);
      ctx.translate(size, size);
      ctx.fillRect(0, 0, size, size);
      return canvas.toDataURL();
    };
    var get = exports.get = function get2(c1, c2, size, serverCanvas) {
      var key = c1 + "-" + c2 + "-" + size + (serverCanvas ? "-server" : "");
      if (checkboardCache[key]) {
        return checkboardCache[key];
      }
      var checkboard = render(c1, c2, size, serverCanvas);
      checkboardCache[key] = checkboard;
      return checkboard;
    };
  }
});

// ../../node_modules/react-color/lib/components/common/Checkboard.js
var require_Checkboard = __commonJS({
  "../../node_modules/react-color/lib/components/common/Checkboard.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Checkboard = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _checkboard = require_checkboard();
    var checkboard = _interopRequireWildcard(_checkboard);
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var Checkboard = exports.Checkboard = function Checkboard2(_ref) {
      var white = _ref.white, grey = _ref.grey, size = _ref.size, renderers = _ref.renderers, borderRadius = _ref.borderRadius, boxShadow = _ref.boxShadow, children = _ref.children;
      var styles = (0, _reactcss2.default)({
        "default": {
          grid: {
            borderRadius,
            boxShadow,
            absolute: "0px 0px 0px 0px",
            background: "url(" + checkboard.get(white, grey, size, renderers.canvas) + ") center left"
          }
        }
      });
      return (0, _react.isValidElement)(children) ? _react2.default.cloneElement(children, _extends({}, children.props, { style: _extends({}, children.props.style, styles.grid) })) : _react2.default.createElement("div", { style: styles.grid });
    };
    Checkboard.defaultProps = {
      size: 8,
      white: "transparent",
      grey: "rgba(0,0,0,.08)",
      renderers: {}
    };
    exports.default = Checkboard;
  }
});

// ../../node_modules/react-color/lib/components/common/Alpha.js
var require_Alpha = __commonJS({
  "../../node_modules/react-color/lib/components/common/Alpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Alpha = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _alpha = require_alpha();
    var alpha = _interopRequireWildcard(_alpha);
    var _Checkboard = require_Checkboard();
    var _Checkboard2 = _interopRequireDefault(_Checkboard);
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var Alpha = exports.Alpha = function(_ref) {
      _inherits(Alpha2, _ref);
      function Alpha2() {
        var _ref2;
        var _temp, _this, _ret;
        _classCallCheck(this, Alpha2);
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Alpha2.__proto__ || Object.getPrototypeOf(Alpha2)).call.apply(_ref2, [this].concat(args))), _this), _this.handleChange = function(e) {
          var change = alpha.calculateChange(e, _this.props.hsl, _this.props.direction, _this.props.a, _this.container);
          change && typeof _this.props.onChange === "function" && _this.props.onChange(change, e);
        }, _this.handleMouseDown = function(e) {
          _this.handleChange(e);
          window.addEventListener("mousemove", _this.handleChange);
          window.addEventListener("mouseup", _this.handleMouseUp);
        }, _this.handleMouseUp = function() {
          _this.unbindEventListeners();
        }, _this.unbindEventListeners = function() {
          window.removeEventListener("mousemove", _this.handleChange);
          window.removeEventListener("mouseup", _this.handleMouseUp);
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }
      _createClass(Alpha2, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.unbindEventListeners();
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;
          var rgb = this.props.rgb;
          var styles = (0, _reactcss2.default)({
            "default": {
              alpha: {
                absolute: "0px 0px 0px 0px",
                borderRadius: this.props.radius
              },
              checkboard: {
                absolute: "0px 0px 0px 0px",
                overflow: "hidden",
                borderRadius: this.props.radius
              },
              gradient: {
                absolute: "0px 0px 0px 0px",
                background: "linear-gradient(to right, rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", 0) 0%,\n           rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", 1) 100%)",
                boxShadow: this.props.shadow,
                borderRadius: this.props.radius
              },
              container: {
                position: "relative",
                height: "100%",
                margin: "0 3px"
              },
              pointer: {
                position: "absolute",
                left: rgb.a * 100 + "%"
              },
              slider: {
                width: "4px",
                borderRadius: "1px",
                height: "8px",
                boxShadow: "0 0 2px rgba(0, 0, 0, .6)",
                background: "#fff",
                marginTop: "1px",
                transform: "translateX(-2px)"
              }
            },
            "vertical": {
              gradient: {
                background: "linear-gradient(to bottom, rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", 0) 0%,\n           rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", 1) 100%)"
              },
              pointer: {
                left: 0,
                top: rgb.a * 100 + "%"
              }
            },
            "overwrite": _extends({}, this.props.style)
          }, {
            vertical: this.props.direction === "vertical",
            overwrite: true
          });
          return _react2.default.createElement(
            "div",
            { style: styles.alpha },
            _react2.default.createElement(
              "div",
              { style: styles.checkboard },
              _react2.default.createElement(_Checkboard2.default, { renderers: this.props.renderers })
            ),
            _react2.default.createElement("div", { style: styles.gradient }),
            _react2.default.createElement(
              "div",
              {
                style: styles.container,
                ref: function ref(container) {
                  return _this2.container = container;
                },
                onMouseDown: this.handleMouseDown,
                onTouchMove: this.handleChange,
                onTouchStart: this.handleChange
              },
              _react2.default.createElement(
                "div",
                { style: styles.pointer },
                this.props.pointer ? _react2.default.createElement(this.props.pointer, this.props) : _react2.default.createElement("div", { style: styles.slider })
              )
            )
          );
        }
      }]);
      return Alpha2;
    }(_react.PureComponent || _react.Component);
    exports.default = Alpha;
  }
});

// ../../node_modules/react-color/lib/components/common/EditableInput.js
var require_EditableInput = __commonJS({
  "../../node_modules/react-color/lib/components/common/EditableInput.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.EditableInput = void 0;
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var DEFAULT_ARROW_OFFSET = 1;
    var UP_KEY_CODE = 38;
    var DOWN_KEY_CODE = 40;
    var VALID_KEY_CODES = [UP_KEY_CODE, DOWN_KEY_CODE];
    var isValidKeyCode = function isValidKeyCode2(keyCode) {
      return VALID_KEY_CODES.indexOf(keyCode) > -1;
    };
    var getNumberValue = function getNumberValue2(value) {
      return Number(String(value).replace(/%/g, ""));
    };
    var idCounter = 1;
    var EditableInput = exports.EditableInput = function(_ref) {
      _inherits(EditableInput2, _ref);
      function EditableInput2(props) {
        _classCallCheck(this, EditableInput2);
        var _this = _possibleConstructorReturn(this, (EditableInput2.__proto__ || Object.getPrototypeOf(EditableInput2)).call(this));
        _this.handleBlur = function() {
          if (_this.state.blurValue) {
            _this.setState({ value: _this.state.blurValue, blurValue: null });
          }
        };
        _this.handleChange = function(e) {
          _this.setUpdatedValue(e.target.value, e);
        };
        _this.handleKeyDown = function(e) {
          var value = getNumberValue(e.target.value);
          if (!isNaN(value) && isValidKeyCode(e.keyCode)) {
            var offset = _this.getArrowOffset();
            var updatedValue = e.keyCode === UP_KEY_CODE ? value + offset : value - offset;
            _this.setUpdatedValue(updatedValue, e);
          }
        };
        _this.handleDrag = function(e) {
          if (_this.props.dragLabel) {
            var newValue = Math.round(_this.props.value + e.movementX);
            if (newValue >= 0 && newValue <= _this.props.dragMax) {
              _this.props.onChange && _this.props.onChange(_this.getValueObjectWithLabel(newValue), e);
            }
          }
        };
        _this.handleMouseDown = function(e) {
          if (_this.props.dragLabel) {
            e.preventDefault();
            _this.handleDrag(e);
            window.addEventListener("mousemove", _this.handleDrag);
            window.addEventListener("mouseup", _this.handleMouseUp);
          }
        };
        _this.handleMouseUp = function() {
          _this.unbindEventListeners();
        };
        _this.unbindEventListeners = function() {
          window.removeEventListener("mousemove", _this.handleDrag);
          window.removeEventListener("mouseup", _this.handleMouseUp);
        };
        _this.state = {
          value: String(props.value).toUpperCase(),
          blurValue: String(props.value).toUpperCase()
        };
        _this.inputId = "rc-editable-input-" + idCounter++;
        return _this;
      }
      _createClass(EditableInput2, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
          if (this.props.value !== this.state.value && (prevProps.value !== this.props.value || prevState.value !== this.state.value)) {
            if (this.input === document.activeElement) {
              this.setState({ blurValue: String(this.props.value).toUpperCase() });
            } else {
              this.setState({ value: String(this.props.value).toUpperCase(), blurValue: !this.state.blurValue && String(this.props.value).toUpperCase() });
            }
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.unbindEventListeners();
        }
      }, {
        key: "getValueObjectWithLabel",
        value: function getValueObjectWithLabel(value) {
          return _defineProperty({}, this.props.label, value);
        }
      }, {
        key: "getArrowOffset",
        value: function getArrowOffset() {
          return this.props.arrowOffset || DEFAULT_ARROW_OFFSET;
        }
      }, {
        key: "setUpdatedValue",
        value: function setUpdatedValue(value, e) {
          var onChangeValue = this.props.label ? this.getValueObjectWithLabel(value) : value;
          this.props.onChange && this.props.onChange(onChangeValue, e);
          this.setState({ value });
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;
          var styles = (0, _reactcss2.default)({
            "default": {
              wrap: {
                position: "relative"
              }
            },
            "user-override": {
              wrap: this.props.style && this.props.style.wrap ? this.props.style.wrap : {},
              input: this.props.style && this.props.style.input ? this.props.style.input : {},
              label: this.props.style && this.props.style.label ? this.props.style.label : {}
            },
            "dragLabel-true": {
              label: {
                cursor: "ew-resize"
              }
            }
          }, {
            "user-override": true
          }, this.props);
          return _react2.default.createElement(
            "div",
            { style: styles.wrap },
            _react2.default.createElement("input", {
              id: this.inputId,
              style: styles.input,
              ref: function ref(input) {
                return _this2.input = input;
              },
              value: this.state.value,
              onKeyDown: this.handleKeyDown,
              onChange: this.handleChange,
              onBlur: this.handleBlur,
              placeholder: this.props.placeholder,
              spellCheck: "false"
            }),
            this.props.label && !this.props.hideLabel ? _react2.default.createElement(
              "label",
              {
                htmlFor: this.inputId,
                style: styles.label,
                onMouseDown: this.handleMouseDown
              },
              this.props.label
            ) : null
          );
        }
      }]);
      return EditableInput2;
    }(_react.PureComponent || _react.Component);
    exports.default = EditableInput;
  }
});

// ../../node_modules/react-color/lib/helpers/hue.js
var require_hue = __commonJS({
  "../../node_modules/react-color/lib/helpers/hue.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var calculateChange = exports.calculateChange = function calculateChange2(e, direction, hsl, container) {
      var containerWidth = container.clientWidth;
      var containerHeight = container.clientHeight;
      var x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
      var y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
      var left = x - (container.getBoundingClientRect().left + window.pageXOffset);
      var top = y - (container.getBoundingClientRect().top + window.pageYOffset);
      if (direction === "vertical") {
        var h = void 0;
        if (top < 0) {
          h = 359;
        } else if (top > containerHeight) {
          h = 0;
        } else {
          var percent = -(top * 100 / containerHeight) + 100;
          h = 360 * percent / 100;
        }
        if (hsl.h !== h) {
          return {
            h,
            s: hsl.s,
            l: hsl.l,
            a: hsl.a,
            source: "hsl"
          };
        }
      } else {
        var _h = void 0;
        if (left < 0) {
          _h = 0;
        } else if (left > containerWidth) {
          _h = 359;
        } else {
          var _percent = left * 100 / containerWidth;
          _h = 360 * _percent / 100;
        }
        if (hsl.h !== _h) {
          return {
            h: _h,
            s: hsl.s,
            l: hsl.l,
            a: hsl.a,
            source: "hsl"
          };
        }
      }
      return null;
    };
  }
});

// ../../node_modules/react-color/lib/components/common/Hue.js
var require_Hue = __commonJS({
  "../../node_modules/react-color/lib/components/common/Hue.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Hue = void 0;
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _hue = require_hue();
    var hue = _interopRequireWildcard(_hue);
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var Hue = exports.Hue = function(_ref) {
      _inherits(Hue2, _ref);
      function Hue2() {
        var _ref2;
        var _temp, _this, _ret;
        _classCallCheck(this, Hue2);
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Hue2.__proto__ || Object.getPrototypeOf(Hue2)).call.apply(_ref2, [this].concat(args))), _this), _this.handleChange = function(e) {
          var change = hue.calculateChange(e, _this.props.direction, _this.props.hsl, _this.container);
          change && typeof _this.props.onChange === "function" && _this.props.onChange(change, e);
        }, _this.handleMouseDown = function(e) {
          _this.handleChange(e);
          window.addEventListener("mousemove", _this.handleChange);
          window.addEventListener("mouseup", _this.handleMouseUp);
        }, _this.handleMouseUp = function() {
          _this.unbindEventListeners();
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }
      _createClass(Hue2, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.unbindEventListeners();
        }
      }, {
        key: "unbindEventListeners",
        value: function unbindEventListeners() {
          window.removeEventListener("mousemove", this.handleChange);
          window.removeEventListener("mouseup", this.handleMouseUp);
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;
          var _props$direction = this.props.direction, direction = _props$direction === void 0 ? "horizontal" : _props$direction;
          var styles = (0, _reactcss2.default)({
            "default": {
              hue: {
                absolute: "0px 0px 0px 0px",
                borderRadius: this.props.radius,
                boxShadow: this.props.shadow
              },
              container: {
                padding: "0 2px",
                position: "relative",
                height: "100%",
                borderRadius: this.props.radius
              },
              pointer: {
                position: "absolute",
                left: this.props.hsl.h * 100 / 360 + "%"
              },
              slider: {
                marginTop: "1px",
                width: "4px",
                borderRadius: "1px",
                height: "8px",
                boxShadow: "0 0 2px rgba(0, 0, 0, .6)",
                background: "#fff",
                transform: "translateX(-2px)"
              }
            },
            "vertical": {
              pointer: {
                left: "0px",
                top: -(this.props.hsl.h * 100 / 360) + 100 + "%"
              }
            }
          }, { vertical: direction === "vertical" });
          return _react2.default.createElement(
            "div",
            { style: styles.hue },
            _react2.default.createElement(
              "div",
              {
                className: "hue-" + direction,
                style: styles.container,
                ref: function ref(container) {
                  return _this2.container = container;
                },
                onMouseDown: this.handleMouseDown,
                onTouchMove: this.handleChange,
                onTouchStart: this.handleChange
              },
              _react2.default.createElement(
                "style",
                null,
                "\n            .hue-horizontal {\n              background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0\n                33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n              background: -webkit-linear-gradient(to right, #f00 0%, #ff0\n                17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n            }\n\n            .hue-vertical {\n              background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%,\n                #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n              background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%,\n                #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n            }\n          "
              ),
              _react2.default.createElement(
                "div",
                { style: styles.pointer },
                this.props.pointer ? _react2.default.createElement(this.props.pointer, this.props) : _react2.default.createElement("div", { style: styles.slider })
              )
            )
          );
        }
      }]);
      return Hue2;
    }(_react.PureComponent || _react.Component);
    exports.default = Hue;
  }
});

// ../../node_modules/react-color/lib/components/common/Raised.js
var require_Raised = __commonJS({
  "../../node_modules/react-color/lib/components/common/Raised.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Raised = void 0;
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var Raised = exports.Raised = function Raised2(_ref) {
      var zDepth = _ref.zDepth, radius = _ref.radius, background = _ref.background, children = _ref.children, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles;
      var styles = (0, _reactcss2.default)((0, _merge2.default)({
        "default": {
          wrap: {
            position: "relative",
            display: "inline-block"
          },
          content: {
            position: "relative"
          },
          bg: {
            absolute: "0px 0px 0px 0px",
            boxShadow: "0 " + zDepth + "px " + zDepth * 4 + "px rgba(0,0,0,.24)",
            borderRadius: radius,
            background
          }
        },
        "zDepth-0": {
          bg: {
            boxShadow: "none"
          }
        },
        "zDepth-1": {
          bg: {
            boxShadow: "0 2px 10px rgba(0,0,0,.12), 0 2px 5px rgba(0,0,0,.16)"
          }
        },
        "zDepth-2": {
          bg: {
            boxShadow: "0 6px 20px rgba(0,0,0,.19), 0 8px 17px rgba(0,0,0,.2)"
          }
        },
        "zDepth-3": {
          bg: {
            boxShadow: "0 17px 50px rgba(0,0,0,.19), 0 12px 15px rgba(0,0,0,.24)"
          }
        },
        "zDepth-4": {
          bg: {
            boxShadow: "0 25px 55px rgba(0,0,0,.21), 0 16px 28px rgba(0,0,0,.22)"
          }
        },
        "zDepth-5": {
          bg: {
            boxShadow: "0 40px 77px rgba(0,0,0,.22), 0 27px 24px rgba(0,0,0,.2)"
          }
        },
        "square": {
          bg: {
            borderRadius: "0"
          }
        },
        "circle": {
          bg: {
            borderRadius: "50%"
          }
        }
      }, passedStyles), { "zDepth-1": zDepth === 1 });
      return _react2.default.createElement(
        "div",
        { style: styles.wrap },
        _react2.default.createElement("div", { style: styles.bg }),
        _react2.default.createElement(
          "div",
          { style: styles.content },
          children
        )
      );
    };
    Raised.propTypes = {
      background: _propTypes2.default.string,
      zDepth: _propTypes2.default.oneOf([0, 1, 2, 3, 4, 5]),
      radius: _propTypes2.default.number,
      styles: _propTypes2.default.object
    };
    Raised.defaultProps = {
      background: "#fff",
      zDepth: 1,
      radius: 2,
      styles: {}
    };
    exports.default = Raised;
  }
});

// ../../node_modules/lodash/throttle.js
var require_throttle = __commonJS({
  "../../node_modules/lodash/throttle.js"(exports, module) {
    var debounce = require_debounce();
    var isObject = require_isObject();
    var FUNC_ERROR_TEXT = "Expected a function";
    function throttle(func, wait, options) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    module.exports = throttle;
  }
});

// ../../node_modules/react-color/lib/helpers/saturation.js
var require_saturation = __commonJS({
  "../../node_modules/react-color/lib/helpers/saturation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var calculateChange = exports.calculateChange = function calculateChange2(e, hsl, container) {
      var _container$getBoundin = container.getBoundingClientRect(), containerWidth = _container$getBoundin.width, containerHeight = _container$getBoundin.height;
      var x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
      var y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
      var left = x - (container.getBoundingClientRect().left + window.pageXOffset);
      var top = y - (container.getBoundingClientRect().top + window.pageYOffset);
      if (left < 0) {
        left = 0;
      } else if (left > containerWidth) {
        left = containerWidth;
      }
      if (top < 0) {
        top = 0;
      } else if (top > containerHeight) {
        top = containerHeight;
      }
      var saturation = left / containerWidth;
      var bright = 1 - top / containerHeight;
      return {
        h: hsl.h,
        s: saturation,
        v: bright,
        a: hsl.a,
        source: "hsv"
      };
    };
  }
});

// ../../node_modules/react-color/lib/components/common/Saturation.js
var require_Saturation = __commonJS({
  "../../node_modules/react-color/lib/components/common/Saturation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Saturation = void 0;
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _throttle = require_throttle();
    var _throttle2 = _interopRequireDefault(_throttle);
    var _saturation = require_saturation();
    var saturation = _interopRequireWildcard(_saturation);
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var Saturation = exports.Saturation = function(_ref) {
      _inherits(Saturation2, _ref);
      function Saturation2(props) {
        _classCallCheck(this, Saturation2);
        var _this = _possibleConstructorReturn(this, (Saturation2.__proto__ || Object.getPrototypeOf(Saturation2)).call(this, props));
        _this.handleChange = function(e) {
          typeof _this.props.onChange === "function" && _this.throttle(_this.props.onChange, saturation.calculateChange(e, _this.props.hsl, _this.container), e);
        };
        _this.handleMouseDown = function(e) {
          _this.handleChange(e);
          var renderWindow = _this.getContainerRenderWindow();
          renderWindow.addEventListener("mousemove", _this.handleChange);
          renderWindow.addEventListener("mouseup", _this.handleMouseUp);
        };
        _this.handleMouseUp = function() {
          _this.unbindEventListeners();
        };
        _this.throttle = (0, _throttle2.default)(function(fn, data, e) {
          fn(data, e);
        }, 50);
        return _this;
      }
      _createClass(Saturation2, [{
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.throttle.cancel();
          this.unbindEventListeners();
        }
      }, {
        key: "getContainerRenderWindow",
        value: function getContainerRenderWindow() {
          var container = this.container;
          var renderWindow = window;
          while (!renderWindow.document.contains(container) && renderWindow.parent !== renderWindow) {
            renderWindow = renderWindow.parent;
          }
          return renderWindow;
        }
      }, {
        key: "unbindEventListeners",
        value: function unbindEventListeners() {
          var renderWindow = this.getContainerRenderWindow();
          renderWindow.removeEventListener("mousemove", this.handleChange);
          renderWindow.removeEventListener("mouseup", this.handleMouseUp);
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;
          var _ref2 = this.props.style || {}, color = _ref2.color, white = _ref2.white, black = _ref2.black, pointer = _ref2.pointer, circle = _ref2.circle;
          var styles = (0, _reactcss2.default)({
            "default": {
              color: {
                absolute: "0px 0px 0px 0px",
                background: "hsl(" + this.props.hsl.h + ",100%, 50%)",
                borderRadius: this.props.radius
              },
              white: {
                absolute: "0px 0px 0px 0px",
                borderRadius: this.props.radius
              },
              black: {
                absolute: "0px 0px 0px 0px",
                boxShadow: this.props.shadow,
                borderRadius: this.props.radius
              },
              pointer: {
                position: "absolute",
                top: -(this.props.hsv.v * 100) + 100 + "%",
                left: this.props.hsv.s * 100 + "%",
                cursor: "default"
              },
              circle: {
                width: "4px",
                height: "4px",
                boxShadow: "0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0,0,0,.3),\n            0 0 1px 2px rgba(0,0,0,.4)",
                borderRadius: "50%",
                cursor: "hand",
                transform: "translate(-2px, -2px)"
              }
            },
            "custom": {
              color,
              white,
              black,
              pointer,
              circle
            }
          }, { "custom": !!this.props.style });
          return _react2.default.createElement(
            "div",
            {
              style: styles.color,
              ref: function ref(container) {
                return _this2.container = container;
              },
              onMouseDown: this.handleMouseDown,
              onTouchMove: this.handleChange,
              onTouchStart: this.handleChange
            },
            _react2.default.createElement(
              "style",
              null,
              "\n          .saturation-white {\n            background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));\n            background: linear-gradient(to right, #fff, rgba(255,255,255,0));\n          }\n          .saturation-black {\n            background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));\n            background: linear-gradient(to top, #000, rgba(0,0,0,0));\n          }\n        "
            ),
            _react2.default.createElement(
              "div",
              { style: styles.white, className: "saturation-white" },
              _react2.default.createElement("div", { style: styles.black, className: "saturation-black" }),
              _react2.default.createElement(
                "div",
                { style: styles.pointer },
                this.props.pointer ? _react2.default.createElement(this.props.pointer, this.props) : _react2.default.createElement("div", { style: styles.circle })
              )
            )
          );
        }
      }]);
      return Saturation2;
    }(_react.PureComponent || _react.Component);
    exports.default = Saturation;
  }
});

// ../../node_modules/lodash/forEach.js
var require_forEach = __commonJS({
  "../../node_modules/lodash/forEach.js"(exports, module) {
    var arrayEach = require_arrayEach();
    var baseEach = require_baseEach();
    var castFunction = require_castFunction();
    var isArray = require_isArray();
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, castFunction(iteratee));
    }
    module.exports = forEach;
  }
});

// ../../node_modules/lodash/each.js
var require_each = __commonJS({
  "../../node_modules/lodash/each.js"(exports, module) {
    module.exports = require_forEach();
  }
});

// ../../node_modules/tinycolor2/cjs/tinycolor.js
var require_tinycolor = __commonJS({
  "../../node_modules/tinycolor2/cjs/tinycolor.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.tinycolor = factory());
    })(exports, function() {
      "use strict";
      function _typeof(obj) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
          return typeof obj2;
        } : function(obj2) {
          return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        }, _typeof(obj);
      }
      var trimLeft = /^\s+/;
      var trimRight = /\s+$/;
      function tinycolor(color, opts) {
        color = color ? color : "";
        opts = opts || {};
        if (color instanceof tinycolor) {
          return color;
        }
        if (!(this instanceof tinycolor)) {
          return new tinycolor(color, opts);
        }
        var rgb = inputToRGB(color);
        this._originalInput = color, this._r = rgb.r, this._g = rgb.g, this._b = rgb.b, this._a = rgb.a, this._roundA = Math.round(100 * this._a) / 100, this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;
        if (this._r < 1)
          this._r = Math.round(this._r);
        if (this._g < 1)
          this._g = Math.round(this._g);
        if (this._b < 1)
          this._b = Math.round(this._b);
        this._ok = rgb.ok;
      }
      tinycolor.prototype = {
        isDark: function isDark() {
          return this.getBrightness() < 128;
        },
        isLight: function isLight() {
          return !this.isDark();
        },
        isValid: function isValid() {
          return this._ok;
        },
        getOriginalInput: function getOriginalInput() {
          return this._originalInput;
        },
        getFormat: function getFormat() {
          return this._format;
        },
        getAlpha: function getAlpha() {
          return this._a;
        },
        getBrightness: function getBrightness() {
          var rgb = this.toRgb();
          return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1e3;
        },
        getLuminance: function getLuminance() {
          var rgb = this.toRgb();
          var RsRGB, GsRGB, BsRGB, R, G, B;
          RsRGB = rgb.r / 255;
          GsRGB = rgb.g / 255;
          BsRGB = rgb.b / 255;
          if (RsRGB <= 0.03928)
            R = RsRGB / 12.92;
          else
            R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
          if (GsRGB <= 0.03928)
            G = GsRGB / 12.92;
          else
            G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
          if (BsRGB <= 0.03928)
            B = BsRGB / 12.92;
          else
            B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
          return 0.2126 * R + 0.7152 * G + 0.0722 * B;
        },
        setAlpha: function setAlpha(value) {
          this._a = boundAlpha(value);
          this._roundA = Math.round(100 * this._a) / 100;
          return this;
        },
        toHsv: function toHsv() {
          var hsv = rgbToHsv(this._r, this._g, this._b);
          return {
            h: hsv.h * 360,
            s: hsv.s,
            v: hsv.v,
            a: this._a
          };
        },
        toHsvString: function toHsvString() {
          var hsv = rgbToHsv(this._r, this._g, this._b);
          var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
          return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
        },
        toHsl: function toHsl() {
          var hsl = rgbToHsl(this._r, this._g, this._b);
          return {
            h: hsl.h * 360,
            s: hsl.s,
            l: hsl.l,
            a: this._a
          };
        },
        toHslString: function toHslString() {
          var hsl = rgbToHsl(this._r, this._g, this._b);
          var h = Math.round(hsl.h * 360), s = Math.round(hsl.s * 100), l = Math.round(hsl.l * 100);
          return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
        },
        toHex: function toHex(allow3Char) {
          return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function toHexString(allow3Char) {
          return "#" + this.toHex(allow3Char);
        },
        toHex8: function toHex8(allow4Char) {
          return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
        },
        toHex8String: function toHex8String(allow4Char) {
          return "#" + this.toHex8(allow4Char);
        },
        toRgb: function toRgb() {
          return {
            r: Math.round(this._r),
            g: Math.round(this._g),
            b: Math.round(this._b),
            a: this._a
          };
        },
        toRgbString: function toRgbString() {
          return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function toPercentageRgb() {
          return {
            r: Math.round(bound01(this._r, 255) * 100) + "%",
            g: Math.round(bound01(this._g, 255) * 100) + "%",
            b: Math.round(bound01(this._b, 255) * 100) + "%",
            a: this._a
          };
        },
        toPercentageRgbString: function toPercentageRgbString() {
          return this._a == 1 ? "rgb(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function toName() {
          if (this._a === 0) {
            return "transparent";
          }
          if (this._a < 1) {
            return false;
          }
          return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function toFilter(secondColor) {
          var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
          var secondHex8String = hex8String;
          var gradientType = this._gradientType ? "GradientType = 1, " : "";
          if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
          }
          return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
        },
        toString: function toString(format) {
          var formatSet = !!format;
          format = format || this._format;
          var formattedString = false;
          var hasAlpha = this._a < 1 && this._a >= 0;
          var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");
          if (needsAlphaFormat) {
            if (format === "name" && this._a === 0) {
              return this.toName();
            }
            return this.toRgbString();
          }
          if (format === "rgb") {
            formattedString = this.toRgbString();
          }
          if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
          }
          if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
          }
          if (format === "hex3") {
            formattedString = this.toHexString(true);
          }
          if (format === "hex4") {
            formattedString = this.toHex8String(true);
          }
          if (format === "hex8") {
            formattedString = this.toHex8String();
          }
          if (format === "name") {
            formattedString = this.toName();
          }
          if (format === "hsl") {
            formattedString = this.toHslString();
          }
          if (format === "hsv") {
            formattedString = this.toHsvString();
          }
          return formattedString || this.toHexString();
        },
        clone: function clone() {
          return tinycolor(this.toString());
        },
        _applyModification: function _applyModification(fn, args) {
          var color = fn.apply(null, [this].concat([].slice.call(args)));
          this._r = color._r;
          this._g = color._g;
          this._b = color._b;
          this.setAlpha(color._a);
          return this;
        },
        lighten: function lighten() {
          return this._applyModification(_lighten, arguments);
        },
        brighten: function brighten() {
          return this._applyModification(_brighten, arguments);
        },
        darken: function darken() {
          return this._applyModification(_darken, arguments);
        },
        desaturate: function desaturate() {
          return this._applyModification(_desaturate, arguments);
        },
        saturate: function saturate() {
          return this._applyModification(_saturate, arguments);
        },
        greyscale: function greyscale() {
          return this._applyModification(_greyscale, arguments);
        },
        spin: function spin() {
          return this._applyModification(_spin, arguments);
        },
        _applyCombination: function _applyCombination(fn, args) {
          return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function analogous() {
          return this._applyCombination(_analogous, arguments);
        },
        complement: function complement() {
          return this._applyCombination(_complement, arguments);
        },
        monochromatic: function monochromatic() {
          return this._applyCombination(_monochromatic, arguments);
        },
        splitcomplement: function splitcomplement() {
          return this._applyCombination(_splitcomplement, arguments);
        },
        // Disabled until https://github.com/bgrins/TinyColor/issues/254
        // polyad: function (number) {
        //   return this._applyCombination(polyad, [number]);
        // },
        triad: function triad() {
          return this._applyCombination(polyad, [3]);
        },
        tetrad: function tetrad() {
          return this._applyCombination(polyad, [4]);
        }
      };
      tinycolor.fromRatio = function(color, opts) {
        if (_typeof(color) == "object") {
          var newColor = {};
          for (var i in color) {
            if (color.hasOwnProperty(i)) {
              if (i === "a") {
                newColor[i] = color[i];
              } else {
                newColor[i] = convertToPercentage(color[i]);
              }
            }
          }
          color = newColor;
        }
        return tinycolor(color, opts);
      };
      function inputToRGB(color) {
        var rgb = {
          r: 0,
          g: 0,
          b: 0
        };
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format = false;
        if (typeof color == "string") {
          color = stringInputToObject(color);
        }
        if (_typeof(color) == "object") {
          if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
          } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
            s = convertToPercentage(color.s);
            v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, s, v);
            ok = true;
            format = "hsv";
          } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
            s = convertToPercentage(color.s);
            l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, s, l);
            ok = true;
            format = "hsl";
          }
          if (color.hasOwnProperty("a")) {
            a = color.a;
          }
        }
        a = boundAlpha(a);
        return {
          ok,
          format: color.format || format,
          r: Math.min(255, Math.max(rgb.r, 0)),
          g: Math.min(255, Math.max(rgb.g, 0)),
          b: Math.min(255, Math.max(rgb.b, 0)),
          a
        };
      }
      function rgbToRgb(r, g, b) {
        return {
          r: bound01(r, 255) * 255,
          g: bound01(g, 255) * 255,
          b: bound01(b, 255) * 255
        };
      }
      function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
          h = s = 0;
        } else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }
        return {
          h,
          s,
          l
        };
      }
      function hslToRgb(h, s, l) {
        var r, g, b;
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        function hue2rgb(p2, q2, t) {
          if (t < 0)
            t += 1;
          if (t > 1)
            t -= 1;
          if (t < 1 / 6)
            return p2 + (q2 - p2) * 6 * t;
          if (t < 1 / 2)
            return q2;
          if (t < 2 / 3)
            return p2 + (q2 - p2) * (2 / 3 - t) * 6;
          return p2;
        }
        if (s === 0) {
          r = g = b = l;
        } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
          r: r * 255,
          g: g * 255,
          b: b * 255
        };
      }
      function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max == min) {
          h = 0;
        } else {
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }
        return {
          h,
          s,
          v
        };
      }
      function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        var i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];
        return {
          r: r * 255,
          g: g * 255,
          b: b * 255
        };
      }
      function rgbToHex(r, g, b, allow3Char) {
        var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
          return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }
        return hex.join("");
      }
      function rgbaToHex(r, g, b, a, allow4Char) {
        var hex = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16)), pad2(convertDecimalToHex(a))];
        if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
          return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
        }
        return hex.join("");
      }
      function rgbaToArgbHex(r, g, b, a) {
        var hex = [pad2(convertDecimalToHex(a)), pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
        return hex.join("");
      }
      tinycolor.equals = function(color1, color2) {
        if (!color1 || !color2)
          return false;
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
      };
      tinycolor.random = function() {
        return tinycolor.fromRatio({
          r: Math.random(),
          g: Math.random(),
          b: Math.random()
        });
      };
      function _desaturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
      }
      function _saturate(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
      }
      function _greyscale(color) {
        return tinycolor(color).desaturate(100);
      }
      function _lighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
      }
      function _brighten(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var rgb = tinycolor(color).toRgb();
        rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
        rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
        rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
        return tinycolor(rgb);
      }
      function _darken(color, amount) {
        amount = amount === 0 ? 0 : amount || 10;
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
      }
      function _spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (hsl.h + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
      }
      function _complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
      }
      function polyad(color, number) {
        if (isNaN(number) || number <= 0) {
          throw new Error("Argument to polyad must be a positive number");
        }
        var hsl = tinycolor(color).toHsl();
        var result = [tinycolor(color)];
        var step = 360 / number;
        for (var i = 1; i < number; i++) {
          result.push(tinycolor({
            h: (hsl.h + i * step) % 360,
            s: hsl.s,
            l: hsl.l
          }));
        }
        return result;
      }
      function _splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({
          h: (h + 72) % 360,
          s: hsl.s,
          l: hsl.l
        }), tinycolor({
          h: (h + 216) % 360,
          s: hsl.s,
          l: hsl.l
        })];
      }
      function _analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;
        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];
        for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results; ) {
          hsl.h = (hsl.h + part) % 360;
          ret.push(tinycolor(hsl));
        }
        return ret;
      }
      function _monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;
        while (results--) {
          ret.push(tinycolor({
            h,
            s,
            v
          }));
          v = (v + modification) % 1;
        }
        return ret;
      }
      tinycolor.mix = function(color1, color2, amount) {
        amount = amount === 0 ? 0 : amount || 50;
        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();
        var p = amount / 100;
        var rgba = {
          r: (rgb2.r - rgb1.r) * p + rgb1.r,
          g: (rgb2.g - rgb1.g) * p + rgb1.g,
          b: (rgb2.b - rgb1.b) * p + rgb1.b,
          a: (rgb2.a - rgb1.a) * p + rgb1.a
        };
        return tinycolor(rgba);
      };
      tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        return (Math.max(c1.getLuminance(), c2.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c2.getLuminance()) + 0.05);
      };
      tinycolor.isReadable = function(color1, color2, wcag2) {
        var readability = tinycolor.readability(color1, color2);
        var wcag2Parms, out;
        out = false;
        wcag2Parms = validateWCAG2Parms(wcag2);
        switch (wcag2Parms.level + wcag2Parms.size) {
          case "AAsmall":
          case "AAAlarge":
            out = readability >= 4.5;
            break;
          case "AAlarge":
            out = readability >= 3;
            break;
          case "AAAsmall":
            out = readability >= 7;
            break;
        }
        return out;
      };
      tinycolor.mostReadable = function(baseColor, colorList, args) {
        var bestColor = null;
        var bestScore = 0;
        var readability;
        var includeFallbackColors, level, size;
        args = args || {};
        includeFallbackColors = args.includeFallbackColors;
        level = args.level;
        size = args.size;
        for (var i = 0; i < colorList.length; i++) {
          readability = tinycolor.readability(baseColor, colorList[i]);
          if (readability > bestScore) {
            bestScore = readability;
            bestColor = tinycolor(colorList[i]);
          }
        }
        if (tinycolor.isReadable(baseColor, bestColor, {
          level,
          size
        }) || !includeFallbackColors) {
          return bestColor;
        } else {
          args.includeFallbackColors = false;
          return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
        }
      };
      var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
      };
      var hexNames = tinycolor.hexNames = flip(names);
      function flip(o) {
        var flipped = {};
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
          }
        }
        return flipped;
      }
      function boundAlpha(a) {
        a = parseFloat(a);
        if (isNaN(a) || a < 0 || a > 1) {
          a = 1;
        }
        return a;
      }
      function bound01(n, max) {
        if (isOnePointZero(n))
          n = "100%";
        var processPercent = isPercentage(n);
        n = Math.min(max, Math.max(0, parseFloat(n)));
        if (processPercent) {
          n = parseInt(n * max, 10) / 100;
        }
        if (Math.abs(n - max) < 1e-6) {
          return 1;
        }
        return n % max / parseFloat(max);
      }
      function clamp01(val) {
        return Math.min(1, Math.max(0, val));
      }
      function parseIntFromHex(val) {
        return parseInt(val, 16);
      }
      function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
      }
      function isPercentage(n) {
        return typeof n === "string" && n.indexOf("%") != -1;
      }
      function pad2(c) {
        return c.length == 1 ? "0" + c : "" + c;
      }
      function convertToPercentage(n) {
        if (n <= 1) {
          n = n * 100 + "%";
        }
        return n;
      }
      function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
      }
      function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
      }
      var matchers = function() {
        var CSS_INTEGER = "[-\\+]?\\d+%?";
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        return {
          CSS_UNIT: new RegExp(CSS_UNIT),
          rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
          rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
          hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
          hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
          hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
          hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
          hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
          hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
          hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
          hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
      }();
      function isValidCSSUnit(color) {
        return !!matchers.CSS_UNIT.exec(color);
      }
      function stringInputToObject(color) {
        color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
        var named = false;
        if (names[color]) {
          color = names[color];
          named = true;
        } else if (color == "transparent") {
          return {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
            format: "name"
          };
        }
        var match;
        if (match = matchers.rgb.exec(color)) {
          return {
            r: match[1],
            g: match[2],
            b: match[3]
          };
        }
        if (match = matchers.rgba.exec(color)) {
          return {
            r: match[1],
            g: match[2],
            b: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hsl.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            l: match[3]
          };
        }
        if (match = matchers.hsla.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            l: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hsv.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            v: match[3]
          };
        }
        if (match = matchers.hsva.exec(color)) {
          return {
            h: match[1],
            s: match[2],
            v: match[3],
            a: match[4]
          };
        }
        if (match = matchers.hex8.exec(color)) {
          return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            a: convertHexToDecimal(match[4]),
            format: named ? "name" : "hex8"
          };
        }
        if (match = matchers.hex6.exec(color)) {
          return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
          };
        }
        if (match = matchers.hex4.exec(color)) {
          return {
            r: parseIntFromHex(match[1] + "" + match[1]),
            g: parseIntFromHex(match[2] + "" + match[2]),
            b: parseIntFromHex(match[3] + "" + match[3]),
            a: convertHexToDecimal(match[4] + "" + match[4]),
            format: named ? "name" : "hex8"
          };
        }
        if (match = matchers.hex3.exec(color)) {
          return {
            r: parseIntFromHex(match[1] + "" + match[1]),
            g: parseIntFromHex(match[2] + "" + match[2]),
            b: parseIntFromHex(match[3] + "" + match[3]),
            format: named ? "name" : "hex"
          };
        }
        return false;
      }
      function validateWCAG2Parms(parms) {
        var level, size;
        parms = parms || {
          level: "AA",
          size: "small"
        };
        level = (parms.level || "AA").toUpperCase();
        size = (parms.size || "small").toLowerCase();
        if (level !== "AA" && level !== "AAA") {
          level = "AA";
        }
        if (size !== "small" && size !== "large") {
          size = "small";
        }
        return {
          level,
          size
        };
      }
      return tinycolor;
    });
  }
});

// ../../node_modules/react-color/lib/helpers/color.js
var require_color = __commonJS({
  "../../node_modules/react-color/lib/helpers/color.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.isvalidColorString = exports.red = exports.getContrastingColor = exports.isValidHex = exports.toState = exports.simpleCheckForValidColor = void 0;
    var _each = require_each();
    var _each2 = _interopRequireDefault(_each);
    var _tinycolor = require_tinycolor();
    var _tinycolor2 = _interopRequireDefault(_tinycolor);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var simpleCheckForValidColor = exports.simpleCheckForValidColor = function simpleCheckForValidColor2(data) {
      var keysToCheck = ["r", "g", "b", "a", "h", "s", "l", "v"];
      var checked = 0;
      var passed = 0;
      (0, _each2.default)(keysToCheck, function(letter) {
        if (data[letter]) {
          checked += 1;
          if (!isNaN(data[letter])) {
            passed += 1;
          }
          if (letter === "s" || letter === "l") {
            var percentPatt = /^\d+%$/;
            if (percentPatt.test(data[letter])) {
              passed += 1;
            }
          }
        }
      });
      return checked === passed ? data : false;
    };
    var toState = exports.toState = function toState2(data, oldHue) {
      var color = data.hex ? (0, _tinycolor2.default)(data.hex) : (0, _tinycolor2.default)(data);
      var hsl = color.toHsl();
      var hsv = color.toHsv();
      var rgb = color.toRgb();
      var hex = color.toHex();
      if (hsl.s === 0) {
        hsl.h = oldHue || 0;
        hsv.h = oldHue || 0;
      }
      var transparent = hex === "000000" && rgb.a === 0;
      return {
        hsl,
        hex: transparent ? "transparent" : "#" + hex,
        rgb,
        hsv,
        oldHue: data.h || oldHue || hsl.h,
        source: data.source
      };
    };
    var isValidHex = exports.isValidHex = function isValidHex2(hex) {
      if (hex === "transparent") {
        return true;
      }
      var lh = String(hex).charAt(0) === "#" ? 1 : 0;
      return hex.length !== 4 + lh && hex.length < 7 + lh && (0, _tinycolor2.default)(hex).isValid();
    };
    var getContrastingColor = exports.getContrastingColor = function getContrastingColor2(data) {
      if (!data) {
        return "#fff";
      }
      var col = toState(data);
      if (col.hex === "transparent") {
        return "rgba(0,0,0,0.4)";
      }
      var yiq = (col.rgb.r * 299 + col.rgb.g * 587 + col.rgb.b * 114) / 1e3;
      return yiq >= 128 ? "#000" : "#fff";
    };
    var red = exports.red = {
      hsl: { a: 1, h: 0, l: 0.5, s: 1 },
      hex: "#ff0000",
      rgb: { r: 255, g: 0, b: 0, a: 1 },
      hsv: { h: 0, s: 1, v: 1, a: 1 }
    };
    var isvalidColorString = exports.isvalidColorString = function isvalidColorString2(string, type) {
      var stringWithoutDegree = string.replace("°", "");
      return (0, _tinycolor2.default)(type + " (" + stringWithoutDegree + ")")._ok;
    };
  }
});

// ../../node_modules/react-color/lib/components/common/ColorWrap.js
var require_ColorWrap = __commonJS({
  "../../node_modules/react-color/lib/components/common/ColorWrap.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ColorWrap = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _debounce = require_debounce();
    var _debounce2 = _interopRequireDefault(_debounce);
    var _color = require_color();
    var color = _interopRequireWildcard(_color);
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var ColorWrap = exports.ColorWrap = function ColorWrap2(Picker) {
      var ColorPicker = function(_ref) {
        _inherits(ColorPicker2, _ref);
        function ColorPicker2(props) {
          _classCallCheck(this, ColorPicker2);
          var _this = _possibleConstructorReturn(this, (ColorPicker2.__proto__ || Object.getPrototypeOf(ColorPicker2)).call(this));
          _this.handleChange = function(data, event) {
            var isValidColor = color.simpleCheckForValidColor(data);
            if (isValidColor) {
              var colors = color.toState(data, data.h || _this.state.oldHue);
              _this.setState(colors);
              _this.props.onChangeComplete && _this.debounce(_this.props.onChangeComplete, colors, event);
              _this.props.onChange && _this.props.onChange(colors, event);
            }
          };
          _this.handleSwatchHover = function(data, event) {
            var isValidColor = color.simpleCheckForValidColor(data);
            if (isValidColor) {
              var colors = color.toState(data, data.h || _this.state.oldHue);
              _this.props.onSwatchHover && _this.props.onSwatchHover(colors, event);
            }
          };
          _this.state = _extends({}, color.toState(props.color, 0));
          _this.debounce = (0, _debounce2.default)(function(fn, data, event) {
            fn(data, event);
          }, 100);
          return _this;
        }
        _createClass(ColorPicker2, [{
          key: "render",
          value: function render() {
            var optionalEvents = {};
            if (this.props.onSwatchHover) {
              optionalEvents.onSwatchHover = this.handleSwatchHover;
            }
            return _react2.default.createElement(Picker, _extends({}, this.props, this.state, {
              onChange: this.handleChange
            }, optionalEvents));
          }
        }], [{
          key: "getDerivedStateFromProps",
          value: function getDerivedStateFromProps(nextProps, state) {
            return _extends({}, color.toState(nextProps.color, state.oldHue));
          }
        }]);
        return ColorPicker2;
      }(_react.PureComponent || _react.Component);
      ColorPicker.propTypes = _extends({}, Picker.propTypes);
      ColorPicker.defaultProps = _extends({}, Picker.defaultProps, {
        color: {
          h: 250,
          s: 0.5,
          l: 0.2,
          a: 1
        }
      });
      return ColorPicker;
    };
    exports.default = ColorWrap;
  }
});

// ../../node_modules/react-color/lib/helpers/interaction.js
var require_interaction = __commonJS({
  "../../node_modules/react-color/lib/helpers/interaction.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.handleFocus = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var handleFocus = exports.handleFocus = function handleFocus2(Component) {
      var Span = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "span";
      return function(_React$Component) {
        _inherits(Focus, _React$Component);
        function Focus() {
          var _ref;
          var _temp, _this, _ret;
          _classCallCheck(this, Focus);
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Focus.__proto__ || Object.getPrototypeOf(Focus)).call.apply(_ref, [this].concat(args))), _this), _this.state = { focus: false }, _this.handleFocus = function() {
            return _this.setState({ focus: true });
          }, _this.handleBlur = function() {
            return _this.setState({ focus: false });
          }, _temp), _possibleConstructorReturn(_this, _ret);
        }
        _createClass(Focus, [{
          key: "render",
          value: function render() {
            return _react2.default.createElement(
              Span,
              { onFocus: this.handleFocus, onBlur: this.handleBlur },
              _react2.default.createElement(Component, _extends({}, this.props, this.state))
            );
          }
        }]);
        return Focus;
      }(_react2.default.Component);
    };
  }
});

// ../../node_modules/react-color/lib/components/common/Swatch.js
var require_Swatch = __commonJS({
  "../../node_modules/react-color/lib/components/common/Swatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Swatch = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _interaction = require_interaction();
    var _Checkboard = require_Checkboard();
    var _Checkboard2 = _interopRequireDefault(_Checkboard);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var ENTER = 13;
    var Swatch = exports.Swatch = function Swatch2(_ref) {
      var color = _ref.color, style = _ref.style, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
      } : _ref$onClick, onHover = _ref.onHover, _ref$title = _ref.title, title = _ref$title === void 0 ? color : _ref$title, children = _ref.children, focus = _ref.focus, _ref$focusStyle = _ref.focusStyle, focusStyle = _ref$focusStyle === void 0 ? {} : _ref$focusStyle;
      var transparent = color === "transparent";
      var styles = (0, _reactcss2.default)({
        default: {
          swatch: _extends({
            background: color,
            height: "100%",
            width: "100%",
            cursor: "pointer",
            position: "relative",
            outline: "none"
          }, style, focus ? focusStyle : {})
        }
      });
      var handleClick = function handleClick2(e) {
        return onClick(color, e);
      };
      var handleKeyDown = function handleKeyDown2(e) {
        return e.keyCode === ENTER && onClick(color, e);
      };
      var handleHover = function handleHover2(e) {
        return onHover(color, e);
      };
      var optionalEvents = {};
      if (onHover) {
        optionalEvents.onMouseOver = handleHover;
      }
      return _react2.default.createElement(
        "div",
        _extends({
          style: styles.swatch,
          onClick: handleClick,
          title,
          tabIndex: 0,
          onKeyDown: handleKeyDown
        }, optionalEvents),
        children,
        transparent && _react2.default.createElement(_Checkboard2.default, {
          borderRadius: styles.swatch.borderRadius,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)"
        })
      );
    };
    exports.default = (0, _interaction.handleFocus)(Swatch);
  }
});

// ../../node_modules/react-color/lib/components/common/index.js
var require_common = __commonJS({
  "../../node_modules/react-color/lib/components/common/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _Alpha = require_Alpha();
    Object.defineProperty(exports, "Alpha", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Alpha).default;
      }
    });
    var _Checkboard = require_Checkboard();
    Object.defineProperty(exports, "Checkboard", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Checkboard).default;
      }
    });
    var _EditableInput = require_EditableInput();
    Object.defineProperty(exports, "EditableInput", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_EditableInput).default;
      }
    });
    var _Hue = require_Hue();
    Object.defineProperty(exports, "Hue", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Hue).default;
      }
    });
    var _Raised = require_Raised();
    Object.defineProperty(exports, "Raised", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Raised).default;
      }
    });
    var _Saturation = require_Saturation();
    Object.defineProperty(exports, "Saturation", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Saturation).default;
      }
    });
    var _ColorWrap = require_ColorWrap();
    Object.defineProperty(exports, "ColorWrap", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_ColorWrap).default;
      }
    });
    var _Swatch = require_Swatch();
    Object.defineProperty(exports, "Swatch", {
      enumerable: true,
      get: function get() {
        return _interopRequireDefault(_Swatch).default;
      }
    });
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// ../../node_modules/react-color/lib/components/sketch/SketchFields.js
var require_SketchFields = __commonJS({
  "../../node_modules/react-color/lib/components/sketch/SketchFields.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SketchFields = void 0;
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _color = require_color();
    var color = _interopRequireWildcard(_color);
    var _common = require_common();
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var SketchFields = exports.SketchFields = function SketchFields2(_ref) {
      var onChange = _ref.onChange, rgb = _ref.rgb, hsl = _ref.hsl, hex = _ref.hex, disableAlpha = _ref.disableAlpha;
      var styles = (0, _reactcss2.default)({
        "default": {
          fields: {
            display: "flex",
            paddingTop: "4px"
          },
          single: {
            flex: "1",
            paddingLeft: "6px"
          },
          alpha: {
            flex: "1",
            paddingLeft: "6px"
          },
          double: {
            flex: "2"
          },
          input: {
            width: "80%",
            padding: "4px 10% 3px",
            border: "none",
            boxShadow: "inset 0 0 0 1px #ccc",
            fontSize: "11px"
          },
          label: {
            display: "block",
            textAlign: "center",
            fontSize: "11px",
            color: "#222",
            paddingTop: "3px",
            paddingBottom: "4px",
            textTransform: "capitalize"
          }
        },
        "disableAlpha": {
          alpha: {
            display: "none"
          }
        }
      }, { disableAlpha });
      var handleChange = function handleChange2(data, e) {
        if (data.hex) {
          color.isValidHex(data.hex) && onChange({
            hex: data.hex,
            source: "hex"
          }, e);
        } else if (data.r || data.g || data.b) {
          onChange({
            r: data.r || rgb.r,
            g: data.g || rgb.g,
            b: data.b || rgb.b,
            a: rgb.a,
            source: "rgb"
          }, e);
        } else if (data.a) {
          if (data.a < 0) {
            data.a = 0;
          } else if (data.a > 100) {
            data.a = 100;
          }
          data.a /= 100;
          onChange({
            h: hsl.h,
            s: hsl.s,
            l: hsl.l,
            a: data.a,
            source: "rgb"
          }, e);
        }
      };
      return _react2.default.createElement(
        "div",
        { style: styles.fields, className: "flexbox-fix" },
        _react2.default.createElement(
          "div",
          { style: styles.double },
          _react2.default.createElement(_common.EditableInput, {
            style: { input: styles.input, label: styles.label },
            label: "hex",
            value: hex.replace("#", ""),
            onChange: handleChange
          })
        ),
        _react2.default.createElement(
          "div",
          { style: styles.single },
          _react2.default.createElement(_common.EditableInput, {
            style: { input: styles.input, label: styles.label },
            label: "r",
            value: rgb.r,
            onChange: handleChange,
            dragLabel: "true",
            dragMax: "255"
          })
        ),
        _react2.default.createElement(
          "div",
          { style: styles.single },
          _react2.default.createElement(_common.EditableInput, {
            style: { input: styles.input, label: styles.label },
            label: "g",
            value: rgb.g,
            onChange: handleChange,
            dragLabel: "true",
            dragMax: "255"
          })
        ),
        _react2.default.createElement(
          "div",
          { style: styles.single },
          _react2.default.createElement(_common.EditableInput, {
            style: { input: styles.input, label: styles.label },
            label: "b",
            value: rgb.b,
            onChange: handleChange,
            dragLabel: "true",
            dragMax: "255"
          })
        ),
        _react2.default.createElement(
          "div",
          { style: styles.alpha },
          _react2.default.createElement(_common.EditableInput, {
            style: { input: styles.input, label: styles.label },
            label: "a",
            value: Math.round(rgb.a * 100),
            onChange: handleChange,
            dragLabel: "true",
            dragMax: "100"
          })
        )
      );
    };
    exports.default = SketchFields;
  }
});

// ../../node_modules/react-color/lib/components/sketch/SketchPresetColors.js
var require_SketchPresetColors = __commonJS({
  "../../node_modules/react-color/lib/components/sketch/SketchPresetColors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SketchPresetColors = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _common = require_common();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var SketchPresetColors = exports.SketchPresetColors = function SketchPresetColors2(_ref) {
      var colors = _ref.colors, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
      } : _ref$onClick, onSwatchHover = _ref.onSwatchHover;
      var styles = (0, _reactcss2.default)({
        "default": {
          colors: {
            margin: "0 -10px",
            padding: "10px 0 0 10px",
            borderTop: "1px solid #eee",
            display: "flex",
            flexWrap: "wrap",
            position: "relative"
          },
          swatchWrap: {
            width: "16px",
            height: "16px",
            margin: "0 10px 10px 0"
          },
          swatch: {
            borderRadius: "3px",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)"
          }
        },
        "no-presets": {
          colors: {
            display: "none"
          }
        }
      }, {
        "no-presets": !colors || !colors.length
      });
      var handleClick = function handleClick2(hex, e) {
        onClick({
          hex,
          source: "hex"
        }, e);
      };
      return _react2.default.createElement(
        "div",
        { style: styles.colors, className: "flexbox-fix" },
        colors.map(function(colorObjOrString) {
          var c = typeof colorObjOrString === "string" ? { color: colorObjOrString } : colorObjOrString;
          var key = "" + c.color + (c.title || "");
          return _react2.default.createElement(
            "div",
            { key, style: styles.swatchWrap },
            _react2.default.createElement(_common.Swatch, _extends({}, c, {
              style: styles.swatch,
              onClick: handleClick,
              onHover: onSwatchHover,
              focusStyle: {
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15), 0 0 4px " + c.color
              }
            }))
          );
        })
      );
    };
    SketchPresetColors.propTypes = {
      colors: _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        color: _propTypes2.default.string,
        title: _propTypes2.default.string
      })])).isRequired
    };
    exports.default = SketchPresetColors;
  }
});

// ../../node_modules/react-color/lib/components/sketch/Sketch.js
var require_Sketch = __commonJS({
  "../../node_modules/react-color/lib/components/sketch/Sketch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Sketch = void 0;
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    var _react = require_react();
    var _react2 = _interopRequireDefault(_react);
    var _propTypes = require_prop_types();
    var _propTypes2 = _interopRequireDefault(_propTypes);
    var _reactcss = require_lib();
    var _reactcss2 = _interopRequireDefault(_reactcss);
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    var _common = require_common();
    var _SketchFields = require_SketchFields();
    var _SketchFields2 = _interopRequireDefault(_SketchFields);
    var _SketchPresetColors = require_SketchPresetColors();
    var _SketchPresetColors2 = _interopRequireDefault(_SketchPresetColors);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var Sketch = exports.Sketch = function Sketch2(_ref) {
      var width = _ref.width, rgb = _ref.rgb, hex = _ref.hex, hsv = _ref.hsv, hsl = _ref.hsl, onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, disableAlpha = _ref.disableAlpha, presetColors = _ref.presetColors, renderers = _ref.renderers, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
      var styles = (0, _reactcss2.default)((0, _merge2.default)({
        "default": _extends({
          picker: {
            width,
            padding: "10px 10px 0",
            boxSizing: "initial",
            background: "#fff",
            borderRadius: "4px",
            boxShadow: "0 0 0 1px rgba(0,0,0,.15), 0 8px 16px rgba(0,0,0,.15)"
          },
          saturation: {
            width: "100%",
            paddingBottom: "75%",
            position: "relative",
            overflow: "hidden"
          },
          Saturation: {
            radius: "3px",
            shadow: "inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)"
          },
          controls: {
            display: "flex"
          },
          sliders: {
            padding: "4px 0",
            flex: "1"
          },
          color: {
            width: "24px",
            height: "24px",
            position: "relative",
            marginTop: "4px",
            marginLeft: "4px",
            borderRadius: "3px"
          },
          activeColor: {
            absolute: "0px 0px 0px 0px",
            borderRadius: "2px",
            background: "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)"
          },
          hue: {
            position: "relative",
            height: "10px",
            overflow: "hidden"
          },
          Hue: {
            radius: "2px",
            shadow: "inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)"
          },
          alpha: {
            position: "relative",
            height: "10px",
            marginTop: "4px",
            overflow: "hidden"
          },
          Alpha: {
            radius: "2px",
            shadow: "inset 0 0 0 1px rgba(0,0,0,.15), inset 0 0 4px rgba(0,0,0,.25)"
          }
        }, passedStyles),
        "disableAlpha": {
          color: {
            height: "10px"
          },
          hue: {
            height: "10px"
          },
          alpha: {
            display: "none"
          }
        }
      }, passedStyles), { disableAlpha });
      return _react2.default.createElement(
        "div",
        { style: styles.picker, className: "sketch-picker " + className },
        _react2.default.createElement(
          "div",
          { style: styles.saturation },
          _react2.default.createElement(_common.Saturation, {
            style: styles.Saturation,
            hsl,
            hsv,
            onChange
          })
        ),
        _react2.default.createElement(
          "div",
          { style: styles.controls, className: "flexbox-fix" },
          _react2.default.createElement(
            "div",
            { style: styles.sliders },
            _react2.default.createElement(
              "div",
              { style: styles.hue },
              _react2.default.createElement(_common.Hue, {
                style: styles.Hue,
                hsl,
                onChange
              })
            ),
            _react2.default.createElement(
              "div",
              { style: styles.alpha },
              _react2.default.createElement(_common.Alpha, {
                style: styles.Alpha,
                rgb,
                hsl,
                renderers,
                onChange
              })
            )
          ),
          _react2.default.createElement(
            "div",
            { style: styles.color },
            _react2.default.createElement(_common.Checkboard, null),
            _react2.default.createElement("div", { style: styles.activeColor })
          )
        ),
        _react2.default.createElement(_SketchFields2.default, {
          rgb,
          hsl,
          hex,
          onChange,
          disableAlpha
        }),
        _react2.default.createElement(_SketchPresetColors2.default, {
          colors: presetColors,
          onClick: onChange,
          onSwatchHover
        })
      );
    };
    Sketch.propTypes = {
      disableAlpha: _propTypes2.default.bool,
      width: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
      styles: _propTypes2.default.object
    };
    Sketch.defaultProps = {
      disableAlpha: false,
      width: 200,
      styles: {},
      presetColors: ["#D0021B", "#F5A623", "#F8E71C", "#8B572A", "#7ED321", "#417505", "#BD10E0", "#9013FE", "#4A90E2", "#50E3C2", "#B8E986", "#000000", "#4A4A4A", "#9B9B9B", "#FFFFFF"]
    };
    exports.default = (0, _common.ColorWrap)(Sketch);
  }
});

// ../../node_modules/react-color/lib/Sketch.js
var require_Sketch2 = __commonJS({
  "../../node_modules/react-color/lib/Sketch.js"(exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _Sketch = require_Sketch();
    var _Sketch2 = _interopRequireDefault(_Sketch);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _Sketch2.default;
  }
});
export default require_Sketch2();
//# sourceMappingURL=react-color_lib_Sketch.js.map
