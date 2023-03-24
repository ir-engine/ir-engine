import {
  require_lib
} from "./chunk-5G3JAHHK.js";
import "./chunk-R6B3NM7Z.js";
import {
  require_prop_types
} from "./chunk-WM2OC5CN.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __commonJS,
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@icons/material/UnfoldMoreHorizontalIcon.js
var require_UnfoldMoreHorizontalIcon = __commonJS({
  "../../node_modules/@icons/material/UnfoldMoreHorizontalIcon.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _extends10 = Object.assign || function(target) {
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
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _objectWithoutProperties(obj, keys2) {
      var target = {};
      for (var i in obj) {
        if (keys2.indexOf(i) >= 0)
          continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i))
          continue;
        target[i] = obj[i];
      }
      return target;
    }
    var DEFAULT_SIZE = 24;
    exports2.default = function(_ref) {
      var _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "currentColor" : _ref$fill, _ref$width = _ref.width, width = _ref$width === void 0 ? DEFAULT_SIZE : _ref$width, _ref$height = _ref.height, height = _ref$height === void 0 ? DEFAULT_SIZE : _ref$height, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style, props = _objectWithoutProperties(_ref, ["fill", "width", "height", "style"]);
      return _react2.default.createElement(
        "svg",
        _extends10({
          viewBox: "0 0 " + DEFAULT_SIZE + " " + DEFAULT_SIZE,
          style: _extends10({ fill, width, height }, style)
        }, props),
        _react2.default.createElement("path", { d: "M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" })
      );
    };
  }
});

// ../../node_modules/@icons/material/CheckIcon.js
var require_CheckIcon = __commonJS({
  "../../node_modules/@icons/material/CheckIcon.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _extends10 = Object.assign || function(target) {
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
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _objectWithoutProperties(obj, keys2) {
      var target = {};
      for (var i in obj) {
        if (keys2.indexOf(i) >= 0)
          continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i))
          continue;
        target[i] = obj[i];
      }
      return target;
    }
    var DEFAULT_SIZE = 24;
    exports2.default = function(_ref) {
      var _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "currentColor" : _ref$fill, _ref$width = _ref.width, width = _ref$width === void 0 ? DEFAULT_SIZE : _ref$width, _ref$height = _ref.height, height = _ref$height === void 0 ? DEFAULT_SIZE : _ref$height, _ref$style = _ref.style, style = _ref$style === void 0 ? {} : _ref$style, props = _objectWithoutProperties(_ref, ["fill", "width", "height", "style"]);
      return _react2.default.createElement(
        "svg",
        _extends10({
          viewBox: "0 0 " + DEFAULT_SIZE + " " + DEFAULT_SIZE,
          style: _extends10({ fill, width, height }, style)
        }, props),
        _react2.default.createElement("path", { d: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" })
      );
    };
  }
});

// ../../node_modules/react-color/es/components/alpha/Alpha.js
var import_react11 = __toESM(require_react());
var import_reactcss9 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/common/Alpha.js
var import_react2 = __toESM(require_react());
var import_reactcss2 = __toESM(require_lib());

// ../../node_modules/react-color/es/helpers/alpha.js
var calculateChange = function calculateChange2(e, hsl, direction, initialA, container) {
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

// ../../node_modules/react-color/es/components/common/Checkboard.js
var import_react = __toESM(require_react());
var import_reactcss = __toESM(require_lib());

// ../../node_modules/react-color/es/helpers/checkboard.js
var checkboardCache = {};
var render = function render2(c1, c2, size, serverCanvas) {
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
var get = function get2(c1, c2, size, serverCanvas) {
  var key = c1 + "-" + c2 + "-" + size + (serverCanvas ? "-server" : "");
  if (checkboardCache[key]) {
    return checkboardCache[key];
  }
  var checkboard = render(c1, c2, size, serverCanvas);
  checkboardCache[key] = checkboard;
  return checkboard;
};

// ../../node_modules/react-color/es/components/common/Checkboard.js
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
var Checkboard = function Checkboard2(_ref) {
  var white = _ref.white, grey = _ref.grey, size = _ref.size, renderers = _ref.renderers, borderRadius = _ref.borderRadius, boxShadow = _ref.boxShadow, children = _ref.children;
  var styles = (0, import_reactcss.default)({
    "default": {
      grid: {
        borderRadius,
        boxShadow,
        absolute: "0px 0px 0px 0px",
        background: "url(" + get(white, grey, size, renderers.canvas) + ") center left"
      }
    }
  });
  return (0, import_react.isValidElement)(children) ? import_react.default.cloneElement(children, _extends({}, children.props, { style: _extends({}, children.props.style, styles.grid) })) : import_react.default.createElement("div", { style: styles.grid });
};
Checkboard.defaultProps = {
  size: 8,
  white: "transparent",
  grey: "rgba(0,0,0,.08)",
  renderers: {}
};
var Checkboard_default = Checkboard;

// ../../node_modules/react-color/es/components/common/Alpha.js
var _extends2 = Object.assign || function(target) {
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
var Alpha = function(_ref) {
  _inherits(Alpha2, _ref);
  function Alpha2() {
    var _ref2;
    var _temp, _this, _ret;
    _classCallCheck(this, Alpha2);
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Alpha2.__proto__ || Object.getPrototypeOf(Alpha2)).call.apply(_ref2, [this].concat(args))), _this), _this.handleChange = function(e) {
      var change = calculateChange(e, _this.props.hsl, _this.props.direction, _this.props.a, _this.container);
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
    value: function render3() {
      var _this2 = this;
      var rgb = this.props.rgb;
      var styles = (0, import_reactcss2.default)({
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
        "overwrite": _extends2({}, this.props.style)
      }, {
        vertical: this.props.direction === "vertical",
        overwrite: true
      });
      return import_react2.default.createElement(
        "div",
        { style: styles.alpha },
        import_react2.default.createElement(
          "div",
          { style: styles.checkboard },
          import_react2.default.createElement(Checkboard_default, { renderers: this.props.renderers })
        ),
        import_react2.default.createElement("div", { style: styles.gradient }),
        import_react2.default.createElement(
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
          import_react2.default.createElement(
            "div",
            { style: styles.pointer },
            this.props.pointer ? import_react2.default.createElement(this.props.pointer, this.props) : import_react2.default.createElement("div", { style: styles.slider })
          )
        )
      );
    }
  }]);
  return Alpha2;
}(import_react2.PureComponent || import_react2.Component);
var Alpha_default = Alpha;

// ../../node_modules/react-color/es/components/common/EditableInput.js
var import_react3 = __toESM(require_react());
var import_reactcss3 = __toESM(require_lib());
var _createClass2 = function() {
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
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _classCallCheck2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn2(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits2(subClass, superClass) {
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
var EditableInput = function(_ref) {
  _inherits2(EditableInput2, _ref);
  function EditableInput2(props) {
    _classCallCheck2(this, EditableInput2);
    var _this = _possibleConstructorReturn2(this, (EditableInput2.__proto__ || Object.getPrototypeOf(EditableInput2)).call(this));
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
  _createClass2(EditableInput2, [{
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
    value: function render3() {
      var _this2 = this;
      var styles = (0, import_reactcss3.default)({
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
      return import_react3.default.createElement(
        "div",
        { style: styles.wrap },
        import_react3.default.createElement("input", {
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
        this.props.label && !this.props.hideLabel ? import_react3.default.createElement(
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
}(import_react3.PureComponent || import_react3.Component);
var EditableInput_default = EditableInput;

// ../../node_modules/react-color/es/components/common/Hue.js
var import_react4 = __toESM(require_react());
var import_reactcss4 = __toESM(require_lib());

// ../../node_modules/react-color/es/helpers/hue.js
var calculateChange3 = function calculateChange4(e, direction, hsl, container) {
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

// ../../node_modules/react-color/es/components/common/Hue.js
var _createClass3 = function() {
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
function _classCallCheck3(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn3(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits3(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var Hue = function(_ref) {
  _inherits3(Hue2, _ref);
  function Hue2() {
    var _ref2;
    var _temp, _this, _ret;
    _classCallCheck3(this, Hue2);
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return _ret = (_temp = (_this = _possibleConstructorReturn3(this, (_ref2 = Hue2.__proto__ || Object.getPrototypeOf(Hue2)).call.apply(_ref2, [this].concat(args))), _this), _this.handleChange = function(e) {
      var change = calculateChange3(e, _this.props.direction, _this.props.hsl, _this.container);
      change && typeof _this.props.onChange === "function" && _this.props.onChange(change, e);
    }, _this.handleMouseDown = function(e) {
      _this.handleChange(e);
      window.addEventListener("mousemove", _this.handleChange);
      window.addEventListener("mouseup", _this.handleMouseUp);
    }, _this.handleMouseUp = function() {
      _this.unbindEventListeners();
    }, _temp), _possibleConstructorReturn3(_this, _ret);
  }
  _createClass3(Hue2, [{
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
    value: function render3() {
      var _this2 = this;
      var _props$direction = this.props.direction, direction = _props$direction === void 0 ? "horizontal" : _props$direction;
      var styles = (0, import_reactcss4.default)({
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
      return import_react4.default.createElement(
        "div",
        { style: styles.hue },
        import_react4.default.createElement(
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
          import_react4.default.createElement(
            "style",
            null,
            "\n            .hue-horizontal {\n              background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0\n                33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n              background: -webkit-linear-gradient(to right, #f00 0%, #ff0\n                17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n            }\n\n            .hue-vertical {\n              background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%,\n                #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n              background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%,\n                #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);\n            }\n          "
          ),
          import_react4.default.createElement(
            "div",
            { style: styles.pointer },
            this.props.pointer ? import_react4.default.createElement(this.props.pointer, this.props) : import_react4.default.createElement("div", { style: styles.slider })
          )
        )
      );
    }
  }]);
  return Hue2;
}(import_react4.PureComponent || import_react4.Component);
var Hue_default = Hue;

// ../../node_modules/react-color/es/components/common/Raised.js
var import_react5 = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());
var import_reactcss5 = __toESM(require_lib());

// ../../node_modules/lodash-es/_listCacheClear.js
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
var listCacheClear_default = listCacheClear;

// ../../node_modules/lodash-es/eq.js
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_default = eq;

// ../../node_modules/lodash-es/_assocIndexOf.js
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_default(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var assocIndexOf_default = assocIndexOf;

// ../../node_modules/lodash-es/_listCacheDelete.js
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var listCacheDelete_default = listCacheDelete;

// ../../node_modules/lodash-es/_listCacheGet.js
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  return index < 0 ? void 0 : data[index][1];
}
var listCacheGet_default = listCacheGet;

// ../../node_modules/lodash-es/_listCacheHas.js
function listCacheHas(key) {
  return assocIndexOf_default(this.__data__, key) > -1;
}
var listCacheHas_default = listCacheHas;

// ../../node_modules/lodash-es/_listCacheSet.js
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf_default(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var listCacheSet_default = listCacheSet;

// ../../node_modules/lodash-es/_ListCache.js
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear_default;
ListCache.prototype["delete"] = listCacheDelete_default;
ListCache.prototype.get = listCacheGet_default;
ListCache.prototype.has = listCacheHas_default;
ListCache.prototype.set = listCacheSet_default;
var ListCache_default = ListCache;

// ../../node_modules/lodash-es/_stackClear.js
function stackClear() {
  this.__data__ = new ListCache_default();
  this.size = 0;
}
var stackClear_default = stackClear;

// ../../node_modules/lodash-es/_stackDelete.js
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var stackDelete_default = stackDelete;

// ../../node_modules/lodash-es/_stackGet.js
function stackGet(key) {
  return this.__data__.get(key);
}
var stackGet_default = stackGet;

// ../../node_modules/lodash-es/_stackHas.js
function stackHas(key) {
  return this.__data__.has(key);
}
var stackHas_default = stackHas;

// ../../node_modules/lodash-es/_freeGlobal.js
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeGlobal_default = freeGlobal;

// ../../node_modules/lodash-es/_root.js
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal_default || freeSelf || Function("return this")();
var root_default = root;

// ../../node_modules/lodash-es/_Symbol.js
var Symbol2 = root_default.Symbol;
var Symbol_default = Symbol2;

// ../../node_modules/lodash-es/_getRawTag.js
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
var getRawTag_default = getRawTag;

// ../../node_modules/lodash-es/_objectToString.js
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
var objectToString_default = objectToString;

// ../../node_modules/lodash-es/_baseGetTag.js
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
}
var baseGetTag_default = baseGetTag;

// ../../node_modules/lodash-es/isObject.js
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_default = isObject;

// ../../node_modules/lodash-es/isFunction.js
var asyncTag = "[object AsyncFunction]";
var funcTag = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject_default(value)) {
    return false;
  }
  var tag = baseGetTag_default(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_default = isFunction;

// ../../node_modules/lodash-es/_coreJsData.js
var coreJsData = root_default["__core-js_shared__"];
var coreJsData_default = coreJsData;

// ../../node_modules/lodash-es/_isMasked.js
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var isMasked_default = isMasked;

// ../../node_modules/lodash-es/_toSource.js
var funcProto = Function.prototype;
var funcToString = funcProto.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var toSource_default = toSource;

// ../../node_modules/lodash-es/_baseIsNative.js
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto2 = Function.prototype;
var objectProto3 = Object.prototype;
var funcToString2 = funcProto2.toString;
var hasOwnProperty2 = objectProto3.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject_default(value) || isMasked_default(value)) {
    return false;
  }
  var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource_default(value));
}
var baseIsNative_default = baseIsNative;

// ../../node_modules/lodash-es/_getValue.js
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
var getValue_default = getValue;

// ../../node_modules/lodash-es/_getNative.js
function getNative(object, key) {
  var value = getValue_default(object, key);
  return baseIsNative_default(value) ? value : void 0;
}
var getNative_default = getNative;

// ../../node_modules/lodash-es/_Map.js
var Map = getNative_default(root_default, "Map");
var Map_default = Map;

// ../../node_modules/lodash-es/_nativeCreate.js
var nativeCreate = getNative_default(Object, "create");
var nativeCreate_default = nativeCreate;

// ../../node_modules/lodash-es/_hashClear.js
function hashClear() {
  this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
  this.size = 0;
}
var hashClear_default = hashClear;

// ../../node_modules/lodash-es/_hashDelete.js
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var hashDelete_default = hashDelete;

// ../../node_modules/lodash-es/_hashGet.js
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var objectProto4 = Object.prototype;
var hasOwnProperty3 = objectProto4.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate_default) {
    var result = data[key];
    return result === HASH_UNDEFINED ? void 0 : result;
  }
  return hasOwnProperty3.call(data, key) ? data[key] : void 0;
}
var hashGet_default = hashGet;

// ../../node_modules/lodash-es/_hashHas.js
var objectProto5 = Object.prototype;
var hasOwnProperty4 = objectProto5.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty4.call(data, key);
}
var hashHas_default = hashHas;

// ../../node_modules/lodash-es/_hashSet.js
var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
  return this;
}
var hashSet_default = hashSet;

// ../../node_modules/lodash-es/_Hash.js
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear_default;
Hash.prototype["delete"] = hashDelete_default;
Hash.prototype.get = hashGet_default;
Hash.prototype.has = hashHas_default;
Hash.prototype.set = hashSet_default;
var Hash_default = Hash;

// ../../node_modules/lodash-es/_mapCacheClear.js
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash_default(),
    "map": new (Map_default || ListCache_default)(),
    "string": new Hash_default()
  };
}
var mapCacheClear_default = mapCacheClear;

// ../../node_modules/lodash-es/_isKeyable.js
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var isKeyable_default = isKeyable;

// ../../node_modules/lodash-es/_getMapData.js
function getMapData(map2, key) {
  var data = map2.__data__;
  return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var getMapData_default = getMapData;

// ../../node_modules/lodash-es/_mapCacheDelete.js
function mapCacheDelete(key) {
  var result = getMapData_default(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var mapCacheDelete_default = mapCacheDelete;

// ../../node_modules/lodash-es/_mapCacheGet.js
function mapCacheGet(key) {
  return getMapData_default(this, key).get(key);
}
var mapCacheGet_default = mapCacheGet;

// ../../node_modules/lodash-es/_mapCacheHas.js
function mapCacheHas(key) {
  return getMapData_default(this, key).has(key);
}
var mapCacheHas_default = mapCacheHas;

// ../../node_modules/lodash-es/_mapCacheSet.js
function mapCacheSet(key, value) {
  var data = getMapData_default(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var mapCacheSet_default = mapCacheSet;

// ../../node_modules/lodash-es/_MapCache.js
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear_default;
MapCache.prototype["delete"] = mapCacheDelete_default;
MapCache.prototype.get = mapCacheGet_default;
MapCache.prototype.has = mapCacheHas_default;
MapCache.prototype.set = mapCacheSet_default;
var MapCache_default = MapCache;

// ../../node_modules/lodash-es/_stackSet.js
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache_default) {
    var pairs = data.__data__;
    if (!Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache_default(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var stackSet_default = stackSet;

// ../../node_modules/lodash-es/_Stack.js
function Stack(entries) {
  var data = this.__data__ = new ListCache_default(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear_default;
Stack.prototype["delete"] = stackDelete_default;
Stack.prototype.get = stackGet_default;
Stack.prototype.has = stackHas_default;
Stack.prototype.set = stackSet_default;
var Stack_default = Stack;

// ../../node_modules/lodash-es/_defineProperty.js
var defineProperty = function() {
  try {
    var func = getNative_default(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var defineProperty_default = defineProperty;

// ../../node_modules/lodash-es/_baseAssignValue.js
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && defineProperty_default) {
    defineProperty_default(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var baseAssignValue_default = baseAssignValue;

// ../../node_modules/lodash-es/_assignMergeValue.js
function assignMergeValue(object, key, value) {
  if (value !== void 0 && !eq_default(object[key], value) || value === void 0 && !(key in object)) {
    baseAssignValue_default(object, key, value);
  }
}
var assignMergeValue_default = assignMergeValue;

// ../../node_modules/lodash-es/_createBaseFor.js
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var createBaseFor_default = createBaseFor;

// ../../node_modules/lodash-es/_baseFor.js
var baseFor = createBaseFor_default();
var baseFor_default = baseFor;

// ../../node_modules/lodash-es/_cloneBuffer.js
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer = moduleExports ? root_default.Buffer : void 0;
var allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
var cloneBuffer_default = cloneBuffer;

// ../../node_modules/lodash-es/_Uint8Array.js
var Uint8Array = root_default.Uint8Array;
var Uint8Array_default = Uint8Array;

// ../../node_modules/lodash-es/_cloneArrayBuffer.js
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array_default(result).set(new Uint8Array_default(arrayBuffer));
  return result;
}
var cloneArrayBuffer_default = cloneArrayBuffer;

// ../../node_modules/lodash-es/_cloneTypedArray.js
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var cloneTypedArray_default = cloneTypedArray;

// ../../node_modules/lodash-es/_copyArray.js
function copyArray(source, array) {
  var index = -1, length = source.length;
  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}
var copyArray_default = copyArray;

// ../../node_modules/lodash-es/_baseCreate.js
var objectCreate = Object.create;
var baseCreate = function() {
  function object() {
  }
  return function(proto) {
    if (!isObject_default(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = void 0;
    return result;
  };
}();
var baseCreate_default = baseCreate;

// ../../node_modules/lodash-es/_overArg.js
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var overArg_default = overArg;

// ../../node_modules/lodash-es/_getPrototype.js
var getPrototype = overArg_default(Object.getPrototypeOf, Object);
var getPrototype_default = getPrototype;

// ../../node_modules/lodash-es/_isPrototype.js
var objectProto6 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto6;
  return value === proto;
}
var isPrototype_default = isPrototype;

// ../../node_modules/lodash-es/_initCloneObject.js
function initCloneObject(object) {
  return typeof object.constructor == "function" && !isPrototype_default(object) ? baseCreate_default(getPrototype_default(object)) : {};
}
var initCloneObject_default = initCloneObject;

// ../../node_modules/lodash-es/isObjectLike.js
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_default = isObjectLike;

// ../../node_modules/lodash-es/_baseIsArguments.js
var argsTag = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike_default(value) && baseGetTag_default(value) == argsTag;
}
var baseIsArguments_default = baseIsArguments;

// ../../node_modules/lodash-es/isArguments.js
var objectProto7 = Object.prototype;
var hasOwnProperty5 = objectProto7.hasOwnProperty;
var propertyIsEnumerable = objectProto7.propertyIsEnumerable;
var isArguments = baseIsArguments_default(function() {
  return arguments;
}()) ? baseIsArguments_default : function(value) {
  return isObjectLike_default(value) && hasOwnProperty5.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArguments_default = isArguments;

// ../../node_modules/lodash-es/isArray.js
var isArray = Array.isArray;
var isArray_default = isArray;

// ../../node_modules/lodash-es/isLength.js
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
var isLength_default = isLength;

// ../../node_modules/lodash-es/isArrayLike.js
function isArrayLike(value) {
  return value != null && isLength_default(value.length) && !isFunction_default(value);
}
var isArrayLike_default = isArrayLike;

// ../../node_modules/lodash-es/isArrayLikeObject.js
function isArrayLikeObject(value) {
  return isObjectLike_default(value) && isArrayLike_default(value);
}
var isArrayLikeObject_default = isArrayLikeObject;

// ../../node_modules/lodash-es/stubFalse.js
function stubFalse() {
  return false;
}
var stubFalse_default = stubFalse;

// ../../node_modules/lodash-es/isBuffer.js
var freeExports2 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule2 = freeExports2 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
var Buffer2 = moduleExports2 ? root_default.Buffer : void 0;
var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse_default;
var isBuffer_default = isBuffer;

// ../../node_modules/lodash-es/isPlainObject.js
var objectTag = "[object Object]";
var funcProto3 = Function.prototype;
var objectProto8 = Object.prototype;
var funcToString3 = funcProto3.toString;
var hasOwnProperty6 = objectProto8.hasOwnProperty;
var objectCtorString = funcToString3.call(Object);
function isPlainObject(value) {
  if (!isObjectLike_default(value) || baseGetTag_default(value) != objectTag) {
    return false;
  }
  var proto = getPrototype_default(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty6.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString3.call(Ctor) == objectCtorString;
}
var isPlainObject_default = isPlainObject;

// ../../node_modules/lodash-es/_baseIsTypedArray.js
var argsTag2 = "[object Arguments]";
var arrayTag = "[object Array]";
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var funcTag2 = "[object Function]";
var mapTag = "[object Map]";
var numberTag = "[object Number]";
var objectTag2 = "[object Object]";
var regexpTag = "[object RegExp]";
var setTag = "[object Set]";
var stringTag = "[object String]";
var weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag2] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
function baseIsTypedArray(value) {
  return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[baseGetTag_default(value)];
}
var baseIsTypedArray_default = baseIsTypedArray;

// ../../node_modules/lodash-es/_baseUnary.js
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var baseUnary_default = baseUnary;

// ../../node_modules/lodash-es/_nodeUtil.js
var freeExports3 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule3 = freeExports3 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
var freeProcess = moduleExports3 && freeGlobal_default.process;
var nodeUtil = function() {
  try {
    var types = freeModule3 && freeModule3.require && freeModule3.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var nodeUtil_default = nodeUtil;

// ../../node_modules/lodash-es/isTypedArray.js
var nodeIsTypedArray = nodeUtil_default && nodeUtil_default.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary_default(nodeIsTypedArray) : baseIsTypedArray_default;
var isTypedArray_default = isTypedArray;

// ../../node_modules/lodash-es/_safeGet.js
function safeGet(object, key) {
  if (key === "constructor" && typeof object[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object[key];
}
var safeGet_default = safeGet;

// ../../node_modules/lodash-es/_assignValue.js
var objectProto9 = Object.prototype;
var hasOwnProperty7 = objectProto9.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty7.call(object, key) && eq_default(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue_default(object, key, value);
  }
}
var assignValue_default = assignValue;

// ../../node_modules/lodash-es/_copyObject.js
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue_default(object, key, newValue);
    } else {
      assignValue_default(object, key, newValue);
    }
  }
  return object;
}
var copyObject_default = copyObject;

// ../../node_modules/lodash-es/_baseTimes.js
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var baseTimes_default = baseTimes;

// ../../node_modules/lodash-es/_isIndex.js
var MAX_SAFE_INTEGER2 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER2 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var isIndex_default = isIndex;

// ../../node_modules/lodash-es/_arrayLikeKeys.js
var objectProto10 = Object.prototype;
var hasOwnProperty8 = objectProto10.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes_default(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty8.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex_default(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var arrayLikeKeys_default = arrayLikeKeys;

// ../../node_modules/lodash-es/_nativeKeysIn.js
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}
var nativeKeysIn_default = nativeKeysIn;

// ../../node_modules/lodash-es/_baseKeysIn.js
var objectProto11 = Object.prototype;
var hasOwnProperty9 = objectProto11.hasOwnProperty;
function baseKeysIn(object) {
  if (!isObject_default(object)) {
    return nativeKeysIn_default(object);
  }
  var isProto = isPrototype_default(object), result = [];
  for (var key in object) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty9.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}
var baseKeysIn_default = baseKeysIn;

// ../../node_modules/lodash-es/keysIn.js
function keysIn(object) {
  return isArrayLike_default(object) ? arrayLikeKeys_default(object, true) : baseKeysIn_default(object);
}
var keysIn_default = keysIn;

// ../../node_modules/lodash-es/toPlainObject.js
function toPlainObject(value) {
  return copyObject_default(value, keysIn_default(value));
}
var toPlainObject_default = toPlainObject;

// ../../node_modules/lodash-es/_baseMergeDeep.js
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet_default(object, key), srcValue = safeGet_default(source, key), stacked = stack.get(srcValue);
  if (stacked) {
    assignMergeValue_default(object, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
  var isCommon = newValue === void 0;
  if (isCommon) {
    var isArr = isArray_default(srcValue), isBuff = !isArr && isBuffer_default(srcValue), isTyped = !isArr && !isBuff && isTypedArray_default(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray_default(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject_default(objValue)) {
        newValue = copyArray_default(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer_default(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray_default(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject_default(srcValue) || isArguments_default(srcValue)) {
      newValue = objValue;
      if (isArguments_default(objValue)) {
        newValue = toPlainObject_default(objValue);
      } else if (!isObject_default(objValue) || isFunction_default(objValue)) {
        newValue = initCloneObject_default(srcValue);
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
  assignMergeValue_default(object, key, newValue);
}
var baseMergeDeep_default = baseMergeDeep;

// ../../node_modules/lodash-es/_baseMerge.js
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor_default(source, function(srcValue, key) {
    stack || (stack = new Stack_default());
    if (isObject_default(srcValue)) {
      baseMergeDeep_default(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet_default(object, key), srcValue, key + "", object, source, stack) : void 0;
      if (newValue === void 0) {
        newValue = srcValue;
      }
      assignMergeValue_default(object, key, newValue);
    }
  }, keysIn_default);
}
var baseMerge_default = baseMerge;

// ../../node_modules/lodash-es/identity.js
function identity(value) {
  return value;
}
var identity_default = identity;

// ../../node_modules/lodash-es/_apply.js
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
var apply_default = apply;

// ../../node_modules/lodash-es/_overRest.js
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
    return apply_default(func, this, otherArgs);
  };
}
var overRest_default = overRest;

// ../../node_modules/lodash-es/constant.js
function constant(value) {
  return function() {
    return value;
  };
}
var constant_default = constant;

// ../../node_modules/lodash-es/_baseSetToString.js
var baseSetToString = !defineProperty_default ? identity_default : function(func, string) {
  return defineProperty_default(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant_default(string),
    "writable": true
  });
};
var baseSetToString_default = baseSetToString;

// ../../node_modules/lodash-es/_shortOut.js
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
var shortOut_default = shortOut;

// ../../node_modules/lodash-es/_setToString.js
var setToString = shortOut_default(baseSetToString_default);
var setToString_default = setToString;

// ../../node_modules/lodash-es/_baseRest.js
function baseRest(func, start) {
  return setToString_default(overRest_default(func, start, identity_default), func + "");
}
var baseRest_default = baseRest;

// ../../node_modules/lodash-es/_isIterateeCall.js
function isIterateeCall(value, index, object) {
  if (!isObject_default(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike_default(object) && isIndex_default(index, object.length) : type == "string" && index in object) {
    return eq_default(object[index], value);
  }
  return false;
}
var isIterateeCall_default = isIterateeCall;

// ../../node_modules/lodash-es/_createAssigner.js
function createAssigner(assigner) {
  return baseRest_default(function(object, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
    if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
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
var createAssigner_default = createAssigner;

// ../../node_modules/lodash-es/merge.js
var merge = createAssigner_default(function(object, source, srcIndex) {
  baseMerge_default(object, source, srcIndex);
});
var merge_default = merge;

// ../../node_modules/react-color/es/components/common/Raised.js
var Raised = function Raised2(_ref) {
  var zDepth = _ref.zDepth, radius = _ref.radius, background = _ref.background, children = _ref.children, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles;
  var styles = (0, import_reactcss5.default)(merge_default({
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
  return import_react5.default.createElement(
    "div",
    { style: styles.wrap },
    import_react5.default.createElement("div", { style: styles.bg }),
    import_react5.default.createElement(
      "div",
      { style: styles.content },
      children
    )
  );
};
Raised.propTypes = {
  background: import_prop_types.default.string,
  zDepth: import_prop_types.default.oneOf([0, 1, 2, 3, 4, 5]),
  radius: import_prop_types.default.number,
  styles: import_prop_types.default.object
};
Raised.defaultProps = {
  background: "#fff",
  zDepth: 1,
  radius: 2,
  styles: {}
};
var Raised_default = Raised;

// ../../node_modules/react-color/es/components/common/Saturation.js
var import_react6 = __toESM(require_react());
var import_reactcss6 = __toESM(require_lib());

// ../../node_modules/lodash-es/now.js
var now = function() {
  return root_default.Date.now();
};
var now_default = now;

// ../../node_modules/lodash-es/_trimmedEndIndex.js
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var trimmedEndIndex_default = trimmedEndIndex;

// ../../node_modules/lodash-es/_baseTrim.js
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
}
var baseTrim_default = baseTrim;

// ../../node_modules/lodash-es/isSymbol.js
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
}
var isSymbol_default = isSymbol;

// ../../node_modules/lodash-es/toNumber.js
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol_default(value)) {
    return NAN;
  }
  if (isObject_default(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject_default(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim_default(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_default = toNumber;

// ../../node_modules/lodash-es/debounce.js
var FUNC_ERROR_TEXT = "Expected a function";
var nativeMax2 = Math.max;
var nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber_default(wait) || 0;
  if (isObject_default(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax2(toNumber_default(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now_default();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now_default());
  }
  function debounced() {
    var time = now_default(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
var debounce_default = debounce;

// ../../node_modules/lodash-es/throttle.js
var FUNC_ERROR_TEXT2 = "Expected a function";
function throttle(func, wait, options) {
  var leading = true, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT2);
  }
  if (isObject_default(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce_default(func, wait, {
    "leading": leading,
    "maxWait": wait,
    "trailing": trailing
  });
}
var throttle_default = throttle;

// ../../node_modules/react-color/es/helpers/saturation.js
var calculateChange5 = function calculateChange6(e, hsl, container) {
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

// ../../node_modules/react-color/es/components/common/Saturation.js
var _createClass4 = function() {
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
function _classCallCheck4(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn4(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits4(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var Saturation = function(_ref) {
  _inherits4(Saturation2, _ref);
  function Saturation2(props) {
    _classCallCheck4(this, Saturation2);
    var _this = _possibleConstructorReturn4(this, (Saturation2.__proto__ || Object.getPrototypeOf(Saturation2)).call(this, props));
    _this.handleChange = function(e) {
      typeof _this.props.onChange === "function" && _this.throttle(_this.props.onChange, calculateChange5(e, _this.props.hsl, _this.container), e);
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
    _this.throttle = throttle_default(function(fn, data, e) {
      fn(data, e);
    }, 50);
    return _this;
  }
  _createClass4(Saturation2, [{
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
    value: function render3() {
      var _this2 = this;
      var _ref2 = this.props.style || {}, color = _ref2.color, white = _ref2.white, black = _ref2.black, pointer = _ref2.pointer, circle = _ref2.circle;
      var styles = (0, import_reactcss6.default)({
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
      return import_react6.default.createElement(
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
        import_react6.default.createElement(
          "style",
          null,
          "\n          .saturation-white {\n            background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));\n            background: linear-gradient(to right, #fff, rgba(255,255,255,0));\n          }\n          .saturation-black {\n            background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));\n            background: linear-gradient(to top, #000, rgba(0,0,0,0));\n          }\n        "
        ),
        import_react6.default.createElement(
          "div",
          { style: styles.white, className: "saturation-white" },
          import_react6.default.createElement("div", { style: styles.black, className: "saturation-black" }),
          import_react6.default.createElement(
            "div",
            { style: styles.pointer },
            this.props.pointer ? import_react6.default.createElement(this.props.pointer, this.props) : import_react6.default.createElement("div", { style: styles.circle })
          )
        )
      );
    }
  }]);
  return Saturation2;
}(import_react6.PureComponent || import_react6.Component);
var Saturation_default = Saturation;

// ../../node_modules/react-color/es/components/common/ColorWrap.js
var import_react7 = __toESM(require_react());

// ../../node_modules/lodash-es/_arrayEach.js
function arrayEach(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
var arrayEach_default = arrayEach;

// ../../node_modules/lodash-es/_nativeKeys.js
var nativeKeys = overArg_default(Object.keys, Object);
var nativeKeys_default = nativeKeys;

// ../../node_modules/lodash-es/_baseKeys.js
var objectProto12 = Object.prototype;
var hasOwnProperty10 = objectProto12.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype_default(object)) {
    return nativeKeys_default(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty10.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var baseKeys_default = baseKeys;

// ../../node_modules/lodash-es/keys.js
function keys(object) {
  return isArrayLike_default(object) ? arrayLikeKeys_default(object) : baseKeys_default(object);
}
var keys_default = keys;

// ../../node_modules/lodash-es/_baseForOwn.js
function baseForOwn(object, iteratee) {
  return object && baseFor_default(object, iteratee, keys_default);
}
var baseForOwn_default = baseForOwn;

// ../../node_modules/lodash-es/_createBaseEach.js
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_default(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var createBaseEach_default = createBaseEach;

// ../../node_modules/lodash-es/_baseEach.js
var baseEach = createBaseEach_default(baseForOwn_default);
var baseEach_default = baseEach;

// ../../node_modules/lodash-es/_castFunction.js
function castFunction(value) {
  return typeof value == "function" ? value : identity_default;
}
var castFunction_default = castFunction;

// ../../node_modules/lodash-es/forEach.js
function forEach(collection, iteratee) {
  var func = isArray_default(collection) ? arrayEach_default : baseEach_default;
  return func(collection, castFunction_default(iteratee));
}
var forEach_default = forEach;

// ../../node_modules/tinycolor2/esm/tinycolor.js
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

// ../../node_modules/react-color/es/helpers/color.js
var simpleCheckForValidColor = function simpleCheckForValidColor2(data) {
  var keysToCheck = ["r", "g", "b", "a", "h", "s", "l", "v"];
  var checked = 0;
  var passed = 0;
  forEach_default(keysToCheck, function(letter) {
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
var toState = function toState2(data, oldHue) {
  var color = data.hex ? tinycolor(data.hex) : tinycolor(data);
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
var isValidHex = function isValidHex2(hex) {
  if (hex === "transparent") {
    return true;
  }
  var lh = String(hex).charAt(0) === "#" ? 1 : 0;
  return hex.length !== 4 + lh && hex.length < 7 + lh && tinycolor(hex).isValid();
};
var getContrastingColor = function getContrastingColor2(data) {
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
var isvalidColorString = function isvalidColorString2(string, type) {
  var stringWithoutDegree = string.replace("°", "");
  return tinycolor(type + " (" + stringWithoutDegree + ")")._ok;
};

// ../../node_modules/react-color/es/components/common/ColorWrap.js
var _extends3 = Object.assign || function(target) {
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
var _createClass5 = function() {
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
function _classCallCheck5(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn5(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits5(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var ColorWrap = function ColorWrap2(Picker) {
  var ColorPicker = function(_ref) {
    _inherits5(ColorPicker2, _ref);
    function ColorPicker2(props) {
      _classCallCheck5(this, ColorPicker2);
      var _this = _possibleConstructorReturn5(this, (ColorPicker2.__proto__ || Object.getPrototypeOf(ColorPicker2)).call(this));
      _this.handleChange = function(data, event) {
        var isValidColor = simpleCheckForValidColor(data);
        if (isValidColor) {
          var colors = toState(data, data.h || _this.state.oldHue);
          _this.setState(colors);
          _this.props.onChangeComplete && _this.debounce(_this.props.onChangeComplete, colors, event);
          _this.props.onChange && _this.props.onChange(colors, event);
        }
      };
      _this.handleSwatchHover = function(data, event) {
        var isValidColor = simpleCheckForValidColor(data);
        if (isValidColor) {
          var colors = toState(data, data.h || _this.state.oldHue);
          _this.props.onSwatchHover && _this.props.onSwatchHover(colors, event);
        }
      };
      _this.state = _extends3({}, toState(props.color, 0));
      _this.debounce = debounce_default(function(fn, data, event) {
        fn(data, event);
      }, 100);
      return _this;
    }
    _createClass5(ColorPicker2, [{
      key: "render",
      value: function render3() {
        var optionalEvents = {};
        if (this.props.onSwatchHover) {
          optionalEvents.onSwatchHover = this.handleSwatchHover;
        }
        return import_react7.default.createElement(Picker, _extends3({}, this.props, this.state, {
          onChange: this.handleChange
        }, optionalEvents));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(nextProps, state) {
        return _extends3({}, toState(nextProps.color, state.oldHue));
      }
    }]);
    return ColorPicker2;
  }(import_react7.PureComponent || import_react7.Component);
  ColorPicker.propTypes = _extends3({}, Picker.propTypes);
  ColorPicker.defaultProps = _extends3({}, Picker.defaultProps, {
    color: {
      h: 250,
      s: 0.5,
      l: 0.2,
      a: 1
    }
  });
  return ColorPicker;
};
var ColorWrap_default = ColorWrap;

// ../../node_modules/react-color/es/components/common/Swatch.js
var import_react9 = __toESM(require_react());
var import_reactcss7 = __toESM(require_lib());

// ../../node_modules/react-color/es/helpers/interaction.js
var import_react8 = __toESM(require_react());
var _extends4 = Object.assign || function(target) {
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
var _createClass6 = function() {
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
function _classCallCheck6(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn6(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits6(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var handleFocus = function handleFocus2(Component6) {
  var Span = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "span";
  return function(_React$Component) {
    _inherits6(Focus, _React$Component);
    function Focus() {
      var _ref;
      var _temp, _this, _ret;
      _classCallCheck6(this, Focus);
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return _ret = (_temp = (_this = _possibleConstructorReturn6(this, (_ref = Focus.__proto__ || Object.getPrototypeOf(Focus)).call.apply(_ref, [this].concat(args))), _this), _this.state = { focus: false }, _this.handleFocus = function() {
        return _this.setState({ focus: true });
      }, _this.handleBlur = function() {
        return _this.setState({ focus: false });
      }, _temp), _possibleConstructorReturn6(_this, _ret);
    }
    _createClass6(Focus, [{
      key: "render",
      value: function render3() {
        return import_react8.default.createElement(
          Span,
          { onFocus: this.handleFocus, onBlur: this.handleBlur },
          import_react8.default.createElement(Component6, _extends4({}, this.props, this.state))
        );
      }
    }]);
    return Focus;
  }(import_react8.default.Component);
};

// ../../node_modules/react-color/es/components/common/Swatch.js
var _extends5 = Object.assign || function(target) {
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
var ENTER = 13;
var Swatch = function Swatch2(_ref) {
  var color = _ref.color, style = _ref.style, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
  } : _ref$onClick, onHover = _ref.onHover, _ref$title = _ref.title, title = _ref$title === void 0 ? color : _ref$title, children = _ref.children, focus = _ref.focus, _ref$focusStyle = _ref.focusStyle, focusStyle = _ref$focusStyle === void 0 ? {} : _ref$focusStyle;
  var transparent = color === "transparent";
  var styles = (0, import_reactcss7.default)({
    default: {
      swatch: _extends5({
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
  var handleHover3 = function handleHover4(e) {
    return onHover(color, e);
  };
  var optionalEvents = {};
  if (onHover) {
    optionalEvents.onMouseOver = handleHover3;
  }
  return import_react9.default.createElement(
    "div",
    _extends5({
      style: styles.swatch,
      onClick: handleClick,
      title,
      tabIndex: 0,
      onKeyDown: handleKeyDown
    }, optionalEvents),
    children,
    transparent && import_react9.default.createElement(Checkboard_default, {
      borderRadius: styles.swatch.borderRadius,
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)"
    })
  );
};
var Swatch_default = handleFocus(Swatch);

// ../../node_modules/react-color/es/components/alpha/AlphaPointer.js
var import_react10 = __toESM(require_react());
var import_reactcss8 = __toESM(require_lib());
var AlphaPointer = function AlphaPointer2(_ref) {
  var direction = _ref.direction;
  var styles = (0, import_reactcss8.default)({
    "default": {
      picker: {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        transform: "translate(-9px, -1px)",
        backgroundColor: "rgb(248, 248, 248)",
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.37)"
      }
    },
    "vertical": {
      picker: {
        transform: "translate(-3px, -9px)"
      }
    }
  }, { vertical: direction === "vertical" });
  return import_react10.default.createElement("div", { style: styles.picker });
};
var AlphaPointer_default = AlphaPointer;

// ../../node_modules/react-color/es/components/alpha/Alpha.js
var _extends6 = Object.assign || function(target) {
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
var AlphaPicker = function AlphaPicker2(_ref) {
  var rgb = _ref.rgb, hsl = _ref.hsl, width = _ref.width, height = _ref.height, onChange = _ref.onChange, direction = _ref.direction, style = _ref.style, renderers = _ref.renderers, pointer = _ref.pointer, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss9.default)({
    "default": {
      picker: {
        position: "relative",
        width,
        height
      },
      alpha: {
        radius: "2px",
        style
      }
    }
  });
  return import_react11.default.createElement(
    "div",
    { style: styles.picker, className: "alpha-picker " + className },
    import_react11.default.createElement(Alpha_default, _extends6({}, styles.alpha, {
      rgb,
      hsl,
      pointer,
      renderers,
      onChange,
      direction
    }))
  );
};
AlphaPicker.defaultProps = {
  width: "316px",
  height: "16px",
  direction: "horizontal",
  pointer: AlphaPointer_default
};
var Alpha_default2 = ColorWrap_default(AlphaPicker);

// ../../node_modules/react-color/es/components/block/Block.js
var import_react13 = __toESM(require_react());
var import_prop_types2 = __toESM(require_prop_types());
var import_reactcss11 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/block/BlockSwatches.js
var import_react12 = __toESM(require_react());
var import_reactcss10 = __toESM(require_lib());

// ../../node_modules/lodash-es/_arrayMap.js
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var arrayMap_default = arrayMap;

// ../../node_modules/lodash-es/_setCacheAdd.js
var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED3);
  return this;
}
var setCacheAdd_default = setCacheAdd;

// ../../node_modules/lodash-es/_setCacheHas.js
function setCacheHas(value) {
  return this.__data__.has(value);
}
var setCacheHas_default = setCacheHas;

// ../../node_modules/lodash-es/_SetCache.js
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache_default();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd_default;
SetCache.prototype.has = setCacheHas_default;
var SetCache_default = SetCache;

// ../../node_modules/lodash-es/_arraySome.js
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
var arraySome_default = arraySome;

// ../../node_modules/lodash-es/_cacheHas.js
function cacheHas(cache, key) {
  return cache.has(key);
}
var cacheHas_default = cacheHas;

// ../../node_modules/lodash-es/_equalArrays.js
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache_default() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome_default(other, function(othValue2, othIndex) {
        if (!cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var equalArrays_default = equalArrays;

// ../../node_modules/lodash-es/_mapToArray.js
function mapToArray(map2) {
  var index = -1, result = Array(map2.size);
  map2.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var mapToArray_default = mapToArray;

// ../../node_modules/lodash-es/_setToArray.js
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var setToArray_default = setToArray;

// ../../node_modules/lodash-es/_equalByTag.js
var COMPARE_PARTIAL_FLAG2 = 1;
var COMPARE_UNORDERED_FLAG2 = 2;
var boolTag2 = "[object Boolean]";
var dateTag2 = "[object Date]";
var errorTag2 = "[object Error]";
var mapTag2 = "[object Map]";
var numberTag2 = "[object Number]";
var regexpTag2 = "[object RegExp]";
var setTag2 = "[object Set]";
var stringTag2 = "[object String]";
var symbolTag2 = "[object Symbol]";
var arrayBufferTag2 = "[object ArrayBuffer]";
var dataViewTag2 = "[object DataView]";
var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag2:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag2:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array_default(object), new Uint8Array_default(other))) {
        return false;
      }
      return true;
    case boolTag2:
    case dateTag2:
    case numberTag2:
      return eq_default(+object, +other);
    case errorTag2:
      return object.name == other.name && object.message == other.message;
    case regexpTag2:
    case stringTag2:
      return object == other + "";
    case mapTag2:
      var convert = mapToArray_default;
    case setTag2:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
      convert || (convert = setToArray_default);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG2;
      stack.set(object, other);
      var result = equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag2:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var equalByTag_default = equalByTag;

// ../../node_modules/lodash-es/_arrayPush.js
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var arrayPush_default = arrayPush;

// ../../node_modules/lodash-es/_baseGetAllKeys.js
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_default(object) ? result : arrayPush_default(result, symbolsFunc(object));
}
var baseGetAllKeys_default = baseGetAllKeys;

// ../../node_modules/lodash-es/_arrayFilter.js
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var arrayFilter_default = arrayFilter;

// ../../node_modules/lodash-es/stubArray.js
function stubArray() {
  return [];
}
var stubArray_default = stubArray;

// ../../node_modules/lodash-es/_getSymbols.js
var objectProto13 = Object.prototype;
var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter_default(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable2.call(object, symbol);
  });
};
var getSymbols_default = getSymbols;

// ../../node_modules/lodash-es/_getAllKeys.js
function getAllKeys(object) {
  return baseGetAllKeys_default(object, keys_default, getSymbols_default);
}
var getAllKeys_default = getAllKeys;

// ../../node_modules/lodash-es/_equalObjects.js
var COMPARE_PARTIAL_FLAG3 = 1;
var objectProto14 = Object.prototype;
var hasOwnProperty11 = objectProto14.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = getAllKeys_default(object), objLength = objProps.length, othProps = getAllKeys_default(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty11.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var equalObjects_default = equalObjects;

// ../../node_modules/lodash-es/_DataView.js
var DataView = getNative_default(root_default, "DataView");
var DataView_default = DataView;

// ../../node_modules/lodash-es/_Promise.js
var Promise2 = getNative_default(root_default, "Promise");
var Promise_default = Promise2;

// ../../node_modules/lodash-es/_Set.js
var Set = getNative_default(root_default, "Set");
var Set_default = Set;

// ../../node_modules/lodash-es/_WeakMap.js
var WeakMap = getNative_default(root_default, "WeakMap");
var WeakMap_default = WeakMap;

// ../../node_modules/lodash-es/_getTag.js
var mapTag3 = "[object Map]";
var objectTag3 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag3 = "[object Set]";
var weakMapTag2 = "[object WeakMap]";
var dataViewTag3 = "[object DataView]";
var dataViewCtorString = toSource_default(DataView_default);
var mapCtorString = toSource_default(Map_default);
var promiseCtorString = toSource_default(Promise_default);
var setCtorString = toSource_default(Set_default);
var weakMapCtorString = toSource_default(WeakMap_default);
var getTag = baseGetTag_default;
if (DataView_default && getTag(new DataView_default(new ArrayBuffer(1))) != dataViewTag3 || Map_default && getTag(new Map_default()) != mapTag3 || Promise_default && getTag(Promise_default.resolve()) != promiseTag || Set_default && getTag(new Set_default()) != setTag3 || WeakMap_default && getTag(new WeakMap_default()) != weakMapTag2) {
  getTag = function(value) {
    var result = baseGetTag_default(value), Ctor = result == objectTag3 ? value.constructor : void 0, ctorString = Ctor ? toSource_default(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag3;
        case mapCtorString:
          return mapTag3;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag3;
        case weakMapCtorString:
          return weakMapTag2;
      }
    }
    return result;
  };
}
var getTag_default = getTag;

// ../../node_modules/lodash-es/_baseIsEqualDeep.js
var COMPARE_PARTIAL_FLAG4 = 1;
var argsTag3 = "[object Arguments]";
var arrayTag2 = "[object Array]";
var objectTag4 = "[object Object]";
var objectProto15 = Object.prototype;
var hasOwnProperty12 = objectProto15.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag2 : getTag_default(object), othTag = othIsArr ? arrayTag2 : getTag_default(other);
  objTag = objTag == argsTag3 ? objectTag4 : objTag;
  othTag = othTag == argsTag3 ? objectTag4 : othTag;
  var objIsObj = objTag == objectTag4, othIsObj = othTag == objectTag4, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer_default(object)) {
    if (!isBuffer_default(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack_default());
    return objIsArr || isTypedArray_default(object) ? equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
    var objIsWrapped = objIsObj && hasOwnProperty12.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty12.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack_default());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack_default());
  return equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
}
var baseIsEqualDeep_default = baseIsEqualDeep;

// ../../node_modules/lodash-es/_baseIsEqual.js
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
}
var baseIsEqual_default = baseIsEqual;

// ../../node_modules/lodash-es/_baseIsMatch.js
var COMPARE_PARTIAL_FLAG5 = 1;
var COMPARE_UNORDERED_FLAG3 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack_default();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var baseIsMatch_default = baseIsMatch;

// ../../node_modules/lodash-es/_isStrictComparable.js
function isStrictComparable(value) {
  return value === value && !isObject_default(value);
}
var isStrictComparable_default = isStrictComparable;

// ../../node_modules/lodash-es/_getMatchData.js
function getMatchData(object) {
  var result = keys_default(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable_default(value)];
  }
  return result;
}
var getMatchData_default = getMatchData;

// ../../node_modules/lodash-es/_matchesStrictComparable.js
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
var matchesStrictComparable_default = matchesStrictComparable;

// ../../node_modules/lodash-es/_baseMatches.js
function baseMatches(source) {
  var matchData = getMatchData_default(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch_default(object, source, matchData);
  };
}
var baseMatches_default = baseMatches;

// ../../node_modules/lodash-es/_isKey.js
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray_default(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var isKey_default = isKey;

// ../../node_modules/lodash-es/memoize.js
var FUNC_ERROR_TEXT3 = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT3);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache_default)();
  return memoized;
}
memoize.Cache = MapCache_default;
var memoize_default = memoize;

// ../../node_modules/lodash-es/_memoizeCapped.js
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize_default(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var memoizeCapped_default = memoizeCapped;

// ../../node_modules/lodash-es/_stringToPath.js
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped_default(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var stringToPath_default = stringToPath;

// ../../node_modules/lodash-es/_baseToString.js
var INFINITY = 1 / 0;
var symbolProto2 = Symbol_default ? Symbol_default.prototype : void 0;
var symbolToString = symbolProto2 ? symbolProto2.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray_default(value)) {
    return arrayMap_default(value, baseToString) + "";
  }
  if (isSymbol_default(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var baseToString_default = baseToString;

// ../../node_modules/lodash-es/toString.js
function toString2(value) {
  return value == null ? "" : baseToString_default(value);
}
var toString_default = toString2;

// ../../node_modules/lodash-es/_castPath.js
function castPath(value, object) {
  if (isArray_default(value)) {
    return value;
  }
  return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
}
var castPath_default = castPath;

// ../../node_modules/lodash-es/_toKey.js
var INFINITY2 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol_default(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY2 ? "-0" : result;
}
var toKey_default = toKey;

// ../../node_modules/lodash-es/_baseGet.js
function baseGet(object, path) {
  path = castPath_default(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[toKey_default(path[index++])];
  }
  return index && index == length ? object : void 0;
}
var baseGet_default = baseGet;

// ../../node_modules/lodash-es/get.js
function get3(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet_default(object, path);
  return result === void 0 ? defaultValue : result;
}
var get_default = get3;

// ../../node_modules/lodash-es/_baseHasIn.js
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
var baseHasIn_default = baseHasIn;

// ../../node_modules/lodash-es/_hasPath.js
function hasPath(object, path, hasFunc) {
  path = castPath_default(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey_default(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_default(length) && isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
}
var hasPath_default = hasPath;

// ../../node_modules/lodash-es/hasIn.js
function hasIn(object, path) {
  return object != null && hasPath_default(object, path, baseHasIn_default);
}
var hasIn_default = hasIn;

// ../../node_modules/lodash-es/_baseMatchesProperty.js
var COMPARE_PARTIAL_FLAG6 = 1;
var COMPARE_UNORDERED_FLAG4 = 2;
function baseMatchesProperty(path, srcValue) {
  if (isKey_default(path) && isStrictComparable_default(srcValue)) {
    return matchesStrictComparable_default(toKey_default(path), srcValue);
  }
  return function(object) {
    var objValue = get_default(object, path);
    return objValue === void 0 && objValue === srcValue ? hasIn_default(object, path) : baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
  };
}
var baseMatchesProperty_default = baseMatchesProperty;

// ../../node_modules/lodash-es/_baseProperty.js
function baseProperty(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
var baseProperty_default = baseProperty;

// ../../node_modules/lodash-es/_basePropertyDeep.js
function basePropertyDeep(path) {
  return function(object) {
    return baseGet_default(object, path);
  };
}
var basePropertyDeep_default = basePropertyDeep;

// ../../node_modules/lodash-es/property.js
function property(path) {
  return isKey_default(path) ? baseProperty_default(toKey_default(path)) : basePropertyDeep_default(path);
}
var property_default = property;

// ../../node_modules/lodash-es/_baseIteratee.js
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity_default;
  }
  if (typeof value == "object") {
    return isArray_default(value) ? baseMatchesProperty_default(value[0], value[1]) : baseMatches_default(value);
  }
  return property_default(value);
}
var baseIteratee_default = baseIteratee;

// ../../node_modules/lodash-es/_baseMap.js
function baseMap(collection, iteratee) {
  var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
  baseEach_default(collection, function(value, key, collection2) {
    result[++index] = iteratee(value, key, collection2);
  });
  return result;
}
var baseMap_default = baseMap;

// ../../node_modules/lodash-es/map.js
function map(collection, iteratee) {
  var func = isArray_default(collection) ? arrayMap_default : baseMap_default;
  return func(collection, baseIteratee_default(iteratee, 3));
}
var map_default = map;

// ../../node_modules/react-color/es/components/block/BlockSwatches.js
var BlockSwatches = function BlockSwatches2(_ref) {
  var colors = _ref.colors, onClick = _ref.onClick, onSwatchHover = _ref.onSwatchHover;
  var styles = (0, import_reactcss10.default)({
    "default": {
      swatches: {
        marginRight: "-10px"
      },
      swatch: {
        width: "22px",
        height: "22px",
        float: "left",
        marginRight: "10px",
        marginBottom: "10px",
        borderRadius: "4px"
      },
      clear: {
        clear: "both"
      }
    }
  });
  return import_react12.default.createElement(
    "div",
    { style: styles.swatches },
    map_default(colors, function(c) {
      return import_react12.default.createElement(Swatch_default, {
        key: c,
        color: c,
        style: styles.swatch,
        onClick,
        onHover: onSwatchHover,
        focusStyle: {
          boxShadow: "0 0 4px " + c
        }
      });
    }),
    import_react12.default.createElement("div", { style: styles.clear })
  );
};
var BlockSwatches_default = BlockSwatches;

// ../../node_modules/react-color/es/components/block/Block.js
var Block = function Block2(_ref) {
  var onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, hex = _ref.hex, colors = _ref.colors, width = _ref.width, triangle = _ref.triangle, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var transparent = hex === "transparent";
  var handleChange = function handleChange2(hexCode, e) {
    isValidHex(hexCode) && onChange({
      hex: hexCode,
      source: "hex"
    }, e);
  };
  var styles = (0, import_reactcss11.default)(merge_default({
    "default": {
      card: {
        width,
        background: "#fff",
        boxShadow: "0 1px rgba(0,0,0,.1)",
        borderRadius: "6px",
        position: "relative"
      },
      head: {
        height: "110px",
        background: hex,
        borderRadius: "6px 6px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      },
      body: {
        padding: "10px"
      },
      label: {
        fontSize: "18px",
        color: getContrastingColor(hex),
        position: "relative"
      },
      triangle: {
        width: "0px",
        height: "0px",
        borderStyle: "solid",
        borderWidth: "0 10px 10px 10px",
        borderColor: "transparent transparent " + hex + " transparent",
        position: "absolute",
        top: "-10px",
        left: "50%",
        marginLeft: "-10px"
      },
      input: {
        width: "100%",
        fontSize: "12px",
        color: "#666",
        border: "0px",
        outline: "none",
        height: "22px",
        boxShadow: "inset 0 0 0 1px #ddd",
        borderRadius: "4px",
        padding: "0 7px",
        boxSizing: "border-box"
      }
    },
    "hide-triangle": {
      triangle: {
        display: "none"
      }
    }
  }, passedStyles), { "hide-triangle": triangle === "hide" });
  return import_react13.default.createElement(
    "div",
    { style: styles.card, className: "block-picker " + className },
    import_react13.default.createElement("div", { style: styles.triangle }),
    import_react13.default.createElement(
      "div",
      { style: styles.head },
      transparent && import_react13.default.createElement(Checkboard_default, { borderRadius: "6px 6px 0 0" }),
      import_react13.default.createElement(
        "div",
        { style: styles.label },
        hex
      )
    ),
    import_react13.default.createElement(
      "div",
      { style: styles.body },
      import_react13.default.createElement(BlockSwatches_default, { colors, onClick: handleChange, onSwatchHover }),
      import_react13.default.createElement(EditableInput_default, {
        style: { input: styles.input },
        value: hex,
        onChange: handleChange
      })
    )
  );
};
Block.propTypes = {
  width: import_prop_types2.default.oneOfType([import_prop_types2.default.string, import_prop_types2.default.number]),
  colors: import_prop_types2.default.arrayOf(import_prop_types2.default.string),
  triangle: import_prop_types2.default.oneOf(["top", "hide"]),
  styles: import_prop_types2.default.object
};
Block.defaultProps = {
  width: 170,
  colors: ["#D9E3F0", "#F47373", "#697689", "#37D67A", "#2CCCE4", "#555555", "#dce775", "#ff8a65", "#ba68c8"],
  triangle: "top",
  styles: {}
};
var Block_default = ColorWrap_default(Block);

// ../../node_modules/react-color/es/components/circle/Circle.js
var import_react15 = __toESM(require_react());
var import_prop_types3 = __toESM(require_prop_types());
var import_reactcss13 = __toESM(require_lib());

// ../../node_modules/material-colors/dist/colors.es2015.js
var red = { "50": "#ffebee", "100": "#ffcdd2", "200": "#ef9a9a", "300": "#e57373", "400": "#ef5350", "500": "#f44336", "600": "#e53935", "700": "#d32f2f", "800": "#c62828", "900": "#b71c1c", "a100": "#ff8a80", "a200": "#ff5252", "a400": "#ff1744", "a700": "#d50000" };
var pink = { "50": "#fce4ec", "100": "#f8bbd0", "200": "#f48fb1", "300": "#f06292", "400": "#ec407a", "500": "#e91e63", "600": "#d81b60", "700": "#c2185b", "800": "#ad1457", "900": "#880e4f", "a100": "#ff80ab", "a200": "#ff4081", "a400": "#f50057", "a700": "#c51162" };
var purple = { "50": "#f3e5f5", "100": "#e1bee7", "200": "#ce93d8", "300": "#ba68c8", "400": "#ab47bc", "500": "#9c27b0", "600": "#8e24aa", "700": "#7b1fa2", "800": "#6a1b9a", "900": "#4a148c", "a100": "#ea80fc", "a200": "#e040fb", "a400": "#d500f9", "a700": "#aa00ff" };
var deepPurple = { "50": "#ede7f6", "100": "#d1c4e9", "200": "#b39ddb", "300": "#9575cd", "400": "#7e57c2", "500": "#673ab7", "600": "#5e35b1", "700": "#512da8", "800": "#4527a0", "900": "#311b92", "a100": "#b388ff", "a200": "#7c4dff", "a400": "#651fff", "a700": "#6200ea" };
var indigo = { "50": "#e8eaf6", "100": "#c5cae9", "200": "#9fa8da", "300": "#7986cb", "400": "#5c6bc0", "500": "#3f51b5", "600": "#3949ab", "700": "#303f9f", "800": "#283593", "900": "#1a237e", "a100": "#8c9eff", "a200": "#536dfe", "a400": "#3d5afe", "a700": "#304ffe" };
var blue = { "50": "#e3f2fd", "100": "#bbdefb", "200": "#90caf9", "300": "#64b5f6", "400": "#42a5f5", "500": "#2196f3", "600": "#1e88e5", "700": "#1976d2", "800": "#1565c0", "900": "#0d47a1", "a100": "#82b1ff", "a200": "#448aff", "a400": "#2979ff", "a700": "#2962ff" };
var lightBlue = { "50": "#e1f5fe", "100": "#b3e5fc", "200": "#81d4fa", "300": "#4fc3f7", "400": "#29b6f6", "500": "#03a9f4", "600": "#039be5", "700": "#0288d1", "800": "#0277bd", "900": "#01579b", "a100": "#80d8ff", "a200": "#40c4ff", "a400": "#00b0ff", "a700": "#0091ea" };
var cyan = { "50": "#e0f7fa", "100": "#b2ebf2", "200": "#80deea", "300": "#4dd0e1", "400": "#26c6da", "500": "#00bcd4", "600": "#00acc1", "700": "#0097a7", "800": "#00838f", "900": "#006064", "a100": "#84ffff", "a200": "#18ffff", "a400": "#00e5ff", "a700": "#00b8d4" };
var teal = { "50": "#e0f2f1", "100": "#b2dfdb", "200": "#80cbc4", "300": "#4db6ac", "400": "#26a69a", "500": "#009688", "600": "#00897b", "700": "#00796b", "800": "#00695c", "900": "#004d40", "a100": "#a7ffeb", "a200": "#64ffda", "a400": "#1de9b6", "a700": "#00bfa5" };
var green = { "50": "#e8f5e9", "100": "#c8e6c9", "200": "#a5d6a7", "300": "#81c784", "400": "#66bb6a", "500": "#4caf50", "600": "#43a047", "700": "#388e3c", "800": "#2e7d32", "900": "#1b5e20", "a100": "#b9f6ca", "a200": "#69f0ae", "a400": "#00e676", "a700": "#00c853" };
var lightGreen = { "50": "#f1f8e9", "100": "#dcedc8", "200": "#c5e1a5", "300": "#aed581", "400": "#9ccc65", "500": "#8bc34a", "600": "#7cb342", "700": "#689f38", "800": "#558b2f", "900": "#33691e", "a100": "#ccff90", "a200": "#b2ff59", "a400": "#76ff03", "a700": "#64dd17" };
var lime = { "50": "#f9fbe7", "100": "#f0f4c3", "200": "#e6ee9c", "300": "#dce775", "400": "#d4e157", "500": "#cddc39", "600": "#c0ca33", "700": "#afb42b", "800": "#9e9d24", "900": "#827717", "a100": "#f4ff81", "a200": "#eeff41", "a400": "#c6ff00", "a700": "#aeea00" };
var yellow = { "50": "#fffde7", "100": "#fff9c4", "200": "#fff59d", "300": "#fff176", "400": "#ffee58", "500": "#ffeb3b", "600": "#fdd835", "700": "#fbc02d", "800": "#f9a825", "900": "#f57f17", "a100": "#ffff8d", "a200": "#ffff00", "a400": "#ffea00", "a700": "#ffd600" };
var amber = { "50": "#fff8e1", "100": "#ffecb3", "200": "#ffe082", "300": "#ffd54f", "400": "#ffca28", "500": "#ffc107", "600": "#ffb300", "700": "#ffa000", "800": "#ff8f00", "900": "#ff6f00", "a100": "#ffe57f", "a200": "#ffd740", "a400": "#ffc400", "a700": "#ffab00" };
var orange = { "50": "#fff3e0", "100": "#ffe0b2", "200": "#ffcc80", "300": "#ffb74d", "400": "#ffa726", "500": "#ff9800", "600": "#fb8c00", "700": "#f57c00", "800": "#ef6c00", "900": "#e65100", "a100": "#ffd180", "a200": "#ffab40", "a400": "#ff9100", "a700": "#ff6d00" };
var deepOrange = { "50": "#fbe9e7", "100": "#ffccbc", "200": "#ffab91", "300": "#ff8a65", "400": "#ff7043", "500": "#ff5722", "600": "#f4511e", "700": "#e64a19", "800": "#d84315", "900": "#bf360c", "a100": "#ff9e80", "a200": "#ff6e40", "a400": "#ff3d00", "a700": "#dd2c00" };
var brown = { "50": "#efebe9", "100": "#d7ccc8", "200": "#bcaaa4", "300": "#a1887f", "400": "#8d6e63", "500": "#795548", "600": "#6d4c41", "700": "#5d4037", "800": "#4e342e", "900": "#3e2723" };
var blueGrey = { "50": "#eceff1", "100": "#cfd8dc", "200": "#b0bec5", "300": "#90a4ae", "400": "#78909c", "500": "#607d8b", "600": "#546e7a", "700": "#455a64", "800": "#37474f", "900": "#263238" };

// ../../node_modules/react-color/es/components/circle/CircleSwatch.js
var import_react14 = __toESM(require_react());
var import_reactcss12 = __toESM(require_lib());
var CircleSwatch = function CircleSwatch2(_ref) {
  var color = _ref.color, onClick = _ref.onClick, onSwatchHover = _ref.onSwatchHover, hover = _ref.hover, active = _ref.active, circleSize = _ref.circleSize, circleSpacing = _ref.circleSpacing;
  var styles = (0, import_reactcss12.default)({
    "default": {
      swatch: {
        width: circleSize,
        height: circleSize,
        marginRight: circleSpacing,
        marginBottom: circleSpacing,
        transform: "scale(1)",
        transition: "100ms transform ease"
      },
      Swatch: {
        borderRadius: "50%",
        background: "transparent",
        boxShadow: "inset 0 0 0 " + (circleSize / 2 + 1) + "px " + color,
        transition: "100ms box-shadow ease"
      }
    },
    "hover": {
      swatch: {
        transform: "scale(1.2)"
      }
    },
    "active": {
      Swatch: {
        boxShadow: "inset 0 0 0 3px " + color
      }
    }
  }, { hover, active });
  return import_react14.default.createElement(
    "div",
    { style: styles.swatch },
    import_react14.default.createElement(Swatch_default, {
      style: styles.Swatch,
      color,
      onClick,
      onHover: onSwatchHover,
      focusStyle: { boxShadow: styles.Swatch.boxShadow + ", 0 0 5px " + color }
    })
  );
};
CircleSwatch.defaultProps = {
  circleSize: 28,
  circleSpacing: 14
};
var CircleSwatch_default = (0, import_reactcss12.handleHover)(CircleSwatch);

// ../../node_modules/react-color/es/components/circle/Circle.js
var Circle = function Circle2(_ref) {
  var width = _ref.width, onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, colors = _ref.colors, hex = _ref.hex, circleSize = _ref.circleSize, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, circleSpacing = _ref.circleSpacing, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss13.default)(merge_default({
    "default": {
      card: {
        width,
        display: "flex",
        flexWrap: "wrap",
        marginRight: -circleSpacing,
        marginBottom: -circleSpacing
      }
    }
  }, passedStyles));
  var handleChange = function handleChange2(hexCode, e) {
    return onChange({ hex: hexCode, source: "hex" }, e);
  };
  return import_react15.default.createElement(
    "div",
    { style: styles.card, className: "circle-picker " + className },
    map_default(colors, function(c) {
      return import_react15.default.createElement(CircleSwatch_default, {
        key: c,
        color: c,
        onClick: handleChange,
        onSwatchHover,
        active: hex === c.toLowerCase(),
        circleSize,
        circleSpacing
      });
    })
  );
};
Circle.propTypes = {
  width: import_prop_types3.default.oneOfType([import_prop_types3.default.string, import_prop_types3.default.number]),
  circleSize: import_prop_types3.default.number,
  circleSpacing: import_prop_types3.default.number,
  styles: import_prop_types3.default.object
};
Circle.defaultProps = {
  width: 252,
  circleSize: 28,
  circleSpacing: 14,
  colors: [red["500"], pink["500"], purple["500"], deepPurple["500"], indigo["500"], blue["500"], lightBlue["500"], cyan["500"], teal["500"], green["500"], lightGreen["500"], lime["500"], yellow["500"], amber["500"], orange["500"], deepOrange["500"], brown["500"], blueGrey["500"]],
  styles: {}
};
var Circle_default = ColorWrap_default(Circle);

// ../../node_modules/react-color/es/components/chrome/Chrome.js
var import_react19 = __toESM(require_react());
var import_prop_types4 = __toESM(require_prop_types());
var import_reactcss17 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/chrome/ChromeFields.js
var import_react16 = __toESM(require_react());
var import_reactcss14 = __toESM(require_lib());

// ../../node_modules/lodash-es/isUndefined.js
function isUndefined(value) {
  return value === void 0;
}
var isUndefined_default = isUndefined;

// ../../node_modules/react-color/es/components/chrome/ChromeFields.js
var import_UnfoldMoreHorizontalIcon = __toESM(require_UnfoldMoreHorizontalIcon());
var _createClass7 = function() {
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
function _classCallCheck7(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn7(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits7(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var ChromeFields = function(_React$Component) {
  _inherits7(ChromeFields2, _React$Component);
  function ChromeFields2(props) {
    _classCallCheck7(this, ChromeFields2);
    var _this = _possibleConstructorReturn7(this, (ChromeFields2.__proto__ || Object.getPrototypeOf(ChromeFields2)).call(this));
    _this.toggleViews = function() {
      if (_this.state.view === "hex") {
        _this.setState({ view: "rgb" });
      } else if (_this.state.view === "rgb") {
        _this.setState({ view: "hsl" });
      } else if (_this.state.view === "hsl") {
        if (_this.props.hsl.a === 1) {
          _this.setState({ view: "hex" });
        } else {
          _this.setState({ view: "rgb" });
        }
      }
    };
    _this.handleChange = function(data, e) {
      if (data.hex) {
        isValidHex(data.hex) && _this.props.onChange({
          hex: data.hex,
          source: "hex"
        }, e);
      } else if (data.r || data.g || data.b) {
        _this.props.onChange({
          r: data.r || _this.props.rgb.r,
          g: data.g || _this.props.rgb.g,
          b: data.b || _this.props.rgb.b,
          source: "rgb"
        }, e);
      } else if (data.a) {
        if (data.a < 0) {
          data.a = 0;
        } else if (data.a > 1) {
          data.a = 1;
        }
        _this.props.onChange({
          h: _this.props.hsl.h,
          s: _this.props.hsl.s,
          l: _this.props.hsl.l,
          a: Math.round(data.a * 100) / 100,
          source: "rgb"
        }, e);
      } else if (data.h || data.s || data.l) {
        if (typeof data.s === "string" && data.s.includes("%")) {
          data.s = data.s.replace("%", "");
        }
        if (typeof data.l === "string" && data.l.includes("%")) {
          data.l = data.l.replace("%", "");
        }
        if (data.s == 1) {
          data.s = 0.01;
        } else if (data.l == 1) {
          data.l = 0.01;
        }
        _this.props.onChange({
          h: data.h || _this.props.hsl.h,
          s: Number(!isUndefined_default(data.s) ? data.s : _this.props.hsl.s),
          l: Number(!isUndefined_default(data.l) ? data.l : _this.props.hsl.l),
          source: "hsl"
        }, e);
      }
    };
    _this.showHighlight = function(e) {
      e.currentTarget.style.background = "#eee";
    };
    _this.hideHighlight = function(e) {
      e.currentTarget.style.background = "transparent";
    };
    if (props.hsl.a !== 1 && props.view === "hex") {
      _this.state = {
        view: "rgb"
      };
    } else {
      _this.state = {
        view: props.view
      };
    }
    return _this;
  }
  _createClass7(ChromeFields2, [{
    key: "render",
    value: function render3() {
      var _this2 = this;
      var styles = (0, import_reactcss14.default)({
        "default": {
          wrap: {
            paddingTop: "16px",
            display: "flex"
          },
          fields: {
            flex: "1",
            display: "flex",
            marginLeft: "-6px"
          },
          field: {
            paddingLeft: "6px",
            width: "100%"
          },
          alpha: {
            paddingLeft: "6px",
            width: "100%"
          },
          toggle: {
            width: "32px",
            textAlign: "right",
            position: "relative"
          },
          icon: {
            marginRight: "-4px",
            marginTop: "12px",
            cursor: "pointer",
            position: "relative"
          },
          iconHighlight: {
            position: "absolute",
            width: "24px",
            height: "28px",
            background: "#eee",
            borderRadius: "4px",
            top: "10px",
            left: "12px",
            display: "none"
          },
          input: {
            fontSize: "11px",
            color: "#333",
            width: "100%",
            borderRadius: "2px",
            border: "none",
            boxShadow: "inset 0 0 0 1px #dadada",
            height: "21px",
            textAlign: "center"
          },
          label: {
            textTransform: "uppercase",
            fontSize: "11px",
            lineHeight: "11px",
            color: "#969696",
            textAlign: "center",
            display: "block",
            marginTop: "12px"
          },
          svg: {
            fill: "#333",
            width: "24px",
            height: "24px",
            border: "1px transparent solid",
            borderRadius: "5px"
          }
        },
        "disableAlpha": {
          alpha: {
            display: "none"
          }
        }
      }, this.props, this.state);
      var fields = void 0;
      if (this.state.view === "hex") {
        fields = import_react16.default.createElement(
          "div",
          { style: styles.fields, className: "flexbox-fix" },
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "hex",
              value: this.props.hex,
              onChange: this.handleChange
            })
          )
        );
      } else if (this.state.view === "rgb") {
        fields = import_react16.default.createElement(
          "div",
          { style: styles.fields, className: "flexbox-fix" },
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "r",
              value: this.props.rgb.r,
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "g",
              value: this.props.rgb.g,
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "b",
              value: this.props.rgb.b,
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.alpha },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "a",
              value: this.props.rgb.a,
              arrowOffset: 0.01,
              onChange: this.handleChange
            })
          )
        );
      } else if (this.state.view === "hsl") {
        fields = import_react16.default.createElement(
          "div",
          { style: styles.fields, className: "flexbox-fix" },
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "h",
              value: Math.round(this.props.hsl.h),
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "s",
              value: Math.round(this.props.hsl.s * 100) + "%",
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.field },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "l",
              value: Math.round(this.props.hsl.l * 100) + "%",
              onChange: this.handleChange
            })
          ),
          import_react16.default.createElement(
            "div",
            { style: styles.alpha },
            import_react16.default.createElement(EditableInput_default, {
              style: { input: styles.input, label: styles.label },
              label: "a",
              value: this.props.hsl.a,
              arrowOffset: 0.01,
              onChange: this.handleChange
            })
          )
        );
      }
      return import_react16.default.createElement(
        "div",
        { style: styles.wrap, className: "flexbox-fix" },
        fields,
        import_react16.default.createElement(
          "div",
          { style: styles.toggle },
          import_react16.default.createElement(
            "div",
            { style: styles.icon, onClick: this.toggleViews, ref: function ref(icon) {
              return _this2.icon = icon;
            } },
            import_react16.default.createElement(import_UnfoldMoreHorizontalIcon.default, {
              style: styles.svg,
              onMouseOver: this.showHighlight,
              onMouseEnter: this.showHighlight,
              onMouseOut: this.hideHighlight
            })
          )
        )
      );
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, state) {
      if (nextProps.hsl.a !== 1 && state.view === "hex") {
        return { view: "rgb" };
      }
      return null;
    }
  }]);
  return ChromeFields2;
}(import_react16.default.Component);
ChromeFields.defaultProps = {
  view: "hex"
};
var ChromeFields_default = ChromeFields;

// ../../node_modules/react-color/es/components/chrome/ChromePointer.js
var import_react17 = __toESM(require_react());
var import_reactcss15 = __toESM(require_lib());
var ChromePointer = function ChromePointer2() {
  var styles = (0, import_reactcss15.default)({
    "default": {
      picker: {
        width: "12px",
        height: "12px",
        borderRadius: "6px",
        transform: "translate(-6px, -1px)",
        backgroundColor: "rgb(248, 248, 248)",
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.37)"
      }
    }
  });
  return import_react17.default.createElement("div", { style: styles.picker });
};
var ChromePointer_default = ChromePointer;

// ../../node_modules/react-color/es/components/chrome/ChromePointerCircle.js
var import_react18 = __toESM(require_react());
var import_reactcss16 = __toESM(require_lib());
var ChromePointerCircle = function ChromePointerCircle2() {
  var styles = (0, import_reactcss16.default)({
    "default": {
      picker: {
        width: "12px",
        height: "12px",
        borderRadius: "6px",
        boxShadow: "inset 0 0 0 1px #fff",
        transform: "translate(-6px, -6px)"
      }
    }
  });
  return import_react18.default.createElement("div", { style: styles.picker });
};
var ChromePointerCircle_default = ChromePointerCircle;

// ../../node_modules/react-color/es/components/chrome/Chrome.js
var Chrome = function Chrome2(_ref) {
  var width = _ref.width, onChange = _ref.onChange, disableAlpha = _ref.disableAlpha, rgb = _ref.rgb, hsl = _ref.hsl, hsv = _ref.hsv, hex = _ref.hex, renderers = _ref.renderers, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className, defaultView = _ref.defaultView;
  var styles = (0, import_reactcss17.default)(merge_default({
    "default": {
      picker: {
        width,
        background: "#fff",
        borderRadius: "2px",
        boxShadow: "0 0 2px rgba(0,0,0,.3), 0 4px 8px rgba(0,0,0,.3)",
        boxSizing: "initial",
        fontFamily: "Menlo"
      },
      saturation: {
        width: "100%",
        paddingBottom: "55%",
        position: "relative",
        borderRadius: "2px 2px 0 0",
        overflow: "hidden"
      },
      Saturation: {
        radius: "2px 2px 0 0"
      },
      body: {
        padding: "16px 16px 12px"
      },
      controls: {
        display: "flex"
      },
      color: {
        width: "32px"
      },
      swatch: {
        marginTop: "6px",
        width: "16px",
        height: "16px",
        borderRadius: "8px",
        position: "relative",
        overflow: "hidden"
      },
      active: {
        absolute: "0px 0px 0px 0px",
        borderRadius: "8px",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
        background: "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + rgb.a + ")",
        zIndex: "2"
      },
      toggles: {
        flex: "1"
      },
      hue: {
        height: "10px",
        position: "relative",
        marginBottom: "8px"
      },
      Hue: {
        radius: "2px"
      },
      alpha: {
        height: "10px",
        position: "relative"
      },
      Alpha: {
        radius: "2px"
      }
    },
    "disableAlpha": {
      color: {
        width: "22px"
      },
      alpha: {
        display: "none"
      },
      hue: {
        marginBottom: "0px"
      },
      swatch: {
        width: "10px",
        height: "10px",
        marginTop: "0px"
      }
    }
  }, passedStyles), { disableAlpha });
  return import_react19.default.createElement(
    "div",
    { style: styles.picker, className: "chrome-picker " + className },
    import_react19.default.createElement(
      "div",
      { style: styles.saturation },
      import_react19.default.createElement(Saturation_default, {
        style: styles.Saturation,
        hsl,
        hsv,
        pointer: ChromePointerCircle_default,
        onChange
      })
    ),
    import_react19.default.createElement(
      "div",
      { style: styles.body },
      import_react19.default.createElement(
        "div",
        { style: styles.controls, className: "flexbox-fix" },
        import_react19.default.createElement(
          "div",
          { style: styles.color },
          import_react19.default.createElement(
            "div",
            { style: styles.swatch },
            import_react19.default.createElement("div", { style: styles.active }),
            import_react19.default.createElement(Checkboard_default, { renderers })
          )
        ),
        import_react19.default.createElement(
          "div",
          { style: styles.toggles },
          import_react19.default.createElement(
            "div",
            { style: styles.hue },
            import_react19.default.createElement(Hue_default, {
              style: styles.Hue,
              hsl,
              pointer: ChromePointer_default,
              onChange
            })
          ),
          import_react19.default.createElement(
            "div",
            { style: styles.alpha },
            import_react19.default.createElement(Alpha_default, {
              style: styles.Alpha,
              rgb,
              hsl,
              pointer: ChromePointer_default,
              renderers,
              onChange
            })
          )
        )
      ),
      import_react19.default.createElement(ChromeFields_default, {
        rgb,
        hsl,
        hex,
        view: defaultView,
        onChange,
        disableAlpha
      })
    )
  );
};
Chrome.propTypes = {
  width: import_prop_types4.default.oneOfType([import_prop_types4.default.string, import_prop_types4.default.number]),
  disableAlpha: import_prop_types4.default.bool,
  styles: import_prop_types4.default.object,
  defaultView: import_prop_types4.default.oneOf(["hex", "rgb", "hsl"])
};
Chrome.defaultProps = {
  width: 225,
  disableAlpha: false,
  styles: {}
};
var Chrome_default = ColorWrap_default(Chrome);

// ../../node_modules/react-color/es/components/compact/Compact.js
var import_react22 = __toESM(require_react());
var import_prop_types5 = __toESM(require_prop_types());
var import_reactcss20 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/compact/CompactColor.js
var import_react20 = __toESM(require_react());
var import_reactcss18 = __toESM(require_lib());
var CompactColor = function CompactColor2(_ref) {
  var color = _ref.color, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
  } : _ref$onClick, onSwatchHover = _ref.onSwatchHover, active = _ref.active;
  var styles = (0, import_reactcss18.default)({
    "default": {
      color: {
        background: color,
        width: "15px",
        height: "15px",
        float: "left",
        marginRight: "5px",
        marginBottom: "5px",
        position: "relative",
        cursor: "pointer"
      },
      dot: {
        absolute: "5px 5px 5px 5px",
        background: getContrastingColor(color),
        borderRadius: "50%",
        opacity: "0"
      }
    },
    "active": {
      dot: {
        opacity: "1"
      }
    },
    "color-#FFFFFF": {
      color: {
        boxShadow: "inset 0 0 0 1px #ddd"
      },
      dot: {
        background: "#000"
      }
    },
    "transparent": {
      dot: {
        background: "#000"
      }
    }
  }, { active, "color-#FFFFFF": color === "#FFFFFF", "transparent": color === "transparent" });
  return import_react20.default.createElement(
    Swatch_default,
    {
      style: styles.color,
      color,
      onClick,
      onHover: onSwatchHover,
      focusStyle: { boxShadow: "0 0 4px " + color }
    },
    import_react20.default.createElement("div", { style: styles.dot })
  );
};
var CompactColor_default = CompactColor;

// ../../node_modules/react-color/es/components/compact/CompactFields.js
var import_react21 = __toESM(require_react());
var import_reactcss19 = __toESM(require_lib());
var CompactFields = function CompactFields2(_ref) {
  var hex = _ref.hex, rgb = _ref.rgb, onChange = _ref.onChange;
  var styles = (0, import_reactcss19.default)({
    "default": {
      fields: {
        display: "flex",
        paddingBottom: "6px",
        paddingRight: "5px",
        position: "relative"
      },
      active: {
        position: "absolute",
        top: "6px",
        left: "5px",
        height: "9px",
        width: "9px",
        background: hex
      },
      HEXwrap: {
        flex: "6",
        position: "relative"
      },
      HEXinput: {
        width: "80%",
        padding: "0px",
        paddingLeft: "20%",
        border: "none",
        outline: "none",
        background: "none",
        fontSize: "12px",
        color: "#333",
        height: "16px"
      },
      HEXlabel: {
        display: "none"
      },
      RGBwrap: {
        flex: "3",
        position: "relative"
      },
      RGBinput: {
        width: "70%",
        padding: "0px",
        paddingLeft: "30%",
        border: "none",
        outline: "none",
        background: "none",
        fontSize: "12px",
        color: "#333",
        height: "16px"
      },
      RGBlabel: {
        position: "absolute",
        top: "3px",
        left: "0px",
        lineHeight: "16px",
        textTransform: "uppercase",
        fontSize: "12px",
        color: "#999"
      }
    }
  });
  var handleChange = function handleChange2(data, e) {
    if (data.r || data.g || data.b) {
      onChange({
        r: data.r || rgb.r,
        g: data.g || rgb.g,
        b: data.b || rgb.b,
        source: "rgb"
      }, e);
    } else {
      onChange({
        hex: data.hex,
        source: "hex"
      }, e);
    }
  };
  return import_react21.default.createElement(
    "div",
    { style: styles.fields, className: "flexbox-fix" },
    import_react21.default.createElement("div", { style: styles.active }),
    import_react21.default.createElement(EditableInput_default, {
      style: { wrap: styles.HEXwrap, input: styles.HEXinput, label: styles.HEXlabel },
      label: "hex",
      value: hex,
      onChange: handleChange
    }),
    import_react21.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "r",
      value: rgb.r,
      onChange: handleChange
    }),
    import_react21.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "g",
      value: rgb.g,
      onChange: handleChange
    }),
    import_react21.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "b",
      value: rgb.b,
      onChange: handleChange
    })
  );
};
var CompactFields_default = CompactFields;

// ../../node_modules/react-color/es/components/compact/Compact.js
var Compact = function Compact2(_ref) {
  var onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, colors = _ref.colors, hex = _ref.hex, rgb = _ref.rgb, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss20.default)(merge_default({
    "default": {
      Compact: {
        background: "#f6f6f6",
        radius: "4px"
      },
      compact: {
        paddingTop: "5px",
        paddingLeft: "5px",
        boxSizing: "initial",
        width: "240px"
      },
      clear: {
        clear: "both"
      }
    }
  }, passedStyles));
  var handleChange = function handleChange2(data, e) {
    if (data.hex) {
      isValidHex(data.hex) && onChange({
        hex: data.hex,
        source: "hex"
      }, e);
    } else {
      onChange(data, e);
    }
  };
  return import_react22.default.createElement(
    Raised_default,
    { style: styles.Compact, styles: passedStyles },
    import_react22.default.createElement(
      "div",
      { style: styles.compact, className: "compact-picker " + className },
      import_react22.default.createElement(
        "div",
        null,
        map_default(colors, function(c) {
          return import_react22.default.createElement(CompactColor_default, {
            key: c,
            color: c,
            active: c.toLowerCase() === hex,
            onClick: handleChange,
            onSwatchHover
          });
        }),
        import_react22.default.createElement("div", { style: styles.clear })
      ),
      import_react22.default.createElement(CompactFields_default, { hex, rgb, onChange: handleChange })
    )
  );
};
Compact.propTypes = {
  colors: import_prop_types5.default.arrayOf(import_prop_types5.default.string),
  styles: import_prop_types5.default.object
};
Compact.defaultProps = {
  colors: ["#4D4D4D", "#999999", "#FFFFFF", "#F44E3B", "#FE9200", "#FCDC00", "#DBDF00", "#A4DD00", "#68CCCA", "#73D8FF", "#AEA1FF", "#FDA1FF", "#333333", "#808080", "#cccccc", "#D33115", "#E27300", "#FCC400", "#B0BC00", "#68BC00", "#16A5A5", "#009CE0", "#7B64FF", "#FA28FF", "#000000", "#666666", "#B3B3B3", "#9F0500", "#C45100", "#FB9E00", "#808900", "#194D33", "#0C797D", "#0062B1", "#653294", "#AB149E"],
  styles: {}
};
var Compact_default = ColorWrap_default(Compact);

// ../../node_modules/react-color/es/components/github/Github.js
var import_react24 = __toESM(require_react());
var import_prop_types6 = __toESM(require_prop_types());
var import_reactcss22 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/github/GithubSwatch.js
var import_react23 = __toESM(require_react());
var import_reactcss21 = __toESM(require_lib());
var GithubSwatch = function GithubSwatch2(_ref) {
  var hover = _ref.hover, color = _ref.color, onClick = _ref.onClick, onSwatchHover = _ref.onSwatchHover;
  var hoverSwatch = {
    position: "relative",
    zIndex: "2",
    outline: "2px solid #fff",
    boxShadow: "0 0 5px 2px rgba(0,0,0,0.25)"
  };
  var styles = (0, import_reactcss21.default)({
    "default": {
      swatch: {
        width: "25px",
        height: "25px",
        fontSize: "0"
      }
    },
    "hover": {
      swatch: hoverSwatch
    }
  }, { hover });
  return import_react23.default.createElement(
    "div",
    { style: styles.swatch },
    import_react23.default.createElement(Swatch_default, {
      color,
      onClick,
      onHover: onSwatchHover,
      focusStyle: hoverSwatch
    })
  );
};
var GithubSwatch_default = (0, import_reactcss21.handleHover)(GithubSwatch);

// ../../node_modules/react-color/es/components/github/Github.js
var Github = function Github2(_ref) {
  var width = _ref.width, colors = _ref.colors, onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, triangle = _ref.triangle, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss22.default)(merge_default({
    "default": {
      card: {
        width,
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.2)",
        boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
        borderRadius: "4px",
        position: "relative",
        padding: "5px",
        display: "flex",
        flexWrap: "wrap"
      },
      triangle: {
        position: "absolute",
        border: "7px solid transparent",
        borderBottomColor: "#fff"
      },
      triangleShadow: {
        position: "absolute",
        border: "8px solid transparent",
        borderBottomColor: "rgba(0,0,0,0.15)"
      }
    },
    "hide-triangle": {
      triangle: {
        display: "none"
      },
      triangleShadow: {
        display: "none"
      }
    },
    "top-left-triangle": {
      triangle: {
        top: "-14px",
        left: "10px"
      },
      triangleShadow: {
        top: "-16px",
        left: "9px"
      }
    },
    "top-right-triangle": {
      triangle: {
        top: "-14px",
        right: "10px"
      },
      triangleShadow: {
        top: "-16px",
        right: "9px"
      }
    },
    "bottom-left-triangle": {
      triangle: {
        top: "35px",
        left: "10px",
        transform: "rotate(180deg)"
      },
      triangleShadow: {
        top: "37px",
        left: "9px",
        transform: "rotate(180deg)"
      }
    },
    "bottom-right-triangle": {
      triangle: {
        top: "35px",
        right: "10px",
        transform: "rotate(180deg)"
      },
      triangleShadow: {
        top: "37px",
        right: "9px",
        transform: "rotate(180deg)"
      }
    }
  }, passedStyles), {
    "hide-triangle": triangle === "hide",
    "top-left-triangle": triangle === "top-left",
    "top-right-triangle": triangle === "top-right",
    "bottom-left-triangle": triangle === "bottom-left",
    "bottom-right-triangle": triangle === "bottom-right"
  });
  var handleChange = function handleChange2(hex, e) {
    return onChange({ hex, source: "hex" }, e);
  };
  return import_react24.default.createElement(
    "div",
    { style: styles.card, className: "github-picker " + className },
    import_react24.default.createElement("div", { style: styles.triangleShadow }),
    import_react24.default.createElement("div", { style: styles.triangle }),
    map_default(colors, function(c) {
      return import_react24.default.createElement(GithubSwatch_default, {
        color: c,
        key: c,
        onClick: handleChange,
        onSwatchHover
      });
    })
  );
};
Github.propTypes = {
  width: import_prop_types6.default.oneOfType([import_prop_types6.default.string, import_prop_types6.default.number]),
  colors: import_prop_types6.default.arrayOf(import_prop_types6.default.string),
  triangle: import_prop_types6.default.oneOf(["hide", "top-left", "top-right", "bottom-left", "bottom-right"]),
  styles: import_prop_types6.default.object
};
Github.defaultProps = {
  width: 200,
  colors: ["#B80000", "#DB3E00", "#FCCB00", "#008B02", "#006B76", "#1273DE", "#004DCF", "#5300EB", "#EB9694", "#FAD0C3", "#FEF3BD", "#C1E1C5", "#BEDADC", "#C4DEF6", "#BED3F3", "#D4C4FB"],
  triangle: "top-left",
  styles: {}
};
var Github_default = ColorWrap_default(Github);

// ../../node_modules/react-color/es/components/hue/Hue.js
var import_react26 = __toESM(require_react());
var import_prop_types7 = __toESM(require_prop_types());
var import_reactcss24 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/hue/HuePointer.js
var import_react25 = __toESM(require_react());
var import_reactcss23 = __toESM(require_lib());
var SliderPointer = function SliderPointer2(_ref) {
  var direction = _ref.direction;
  var styles = (0, import_reactcss23.default)({
    "default": {
      picker: {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        transform: "translate(-9px, -1px)",
        backgroundColor: "rgb(248, 248, 248)",
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.37)"
      }
    },
    "vertical": {
      picker: {
        transform: "translate(-3px, -9px)"
      }
    }
  }, { vertical: direction === "vertical" });
  return import_react25.default.createElement("div", { style: styles.picker });
};
var HuePointer_default = SliderPointer;

// ../../node_modules/react-color/es/components/hue/Hue.js
var _extends7 = Object.assign || function(target) {
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
var HuePicker = function HuePicker2(_ref) {
  var width = _ref.width, height = _ref.height, onChange = _ref.onChange, hsl = _ref.hsl, direction = _ref.direction, pointer = _ref.pointer, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss24.default)(merge_default({
    "default": {
      picker: {
        position: "relative",
        width,
        height
      },
      hue: {
        radius: "2px"
      }
    }
  }, passedStyles));
  var handleChange = function handleChange2(data) {
    return onChange({ a: 1, h: data.h, l: 0.5, s: 1 });
  };
  return import_react26.default.createElement(
    "div",
    { style: styles.picker, className: "hue-picker " + className },
    import_react26.default.createElement(Hue_default, _extends7({}, styles.hue, {
      hsl,
      pointer,
      onChange: handleChange,
      direction
    }))
  );
};
HuePicker.propTypes = {
  styles: import_prop_types7.default.object
};
HuePicker.defaultProps = {
  width: "316px",
  height: "16px",
  direction: "horizontal",
  pointer: HuePointer_default,
  styles: {}
};
var Hue_default2 = ColorWrap_default(HuePicker);

// ../../node_modules/react-color/es/components/material/Material.js
var import_react27 = __toESM(require_react());
var import_reactcss25 = __toESM(require_lib());
var Material = function Material2(_ref) {
  var onChange = _ref.onChange, hex = _ref.hex, rgb = _ref.rgb, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss25.default)(merge_default({
    "default": {
      material: {
        width: "98px",
        height: "98px",
        padding: "16px",
        fontFamily: "Roboto"
      },
      HEXwrap: {
        position: "relative"
      },
      HEXinput: {
        width: "100%",
        marginTop: "12px",
        fontSize: "15px",
        color: "#333",
        padding: "0px",
        border: "0px",
        borderBottom: "2px solid " + hex,
        outline: "none",
        height: "30px"
      },
      HEXlabel: {
        position: "absolute",
        top: "0px",
        left: "0px",
        fontSize: "11px",
        color: "#999999",
        textTransform: "capitalize"
      },
      Hex: {
        style: {}
      },
      RGBwrap: {
        position: "relative"
      },
      RGBinput: {
        width: "100%",
        marginTop: "12px",
        fontSize: "15px",
        color: "#333",
        padding: "0px",
        border: "0px",
        borderBottom: "1px solid #eee",
        outline: "none",
        height: "30px"
      },
      RGBlabel: {
        position: "absolute",
        top: "0px",
        left: "0px",
        fontSize: "11px",
        color: "#999999",
        textTransform: "capitalize"
      },
      split: {
        display: "flex",
        marginRight: "-10px",
        paddingTop: "11px"
      },
      third: {
        flex: "1",
        paddingRight: "10px"
      }
    }
  }, passedStyles));
  var handleChange = function handleChange2(data, e) {
    if (data.hex) {
      isValidHex(data.hex) && onChange({
        hex: data.hex,
        source: "hex"
      }, e);
    } else if (data.r || data.g || data.b) {
      onChange({
        r: data.r || rgb.r,
        g: data.g || rgb.g,
        b: data.b || rgb.b,
        source: "rgb"
      }, e);
    }
  };
  return import_react27.default.createElement(
    Raised_default,
    { styles: passedStyles },
    import_react27.default.createElement(
      "div",
      { style: styles.material, className: "material-picker " + className },
      import_react27.default.createElement(EditableInput_default, {
        style: { wrap: styles.HEXwrap, input: styles.HEXinput, label: styles.HEXlabel },
        label: "hex",
        value: hex,
        onChange: handleChange
      }),
      import_react27.default.createElement(
        "div",
        { style: styles.split, className: "flexbox-fix" },
        import_react27.default.createElement(
          "div",
          { style: styles.third },
          import_react27.default.createElement(EditableInput_default, {
            style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
            label: "r",
            value: rgb.r,
            onChange: handleChange
          })
        ),
        import_react27.default.createElement(
          "div",
          { style: styles.third },
          import_react27.default.createElement(EditableInput_default, {
            style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
            label: "g",
            value: rgb.g,
            onChange: handleChange
          })
        ),
        import_react27.default.createElement(
          "div",
          { style: styles.third },
          import_react27.default.createElement(EditableInput_default, {
            style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
            label: "b",
            value: rgb.b,
            onChange: handleChange
          })
        )
      )
    )
  );
};
var Material_default = ColorWrap_default(Material);

// ../../node_modules/react-color/es/components/photoshop/Photoshop.js
var import_react33 = __toESM(require_react());
var import_prop_types8 = __toESM(require_prop_types());
var import_reactcss31 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/photoshop/PhotoshopFields.js
var import_react28 = __toESM(require_react());
var import_reactcss26 = __toESM(require_lib());
var PhotoshopPicker = function PhotoshopPicker2(_ref) {
  var onChange = _ref.onChange, rgb = _ref.rgb, hsv = _ref.hsv, hex = _ref.hex;
  var styles = (0, import_reactcss26.default)({
    "default": {
      fields: {
        paddingTop: "5px",
        paddingBottom: "9px",
        width: "80px",
        position: "relative"
      },
      divider: {
        height: "5px"
      },
      RGBwrap: {
        position: "relative"
      },
      RGBinput: {
        marginLeft: "40%",
        width: "40%",
        height: "18px",
        border: "1px solid #888888",
        boxShadow: "inset 0 1px 1px rgba(0,0,0,.1), 0 1px 0 0 #ECECEC",
        marginBottom: "5px",
        fontSize: "13px",
        paddingLeft: "3px",
        marginRight: "10px"
      },
      RGBlabel: {
        left: "0px",
        top: "0px",
        width: "34px",
        textTransform: "uppercase",
        fontSize: "13px",
        height: "18px",
        lineHeight: "22px",
        position: "absolute"
      },
      HEXwrap: {
        position: "relative"
      },
      HEXinput: {
        marginLeft: "20%",
        width: "80%",
        height: "18px",
        border: "1px solid #888888",
        boxShadow: "inset 0 1px 1px rgba(0,0,0,.1), 0 1px 0 0 #ECECEC",
        marginBottom: "6px",
        fontSize: "13px",
        paddingLeft: "3px"
      },
      HEXlabel: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "14px",
        textTransform: "uppercase",
        fontSize: "13px",
        height: "18px",
        lineHeight: "22px"
      },
      fieldSymbols: {
        position: "absolute",
        top: "5px",
        right: "-7px",
        fontSize: "13px"
      },
      symbol: {
        height: "20px",
        lineHeight: "22px",
        paddingBottom: "7px"
      }
    }
  });
  var handleChange = function handleChange2(data, e) {
    if (data["#"]) {
      isValidHex(data["#"]) && onChange({
        hex: data["#"],
        source: "hex"
      }, e);
    } else if (data.r || data.g || data.b) {
      onChange({
        r: data.r || rgb.r,
        g: data.g || rgb.g,
        b: data.b || rgb.b,
        source: "rgb"
      }, e);
    } else if (data.h || data.s || data.v) {
      onChange({
        h: data.h || hsv.h,
        s: data.s || hsv.s,
        v: data.v || hsv.v,
        source: "hsv"
      }, e);
    }
  };
  return import_react28.default.createElement(
    "div",
    { style: styles.fields },
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "h",
      value: Math.round(hsv.h),
      onChange: handleChange
    }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "s",
      value: Math.round(hsv.s * 100),
      onChange: handleChange
    }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "v",
      value: Math.round(hsv.v * 100),
      onChange: handleChange
    }),
    import_react28.default.createElement("div", { style: styles.divider }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "r",
      value: rgb.r,
      onChange: handleChange
    }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "g",
      value: rgb.g,
      onChange: handleChange
    }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.RGBwrap, input: styles.RGBinput, label: styles.RGBlabel },
      label: "b",
      value: rgb.b,
      onChange: handleChange
    }),
    import_react28.default.createElement("div", { style: styles.divider }),
    import_react28.default.createElement(EditableInput_default, {
      style: { wrap: styles.HEXwrap, input: styles.HEXinput, label: styles.HEXlabel },
      label: "#",
      value: hex.replace("#", ""),
      onChange: handleChange
    }),
    import_react28.default.createElement(
      "div",
      { style: styles.fieldSymbols },
      import_react28.default.createElement(
        "div",
        { style: styles.symbol },
        "°"
      ),
      import_react28.default.createElement(
        "div",
        { style: styles.symbol },
        "%"
      ),
      import_react28.default.createElement(
        "div",
        { style: styles.symbol },
        "%"
      )
    )
  );
};
var PhotoshopFields_default = PhotoshopPicker;

// ../../node_modules/react-color/es/components/photoshop/PhotoshopPointerCircle.js
var import_react29 = __toESM(require_react());
var import_reactcss27 = __toESM(require_lib());
var PhotoshopPointerCircle = function PhotoshopPointerCircle2(_ref) {
  var hsl = _ref.hsl;
  var styles = (0, import_reactcss27.default)({
    "default": {
      picker: {
        width: "12px",
        height: "12px",
        borderRadius: "6px",
        boxShadow: "inset 0 0 0 1px #fff",
        transform: "translate(-6px, -6px)"
      }
    },
    "black-outline": {
      picker: {
        boxShadow: "inset 0 0 0 1px #000"
      }
    }
  }, { "black-outline": hsl.l > 0.5 });
  return import_react29.default.createElement("div", { style: styles.picker });
};
var PhotoshopPointerCircle_default = PhotoshopPointerCircle;

// ../../node_modules/react-color/es/components/photoshop/PhotoshopPointer.js
var import_react30 = __toESM(require_react());
var import_reactcss28 = __toESM(require_lib());
var PhotoshopPointerCircle3 = function PhotoshopPointerCircle4() {
  var styles = (0, import_reactcss28.default)({
    "default": {
      triangle: {
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "4px 0 4px 6px",
        borderColor: "transparent transparent transparent #fff",
        position: "absolute",
        top: "1px",
        left: "1px"
      },
      triangleBorder: {
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "5px 0 5px 8px",
        borderColor: "transparent transparent transparent #555"
      },
      left: {
        Extend: "triangleBorder",
        transform: "translate(-13px, -4px)"
      },
      leftInside: {
        Extend: "triangle",
        transform: "translate(-8px, -5px)"
      },
      right: {
        Extend: "triangleBorder",
        transform: "translate(20px, -14px) rotate(180deg)"
      },
      rightInside: {
        Extend: "triangle",
        transform: "translate(-8px, -5px)"
      }
    }
  });
  return import_react30.default.createElement(
    "div",
    { style: styles.pointer },
    import_react30.default.createElement(
      "div",
      { style: styles.left },
      import_react30.default.createElement("div", { style: styles.leftInside })
    ),
    import_react30.default.createElement(
      "div",
      { style: styles.right },
      import_react30.default.createElement("div", { style: styles.rightInside })
    )
  );
};
var PhotoshopPointer_default = PhotoshopPointerCircle3;

// ../../node_modules/react-color/es/components/photoshop/PhotoshopButton.js
var import_react31 = __toESM(require_react());
var import_reactcss29 = __toESM(require_lib());
var PhotoshopButton = function PhotoshopButton2(_ref) {
  var onClick = _ref.onClick, label = _ref.label, children = _ref.children, active = _ref.active;
  var styles = (0, import_reactcss29.default)({
    "default": {
      button: {
        backgroundImage: "linear-gradient(-180deg, #FFFFFF 0%, #E6E6E6 100%)",
        border: "1px solid #878787",
        borderRadius: "2px",
        height: "20px",
        boxShadow: "0 1px 0 0 #EAEAEA",
        fontSize: "14px",
        color: "#000",
        lineHeight: "20px",
        textAlign: "center",
        marginBottom: "10px",
        cursor: "pointer"
      }
    },
    "active": {
      button: {
        boxShadow: "0 0 0 1px #878787"
      }
    }
  }, { active });
  return import_react31.default.createElement(
    "div",
    { style: styles.button, onClick },
    label || children
  );
};
var PhotoshopButton_default = PhotoshopButton;

// ../../node_modules/react-color/es/components/photoshop/PhotoshopPreviews.js
var import_react32 = __toESM(require_react());
var import_reactcss30 = __toESM(require_lib());
var PhotoshopPreviews = function PhotoshopPreviews2(_ref) {
  var rgb = _ref.rgb, currentColor = _ref.currentColor;
  var styles = (0, import_reactcss30.default)({
    "default": {
      swatches: {
        border: "1px solid #B3B3B3",
        borderBottom: "1px solid #F0F0F0",
        marginBottom: "2px",
        marginTop: "1px"
      },
      new: {
        height: "34px",
        background: "rgb(" + rgb.r + "," + rgb.g + ", " + rgb.b + ")",
        boxShadow: "inset 1px 0 0 #000, inset -1px 0 0 #000, inset 0 1px 0 #000"
      },
      current: {
        height: "34px",
        background: currentColor,
        boxShadow: "inset 1px 0 0 #000, inset -1px 0 0 #000, inset 0 -1px 0 #000"
      },
      label: {
        fontSize: "14px",
        color: "#000",
        textAlign: "center"
      }
    }
  });
  return import_react32.default.createElement(
    "div",
    null,
    import_react32.default.createElement(
      "div",
      { style: styles.label },
      "new"
    ),
    import_react32.default.createElement(
      "div",
      { style: styles.swatches },
      import_react32.default.createElement("div", { style: styles.new }),
      import_react32.default.createElement("div", { style: styles.current })
    ),
    import_react32.default.createElement(
      "div",
      { style: styles.label },
      "current"
    )
  );
};
var PhotoshopPreviews_default = PhotoshopPreviews;

// ../../node_modules/react-color/es/components/photoshop/Photoshop.js
var _createClass8 = function() {
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
function _classCallCheck8(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _possibleConstructorReturn8(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
}
function _inherits8(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
var Photoshop = function(_React$Component) {
  _inherits8(Photoshop2, _React$Component);
  function Photoshop2(props) {
    _classCallCheck8(this, Photoshop2);
    var _this = _possibleConstructorReturn8(this, (Photoshop2.__proto__ || Object.getPrototypeOf(Photoshop2)).call(this));
    _this.state = {
      currentColor: props.hex
    };
    return _this;
  }
  _createClass8(Photoshop2, [{
    key: "render",
    value: function render3() {
      var _props = this.props, _props$styles = _props.styles, passedStyles = _props$styles === void 0 ? {} : _props$styles, _props$className = _props.className, className = _props$className === void 0 ? "" : _props$className;
      var styles = (0, import_reactcss31.default)(merge_default({
        "default": {
          picker: {
            background: "#DCDCDC",
            borderRadius: "4px",
            boxShadow: "0 0 0 1px rgba(0,0,0,.25), 0 8px 16px rgba(0,0,0,.15)",
            boxSizing: "initial",
            width: "513px"
          },
          head: {
            backgroundImage: "linear-gradient(-180deg, #F0F0F0 0%, #D4D4D4 100%)",
            borderBottom: "1px solid #B1B1B1",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.2), inset 0 -1px 0 0 rgba(0,0,0,.02)",
            height: "23px",
            lineHeight: "24px",
            borderRadius: "4px 4px 0 0",
            fontSize: "13px",
            color: "#4D4D4D",
            textAlign: "center"
          },
          body: {
            padding: "15px 15px 0",
            display: "flex"
          },
          saturation: {
            width: "256px",
            height: "256px",
            position: "relative",
            border: "2px solid #B3B3B3",
            borderBottom: "2px solid #F0F0F0",
            overflow: "hidden"
          },
          hue: {
            position: "relative",
            height: "256px",
            width: "19px",
            marginLeft: "10px",
            border: "2px solid #B3B3B3",
            borderBottom: "2px solid #F0F0F0"
          },
          controls: {
            width: "180px",
            marginLeft: "10px"
          },
          top: {
            display: "flex"
          },
          previews: {
            width: "60px"
          },
          actions: {
            flex: "1",
            marginLeft: "20px"
          }
        }
      }, passedStyles));
      return import_react33.default.createElement(
        "div",
        { style: styles.picker, className: "photoshop-picker " + className },
        import_react33.default.createElement(
          "div",
          { style: styles.head },
          this.props.header
        ),
        import_react33.default.createElement(
          "div",
          { style: styles.body, className: "flexbox-fix" },
          import_react33.default.createElement(
            "div",
            { style: styles.saturation },
            import_react33.default.createElement(Saturation_default, {
              hsl: this.props.hsl,
              hsv: this.props.hsv,
              pointer: PhotoshopPointerCircle_default,
              onChange: this.props.onChange
            })
          ),
          import_react33.default.createElement(
            "div",
            { style: styles.hue },
            import_react33.default.createElement(Hue_default, {
              direction: "vertical",
              hsl: this.props.hsl,
              pointer: PhotoshopPointer_default,
              onChange: this.props.onChange
            })
          ),
          import_react33.default.createElement(
            "div",
            { style: styles.controls },
            import_react33.default.createElement(
              "div",
              { style: styles.top, className: "flexbox-fix" },
              import_react33.default.createElement(
                "div",
                { style: styles.previews },
                import_react33.default.createElement(PhotoshopPreviews_default, {
                  rgb: this.props.rgb,
                  currentColor: this.state.currentColor
                })
              ),
              import_react33.default.createElement(
                "div",
                { style: styles.actions },
                import_react33.default.createElement(PhotoshopButton_default, { label: "OK", onClick: this.props.onAccept, active: true }),
                import_react33.default.createElement(PhotoshopButton_default, { label: "Cancel", onClick: this.props.onCancel }),
                import_react33.default.createElement(PhotoshopFields_default, {
                  onChange: this.props.onChange,
                  rgb: this.props.rgb,
                  hsv: this.props.hsv,
                  hex: this.props.hex
                })
              )
            )
          )
        )
      );
    }
  }]);
  return Photoshop2;
}(import_react33.default.Component);
Photoshop.propTypes = {
  header: import_prop_types8.default.string,
  styles: import_prop_types8.default.object
};
Photoshop.defaultProps = {
  header: "Color Picker",
  styles: {}
};
var Photoshop_default = ColorWrap_default(Photoshop);

// ../../node_modules/react-color/es/components/sketch/Sketch.js
var import_react36 = __toESM(require_react());
var import_prop_types10 = __toESM(require_prop_types());
var import_reactcss34 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/sketch/SketchFields.js
var import_react34 = __toESM(require_react());
var import_reactcss32 = __toESM(require_lib());
var SketchFields = function SketchFields2(_ref) {
  var onChange = _ref.onChange, rgb = _ref.rgb, hsl = _ref.hsl, hex = _ref.hex, disableAlpha = _ref.disableAlpha;
  var styles = (0, import_reactcss32.default)({
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
      isValidHex(data.hex) && onChange({
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
  return import_react34.default.createElement(
    "div",
    { style: styles.fields, className: "flexbox-fix" },
    import_react34.default.createElement(
      "div",
      { style: styles.double },
      import_react34.default.createElement(EditableInput_default, {
        style: { input: styles.input, label: styles.label },
        label: "hex",
        value: hex.replace("#", ""),
        onChange: handleChange
      })
    ),
    import_react34.default.createElement(
      "div",
      { style: styles.single },
      import_react34.default.createElement(EditableInput_default, {
        style: { input: styles.input, label: styles.label },
        label: "r",
        value: rgb.r,
        onChange: handleChange,
        dragLabel: "true",
        dragMax: "255"
      })
    ),
    import_react34.default.createElement(
      "div",
      { style: styles.single },
      import_react34.default.createElement(EditableInput_default, {
        style: { input: styles.input, label: styles.label },
        label: "g",
        value: rgb.g,
        onChange: handleChange,
        dragLabel: "true",
        dragMax: "255"
      })
    ),
    import_react34.default.createElement(
      "div",
      { style: styles.single },
      import_react34.default.createElement(EditableInput_default, {
        style: { input: styles.input, label: styles.label },
        label: "b",
        value: rgb.b,
        onChange: handleChange,
        dragLabel: "true",
        dragMax: "255"
      })
    ),
    import_react34.default.createElement(
      "div",
      { style: styles.alpha },
      import_react34.default.createElement(EditableInput_default, {
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
var SketchFields_default = SketchFields;

// ../../node_modules/react-color/es/components/sketch/SketchPresetColors.js
var import_react35 = __toESM(require_react());
var import_prop_types9 = __toESM(require_prop_types());
var import_reactcss33 = __toESM(require_lib());
var _extends8 = Object.assign || function(target) {
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
var SketchPresetColors = function SketchPresetColors2(_ref) {
  var colors = _ref.colors, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
  } : _ref$onClick, onSwatchHover = _ref.onSwatchHover;
  var styles = (0, import_reactcss33.default)({
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
  return import_react35.default.createElement(
    "div",
    { style: styles.colors, className: "flexbox-fix" },
    colors.map(function(colorObjOrString) {
      var c = typeof colorObjOrString === "string" ? { color: colorObjOrString } : colorObjOrString;
      var key = "" + c.color + (c.title || "");
      return import_react35.default.createElement(
        "div",
        { key, style: styles.swatchWrap },
        import_react35.default.createElement(Swatch_default, _extends8({}, c, {
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
  colors: import_prop_types9.default.arrayOf(import_prop_types9.default.oneOfType([import_prop_types9.default.string, import_prop_types9.default.shape({
    color: import_prop_types9.default.string,
    title: import_prop_types9.default.string
  })])).isRequired
};
var SketchPresetColors_default = SketchPresetColors;

// ../../node_modules/react-color/es/components/sketch/Sketch.js
var _extends9 = Object.assign || function(target) {
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
var Sketch = function Sketch2(_ref) {
  var width = _ref.width, rgb = _ref.rgb, hex = _ref.hex, hsv = _ref.hsv, hsl = _ref.hsl, onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, disableAlpha = _ref.disableAlpha, presetColors = _ref.presetColors, renderers = _ref.renderers, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss34.default)(merge_default({
    "default": _extends9({
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
  return import_react36.default.createElement(
    "div",
    { style: styles.picker, className: "sketch-picker " + className },
    import_react36.default.createElement(
      "div",
      { style: styles.saturation },
      import_react36.default.createElement(Saturation_default, {
        style: styles.Saturation,
        hsl,
        hsv,
        onChange
      })
    ),
    import_react36.default.createElement(
      "div",
      { style: styles.controls, className: "flexbox-fix" },
      import_react36.default.createElement(
        "div",
        { style: styles.sliders },
        import_react36.default.createElement(
          "div",
          { style: styles.hue },
          import_react36.default.createElement(Hue_default, {
            style: styles.Hue,
            hsl,
            onChange
          })
        ),
        import_react36.default.createElement(
          "div",
          { style: styles.alpha },
          import_react36.default.createElement(Alpha_default, {
            style: styles.Alpha,
            rgb,
            hsl,
            renderers,
            onChange
          })
        )
      ),
      import_react36.default.createElement(
        "div",
        { style: styles.color },
        import_react36.default.createElement(Checkboard_default, null),
        import_react36.default.createElement("div", { style: styles.activeColor })
      )
    ),
    import_react36.default.createElement(SketchFields_default, {
      rgb,
      hsl,
      hex,
      onChange,
      disableAlpha
    }),
    import_react36.default.createElement(SketchPresetColors_default, {
      colors: presetColors,
      onClick: onChange,
      onSwatchHover
    })
  );
};
Sketch.propTypes = {
  disableAlpha: import_prop_types10.default.bool,
  width: import_prop_types10.default.oneOfType([import_prop_types10.default.string, import_prop_types10.default.number]),
  styles: import_prop_types10.default.object
};
Sketch.defaultProps = {
  disableAlpha: false,
  width: 200,
  styles: {},
  presetColors: ["#D0021B", "#F5A623", "#F8E71C", "#8B572A", "#7ED321", "#417505", "#BD10E0", "#9013FE", "#4A90E2", "#50E3C2", "#B8E986", "#000000", "#4A4A4A", "#9B9B9B", "#FFFFFF"]
};
var Sketch_default = ColorWrap_default(Sketch);

// ../../node_modules/react-color/es/components/slider/Slider.js
var import_react40 = __toESM(require_react());
var import_prop_types11 = __toESM(require_prop_types());
var import_reactcss38 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/slider/SliderSwatches.js
var import_react38 = __toESM(require_react());
var import_reactcss36 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/slider/SliderSwatch.js
var import_react37 = __toESM(require_react());
var import_reactcss35 = __toESM(require_lib());
var SliderSwatch = function SliderSwatch2(_ref) {
  var hsl = _ref.hsl, offset = _ref.offset, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
  } : _ref$onClick, active = _ref.active, first = _ref.first, last = _ref.last;
  var styles = (0, import_reactcss35.default)({
    "default": {
      swatch: {
        height: "12px",
        background: "hsl(" + hsl.h + ", 50%, " + offset * 100 + "%)",
        cursor: "pointer"
      }
    },
    "first": {
      swatch: {
        borderRadius: "2px 0 0 2px"
      }
    },
    "last": {
      swatch: {
        borderRadius: "0 2px 2px 0"
      }
    },
    "active": {
      swatch: {
        transform: "scaleY(1.8)",
        borderRadius: "3.6px/2px"
      }
    }
  }, { active, first, last });
  var handleClick = function handleClick2(e) {
    return onClick({
      h: hsl.h,
      s: 0.5,
      l: offset,
      source: "hsl"
    }, e);
  };
  return import_react37.default.createElement("div", { style: styles.swatch, onClick: handleClick });
};
var SliderSwatch_default = SliderSwatch;

// ../../node_modules/react-color/es/components/slider/SliderSwatches.js
var SliderSwatches = function SliderSwatches2(_ref) {
  var onClick = _ref.onClick, hsl = _ref.hsl;
  var styles = (0, import_reactcss36.default)({
    "default": {
      swatches: {
        marginTop: "20px"
      },
      swatch: {
        boxSizing: "border-box",
        width: "20%",
        paddingRight: "1px",
        float: "left"
      },
      clear: {
        clear: "both"
      }
    }
  });
  var epsilon = 0.1;
  return import_react38.default.createElement(
    "div",
    { style: styles.swatches },
    import_react38.default.createElement(
      "div",
      { style: styles.swatch },
      import_react38.default.createElement(SliderSwatch_default, {
        hsl,
        offset: ".80",
        active: Math.abs(hsl.l - 0.8) < epsilon && Math.abs(hsl.s - 0.5) < epsilon,
        onClick,
        first: true
      })
    ),
    import_react38.default.createElement(
      "div",
      { style: styles.swatch },
      import_react38.default.createElement(SliderSwatch_default, {
        hsl,
        offset: ".65",
        active: Math.abs(hsl.l - 0.65) < epsilon && Math.abs(hsl.s - 0.5) < epsilon,
        onClick
      })
    ),
    import_react38.default.createElement(
      "div",
      { style: styles.swatch },
      import_react38.default.createElement(SliderSwatch_default, {
        hsl,
        offset: ".50",
        active: Math.abs(hsl.l - 0.5) < epsilon && Math.abs(hsl.s - 0.5) < epsilon,
        onClick
      })
    ),
    import_react38.default.createElement(
      "div",
      { style: styles.swatch },
      import_react38.default.createElement(SliderSwatch_default, {
        hsl,
        offset: ".35",
        active: Math.abs(hsl.l - 0.35) < epsilon && Math.abs(hsl.s - 0.5) < epsilon,
        onClick
      })
    ),
    import_react38.default.createElement(
      "div",
      { style: styles.swatch },
      import_react38.default.createElement(SliderSwatch_default, {
        hsl,
        offset: ".20",
        active: Math.abs(hsl.l - 0.2) < epsilon && Math.abs(hsl.s - 0.5) < epsilon,
        onClick,
        last: true
      })
    ),
    import_react38.default.createElement("div", { style: styles.clear })
  );
};
var SliderSwatches_default = SliderSwatches;

// ../../node_modules/react-color/es/components/slider/SliderPointer.js
var import_react39 = __toESM(require_react());
var import_reactcss37 = __toESM(require_lib());
var SliderPointer3 = function SliderPointer4() {
  var styles = (0, import_reactcss37.default)({
    "default": {
      picker: {
        width: "14px",
        height: "14px",
        borderRadius: "6px",
        transform: "translate(-7px, -1px)",
        backgroundColor: "rgb(248, 248, 248)",
        boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.37)"
      }
    }
  });
  return import_react39.default.createElement("div", { style: styles.picker });
};
var SliderPointer_default = SliderPointer3;

// ../../node_modules/react-color/es/components/slider/Slider.js
var Slider = function Slider2(_ref) {
  var hsl = _ref.hsl, onChange = _ref.onChange, pointer = _ref.pointer, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss38.default)(merge_default({
    "default": {
      hue: {
        height: "12px",
        position: "relative"
      },
      Hue: {
        radius: "2px"
      }
    }
  }, passedStyles));
  return import_react40.default.createElement(
    "div",
    { style: styles.wrap || {}, className: "slider-picker " + className },
    import_react40.default.createElement(
      "div",
      { style: styles.hue },
      import_react40.default.createElement(Hue_default, {
        style: styles.Hue,
        hsl,
        pointer,
        onChange
      })
    ),
    import_react40.default.createElement(
      "div",
      { style: styles.swatches },
      import_react40.default.createElement(SliderSwatches_default, { hsl, onClick: onChange })
    )
  );
};
Slider.propTypes = {
  styles: import_prop_types11.default.object
};
Slider.defaultProps = {
  pointer: SliderPointer_default,
  styles: {}
};
var Slider_default = ColorWrap_default(Slider);

// ../../node_modules/react-color/es/components/swatches/Swatches.js
var import_react43 = __toESM(require_react());
var import_prop_types12 = __toESM(require_prop_types());
var import_reactcss41 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/swatches/SwatchesGroup.js
var import_react42 = __toESM(require_react());
var import_reactcss40 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/swatches/SwatchesColor.js
var import_react41 = __toESM(require_react());
var import_reactcss39 = __toESM(require_lib());
var import_CheckIcon = __toESM(require_CheckIcon());
var SwatchesColor = function SwatchesColor2(_ref) {
  var color = _ref.color, _ref$onClick = _ref.onClick, onClick = _ref$onClick === void 0 ? function() {
  } : _ref$onClick, onSwatchHover = _ref.onSwatchHover, first = _ref.first, last = _ref.last, active = _ref.active;
  var styles = (0, import_reactcss39.default)({
    "default": {
      color: {
        width: "40px",
        height: "24px",
        cursor: "pointer",
        background: color,
        marginBottom: "1px"
      },
      check: {
        color: getContrastingColor(color),
        marginLeft: "8px",
        display: "none"
      }
    },
    "first": {
      color: {
        overflow: "hidden",
        borderRadius: "2px 2px 0 0"
      }
    },
    "last": {
      color: {
        overflow: "hidden",
        borderRadius: "0 0 2px 2px"
      }
    },
    "active": {
      check: {
        display: "block"
      }
    },
    "color-#FFFFFF": {
      color: {
        boxShadow: "inset 0 0 0 1px #ddd"
      },
      check: {
        color: "#333"
      }
    },
    "transparent": {
      check: {
        color: "#333"
      }
    }
  }, {
    first,
    last,
    active,
    "color-#FFFFFF": color === "#FFFFFF",
    "transparent": color === "transparent"
  });
  return import_react41.default.createElement(
    Swatch_default,
    {
      color,
      style: styles.color,
      onClick,
      onHover: onSwatchHover,
      focusStyle: { boxShadow: "0 0 4px " + color }
    },
    import_react41.default.createElement(
      "div",
      { style: styles.check },
      import_react41.default.createElement(import_CheckIcon.default, null)
    )
  );
};
var SwatchesColor_default = SwatchesColor;

// ../../node_modules/react-color/es/components/swatches/SwatchesGroup.js
var SwatchesGroup = function SwatchesGroup2(_ref) {
  var onClick = _ref.onClick, onSwatchHover = _ref.onSwatchHover, group = _ref.group, active = _ref.active;
  var styles = (0, import_reactcss40.default)({
    "default": {
      group: {
        paddingBottom: "10px",
        width: "40px",
        float: "left",
        marginRight: "10px"
      }
    }
  });
  return import_react42.default.createElement(
    "div",
    { style: styles.group },
    map_default(group, function(color, i) {
      return import_react42.default.createElement(SwatchesColor_default, {
        key: color,
        color,
        active: color.toLowerCase() === active,
        first: i === 0,
        last: i === group.length - 1,
        onClick,
        onSwatchHover
      });
    })
  );
};
var SwatchesGroup_default = SwatchesGroup;

// ../../node_modules/react-color/es/components/swatches/Swatches.js
var Swatches = function Swatches2(_ref) {
  var width = _ref.width, height = _ref.height, onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, colors = _ref.colors, hex = _ref.hex, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss41.default)(merge_default({
    "default": {
      picker: {
        width,
        height
      },
      overflow: {
        height,
        overflowY: "scroll"
      },
      body: {
        padding: "16px 0 6px 16px"
      },
      clear: {
        clear: "both"
      }
    }
  }, passedStyles));
  var handleChange = function handleChange2(data, e) {
    return onChange({ hex: data, source: "hex" }, e);
  };
  return import_react43.default.createElement(
    "div",
    { style: styles.picker, className: "swatches-picker " + className },
    import_react43.default.createElement(
      Raised_default,
      null,
      import_react43.default.createElement(
        "div",
        { style: styles.overflow },
        import_react43.default.createElement(
          "div",
          { style: styles.body },
          map_default(colors, function(group) {
            return import_react43.default.createElement(SwatchesGroup_default, {
              key: group.toString(),
              group,
              active: hex,
              onClick: handleChange,
              onSwatchHover
            });
          }),
          import_react43.default.createElement("div", { style: styles.clear })
        )
      )
    )
  );
};
Swatches.propTypes = {
  width: import_prop_types12.default.oneOfType([import_prop_types12.default.string, import_prop_types12.default.number]),
  height: import_prop_types12.default.oneOfType([import_prop_types12.default.string, import_prop_types12.default.number]),
  colors: import_prop_types12.default.arrayOf(import_prop_types12.default.arrayOf(import_prop_types12.default.string)),
  styles: import_prop_types12.default.object
  /* eslint-disable max-len */
};
Swatches.defaultProps = {
  width: 320,
  height: 240,
  colors: [[red["900"], red["700"], red["500"], red["300"], red["100"]], [pink["900"], pink["700"], pink["500"], pink["300"], pink["100"]], [purple["900"], purple["700"], purple["500"], purple["300"], purple["100"]], [deepPurple["900"], deepPurple["700"], deepPurple["500"], deepPurple["300"], deepPurple["100"]], [indigo["900"], indigo["700"], indigo["500"], indigo["300"], indigo["100"]], [blue["900"], blue["700"], blue["500"], blue["300"], blue["100"]], [lightBlue["900"], lightBlue["700"], lightBlue["500"], lightBlue["300"], lightBlue["100"]], [cyan["900"], cyan["700"], cyan["500"], cyan["300"], cyan["100"]], [teal["900"], teal["700"], teal["500"], teal["300"], teal["100"]], ["#194D33", green["700"], green["500"], green["300"], green["100"]], [lightGreen["900"], lightGreen["700"], lightGreen["500"], lightGreen["300"], lightGreen["100"]], [lime["900"], lime["700"], lime["500"], lime["300"], lime["100"]], [yellow["900"], yellow["700"], yellow["500"], yellow["300"], yellow["100"]], [amber["900"], amber["700"], amber["500"], amber["300"], amber["100"]], [orange["900"], orange["700"], orange["500"], orange["300"], orange["100"]], [deepOrange["900"], deepOrange["700"], deepOrange["500"], deepOrange["300"], deepOrange["100"]], [brown["900"], brown["700"], brown["500"], brown["300"], brown["100"]], [blueGrey["900"], blueGrey["700"], blueGrey["500"], blueGrey["300"], blueGrey["100"]], ["#000000", "#525252", "#969696", "#D9D9D9", "#FFFFFF"]],
  styles: {}
};
var Swatches_default = ColorWrap_default(Swatches);

// ../../node_modules/react-color/es/components/twitter/Twitter.js
var import_react44 = __toESM(require_react());
var import_prop_types13 = __toESM(require_prop_types());
var import_reactcss42 = __toESM(require_lib());
var Twitter = function Twitter2(_ref) {
  var onChange = _ref.onChange, onSwatchHover = _ref.onSwatchHover, hex = _ref.hex, colors = _ref.colors, width = _ref.width, triangle = _ref.triangle, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss42.default)(merge_default({
    "default": {
      card: {
        width,
        background: "#fff",
        border: "0 solid rgba(0,0,0,0.25)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        borderRadius: "4px",
        position: "relative"
      },
      body: {
        padding: "15px 9px 9px 15px"
      },
      label: {
        fontSize: "18px",
        color: "#fff"
      },
      triangle: {
        width: "0px",
        height: "0px",
        borderStyle: "solid",
        borderWidth: "0 9px 10px 9px",
        borderColor: "transparent transparent #fff transparent",
        position: "absolute"
      },
      triangleShadow: {
        width: "0px",
        height: "0px",
        borderStyle: "solid",
        borderWidth: "0 9px 10px 9px",
        borderColor: "transparent transparent rgba(0,0,0,.1) transparent",
        position: "absolute"
      },
      hash: {
        background: "#F0F0F0",
        height: "30px",
        width: "30px",
        borderRadius: "4px 0 0 4px",
        float: "left",
        color: "#98A1A4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      input: {
        width: "100px",
        fontSize: "14px",
        color: "#666",
        border: "0px",
        outline: "none",
        height: "28px",
        boxShadow: "inset 0 0 0 1px #F0F0F0",
        boxSizing: "content-box",
        borderRadius: "0 4px 4px 0",
        float: "left",
        paddingLeft: "8px"
      },
      swatch: {
        width: "30px",
        height: "30px",
        float: "left",
        borderRadius: "4px",
        margin: "0 6px 6px 0"
      },
      clear: {
        clear: "both"
      }
    },
    "hide-triangle": {
      triangle: {
        display: "none"
      },
      triangleShadow: {
        display: "none"
      }
    },
    "top-left-triangle": {
      triangle: {
        top: "-10px",
        left: "12px"
      },
      triangleShadow: {
        top: "-11px",
        left: "12px"
      }
    },
    "top-right-triangle": {
      triangle: {
        top: "-10px",
        right: "12px"
      },
      triangleShadow: {
        top: "-11px",
        right: "12px"
      }
    }
  }, passedStyles), {
    "hide-triangle": triangle === "hide",
    "top-left-triangle": triangle === "top-left",
    "top-right-triangle": triangle === "top-right"
  });
  var handleChange = function handleChange2(hexcode, e) {
    isValidHex(hexcode) && onChange({
      hex: hexcode,
      source: "hex"
    }, e);
  };
  return import_react44.default.createElement(
    "div",
    { style: styles.card, className: "twitter-picker " + className },
    import_react44.default.createElement("div", { style: styles.triangleShadow }),
    import_react44.default.createElement("div", { style: styles.triangle }),
    import_react44.default.createElement(
      "div",
      { style: styles.body },
      map_default(colors, function(c, i) {
        return import_react44.default.createElement(Swatch_default, {
          key: i,
          color: c,
          hex: c,
          style: styles.swatch,
          onClick: handleChange,
          onHover: onSwatchHover,
          focusStyle: {
            boxShadow: "0 0 4px " + c
          }
        });
      }),
      import_react44.default.createElement(
        "div",
        { style: styles.hash },
        "#"
      ),
      import_react44.default.createElement(EditableInput_default, {
        label: null,
        style: { input: styles.input },
        value: hex.replace("#", ""),
        onChange: handleChange
      }),
      import_react44.default.createElement("div", { style: styles.clear })
    )
  );
};
Twitter.propTypes = {
  width: import_prop_types13.default.oneOfType([import_prop_types13.default.string, import_prop_types13.default.number]),
  triangle: import_prop_types13.default.oneOf(["hide", "top-left", "top-right"]),
  colors: import_prop_types13.default.arrayOf(import_prop_types13.default.string),
  styles: import_prop_types13.default.object
};
Twitter.defaultProps = {
  width: 276,
  colors: ["#FF6900", "#FCB900", "#7BDCB5", "#00D084", "#8ED1FC", "#0693E3", "#ABB8C3", "#EB144C", "#F78DA7", "#9900EF"],
  triangle: "top-left",
  styles: {}
};
var Twitter_default = ColorWrap_default(Twitter);

// ../../node_modules/react-color/es/components/google/Google.js
var import_react48 = __toESM(require_react());
var import_prop_types16 = __toESM(require_prop_types());
var import_reactcss46 = __toESM(require_lib());

// ../../node_modules/react-color/es/components/google/GooglePointerCircle.js
var import_react45 = __toESM(require_react());
var import_reactcss43 = __toESM(require_lib());
var import_prop_types14 = __toESM(require_prop_types());
var GooglePointerCircle = function GooglePointerCircle2(props) {
  var styles = (0, import_reactcss43.default)({
    "default": {
      picker: {
        width: "20px",
        height: "20px",
        borderRadius: "22px",
        border: "2px #fff solid",
        transform: "translate(-12px, -13px)",
        background: "hsl(" + Math.round(props.hsl.h) + ", " + Math.round(props.hsl.s * 100) + "%, " + Math.round(props.hsl.l * 100) + "%)"
      }
    }
  });
  return import_react45.default.createElement("div", { style: styles.picker });
};
GooglePointerCircle.propTypes = {
  hsl: import_prop_types14.default.shape({
    h: import_prop_types14.default.number,
    s: import_prop_types14.default.number,
    l: import_prop_types14.default.number,
    a: import_prop_types14.default.number
  })
};
GooglePointerCircle.defaultProps = {
  hsl: { a: 1, h: 249.94, l: 0.2, s: 0.5 }
};
var GooglePointerCircle_default = GooglePointerCircle;

// ../../node_modules/react-color/es/components/google/GooglePointer.js
var import_react46 = __toESM(require_react());
var import_reactcss44 = __toESM(require_lib());
var import_prop_types15 = __toESM(require_prop_types());
var GooglePointer = function GooglePointer2(props) {
  var styles = (0, import_reactcss44.default)({
    "default": {
      picker: {
        width: "20px",
        height: "20px",
        borderRadius: "22px",
        transform: "translate(-10px, -7px)",
        background: "hsl(" + Math.round(props.hsl.h) + ", 100%, 50%)",
        border: "2px white solid"
      }
    }
  });
  return import_react46.default.createElement("div", { style: styles.picker });
};
GooglePointer.propTypes = {
  hsl: import_prop_types15.default.shape({
    h: import_prop_types15.default.number,
    s: import_prop_types15.default.number,
    l: import_prop_types15.default.number,
    a: import_prop_types15.default.number
  })
};
GooglePointer.defaultProps = {
  hsl: { a: 1, h: 249.94, l: 0.2, s: 0.5 }
};
var GooglePointer_default = GooglePointer;

// ../../node_modules/react-color/es/components/google/GoogleFields.js
var import_react47 = __toESM(require_react());
var import_reactcss45 = __toESM(require_lib());
var GoogleFields = function GoogleFields2(_ref) {
  var onChange = _ref.onChange, rgb = _ref.rgb, hsl = _ref.hsl, hex = _ref.hex, hsv = _ref.hsv;
  var handleChange = function handleChange2(data, e) {
    if (data.hex) {
      isValidHex(data.hex) && onChange({
        hex: data.hex,
        source: "hex"
      }, e);
    } else if (data.rgb) {
      var values = data.rgb.split(",");
      isvalidColorString(data.rgb, "rgb") && onChange({
        r: values[0],
        g: values[1],
        b: values[2],
        a: 1,
        source: "rgb"
      }, e);
    } else if (data.hsv) {
      var _values = data.hsv.split(",");
      if (isvalidColorString(data.hsv, "hsv")) {
        _values[2] = _values[2].replace("%", "");
        _values[1] = _values[1].replace("%", "");
        _values[0] = _values[0].replace("°", "");
        if (_values[1] == 1) {
          _values[1] = 0.01;
        } else if (_values[2] == 1) {
          _values[2] = 0.01;
        }
        onChange({
          h: Number(_values[0]),
          s: Number(_values[1]),
          v: Number(_values[2]),
          source: "hsv"
        }, e);
      }
    } else if (data.hsl) {
      var _values2 = data.hsl.split(",");
      if (isvalidColorString(data.hsl, "hsl")) {
        _values2[2] = _values2[2].replace("%", "");
        _values2[1] = _values2[1].replace("%", "");
        _values2[0] = _values2[0].replace("°", "");
        if (hsvValue[1] == 1) {
          hsvValue[1] = 0.01;
        } else if (hsvValue[2] == 1) {
          hsvValue[2] = 0.01;
        }
        onChange({
          h: Number(_values2[0]),
          s: Number(_values2[1]),
          v: Number(_values2[2]),
          source: "hsl"
        }, e);
      }
    }
  };
  var styles = (0, import_reactcss45.default)({
    "default": {
      wrap: {
        display: "flex",
        height: "100px",
        marginTop: "4px"
      },
      fields: {
        width: "100%"
      },
      column: {
        paddingTop: "10px",
        display: "flex",
        justifyContent: "space-between"
      },
      double: {
        padding: "0px 4.4px",
        boxSizing: "border-box"
      },
      input: {
        width: "100%",
        height: "38px",
        boxSizing: "border-box",
        padding: "4px 10% 3px",
        textAlign: "center",
        border: "1px solid #dadce0",
        fontSize: "11px",
        textTransform: "lowercase",
        borderRadius: "5px",
        outline: "none",
        fontFamily: "Roboto,Arial,sans-serif"
      },
      input2: {
        height: "38px",
        width: "100%",
        border: "1px solid #dadce0",
        boxSizing: "border-box",
        fontSize: "11px",
        textTransform: "lowercase",
        borderRadius: "5px",
        outline: "none",
        paddingLeft: "10px",
        fontFamily: "Roboto,Arial,sans-serif"
      },
      label: {
        textAlign: "center",
        fontSize: "12px",
        background: "#fff",
        position: "absolute",
        textTransform: "uppercase",
        color: "#3c4043",
        width: "35px",
        top: "-6px",
        left: "0",
        right: "0",
        marginLeft: "auto",
        marginRight: "auto",
        fontFamily: "Roboto,Arial,sans-serif"
      },
      label2: {
        left: "10px",
        textAlign: "center",
        fontSize: "12px",
        background: "#fff",
        position: "absolute",
        textTransform: "uppercase",
        color: "#3c4043",
        width: "32px",
        top: "-6px",
        fontFamily: "Roboto,Arial,sans-serif"
      },
      single: {
        flexGrow: "1",
        margin: "0px 4.4px"
      }
    }
  });
  var rgbValue = rgb.r + ", " + rgb.g + ", " + rgb.b;
  var hslValue = Math.round(hsl.h) + "°, " + Math.round(hsl.s * 100) + "%, " + Math.round(hsl.l * 100) + "%";
  var hsvValue = Math.round(hsv.h) + "°, " + Math.round(hsv.s * 100) + "%, " + Math.round(hsv.v * 100) + "%";
  return import_react47.default.createElement(
    "div",
    { style: styles.wrap, className: "flexbox-fix" },
    import_react47.default.createElement(
      "div",
      { style: styles.fields },
      import_react47.default.createElement(
        "div",
        { style: styles.double },
        import_react47.default.createElement(EditableInput_default, {
          style: { input: styles.input, label: styles.label },
          label: "hex",
          value: hex,
          onChange: handleChange
        })
      ),
      import_react47.default.createElement(
        "div",
        { style: styles.column },
        import_react47.default.createElement(
          "div",
          { style: styles.single },
          import_react47.default.createElement(EditableInput_default, {
            style: { input: styles.input2, label: styles.label2 },
            label: "rgb",
            value: rgbValue,
            onChange: handleChange
          })
        ),
        import_react47.default.createElement(
          "div",
          { style: styles.single },
          import_react47.default.createElement(EditableInput_default, {
            style: { input: styles.input2, label: styles.label2 },
            label: "hsv",
            value: hsvValue,
            onChange: handleChange
          })
        ),
        import_react47.default.createElement(
          "div",
          { style: styles.single },
          import_react47.default.createElement(EditableInput_default, {
            style: { input: styles.input2, label: styles.label2 },
            label: "hsl",
            value: hslValue,
            onChange: handleChange
          })
        )
      )
    )
  );
};
var GoogleFields_default = GoogleFields;

// ../../node_modules/react-color/es/components/google/Google.js
var Google = function Google2(_ref) {
  var width = _ref.width, onChange = _ref.onChange, rgb = _ref.rgb, hsl = _ref.hsl, hsv = _ref.hsv, hex = _ref.hex, header = _ref.header, _ref$styles = _ref.styles, passedStyles = _ref$styles === void 0 ? {} : _ref$styles, _ref$className = _ref.className, className = _ref$className === void 0 ? "" : _ref$className;
  var styles = (0, import_reactcss46.default)(merge_default({
    "default": {
      picker: {
        width,
        background: "#fff",
        border: "1px solid #dfe1e5",
        boxSizing: "initial",
        display: "flex",
        flexWrap: "wrap",
        borderRadius: "8px 8px 0px 0px"
      },
      head: {
        height: "57px",
        width: "100%",
        paddingTop: "16px",
        paddingBottom: "16px",
        paddingLeft: "16px",
        fontSize: "20px",
        boxSizing: "border-box",
        fontFamily: "Roboto-Regular,HelveticaNeue,Arial,sans-serif"
      },
      saturation: {
        width: "70%",
        padding: "0px",
        position: "relative",
        overflow: "hidden"
      },
      swatch: {
        width: "30%",
        height: "228px",
        padding: "0px",
        background: "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)",
        position: "relative",
        overflow: "hidden"
      },
      body: {
        margin: "auto",
        width: "95%"
      },
      controls: {
        display: "flex",
        boxSizing: "border-box",
        height: "52px",
        paddingTop: "22px"
      },
      color: {
        width: "32px"
      },
      hue: {
        height: "8px",
        position: "relative",
        margin: "0px 16px 0px 16px",
        width: "100%"
      },
      Hue: {
        radius: "2px"
      }
    }
  }, passedStyles));
  return import_react48.default.createElement(
    "div",
    { style: styles.picker, className: "google-picker " + className },
    import_react48.default.createElement(
      "div",
      { style: styles.head },
      header
    ),
    import_react48.default.createElement("div", { style: styles.swatch }),
    import_react48.default.createElement(
      "div",
      { style: styles.saturation },
      import_react48.default.createElement(Saturation_default, {
        hsl,
        hsv,
        pointer: GooglePointerCircle_default,
        onChange
      })
    ),
    import_react48.default.createElement(
      "div",
      { style: styles.body },
      import_react48.default.createElement(
        "div",
        { style: styles.controls, className: "flexbox-fix" },
        import_react48.default.createElement(
          "div",
          { style: styles.hue },
          import_react48.default.createElement(Hue_default, {
            style: styles.Hue,
            hsl,
            radius: "4px",
            pointer: GooglePointer_default,
            onChange
          })
        )
      ),
      import_react48.default.createElement(GoogleFields_default, {
        rgb,
        hsl,
        hex,
        hsv,
        onChange
      })
    )
  );
};
Google.propTypes = {
  width: import_prop_types16.default.oneOfType([import_prop_types16.default.string, import_prop_types16.default.number]),
  styles: import_prop_types16.default.object,
  header: import_prop_types16.default.string
};
Google.defaultProps = {
  width: 652,
  styles: {},
  header: "Color picker"
};
var Google_default = ColorWrap_default(Google);
export {
  Alpha_default2 as AlphaPicker,
  Block_default as BlockPicker,
  Chrome_default as ChromePicker,
  Circle_default as CirclePicker,
  Compact_default as CompactPicker,
  ColorWrap_default as CustomPicker,
  Github_default as GithubPicker,
  Google_default as GooglePicker,
  Hue_default2 as HuePicker,
  Material_default as MaterialPicker,
  Photoshop_default as PhotoshopPicker,
  Sketch_default as SketchPicker,
  Slider_default as SliderPicker,
  Swatches_default as SwatchesPicker,
  Twitter_default as TwitterPicker,
  Chrome_default as default
};
//# sourceMappingURL=react-color.js.map
