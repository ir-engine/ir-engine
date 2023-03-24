import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/react-json-tree/umd/react-json-tree.js
var require_react_json_tree = __commonJS({
  "../../node_modules/react-json-tree/umd/react-json-tree.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory(require_react());
      else if (typeof define === "function" && define.amd)
        define(["react"], factory);
      else if (typeof exports === "object")
        exports["ReactJsonTree"] = factory(require_react());
      else
        root["ReactJsonTree"] = factory(root["React"]);
    })(self, function(__WEBPACK_EXTERNAL_MODULE_react__) {
      return (
        /******/
        (() => {
          var __webpack_modules__ = {
            /***/
            "../react-base16-styling/lib/colorConverters.js": (
              /*!******************************************************!*\
                !*** ../react-base16-styling/lib/colorConverters.js ***!
                \******************************************************/
              /***/
              (__unused_webpack_module, exports) => {
                "use strict";
                eval('\n\nObject.defineProperty(exports, "__esModule", ({\n  value: true\n}));\nexports.rgb2yuv = rgb2yuv;\nexports.yuv2rgb = yuv2rgb;\n\nfunction yuv2rgb(yuv) {\n  var y = yuv[0],\n      u = yuv[1],\n      v = yuv[2];\n  var r, g, b;\n  r = y * 1 + u * 0 + v * 1.13983;\n  g = y * 1 + u * -0.39465 + v * -0.5806;\n  b = y * 1 + u * 2.02311 + v * 0;\n  r = Math.min(Math.max(0, r), 1);\n  g = Math.min(Math.max(0, g), 1);\n  b = Math.min(Math.max(0, b), 1);\n  return [r * 255, g * 255, b * 255];\n}\n\nfunction rgb2yuv(rgb) {\n  var r = rgb[0] / 255,\n      g = rgb[1] / 255,\n      b = rgb[2] / 255;\n  var y = r * 0.299 + g * 0.587 + b * 0.114;\n  var u = r * -0.14713 + g * -0.28886 + b * 0.436;\n  var v = r * 0.615 + g * -0.51499 + b * -0.10001;\n  return [y, u, v];\n}\n\n//# sourceURL=webpack://ReactJsonTree/../react-base16-styling/lib/colorConverters.js?');
              }
            ),
            /***/
            "../react-base16-styling/lib/index.js": (
              /*!********************************************!*\
                !*** ../react-base16-styling/lib/index.js ***!
                \********************************************/
              /***/
              (__unused_webpack_module, exports, __webpack_require__) => {
                "use strict";
                eval(`

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
var _exportNames = {
  invertBase16Theme: true,
  createStyling: true,
  getBase16Theme: true,
  invertTheme: true,
  Base16Theme: true
};
Object.defineProperty(exports, "Base16Theme", ({
  enumerable: true,
  get: function get() {
    return base16.Base16Theme;
  }
}));
exports.invertTheme = exports.invertBase16Theme = exports.getBase16Theme = exports.createStyling = void 0;

var base16 = _interopRequireWildcard(__webpack_require__(/*! base16 */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/index.js"));

var _color = _interopRequireDefault(__webpack_require__(/*! color */ "../../.yarn/cache/color-npm-3.2.1-568cf1014f-f81220e8b7.zip/node_modules/color/index.js"));

var _lodash = _interopRequireDefault(__webpack_require__(/*! lodash.curry */ "../../.yarn/cache/lodash.curry-npm-4.1.1-b573bff179-9192b70fe7.zip/node_modules/lodash.curry/index.js"));

var _colorConverters = __webpack_require__(/*! ./colorConverters */ "../react-base16-styling/lib/colorConverters.js");

var _types = __webpack_require__(/*! ./types */ "../react-base16-styling/lib/types.js");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _types[key];
    }
  });
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache(nodeInterop);

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

var DEFAULT_BASE16 = base16["default"];
var BASE16_KEYS = Object.keys(DEFAULT_BASE16); // we need a correcting factor, so that a dark, but not black background color
// converts to bright enough inversed color

var flip = function flip(x) {
  return x < 0.25 ? 1 : x < 0.5 ? 0.9 - x : 1.1 - x;
};

var invertColor = function invertColor(hexString) {
  var color = (0, _color["default"])(hexString);

  var _rgb2yuv = (0, _colorConverters.rgb2yuv)(color.array()),
      _rgb2yuv2 = _slicedToArray(_rgb2yuv, 3),
      y = _rgb2yuv2[0],
      u = _rgb2yuv2[1],
      v = _rgb2yuv2[2];

  var flippedYuv = [flip(y), u, v];
  var rgb = (0, _colorConverters.yuv2rgb)(flippedYuv);
  return _color["default"].rgb(rgb).hex();
};

var merger = function merger(styling) {
  return function (prevStyling) {
    return {
      className: [prevStyling.className, styling.className].filter(Boolean).join(' '),
      style: _objectSpread(_objectSpread({}, prevStyling.style || {}), styling.style || {})
    };
  };
};

var mergeStyling = function mergeStyling(customStyling, defaultStyling) {
  if (customStyling === undefined) {
    return defaultStyling;
  }

  if (defaultStyling === undefined) {
    return customStyling;
  }

  var customType = _typeof(customStyling);

  var defaultType = _typeof(defaultStyling);

  switch (customType) {
    case 'string':
      switch (defaultType) {
        case 'string':
          return [defaultStyling, customStyling].filter(Boolean).join(' ');

        case 'object':
          return merger({
            className: customStyling,
            style: defaultStyling
          });

        case 'function':
          return function (styling) {
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

            return merger({
              className: customStyling
            })(defaultStyling.apply(void 0, [styling].concat(args)));
          };
      }

      break;

    case 'object':
      switch (defaultType) {
        case 'string':
          return merger({
            className: defaultStyling,
            style: customStyling
          });

        case 'object':
          return _objectSpread(_objectSpread({}, defaultStyling), customStyling);

        case 'function':
          return function (styling) {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }

            return merger({
              style: customStyling
            })(defaultStyling.apply(void 0, [styling].concat(args)));
          };
      }

      break;

    case 'function':
      switch (defaultType) {
        case 'string':
          return function (styling) {
            for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
              args[_key3 - 1] = arguments[_key3];
            }

            return customStyling.apply(void 0, [merger(styling)({
              className: defaultStyling
            })].concat(args));
          };

        case 'object':
          return function (styling) {
            for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
              args[_key4 - 1] = arguments[_key4];
            }

            return customStyling.apply(void 0, [merger(styling)({
              style: defaultStyling
            })].concat(args));
          };

        case 'function':
          return function (styling) {
            for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
              args[_key5 - 1] = arguments[_key5];
            }

            return customStyling.apply(void 0, [defaultStyling.apply(void 0, [styling].concat(args))].concat(args));
          };
      }

  }
};

var mergeStylings = function mergeStylings(customStylings, defaultStylings) {
  var keys = Object.keys(defaultStylings);

  for (var key in customStylings) {
    if (keys.indexOf(key) === -1) keys.push(key);
  }

  return keys.reduce(function (mergedStyling, key) {
    return mergedStyling[key] = mergeStyling(customStylings[key], defaultStylings[key]), mergedStyling;
  }, {});
};

var getStylingByKeys = function getStylingByKeys(mergedStyling, keys) {
  for (var _len6 = arguments.length, args = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
    args[_key6 - 2] = arguments[_key6];
  }

  if (keys === null) {
    return mergedStyling;
  }

  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  var styles = keys.map(function (key) {
    return mergedStyling[key];
  }).filter(Boolean);
  var props = styles.reduce(function (obj, s) {
    if (typeof s === 'string') {
      obj.className = [obj.className, s].filter(Boolean).join(' ');
    } else if (_typeof(s) === 'object') {
      obj.style = _objectSpread(_objectSpread({}, obj.style), s);
    } else if (typeof s === 'function') {
      obj = _objectSpread(_objectSpread({}, obj), s.apply(void 0, [obj].concat(args)));
    }

    return obj;
  }, {
    className: '',
    style: {}
  });

  if (!props.className) {
    delete props.className;
  }

  if (Object.keys(props.style).length === 0) {
    delete props.style;
  }

  return props;
};

var invertBase16Theme = function invertBase16Theme(base16Theme) {
  return Object.keys(base16Theme).reduce(function (t, key) {
    return t[key] = /^base/.test(key) ? invertColor(base16Theme[key]) : key === 'scheme' ? base16Theme[key] + ':inverted' : base16Theme[key], t;
  }, {});
};

exports.invertBase16Theme = invertBase16Theme;
var createStyling = (0, _lodash["default"])(function (getStylingFromBase16) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var themeOrStyling = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$defaultBase = options.defaultBase16,
      defaultBase16 = _options$defaultBase === void 0 ? DEFAULT_BASE16 : _options$defaultBase,
      _options$base16Themes = options.base16Themes,
      base16Themes = _options$base16Themes === void 0 ? null : _options$base16Themes;
  var base16Theme = getBase16Theme(themeOrStyling, base16Themes);

  if (base16Theme) {
    themeOrStyling = _objectSpread(_objectSpread({}, base16Theme), themeOrStyling);
  }

  var theme = BASE16_KEYS.reduce(function (t, key) {
    return t[key] = themeOrStyling[key] || defaultBase16[key], t;
  }, {});
  var customStyling = Object.keys(themeOrStyling).reduce(function (s, key) {
    return BASE16_KEYS.indexOf(key) === -1 ? (s[key] = themeOrStyling[key], s) : s;
  }, {});
  var defaultStyling = getStylingFromBase16(theme);
  var mergedStyling = mergeStylings(customStyling, defaultStyling);

  for (var _len7 = arguments.length, args = new Array(_len7 > 3 ? _len7 - 3 : 0), _key7 = 3; _key7 < _len7; _key7++) {
    args[_key7 - 3] = arguments[_key7];
  }

  return (0, _lodash["default"])(getStylingByKeys, 2).apply(void 0, [mergedStyling].concat(args));
}, 3);
exports.createStyling = createStyling;

var isStylingConfig = function isStylingConfig(theme) {
  return !!theme.extend;
};

var getBase16Theme = function getBase16Theme(theme, base16Themes) {
  if (theme && isStylingConfig(theme) && theme.extend) {
    theme = theme.extend;
  }

  if (typeof theme === 'string') {
    var _theme$split = theme.split(':'),
        _theme$split2 = _slicedToArray(_theme$split, 2),
        _themeName = _theme$split2[0],
        modifier = _theme$split2[1];

    if (base16Themes) {
      theme = base16Themes[_themeName];
    } else {
      theme = base16[_themeName];
    }

    if (modifier === 'inverted') {
      theme = invertBase16Theme(theme);
    }
  }

  return theme && Object.prototype.hasOwnProperty.call(theme, 'base00') ? theme : undefined;
};

exports.getBase16Theme = getBase16Theme;

var invertTheme = function invertTheme(theme) {
  if (typeof theme === 'string') {
    return "".concat(theme, ":inverted");
  }

  if (theme && isStylingConfig(theme) && theme.extend) {
    if (typeof theme.extend === 'string') {
      return _objectSpread(_objectSpread({}, theme), {}, {
        extend: "".concat(theme.extend, ":inverted")
      });
    }

    return _objectSpread(_objectSpread({}, theme), {}, {
      extend: invertBase16Theme(theme.extend)
    });
  }

  if (theme) {
    return invertBase16Theme(theme);
  }

  return theme;
};

exports.invertTheme = invertTheme;

//# sourceURL=webpack://ReactJsonTree/../react-base16-styling/lib/index.js?`);
              }
            ),
            /***/
            "../react-base16-styling/lib/types.js": (
              /*!********************************************!*\
                !*** ../react-base16-styling/lib/types.js ***!
                \********************************************/
              /***/
              (__unused_webpack_module, exports) => {
                "use strict";
                eval('\n\nObject.defineProperty(exports, "__esModule", ({\n  value: true\n}));\n\n//# sourceURL=webpack://ReactJsonTree/../react-base16-styling/lib/types.js?');
              }
            ),
            /***/
            "./src/ItemRange.tsx": (
              /*!***************************!*\
                !*** ./src/ItemRange.tsx ***!
                \***************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ItemRange)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _JSONArrow__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONArrow */ "./src/JSONArrow.tsx");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }





var ItemRange = /*#__PURE__*/function (_React$Component) {
  _inherits(ItemRange, _React$Component);

  var _super = _createSuper(ItemRange);

  function ItemRange(props) {
    var _this;

    _classCallCheck(this, ItemRange);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "handleClick", function () {
      _this.setState({
        expanded: !_this.state.expanded
      });
    });

    _this.state = {
      expanded: false
    };
    return _this;
  }

  _createClass(ItemRange, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          styling = _this$props.styling,
          from = _this$props.from,
          to = _this$props.to,
          renderChildNodes = _this$props.renderChildNodes,
          nodeType = _this$props.nodeType;
      return this.state.expanded ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", styling('itemRange', this.state.expanded), renderChildNodes(this.props, from, to)) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", _extends({}, styling('itemRange', this.state.expanded), {
        onClick: this.handleClick
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONArrow__WEBPACK_IMPORTED_MODULE_1__["default"], {
        nodeType: nodeType,
        styling: styling,
        expanded: false,
        onClick: this.handleClick,
        arrowStyle: "double"
      }), "".concat(from, " ... ").concat(to));
    }
  }]);

  return ItemRange;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));

_defineProperty(ItemRange, "propTypes", {
  styling: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().func.isRequired),
  from: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().number.isRequired),
  to: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().number.isRequired),
  renderChildNodes: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().func.isRequired),
  nodeType: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().string.isRequired)
});



//# sourceURL=webpack://ReactJsonTree/./src/ItemRange.tsx?`);
              }
            ),
            /***/
            "./src/JSONArrayNode.tsx": (
              /*!*******************************!*\
                !*** ./src/JSONArrayNode.tsx ***!
                \*******************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONNestedNode */ "./src/JSONNestedNode.tsx");
var _excluded = ["data"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }





// Returns the "n Items" string for this node,
// generating and caching it if it hasn't been created yet.
function createItemString(data) {
  return "".concat(data.length, " ").concat(data.length !== 1 ? 'items' : 'item');
}

// Configures <JSONNestedNode> to render an Array
var JSONArrayNode = function JSONArrayNode(_ref) {
  var data = _ref.data,
      props = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, props, {
    data: data,
    nodeType: "Array",
    nodeTypeIndicator: "[]",
    createItemString: createItemString,
    expandable: data.length > 0
  }));
};

JSONArrayNode.propTypes = {
  data: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().array)
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONArrayNode);

//# sourceURL=webpack://ReactJsonTree/./src/JSONArrayNode.tsx?`);
              }
            ),
            /***/
            "./src/JSONArrow.tsx": (
              /*!***************************!*\
                !*** ./src/JSONArrow.tsx ***!
                \***************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }




var JSONArrow = function JSONArrow(_ref) {
  var styling = _ref.styling,
      arrowStyle = _ref.arrowStyle,
      expanded = _ref.expanded,
      nodeType = _ref.nodeType,
      onClick = _ref.onClick;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", _extends({}, styling('arrowContainer', arrowStyle), {
    onClick: onClick
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", styling(['arrow', 'arrowSign'], nodeType, expanded, arrowStyle), "\\u25B6", arrowStyle === 'double' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", styling(['arrowSign', 'arrowSignInner']), "\\u25B6")));
};

JSONArrow.propTypes = {
  styling: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func.isRequired),
  arrowStyle: prop_types__WEBPACK_IMPORTED_MODULE_1___default().oneOf(['single', 'double']),
  expanded: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().bool.isRequired),
  nodeType: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().string.isRequired),
  onClick: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func.isRequired)
};
JSONArrow.defaultProps = {
  arrowStyle: 'single'
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONArrow);

//# sourceURL=webpack://ReactJsonTree/./src/JSONArrow.tsx?`);
              }
            ),
            /***/
            "./src/JSONIterableNode.tsx": (
              /*!**********************************!*\
                !*** ./src/JSONIterableNode.tsx ***!
                \**********************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONNestedNode */ "./src/JSONNestedNode.tsx");
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }




// Returns the "n Items" string for this node,
// generating and caching it if it hasn't been created yet.
function createItemString(data, limit) {
  var count = 0;
  var hasMore = false;

  if (Number.isSafeInteger(data.size)) {
    count = data.size;
  } else {
    // eslint-disable-next-line no-unused-vars
    var _iterator = _createForOfIteratorHelper(data),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        if (limit && count + 1 > limit) {
          hasMore = true;
          break;
        }

        count += 1;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  return "".concat(hasMore ? '>' : '').concat(count, " ").concat(count !== 1 ? 'entries' : 'entry');
}

// Configures <JSONNestedNode> to render an iterable
var JSONIterableNode = function JSONIterableNode(_ref) {
  var props = _extends({}, _ref);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, props, {
    nodeType: "Iterable",
    nodeTypeIndicator: "()",
    createItemString: createItemString
  }));
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONIterableNode);

//# sourceURL=webpack://ReactJsonTree/./src/JSONIterableNode.tsx?`);
              }
            ),
            /***/
            "./src/JSONNestedNode.tsx": (
              /*!********************************!*\
                !*** ./src/JSONNestedNode.tsx ***!
                \********************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ JSONNestedNode)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _JSONArrow__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONArrow */ "./src/JSONArrow.tsx");
/* harmony import */ var _getCollectionEntries__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getCollectionEntries */ "./src/getCollectionEntries.ts");
/* harmony import */ var _JSONNode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./JSONNode */ "./src/JSONNode.tsx");
/* harmony import */ var _ItemRange__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ItemRange */ "./src/ItemRange.tsx");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }








function isRange(rangeOrEntry) {
  return rangeOrEntry.to !== undefined;
}

function renderChildNodes(props, from, to) {
  var nodeType = props.nodeType,
      data = props.data,
      collectionLimit = props.collectionLimit,
      circularCache = props.circularCache,
      keyPath = props.keyPath,
      postprocessValue = props.postprocessValue,
      sortObjectKeys = props.sortObjectKeys;
  var childNodes = [];
  (0,_getCollectionEntries__WEBPACK_IMPORTED_MODULE_2__["default"])(nodeType, data, sortObjectKeys, collectionLimit, from, to).forEach(function (entry) {
    if (isRange(entry)) {
      childNodes.push( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_ItemRange__WEBPACK_IMPORTED_MODULE_4__["default"], _extends({}, props, {
        key: "ItemRange--".concat(entry.from, "-").concat(entry.to),
        from: entry.from,
        to: entry.to,
        renderChildNodes: renderChildNodes
      })));
    } else {
      var key = entry.key,
          value = entry.value;
      var isCircular = circularCache.indexOf(value) !== -1;
      childNodes.push( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONNode__WEBPACK_IMPORTED_MODULE_3__["default"], _extends({}, props, {
        postprocessValue: postprocessValue,
        collectionLimit: collectionLimit,
        key: "Node--".concat(key),
        keyPath: [key].concat(_toConsumableArray(keyPath)),
        value: postprocessValue(value),
        circularCache: [].concat(_toConsumableArray(circularCache), [value]),
        isCircular: isCircular,
        hideRoot: false
      })));
    }
  });
  return childNodes;
}

function getStateFromProps(props) {
  // calculate individual node expansion if necessary
  var expanded = !props.isCircular ? props.shouldExpandNode(props.keyPath, props.data, props.level) : false;
  return {
    expanded: expanded
  };
}

var JSONNestedNode = /*#__PURE__*/function (_React$Component) {
  _inherits(JSONNestedNode, _React$Component);

  var _super = _createSuper(JSONNestedNode);

  function JSONNestedNode(props) {
    var _this;

    _classCallCheck(this, JSONNestedNode);

    _this = _super.call(this, props);

    _defineProperty(_assertThisInitialized(_this), "handleClick", function () {
      if (_this.props.expandable) {
        _this.setState({
          expanded: !_this.state.expanded
        });
      }
    });

    _this.state = getStateFromProps(props);
    return _this;
  }

  _createClass(JSONNestedNode, [{
    key: "UNSAFE_componentWillReceiveProps",
    value: function UNSAFE_componentWillReceiveProps(nextProps) {
      var nextState = getStateFromProps(nextProps);

      if (getStateFromProps(this.props).expanded !== nextState.expanded) {
        this.setState(nextState);
      }
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var _this2 = this;

      return !!Object.keys(nextProps).find(function (key) {
        return key !== 'circularCache' && (key === 'keyPath' ? nextProps[key].join('/') !== _this2.props[key].join('/') : nextProps[key] !== _this2.props[key]);
      }) || nextState.expanded !== this.state.expanded;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          getItemString = _this$props.getItemString,
          nodeTypeIndicator = _this$props.nodeTypeIndicator,
          nodeType = _this$props.nodeType,
          data = _this$props.data,
          hideRoot = _this$props.hideRoot,
          createItemString = _this$props.createItemString,
          styling = _this$props.styling,
          collectionLimit = _this$props.collectionLimit,
          keyPath = _this$props.keyPath,
          labelRenderer = _this$props.labelRenderer,
          expandable = _this$props.expandable;
      var expanded = this.state.expanded;
      var renderedChildren = expanded || hideRoot && this.props.level === 0 ? renderChildNodes(_objectSpread(_objectSpread({}, this.props), {}, {
        level: this.props.level + 1
      })) : null;
      var itemType = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", styling('nestedNodeItemType', expanded), nodeTypeIndicator);
      var renderedItemString = getItemString(nodeType, data, itemType, createItemString(data, collectionLimit), keyPath);
      var stylingArgs = [keyPath, nodeType, expanded, expandable];
      return hideRoot ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", styling.apply(void 0, ['rootNode'].concat(stylingArgs)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", styling.apply(void 0, ['rootNodeChildren'].concat(stylingArgs)), renderedChildren)) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", styling.apply(void 0, ['nestedNode'].concat(stylingArgs)), expandable && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONArrow__WEBPACK_IMPORTED_MODULE_1__["default"], {
        styling: styling,
        nodeType: nodeType,
        expanded: expanded,
        onClick: this.handleClick
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", _extends({}, styling.apply(void 0, [['label', 'nestedNodeLabel']].concat(stylingArgs)), {
        onClick: this.handleClick
      }), labelRenderer.apply(void 0, stylingArgs)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", _extends({}, styling.apply(void 0, ['nestedNodeItemString'].concat(stylingArgs)), {
        onClick: this.handleClick
      }), renderedItemString), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", styling.apply(void 0, ['nestedNodeChildren'].concat(stylingArgs)), renderedChildren));
    }
  }]);

  return JSONNestedNode;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));

_defineProperty(JSONNestedNode, "propTypes", {
  getItemString: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().func.isRequired),
  nodeTypeIndicator: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().any),
  nodeType: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().string.isRequired),
  data: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().any),
  hideRoot: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool.isRequired),
  createItemString: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().func.isRequired),
  styling: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().func.isRequired),
  collectionLimit: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().number),
  keyPath: prop_types__WEBPACK_IMPORTED_MODULE_5___default().arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_5___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_5___default().string), (prop_types__WEBPACK_IMPORTED_MODULE_5___default().number)])).isRequired,
  labelRenderer: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().func.isRequired),
  shouldExpandNode: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().func),
  level: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().number.isRequired),
  sortObjectKeys: prop_types__WEBPACK_IMPORTED_MODULE_5___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_5___default().func), (prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool)]),
  isCircular: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool),
  expandable: (prop_types__WEBPACK_IMPORTED_MODULE_5___default().bool)
});

_defineProperty(JSONNestedNode, "defaultProps", {
  data: [],
  circularCache: [],
  level: 0,
  expandable: true
});



//# sourceURL=webpack://ReactJsonTree/./src/JSONNestedNode.tsx?`);
              }
            ),
            /***/
            "./src/JSONNode.tsx": (
              /*!**************************!*\
                !*** ./src/JSONNode.tsx ***!
                \**************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _objType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objType */ "./src/objType.ts");
/* harmony import */ var _JSONObjectNode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./JSONObjectNode */ "./src/JSONObjectNode.tsx");
/* harmony import */ var _JSONArrayNode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./JSONArrayNode */ "./src/JSONArrayNode.tsx");
/* harmony import */ var _JSONIterableNode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./JSONIterableNode */ "./src/JSONIterableNode.tsx");
/* harmony import */ var _JSONValueNode__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./JSONValueNode */ "./src/JSONValueNode.tsx");
var _excluded = ["getItemString", "keyPath", "labelRenderer", "styling", "value", "valueRenderer", "isCustomNode"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }









var JSONNode = function JSONNode(_ref) {
  var getItemString = _ref.getItemString,
      keyPath = _ref.keyPath,
      labelRenderer = _ref.labelRenderer,
      styling = _ref.styling,
      value = _ref.value,
      valueRenderer = _ref.valueRenderer,
      isCustomNode = _ref.isCustomNode,
      rest = _objectWithoutProperties(_ref, _excluded);

  var nodeType = isCustomNode(value) ? 'Custom' : (0,_objType__WEBPACK_IMPORTED_MODULE_1__["default"])(value);
  var simpleNodeProps = {
    getItemString: getItemString,
    key: keyPath[0],
    keyPath: keyPath,
    labelRenderer: labelRenderer,
    nodeType: nodeType,
    styling: styling,
    value: value,
    valueRenderer: valueRenderer
  };

  var nestedNodeProps = _objectSpread(_objectSpread(_objectSpread({}, rest), simpleNodeProps), {}, {
    data: value,
    isCustomNode: isCustomNode
  });

  switch (nodeType) {
    case 'Object':
    case 'Error':
    case 'WeakMap':
    case 'WeakSet':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONObjectNode__WEBPACK_IMPORTED_MODULE_2__["default"], nestedNodeProps);

    case 'Array':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONArrayNode__WEBPACK_IMPORTED_MODULE_3__["default"], nestedNodeProps);

    case 'Iterable':
    case 'Map':
    case 'Set':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONIterableNode__WEBPACK_IMPORTED_MODULE_4__["default"], nestedNodeProps);

    case 'String':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter(raw) {
          return "\\"".concat(raw, "\\"");
        }
      }));

    case 'Number':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], simpleNodeProps);

    case 'Boolean':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter(raw) {
          return raw ? 'true' : 'false';
        }
      }));

    case 'Date':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter(raw) {
          return raw.toISOString();
        }
      }));

    case 'Null':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter() {
          return 'null';
        }
      }));

    case 'Undefined':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter() {
          return 'undefined';
        }
      }));

    case 'Function':
    case 'Symbol':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter(raw) {
          return raw.toString();
        }
      }));

    case 'Custom':
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], simpleNodeProps);

    default:
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONValueNode__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({}, simpleNodeProps, {
        valueGetter: function valueGetter() {
          return "<".concat(nodeType, ">");
        }
      }));
  }
};

JSONNode.propTypes = {
  getItemString: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().func.isRequired),
  keyPath: prop_types__WEBPACK_IMPORTED_MODULE_6___default().arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_6___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_6___default().string), (prop_types__WEBPACK_IMPORTED_MODULE_6___default().number)]).isRequired).isRequired,
  labelRenderer: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().func.isRequired),
  styling: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().func.isRequired),
  value: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().any),
  valueRenderer: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().func.isRequired),
  isCustomNode: (prop_types__WEBPACK_IMPORTED_MODULE_6___default().func.isRequired)
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONNode);

//# sourceURL=webpack://ReactJsonTree/./src/JSONNode.tsx?`);
              }
            ),
            /***/
            "./src/JSONObjectNode.tsx": (
              /*!********************************!*\
                !*** ./src/JSONObjectNode.tsx ***!
                \********************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONNestedNode */ "./src/JSONNestedNode.tsx");
var _excluded = ["data"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }





// Returns the "n Items" string for this node,
// generating and caching it if it hasn't been created yet.
function createItemString(data) {
  var len = Object.getOwnPropertyNames(data).length;
  return "".concat(len, " ").concat(len !== 1 ? 'keys' : 'key');
}

// Configures <JSONNestedNode> to render an Object
var JSONObjectNode = function JSONObjectNode(_ref) {
  var data = _ref.data,
      props = _objectWithoutProperties(_ref, _excluded);

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONNestedNode__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, props, {
    data: data,
    nodeType: "Object",
    nodeTypeIndicator: props.nodeType === 'Error' ? 'Error()' : '{}',
    createItemString: createItemString,
    expandable: Object.getOwnPropertyNames(data).length > 0
  }));
};

JSONObjectNode.propTypes = {
  data: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().object),
  nodeType: (prop_types__WEBPACK_IMPORTED_MODULE_2___default().string.isRequired)
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONObjectNode);

//# sourceURL=webpack://ReactJsonTree/./src/JSONObjectNode.tsx?`);
              }
            ),
            /***/
            "./src/JSONValueNode.tsx": (
              /*!*******************************!*\
                !*** ./src/JSONValueNode.tsx ***!
                \*******************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }




var JSONValueNode = function JSONValueNode(_ref) {
  var nodeType = _ref.nodeType,
      styling = _ref.styling,
      labelRenderer = _ref.labelRenderer,
      keyPath = _ref.keyPath,
      valueRenderer = _ref.valueRenderer,
      value = _ref.value,
      _ref$valueGetter = _ref.valueGetter,
      valueGetter = _ref$valueGetter === void 0 ? function (value) {
    return value;
  } : _ref$valueGetter;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", styling('value', nodeType, keyPath), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", styling(['label', 'valueLabel'], nodeType, keyPath), labelRenderer(keyPath, nodeType, false, false)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", styling('valueText', nodeType, keyPath), valueRenderer.apply(void 0, [valueGetter(value), value].concat(_toConsumableArray(keyPath)))));
};

JSONValueNode.propTypes = {
  nodeType: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().string.isRequired),
  styling: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func.isRequired),
  labelRenderer: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func.isRequired),
  keyPath: prop_types__WEBPACK_IMPORTED_MODULE_1___default().arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_1___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_1___default().string), (prop_types__WEBPACK_IMPORTED_MODULE_1___default().number)]).isRequired).isRequired,
  valueRenderer: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func.isRequired),
  value: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().any),
  valueGetter: (prop_types__WEBPACK_IMPORTED_MODULE_1___default().func)
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JSONValueNode);

//# sourceURL=webpack://ReactJsonTree/./src/JSONValueNode.tsx?`);
              }
            ),
            /***/
            "./src/createStylingFromTheme.ts": (
              /*!***************************************!*\
                !*** ./src/createStylingFromTheme.ts ***!
                \***************************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_base16_styling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-base16-styling */ "../react-base16-styling/lib/index.js");
/* harmony import */ var react_base16_styling__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_base16_styling__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _themes_solarized__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./themes/solarized */ "./src/themes/solarized.ts");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var colorMap = function colorMap(theme) {
  return {
    BACKGROUND_COLOR: theme.base00,
    TEXT_COLOR: theme.base07,
    STRING_COLOR: theme.base0B,
    DATE_COLOR: theme.base0B,
    NUMBER_COLOR: theme.base09,
    BOOLEAN_COLOR: theme.base09,
    NULL_COLOR: theme.base08,
    UNDEFINED_COLOR: theme.base08,
    FUNCTION_COLOR: theme.base08,
    SYMBOL_COLOR: theme.base08,
    LABEL_COLOR: theme.base0D,
    ARROW_COLOR: theme.base0D,
    ITEM_STRING_COLOR: theme.base0B,
    ITEM_STRING_EXPANDED_COLOR: theme.base03
  };
};

var valueColorMap = function valueColorMap(colors) {
  return {
    String: colors.STRING_COLOR,
    Date: colors.DATE_COLOR,
    Number: colors.NUMBER_COLOR,
    Boolean: colors.BOOLEAN_COLOR,
    Null: colors.NULL_COLOR,
    Undefined: colors.UNDEFINED_COLOR,
    Function: colors.FUNCTION_COLOR,
    Symbol: colors.SYMBOL_COLOR
  };
};

var getDefaultThemeStyling = function getDefaultThemeStyling(theme) {
  var colors = colorMap(theme);
  return {
    tree: {
      border: 0,
      padding: 0,
      marginTop: '0.5em',
      marginBottom: '0.5em',
      marginLeft: '0.125em',
      marginRight: 0,
      listStyle: 'none',
      MozUserSelect: 'none',
      WebkitUserSelect: 'none',
      backgroundColor: colors.BACKGROUND_COLOR
    },
    value: function value(_ref, nodeType, keyPath) {
      var style = _ref.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          paddingTop: '0.25em',
          paddingRight: 0,
          marginLeft: '0.875em',
          WebkitUserSelect: 'text',
          MozUserSelect: 'text',
          wordWrap: 'break-word',
          paddingLeft: keyPath.length > 1 ? '2.125em' : '1.25em',
          textIndent: '-0.5em',
          wordBreak: 'break-all'
        })
      };
    },
    label: {
      display: 'inline-block',
      color: colors.LABEL_COLOR
    },
    valueLabel: {
      margin: '0 0.5em 0 0'
    },
    valueText: function valueText(_ref2, nodeType) {
      var style = _ref2.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          color: valueColorMap(colors)[nodeType]
        })
      };
    },
    itemRange: function itemRange(styling, expanded) {
      return {
        style: {
          paddingTop: expanded ? 0 : '0.25em',
          cursor: 'pointer',
          color: colors.LABEL_COLOR
        }
      };
    },
    arrow: function arrow(_ref3, nodeType, expanded) {
      var style = _ref3.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          marginLeft: 0,
          transition: '150ms',
          WebkitTransition: '150ms',
          MozTransition: '150ms',
          WebkitTransform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
          MozTransform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
          transform: expanded ? 'rotateZ(90deg)' : 'rotateZ(0deg)',
          transformOrigin: '45% 50%',
          WebkitTransformOrigin: '45% 50%',
          MozTransformOrigin: '45% 50%',
          position: 'relative',
          lineHeight: '1.1em',
          fontSize: '0.75em'
        })
      };
    },
    arrowContainer: function arrowContainer(_ref4, arrowStyle) {
      var style = _ref4.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          display: 'inline-block',
          paddingRight: '0.5em',
          paddingLeft: arrowStyle === 'double' ? '1em' : 0,
          cursor: 'pointer'
        })
      };
    },
    arrowSign: {
      color: colors.ARROW_COLOR
    },
    arrowSignInner: {
      position: 'absolute',
      top: 0,
      left: '-0.4em'
    },
    nestedNode: function nestedNode(_ref5, keyPath, nodeType, expanded, expandable) {
      var style = _ref5.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          position: 'relative',
          paddingTop: '0.25em',
          marginLeft: keyPath.length > 1 ? '0.875em' : 0,
          paddingLeft: !expandable ? '1.125em' : 0
        })
      };
    },
    rootNode: {
      padding: 0,
      margin: 0
    },
    nestedNodeLabel: function nestedNodeLabel(_ref6, keyPath, nodeType, expanded, expandable) {
      var style = _ref6.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          margin: 0,
          padding: 0,
          WebkitUserSelect: expandable ? 'inherit' : 'text',
          MozUserSelect: expandable ? 'inherit' : 'text',
          cursor: expandable ? 'pointer' : 'default'
        })
      };
    },
    nestedNodeItemString: function nestedNodeItemString(_ref7, keyPath, nodeType, expanded) {
      var style = _ref7.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          paddingLeft: '0.5em',
          cursor: 'default',
          color: expanded ? colors.ITEM_STRING_EXPANDED_COLOR : colors.ITEM_STRING_COLOR
        })
      };
    },
    nestedNodeItemType: {
      marginLeft: '0.3em',
      marginRight: '0.3em'
    },
    nestedNodeChildren: function nestedNodeChildren(_ref8, nodeType, expanded) {
      var style = _ref8.style;
      return {
        style: _objectSpread(_objectSpread({}, style), {}, {
          padding: 0,
          margin: 0,
          listStyle: 'none',
          display: expanded ? 'block' : 'none'
        })
      };
    },
    rootNodeChildren: {
      padding: 0,
      margin: 0,
      listStyle: 'none'
    }
  };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,react_base16_styling__WEBPACK_IMPORTED_MODULE_0__.createStyling)(getDefaultThemeStyling, {
  defaultBase16: _themes_solarized__WEBPACK_IMPORTED_MODULE_1__["default"]
}));

//# sourceURL=webpack://ReactJsonTree/./src/createStylingFromTheme.ts?`);
              }
            ),
            /***/
            "./src/getCollectionEntries.ts": (
              /*!*************************************!*\
                !*** ./src/getCollectionEntries.ts ***!
                \*************************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getCollectionEntries)
/* harmony export */ });
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function getLength(type, collection) {
  if (type === 'Object') {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return Object.keys(collection).length;
  } else if (type === 'Array') {
    return collection.length;
  }

  return Infinity;
}

function isIterableMap(collection) {
  return typeof collection.set === 'function';
}

function getEntries(type, collection, sortObjectKeys) {
  var from = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var to = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Infinity;
  var res;

  if (type === 'Object') {
    var keys = Object.getOwnPropertyNames(collection);

    if (sortObjectKeys) {
      keys.sort(sortObjectKeys === true ? undefined : sortObjectKeys);
    }

    keys = keys.slice(from, to + 1);
    res = {
      entries: keys.map(function (key) {
        return {
          key: key,
          value: collection[key]
        };
      })
    };
  } else if (type === 'Array') {
    res = {
      entries: collection.slice(from, to + 1).map(function (val, idx) {
        return {
          key: idx + from,
          value: val
        };
      })
    };
  } else {
    var idx = 0;
    var entries = [];
    var done = true;
    var isMap = isIterableMap(collection);

    var _iterator = _createForOfIteratorHelper(collection),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;

        if (idx > to) {
          done = false;
          break;
        }

        if (from <= idx) {
          if (isMap && Array.isArray(item)) {
            if (typeof item[0] === 'string' || typeof item[0] === 'number') {
              entries.push({
                key: item[0],
                value: item[1]
              });
            } else {
              entries.push({
                key: "[entry ".concat(idx, "]"),
                value: {
                  '[key]': item[0],
                  '[value]': item[1]
                }
              });
            }
          } else {
            entries.push({
              key: idx,
              value: item
            });
          }
        }

        idx++;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    res = {
      hasMore: !done,
      entries: entries
    };
  }

  return res;
}

function getRanges(from, to, limit) {
  var ranges = [];

  while (to - from > limit * limit) {
    limit = limit * limit;
  }

  for (var i = from; i <= to; i += limit) {
    ranges.push({
      from: i,
      to: Math.min(to, i + limit - 1)
    });
  }

  return ranges;
}

function getCollectionEntries(type, collection, sortObjectKeys, limit) {
  var from = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var to = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : Infinity;
  var getEntriesBound = getEntries.bind(null, type, collection, sortObjectKeys);

  if (!limit) {
    return getEntriesBound().entries;
  }

  var isSubset = to < Infinity;
  var length = Math.min(to - from, getLength(type, collection));

  if (type !== 'Iterable') {
    if (length <= limit || limit < 7) {
      return getEntriesBound(from, to).entries;
    }
  } else {
    if (length <= limit && !isSubset) {
      return getEntriesBound(from, to).entries;
    }
  }

  var limitedEntries;

  if (type === 'Iterable') {
    var _getEntriesBound = getEntriesBound(from, from + limit - 1),
        hasMore = _getEntriesBound.hasMore,
        entries = _getEntriesBound.entries;

    limitedEntries = hasMore ? [].concat(_toConsumableArray(entries), _toConsumableArray(getRanges(from + limit, from + 2 * limit - 1, limit))) : entries;
  } else {
    limitedEntries = isSubset ? getRanges(from, to, limit) : [].concat(_toConsumableArray(getEntriesBound(0, limit - 5).entries), _toConsumableArray(getRanges(limit - 4, length - 5, limit)), _toConsumableArray(getEntriesBound(length - 4, length - 1).entries));
  }

  return limitedEntries;
}

//# sourceURL=webpack://ReactJsonTree/./src/getCollectionEntries.ts?`);
              }
            ),
            /***/
            "./src/index.tsx": (
              /*!***********************!*\
                !*** ./src/index.tsx ***!
                \***********************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ JSONTree),
/* harmony export */   "StylingValue": () => (/* reexport safe */ react_base16_styling__WEBPACK_IMPORTED_MODULE_3__.StylingValue)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! prop-types */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _JSONNode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./JSONNode */ "./src/JSONNode.tsx");
/* harmony import */ var _createStylingFromTheme__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./createStylingFromTheme */ "./src/createStylingFromTheme.ts");
/* harmony import */ var react_base16_styling__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-base16-styling */ "../react-base16-styling/lib/index.js");
/* harmony import */ var react_base16_styling__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_base16_styling__WEBPACK_IMPORTED_MODULE_3__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _excluded = ["data", "keyPath", "postprocessValue", "hideRoot", "theme", "invertTheme"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// ES6 + inline style port of JSONViewer https://bitbucket.org/davevedder/react-json-viewer/
// all credits and original code to the author
// Dave Vedder <veddermatic@gmail.com> http://www.eskimospy.com/
// port by Daniele Zannotti http://www.github.com/dzannotti <dzannotti@me.com>






var identity = function identity(value) {
  return value;
};

var expandRootNode = function expandRootNode(keyPath, data, level) {
  return level === 0;
};

var defaultItemString = function defaultItemString(type, data, itemType, itemString) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, itemType, " ", itemString);
};

var defaultLabelRenderer = function defaultLabelRenderer(_ref) {
  var _ref2 = _slicedToArray(_ref, 1),
      label = _ref2[0];

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, label, ":");
};

var noCustomNode = function noCustomNode() {
  return false;
};

function checkLegacyTheming(theme, props) {
  var deprecatedStylingMethodsMap = {
    getArrowStyle: 'arrow',
    getListStyle: 'nestedNodeChildren',
    getItemStringStyle: 'nestedNodeItemString',
    getLabelStyle: 'label',
    getValueStyle: 'valueText'
  };
  var deprecatedStylingMethods = Object.keys(deprecatedStylingMethodsMap).filter(function (name) {
    return props[name];
  });

  if (deprecatedStylingMethods.length > 0) {
    if (typeof theme === 'string') {
      theme = {
        extend: theme
      };
    } else {
      theme = _objectSpread({}, theme);
    }

    deprecatedStylingMethods.forEach(function (name) {
      // eslint-disable-next-line no-console
      console.error("Styling method \\"".concat(name, "\\" is deprecated, use \\"theme\\" property instead"));

      theme[deprecatedStylingMethodsMap[name]] = function (_ref3) {
        var style = _ref3.style;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return {
          style: _objectSpread(_objectSpread({}, style), props[name].apply(props, args))
        };
      };
    });
  }

  return theme;
}

function getStateFromProps(props) {
  var theme = checkLegacyTheming(props.theme, props);

  if (props.invertTheme) {
    theme = (0,react_base16_styling__WEBPACK_IMPORTED_MODULE_3__.invertTheme)(theme);
  }

  return {
    styling: (0,_createStylingFromTheme__WEBPACK_IMPORTED_MODULE_2__["default"])(theme)
  };
}

var JSONTree = /*#__PURE__*/function (_React$Component) {
  _inherits(JSONTree, _React$Component);

  var _super = _createSuper(JSONTree);

  function JSONTree(props) {
    var _this;

    _classCallCheck(this, JSONTree);

    _this = _super.call(this, props);
    _this.state = getStateFromProps(props);
    return _this;
  }

  _createClass(JSONTree, [{
    key: "UNSAFE_componentWillReceiveProps",
    value: function UNSAFE_componentWillReceiveProps(nextProps) {
      var _this2 = this;

      if (['theme', 'invertTheme'].find(function (k) {
        return nextProps[k] !== _this2.props[k];
      })) {
        this.setState(getStateFromProps(nextProps));
      }
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var _this3 = this;

      return !!Object.keys(nextProps).find(function (k) {
        return k === 'keyPath' ? nextProps[k].join('/') !== _this3.props[k].join('/') : nextProps[k] !== _this3.props[k];
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          value = _this$props.data,
          keyPath = _this$props.keyPath,
          postprocessValue = _this$props.postprocessValue,
          hideRoot = _this$props.hideRoot,
          theme = _this$props.theme,
          _ = _this$props.invertTheme,
          rest = _objectWithoutProperties(_this$props, _excluded);

      var styling = this.state.styling;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", styling('tree'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_JSONNode__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, _objectSpread({
        postprocessValue: postprocessValue,
        hideRoot: hideRoot,
        styling: styling
      }, rest), {
        keyPath: hideRoot ? [] : keyPath,
        value: postprocessValue(value)
      })));
    }
  }]);

  return JSONTree;
}((react__WEBPACK_IMPORTED_MODULE_0___default().Component));

_defineProperty(JSONTree, "propTypes", {
  data: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().any),
  hideRoot: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().bool),
  theme: prop_types__WEBPACK_IMPORTED_MODULE_4___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_4___default().object), (prop_types__WEBPACK_IMPORTED_MODULE_4___default().string)]),
  invertTheme: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().bool),
  keyPath: prop_types__WEBPACK_IMPORTED_MODULE_4___default().arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_4___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_4___default().string), (prop_types__WEBPACK_IMPORTED_MODULE_4___default().number)])),
  postprocessValue: (prop_types__WEBPACK_IMPORTED_MODULE_4___default().func),
  sortObjectKeys: prop_types__WEBPACK_IMPORTED_MODULE_4___default().oneOfType([(prop_types__WEBPACK_IMPORTED_MODULE_4___default().func), (prop_types__WEBPACK_IMPORTED_MODULE_4___default().bool)])
});

_defineProperty(JSONTree, "defaultProps", {
  shouldExpandNode: expandRootNode,
  hideRoot: false,
  keyPath: ['root'],
  getItemString: defaultItemString,
  labelRenderer: defaultLabelRenderer,
  valueRenderer: identity,
  postprocessValue: identity,
  isCustomNode: noCustomNode,
  collectionLimit: 50,
  invertTheme: true
});




//# sourceURL=webpack://ReactJsonTree/./src/index.tsx?`);
              }
            ),
            /***/
            "./src/objType.ts": (
              /*!************************!*\
                !*** ./src/objType.ts ***!
                \************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ objType)\n/* harmony export */ });\nfunction objType(obj) {\n  var type = Object.prototype.toString.call(obj).slice(8, -1);\n\n  if (type === 'Object' && typeof obj[Symbol.iterator] === 'function') {\n    return 'Iterable';\n  }\n\n  if (type === 'Custom' && obj.constructor !== Object && obj instanceof Object) {\n    // For projects implementing objects overriding `.prototype[Symbol.toStringTag]`\n    return 'Object';\n  }\n\n  return type;\n}\n\n//# sourceURL=webpack://ReactJsonTree/./src/objType.ts?");
              }
            ),
            /***/
            "./src/themes/solarized.ts": (
              /*!*********************************!*\
                !*** ./src/themes/solarized.ts ***!
                \*********************************/
              /***/
              (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                "use strict";
                eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  scheme: 'solarized',
  author: 'ethan schoonover (http://ethanschoonover.com/solarized)',
  base00: '#002b36',
  base01: '#073642',
  base02: '#586e75',
  base03: '#657b83',
  base04: '#839496',
  base05: '#93a1a1',
  base06: '#eee8d5',
  base07: '#fdf6e3',
  base08: '#dc322f',
  base09: '#cb4b16',
  base0A: '#b58900',
  base0B: '#859900',
  base0C: '#2aa198',
  base0D: '#268bd2',
  base0E: '#6c71c4',
  base0F: '#d33682'
});

//# sourceURL=webpack://ReactJsonTree/./src/themes/solarized.ts?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/apathy.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/apathy.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'apathy',
  author: 'jannik siebert (https://github.com/janniks)',
  base00: '#031A16',
  base01: '#0B342D',
  base02: '#184E45',
  base03: '#2B685E',
  base04: '#5F9C92',
  base05: '#81B5AC',
  base06: '#A7CEC8',
  base07: '#D2E7E4',
  base08: '#3E9688',
  base09: '#3E7996',
  base0A: '#3E4C96',
  base0B: '#883E96',
  base0C: '#963E4C',
  base0D: '#96883E',
  base0E: '#4C963E',
  base0F: '#3E965B'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/apathy.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ashes.js": (
              /*!*****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ashes.js ***!
                \*****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'ashes',
  author: 'jannik siebert (https://github.com/janniks)',
  base00: '#1C2023',
  base01: '#393F45',
  base02: '#565E65',
  base03: '#747C84',
  base04: '#ADB3BA',
  base05: '#C7CCD1',
  base06: '#DFE2E5',
  base07: '#F3F4F5',
  base08: '#C7AE95',
  base09: '#C7C795',
  base0A: '#AEC795',
  base0B: '#95C7AE',
  base0C: '#95AEC7',
  base0D: '#AE95C7',
  base0E: '#C795AE',
  base0F: '#C79595'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ashes.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-dune.js": (
              /*!************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-dune.js ***!
                \************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'atelier dune',
  author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/dune)',
  base00: '#20201d',
  base01: '#292824',
  base02: '#6e6b5e',
  base03: '#7d7a68',
  base04: '#999580',
  base05: '#a6a28c',
  base06: '#e8e4cf',
  base07: '#fefbec',
  base08: '#d73737',
  base09: '#b65611',
  base0A: '#cfb017',
  base0B: '#60ac39',
  base0C: '#1fad83',
  base0D: '#6684e1',
  base0E: '#b854d4',
  base0F: '#d43552'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-dune.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-forest.js": (
              /*!**************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-forest.js ***!
                \**************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'atelier forest',
  author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/forest)',
  base00: '#1b1918',
  base01: '#2c2421',
  base02: '#68615e',
  base03: '#766e6b',
  base04: '#9c9491',
  base05: '#a8a19f',
  base06: '#e6e2e0',
  base07: '#f1efee',
  base08: '#f22c40',
  base09: '#df5320',
  base0A: '#d5911a',
  base0B: '#5ab738',
  base0C: '#00ad9c',
  base0D: '#407ee7',
  base0E: '#6666ea',
  base0F: '#c33ff3'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-forest.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-heath.js": (
              /*!*************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-heath.js ***!
                \*************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'atelier heath',
  author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/heath)',
  base00: '#1b181b',
  base01: '#292329',
  base02: '#695d69',
  base03: '#776977',
  base04: '#9e8f9e',
  base05: '#ab9bab',
  base06: '#d8cad8',
  base07: '#f7f3f7',
  base08: '#ca402b',
  base09: '#a65926',
  base0A: '#bb8a35',
  base0B: '#379a37',
  base0C: '#159393',
  base0D: '#516aec',
  base0E: '#7b59c0',
  base0F: '#cc33cc'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-heath.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-lakeside.js": (
              /*!****************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-lakeside.js ***!
                \****************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'atelier lakeside',
  author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/lakeside/)',
  base00: '#161b1d',
  base01: '#1f292e',
  base02: '#516d7b',
  base03: '#5a7b8c',
  base04: '#7195a8',
  base05: '#7ea2b4',
  base06: '#c1e4f6',
  base07: '#ebf8ff',
  base08: '#d22d72',
  base09: '#935c25',
  base0A: '#8a8a0f',
  base0B: '#568c3b',
  base0C: '#2d8f6f',
  base0D: '#257fad',
  base0E: '#5d5db1',
  base0F: '#b72dd2'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-lakeside.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-seaside.js": (
              /*!***************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-seaside.js ***!
                \***************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'atelier seaside',
  author: 'bram de haan (http://atelierbram.github.io/syntax-highlighting/atelier-schemes/seaside/)',
  base00: '#131513',
  base01: '#242924',
  base02: '#5e6e5e',
  base03: '#687d68',
  base04: '#809980',
  base05: '#8ca68c',
  base06: '#cfe8cf',
  base07: '#f0fff0',
  base08: '#e6193c',
  base09: '#87711d',
  base0A: '#c3c322',
  base0B: '#29a329',
  base0C: '#1999b3',
  base0D: '#3d62f5',
  base0E: '#ad2bee',
  base0F: '#e619c3'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-seaside.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bespin.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bespin.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'bespin',
  author: 'jan t. sott',
  base00: '#28211c',
  base01: '#36312e',
  base02: '#5e5d5c',
  base03: '#666666',
  base04: '#797977',
  base05: '#8a8986',
  base06: '#9d9b97',
  base07: '#baae9e',
  base08: '#cf6a4c',
  base09: '#cf7d34',
  base0A: '#f9ee98',
  base0B: '#54be0d',
  base0C: '#afc4db',
  base0D: '#5ea6ea',
  base0E: '#9b859d',
  base0F: '#937121'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bespin.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/brewer.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/brewer.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'brewer',
  author: 'timothée poisot (http://github.com/tpoisot)',
  base00: '#0c0d0e',
  base01: '#2e2f30',
  base02: '#515253',
  base03: '#737475',
  base04: '#959697',
  base05: '#b7b8b9',
  base06: '#dadbdc',
  base07: '#fcfdfe',
  base08: '#e31a1c',
  base09: '#e6550d',
  base0A: '#dca060',
  base0B: '#31a354',
  base0C: '#80b1d3',
  base0D: '#3182bd',
  base0E: '#756bb1',
  base0F: '#b15928'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/brewer.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bright.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bright.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'bright',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#000000',
  base01: '#303030',
  base02: '#505050',
  base03: '#b0b0b0',
  base04: '#d0d0d0',
  base05: '#e0e0e0',
  base06: '#f5f5f5',
  base07: '#ffffff',
  base08: '#fb0120',
  base09: '#fc6d24',
  base0A: '#fda331',
  base0B: '#a1c659',
  base0C: '#76c7b7',
  base0D: '#6fb3d2',
  base0E: '#d381c3',
  base0F: '#be643c'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bright.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/chalk.js": (
              /*!*****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/chalk.js ***!
                \*****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'chalk',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#151515',
  base01: '#202020',
  base02: '#303030',
  base03: '#505050',
  base04: '#b0b0b0',
  base05: '#d0d0d0',
  base06: '#e0e0e0',
  base07: '#f5f5f5',
  base08: '#fb9fb1',
  base09: '#eda987',
  base0A: '#ddb26f',
  base0B: '#acc267',
  base0C: '#12cfc0',
  base0D: '#6fc2ef',
  base0E: '#e1a3ee',
  base0F: '#deaf8f'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/chalk.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/codeschool.js": (
              /*!**********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/codeschool.js ***!
                \**********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'codeschool',
  author: 'brettof86',
  base00: '#232c31',
  base01: '#1c3657',
  base02: '#2a343a',
  base03: '#3f4944',
  base04: '#84898c',
  base05: '#9ea7a6',
  base06: '#a7cfa3',
  base07: '#b5d8f6',
  base08: '#2a5491',
  base09: '#43820d',
  base0A: '#a03b1e',
  base0B: '#237986',
  base0C: '#b02f30',
  base0D: '#484d79',
  base0E: '#c59820',
  base0F: '#c98344'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/codeschool.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/colors.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/colors.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'colors',
  author: 'mrmrs (http://clrs.cc)',
  base00: '#111111',
  base01: '#333333',
  base02: '#555555',
  base03: '#777777',
  base04: '#999999',
  base05: '#bbbbbb',
  base06: '#dddddd',
  base07: '#ffffff',
  base08: '#ff4136',
  base09: '#ff851b',
  base0A: '#ffdc00',
  base0B: '#2ecc40',
  base0C: '#7fdbff',
  base0D: '#0074d9',
  base0E: '#b10dc9',
  base0F: '#85144b'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/colors.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/default.js": (
              /*!*******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/default.js ***!
                \*******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'default',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#181818',
  base01: '#282828',
  base02: '#383838',
  base03: '#585858',
  base04: '#b8b8b8',
  base05: '#d8d8d8',
  base06: '#e8e8e8',
  base07: '#f8f8f8',
  base08: '#ab4642',
  base09: '#dc9656',
  base0A: '#f7ca88',
  base0B: '#a1b56c',
  base0C: '#86c1b9',
  base0D: '#7cafc2',
  base0E: '#ba8baf',
  base0F: '#a16946'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/default.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/eighties.js": (
              /*!********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/eighties.js ***!
                \********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'eighties',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#2d2d2d',
  base01: '#393939',
  base02: '#515151',
  base03: '#747369',
  base04: '#a09f93',
  base05: '#d3d0c8',
  base06: '#e8e6df',
  base07: '#f2f0ec',
  base08: '#f2777a',
  base09: '#f99157',
  base0A: '#ffcc66',
  base0B: '#99cc99',
  base0C: '#66cccc',
  base0D: '#6699cc',
  base0E: '#cc99cc',
  base0F: '#d27b53'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/eighties.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/embers.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/embers.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'embers',
  author: 'jannik siebert (https://github.com/janniks)',
  base00: '#16130F',
  base01: '#2C2620',
  base02: '#433B32',
  base03: '#5A5047',
  base04: '#8A8075',
  base05: '#A39A90',
  base06: '#BEB6AE',
  base07: '#DBD6D1',
  base08: '#826D57',
  base09: '#828257',
  base0A: '#6D8257',
  base0B: '#57826D',
  base0C: '#576D82',
  base0D: '#6D5782',
  base0E: '#82576D',
  base0F: '#825757'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/embers.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/flat.js": (
              /*!****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/flat.js ***!
                \****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'flat',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#2C3E50',
  base01: '#34495E',
  base02: '#7F8C8D',
  base03: '#95A5A6',
  base04: '#BDC3C7',
  base05: '#e0e0e0',
  base06: '#f5f5f5',
  base07: '#ECF0F1',
  base08: '#E74C3C',
  base09: '#E67E22',
  base0A: '#F1C40F',
  base0B: '#2ECC71',
  base0C: '#1ABC9C',
  base0D: '#3498DB',
  base0E: '#9B59B6',
  base0F: '#be643c'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/flat.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/google.js": (
              /*!******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/google.js ***!
                \******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'google',
  author: 'seth wright (http://sethawright.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#CC342B',
  base09: '#F96A38',
  base0A: '#FBA922',
  base0B: '#198844',
  base0C: '#3971ED',
  base0D: '#3971ED',
  base0E: '#A36AC7',
  base0F: '#3971ED'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/google.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/grayscale.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/grayscale.js ***!
                \*********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'grayscale',
  author: 'alexandre gavioli (https://github.com/alexx2/)',
  base00: '#101010',
  base01: '#252525',
  base02: '#464646',
  base03: '#525252',
  base04: '#ababab',
  base05: '#b9b9b9',
  base06: '#e3e3e3',
  base07: '#f7f7f7',
  base08: '#7c7c7c',
  base09: '#999999',
  base0A: '#a0a0a0',
  base0B: '#8e8e8e',
  base0C: '#868686',
  base0D: '#686868',
  base0E: '#747474',
  base0F: '#5e5e5e'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/grayscale.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/greenscreen.js": (
              /*!***********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/greenscreen.js ***!
                \***********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'green screen',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#001100',
  base01: '#003300',
  base02: '#005500',
  base03: '#007700',
  base04: '#009900',
  base05: '#00bb00',
  base06: '#00dd00',
  base07: '#00ff00',
  base08: '#007700',
  base09: '#009900',
  base0A: '#007700',
  base0B: '#00bb00',
  base0C: '#005500',
  base0D: '#009900',
  base0E: '#00bb00',
  base0F: '#005500'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/greenscreen.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/harmonic.js": (
              /*!********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/harmonic.js ***!
                \********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'harmonic16',
  author: 'jannik siebert (https://github.com/janniks)',
  base00: '#0b1c2c',
  base01: '#223b54',
  base02: '#405c79',
  base03: '#627e99',
  base04: '#aabcce',
  base05: '#cbd6e2',
  base06: '#e5ebf1',
  base07: '#f7f9fb',
  base08: '#bf8b56',
  base09: '#bfbf56',
  base0A: '#8bbf56',
  base0B: '#56bf8b',
  base0C: '#568bbf',
  base0D: '#8b56bf',
  base0E: '#bf568b',
  base0F: '#bf5656'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/harmonic.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/hopscotch.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/hopscotch.js ***!
                \*********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'hopscotch',
  author: 'jan t. sott',
  base00: '#322931',
  base01: '#433b42',
  base02: '#5c545b',
  base03: '#797379',
  base04: '#989498',
  base05: '#b9b5b8',
  base06: '#d5d3d5',
  base07: '#ffffff',
  base08: '#dd464c',
  base09: '#fd8b19',
  base0A: '#fdcc59',
  base0B: '#8fc13e',
  base0C: '#149b93',
  base0D: '#1290bf',
  base0E: '#c85e7c',
  base0F: '#b33508'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/hopscotch.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/index.js": (
              /*!*****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/index.js ***!
                \*****************************************************************************************************/
              /***/
              (__unused_webpack_module, exports, __webpack_require__) => {
                "use strict";
                eval(`

exports.__esModule = true;

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _threezerotwofour = __webpack_require__(/*! ./threezerotwofour */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/threezerotwofour.js");

exports.threezerotwofour = _interopRequire(_threezerotwofour);

var _apathy = __webpack_require__(/*! ./apathy */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/apathy.js");

exports.apathy = _interopRequire(_apathy);

var _ashes = __webpack_require__(/*! ./ashes */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ashes.js");

exports.ashes = _interopRequire(_ashes);

var _atelierDune = __webpack_require__(/*! ./atelier-dune */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-dune.js");

exports.atelierDune = _interopRequire(_atelierDune);

var _atelierForest = __webpack_require__(/*! ./atelier-forest */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-forest.js");

exports.atelierForest = _interopRequire(_atelierForest);

var _atelierHeath = __webpack_require__(/*! ./atelier-heath */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-heath.js");

exports.atelierHeath = _interopRequire(_atelierHeath);

var _atelierLakeside = __webpack_require__(/*! ./atelier-lakeside */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-lakeside.js");

exports.atelierLakeside = _interopRequire(_atelierLakeside);

var _atelierSeaside = __webpack_require__(/*! ./atelier-seaside */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/atelier-seaside.js");

exports.atelierSeaside = _interopRequire(_atelierSeaside);

var _bespin = __webpack_require__(/*! ./bespin */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bespin.js");

exports.bespin = _interopRequire(_bespin);

var _brewer = __webpack_require__(/*! ./brewer */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/brewer.js");

exports.brewer = _interopRequire(_brewer);

var _bright = __webpack_require__(/*! ./bright */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/bright.js");

exports.bright = _interopRequire(_bright);

var _chalk = __webpack_require__(/*! ./chalk */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/chalk.js");

exports.chalk = _interopRequire(_chalk);

var _codeschool = __webpack_require__(/*! ./codeschool */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/codeschool.js");

exports.codeschool = _interopRequire(_codeschool);

var _colors = __webpack_require__(/*! ./colors */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/colors.js");

exports.colors = _interopRequire(_colors);

var _default = __webpack_require__(/*! ./default */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/default.js");

exports["default"] = _interopRequire(_default);

var _eighties = __webpack_require__(/*! ./eighties */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/eighties.js");

exports.eighties = _interopRequire(_eighties);

var _embers = __webpack_require__(/*! ./embers */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/embers.js");

exports.embers = _interopRequire(_embers);

var _flat = __webpack_require__(/*! ./flat */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/flat.js");

exports.flat = _interopRequire(_flat);

var _google = __webpack_require__(/*! ./google */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/google.js");

exports.google = _interopRequire(_google);

var _grayscale = __webpack_require__(/*! ./grayscale */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/grayscale.js");

exports.grayscale = _interopRequire(_grayscale);

var _greenscreen = __webpack_require__(/*! ./greenscreen */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/greenscreen.js");

exports.greenscreen = _interopRequire(_greenscreen);

var _harmonic = __webpack_require__(/*! ./harmonic */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/harmonic.js");

exports.harmonic = _interopRequire(_harmonic);

var _hopscotch = __webpack_require__(/*! ./hopscotch */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/hopscotch.js");

exports.hopscotch = _interopRequire(_hopscotch);

var _isotope = __webpack_require__(/*! ./isotope */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/isotope.js");

exports.isotope = _interopRequire(_isotope);

var _marrakesh = __webpack_require__(/*! ./marrakesh */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/marrakesh.js");

exports.marrakesh = _interopRequire(_marrakesh);

var _mocha = __webpack_require__(/*! ./mocha */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/mocha.js");

exports.mocha = _interopRequire(_mocha);

var _monokai = __webpack_require__(/*! ./monokai */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/monokai.js");

exports.monokai = _interopRequire(_monokai);

var _ocean = __webpack_require__(/*! ./ocean */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ocean.js");

exports.ocean = _interopRequire(_ocean);

var _paraiso = __webpack_require__(/*! ./paraiso */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/paraiso.js");

exports.paraiso = _interopRequire(_paraiso);

var _pop = __webpack_require__(/*! ./pop */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/pop.js");

exports.pop = _interopRequire(_pop);

var _railscasts = __webpack_require__(/*! ./railscasts */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/railscasts.js");

exports.railscasts = _interopRequire(_railscasts);

var _shapeshifter = __webpack_require__(/*! ./shapeshifter */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/shapeshifter.js");

exports.shapeshifter = _interopRequire(_shapeshifter);

var _solarized = __webpack_require__(/*! ./solarized */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/solarized.js");

exports.solarized = _interopRequire(_solarized);

var _summerfruit = __webpack_require__(/*! ./summerfruit */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/summerfruit.js");

exports.summerfruit = _interopRequire(_summerfruit);

var _tomorrow = __webpack_require__(/*! ./tomorrow */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tomorrow.js");

exports.tomorrow = _interopRequire(_tomorrow);

var _tube = __webpack_require__(/*! ./tube */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tube.js");

exports.tube = _interopRequire(_tube);

var _twilight = __webpack_require__(/*! ./twilight */ "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/twilight.js");

exports.twilight = _interopRequire(_twilight);

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/index.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/isotope.js": (
              /*!*******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/isotope.js ***!
                \*******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'isotope',
  author: 'jan t. sott',
  base00: '#000000',
  base01: '#404040',
  base02: '#606060',
  base03: '#808080',
  base04: '#c0c0c0',
  base05: '#d0d0d0',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#ff0000',
  base09: '#ff9900',
  base0A: '#ff0099',
  base0B: '#33ff00',
  base0C: '#00ffff',
  base0D: '#0066ff',
  base0E: '#cc00ff',
  base0F: '#3300ff'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/isotope.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/marrakesh.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/marrakesh.js ***!
                \*********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'marrakesh',
  author: 'alexandre gavioli (http://github.com/alexx2/)',
  base00: '#201602',
  base01: '#302e00',
  base02: '#5f5b17',
  base03: '#6c6823',
  base04: '#86813b',
  base05: '#948e48',
  base06: '#ccc37a',
  base07: '#faf0a5',
  base08: '#c35359',
  base09: '#b36144',
  base0A: '#a88339',
  base0B: '#18974e',
  base0C: '#75a738',
  base0D: '#477ca1',
  base0E: '#8868b3',
  base0F: '#b3588e'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/marrakesh.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/mocha.js": (
              /*!*****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/mocha.js ***!
                \*****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'mocha',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#3B3228',
  base01: '#534636',
  base02: '#645240',
  base03: '#7e705a',
  base04: '#b8afad',
  base05: '#d0c8c6',
  base06: '#e9e1dd',
  base07: '#f5eeeb',
  base08: '#cb6077',
  base09: '#d28b71',
  base0A: '#f4bc87',
  base0B: '#beb55b',
  base0C: '#7bbda4',
  base0D: '#8ab3b5',
  base0E: '#a89bb9',
  base0F: '#bb9584'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/mocha.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/monokai.js": (
              /*!*******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/monokai.js ***!
                \*******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/monokai.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ocean.js": (
              /*!*****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ocean.js ***!
                \*****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'ocean',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#2b303b',
  base01: '#343d46',
  base02: '#4f5b66',
  base03: '#65737e',
  base04: '#a7adba',
  base05: '#c0c5ce',
  base06: '#dfe1e8',
  base07: '#eff1f5',
  base08: '#bf616a',
  base09: '#d08770',
  base0A: '#ebcb8b',
  base0B: '#a3be8c',
  base0C: '#96b5b4',
  base0D: '#8fa1b3',
  base0E: '#b48ead',
  base0F: '#ab7967'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/ocean.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/paraiso.js": (
              /*!*******************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/paraiso.js ***!
                \*******************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'paraiso',
  author: 'jan t. sott',
  base00: '#2f1e2e',
  base01: '#41323f',
  base02: '#4f424c',
  base03: '#776e71',
  base04: '#8d8687',
  base05: '#a39e9b',
  base06: '#b9b6b0',
  base07: '#e7e9db',
  base08: '#ef6155',
  base09: '#f99b15',
  base0A: '#fec418',
  base0B: '#48b685',
  base0C: '#5bc4bf',
  base0D: '#06b6ef',
  base0E: '#815ba4',
  base0F: '#e96ba8'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/paraiso.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/pop.js": (
              /*!***************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/pop.js ***!
                \***************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'pop',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#000000',
  base01: '#202020',
  base02: '#303030',
  base03: '#505050',
  base04: '#b0b0b0',
  base05: '#d0d0d0',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#eb008a',
  base09: '#f29333',
  base0A: '#f8ca12',
  base0B: '#37b349',
  base0C: '#00aabb',
  base0D: '#0e5a94',
  base0E: '#b31e8d',
  base0F: '#7a2d00'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/pop.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/railscasts.js": (
              /*!**********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/railscasts.js ***!
                \**********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'railscasts',
  author: 'ryan bates (http://railscasts.com)',
  base00: '#2b2b2b',
  base01: '#272935',
  base02: '#3a4055',
  base03: '#5a647e',
  base04: '#d4cfc9',
  base05: '#e6e1dc',
  base06: '#f4f1ed',
  base07: '#f9f7f3',
  base08: '#da4939',
  base09: '#cc7833',
  base0A: '#ffc66d',
  base0B: '#a5c261',
  base0C: '#519f50',
  base0D: '#6d9cbe',
  base0E: '#b6b3eb',
  base0F: '#bc9458'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/railscasts.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/shapeshifter.js": (
              /*!************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/shapeshifter.js ***!
                \************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'shapeshifter',
  author: 'tyler benziger (http://tybenz.com)',
  base00: '#000000',
  base01: '#040404',
  base02: '#102015',
  base03: '#343434',
  base04: '#555555',
  base05: '#ababab',
  base06: '#e0e0e0',
  base07: '#f9f9f9',
  base08: '#e92f2f',
  base09: '#e09448',
  base0A: '#dddd13',
  base0B: '#0ed839',
  base0C: '#23edda',
  base0D: '#3b48e3',
  base0E: '#f996e2',
  base0F: '#69542d'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/shapeshifter.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/solarized.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/solarized.js ***!
                \*********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'solarized',
  author: 'ethan schoonover (http://ethanschoonover.com/solarized)',
  base00: '#002b36',
  base01: '#073642',
  base02: '#586e75',
  base03: '#657b83',
  base04: '#839496',
  base05: '#93a1a1',
  base06: '#eee8d5',
  base07: '#fdf6e3',
  base08: '#dc322f',
  base09: '#cb4b16',
  base0A: '#b58900',
  base0B: '#859900',
  base0C: '#2aa198',
  base0D: '#268bd2',
  base0E: '#6c71c4',
  base0F: '#d33682'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/solarized.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/summerfruit.js": (
              /*!***********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/summerfruit.js ***!
                \***********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'summerfruit',
  author: 'christopher corley (http://cscorley.github.io/)',
  base00: '#151515',
  base01: '#202020',
  base02: '#303030',
  base03: '#505050',
  base04: '#B0B0B0',
  base05: '#D0D0D0',
  base06: '#E0E0E0',
  base07: '#FFFFFF',
  base08: '#FF0086',
  base09: '#FD8900',
  base0A: '#ABA800',
  base0B: '#00C918',
  base0C: '#1faaaa',
  base0D: '#3777E6',
  base0E: '#AD00A1',
  base0F: '#cc6633'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/summerfruit.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/threezerotwofour.js": (
              /*!****************************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/threezerotwofour.js ***!
                \****************************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'threezerotwofour',
  author: 'jan t. sott (http://github.com/idleberg)',
  base00: '#090300',
  base01: '#3a3432',
  base02: '#4a4543',
  base03: '#5c5855',
  base04: '#807d7c',
  base05: '#a5a2a2',
  base06: '#d6d5d4',
  base07: '#f7f7f7',
  base08: '#db2d20',
  base09: '#e8bbd0',
  base0A: '#fded02',
  base0B: '#01a252',
  base0C: '#b5e4f4',
  base0D: '#01a0e4',
  base0E: '#a16a94',
  base0F: '#cdab53'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/threezerotwofour.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tomorrow.js": (
              /*!********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tomorrow.js ***!
                \********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'tomorrow',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#1d1f21',
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#cc6666',
  base09: '#de935f',
  base0A: '#f0c674',
  base0B: '#b5bd68',
  base0C: '#8abeb7',
  base0D: '#81a2be',
  base0E: '#b294bb',
  base0F: '#a3685a'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tomorrow.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tube.js": (
              /*!****************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tube.js ***!
                \****************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'london tube',
  author: 'jan t. sott',
  base00: '#231f20',
  base01: '#1c3f95',
  base02: '#5a5758',
  base03: '#737171',
  base04: '#959ca1',
  base05: '#d9d8d8',
  base06: '#e7e7e8',
  base07: '#ffffff',
  base08: '#ee2e24',
  base09: '#f386a1',
  base0A: '#ffd204',
  base0B: '#00853e',
  base0C: '#85cebc',
  base0D: '#009ddc',
  base0E: '#98005d',
  base0F: '#b06110'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/tube.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/twilight.js": (
              /*!********************************************************************************************************!*\
                !*** ../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/twilight.js ***!
                \********************************************************************************************************/
              /***/
              (module, exports) => {
                "use strict";
                eval(`

exports.__esModule = true;
exports["default"] = {
  scheme: 'twilight',
  author: 'david hart (http://hart-dev.com)',
  base00: '#1e1e1e',
  base01: '#323537',
  base02: '#464b50',
  base03: '#5f5a60',
  base04: '#838184',
  base05: '#a7a7a7',
  base06: '#c3c3c3',
  base07: '#ffffff',
  base08: '#cf6a4c',
  base09: '#cda869',
  base0A: '#f9ee98',
  base0B: '#8f9d6a',
  base0C: '#afc4db',
  base0D: '#7587a6',
  base0E: '#9b859d',
  base0F: '#9b703f'
};
module.exports = exports['default'];

//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/base16-npm-1.0.0-8525ba5e40-0cd449a2db.zip/node_modules/base16/lib/twilight.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/conversions.js": (
              /*!*********************************************************************************************************************!*\
                !*** ../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/conversions.js ***!
                \*********************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval("/* MIT license */\nvar cssKeywords = __webpack_require__(/*! color-name */ \"../../.yarn/cache/color-name-npm-1.1.3-728b7b5d39-09c5d3e33d.zip/node_modules/color-name/index.js\");\n\n// NOTE: conversions should only return primitive values (i.e. arrays, or\n//       values that give correct `typeof` results).\n//       do not use box values types (i.e. Number(), String(), etc.)\n\nvar reverseKeywords = {};\nfor (var key in cssKeywords) {\n	if (cssKeywords.hasOwnProperty(key)) {\n		reverseKeywords[cssKeywords[key]] = key;\n	}\n}\n\nvar convert = module.exports = {\n	rgb: {channels: 3, labels: 'rgb'},\n	hsl: {channels: 3, labels: 'hsl'},\n	hsv: {channels: 3, labels: 'hsv'},\n	hwb: {channels: 3, labels: 'hwb'},\n	cmyk: {channels: 4, labels: 'cmyk'},\n	xyz: {channels: 3, labels: 'xyz'},\n	lab: {channels: 3, labels: 'lab'},\n	lch: {channels: 3, labels: 'lch'},\n	hex: {channels: 1, labels: ['hex']},\n	keyword: {channels: 1, labels: ['keyword']},\n	ansi16: {channels: 1, labels: ['ansi16']},\n	ansi256: {channels: 1, labels: ['ansi256']},\n	hcg: {channels: 3, labels: ['h', 'c', 'g']},\n	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},\n	gray: {channels: 1, labels: ['gray']}\n};\n\n// hide .channels and .labels properties\nfor (var model in convert) {\n	if (convert.hasOwnProperty(model)) {\n		if (!('channels' in convert[model])) {\n			throw new Error('missing channels property: ' + model);\n		}\n\n		if (!('labels' in convert[model])) {\n			throw new Error('missing channel labels property: ' + model);\n		}\n\n		if (convert[model].labels.length !== convert[model].channels) {\n			throw new Error('channel and label counts mismatch: ' + model);\n		}\n\n		var channels = convert[model].channels;\n		var labels = convert[model].labels;\n		delete convert[model].channels;\n		delete convert[model].labels;\n		Object.defineProperty(convert[model], 'channels', {value: channels});\n		Object.defineProperty(convert[model], 'labels', {value: labels});\n	}\n}\n\nconvert.rgb.hsl = function (rgb) {\n	var r = rgb[0] / 255;\n	var g = rgb[1] / 255;\n	var b = rgb[2] / 255;\n	var min = Math.min(r, g, b);\n	var max = Math.max(r, g, b);\n	var delta = max - min;\n	var h;\n	var s;\n	var l;\n\n	if (max === min) {\n		h = 0;\n	} else if (r === max) {\n		h = (g - b) / delta;\n	} else if (g === max) {\n		h = 2 + (b - r) / delta;\n	} else if (b === max) {\n		h = 4 + (r - g) / delta;\n	}\n\n	h = Math.min(h * 60, 360);\n\n	if (h < 0) {\n		h += 360;\n	}\n\n	l = (min + max) / 2;\n\n	if (max === min) {\n		s = 0;\n	} else if (l <= 0.5) {\n		s = delta / (max + min);\n	} else {\n		s = delta / (2 - max - min);\n	}\n\n	return [h, s * 100, l * 100];\n};\n\nconvert.rgb.hsv = function (rgb) {\n	var rdif;\n	var gdif;\n	var bdif;\n	var h;\n	var s;\n\n	var r = rgb[0] / 255;\n	var g = rgb[1] / 255;\n	var b = rgb[2] / 255;\n	var v = Math.max(r, g, b);\n	var diff = v - Math.min(r, g, b);\n	var diffc = function (c) {\n		return (v - c) / 6 / diff + 1 / 2;\n	};\n\n	if (diff === 0) {\n		h = s = 0;\n	} else {\n		s = diff / v;\n		rdif = diffc(r);\n		gdif = diffc(g);\n		bdif = diffc(b);\n\n		if (r === v) {\n			h = bdif - gdif;\n		} else if (g === v) {\n			h = (1 / 3) + rdif - bdif;\n		} else if (b === v) {\n			h = (2 / 3) + gdif - rdif;\n		}\n		if (h < 0) {\n			h += 1;\n		} else if (h > 1) {\n			h -= 1;\n		}\n	}\n\n	return [\n		h * 360,\n		s * 100,\n		v * 100\n	];\n};\n\nconvert.rgb.hwb = function (rgb) {\n	var r = rgb[0];\n	var g = rgb[1];\n	var b = rgb[2];\n	var h = convert.rgb.hsl(rgb)[0];\n	var w = 1 / 255 * Math.min(r, Math.min(g, b));\n\n	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));\n\n	return [h, w * 100, b * 100];\n};\n\nconvert.rgb.cmyk = function (rgb) {\n	var r = rgb[0] / 255;\n	var g = rgb[1] / 255;\n	var b = rgb[2] / 255;\n	var c;\n	var m;\n	var y;\n	var k;\n\n	k = Math.min(1 - r, 1 - g, 1 - b);\n	c = (1 - r - k) / (1 - k) || 0;\n	m = (1 - g - k) / (1 - k) || 0;\n	y = (1 - b - k) / (1 - k) || 0;\n\n	return [c * 100, m * 100, y * 100, k * 100];\n};\n\n/**\n * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance\n * */\nfunction comparativeDistance(x, y) {\n	return (\n		Math.pow(x[0] - y[0], 2) +\n		Math.pow(x[1] - y[1], 2) +\n		Math.pow(x[2] - y[2], 2)\n	);\n}\n\nconvert.rgb.keyword = function (rgb) {\n	var reversed = reverseKeywords[rgb];\n	if (reversed) {\n		return reversed;\n	}\n\n	var currentClosestDistance = Infinity;\n	var currentClosestKeyword;\n\n	for (var keyword in cssKeywords) {\n		if (cssKeywords.hasOwnProperty(keyword)) {\n			var value = cssKeywords[keyword];\n\n			// Compute comparative distance\n			var distance = comparativeDistance(rgb, value);\n\n			// Check if its less, if so set as closest\n			if (distance < currentClosestDistance) {\n				currentClosestDistance = distance;\n				currentClosestKeyword = keyword;\n			}\n		}\n	}\n\n	return currentClosestKeyword;\n};\n\nconvert.keyword.rgb = function (keyword) {\n	return cssKeywords[keyword];\n};\n\nconvert.rgb.xyz = function (rgb) {\n	var r = rgb[0] / 255;\n	var g = rgb[1] / 255;\n	var b = rgb[2] / 255;\n\n	// assume sRGB\n	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);\n	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);\n	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);\n\n	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);\n	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);\n	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);\n\n	return [x * 100, y * 100, z * 100];\n};\n\nconvert.rgb.lab = function (rgb) {\n	var xyz = convert.rgb.xyz(rgb);\n	var x = xyz[0];\n	var y = xyz[1];\n	var z = xyz[2];\n	var l;\n	var a;\n	var b;\n\n	x /= 95.047;\n	y /= 100;\n	z /= 108.883;\n\n	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);\n	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);\n	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);\n\n	l = (116 * y) - 16;\n	a = 500 * (x - y);\n	b = 200 * (y - z);\n\n	return [l, a, b];\n};\n\nconvert.hsl.rgb = function (hsl) {\n	var h = hsl[0] / 360;\n	var s = hsl[1] / 100;\n	var l = hsl[2] / 100;\n	var t1;\n	var t2;\n	var t3;\n	var rgb;\n	var val;\n\n	if (s === 0) {\n		val = l * 255;\n		return [val, val, val];\n	}\n\n	if (l < 0.5) {\n		t2 = l * (1 + s);\n	} else {\n		t2 = l + s - l * s;\n	}\n\n	t1 = 2 * l - t2;\n\n	rgb = [0, 0, 0];\n	for (var i = 0; i < 3; i++) {\n		t3 = h + 1 / 3 * -(i - 1);\n		if (t3 < 0) {\n			t3++;\n		}\n		if (t3 > 1) {\n			t3--;\n		}\n\n		if (6 * t3 < 1) {\n			val = t1 + (t2 - t1) * 6 * t3;\n		} else if (2 * t3 < 1) {\n			val = t2;\n		} else if (3 * t3 < 2) {\n			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;\n		} else {\n			val = t1;\n		}\n\n		rgb[i] = val * 255;\n	}\n\n	return rgb;\n};\n\nconvert.hsl.hsv = function (hsl) {\n	var h = hsl[0];\n	var s = hsl[1] / 100;\n	var l = hsl[2] / 100;\n	var smin = s;\n	var lmin = Math.max(l, 0.01);\n	var sv;\n	var v;\n\n	l *= 2;\n	s *= (l <= 1) ? l : 2 - l;\n	smin *= lmin <= 1 ? lmin : 2 - lmin;\n	v = (l + s) / 2;\n	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);\n\n	return [h, sv * 100, v * 100];\n};\n\nconvert.hsv.rgb = function (hsv) {\n	var h = hsv[0] / 60;\n	var s = hsv[1] / 100;\n	var v = hsv[2] / 100;\n	var hi = Math.floor(h) % 6;\n\n	var f = h - Math.floor(h);\n	var p = 255 * v * (1 - s);\n	var q = 255 * v * (1 - (s * f));\n	var t = 255 * v * (1 - (s * (1 - f)));\n	v *= 255;\n\n	switch (hi) {\n		case 0:\n			return [v, t, p];\n		case 1:\n			return [q, v, p];\n		case 2:\n			return [p, v, t];\n		case 3:\n			return [p, q, v];\n		case 4:\n			return [t, p, v];\n		case 5:\n			return [v, p, q];\n	}\n};\n\nconvert.hsv.hsl = function (hsv) {\n	var h = hsv[0];\n	var s = hsv[1] / 100;\n	var v = hsv[2] / 100;\n	var vmin = Math.max(v, 0.01);\n	var lmin;\n	var sl;\n	var l;\n\n	l = (2 - s) * v;\n	lmin = (2 - s) * vmin;\n	sl = s * vmin;\n	sl /= (lmin <= 1) ? lmin : 2 - lmin;\n	sl = sl || 0;\n	l /= 2;\n\n	return [h, sl * 100, l * 100];\n};\n\n// http://dev.w3.org/csswg/css-color/#hwb-to-rgb\nconvert.hwb.rgb = function (hwb) {\n	var h = hwb[0] / 360;\n	var wh = hwb[1] / 100;\n	var bl = hwb[2] / 100;\n	var ratio = wh + bl;\n	var i;\n	var v;\n	var f;\n	var n;\n\n	// wh + bl cant be > 1\n	if (ratio > 1) {\n		wh /= ratio;\n		bl /= ratio;\n	}\n\n	i = Math.floor(6 * h);\n	v = 1 - bl;\n	f = 6 * h - i;\n\n	if ((i & 0x01) !== 0) {\n		f = 1 - f;\n	}\n\n	n = wh + f * (v - wh); // linear interpolation\n\n	var r;\n	var g;\n	var b;\n	switch (i) {\n		default:\n		case 6:\n		case 0: r = v; g = n; b = wh; break;\n		case 1: r = n; g = v; b = wh; break;\n		case 2: r = wh; g = v; b = n; break;\n		case 3: r = wh; g = n; b = v; break;\n		case 4: r = n; g = wh; b = v; break;\n		case 5: r = v; g = wh; b = n; break;\n	}\n\n	return [r * 255, g * 255, b * 255];\n};\n\nconvert.cmyk.rgb = function (cmyk) {\n	var c = cmyk[0] / 100;\n	var m = cmyk[1] / 100;\n	var y = cmyk[2] / 100;\n	var k = cmyk[3] / 100;\n	var r;\n	var g;\n	var b;\n\n	r = 1 - Math.min(1, c * (1 - k) + k);\n	g = 1 - Math.min(1, m * (1 - k) + k);\n	b = 1 - Math.min(1, y * (1 - k) + k);\n\n	return [r * 255, g * 255, b * 255];\n};\n\nconvert.xyz.rgb = function (xyz) {\n	var x = xyz[0] / 100;\n	var y = xyz[1] / 100;\n	var z = xyz[2] / 100;\n	var r;\n	var g;\n	var b;\n\n	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);\n	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);\n	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);\n\n	// assume sRGB\n	r = r > 0.0031308\n		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)\n		: r * 12.92;\n\n	g = g > 0.0031308\n		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)\n		: g * 12.92;\n\n	b = b > 0.0031308\n		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)\n		: b * 12.92;\n\n	r = Math.min(Math.max(0, r), 1);\n	g = Math.min(Math.max(0, g), 1);\n	b = Math.min(Math.max(0, b), 1);\n\n	return [r * 255, g * 255, b * 255];\n};\n\nconvert.xyz.lab = function (xyz) {\n	var x = xyz[0];\n	var y = xyz[1];\n	var z = xyz[2];\n	var l;\n	var a;\n	var b;\n\n	x /= 95.047;\n	y /= 100;\n	z /= 108.883;\n\n	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);\n	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);\n	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);\n\n	l = (116 * y) - 16;\n	a = 500 * (x - y);\n	b = 200 * (y - z);\n\n	return [l, a, b];\n};\n\nconvert.lab.xyz = function (lab) {\n	var l = lab[0];\n	var a = lab[1];\n	var b = lab[2];\n	var x;\n	var y;\n	var z;\n\n	y = (l + 16) / 116;\n	x = a / 500 + y;\n	z = y - b / 200;\n\n	var y2 = Math.pow(y, 3);\n	var x2 = Math.pow(x, 3);\n	var z2 = Math.pow(z, 3);\n	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;\n	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;\n	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;\n\n	x *= 95.047;\n	y *= 100;\n	z *= 108.883;\n\n	return [x, y, z];\n};\n\nconvert.lab.lch = function (lab) {\n	var l = lab[0];\n	var a = lab[1];\n	var b = lab[2];\n	var hr;\n	var h;\n	var c;\n\n	hr = Math.atan2(b, a);\n	h = hr * 360 / 2 / Math.PI;\n\n	if (h < 0) {\n		h += 360;\n	}\n\n	c = Math.sqrt(a * a + b * b);\n\n	return [l, c, h];\n};\n\nconvert.lch.lab = function (lch) {\n	var l = lch[0];\n	var c = lch[1];\n	var h = lch[2];\n	var a;\n	var b;\n	var hr;\n\n	hr = h / 360 * 2 * Math.PI;\n	a = c * Math.cos(hr);\n	b = c * Math.sin(hr);\n\n	return [l, a, b];\n};\n\nconvert.rgb.ansi16 = function (args) {\n	var r = args[0];\n	var g = args[1];\n	var b = args[2];\n	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization\n\n	value = Math.round(value / 50);\n\n	if (value === 0) {\n		return 30;\n	}\n\n	var ansi = 30\n		+ ((Math.round(b / 255) << 2)\n		| (Math.round(g / 255) << 1)\n		| Math.round(r / 255));\n\n	if (value === 2) {\n		ansi += 60;\n	}\n\n	return ansi;\n};\n\nconvert.hsv.ansi16 = function (args) {\n	// optimization here; we already know the value and don't need to get\n	// it converted for us.\n	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);\n};\n\nconvert.rgb.ansi256 = function (args) {\n	var r = args[0];\n	var g = args[1];\n	var b = args[2];\n\n	// we use the extended greyscale palette here, with the exception of\n	// black and white. normal palette only has 4 greyscale shades.\n	if (r === g && g === b) {\n		if (r < 8) {\n			return 16;\n		}\n\n		if (r > 248) {\n			return 231;\n		}\n\n		return Math.round(((r - 8) / 247) * 24) + 232;\n	}\n\n	var ansi = 16\n		+ (36 * Math.round(r / 255 * 5))\n		+ (6 * Math.round(g / 255 * 5))\n		+ Math.round(b / 255 * 5);\n\n	return ansi;\n};\n\nconvert.ansi16.rgb = function (args) {\n	var color = args % 10;\n\n	// handle greyscale\n	if (color === 0 || color === 7) {\n		if (args > 50) {\n			color += 3.5;\n		}\n\n		color = color / 10.5 * 255;\n\n		return [color, color, color];\n	}\n\n	var mult = (~~(args > 50) + 1) * 0.5;\n	var r = ((color & 1) * mult) * 255;\n	var g = (((color >> 1) & 1) * mult) * 255;\n	var b = (((color >> 2) & 1) * mult) * 255;\n\n	return [r, g, b];\n};\n\nconvert.ansi256.rgb = function (args) {\n	// handle greyscale\n	if (args >= 232) {\n		var c = (args - 232) * 10 + 8;\n		return [c, c, c];\n	}\n\n	args -= 16;\n\n	var rem;\n	var r = Math.floor(args / 36) / 5 * 255;\n	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;\n	var b = (rem % 6) / 5 * 255;\n\n	return [r, g, b];\n};\n\nconvert.rgb.hex = function (args) {\n	var integer = ((Math.round(args[0]) & 0xFF) << 16)\n		+ ((Math.round(args[1]) & 0xFF) << 8)\n		+ (Math.round(args[2]) & 0xFF);\n\n	var string = integer.toString(16).toUpperCase();\n	return '000000'.substring(string.length) + string;\n};\n\nconvert.hex.rgb = function (args) {\n	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);\n	if (!match) {\n		return [0, 0, 0];\n	}\n\n	var colorString = match[0];\n\n	if (match[0].length === 3) {\n		colorString = colorString.split('').map(function (char) {\n			return char + char;\n		}).join('');\n	}\n\n	var integer = parseInt(colorString, 16);\n	var r = (integer >> 16) & 0xFF;\n	var g = (integer >> 8) & 0xFF;\n	var b = integer & 0xFF;\n\n	return [r, g, b];\n};\n\nconvert.rgb.hcg = function (rgb) {\n	var r = rgb[0] / 255;\n	var g = rgb[1] / 255;\n	var b = rgb[2] / 255;\n	var max = Math.max(Math.max(r, g), b);\n	var min = Math.min(Math.min(r, g), b);\n	var chroma = (max - min);\n	var grayscale;\n	var hue;\n\n	if (chroma < 1) {\n		grayscale = min / (1 - chroma);\n	} else {\n		grayscale = 0;\n	}\n\n	if (chroma <= 0) {\n		hue = 0;\n	} else\n	if (max === r) {\n		hue = ((g - b) / chroma) % 6;\n	} else\n	if (max === g) {\n		hue = 2 + (b - r) / chroma;\n	} else {\n		hue = 4 + (r - g) / chroma + 4;\n	}\n\n	hue /= 6;\n	hue %= 1;\n\n	return [hue * 360, chroma * 100, grayscale * 100];\n};\n\nconvert.hsl.hcg = function (hsl) {\n	var s = hsl[1] / 100;\n	var l = hsl[2] / 100;\n	var c = 1;\n	var f = 0;\n\n	if (l < 0.5) {\n		c = 2.0 * s * l;\n	} else {\n		c = 2.0 * s * (1.0 - l);\n	}\n\n	if (c < 1.0) {\n		f = (l - 0.5 * c) / (1.0 - c);\n	}\n\n	return [hsl[0], c * 100, f * 100];\n};\n\nconvert.hsv.hcg = function (hsv) {\n	var s = hsv[1] / 100;\n	var v = hsv[2] / 100;\n\n	var c = s * v;\n	var f = 0;\n\n	if (c < 1.0) {\n		f = (v - c) / (1 - c);\n	}\n\n	return [hsv[0], c * 100, f * 100];\n};\n\nconvert.hcg.rgb = function (hcg) {\n	var h = hcg[0] / 360;\n	var c = hcg[1] / 100;\n	var g = hcg[2] / 100;\n\n	if (c === 0.0) {\n		return [g * 255, g * 255, g * 255];\n	}\n\n	var pure = [0, 0, 0];\n	var hi = (h % 1) * 6;\n	var v = hi % 1;\n	var w = 1 - v;\n	var mg = 0;\n\n	switch (Math.floor(hi)) {\n		case 0:\n			pure[0] = 1; pure[1] = v; pure[2] = 0; break;\n		case 1:\n			pure[0] = w; pure[1] = 1; pure[2] = 0; break;\n		case 2:\n			pure[0] = 0; pure[1] = 1; pure[2] = v; break;\n		case 3:\n			pure[0] = 0; pure[1] = w; pure[2] = 1; break;\n		case 4:\n			pure[0] = v; pure[1] = 0; pure[2] = 1; break;\n		default:\n			pure[0] = 1; pure[1] = 0; pure[2] = w;\n	}\n\n	mg = (1.0 - c) * g;\n\n	return [\n		(c * pure[0] + mg) * 255,\n		(c * pure[1] + mg) * 255,\n		(c * pure[2] + mg) * 255\n	];\n};\n\nconvert.hcg.hsv = function (hcg) {\n	var c = hcg[1] / 100;\n	var g = hcg[2] / 100;\n\n	var v = c + g * (1.0 - c);\n	var f = 0;\n\n	if (v > 0.0) {\n		f = c / v;\n	}\n\n	return [hcg[0], f * 100, v * 100];\n};\n\nconvert.hcg.hsl = function (hcg) {\n	var c = hcg[1] / 100;\n	var g = hcg[2] / 100;\n\n	var l = g * (1.0 - c) + 0.5 * c;\n	var s = 0;\n\n	if (l > 0.0 && l < 0.5) {\n		s = c / (2 * l);\n	} else\n	if (l >= 0.5 && l < 1.0) {\n		s = c / (2 * (1 - l));\n	}\n\n	return [hcg[0], s * 100, l * 100];\n};\n\nconvert.hcg.hwb = function (hcg) {\n	var c = hcg[1] / 100;\n	var g = hcg[2] / 100;\n	var v = c + g * (1.0 - c);\n	return [hcg[0], (v - c) * 100, (1 - v) * 100];\n};\n\nconvert.hwb.hcg = function (hwb) {\n	var w = hwb[1] / 100;\n	var b = hwb[2] / 100;\n	var v = 1 - b;\n	var c = v - w;\n	var g = 0;\n\n	if (c < 1) {\n		g = (v - c) / (1 - c);\n	}\n\n	return [hwb[0], c * 100, g * 100];\n};\n\nconvert.apple.rgb = function (apple) {\n	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];\n};\n\nconvert.rgb.apple = function (rgb) {\n	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];\n};\n\nconvert.gray.rgb = function (args) {\n	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];\n};\n\nconvert.gray.hsl = convert.gray.hsv = function (args) {\n	return [0, 0, args[0]];\n};\n\nconvert.gray.hwb = function (gray) {\n	return [0, 100, gray[0]];\n};\n\nconvert.gray.cmyk = function (gray) {\n	return [0, 0, 0, gray[0]];\n};\n\nconvert.gray.lab = function (gray) {\n	return [gray[0], 0, 0];\n};\n\nconvert.gray.hex = function (gray) {\n	var val = Math.round(gray[0] / 100 * 255) & 0xFF;\n	var integer = (val << 16) + (val << 8) + val;\n\n	var string = integer.toString(16).toUpperCase();\n	return '000000'.substring(string.length) + string;\n};\n\nconvert.rgb.gray = function (rgb) {\n	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;\n	return [val / 255 * 100];\n};\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/conversions.js?");
              }
            ),
            /***/
            "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/index.js": (
              /*!***************************************************************************************************************!*\
                !*** ../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/index.js ***!
                \***************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval(`var conversions = __webpack_require__(/*! ./conversions */ "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/conversions.js");
var route = __webpack_require__(/*! ./route */ "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/route.js");

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/index.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/route.js": (
              /*!***************************************************************************************************************!*\
                !*** ../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/route.js ***!
                \***************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval("var conversions = __webpack_require__(/*! ./conversions */ \"../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/conversions.js\");\n\n/*\n	this function routes a model to all other models.\n\n	all functions that are routed have a property `.conversion` attached\n	to the returned synthetic function. This property is an array\n	of strings, each with the steps in between the 'from' and 'to'\n	color models (inclusive).\n\n	conversions that are not possible simply are not included.\n*/\n\nfunction buildGraph() {\n	var graph = {};\n	// https://jsperf.com/object-keys-vs-for-in-with-closure/3\n	var models = Object.keys(conversions);\n\n	for (var len = models.length, i = 0; i < len; i++) {\n		graph[models[i]] = {\n			// http://jsperf.com/1-vs-infinity\n			// micro-opt, but this is simple.\n			distance: -1,\n			parent: null\n		};\n	}\n\n	return graph;\n}\n\n// https://en.wikipedia.org/wiki/Breadth-first_search\nfunction deriveBFS(fromModel) {\n	var graph = buildGraph();\n	var queue = [fromModel]; // unshift -> queue -> pop\n\n	graph[fromModel].distance = 0;\n\n	while (queue.length) {\n		var current = queue.pop();\n		var adjacents = Object.keys(conversions[current]);\n\n		for (var len = adjacents.length, i = 0; i < len; i++) {\n			var adjacent = adjacents[i];\n			var node = graph[adjacent];\n\n			if (node.distance === -1) {\n				node.distance = graph[current].distance + 1;\n				node.parent = current;\n				queue.unshift(adjacent);\n			}\n		}\n	}\n\n	return graph;\n}\n\nfunction link(from, to) {\n	return function (args) {\n		return to(from(args));\n	};\n}\n\nfunction wrapConversion(toModel, graph) {\n	var path = [graph[toModel].parent, toModel];\n	var fn = conversions[graph[toModel].parent][toModel];\n\n	var cur = graph[toModel].parent;\n	while (graph[cur].parent) {\n		path.unshift(graph[cur].parent);\n		fn = link(conversions[graph[cur].parent][cur], fn);\n		cur = graph[cur].parent;\n	}\n\n	fn.conversion = path;\n	return fn;\n}\n\nmodule.exports = function (fromModel) {\n	var graph = deriveBFS(fromModel);\n	var conversion = {};\n\n	var models = Object.keys(graph);\n	for (var len = models.length, i = 0; i < len; i++) {\n		var toModel = models[i];\n		var node = graph[toModel];\n\n		if (node.parent === null) {\n			// no possible conversion, or this node is the source model.\n			continue;\n		}\n\n		conversion[toModel] = wrapConversion(toModel, graph);\n	}\n\n	return conversion;\n};\n\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/route.js?");
              }
            ),
            /***/
            "../../.yarn/cache/color-name-npm-1.1.3-728b7b5d39-09c5d3e33d.zip/node_modules/color-name/index.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/color-name-npm-1.1.3-728b7b5d39-09c5d3e33d.zip/node_modules/color-name/index.js ***!
                \*********************************************************************************************************/
              /***/
              (module) => {
                "use strict";
                eval('\r\n\r\nmodule.exports = {\r\n	"aliceblue": [240, 248, 255],\r\n	"antiquewhite": [250, 235, 215],\r\n	"aqua": [0, 255, 255],\r\n	"aquamarine": [127, 255, 212],\r\n	"azure": [240, 255, 255],\r\n	"beige": [245, 245, 220],\r\n	"bisque": [255, 228, 196],\r\n	"black": [0, 0, 0],\r\n	"blanchedalmond": [255, 235, 205],\r\n	"blue": [0, 0, 255],\r\n	"blueviolet": [138, 43, 226],\r\n	"brown": [165, 42, 42],\r\n	"burlywood": [222, 184, 135],\r\n	"cadetblue": [95, 158, 160],\r\n	"chartreuse": [127, 255, 0],\r\n	"chocolate": [210, 105, 30],\r\n	"coral": [255, 127, 80],\r\n	"cornflowerblue": [100, 149, 237],\r\n	"cornsilk": [255, 248, 220],\r\n	"crimson": [220, 20, 60],\r\n	"cyan": [0, 255, 255],\r\n	"darkblue": [0, 0, 139],\r\n	"darkcyan": [0, 139, 139],\r\n	"darkgoldenrod": [184, 134, 11],\r\n	"darkgray": [169, 169, 169],\r\n	"darkgreen": [0, 100, 0],\r\n	"darkgrey": [169, 169, 169],\r\n	"darkkhaki": [189, 183, 107],\r\n	"darkmagenta": [139, 0, 139],\r\n	"darkolivegreen": [85, 107, 47],\r\n	"darkorange": [255, 140, 0],\r\n	"darkorchid": [153, 50, 204],\r\n	"darkred": [139, 0, 0],\r\n	"darksalmon": [233, 150, 122],\r\n	"darkseagreen": [143, 188, 143],\r\n	"darkslateblue": [72, 61, 139],\r\n	"darkslategray": [47, 79, 79],\r\n	"darkslategrey": [47, 79, 79],\r\n	"darkturquoise": [0, 206, 209],\r\n	"darkviolet": [148, 0, 211],\r\n	"deeppink": [255, 20, 147],\r\n	"deepskyblue": [0, 191, 255],\r\n	"dimgray": [105, 105, 105],\r\n	"dimgrey": [105, 105, 105],\r\n	"dodgerblue": [30, 144, 255],\r\n	"firebrick": [178, 34, 34],\r\n	"floralwhite": [255, 250, 240],\r\n	"forestgreen": [34, 139, 34],\r\n	"fuchsia": [255, 0, 255],\r\n	"gainsboro": [220, 220, 220],\r\n	"ghostwhite": [248, 248, 255],\r\n	"gold": [255, 215, 0],\r\n	"goldenrod": [218, 165, 32],\r\n	"gray": [128, 128, 128],\r\n	"green": [0, 128, 0],\r\n	"greenyellow": [173, 255, 47],\r\n	"grey": [128, 128, 128],\r\n	"honeydew": [240, 255, 240],\r\n	"hotpink": [255, 105, 180],\r\n	"indianred": [205, 92, 92],\r\n	"indigo": [75, 0, 130],\r\n	"ivory": [255, 255, 240],\r\n	"khaki": [240, 230, 140],\r\n	"lavender": [230, 230, 250],\r\n	"lavenderblush": [255, 240, 245],\r\n	"lawngreen": [124, 252, 0],\r\n	"lemonchiffon": [255, 250, 205],\r\n	"lightblue": [173, 216, 230],\r\n	"lightcoral": [240, 128, 128],\r\n	"lightcyan": [224, 255, 255],\r\n	"lightgoldenrodyellow": [250, 250, 210],\r\n	"lightgray": [211, 211, 211],\r\n	"lightgreen": [144, 238, 144],\r\n	"lightgrey": [211, 211, 211],\r\n	"lightpink": [255, 182, 193],\r\n	"lightsalmon": [255, 160, 122],\r\n	"lightseagreen": [32, 178, 170],\r\n	"lightskyblue": [135, 206, 250],\r\n	"lightslategray": [119, 136, 153],\r\n	"lightslategrey": [119, 136, 153],\r\n	"lightsteelblue": [176, 196, 222],\r\n	"lightyellow": [255, 255, 224],\r\n	"lime": [0, 255, 0],\r\n	"limegreen": [50, 205, 50],\r\n	"linen": [250, 240, 230],\r\n	"magenta": [255, 0, 255],\r\n	"maroon": [128, 0, 0],\r\n	"mediumaquamarine": [102, 205, 170],\r\n	"mediumblue": [0, 0, 205],\r\n	"mediumorchid": [186, 85, 211],\r\n	"mediumpurple": [147, 112, 219],\r\n	"mediumseagreen": [60, 179, 113],\r\n	"mediumslateblue": [123, 104, 238],\r\n	"mediumspringgreen": [0, 250, 154],\r\n	"mediumturquoise": [72, 209, 204],\r\n	"mediumvioletred": [199, 21, 133],\r\n	"midnightblue": [25, 25, 112],\r\n	"mintcream": [245, 255, 250],\r\n	"mistyrose": [255, 228, 225],\r\n	"moccasin": [255, 228, 181],\r\n	"navajowhite": [255, 222, 173],\r\n	"navy": [0, 0, 128],\r\n	"oldlace": [253, 245, 230],\r\n	"olive": [128, 128, 0],\r\n	"olivedrab": [107, 142, 35],\r\n	"orange": [255, 165, 0],\r\n	"orangered": [255, 69, 0],\r\n	"orchid": [218, 112, 214],\r\n	"palegoldenrod": [238, 232, 170],\r\n	"palegreen": [152, 251, 152],\r\n	"paleturquoise": [175, 238, 238],\r\n	"palevioletred": [219, 112, 147],\r\n	"papayawhip": [255, 239, 213],\r\n	"peachpuff": [255, 218, 185],\r\n	"peru": [205, 133, 63],\r\n	"pink": [255, 192, 203],\r\n	"plum": [221, 160, 221],\r\n	"powderblue": [176, 224, 230],\r\n	"purple": [128, 0, 128],\r\n	"rebeccapurple": [102, 51, 153],\r\n	"red": [255, 0, 0],\r\n	"rosybrown": [188, 143, 143],\r\n	"royalblue": [65, 105, 225],\r\n	"saddlebrown": [139, 69, 19],\r\n	"salmon": [250, 128, 114],\r\n	"sandybrown": [244, 164, 96],\r\n	"seagreen": [46, 139, 87],\r\n	"seashell": [255, 245, 238],\r\n	"sienna": [160, 82, 45],\r\n	"silver": [192, 192, 192],\r\n	"skyblue": [135, 206, 235],\r\n	"slateblue": [106, 90, 205],\r\n	"slategray": [112, 128, 144],\r\n	"slategrey": [112, 128, 144],\r\n	"snow": [255, 250, 250],\r\n	"springgreen": [0, 255, 127],\r\n	"steelblue": [70, 130, 180],\r\n	"tan": [210, 180, 140],\r\n	"teal": [0, 128, 128],\r\n	"thistle": [216, 191, 216],\r\n	"tomato": [255, 99, 71],\r\n	"turquoise": [64, 224, 208],\r\n	"violet": [238, 130, 238],\r\n	"wheat": [245, 222, 179],\r\n	"white": [255, 255, 255],\r\n	"whitesmoke": [245, 245, 245],\r\n	"yellow": [255, 255, 0],\r\n	"yellowgreen": [154, 205, 50]\r\n};\r\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-name-npm-1.1.3-728b7b5d39-09c5d3e33d.zip/node_modules/color-name/index.js?');
              }
            ),
            /***/
            "../../.yarn/cache/color-name-npm-1.1.4-025792b0ea-b044585952.zip/node_modules/color-name/index.js": (
              /*!*********************************************************************************************************!*\
                !*** ../../.yarn/cache/color-name-npm-1.1.4-025792b0ea-b044585952.zip/node_modules/color-name/index.js ***!
                \*********************************************************************************************************/
              /***/
              (module) => {
                "use strict";
                eval('\r\n\r\nmodule.exports = {\r\n	"aliceblue": [240, 248, 255],\r\n	"antiquewhite": [250, 235, 215],\r\n	"aqua": [0, 255, 255],\r\n	"aquamarine": [127, 255, 212],\r\n	"azure": [240, 255, 255],\r\n	"beige": [245, 245, 220],\r\n	"bisque": [255, 228, 196],\r\n	"black": [0, 0, 0],\r\n	"blanchedalmond": [255, 235, 205],\r\n	"blue": [0, 0, 255],\r\n	"blueviolet": [138, 43, 226],\r\n	"brown": [165, 42, 42],\r\n	"burlywood": [222, 184, 135],\r\n	"cadetblue": [95, 158, 160],\r\n	"chartreuse": [127, 255, 0],\r\n	"chocolate": [210, 105, 30],\r\n	"coral": [255, 127, 80],\r\n	"cornflowerblue": [100, 149, 237],\r\n	"cornsilk": [255, 248, 220],\r\n	"crimson": [220, 20, 60],\r\n	"cyan": [0, 255, 255],\r\n	"darkblue": [0, 0, 139],\r\n	"darkcyan": [0, 139, 139],\r\n	"darkgoldenrod": [184, 134, 11],\r\n	"darkgray": [169, 169, 169],\r\n	"darkgreen": [0, 100, 0],\r\n	"darkgrey": [169, 169, 169],\r\n	"darkkhaki": [189, 183, 107],\r\n	"darkmagenta": [139, 0, 139],\r\n	"darkolivegreen": [85, 107, 47],\r\n	"darkorange": [255, 140, 0],\r\n	"darkorchid": [153, 50, 204],\r\n	"darkred": [139, 0, 0],\r\n	"darksalmon": [233, 150, 122],\r\n	"darkseagreen": [143, 188, 143],\r\n	"darkslateblue": [72, 61, 139],\r\n	"darkslategray": [47, 79, 79],\r\n	"darkslategrey": [47, 79, 79],\r\n	"darkturquoise": [0, 206, 209],\r\n	"darkviolet": [148, 0, 211],\r\n	"deeppink": [255, 20, 147],\r\n	"deepskyblue": [0, 191, 255],\r\n	"dimgray": [105, 105, 105],\r\n	"dimgrey": [105, 105, 105],\r\n	"dodgerblue": [30, 144, 255],\r\n	"firebrick": [178, 34, 34],\r\n	"floralwhite": [255, 250, 240],\r\n	"forestgreen": [34, 139, 34],\r\n	"fuchsia": [255, 0, 255],\r\n	"gainsboro": [220, 220, 220],\r\n	"ghostwhite": [248, 248, 255],\r\n	"gold": [255, 215, 0],\r\n	"goldenrod": [218, 165, 32],\r\n	"gray": [128, 128, 128],\r\n	"green": [0, 128, 0],\r\n	"greenyellow": [173, 255, 47],\r\n	"grey": [128, 128, 128],\r\n	"honeydew": [240, 255, 240],\r\n	"hotpink": [255, 105, 180],\r\n	"indianred": [205, 92, 92],\r\n	"indigo": [75, 0, 130],\r\n	"ivory": [255, 255, 240],\r\n	"khaki": [240, 230, 140],\r\n	"lavender": [230, 230, 250],\r\n	"lavenderblush": [255, 240, 245],\r\n	"lawngreen": [124, 252, 0],\r\n	"lemonchiffon": [255, 250, 205],\r\n	"lightblue": [173, 216, 230],\r\n	"lightcoral": [240, 128, 128],\r\n	"lightcyan": [224, 255, 255],\r\n	"lightgoldenrodyellow": [250, 250, 210],\r\n	"lightgray": [211, 211, 211],\r\n	"lightgreen": [144, 238, 144],\r\n	"lightgrey": [211, 211, 211],\r\n	"lightpink": [255, 182, 193],\r\n	"lightsalmon": [255, 160, 122],\r\n	"lightseagreen": [32, 178, 170],\r\n	"lightskyblue": [135, 206, 250],\r\n	"lightslategray": [119, 136, 153],\r\n	"lightslategrey": [119, 136, 153],\r\n	"lightsteelblue": [176, 196, 222],\r\n	"lightyellow": [255, 255, 224],\r\n	"lime": [0, 255, 0],\r\n	"limegreen": [50, 205, 50],\r\n	"linen": [250, 240, 230],\r\n	"magenta": [255, 0, 255],\r\n	"maroon": [128, 0, 0],\r\n	"mediumaquamarine": [102, 205, 170],\r\n	"mediumblue": [0, 0, 205],\r\n	"mediumorchid": [186, 85, 211],\r\n	"mediumpurple": [147, 112, 219],\r\n	"mediumseagreen": [60, 179, 113],\r\n	"mediumslateblue": [123, 104, 238],\r\n	"mediumspringgreen": [0, 250, 154],\r\n	"mediumturquoise": [72, 209, 204],\r\n	"mediumvioletred": [199, 21, 133],\r\n	"midnightblue": [25, 25, 112],\r\n	"mintcream": [245, 255, 250],\r\n	"mistyrose": [255, 228, 225],\r\n	"moccasin": [255, 228, 181],\r\n	"navajowhite": [255, 222, 173],\r\n	"navy": [0, 0, 128],\r\n	"oldlace": [253, 245, 230],\r\n	"olive": [128, 128, 0],\r\n	"olivedrab": [107, 142, 35],\r\n	"orange": [255, 165, 0],\r\n	"orangered": [255, 69, 0],\r\n	"orchid": [218, 112, 214],\r\n	"palegoldenrod": [238, 232, 170],\r\n	"palegreen": [152, 251, 152],\r\n	"paleturquoise": [175, 238, 238],\r\n	"palevioletred": [219, 112, 147],\r\n	"papayawhip": [255, 239, 213],\r\n	"peachpuff": [255, 218, 185],\r\n	"peru": [205, 133, 63],\r\n	"pink": [255, 192, 203],\r\n	"plum": [221, 160, 221],\r\n	"powderblue": [176, 224, 230],\r\n	"purple": [128, 0, 128],\r\n	"rebeccapurple": [102, 51, 153],\r\n	"red": [255, 0, 0],\r\n	"rosybrown": [188, 143, 143],\r\n	"royalblue": [65, 105, 225],\r\n	"saddlebrown": [139, 69, 19],\r\n	"salmon": [250, 128, 114],\r\n	"sandybrown": [244, 164, 96],\r\n	"seagreen": [46, 139, 87],\r\n	"seashell": [255, 245, 238],\r\n	"sienna": [160, 82, 45],\r\n	"silver": [192, 192, 192],\r\n	"skyblue": [135, 206, 235],\r\n	"slateblue": [106, 90, 205],\r\n	"slategray": [112, 128, 144],\r\n	"slategrey": [112, 128, 144],\r\n	"snow": [255, 250, 250],\r\n	"springgreen": [0, 255, 127],\r\n	"steelblue": [70, 130, 180],\r\n	"tan": [210, 180, 140],\r\n	"teal": [0, 128, 128],\r\n	"thistle": [216, 191, 216],\r\n	"tomato": [255, 99, 71],\r\n	"turquoise": [64, 224, 208],\r\n	"violet": [238, 130, 238],\r\n	"wheat": [245, 222, 179],\r\n	"white": [255, 255, 255],\r\n	"whitesmoke": [245, 245, 245],\r\n	"yellow": [255, 255, 0],\r\n	"yellowgreen": [154, 205, 50]\r\n};\r\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-name-npm-1.1.4-025792b0ea-b044585952.zip/node_modules/color-name/index.js?');
              }
            ),
            /***/
            "../../.yarn/cache/color-npm-3.2.1-568cf1014f-f81220e8b7.zip/node_modules/color/index.js": (
              /*!***********************************************************************************************!*\
                !*** ../../.yarn/cache/color-npm-3.2.1-568cf1014f-f81220e8b7.zip/node_modules/color/index.js ***!
                \***********************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                "use strict";
                eval(`

var colorString = __webpack_require__(/*! color-string */ "../../.yarn/cache/color-string-npm-1.9.0-75382c0441-93c6678b84.zip/node_modules/color-string/index.js");
var convert = __webpack_require__(/*! color-convert */ "../../.yarn/cache/color-convert-npm-1.9.3-1fe690075e-fd7a64a17c.zip/node_modules/color-convert/index.js");

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		if (!mixinColor || !mixinColor.rgb) {
			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
		}
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;


//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-npm-3.2.1-568cf1014f-f81220e8b7.zip/node_modules/color/index.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/color-string-npm-1.9.0-75382c0441-93c6678b84.zip/node_modules/color-string/index.js": (
              /*!*************************************************************************************************************!*\
                !*** ../../.yarn/cache/color-string-npm-1.9.0-75382c0441-93c6678b84.zip/node_modules/color-string/index.js ***!
                \*************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval(`/* MIT license */
var colorNames = __webpack_require__(/*! color-name */ "../../.yarn/cache/color-name-npm-1.1.4-025792b0ea-b044585952.zip/node_modules/color-name/index.js");
var swizzle = __webpack_require__(/*! simple-swizzle */ "../../.yarn/cache/simple-swizzle-npm-0.2.2-8dee37fad1-a7f3f2ab5c.zip/node_modules/simple-swizzle/index.js");
var hasOwnProperty = Object.hasOwnProperty;

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (hasOwnProperty.call(colorNames, name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\\(\\s*([+-]?\\d+)(?=[\\s,])\\s*(?:,\\s*)?([+-]?\\d+)(?=[\\s,])\\s*(?:,\\s*)?([+-]?\\d+)\\s*(?:[,|\\/]\\s*([+-]?[\\d\\.]+)(%?)\\s*)?\\)$/;
	var per = /^rgba?\\(\\s*([+-]?[\\d\\.]+)\\%\\s*,?\\s*([+-]?[\\d\\.]+)\\%\\s*,?\\s*([+-]?[\\d\\.]+)\\%\\s*(?:[,|\\/]\\s*([+-]?[\\d\\.]+)(%?)\\s*)?\\)$/;
	var keyword = /^(\\w+)$/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha, 16) / 255;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		if (!hasOwnProperty.call(colorNames, match[1])) {
			return null;
		}

		rgb = colorNames[match[1]];
		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\\(\\s*([+-]?(?:\\d{0,3}\\.)?\\d+)(?:deg)?\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*,?\\s*([+-]?[\\d\\.]+)%\\s*(?:[,|\\/]\\s*([+-]?(?=\\.\\d|\\d)(?:0|[1-9]\\d*)?(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)\\s*)?\\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\\(\\s*([+-]?\\d{0,3}(?:\\.\\d+)?)(?:deg)?\\s*,\\s*([+-]?[\\d\\.]+)%\\s*,\\s*([+-]?[\\d\\.]+)%\\s*(?:,\\s*([+-]?(?=\\.\\d|\\d)(?:0|[1-9]\\d*)?(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)\\s*)?\\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = Math.round(num).toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}


//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/color-string-npm-1.9.0-75382c0441-93c6678b84.zip/node_modules/color-string/index.js?`);
              }
            ),
            /***/
            "../../.yarn/cache/is-arrayish-npm-0.3.2-f856180f79-977e64f54d.zip/node_modules/is-arrayish/index.js": (
              /*!***********************************************************************************************************!*\
                !*** ../../.yarn/cache/is-arrayish-npm-0.3.2-f856180f79-977e64f54d.zip/node_modules/is-arrayish/index.js ***!
                \***********************************************************************************************************/
              /***/
              (module) => {
                eval("module.exports = function isArrayish(obj) {\n	if (!obj || typeof obj === 'string') {\n		return false;\n	}\n\n	return obj instanceof Array || Array.isArray(obj) ||\n		(obj.length >= 0 && (obj.splice instanceof Function ||\n			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));\n};\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/is-arrayish-npm-0.3.2-f856180f79-977e64f54d.zip/node_modules/is-arrayish/index.js?");
              }
            ),
            /***/
            "../../.yarn/cache/lodash.curry-npm-4.1.1-b573bff179-9192b70fe7.zip/node_modules/lodash.curry/index.js": (
              /*!*************************************************************************************************************!*\
                !*** ../../.yarn/cache/lodash.curry-npm-4.1.1-b573bff179-9192b70fe7.zip/node_modules/lodash.curry/index.js ***!
                \*************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval("/**\n * lodash (Custom Build) <https://lodash.com/>\n * Build: `lodash modularize exports=\"npm\" -o ./`\n * Copyright jQuery Foundation and other contributors <https://jquery.org/>\n * Released under MIT license <https://lodash.com/license>\n * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>\n * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n */\n\n/** Used as the `TypeError` message for \"Functions\" methods. */\nvar FUNC_ERROR_TEXT = 'Expected a function';\n\n/** Used as the internal argument placeholder. */\nvar PLACEHOLDER = '__lodash_placeholder__';\n\n/** Used to compose bitmasks for function metadata. */\nvar BIND_FLAG = 1,\n    BIND_KEY_FLAG = 2,\n    CURRY_BOUND_FLAG = 4,\n    CURRY_FLAG = 8,\n    CURRY_RIGHT_FLAG = 16,\n    PARTIAL_FLAG = 32,\n    PARTIAL_RIGHT_FLAG = 64,\n    ARY_FLAG = 128,\n    REARG_FLAG = 256,\n    FLIP_FLAG = 512;\n\n/** Used as references for various `Number` constants. */\nvar INFINITY = 1 / 0,\n    MAX_SAFE_INTEGER = 9007199254740991,\n    MAX_INTEGER = 1.7976931348623157e+308,\n    NAN = 0 / 0;\n\n/** Used to associate wrap methods with their bit flags. */\nvar wrapFlags = [\n  ['ary', ARY_FLAG],\n  ['bind', BIND_FLAG],\n  ['bindKey', BIND_KEY_FLAG],\n  ['curry', CURRY_FLAG],\n  ['curryRight', CURRY_RIGHT_FLAG],\n  ['flip', FLIP_FLAG],\n  ['partial', PARTIAL_FLAG],\n  ['partialRight', PARTIAL_RIGHT_FLAG],\n  ['rearg', REARG_FLAG]\n];\n\n/** `Object#toString` result references. */\nvar funcTag = '[object Function]',\n    genTag = '[object GeneratorFunction]',\n    symbolTag = '[object Symbol]';\n\n/**\n * Used to match `RegExp`\n * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).\n */\nvar reRegExpChar = /[\\\\^$.*+?()[\\]{}|]/g;\n\n/** Used to match leading and trailing whitespace. */\nvar reTrim = /^\\s+|\\s+$/g;\n\n/** Used to match wrap detail comments. */\nvar reWrapComment = /\\{(?:\\n\\/\\* \\[wrapped with .+\\] \\*\\/)?\\n?/,\n    reWrapDetails = /\\{\\n\\/\\* \\[wrapped with (.+)\\] \\*/,\n    reSplitDetails = /,? & /;\n\n/** Used to detect bad signed hexadecimal string values. */\nvar reIsBadHex = /^[-+]0x[0-9a-f]+$/i;\n\n/** Used to detect binary string values. */\nvar reIsBinary = /^0b[01]+$/i;\n\n/** Used to detect host constructors (Safari). */\nvar reIsHostCtor = /^\\[object .+?Constructor\\]$/;\n\n/** Used to detect octal string values. */\nvar reIsOctal = /^0o[0-7]+$/i;\n\n/** Used to detect unsigned integer values. */\nvar reIsUint = /^(?:0|[1-9]\\d*)$/;\n\n/** Built-in method references without a dependency on `root`. */\nvar freeParseInt = parseInt;\n\n/** Detect free variable `global` from Node.js. */\nvar freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;\n\n/** Detect free variable `self`. */\nvar freeSelf = typeof self == 'object' && self && self.Object === Object && self;\n\n/** Used as a reference to the global object. */\nvar root = freeGlobal || freeSelf || Function('return this')();\n\n/**\n * A faster alternative to `Function#apply`, this function invokes `func`\n * with the `this` binding of `thisArg` and the arguments of `args`.\n *\n * @private\n * @param {Function} func The function to invoke.\n * @param {*} thisArg The `this` binding of `func`.\n * @param {Array} args The arguments to invoke `func` with.\n * @returns {*} Returns the result of `func`.\n */\nfunction apply(func, thisArg, args) {\n  switch (args.length) {\n    case 0: return func.call(thisArg);\n    case 1: return func.call(thisArg, args[0]);\n    case 2: return func.call(thisArg, args[0], args[1]);\n    case 3: return func.call(thisArg, args[0], args[1], args[2]);\n  }\n  return func.apply(thisArg, args);\n}\n\n/**\n * A specialized version of `_.forEach` for arrays without support for\n * iteratee shorthands.\n *\n * @private\n * @param {Array} [array] The array to iterate over.\n * @param {Function} iteratee The function invoked per iteration.\n * @returns {Array} Returns `array`.\n */\nfunction arrayEach(array, iteratee) {\n  var index = -1,\n      length = array ? array.length : 0;\n\n  while (++index < length) {\n    if (iteratee(array[index], index, array) === false) {\n      break;\n    }\n  }\n  return array;\n}\n\n/**\n * A specialized version of `_.includes` for arrays without support for\n * specifying an index to search from.\n *\n * @private\n * @param {Array} [array] The array to inspect.\n * @param {*} target The value to search for.\n * @returns {boolean} Returns `true` if `target` is found, else `false`.\n */\nfunction arrayIncludes(array, value) {\n  var length = array ? array.length : 0;\n  return !!length && baseIndexOf(array, value, 0) > -1;\n}\n\n/**\n * The base implementation of `_.findIndex` and `_.findLastIndex` without\n * support for iteratee shorthands.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {Function} predicate The function invoked per iteration.\n * @param {number} fromIndex The index to search from.\n * @param {boolean} [fromRight] Specify iterating from right to left.\n * @returns {number} Returns the index of the matched value, else `-1`.\n */\nfunction baseFindIndex(array, predicate, fromIndex, fromRight) {\n  var length = array.length,\n      index = fromIndex + (fromRight ? 1 : -1);\n\n  while ((fromRight ? index-- : ++index < length)) {\n    if (predicate(array[index], index, array)) {\n      return index;\n    }\n  }\n  return -1;\n}\n\n/**\n * The base implementation of `_.indexOf` without `fromIndex` bounds checks.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {*} value The value to search for.\n * @param {number} fromIndex The index to search from.\n * @returns {number} Returns the index of the matched value, else `-1`.\n */\nfunction baseIndexOf(array, value, fromIndex) {\n  if (value !== value) {\n    return baseFindIndex(array, baseIsNaN, fromIndex);\n  }\n  var index = fromIndex - 1,\n      length = array.length;\n\n  while (++index < length) {\n    if (array[index] === value) {\n      return index;\n    }\n  }\n  return -1;\n}\n\n/**\n * The base implementation of `_.isNaN` without support for number objects.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.\n */\nfunction baseIsNaN(value) {\n  return value !== value;\n}\n\n/**\n * Gets the number of `placeholder` occurrences in `array`.\n *\n * @private\n * @param {Array} array The array to inspect.\n * @param {*} placeholder The placeholder to search for.\n * @returns {number} Returns the placeholder count.\n */\nfunction countHolders(array, placeholder) {\n  var length = array.length,\n      result = 0;\n\n  while (length--) {\n    if (array[length] === placeholder) {\n      result++;\n    }\n  }\n  return result;\n}\n\n/**\n * Gets the value at `key` of `object`.\n *\n * @private\n * @param {Object} [object] The object to query.\n * @param {string} key The key of the property to get.\n * @returns {*} Returns the property value.\n */\nfunction getValue(object, key) {\n  return object == null ? undefined : object[key];\n}\n\n/**\n * Checks if `value` is a host object in IE < 9.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a host object, else `false`.\n */\nfunction isHostObject(value) {\n  // Many host objects are `Object` objects that can coerce to strings\n  // despite having improperly defined `toString` methods.\n  var result = false;\n  if (value != null && typeof value.toString != 'function') {\n    try {\n      result = !!(value + '');\n    } catch (e) {}\n  }\n  return result;\n}\n\n/**\n * Replaces all `placeholder` elements in `array` with an internal placeholder\n * and returns an array of their indexes.\n *\n * @private\n * @param {Array} array The array to modify.\n * @param {*} placeholder The placeholder to replace.\n * @returns {Array} Returns the new array of placeholder indexes.\n */\nfunction replaceHolders(array, placeholder) {\n  var index = -1,\n      length = array.length,\n      resIndex = 0,\n      result = [];\n\n  while (++index < length) {\n    var value = array[index];\n    if (value === placeholder || value === PLACEHOLDER) {\n      array[index] = PLACEHOLDER;\n      result[resIndex++] = index;\n    }\n  }\n  return result;\n}\n\n/** Used for built-in method references. */\nvar funcProto = Function.prototype,\n    objectProto = Object.prototype;\n\n/** Used to detect overreaching core-js shims. */\nvar coreJsData = root['__core-js_shared__'];\n\n/** Used to detect methods masquerading as native. */\nvar maskSrcKey = (function() {\n  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');\n  return uid ? ('Symbol(src)_1.' + uid) : '';\n}());\n\n/** Used to resolve the decompiled source of functions. */\nvar funcToString = funcProto.toString;\n\n/** Used to check objects for own properties. */\nvar hasOwnProperty = objectProto.hasOwnProperty;\n\n/**\n * Used to resolve the\n * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)\n * of values.\n */\nvar objectToString = objectProto.toString;\n\n/** Used to detect if a method is native. */\nvar reIsNative = RegExp('^' +\n  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\\\$&')\n  .replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '$1.*?') + '$'\n);\n\n/** Built-in value references. */\nvar objectCreate = Object.create;\n\n/* Built-in method references for those with the same name as other `lodash` methods. */\nvar nativeMax = Math.max,\n    nativeMin = Math.min;\n\n/* Used to set `toString` methods. */\nvar defineProperty = (function() {\n  var func = getNative(Object, 'defineProperty'),\n      name = getNative.name;\n\n  return (name && name.length > 2) ? func : undefined;\n}());\n\n/**\n * The base implementation of `_.create` without support for assigning\n * properties to the created object.\n *\n * @private\n * @param {Object} prototype The object to inherit from.\n * @returns {Object} Returns the new object.\n */\nfunction baseCreate(proto) {\n  return isObject(proto) ? objectCreate(proto) : {};\n}\n\n/**\n * The base implementation of `_.isNative` without bad shim checks.\n *\n * @private\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a native function,\n *  else `false`.\n */\nfunction baseIsNative(value) {\n  if (!isObject(value) || isMasked(value)) {\n    return false;\n  }\n  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;\n  return pattern.test(toSource(value));\n}\n\n/**\n * Creates an array that is the composition of partially applied arguments,\n * placeholders, and provided arguments into a single array of arguments.\n *\n * @private\n * @param {Array} args The provided arguments.\n * @param {Array} partials The arguments to prepend to those provided.\n * @param {Array} holders The `partials` placeholder indexes.\n * @params {boolean} [isCurried] Specify composing for a curried function.\n * @returns {Array} Returns the new array of composed arguments.\n */\nfunction composeArgs(args, partials, holders, isCurried) {\n  var argsIndex = -1,\n      argsLength = args.length,\n      holdersLength = holders.length,\n      leftIndex = -1,\n      leftLength = partials.length,\n      rangeLength = nativeMax(argsLength - holdersLength, 0),\n      result = Array(leftLength + rangeLength),\n      isUncurried = !isCurried;\n\n  while (++leftIndex < leftLength) {\n    result[leftIndex] = partials[leftIndex];\n  }\n  while (++argsIndex < holdersLength) {\n    if (isUncurried || argsIndex < argsLength) {\n      result[holders[argsIndex]] = args[argsIndex];\n    }\n  }\n  while (rangeLength--) {\n    result[leftIndex++] = args[argsIndex++];\n  }\n  return result;\n}\n\n/**\n * This function is like `composeArgs` except that the arguments composition\n * is tailored for `_.partialRight`.\n *\n * @private\n * @param {Array} args The provided arguments.\n * @param {Array} partials The arguments to append to those provided.\n * @param {Array} holders The `partials` placeholder indexes.\n * @params {boolean} [isCurried] Specify composing for a curried function.\n * @returns {Array} Returns the new array of composed arguments.\n */\nfunction composeArgsRight(args, partials, holders, isCurried) {\n  var argsIndex = -1,\n      argsLength = args.length,\n      holdersIndex = -1,\n      holdersLength = holders.length,\n      rightIndex = -1,\n      rightLength = partials.length,\n      rangeLength = nativeMax(argsLength - holdersLength, 0),\n      result = Array(rangeLength + rightLength),\n      isUncurried = !isCurried;\n\n  while (++argsIndex < rangeLength) {\n    result[argsIndex] = args[argsIndex];\n  }\n  var offset = argsIndex;\n  while (++rightIndex < rightLength) {\n    result[offset + rightIndex] = partials[rightIndex];\n  }\n  while (++holdersIndex < holdersLength) {\n    if (isUncurried || argsIndex < argsLength) {\n      result[offset + holders[holdersIndex]] = args[argsIndex++];\n    }\n  }\n  return result;\n}\n\n/**\n * Copies the values of `source` to `array`.\n *\n * @private\n * @param {Array} source The array to copy values from.\n * @param {Array} [array=[]] The array to copy values to.\n * @returns {Array} Returns `array`.\n */\nfunction copyArray(source, array) {\n  var index = -1,\n      length = source.length;\n\n  array || (array = Array(length));\n  while (++index < length) {\n    array[index] = source[index];\n  }\n  return array;\n}\n\n/**\n * Creates a function that wraps `func` to invoke it with the optional `this`\n * binding of `thisArg`.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @param {*} [thisArg] The `this` binding of `func`.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createBind(func, bitmask, thisArg) {\n  var isBind = bitmask & BIND_FLAG,\n      Ctor = createCtor(func);\n\n  function wrapper() {\n    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;\n    return fn.apply(isBind ? thisArg : this, arguments);\n  }\n  return wrapper;\n}\n\n/**\n * Creates a function that produces an instance of `Ctor` regardless of\n * whether it was invoked as part of a `new` expression or by `call` or `apply`.\n *\n * @private\n * @param {Function} Ctor The constructor to wrap.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createCtor(Ctor) {\n  return function() {\n    // Use a `switch` statement to work with class constructors. See\n    // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist\n    // for more details.\n    var args = arguments;\n    switch (args.length) {\n      case 0: return new Ctor;\n      case 1: return new Ctor(args[0]);\n      case 2: return new Ctor(args[0], args[1]);\n      case 3: return new Ctor(args[0], args[1], args[2]);\n      case 4: return new Ctor(args[0], args[1], args[2], args[3]);\n      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);\n      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);\n      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);\n    }\n    var thisBinding = baseCreate(Ctor.prototype),\n        result = Ctor.apply(thisBinding, args);\n\n    // Mimic the constructor's `return` behavior.\n    // See https://es5.github.io/#x13.2.2 for more details.\n    return isObject(result) ? result : thisBinding;\n  };\n}\n\n/**\n * Creates a function that wraps `func` to enable currying.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @param {number} arity The arity of `func`.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createCurry(func, bitmask, arity) {\n  var Ctor = createCtor(func);\n\n  function wrapper() {\n    var length = arguments.length,\n        args = Array(length),\n        index = length,\n        placeholder = getHolder(wrapper);\n\n    while (index--) {\n      args[index] = arguments[index];\n    }\n    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)\n      ? []\n      : replaceHolders(args, placeholder);\n\n    length -= holders.length;\n    if (length < arity) {\n      return createRecurry(\n        func, bitmask, createHybrid, wrapper.placeholder, undefined,\n        args, holders, undefined, undefined, arity - length);\n    }\n    var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;\n    return apply(fn, this, args);\n  }\n  return wrapper;\n}\n\n/**\n * Creates a function that wraps `func` to invoke it with optional `this`\n * binding of `thisArg`, partial application, and currying.\n *\n * @private\n * @param {Function|string} func The function or method name to wrap.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @param {*} [thisArg] The `this` binding of `func`.\n * @param {Array} [partials] The arguments to prepend to those provided to\n *  the new function.\n * @param {Array} [holders] The `partials` placeholder indexes.\n * @param {Array} [partialsRight] The arguments to append to those provided\n *  to the new function.\n * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.\n * @param {Array} [argPos] The argument positions of the new function.\n * @param {number} [ary] The arity cap of `func`.\n * @param {number} [arity] The arity of `func`.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {\n  var isAry = bitmask & ARY_FLAG,\n      isBind = bitmask & BIND_FLAG,\n      isBindKey = bitmask & BIND_KEY_FLAG,\n      isCurried = bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG),\n      isFlip = bitmask & FLIP_FLAG,\n      Ctor = isBindKey ? undefined : createCtor(func);\n\n  function wrapper() {\n    var length = arguments.length,\n        args = Array(length),\n        index = length;\n\n    while (index--) {\n      args[index] = arguments[index];\n    }\n    if (isCurried) {\n      var placeholder = getHolder(wrapper),\n          holdersCount = countHolders(args, placeholder);\n    }\n    if (partials) {\n      args = composeArgs(args, partials, holders, isCurried);\n    }\n    if (partialsRight) {\n      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);\n    }\n    length -= holdersCount;\n    if (isCurried && length < arity) {\n      var newHolders = replaceHolders(args, placeholder);\n      return createRecurry(\n        func, bitmask, createHybrid, wrapper.placeholder, thisArg,\n        args, newHolders, argPos, ary, arity - length\n      );\n    }\n    var thisBinding = isBind ? thisArg : this,\n        fn = isBindKey ? thisBinding[func] : func;\n\n    length = args.length;\n    if (argPos) {\n      args = reorder(args, argPos);\n    } else if (isFlip && length > 1) {\n      args.reverse();\n    }\n    if (isAry && ary < length) {\n      args.length = ary;\n    }\n    if (this && this !== root && this instanceof wrapper) {\n      fn = Ctor || createCtor(fn);\n    }\n    return fn.apply(thisBinding, args);\n  }\n  return wrapper;\n}\n\n/**\n * Creates a function that wraps `func` to invoke it with the `this` binding\n * of `thisArg` and `partials` prepended to the arguments it receives.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @param {*} thisArg The `this` binding of `func`.\n * @param {Array} partials The arguments to prepend to those provided to\n *  the new function.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createPartial(func, bitmask, thisArg, partials) {\n  var isBind = bitmask & BIND_FLAG,\n      Ctor = createCtor(func);\n\n  function wrapper() {\n    var argsIndex = -1,\n        argsLength = arguments.length,\n        leftIndex = -1,\n        leftLength = partials.length,\n        args = Array(leftLength + argsLength),\n        fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;\n\n    while (++leftIndex < leftLength) {\n      args[leftIndex] = partials[leftIndex];\n    }\n    while (argsLength--) {\n      args[leftIndex++] = arguments[++argsIndex];\n    }\n    return apply(fn, isBind ? thisArg : this, args);\n  }\n  return wrapper;\n}\n\n/**\n * Creates a function that wraps `func` to continue currying.\n *\n * @private\n * @param {Function} func The function to wrap.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @param {Function} wrapFunc The function to create the `func` wrapper.\n * @param {*} placeholder The placeholder value.\n * @param {*} [thisArg] The `this` binding of `func`.\n * @param {Array} [partials] The arguments to prepend to those provided to\n *  the new function.\n * @param {Array} [holders] The `partials` placeholder indexes.\n * @param {Array} [argPos] The argument positions of the new function.\n * @param {number} [ary] The arity cap of `func`.\n * @param {number} [arity] The arity of `func`.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {\n  var isCurry = bitmask & CURRY_FLAG,\n      newHolders = isCurry ? holders : undefined,\n      newHoldersRight = isCurry ? undefined : holders,\n      newPartials = isCurry ? partials : undefined,\n      newPartialsRight = isCurry ? undefined : partials;\n\n  bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);\n  bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);\n\n  if (!(bitmask & CURRY_BOUND_FLAG)) {\n    bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);\n  }\n\n  var result = wrapFunc(func, bitmask, thisArg, newPartials, newHolders, newPartialsRight, newHoldersRight, argPos, ary, arity);\n  result.placeholder = placeholder;\n  return setWrapToString(result, func, bitmask);\n}\n\n/**\n * Creates a function that either curries or invokes `func` with optional\n * `this` binding and partially applied arguments.\n *\n * @private\n * @param {Function|string} func The function or method name to wrap.\n * @param {number} bitmask The bitmask flags.\n *  The bitmask may be composed of the following flags:\n *     1 - `_.bind`\n *     2 - `_.bindKey`\n *     4 - `_.curry` or `_.curryRight` of a bound function\n *     8 - `_.curry`\n *    16 - `_.curryRight`\n *    32 - `_.partial`\n *    64 - `_.partialRight`\n *   128 - `_.rearg`\n *   256 - `_.ary`\n *   512 - `_.flip`\n * @param {*} [thisArg] The `this` binding of `func`.\n * @param {Array} [partials] The arguments to be partially applied.\n * @param {Array} [holders] The `partials` placeholder indexes.\n * @param {Array} [argPos] The argument positions of the new function.\n * @param {number} [ary] The arity cap of `func`.\n * @param {number} [arity] The arity of `func`.\n * @returns {Function} Returns the new wrapped function.\n */\nfunction createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {\n  var isBindKey = bitmask & BIND_KEY_FLAG;\n  if (!isBindKey && typeof func != 'function') {\n    throw new TypeError(FUNC_ERROR_TEXT);\n  }\n  var length = partials ? partials.length : 0;\n  if (!length) {\n    bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);\n    partials = holders = undefined;\n  }\n  ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);\n  arity = arity === undefined ? arity : toInteger(arity);\n  length -= holders ? holders.length : 0;\n\n  if (bitmask & PARTIAL_RIGHT_FLAG) {\n    var partialsRight = partials,\n        holdersRight = holders;\n\n    partials = holders = undefined;\n  }\n\n  var newData = [\n    func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,\n    argPos, ary, arity\n  ];\n\n  func = newData[0];\n  bitmask = newData[1];\n  thisArg = newData[2];\n  partials = newData[3];\n  holders = newData[4];\n  arity = newData[9] = newData[9] == null\n    ? (isBindKey ? 0 : func.length)\n    : nativeMax(newData[9] - length, 0);\n\n  if (!arity && bitmask & (CURRY_FLAG | CURRY_RIGHT_FLAG)) {\n    bitmask &= ~(CURRY_FLAG | CURRY_RIGHT_FLAG);\n  }\n  if (!bitmask || bitmask == BIND_FLAG) {\n    var result = createBind(func, bitmask, thisArg);\n  } else if (bitmask == CURRY_FLAG || bitmask == CURRY_RIGHT_FLAG) {\n    result = createCurry(func, bitmask, arity);\n  } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !holders.length) {\n    result = createPartial(func, bitmask, thisArg, partials);\n  } else {\n    result = createHybrid.apply(undefined, newData);\n  }\n  return setWrapToString(result, func, bitmask);\n}\n\n/**\n * Gets the argument placeholder value for `func`.\n *\n * @private\n * @param {Function} func The function to inspect.\n * @returns {*} Returns the placeholder value.\n */\nfunction getHolder(func) {\n  var object = func;\n  return object.placeholder;\n}\n\n/**\n * Gets the native function at `key` of `object`.\n *\n * @private\n * @param {Object} object The object to query.\n * @param {string} key The key of the method to get.\n * @returns {*} Returns the function if it's native, else `undefined`.\n */\nfunction getNative(object, key) {\n  var value = getValue(object, key);\n  return baseIsNative(value) ? value : undefined;\n}\n\n/**\n * Extracts wrapper details from the `source` body comment.\n *\n * @private\n * @param {string} source The source to inspect.\n * @returns {Array} Returns the wrapper details.\n */\nfunction getWrapDetails(source) {\n  var match = source.match(reWrapDetails);\n  return match ? match[1].split(reSplitDetails) : [];\n}\n\n/**\n * Inserts wrapper `details` in a comment at the top of the `source` body.\n *\n * @private\n * @param {string} source The source to modify.\n * @returns {Array} details The details to insert.\n * @returns {string} Returns the modified source.\n */\nfunction insertWrapDetails(source, details) {\n  var length = details.length,\n      lastIndex = length - 1;\n\n  details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];\n  details = details.join(length > 2 ? ', ' : ' ');\n  return source.replace(reWrapComment, '{\\n/* [wrapped with ' + details + '] */\\n');\n}\n\n/**\n * Checks if `value` is a valid array-like index.\n *\n * @private\n * @param {*} value The value to check.\n * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.\n * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.\n */\nfunction isIndex(value, length) {\n  length = length == null ? MAX_SAFE_INTEGER : length;\n  return !!length &&\n    (typeof value == 'number' || reIsUint.test(value)) &&\n    (value > -1 && value % 1 == 0 && value < length);\n}\n\n/**\n * Checks if `func` has its source masked.\n *\n * @private\n * @param {Function} func The function to check.\n * @returns {boolean} Returns `true` if `func` is masked, else `false`.\n */\nfunction isMasked(func) {\n  return !!maskSrcKey && (maskSrcKey in func);\n}\n\n/**\n * Reorder `array` according to the specified indexes where the element at\n * the first index is assigned as the first element, the element at\n * the second index is assigned as the second element, and so on.\n *\n * @private\n * @param {Array} array The array to reorder.\n * @param {Array} indexes The arranged array indexes.\n * @returns {Array} Returns `array`.\n */\nfunction reorder(array, indexes) {\n  var arrLength = array.length,\n      length = nativeMin(indexes.length, arrLength),\n      oldArray = copyArray(array);\n\n  while (length--) {\n    var index = indexes[length];\n    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;\n  }\n  return array;\n}\n\n/**\n * Sets the `toString` method of `wrapper` to mimic the source of `reference`\n * with wrapper details in a comment at the top of the source body.\n *\n * @private\n * @param {Function} wrapper The function to modify.\n * @param {Function} reference The reference function.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @returns {Function} Returns `wrapper`.\n */\nvar setWrapToString = !defineProperty ? identity : function(wrapper, reference, bitmask) {\n  var source = (reference + '');\n  return defineProperty(wrapper, 'toString', {\n    'configurable': true,\n    'enumerable': false,\n    'value': constant(insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)))\n  });\n};\n\n/**\n * Converts `func` to its source code.\n *\n * @private\n * @param {Function} func The function to process.\n * @returns {string} Returns the source code.\n */\nfunction toSource(func) {\n  if (func != null) {\n    try {\n      return funcToString.call(func);\n    } catch (e) {}\n    try {\n      return (func + '');\n    } catch (e) {}\n  }\n  return '';\n}\n\n/**\n * Updates wrapper `details` based on `bitmask` flags.\n *\n * @private\n * @returns {Array} details The details to modify.\n * @param {number} bitmask The bitmask flags. See `createWrap` for more details.\n * @returns {Array} Returns `details`.\n */\nfunction updateWrapDetails(details, bitmask) {\n  arrayEach(wrapFlags, function(pair) {\n    var value = '_.' + pair[0];\n    if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {\n      details.push(value);\n    }\n  });\n  return details.sort();\n}\n\n/**\n * Creates a function that accepts arguments of `func` and either invokes\n * `func` returning its result, if at least `arity` number of arguments have\n * been provided, or returns a function that accepts the remaining `func`\n * arguments, and so on. The arity of `func` may be specified if `func.length`\n * is not sufficient.\n *\n * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,\n * may be used as a placeholder for provided arguments.\n *\n * **Note:** This method doesn't set the \"length\" property of curried functions.\n *\n * @static\n * @memberOf _\n * @since 2.0.0\n * @category Function\n * @param {Function} func The function to curry.\n * @param {number} [arity=func.length] The arity of `func`.\n * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.\n * @returns {Function} Returns the new curried function.\n * @example\n *\n * var abc = function(a, b, c) {\n *   return [a, b, c];\n * };\n *\n * var curried = _.curry(abc);\n *\n * curried(1)(2)(3);\n * // => [1, 2, 3]\n *\n * curried(1, 2)(3);\n * // => [1, 2, 3]\n *\n * curried(1, 2, 3);\n * // => [1, 2, 3]\n *\n * // Curried with placeholders.\n * curried(1)(_, 3)(2);\n * // => [1, 2, 3]\n */\nfunction curry(func, arity, guard) {\n  arity = guard ? undefined : arity;\n  var result = createWrap(func, CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);\n  result.placeholder = curry.placeholder;\n  return result;\n}\n\n/**\n * Checks if `value` is classified as a `Function` object.\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a function, else `false`.\n * @example\n *\n * _.isFunction(_);\n * // => true\n *\n * _.isFunction(/abc/);\n * // => false\n */\nfunction isFunction(value) {\n  // The use of `Object#toString` avoids issues with the `typeof` operator\n  // in Safari 8-9 which returns 'object' for typed array and other constructors.\n  var tag = isObject(value) ? objectToString.call(value) : '';\n  return tag == funcTag || tag == genTag;\n}\n\n/**\n * Checks if `value` is the\n * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)\n * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\n *\n * @static\n * @memberOf _\n * @since 0.1.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n * @example\n *\n * _.isObject({});\n * // => true\n *\n * _.isObject([1, 2, 3]);\n * // => true\n *\n * _.isObject(_.noop);\n * // => true\n *\n * _.isObject(null);\n * // => false\n */\nfunction isObject(value) {\n  var type = typeof value;\n  return !!value && (type == 'object' || type == 'function');\n}\n\n/**\n * Checks if `value` is object-like. A value is object-like if it's not `null`\n * and has a `typeof` result of \"object\".\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is object-like, else `false`.\n * @example\n *\n * _.isObjectLike({});\n * // => true\n *\n * _.isObjectLike([1, 2, 3]);\n * // => true\n *\n * _.isObjectLike(_.noop);\n * // => false\n *\n * _.isObjectLike(null);\n * // => false\n */\nfunction isObjectLike(value) {\n  return !!value && typeof value == 'object';\n}\n\n/**\n * Checks if `value` is classified as a `Symbol` primitive or object.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to check.\n * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.\n * @example\n *\n * _.isSymbol(Symbol.iterator);\n * // => true\n *\n * _.isSymbol('abc');\n * // => false\n */\nfunction isSymbol(value) {\n  return typeof value == 'symbol' ||\n    (isObjectLike(value) && objectToString.call(value) == symbolTag);\n}\n\n/**\n * Converts `value` to a finite number.\n *\n * @static\n * @memberOf _\n * @since 4.12.0\n * @category Lang\n * @param {*} value The value to convert.\n * @returns {number} Returns the converted number.\n * @example\n *\n * _.toFinite(3.2);\n * // => 3.2\n *\n * _.toFinite(Number.MIN_VALUE);\n * // => 5e-324\n *\n * _.toFinite(Infinity);\n * // => 1.7976931348623157e+308\n *\n * _.toFinite('3.2');\n * // => 3.2\n */\nfunction toFinite(value) {\n  if (!value) {\n    return value === 0 ? value : 0;\n  }\n  value = toNumber(value);\n  if (value === INFINITY || value === -INFINITY) {\n    var sign = (value < 0 ? -1 : 1);\n    return sign * MAX_INTEGER;\n  }\n  return value === value ? value : 0;\n}\n\n/**\n * Converts `value` to an integer.\n *\n * **Note:** This method is loosely based on\n * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to convert.\n * @returns {number} Returns the converted integer.\n * @example\n *\n * _.toInteger(3.2);\n * // => 3\n *\n * _.toInteger(Number.MIN_VALUE);\n * // => 0\n *\n * _.toInteger(Infinity);\n * // => 1.7976931348623157e+308\n *\n * _.toInteger('3.2');\n * // => 3\n */\nfunction toInteger(value) {\n  var result = toFinite(value),\n      remainder = result % 1;\n\n  return result === result ? (remainder ? result - remainder : result) : 0;\n}\n\n/**\n * Converts `value` to a number.\n *\n * @static\n * @memberOf _\n * @since 4.0.0\n * @category Lang\n * @param {*} value The value to process.\n * @returns {number} Returns the number.\n * @example\n *\n * _.toNumber(3.2);\n * // => 3.2\n *\n * _.toNumber(Number.MIN_VALUE);\n * // => 5e-324\n *\n * _.toNumber(Infinity);\n * // => Infinity\n *\n * _.toNumber('3.2');\n * // => 3.2\n */\nfunction toNumber(value) {\n  if (typeof value == 'number') {\n    return value;\n  }\n  if (isSymbol(value)) {\n    return NAN;\n  }\n  if (isObject(value)) {\n    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;\n    value = isObject(other) ? (other + '') : other;\n  }\n  if (typeof value != 'string') {\n    return value === 0 ? value : +value;\n  }\n  value = value.replace(reTrim, '');\n  var isBinary = reIsBinary.test(value);\n  return (isBinary || reIsOctal.test(value))\n    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)\n    : (reIsBadHex.test(value) ? NAN : +value);\n}\n\n/**\n * Creates a function that returns `value`.\n *\n * @static\n * @memberOf _\n * @since 2.4.0\n * @category Util\n * @param {*} value The value to return from the new function.\n * @returns {Function} Returns the new constant function.\n * @example\n *\n * var objects = _.times(2, _.constant({ 'a': 1 }));\n *\n * console.log(objects);\n * // => [{ 'a': 1 }, { 'a': 1 }]\n *\n * console.log(objects[0] === objects[1]);\n * // => true\n */\nfunction constant(value) {\n  return function() {\n    return value;\n  };\n}\n\n/**\n * This method returns the first argument it receives.\n *\n * @static\n * @since 0.1.0\n * @memberOf _\n * @category Util\n * @param {*} value Any value.\n * @returns {*} Returns `value`.\n * @example\n *\n * var object = { 'a': 1 };\n *\n * console.log(_.identity(object) === object);\n * // => true\n */\nfunction identity(value) {\n  return value;\n}\n\n// Assign default placeholders.\ncurry.placeholder = {};\n\nmodule.exports = curry;\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/lodash.curry-npm-4.1.1-b573bff179-9192b70fe7.zip/node_modules/lodash.curry/index.js?");
              }
            ),
            /***/
            "../../.yarn/cache/object-assign-npm-4.1.1-1004ad6dec-fcc6e4ea8c.zip/node_modules/object-assign/index.js": (
              /*!***************************************************************************************************************!*\
                !*** ../../.yarn/cache/object-assign-npm-4.1.1-1004ad6dec-fcc6e4ea8c.zip/node_modules/object-assign/index.js ***!
                \***************************************************************************************************************/
              /***/
              (module) => {
                "use strict";
                eval("/*\nobject-assign\n(c) Sindre Sorhus\n@license MIT\n*/\n\n\n/* eslint-disable no-unused-vars */\nvar getOwnPropertySymbols = Object.getOwnPropertySymbols;\nvar hasOwnProperty = Object.prototype.hasOwnProperty;\nvar propIsEnumerable = Object.prototype.propertyIsEnumerable;\n\nfunction toObject(val) {\n	if (val === null || val === undefined) {\n		throw new TypeError('Object.assign cannot be called with null or undefined');\n	}\n\n	return Object(val);\n}\n\nfunction shouldUseNative() {\n	try {\n		if (!Object.assign) {\n			return false;\n		}\n\n		// Detect buggy property enumeration order in older V8 versions.\n\n		// https://bugs.chromium.org/p/v8/issues/detail?id=4118\n		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers\n		test1[5] = 'de';\n		if (Object.getOwnPropertyNames(test1)[0] === '5') {\n			return false;\n		}\n\n		// https://bugs.chromium.org/p/v8/issues/detail?id=3056\n		var test2 = {};\n		for (var i = 0; i < 10; i++) {\n			test2['_' + String.fromCharCode(i)] = i;\n		}\n		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {\n			return test2[n];\n		});\n		if (order2.join('') !== '0123456789') {\n			return false;\n		}\n\n		// https://bugs.chromium.org/p/v8/issues/detail?id=3056\n		var test3 = {};\n		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {\n			test3[letter] = letter;\n		});\n		if (Object.keys(Object.assign({}, test3)).join('') !==\n				'abcdefghijklmnopqrst') {\n			return false;\n		}\n\n		return true;\n	} catch (err) {\n		// We don't expect any of the above to throw, but better to be safe.\n		return false;\n	}\n}\n\nmodule.exports = shouldUseNative() ? Object.assign : function (target, source) {\n	var from;\n	var to = toObject(target);\n	var symbols;\n\n	for (var s = 1; s < arguments.length; s++) {\n		from = Object(arguments[s]);\n\n		for (var key in from) {\n			if (hasOwnProperty.call(from, key)) {\n				to[key] = from[key];\n			}\n		}\n\n		if (getOwnPropertySymbols) {\n			symbols = getOwnPropertySymbols(from);\n			for (var i = 0; i < symbols.length; i++) {\n				if (propIsEnumerable.call(from, symbols[i])) {\n					to[symbols[i]] = from[symbols[i]];\n				}\n			}\n		}\n	}\n\n	return to;\n};\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/object-assign-npm-4.1.1-1004ad6dec-fcc6e4ea8c.zip/node_modules/object-assign/index.js?");
              }
            ),
            /***/
            "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/checkPropTypes.js": (
              /*!*******************************************************************************************************************!*\
                !*** ../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/checkPropTypes.js ***!
                \*******************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                "use strict";
                eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\nvar printWarning = function() {};\n\nif (true) {\n  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ \"../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js\");\n  var loggedTypeFailures = {};\n  var has = __webpack_require__(/*! ./lib/has */ \"../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/has.js\");\n\n  printWarning = function(text) {\n    var message = 'Warning: ' + text;\n    if (typeof console !== 'undefined') {\n      console.error(message);\n    }\n    try {\n      // --- Welcome to debugging React ---\n      // This error was thrown as a convenience so that you can use this stack\n      // to find the callsite that caused this warning to fire.\n      throw new Error(message);\n    } catch (x) { /**/ }\n  };\n}\n\n/**\n * Assert that the values match with the type specs.\n * Error messages are memorized and will only be shown once.\n *\n * @param {object} typeSpecs Map of name to a ReactPropType\n * @param {object} values Runtime values that need to be type-checked\n * @param {string} location e.g. \"prop\", \"context\", \"child context\"\n * @param {string} componentName Name of the component for error messages.\n * @param {?Function} getStack Returns the component stack.\n * @private\n */\nfunction checkPropTypes(typeSpecs, values, location, componentName, getStack) {\n  if (true) {\n    for (var typeSpecName in typeSpecs) {\n      if (has(typeSpecs, typeSpecName)) {\n        var error;\n        // Prop type validation may throw. In case they do, we don't want to\n        // fail the render phase where it didn't fail before. So we log it.\n        // After these have been cleaned up, we'll let them throw.\n        try {\n          // This is intentionally an invariant that gets caught. It's the same\n          // behavior as without this statement except with a better message.\n          if (typeof typeSpecs[typeSpecName] !== 'function') {\n            var err = Error(\n              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +\n              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' +\n              'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.'\n            );\n            err.name = 'Invariant Violation';\n            throw err;\n          }\n          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);\n        } catch (ex) {\n          error = ex;\n        }\n        if (error && !(error instanceof Error)) {\n          printWarning(\n            (componentName || 'React class') + ': type specification of ' +\n            location + ' `' + typeSpecName + '` is invalid; the type checker ' +\n            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +\n            'You may have forgotten to pass an argument to the type checker ' +\n            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +\n            'shape all require an argument).'\n          );\n        }\n        if (error instanceof Error && !(error.message in loggedTypeFailures)) {\n          // Only monitor this failure once because there tends to be a lot of the\n          // same error.\n          loggedTypeFailures[error.message] = true;\n\n          var stack = getStack ? getStack() : '';\n\n          printWarning(\n            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')\n          );\n        }\n      }\n    }\n  }\n}\n\n/**\n * Resets warning cache when testing.\n *\n * @private\n */\ncheckPropTypes.resetWarningCache = function() {\n  if (true) {\n    loggedTypeFailures = {};\n  }\n}\n\nmodule.exports = checkPropTypes;\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/checkPropTypes.js?");
              }
            ),
            /***/
            "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/factoryWithTypeCheckers.js": (
              /*!****************************************************************************************************************************!*\
                !*** ../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/factoryWithTypeCheckers.js ***!
                \****************************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                "use strict";
                eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\nvar ReactIs = __webpack_require__(/*! react-is */ \"../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/index.js\");\nvar assign = __webpack_require__(/*! object-assign */ \"../../.yarn/cache/object-assign-npm-4.1.1-1004ad6dec-fcc6e4ea8c.zip/node_modules/object-assign/index.js\");\n\nvar ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ \"../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js\");\nvar has = __webpack_require__(/*! ./lib/has */ \"../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/has.js\");\nvar checkPropTypes = __webpack_require__(/*! ./checkPropTypes */ \"../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/checkPropTypes.js\");\n\nvar printWarning = function() {};\n\nif (true) {\n  printWarning = function(text) {\n    var message = 'Warning: ' + text;\n    if (typeof console !== 'undefined') {\n      console.error(message);\n    }\n    try {\n      // --- Welcome to debugging React ---\n      // This error was thrown as a convenience so that you can use this stack\n      // to find the callsite that caused this warning to fire.\n      throw new Error(message);\n    } catch (x) {}\n  };\n}\n\nfunction emptyFunctionThatReturnsNull() {\n  return null;\n}\n\nmodule.exports = function(isValidElement, throwOnDirectAccess) {\n  /* global Symbol */\n  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;\n  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.\n\n  /**\n   * Returns the iterator method function contained on the iterable object.\n   *\n   * Be sure to invoke the function with the iterable as context:\n   *\n   *     var iteratorFn = getIteratorFn(myIterable);\n   *     if (iteratorFn) {\n   *       var iterator = iteratorFn.call(myIterable);\n   *       ...\n   *     }\n   *\n   * @param {?object} maybeIterable\n   * @return {?function}\n   */\n  function getIteratorFn(maybeIterable) {\n    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);\n    if (typeof iteratorFn === 'function') {\n      return iteratorFn;\n    }\n  }\n\n  /**\n   * Collection of methods that allow declaration and validation of props that are\n   * supplied to React components. Example usage:\n   *\n   *   var Props = require('ReactPropTypes');\n   *   var MyArticle = React.createClass({\n   *     propTypes: {\n   *       // An optional string prop named \"description\".\n   *       description: Props.string,\n   *\n   *       // A required enum prop named \"category\".\n   *       category: Props.oneOf(['News','Photos']).isRequired,\n   *\n   *       // A prop named \"dialog\" that requires an instance of Dialog.\n   *       dialog: Props.instanceOf(Dialog).isRequired\n   *     },\n   *     render: function() { ... }\n   *   });\n   *\n   * A more formal specification of how these methods are used:\n   *\n   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)\n   *   decl := ReactPropTypes.{type}(.isRequired)?\n   *\n   * Each and every declaration produces a function with the same signature. This\n   * allows the creation of custom validation functions. For example:\n   *\n   *  var MyLink = React.createClass({\n   *    propTypes: {\n   *      // An optional string or URI prop named \"href\".\n   *      href: function(props, propName, componentName) {\n   *        var propValue = props[propName];\n   *        if (propValue != null && typeof propValue !== 'string' &&\n   *            !(propValue instanceof URI)) {\n   *          return new Error(\n   *            'Expected a string or an URI for ' + propName + ' in ' +\n   *            componentName\n   *          );\n   *        }\n   *      }\n   *    },\n   *    render: function() {...}\n   *  });\n   *\n   * @internal\n   */\n\n  var ANONYMOUS = '<<anonymous>>';\n\n  // Important!\n  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.\n  var ReactPropTypes = {\n    array: createPrimitiveTypeChecker('array'),\n    bigint: createPrimitiveTypeChecker('bigint'),\n    bool: createPrimitiveTypeChecker('boolean'),\n    func: createPrimitiveTypeChecker('function'),\n    number: createPrimitiveTypeChecker('number'),\n    object: createPrimitiveTypeChecker('object'),\n    string: createPrimitiveTypeChecker('string'),\n    symbol: createPrimitiveTypeChecker('symbol'),\n\n    any: createAnyTypeChecker(),\n    arrayOf: createArrayOfTypeChecker,\n    element: createElementTypeChecker(),\n    elementType: createElementTypeTypeChecker(),\n    instanceOf: createInstanceTypeChecker,\n    node: createNodeChecker(),\n    objectOf: createObjectOfTypeChecker,\n    oneOf: createEnumTypeChecker,\n    oneOfType: createUnionTypeChecker,\n    shape: createShapeTypeChecker,\n    exact: createStrictShapeTypeChecker,\n  };\n\n  /**\n   * inlined Object.is polyfill to avoid requiring consumers ship their own\n   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is\n   */\n  /*eslint-disable no-self-compare*/\n  function is(x, y) {\n    // SameValue algorithm\n    if (x === y) {\n      // Steps 1-5, 7-10\n      // Steps 6.b-6.e: +0 != -0\n      return x !== 0 || 1 / x === 1 / y;\n    } else {\n      // Step 6.a: NaN == NaN\n      return x !== x && y !== y;\n    }\n  }\n  /*eslint-enable no-self-compare*/\n\n  /**\n   * We use an Error-like object for backward compatibility as people may call\n   * PropTypes directly and inspect their output. However, we don't use real\n   * Errors anymore. We don't inspect their stack anyway, and creating them\n   * is prohibitively expensive if they are created too often, such as what\n   * happens in oneOfType() for any type before the one that matched.\n   */\n  function PropTypeError(message, data) {\n    this.message = message;\n    this.data = data && typeof data === 'object' ? data: {};\n    this.stack = '';\n  }\n  // Make `instanceof Error` still work for returned errors.\n  PropTypeError.prototype = Error.prototype;\n\n  function createChainableTypeChecker(validate) {\n    if (true) {\n      var manualPropTypeCallCache = {};\n      var manualPropTypeWarningCount = 0;\n    }\n    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {\n      componentName = componentName || ANONYMOUS;\n      propFullName = propFullName || propName;\n\n      if (secret !== ReactPropTypesSecret) {\n        if (throwOnDirectAccess) {\n          // New behavior only for users of `prop-types` package\n          var err = new Error(\n            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +\n            'Use `PropTypes.checkPropTypes()` to call them. ' +\n            'Read more at http://fb.me/use-check-prop-types'\n          );\n          err.name = 'Invariant Violation';\n          throw err;\n        } else if ( true && typeof console !== 'undefined') {\n          // Old behavior for people using React.PropTypes\n          var cacheKey = componentName + ':' + propName;\n          if (\n            !manualPropTypeCallCache[cacheKey] &&\n            // Avoid spamming the console because they are often not actionable except for lib authors\n            manualPropTypeWarningCount < 3\n          ) {\n            printWarning(\n              'You are manually calling a React.PropTypes validation ' +\n              'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' +\n              'and will throw in the standalone `prop-types` package. ' +\n              'You may be seeing this warning due to a third-party PropTypes ' +\n              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'\n            );\n            manualPropTypeCallCache[cacheKey] = true;\n            manualPropTypeWarningCount++;\n          }\n        }\n      }\n      if (props[propName] == null) {\n        if (isRequired) {\n          if (props[propName] === null) {\n            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));\n          }\n          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));\n        }\n        return null;\n      } else {\n        return validate(props, propName, componentName, location, propFullName);\n      }\n    }\n\n    var chainedCheckType = checkType.bind(null, false);\n    chainedCheckType.isRequired = checkType.bind(null, true);\n\n    return chainedCheckType;\n  }\n\n  function createPrimitiveTypeChecker(expectedType) {\n    function validate(props, propName, componentName, location, propFullName, secret) {\n      var propValue = props[propName];\n      var propType = getPropType(propValue);\n      if (propType !== expectedType) {\n        // `propValue` being instance of, say, date/regexp, pass the 'object'\n        // check, but we can offer a more precise error message here rather than\n        // 'of type `object`'.\n        var preciseType = getPreciseType(propValue);\n\n        return new PropTypeError(\n          'Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'),\n          {expectedType: expectedType}\n        );\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createAnyTypeChecker() {\n    return createChainableTypeChecker(emptyFunctionThatReturnsNull);\n  }\n\n  function createArrayOfTypeChecker(typeChecker) {\n    function validate(props, propName, componentName, location, propFullName) {\n      if (typeof typeChecker !== 'function') {\n        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');\n      }\n      var propValue = props[propName];\n      if (!Array.isArray(propValue)) {\n        var propType = getPropType(propValue);\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));\n      }\n      for (var i = 0; i < propValue.length; i++) {\n        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);\n        if (error instanceof Error) {\n          return error;\n        }\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createElementTypeChecker() {\n    function validate(props, propName, componentName, location, propFullName) {\n      var propValue = props[propName];\n      if (!isValidElement(propValue)) {\n        var propType = getPropType(propValue);\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createElementTypeTypeChecker() {\n    function validate(props, propName, componentName, location, propFullName) {\n      var propValue = props[propName];\n      if (!ReactIs.isValidElementType(propValue)) {\n        var propType = getPropType(propValue);\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createInstanceTypeChecker(expectedClass) {\n    function validate(props, propName, componentName, location, propFullName) {\n      if (!(props[propName] instanceof expectedClass)) {\n        var expectedClassName = expectedClass.name || ANONYMOUS;\n        var actualClassName = getClassName(props[propName]);\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createEnumTypeChecker(expectedValues) {\n    if (!Array.isArray(expectedValues)) {\n      if (true) {\n        if (arguments.length > 1) {\n          printWarning(\n            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +\n            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'\n          );\n        } else {\n          printWarning('Invalid argument supplied to oneOf, expected an array.');\n        }\n      }\n      return emptyFunctionThatReturnsNull;\n    }\n\n    function validate(props, propName, componentName, location, propFullName) {\n      var propValue = props[propName];\n      for (var i = 0; i < expectedValues.length; i++) {\n        if (is(propValue, expectedValues[i])) {\n          return null;\n        }\n      }\n\n      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {\n        var type = getPreciseType(value);\n        if (type === 'symbol') {\n          return String(value);\n        }\n        return value;\n      });\n      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createObjectOfTypeChecker(typeChecker) {\n    function validate(props, propName, componentName, location, propFullName) {\n      if (typeof typeChecker !== 'function') {\n        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');\n      }\n      var propValue = props[propName];\n      var propType = getPropType(propValue);\n      if (propType !== 'object') {\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));\n      }\n      for (var key in propValue) {\n        if (has(propValue, key)) {\n          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);\n          if (error instanceof Error) {\n            return error;\n          }\n        }\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createUnionTypeChecker(arrayOfTypeCheckers) {\n    if (!Array.isArray(arrayOfTypeCheckers)) {\n       true ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : 0;\n      return emptyFunctionThatReturnsNull;\n    }\n\n    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {\n      var checker = arrayOfTypeCheckers[i];\n      if (typeof checker !== 'function') {\n        printWarning(\n          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +\n          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'\n        );\n        return emptyFunctionThatReturnsNull;\n      }\n    }\n\n    function validate(props, propName, componentName, location, propFullName) {\n      var expectedTypes = [];\n      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {\n        var checker = arrayOfTypeCheckers[i];\n        var checkerResult = checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret);\n        if (checkerResult == null) {\n          return null;\n        }\n        if (checkerResult.data.hasOwnProperty('expectedType')) {\n          expectedTypes.push(checkerResult.data.expectedType);\n        }\n      }\n      var expectedTypesMessage = (expectedTypes.length > 0) ? ', expected one of type [' + expectedTypes.join(', ') + ']': '';\n      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`' + expectedTypesMessage + '.'));\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createNodeChecker() {\n    function validate(props, propName, componentName, location, propFullName) {\n      if (!isNode(props[propName])) {\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function invalidValidatorError(componentName, location, propFullName, key, type) {\n    return new PropTypeError(\n      (componentName || 'React class') + ': ' + location + ' type `' + propFullName + '.' + key + '` is invalid; ' +\n      'it must be a function, usually from the `prop-types` package, but received `' + type + '`.'\n    );\n  }\n\n  function createShapeTypeChecker(shapeTypes) {\n    function validate(props, propName, componentName, location, propFullName) {\n      var propValue = props[propName];\n      var propType = getPropType(propValue);\n      if (propType !== 'object') {\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));\n      }\n      for (var key in shapeTypes) {\n        var checker = shapeTypes[key];\n        if (typeof checker !== 'function') {\n          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));\n        }\n        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);\n        if (error) {\n          return error;\n        }\n      }\n      return null;\n    }\n    return createChainableTypeChecker(validate);\n  }\n\n  function createStrictShapeTypeChecker(shapeTypes) {\n    function validate(props, propName, componentName, location, propFullName) {\n      var propValue = props[propName];\n      var propType = getPropType(propValue);\n      if (propType !== 'object') {\n        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));\n      }\n      // We need to check all keys in case some are required but missing from props.\n      var allKeys = assign({}, props[propName], shapeTypes);\n      for (var key in allKeys) {\n        var checker = shapeTypes[key];\n        if (has(shapeTypes, key) && typeof checker !== 'function') {\n          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));\n        }\n        if (!checker) {\n          return new PropTypeError(\n            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +\n            '\\nBad object: ' + JSON.stringify(props[propName], null, '  ') +\n            '\\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  ')\n          );\n        }\n        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);\n        if (error) {\n          return error;\n        }\n      }\n      return null;\n    }\n\n    return createChainableTypeChecker(validate);\n  }\n\n  function isNode(propValue) {\n    switch (typeof propValue) {\n      case 'number':\n      case 'string':\n      case 'undefined':\n        return true;\n      case 'boolean':\n        return !propValue;\n      case 'object':\n        if (Array.isArray(propValue)) {\n          return propValue.every(isNode);\n        }\n        if (propValue === null || isValidElement(propValue)) {\n          return true;\n        }\n\n        var iteratorFn = getIteratorFn(propValue);\n        if (iteratorFn) {\n          var iterator = iteratorFn.call(propValue);\n          var step;\n          if (iteratorFn !== propValue.entries) {\n            while (!(step = iterator.next()).done) {\n              if (!isNode(step.value)) {\n                return false;\n              }\n            }\n          } else {\n            // Iterator will provide entry [k,v] tuples rather than values.\n            while (!(step = iterator.next()).done) {\n              var entry = step.value;\n              if (entry) {\n                if (!isNode(entry[1])) {\n                  return false;\n                }\n              }\n            }\n          }\n        } else {\n          return false;\n        }\n\n        return true;\n      default:\n        return false;\n    }\n  }\n\n  function isSymbol(propType, propValue) {\n    // Native Symbol.\n    if (propType === 'symbol') {\n      return true;\n    }\n\n    // falsy value can't be a Symbol\n    if (!propValue) {\n      return false;\n    }\n\n    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'\n    if (propValue['@@toStringTag'] === 'Symbol') {\n      return true;\n    }\n\n    // Fallback for non-spec compliant Symbols which are polyfilled.\n    if (typeof Symbol === 'function' && propValue instanceof Symbol) {\n      return true;\n    }\n\n    return false;\n  }\n\n  // Equivalent of `typeof` but with special handling for array and regexp.\n  function getPropType(propValue) {\n    var propType = typeof propValue;\n    if (Array.isArray(propValue)) {\n      return 'array';\n    }\n    if (propValue instanceof RegExp) {\n      // Old webkits (at least until Android 4.0) return 'function' rather than\n      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/\n      // passes PropTypes.object.\n      return 'object';\n    }\n    if (isSymbol(propType, propValue)) {\n      return 'symbol';\n    }\n    return propType;\n  }\n\n  // This handles more types than `getPropType`. Only used for error messages.\n  // See `createPrimitiveTypeChecker`.\n  function getPreciseType(propValue) {\n    if (typeof propValue === 'undefined' || propValue === null) {\n      return '' + propValue;\n    }\n    var propType = getPropType(propValue);\n    if (propType === 'object') {\n      if (propValue instanceof Date) {\n        return 'date';\n      } else if (propValue instanceof RegExp) {\n        return 'regexp';\n      }\n    }\n    return propType;\n  }\n\n  // Returns a string that is postfixed to a warning about an invalid type.\n  // For example, \"undefined\" or \"of type array\"\n  function getPostfixForTypeWarning(value) {\n    var type = getPreciseType(value);\n    switch (type) {\n      case 'array':\n      case 'object':\n        return 'an ' + type;\n      case 'boolean':\n      case 'date':\n      case 'regexp':\n        return 'a ' + type;\n      default:\n        return type;\n    }\n  }\n\n  // Returns class name of the object, if any.\n  function getClassName(propValue) {\n    if (!propValue.constructor || !propValue.constructor.name) {\n      return ANONYMOUS;\n    }\n    return propValue.constructor.name;\n  }\n\n  ReactPropTypes.checkPropTypes = checkPropTypes;\n  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;\n  ReactPropTypes.PropTypes = ReactPropTypes;\n\n  return ReactPropTypes;\n};\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/factoryWithTypeCheckers.js?");
              }
            ),
            /***/
            "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js": (
              /*!**********************************************************************************************************!*\
                !*** ../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js ***!
                \**********************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                eval('/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\nif (true) {\n  var ReactIs = __webpack_require__(/*! react-is */ "../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/index.js");\n\n  // By explicitly using `prop-types` you are opting into new development behavior.\n  // http://fb.me/prop-types-in-prod\n  var throwOnDirectAccess = true;\n  module.exports = __webpack_require__(/*! ./factoryWithTypeCheckers */ "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/factoryWithTypeCheckers.js")(ReactIs.isElement, throwOnDirectAccess);\n} else {}\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/index.js?');
              }
            ),
            /***/
            "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js": (
              /*!*****************************************************************************************************************************!*\
                !*** ../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
                \*****************************************************************************************************************************/
              /***/
              (module) => {
                "use strict";
                eval("/**\n * Copyright (c) 2013-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\nvar ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';\n\nmodule.exports = ReactPropTypesSecret;\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js?");
              }
            ),
            /***/
            "../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/has.js": (
              /*!************************************************************************************************************!*\
                !*** ../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/has.js ***!
                \************************************************************************************************************/
              /***/
              (module) => {
                eval("module.exports = Function.call.bind(Object.prototype.hasOwnProperty);\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/prop-types-npm-15.8.0-6f60fc44c7-d8d51cf55d.zip/node_modules/prop-types/lib/has.js?");
              }
            ),
            /***/
            "../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/cjs/react-is.development.js": (
              /*!**************************************************************************************************************************!*\
                !*** ../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/cjs/react-is.development.js ***!
                \**************************************************************************************************************************/
              /***/
              (__unused_webpack_module, exports) => {
                "use strict";
                eval("/** @license React v16.13.1\n * react-is.development.js\n *\n * Copyright (c) Facebook, Inc. and its affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n\n\n\nif (true) {\n  (function() {\n'use strict';\n\n// The Symbol used to tag the ReactElement-like types. If there is no native Symbol\n// nor polyfill, then a plain number is used for performance.\nvar hasSymbol = typeof Symbol === 'function' && Symbol.for;\nvar REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;\nvar REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;\nvar REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;\nvar REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;\nvar REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;\nvar REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;\nvar REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary\n// (unstable) APIs that have been removed. Can we remove the symbols?\n\nvar REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;\nvar REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;\nvar REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;\nvar REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;\nvar REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;\nvar REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;\nvar REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;\nvar REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;\nvar REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;\nvar REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;\nvar REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;\n\nfunction isValidElementType(type) {\n  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.\n  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);\n}\n\nfunction typeOf(object) {\n  if (typeof object === 'object' && object !== null) {\n    var $$typeof = object.$$typeof;\n\n    switch ($$typeof) {\n      case REACT_ELEMENT_TYPE:\n        var type = object.type;\n\n        switch (type) {\n          case REACT_ASYNC_MODE_TYPE:\n          case REACT_CONCURRENT_MODE_TYPE:\n          case REACT_FRAGMENT_TYPE:\n          case REACT_PROFILER_TYPE:\n          case REACT_STRICT_MODE_TYPE:\n          case REACT_SUSPENSE_TYPE:\n            return type;\n\n          default:\n            var $$typeofType = type && type.$$typeof;\n\n            switch ($$typeofType) {\n              case REACT_CONTEXT_TYPE:\n              case REACT_FORWARD_REF_TYPE:\n              case REACT_LAZY_TYPE:\n              case REACT_MEMO_TYPE:\n              case REACT_PROVIDER_TYPE:\n                return $$typeofType;\n\n              default:\n                return $$typeof;\n            }\n\n        }\n\n      case REACT_PORTAL_TYPE:\n        return $$typeof;\n    }\n  }\n\n  return undefined;\n} // AsyncMode is deprecated along with isAsyncMode\n\nvar AsyncMode = REACT_ASYNC_MODE_TYPE;\nvar ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;\nvar ContextConsumer = REACT_CONTEXT_TYPE;\nvar ContextProvider = REACT_PROVIDER_TYPE;\nvar Element = REACT_ELEMENT_TYPE;\nvar ForwardRef = REACT_FORWARD_REF_TYPE;\nvar Fragment = REACT_FRAGMENT_TYPE;\nvar Lazy = REACT_LAZY_TYPE;\nvar Memo = REACT_MEMO_TYPE;\nvar Portal = REACT_PORTAL_TYPE;\nvar Profiler = REACT_PROFILER_TYPE;\nvar StrictMode = REACT_STRICT_MODE_TYPE;\nvar Suspense = REACT_SUSPENSE_TYPE;\nvar hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated\n\nfunction isAsyncMode(object) {\n  {\n    if (!hasWarnedAboutDeprecatedIsAsyncMode) {\n      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint\n\n      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');\n    }\n  }\n\n  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;\n}\nfunction isConcurrentMode(object) {\n  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;\n}\nfunction isContextConsumer(object) {\n  return typeOf(object) === REACT_CONTEXT_TYPE;\n}\nfunction isContextProvider(object) {\n  return typeOf(object) === REACT_PROVIDER_TYPE;\n}\nfunction isElement(object) {\n  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;\n}\nfunction isForwardRef(object) {\n  return typeOf(object) === REACT_FORWARD_REF_TYPE;\n}\nfunction isFragment(object) {\n  return typeOf(object) === REACT_FRAGMENT_TYPE;\n}\nfunction isLazy(object) {\n  return typeOf(object) === REACT_LAZY_TYPE;\n}\nfunction isMemo(object) {\n  return typeOf(object) === REACT_MEMO_TYPE;\n}\nfunction isPortal(object) {\n  return typeOf(object) === REACT_PORTAL_TYPE;\n}\nfunction isProfiler(object) {\n  return typeOf(object) === REACT_PROFILER_TYPE;\n}\nfunction isStrictMode(object) {\n  return typeOf(object) === REACT_STRICT_MODE_TYPE;\n}\nfunction isSuspense(object) {\n  return typeOf(object) === REACT_SUSPENSE_TYPE;\n}\n\nexports.AsyncMode = AsyncMode;\nexports.ConcurrentMode = ConcurrentMode;\nexports.ContextConsumer = ContextConsumer;\nexports.ContextProvider = ContextProvider;\nexports.Element = Element;\nexports.ForwardRef = ForwardRef;\nexports.Fragment = Fragment;\nexports.Lazy = Lazy;\nexports.Memo = Memo;\nexports.Portal = Portal;\nexports.Profiler = Profiler;\nexports.StrictMode = StrictMode;\nexports.Suspense = Suspense;\nexports.isAsyncMode = isAsyncMode;\nexports.isConcurrentMode = isConcurrentMode;\nexports.isContextConsumer = isContextConsumer;\nexports.isContextProvider = isContextProvider;\nexports.isElement = isElement;\nexports.isForwardRef = isForwardRef;\nexports.isFragment = isFragment;\nexports.isLazy = isLazy;\nexports.isMemo = isMemo;\nexports.isPortal = isPortal;\nexports.isProfiler = isProfiler;\nexports.isStrictMode = isStrictMode;\nexports.isSuspense = isSuspense;\nexports.isValidElementType = isValidElementType;\nexports.typeOf = typeOf;\n  })();\n}\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/cjs/react-is.development.js?");
              }
            ),
            /***/
            "../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/index.js": (
              /*!*******************************************************************************************************!*\
                !*** ../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/index.js ***!
                \*******************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                "use strict";
                eval('\n\nif (false) {} else {\n  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/cjs/react-is.development.js");\n}\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/react-is-npm-16.13.1-a9b9382b4f-f7a19ac349.zip/node_modules/react-is/index.js?');
              }
            ),
            /***/
            "../../.yarn/cache/simple-swizzle-npm-0.2.2-8dee37fad1-a7f3f2ab5c.zip/node_modules/simple-swizzle/index.js": (
              /*!*****************************************************************************************************************!*\
                !*** ../../.yarn/cache/simple-swizzle-npm-0.2.2-8dee37fad1-a7f3f2ab5c.zip/node_modules/simple-swizzle/index.js ***!
                \*****************************************************************************************************************/
              /***/
              (module, __unused_webpack_exports, __webpack_require__) => {
                "use strict";
                eval('\n\nvar isArrayish = __webpack_require__(/*! is-arrayish */ "../../.yarn/cache/is-arrayish-npm-0.3.2-f856180f79-977e64f54d.zip/node_modules/is-arrayish/index.js");\n\nvar concat = Array.prototype.concat;\nvar slice = Array.prototype.slice;\n\nvar swizzle = module.exports = function swizzle(args) {\n	var results = [];\n\n	for (var i = 0, len = args.length; i < len; i++) {\n		var arg = args[i];\n\n		if (isArrayish(arg)) {\n			// http://jsperf.com/javascript-array-concat-vs-push/98\n			results = concat.call(results, slice.call(arg));\n		} else {\n			results.push(arg);\n		}\n	}\n\n	return results;\n};\n\nswizzle.wrap = function (fn) {\n	return function () {\n		return fn(swizzle(arguments));\n	};\n};\n\n\n//# sourceURL=webpack://ReactJsonTree/../../.yarn/cache/simple-swizzle-npm-0.2.2-8dee37fad1-a7f3f2ab5c.zip/node_modules/simple-swizzle/index.js?');
              }
            ),
            /***/
            "react": (
              /*!**************************************************************************************!*\
                !*** external {"root":"React","commonjs2":"react","commonjs":"react","amd":"react"} ***!
                \**************************************************************************************/
              /***/
              (module2) => {
                "use strict";
                module2.exports = __WEBPACK_EXTERNAL_MODULE_react__;
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
            __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          (() => {
            __webpack_require__.n = (module2) => {
              var getter = module2 && module2.__esModule ? (
                /******/
                () => module2["default"]
              ) : (
                /******/
                () => module2
              );
              __webpack_require__.d(getter, { a: getter });
              return getter;
            };
          })();
          (() => {
            __webpack_require__.d = (exports2, definition) => {
              for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                  Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
                }
              }
            };
          })();
          (() => {
            __webpack_require__.g = function() {
              if (typeof globalThis === "object")
                return globalThis;
              try {
                return this || new Function("return this")();
              } catch (e) {
                if (typeof window === "object")
                  return window;
              }
            }();
          })();
          (() => {
            __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
          })();
          (() => {
            __webpack_require__.r = (exports2) => {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
          })();
          var __webpack_exports__ = __webpack_require__("./src/index.tsx");
          __webpack_exports__ = __webpack_exports__["default"];
          return __webpack_exports__;
        })()
      );
    });
  }
});
export default require_react_json_tree();
//# sourceMappingURL=react-json-tree.js.map
