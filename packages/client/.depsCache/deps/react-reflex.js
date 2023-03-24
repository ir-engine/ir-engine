import {
  ResizeObserver_es_default
} from "./chunk-VYA6RSBS.js";
import {
  _defineProperty
} from "./chunk-NW535ZXL.js";
import "./chunk-2WLBNMVK.js";
import {
  _inheritsLoose
} from "./chunk-WZBUROHK.js";
import "./chunk-HXG77NMB.js";
import {
  _objectWithoutPropertiesLoose,
  init_objectWithoutPropertiesLoose
} from "./chunk-MBQSVJUP.js";
import {
  _extends,
  init_extends
} from "./chunk-ZEIPKT2T.js";
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

// ../../node_modules/lodash.throttle/index.js
var require_lodash = __commonJS({
  "../../node_modules/lodash.throttle/index.js"(exports, module) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
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
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
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
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
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
    function throttle2(func, wait, options) {
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
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = throttle2;
  }
});

// ../../node_modules/react-reflex/dist/es/ReflexContainer.js
init_extends();

// ../../node_modules/@babel/runtime/helpers/esm/objectSpread.js
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? Object(arguments[i]) : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === "function") {
      ownKeys.push.apply(ownKeys, Object.getOwnPropertySymbols(source).filter(function(sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}

// ../../node_modules/react-reflex/dist/es/ReflexSplitter.js
init_extends();

// ../../node_modules/react-reflex/dist/es/utilities.js
var Browser = class {
  // Check if not running on server
  static isBrowser() {
    return typeof window !== "undefined";
  }
  // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  static isOpera() {
    return Browser.isBrowser() && (!!window.opera || navigator.userAgent.indexOf(" OPR/") >= 0);
  }
  // Firefox 1.0+
  static isFirefox() {
    return Browser.isBrowser() && typeof InstallTrigger !== "undefined";
  }
  // Safari 3.0+
  static isSafari() {
    if (!Browser.isBrowser()) {
      return false;
    }
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  // Internet Explorer 6-11
  static isIE() {
    return Browser.isBrowser() && !!document.documentMode;
  }
  // Edge 20+
  static isEdge() {
    return Browser.isBrowser() && !Browser.isIE() && !!window.StyleMedia;
  }
  // Chrome 1+
  static isChrome() {
    return Browser.isBrowser() && !!window.chrome && !!window.chrome.webstore;
  }
  // Blink engine detection
  static isBlink() {
    return Browser.isBrowser() && (Browser.isChrome() || Browser.isOpera()) && !!window.CSS;
  }
  static getUserAgent() {
    return typeof navigator === "undefined" ? "" : navigator.userAgent;
  }
  static isAndroid() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/Android/i);
  }
  static isBlackBerry() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/BlackBerry/i);
  }
  static isIOS() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/iPhone|iPad|iPod/i);
  }
  static isOpera() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/Opera Mini/i);
  }
  static isWindows() {
    return Browser.isBrowser() && Browser.isWindowsDesktop() || Browser.isWindowsMobile();
  }
  static isWindowsMobile() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/IEMobile/i);
  }
  static isWindowsDesktop() {
    return Browser.isBrowser() && Browser.getUserAgent().match(/WPDesktop/i);
  }
  static isMobile() {
    return Browser.isBrowser() && (Browser.isWindowsMobile() || Browser.isBlackBerry() || Browser.isAndroid() || Browser.isIOS());
  }
};
var getDataProps = (props) => {
  return Object.keys(props).reduce((prev, key) => {
    if (key.substr(0, 5) === "data-") {
      return _objectSpread({}, prev, {
        [key]: props[key]
      });
    }
    return prev;
  }, {});
};

// ../../node_modules/react-reflex/dist/es/ReflexSplitter.js
var import_prop_types = __toESM(require_prop_types());
var import_react = __toESM(require_react());
var ReflexSplitter = class extends import_react.default.Component {
  /////////////////////////////////////////////////////////
  // Determines if element is a splitter
  // or wraps a splitter
  //
  /////////////////////////////////////////////////////////
  static isA(element) {
    if (!element) {
      return false;
    }
    return true ? element.type === import_react.default.createElement(ReflexSplitter, null).type : element.type === ReflexSplitter;
  }
  constructor(props) {
    super(props);
    _defineProperty(this, "ref", import_react.default.createRef());
    _defineProperty(this, "onMouseMove", (event) => {
      if (this.state.active) {
        const domElement = this.ref.current;
        this.props.events.emit("resize", {
          index: this.props.index,
          domElement,
          event
        });
        if (this.props.onResize) {
          this.props.onResize({
            component: this,
            domElement
          });
        }
        event.stopPropagation();
        event.preventDefault();
      }
    });
    _defineProperty(this, "onMouseDown", (event) => {
      this.setState({
        active: true
      });
      if (this.props.onStartResize) {
        if (this.props.onStartResize({
          domElement: this.ref.current,
          component: this
        })) {
          return;
        }
      }
      this.props.events.emit("startResize", {
        index: this.props.index,
        event
      });
    });
    _defineProperty(this, "onMouseUp", (event) => {
      if (this.state.active) {
        this.setState({
          active: false
        });
        if (this.props.onStopResize) {
          this.props.onStopResize({
            domElement: this.ref.current,
            component: this
          });
        }
        this.props.events.emit("stopResize", {
          index: this.props.index,
          event
        });
      }
    });
    this.state = {
      active: false
    };
    this.document = props.document;
  }
  componentDidMount() {
    if (!this.document) {
      return;
    }
    this.document.addEventListener("touchend", this.onMouseUp);
    this.document.addEventListener("mouseup", this.onMouseUp);
    this.document.addEventListener("mousemove", this.onMouseMove, {
      passive: false
    });
    this.document.addEventListener("touchmove", this.onMouseMove, {
      passive: false
    });
  }
  componentWillUnmount() {
    if (!this.document) {
      return;
    }
    this.document.removeEventListener("mouseup", this.onMouseUp);
    this.document.removeEventListener("touchend", this.onMouseUp);
    this.document.removeEventListener("mousemove", this.onMouseMove);
    this.document.removeEventListener("touchmove", this.onMouseMove);
    if (this.state.active) {
      this.props.events.emit("stopResize", {
        index: this.props.index,
        event: null
      });
    }
  }
  render() {
    const className = [Browser.isMobile() ? "reflex-thin" : "", ...this.props.className.split(" "), this.state.active ? "active" : "", "reflex-splitter"].join(" ").trim();
    return import_react.default.createElement("div", _extends({}, getDataProps(this.props), {
      onTouchStart: this.onMouseDown,
      onMouseDown: this.onMouseDown,
      style: this.props.style,
      className,
      id: this.props.id,
      ref: this.ref
    }), this.props.children);
  }
};
_defineProperty(ReflexSplitter, "propTypes", {
  children: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.node), import_prop_types.default.node]),
  onStartResize: import_prop_types.default.func,
  onStopResize: import_prop_types.default.func,
  className: import_prop_types.default.string,
  propagate: import_prop_types.default.bool,
  onResize: import_prop_types.default.func,
  style: import_prop_types.default.object
});
_defineProperty(ReflexSplitter, "defaultProps", {
  document: typeof document !== "undefined" ? document : null,
  onStartResize: null,
  onStopResize: null,
  propagate: false,
  onResize: null,
  className: "",
  style: {}
});

// ../../node_modules/react-reflex/dist/es/ReflexEvents.js
var ReflexEvents = class {
  constructor() {
    this._events = {};
  }
  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  //
  /////////////////////////////////////////////////////////
  on(events, fct) {
    events.split(" ").forEach((event) => {
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    });
    return this;
  }
  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  //
  /////////////////////////////////////////////////////////
  off(events, fct) {
    if (events == void 0) {
      this._events = {};
      return;
    }
    events.split(" ").forEach((event) => {
      if (event in this._events === false)
        return;
      if (fct) {
        this._events[event].splice(this._events[event].indexOf(fct), 1);
      } else {
        this._events[event] = [];
      }
    });
    return this;
  }
  emit(event) {
    if (this._events[event] === void 0)
      return;
    var tmpArray = this._events[event].slice();
    for (var i = 0; i < tmpArray.length; ++i) {
      var result = tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1));
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }
};
var ReflexEvents_default = ReflexEvents;

// ../../node_modules/react-reflex/dist/es/ReflexContainer.js
var import_prop_types2 = __toESM(require_prop_types());
var import_react2 = __toESM(require_react());

// ../../node_modules/react-reflex/dist/es/Polyfills.js
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    value: function(valueToFind, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      function sameValueZero(x, y) {
        return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y);
      }
      while (k < len) {
        if (sameValueZero(o[k], valueToFind)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}
if (!Math.sign) {
  Math.sign = function(x) {
    return (x > 0) - (x < 0) || +x;
  };
}

// ../../node_modules/react-reflex/dist/es/ReflexContainer.js
var ReflexContainer = class extends import_react2.default.Component {
  /////////////////////////////////////////////////////////
  // orientation: Orientation of the layout container
  //              valid values are ['horizontal', 'vertical'] 
  // maxRecDepth: Maximun recursion depth to solve initial flex
  //              of layout elements based on user provided values
  // className: Space separated classnames to apply custom styles 
  //            to the layout container  
  // style: allows passing inline style to the container
  /////////////////////////////////////////////////////////
  constructor(props) {
    super(props);
    _defineProperty(this, "onWindowResize", () => {
      this.setState({
        flexData: this.computeFlexData()
      });
    });
    _defineProperty(this, "onStartResize", (data) => {
      const pos = data.event.changedTouches ? data.event.changedTouches[0] : data.event;
      switch (this.props.orientation) {
        case "horizontal":
          document.body.classList.add("reflex-row-resize");
          this.previousPos = pos.clientY;
          break;
        case "vertical":
        default:
          document.body.classList.add("reflex-col-resize");
          this.previousPos = pos.clientX;
          break;
      }
      this.elements = [this.children[data.index - 1], this.children[data.index + 1]];
      this.emitElementsEvent(this.elements, "onStartResize");
    });
    _defineProperty(this, "onResize", (data) => {
      const pos = data.event.changedTouches ? data.event.changedTouches[0] : data.event;
      const offset = this.getOffset(pos, data.domElement);
      switch (this.props.orientation) {
        case "horizontal":
          this.previousPos = pos.clientY;
          break;
        case "vertical":
        default:
          this.previousPos = pos.clientX;
          break;
      }
      if (offset) {
        const availableOffset = this.computeAvailableOffset(data.index, offset);
        if (availableOffset) {
          this.elements = this.dispatchOffset(data.index, availableOffset);
          this.adjustFlex(this.elements);
          this.setState({
            resizing: true
          }, () => {
            this.emitElementsEvent(this.elements, "onResize");
          });
        }
      }
    });
    _defineProperty(this, "onStopResize", (data) => {
      document.body.classList.remove("reflex-row-resize");
      document.body.classList.remove("reflex-col-resize");
      const resizedRefs = this.elements ? this.elements.map((element) => {
        return element.ref;
      }) : [];
      const elements = this.children.filter((child) => {
        return !ReflexSplitter.isA(child) && resizedRefs.includes(child.ref);
      });
      this.emitElementsEvent(elements, "onStopResize");
      this.setState({
        resizing: false
      });
    });
    _defineProperty(this, "onElementSize", (data) => {
      return new Promise((resolve) => {
        try {
          const idx = data.index;
          const size = this.getSize(this.children[idx]);
          const offset = data.size - size;
          const dir = data.direction;
          const splitterIdx = idx + dir;
          const availableOffset = this.computeAvailableOffset(splitterIdx, dir * offset);
          this.elements = null;
          if (availableOffset) {
            this.elements = this.dispatchOffset(splitterIdx, availableOffset);
            this.adjustFlex(this.elements);
          }
          this.setState(this.state, () => {
            this.emitElementsEvent(this.elements, "onResize");
            resolve();
          });
        } catch (ex) {
          console.log(ex);
        }
      });
    });
    this.events = new ReflexEvents_default();
    this.children = [];
    this.state = {
      flexData: []
    };
    this.ref = import_react2.default.createRef();
  }
  componentDidMount() {
    const flexData = this.computeFlexData();
    const {
      windowResizeAware
    } = this.props;
    if (windowResizeAware) {
      window.addEventListener("resize", this.onWindowResize);
    }
    this.setState({
      windowResizeAware,
      flexData
    });
    this.events.on("element.size", this.onElementSize);
    this.events.on("startResize", this.onStartResize);
    this.events.on("stopResize", this.onStopResize);
    this.events.on("resize", this.onResize);
  }
  componentWillUnmount() {
    this.events.off();
    window.removeEventListener("resize", this.onWindowResize);
  }
  getValidChildren(props = this.props) {
    return this.toArray(props.children).filter((child) => {
      return !!child;
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const children = this.getValidChildren(this.props);
    if (children.length !== this.state.flexData.length || prevProps.orientation !== this.props.orientation || this.flexHasChanged(prevProps)) {
      const flexData = this.computeFlexData(children, this.props);
      this.setState({
        flexData
      });
    }
    if (this.props.windowResizeAware !== this.state.windowResizeAware) {
      !this.props.windowResizeAware ? window.removeEventListener("resize", this.onWindowResize) : window.addEventListener("resize", this.onWindowResize);
      this.setState({
        windowResizeAware: this.props.windowResizeAware
      });
    }
  }
  // UNSAFE_componentWillReceiveProps(props) {
  //   const children = this.getValidChildren(props)
  //   if (children.length !== this.state.flexData.length || 
  //     props.orientation !== this.props.orientation || 
  //     this.flexHasChanged(props)) 
  //   {
  //     const flexData = this.computeFlexData(
  //       children, props)
  //     this.setState({
  //       flexData
  //     });
  //   }
  //   if (props.windowResizeAware !== this.state.windowResizeAware) {
  //     !props.windowResizeAware
  //       ? window.removeEventListener('resize', this.onWindowResize)
  //       : window.addEventListener('resize', this.onWindowResize)
  //     this.setState({
  //       windowResizeAware: props.windowResizeAware
  //     })
  //   }
  // } 
  /////////////////////////////////////////////////////////
  // attempts to preserve current flex on window resize
  //
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  // Check if flex has changed: this allows updating the
  // component when different flex is passed as property
  // to one or several children
  //
  /////////////////////////////////////////////////////////
  flexHasChanged(prevProps) {
    const prevChildrenFlex = this.getValidChildren(prevProps).map((child) => {
      return child.props.flex || 0;
    });
    const childrenFlex = this.getValidChildren().map((child) => {
      return child.props.flex || 0;
    });
    return !childrenFlex.every((flex, idx) => {
      return flex === prevChildrenFlex[idx];
    });
  }
  /////////////////////////////////////////////////////////
  // Returns size of a ReflexElement
  //
  /////////////////////////////////////////////////////////
  getSize(element) {
    var _domElement$offsetHei, _domElement$offsetWid;
    const domElement = element === null || element === void 0 ? void 0 : element.ref.current;
    switch (this.props.orientation) {
      case "horizontal":
        return (_domElement$offsetHei = domElement === null || domElement === void 0 ? void 0 : domElement.offsetHeight) !== null && _domElement$offsetHei !== void 0 ? _domElement$offsetHei : 0;
      case "vertical":
      default:
        return (_domElement$offsetWid = domElement === null || domElement === void 0 ? void 0 : domElement.offsetWidth) !== null && _domElement$offsetWid !== void 0 ? _domElement$offsetWid : 0;
    }
  }
  /////////////////////////////////////////////////////////
  // Computes offset from pointer position
  //
  /////////////////////////////////////////////////////////
  getOffset(pos, domElement) {
    const {
      top,
      bottom,
      left,
      right
    } = domElement.getBoundingClientRect();
    switch (this.props.orientation) {
      case "horizontal": {
        const offset = pos.clientY - this.previousPos;
        if (offset > 0) {
          if (pos.clientY >= top) {
            return offset;
          }
        } else {
          if (pos.clientY <= bottom) {
            return offset;
          }
        }
        break;
      }
      case "vertical":
      default:
        {
          const offset = pos.clientX - this.previousPos;
          if (offset > 0) {
            if (pos.clientX > left) {
              return offset;
            }
          } else {
            if (pos.clientX < right) {
              return offset;
            }
          }
        }
        break;
    }
    return 0;
  }
  /////////////////////////////////////////////////////////
  // Handles startResize event
  //
  /////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  // Adjusts flex after a dispatch to make sure
  // total flex of modified elements remains the same
  //
  /////////////////////////////////////////////////////////
  adjustFlex(elements) {
    const diffFlex = elements.reduce((sum, element) => {
      const idx = element.props.index;
      const previousFlex = element.props.flex;
      const nextFlex = this.state.flexData[idx].flex;
      return sum + (previousFlex - nextFlex) / elements.length;
    }, 0);
    elements.forEach((element) => {
      this.state.flexData[element.props.index].flex += diffFlex;
    });
  }
  /////////////////////////////////////////////////////////
  // Returns available offset for a given raw offset value
  // This checks how much the panes can be stretched and
  // shrink, then returns the min
  //
  /////////////////////////////////////////////////////////
  computeAvailableOffset(idx, offset) {
    const stretch = this.computeAvailableStretch(idx, offset);
    const shrink = this.computeAvailableShrink(idx, offset);
    const availableOffset = Math.min(stretch, shrink) * Math.sign(offset);
    return availableOffset;
  }
  /////////////////////////////////////////////////////////
  // Returns true if the next splitter than the one at idx
  // can propagate the drag. This can happen if that
  // next element is actually a splitter and it has
  // propagate=true property set
  //
  /////////////////////////////////////////////////////////
  checkPropagate(idx, direction) {
    if (direction > 0) {
      if (idx < this.children.length - 2) {
        const child = this.children[idx + 2];
        const typeCheck = ReflexSplitter.isA(child);
        return typeCheck && child.props.propagate;
      }
    } else {
      if (idx > 2) {
        const child = this.children[idx - 2];
        const typeCheck = ReflexSplitter.isA(child);
        return typeCheck && child.props.propagate;
      }
    }
    return false;
  }
  /////////////////////////////////////////////////////////
  // Recursively computes available stretch at splitter
  // idx for given raw offset
  //
  /////////////////////////////////////////////////////////
  computeAvailableStretch(idx, offset) {
    var _child$props$maxSize;
    const childIdx = offset < 0 ? idx + 1 : idx - 1;
    const child = this.children[childIdx];
    const size = this.getSize(child);
    const maxSize = (_child$props$maxSize = child === null || child === void 0 ? void 0 : child.props.maxSize) !== null && _child$props$maxSize !== void 0 ? _child$props$maxSize : 0;
    const availableStretch = maxSize - size;
    if (availableStretch < Math.abs(offset)) {
      if (this.checkPropagate(idx, -1 * offset)) {
        const nextOffset = Math.sign(offset) * (Math.abs(offset) - availableStretch);
        return availableStretch + this.computeAvailableStretch(offset < 0 ? idx + 2 : idx - 2, nextOffset);
      }
    }
    return Math.min(availableStretch, Math.abs(offset));
  }
  /////////////////////////////////////////////////////////
  // Recursively computes available shrink at splitter
  // idx for given raw offset
  //
  /////////////////////////////////////////////////////////
  computeAvailableShrink(idx, offset) {
    var _child$props$minSize;
    const childIdx = offset > 0 ? idx + 1 : idx - 1;
    const child = this.children[childIdx];
    const size = this.getSize(child);
    const minSize = Math.max((_child$props$minSize = child === null || child === void 0 ? void 0 : child.props.minSize) !== null && _child$props$minSize !== void 0 ? _child$props$minSize : 0, 0);
    const availableShrink = size - minSize;
    if (availableShrink < Math.abs(offset)) {
      if (this.checkPropagate(idx, offset)) {
        const nextOffset = Math.sign(offset) * (Math.abs(offset) - availableShrink);
        return availableShrink + this.computeAvailableShrink(offset > 0 ? idx + 2 : idx - 2, nextOffset);
      }
    }
    return Math.min(availableShrink, Math.abs(offset));
  }
  /////////////////////////////////////////////////////////
  // Returns flex value for unit pixel
  //
  /////////////////////////////////////////////////////////
  computePixelFlex(orientation = this.props.orientation) {
    if (!this.ref.current) {
      console.warn("Unable to locate ReflexContainer dom node");
      return 0;
    }
    switch (orientation) {
      case "horizontal":
        if (this.ref.current.offsetHeight === 0) {
          console.warn("Found ReflexContainer with height=0, this will cause invalid behavior...");
          console.warn(this.ref.current);
          return 0;
        }
        return 1 / this.ref.current.offsetHeight;
      case "vertical":
      default:
        if (this.ref.current.offsetWidth === 0) {
          console.warn("Found ReflexContainer with width=0, this will cause invalid behavior...");
          console.warn(this.ref.current);
          return 0;
        }
        return 1 / this.ref.current.offsetWidth;
    }
  }
  /////////////////////////////////////////////////////////
  // Adds offset to a given ReflexElement
  //
  /////////////////////////////////////////////////////////
  addOffset(element, offset) {
    const size = this.getSize(element);
    const idx = element.props.index;
    const newSize = Math.max(size + offset, 0);
    const currentFlex = this.state.flexData[idx].flex;
    const newFlex = currentFlex > 0 ? currentFlex * newSize / size : this.computePixelFlex() * newSize;
    this.state.flexData[idx].flex = !isFinite(newFlex) || isNaN(newFlex) ? 0 : newFlex;
  }
  /////////////////////////////////////////////////////////
  // Recursively dispatches stretch offset across
  // children elements starting at splitter idx
  //
  /////////////////////////////////////////////////////////
  dispatchStretch(idx, offset) {
    const childIdx = offset < 0 ? idx + 1 : idx - 1;
    if (childIdx < 0 || childIdx > this.children.length - 1) {
      return [];
    }
    const child = this.children[childIdx];
    const size = this.getSize(child);
    const newSize = Math.min(child.props.maxSize, size + Math.abs(offset));
    const dispatchedStretch = newSize - size;
    this.addOffset(child, dispatchedStretch);
    if (dispatchedStretch < Math.abs(offset)) {
      const nextIdx = idx - Math.sign(offset) * 2;
      const nextOffset = Math.sign(offset) * (Math.abs(offset) - dispatchedStretch);
      return [child, ...this.dispatchStretch(nextIdx, nextOffset)];
    }
    return [child];
  }
  /////////////////////////////////////////////////////////
  // Recursively dispatches shrink offset across
  // children elements starting at splitter idx
  //
  /////////////////////////////////////////////////////////
  dispatchShrink(idx, offset) {
    const childIdx = offset > 0 ? idx + 1 : idx - 1;
    if (childIdx < 0 || childIdx > this.children.length - 1) {
      return [];
    }
    const child = this.children[childIdx];
    const size = this.getSize(child);
    const newSize = Math.max(child.props.minSize, size - Math.abs(offset));
    const dispatchedShrink = newSize - size;
    this.addOffset(child, dispatchedShrink);
    if (Math.abs(dispatchedShrink) < Math.abs(offset)) {
      const nextIdx = idx + Math.sign(offset) * 2;
      const nextOffset = Math.sign(offset) * (Math.abs(offset) + dispatchedShrink);
      return [child, ...this.dispatchShrink(nextIdx, nextOffset)];
    }
    return [child];
  }
  /////////////////////////////////////////////////////////
  // Dispatch offset at splitter idx
  //
  /////////////////////////////////////////////////////////
  dispatchOffset(idx, offset) {
    return [...this.dispatchStretch(idx, offset), ...this.dispatchShrink(idx, offset)];
  }
  /////////////////////////////////////////////////////////
  // Emits given if event for each given element
  // if present in the component props
  //
  /////////////////////////////////////////////////////////
  emitElementsEvent(elements, event) {
    this.toArray(elements).forEach((component) => {
      if (component.props[event]) {
        component.props[event]({
          domElement: component.ref.current,
          component
        });
      }
    });
  }
  /////////////////////////////////////////////////////////
  // Computes initial flex data based on provided flex
  // properties. By default each ReflexElement gets
  // evenly arranged within its container
  //
  /////////////////////////////////////////////////////////
  computeFlexData(children = this.getValidChildren(), props = this.props) {
    const pixelFlex = this.computePixelFlex(props.orientation);
    const computeFreeFlex = (flexData2) => {
      return flexData2.reduce((sum, entry) => {
        if (!ReflexSplitter.isA(entry) && entry.constrained) {
          return sum - entry.flex;
        }
        return sum;
      }, 1);
    };
    const computeFreeElements = (flexData2) => {
      return flexData2.reduce((sum, entry) => {
        if (!ReflexSplitter.isA(entry) && !entry.constrained) {
          return sum + 1;
        }
        return sum;
      }, 0);
    };
    const flexDataInit = children.map((child) => {
      const props2 = child.props;
      return {
        maxFlex: (props2.maxSize || Number.MAX_VALUE) * pixelFlex,
        sizeFlex: (props2.size || Number.MAX_VALUE) * pixelFlex,
        minFlex: (props2.minSize || 1) * pixelFlex,
        constrained: props2.flex !== void 0,
        flex: props2.flex || 0,
        type: child.type
      };
    });
    const computeFlexDataRec = (flexDataIn, depth = 0) => {
      let hasContrain = false;
      const freeElements = computeFreeElements(flexDataIn);
      const freeFlex = computeFreeFlex(flexDataIn);
      const flexDataOut = flexDataIn.map((entry) => {
        if (ReflexSplitter.isA(entry)) {
          return entry;
        }
        const proposedFlex = !entry.constrained ? freeFlex / freeElements : entry.flex;
        const constrainedFlex = Math.min(entry.sizeFlex, Math.min(entry.maxFlex, Math.max(entry.minFlex, proposedFlex)));
        const constrained = entry.constrained || constrainedFlex !== proposedFlex;
        hasContrain = hasContrain || constrained;
        return _objectSpread({}, entry, {
          flex: constrainedFlex,
          constrained
        });
      });
      return hasContrain && depth < this.props.maxRecDepth ? computeFlexDataRec(flexDataOut, depth + 1) : flexDataOut;
    };
    const flexData = computeFlexDataRec(flexDataInit);
    return flexData.map((entry) => {
      return {
        flex: !ReflexSplitter.isA(entry) ? entry.flex : 0,
        ref: import_react2.default.createRef()
      };
    });
  }
  /////////////////////////////////////////////////////////
  // Utility method to ensure given argument is
  // returned as an array
  //
  /////////////////////////////////////////////////////////
  toArray(obj) {
    return obj ? Array.isArray(obj) ? obj : [obj] : [];
  }
  /////////////////////////////////////////////////////////
  // Render container. This will clone all original child
  // components in order to pass some internal properties
  // used to handle resizing logic
  //
  /////////////////////////////////////////////////////////
  render() {
    const className = [this.state.resizing ? "reflex-resizing" : "", ...this.props.className.split(" "), this.props.orientation, "reflex-container"].join(" ").trim();
    this.children = import_react2.default.Children.map(this.getValidChildren(), (child, index) => {
      if (index > this.state.flexData.length - 1) {
        return import_react2.default.createElement("div", null);
      }
      const flexData = this.state.flexData[index];
      const newProps = _objectSpread({}, child.props, {
        maxSize: child.props.maxSize || Number.MAX_VALUE,
        orientation: this.props.orientation,
        minSize: child.props.minSize || 1,
        events: this.events,
        flex: flexData.flex,
        ref: flexData.ref,
        index
      });
      return import_react2.default.cloneElement(child, newProps);
    });
    return import_react2.default.createElement("div", _extends({}, getDataProps(this.props), {
      style: this.props.style,
      className,
      ref: this.ref
    }), this.children);
  }
};
_defineProperty(ReflexContainer, "propTypes", {
  windowResizeAware: import_prop_types2.default.bool,
  orientation: import_prop_types2.default.oneOf(["horizontal", "vertical"]),
  maxRecDepth: import_prop_types2.default.number,
  className: import_prop_types2.default.string,
  style: import_prop_types2.default.object
});
_defineProperty(ReflexContainer, "defaultProps", {
  orientation: "horizontal",
  windowResizeAware: false,
  maxRecDepth: 100,
  className: "",
  style: {}
});

// ../../node_modules/react-reflex/dist/es/ReflexElement.js
init_extends();

// ../../node_modules/react-reflex/dist/es/ReflexHandle.js
init_extends();
var import_prop_types3 = __toESM(require_prop_types());
var import_react3 = __toESM(require_react());
var ReflexHandle = class extends import_react3.default.Component {
  static isA(element) {
    if (!element) {
      return false;
    }
    return true ? element.type === import_react3.default.createElement(ReflexHandle, null).type : element.type === ReflexHandle;
  }
  constructor(props) {
    super(props);
    _defineProperty(this, "ref", import_react3.default.createRef());
    _defineProperty(this, "onMouseMove", (event) => {
      if (this.state.active) {
        const domElement = this.ref.current;
        this.props.events.emit("resize", {
          index: this.props.index,
          domElement,
          event
        });
        if (this.props.onResize) {
          this.props.onResize({
            component: this,
            domElement
          });
        }
        event.stopPropagation();
        event.preventDefault();
      }
    });
    _defineProperty(this, "onMouseDown", (event) => {
      this.setState({
        active: true
      });
      if (this.props.onStartResize) {
        if (this.props.onStartResize({
          domElement: this.ref.current,
          component: this
        })) {
          return;
        }
      }
      this.props.events.emit("startResize", {
        index: this.props.index,
        event
      });
    });
    _defineProperty(this, "onMouseUp", (event) => {
      if (this.state.active) {
        this.setState({
          active: false
        });
        if (this.props.onStopResize) {
          this.props.onStopResize({
            domElement: this.ref.current,
            component: this
          });
        }
        this.props.events.emit("stopResize", {
          index: this.props.index,
          event
        });
      }
    });
    this.state = {
      active: false
    };
    this.document = props.document;
  }
  componentDidMount() {
    if (!this.document) {
      return;
    }
    this.document.addEventListener("touchend", this.onMouseUp);
    this.document.addEventListener("mouseup", this.onMouseUp);
    this.document.addEventListener("mousemove", this.onMouseMove, {
      passive: false
    });
    this.document.addEventListener("touchmove", this.onMouseMove, {
      passive: false
    });
  }
  componentWillUnmount() {
    if (!this.document) {
      return;
    }
    this.document.removeEventListener("mouseup", this.onMouseUp);
    this.document.removeEventListener("touchend", this.onMouseUp);
    this.document.removeEventListener("mousemove", this.onMouseMove);
    this.document.removeEventListener("touchmove", this.onMouseMove);
    if (this.state.active) {
      this.props.events.emit("stopResize", {
        index: this.props.index,
        event: null
      });
    }
  }
  render() {
    const className = [...this.props.className.split(" "), this.state.active ? "active" : "", "reflex-handle"].join(" ").trim();
    return import_react3.default.createElement("div", _extends({}, getDataProps(this.props), {
      onTouchStart: this.onMouseDown,
      onMouseDown: this.onMouseDown,
      style: this.props.style,
      className,
      id: this.props.id,
      ref: this.ref
    }), this.props.children);
  }
};
_defineProperty(ReflexHandle, "propTypes", {
  children: import_prop_types3.default.oneOfType([import_prop_types3.default.arrayOf(import_prop_types3.default.node), import_prop_types3.default.node]),
  onStartResize: import_prop_types3.default.func,
  onStopResize: import_prop_types3.default.func,
  className: import_prop_types3.default.string,
  propagate: import_prop_types3.default.bool,
  onResize: import_prop_types3.default.func,
  style: import_prop_types3.default.object
});
_defineProperty(ReflexHandle, "defaultProps", {
  document: typeof document === "undefined" ? null : document,
  onStartResize: null,
  onStopResize: null,
  propagate: false,
  onResize: null,
  className: "",
  style: {}
});

// ../../node_modules/react-reflex/dist/es/ReflexElement.js
var import_lodash = __toESM(require_lodash());

// ../../node_modules/react-measure/dist/index.esm.js
init_extends();
init_objectWithoutPropertiesLoose();
var import_react4 = __toESM(require_react());
var import_prop_types4 = __toESM(require_prop_types());
var types = ["client", "offset", "scroll", "bounds", "margin"];
function getTypes(props) {
  var allowedTypes = [];
  types.forEach(function(type) {
    if (props[type]) {
      allowedTypes.push(type);
    }
  });
  return allowedTypes;
}
function getContentRect(node, types2) {
  var calculations = {};
  if (types2.indexOf("client") > -1) {
    calculations.client = {
      top: node.clientTop,
      left: node.clientLeft,
      width: node.clientWidth,
      height: node.clientHeight
    };
  }
  if (types2.indexOf("offset") > -1) {
    calculations.offset = {
      top: node.offsetTop,
      left: node.offsetLeft,
      width: node.offsetWidth,
      height: node.offsetHeight
    };
  }
  if (types2.indexOf("scroll") > -1) {
    calculations.scroll = {
      top: node.scrollTop,
      left: node.scrollLeft,
      width: node.scrollWidth,
      height: node.scrollHeight
    };
  }
  if (types2.indexOf("bounds") > -1) {
    var rect = node.getBoundingClientRect();
    calculations.bounds = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }
  if (types2.indexOf("margin") > -1) {
    var styles = getComputedStyle(node);
    calculations.margin = {
      top: styles ? parseInt(styles.marginTop) : 0,
      right: styles ? parseInt(styles.marginRight) : 0,
      bottom: styles ? parseInt(styles.marginBottom) : 0,
      left: styles ? parseInt(styles.marginLeft) : 0
    };
  }
  return calculations;
}
function getWindowOf(target) {
  var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
  return ownerGlobal || window;
}
function withContentRect(types2) {
  return function(WrappedComponent) {
    var _class, _temp;
    return _temp = _class = function(_Component) {
      _inheritsLoose(WithContentRect, _Component);
      function WithContentRect() {
        var _this;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        _this = _Component.call.apply(_Component, [this].concat(args)) || this;
        _this.state = {
          contentRect: {
            entry: {},
            client: {},
            offset: {},
            scroll: {},
            bounds: {},
            margin: {}
          }
        };
        _this._animationFrameID = null;
        _this._resizeObserver = null;
        _this._node = null;
        _this._window = null;
        _this.measure = function(entries) {
          var contentRect = getContentRect(_this._node, types2 || getTypes(_this.props));
          if (entries) {
            contentRect.entry = entries[0].contentRect;
          }
          _this._animationFrameID = _this._window.requestAnimationFrame(function() {
            if (_this._resizeObserver !== null) {
              _this.setState({
                contentRect
              });
              if (typeof _this.props.onResize === "function") {
                _this.props.onResize(contentRect);
              }
            }
          });
        };
        _this._handleRef = function(node) {
          if (_this._resizeObserver !== null && _this._node !== null) {
            _this._resizeObserver.unobserve(_this._node);
          }
          _this._node = node;
          _this._window = getWindowOf(_this._node);
          var innerRef = _this.props.innerRef;
          if (innerRef) {
            if (typeof innerRef === "function") {
              innerRef(_this._node);
            } else {
              innerRef.current = _this._node;
            }
          }
          if (_this._resizeObserver !== null && _this._node !== null) {
            _this._resizeObserver.observe(_this._node);
          }
        };
        return _this;
      }
      var _proto = WithContentRect.prototype;
      _proto.componentDidMount = function componentDidMount() {
        this._resizeObserver = this._window !== null && this._window.ResizeObserver ? new this._window.ResizeObserver(this.measure) : new ResizeObserver_es_default(this.measure);
        if (this._node !== null) {
          this._resizeObserver.observe(this._node);
          if (typeof this.props.onResize === "function") {
            this.props.onResize(getContentRect(this._node, types2 || getTypes(this.props)));
          }
        }
      };
      _proto.componentWillUnmount = function componentWillUnmount() {
        if (this._window !== null) {
          this._window.cancelAnimationFrame(this._animationFrameID);
        }
        if (this._resizeObserver !== null) {
          this._resizeObserver.disconnect();
          this._resizeObserver = null;
        }
      };
      _proto.render = function render() {
        var _this$props = this.props, innerRef = _this$props.innerRef, onResize = _this$props.onResize, props = _objectWithoutPropertiesLoose(_this$props, ["innerRef", "onResize"]);
        return (0, import_react4.createElement)(WrappedComponent, _extends({}, props, {
          measureRef: this._handleRef,
          measure: this.measure,
          contentRect: this.state.contentRect
        }));
      };
      return WithContentRect;
    }(import_react4.Component), _class.propTypes = {
      client: import_prop_types4.default.bool,
      offset: import_prop_types4.default.bool,
      scroll: import_prop_types4.default.bool,
      bounds: import_prop_types4.default.bool,
      margin: import_prop_types4.default.bool,
      innerRef: import_prop_types4.default.oneOfType([import_prop_types4.default.object, import_prop_types4.default.func]),
      onResize: import_prop_types4.default.func
    }, _temp;
  };
}
var Measure = withContentRect()(function(_ref) {
  var measure = _ref.measure, measureRef = _ref.measureRef, contentRect = _ref.contentRect, children = _ref.children;
  return children({
    measure,
    measureRef,
    contentRect
  });
});
Measure.displayName = "Measure";
Measure.propTypes.children = import_prop_types4.default.func;
var index_esm_default = Measure;

// ../../node_modules/react-reflex/dist/es/ReflexElement.js
var import_prop_types5 = __toESM(require_prop_types());
var import_react5 = __toESM(require_react());
var toArray = (obj) => {
  return obj ? Array.isArray(obj) ? obj : [obj] : [];
};
var SizeAwareReflexElement = class extends import_react5.default.Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "onResize", (rect) => {
      const {
        resizeHeight,
        resizeWidth
      } = this.props;
      const {
        height,
        width
      } = rect.bounds;
      this.setDimensions(_objectSpread({}, resizeHeight && {
        height
      }, resizeWidth && {
        width
      }));
    });
    this.setDimensions = (0, import_lodash.default)((dimensions) => {
      this.setState(dimensions);
    }, this.props.propagateDimensionsRate / 1e3);
    this.state = {
      height: "100%",
      width: "100%"
    };
  }
  renderChildren() {
    const {
      propagateDimensions
    } = this.props;
    const validChildren = toArray(this.props.children).filter((child) => {
      return !!child;
    });
    return import_react5.default.Children.map(validChildren, (child) => {
      if (this.props.withHandle || ReflexHandle.isA(child)) {
        return import_react5.default.cloneElement(child, _objectSpread({
          dimensions: propagateDimensions && this.state
        }, child.props, {
          index: this.props.index - 1,
          events: this.props.events
        }));
      }
      if (propagateDimensions) {
        return import_react5.default.cloneElement(child, _objectSpread({}, child.props, {
          dimensions: this.state
        }));
      }
      return child;
    });
  }
  render() {
    return import_react5.default.createElement(index_esm_default, {
      bounds: true,
      onResize: this.onResize
    }, ({
      measureRef
    }) => {
      return import_react5.default.createElement("div", {
        ref: measureRef,
        className: "reflex-size-aware"
      }, import_react5.default.createElement("div", {
        style: this.state
      }, this.renderChildren()));
    });
  }
};
var ReflexElement = class extends import_react5.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      size: props.size
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.size !== prevState.size) {
      return _objectSpread({}, prevState, {
        size: nextProps.size
      });
    }
    return null;
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.size !== this.state.size) {
      const directions = toArray(this.props.direction);
      for (let direction of directions) {
        await this.props.events.emit("element.size", {
          index: this.props.index,
          size: this.props.size,
          direction
        });
      }
    }
  }
  renderChildren() {
    const validChildren = toArray(this.props.children).filter((child) => {
      return !!child;
    });
    return import_react5.default.Children.map(validChildren, (child) => {
      if (this.props.withHandle || ReflexHandle.isA(child)) {
        return import_react5.default.cloneElement(child, _objectSpread({}, child.props, {
          index: this.props.index - 1,
          events: this.props.events
        }));
      }
      return child;
    });
  }
  render() {
    const className = [...this.props.className.split(" "), this.props.orientation, "reflex-element"].join(" ").trim();
    const style = _objectSpread({}, this.props.style, {
      flexGrow: this.props.flex,
      flexShrink: 1,
      flexBasis: "0%"
    });
    return import_react5.default.createElement("div", _extends({}, getDataProps(this.props), {
      ref: this.props.innerRef,
      className,
      style
    }), this.props.propagateDimensions ? import_react5.default.createElement(SizeAwareReflexElement, this.props) : this.renderChildren());
  }
};
_defineProperty(ReflexElement, "propTypes", {
  propagateDimensions: import_prop_types5.default.bool,
  resizeHeight: import_prop_types5.default.bool,
  resizeWidth: import_prop_types5.default.bool,
  className: import_prop_types5.default.string,
  size: import_prop_types5.default.number
});
_defineProperty(ReflexElement, "defaultProps", {
  propagateDimensionsRate: 100,
  propagateDimensions: false,
  resizeHeight: true,
  resizeWidth: true,
  direction: [1],
  className: ""
});
var ReflexElement_default = import_react5.default.forwardRef((props, ref) => {
  return import_react5.default.createElement(ReflexElement, _extends({
    innerRef: ref
  }, props));
});
export {
  ReflexContainer,
  ReflexElement_default as ReflexElement,
  ReflexHandle,
  ReflexSplitter
};
//# sourceMappingURL=react-reflex.js.map
