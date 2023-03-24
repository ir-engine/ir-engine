import {
  ResizeObserver_es_default
} from "./chunk-VYA6RSBS.js";
import {
  require_debounce
} from "./chunk-JGYLCJBX.js";
import {
  KeyCode_default,
  canUseDom,
  useEvent,
  useLayoutEffect_default,
  useMergedState,
  useSafeState,
  warning,
  warning_default
} from "./chunk-IBJKFKWG.js";
import {
  _objectWithoutProperties,
  _slicedToArray
} from "./chunk-JZYXS4PR.js";
import {
  _objectSpread2
} from "./chunk-E3DKBAGC.js";
import "./chunk-R6B3NM7Z.js";
import {
  require_es5
} from "./chunk-NNDZTC3B.js";
import {
  _getPrototypeOf,
  _inherits,
  _possibleConstructorReturn
} from "./chunk-W27EAKHZ.js";
import "./chunk-MXYNQK7U.js";
import {
  _defineProperty
} from "./chunk-NW535ZXL.js";
import {
  _classCallCheck
} from "./chunk-32SQVTLS.js";
import {
  require_classnames
} from "./chunk-KX4TENJ5.js";
import {
  _toConsumableArray
} from "./chunk-PR4QTJVS.js";
import "./chunk-2YGCHIEQ.js";
import "./chunk-5MV6YXQN.js";
import {
  _createClass
} from "./chunk-5EFX6PPG.js";
import {
  _typeof
} from "./chunk-2WLBNMVK.js";
import {
  _assertThisInitialized
} from "./chunk-NTFZ534X.js";
import "./chunk-HXG77NMB.js";
import {
  require_shallowequal
} from "./chunk-ZB65E5F4.js";
import "./chunk-MBQSVJUP.js";
import {
  _extends,
  init_extends
} from "./chunk-ZEIPKT2T.js";
import {
  require_react_dom
} from "./chunk-LKNG5Z43.js";
import "./chunk-25FF4RY5.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __commonJS,
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/rc-util/node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "../../node_modules/rc-util/node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element2 = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment4 = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal2 = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment2(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo2(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element2;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment4;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal2;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment2;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo2;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// ../../node_modules/rc-util/node_modules/react-is/index.js
var require_react_is = __commonJS({
  "../../node_modules/rc-util/node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// ../../node_modules/rc-new-window/lib/BrowserPopupWindow.js
var require_BrowserPopupWindow = __commonJS({
  "../../node_modules/rc-new-window/lib/BrowserPopupWindow.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.popupWindowBorder = exports.popupSupported = exports.isSafari = exports.gerWindowBorder = void 0;
    var bowser_1 = __importDefault(require_es5());
    var browser2 = typeof window === "object" ? bowser_1.default.getParser(window.navigator.userAgent) : null;
    function gerWindowBorder2() {
      switch (browser2 === null || browser2 === void 0 ? void 0 : browser2.getOSName(true)) {
        case "windows": {
          let result;
          switch (browser2.getBrowserName(true)) {
            case "firefox":
              result = [68, 8, 8];
              break;
            case "microsoft edge":
              result = [62, 8, 8];
              break;
            default:
              result = [60, 8, 8];
          }
          if (window.devicePixelRatio > 1) {
            result[0] -= 2;
            result[1] -= 1;
            result[2] -= 1;
          }
          return result;
        }
        case "macos": {
          switch (browser2.getBrowserName(true)) {
            case "safari":
              return [22, 0, 0];
            case "firefox":
              return [59, 0, 0];
            default:
              return [51, 0, 0];
          }
        }
      }
      return [60, 8, 8];
    }
    exports.gerWindowBorder = gerWindowBorder2;
    exports.isSafari = (browser2 === null || browser2 === void 0 ? void 0 : browser2.getBrowserName(true)) === "safari";
    exports.popupSupported = (browser2 === null || browser2 === void 0 ? void 0 : browser2.getPlatformType()) === "desktop";
    exports.popupWindowBorder = gerWindowBorder2();
  }
});

// ../../node_modules/rc-new-window/lib/ScreenPosition.js
var require_ScreenPosition = __commonJS({
  "../../node_modules/rc-new-window/lib/ScreenPosition.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapWindowToElement = exports.mapElementToScreenRect = exports.estimateWindowBorder = exports.estimateBrowserZoom = void 0;
    var BrowserPopupWindow_1 = require_BrowserPopupWindow();
    function estimateBrowserZoom(_window) {
      let [topBorder, sideBorder, bottomBorder] = BrowserPopupWindow_1.gerWindowBorder();
      if (_window.outerWidth === _window.screen.availWidth) {
        sideBorder = 0;
        bottomBorder = 0;
      }
      let xRatio = (_window.outerWidth - sideBorder * 2) / _window.innerWidth;
      let yRatio = (_window.outerHeight - topBorder - bottomBorder) / _window.innerHeight;
      let zoomRatio = Math.min(yRatio, xRatio);
      if (zoomRatio > 1.8) {
        zoomRatio = Math.round(zoomRatio);
      } else if (zoomRatio > 0.73) {
        zoomRatio = Math.round(zoomRatio * 20) / 20;
      } else {
        zoomRatio = 2 / Math.round(2 / zoomRatio);
      }
      return zoomRatio;
    }
    exports.estimateBrowserZoom = estimateBrowserZoom;
    function estimateWindowBorder(_window, addBorder = false) {
      let zoom = _window ? estimateBrowserZoom(_window) : 1;
      let xBorder = _window.outerWidth - _window.innerWidth * zoom >> 1;
      let yBorder = Math.round(_window.outerHeight - _window.innerHeight * zoom);
      if (xBorder > 32) {
        xBorder = 8;
      } else {
        yBorder -= xBorder;
      }
      return [xBorder, yBorder, zoom];
    }
    exports.estimateWindowBorder = estimateWindowBorder;
    var MapRect2D = class {
      init(x1, y1, w1, h1, x2, y2, w2, h2) {
        this.scaleX = w2 / w1;
        this.scaleY = h2 / h1;
        this.offsetX = x2 - x1 * this.scaleX;
        this.offsetY = y2 - y1 * this.scaleY;
      }
      map(pt) {
        return { x: pt.x * this.scaleX + this.offsetX, y: pt.y * this.scaleY + this.offsetY };
      }
      revertMap(pt) {
        return { x: (pt.x - this.offsetX) / this.scaleX, y: (pt.y - this.offsetY) / this.scaleY };
      }
    };
    function mapElementToScreenRect2(element, rect) {
      if (!element) {
        return null;
      }
      let clientRect = element.getBoundingClientRect();
      let mapRect = new MapRect2D();
      mapRect.init(0, 0, element.offsetWidth, element.offsetHeight, clientRect.x, clientRect.y, clientRect.width, clientRect.height);
      let mappedRect;
      if (rect) {
        let { x, y } = mapRect.map({ x: rect.left, y: rect.top });
        let { x: x2, y: y2 } = mapRect.map({ x: rect.left + rect.width, y: rect.top + rect.height });
        mappedRect = { left: x, top: y, width: x2 - x, height: y2 - y };
      } else {
        mappedRect = {
          left: clientRect.left,
          top: clientRect.top,
          width: clientRect.width,
          height: clientRect.height
        };
      }
      let _document = element.ownerDocument;
      let _window = _document.defaultView;
      if (!_window) {
        return clientRect;
      }
      if (_window.frameElement) {
        return mapElementToScreenRect2(_window.frameElement, mappedRect);
      }
      let [xBorder, yBorder, zoom] = estimateWindowBorder(_window);
      if (zoom !== 1) {
        mappedRect.left *= zoom;
        mappedRect.top *= zoom;
        mappedRect.width *= zoom;
        mappedRect.height *= zoom;
      }
      mappedRect.left += _window.screenX + xBorder;
      mappedRect.top += _window.screenY + yBorder;
      return mappedRect;
    }
    exports.mapElementToScreenRect = mapElementToScreenRect2;
    function mapWindowToElement2(targetElement, fromWindow, fromRect, removeBorder = true) {
      if (!targetElement) {
        return null;
      }
      if (fromWindow) {
        fromRect = {
          left: fromWindow.screenX,
          top: fromWindow.screenY,
          width: fromWindow.outerWidth,
          height: fromWindow.outerHeight
        };
        if (removeBorder) {
          const [topBorder, sideBorder, bottomBorder] = BrowserPopupWindow_1.popupWindowBorder;
          fromRect.left += sideBorder;
          fromRect.top += topBorder;
          fromRect.width -= sideBorder * 2;
          fromRect.height -= topBorder + bottomBorder;
        }
      } else if (!fromRect) {
        return null;
      }
      let _document = targetElement.ownerDocument;
      let _window = _document.defaultView;
      if (!_window) {
        return fromRect;
      }
      if (_window.frameElement) {
        fromRect = mapWindowToElement2(_window.frameElement, null, fromRect);
      } else {
        let [xBorder, yBorder, zoom] = estimateWindowBorder(_window);
        fromRect.left -= _window.screenX + xBorder;
        fromRect.top -= _window.screenY + yBorder;
        if (zoom !== 1) {
          fromRect.left /= zoom;
          fromRect.top /= zoom;
          fromRect.width /= zoom;
          fromRect.height /= zoom;
        }
      }
      let clientRect = targetElement.getBoundingClientRect();
      let mapRect = new MapRect2D();
      mapRect.init(0, 0, targetElement.offsetWidth, targetElement.offsetHeight, clientRect.x, clientRect.y, clientRect.width, clientRect.height);
      let mappedRect;
      let { x, y } = mapRect.revertMap({ x: fromRect.left, y: fromRect.top });
      let { x: x2, y: y2 } = mapRect.revertMap({
        x: fromRect.left + fromRect.width,
        y: fromRect.top + fromRect.height
      });
      mappedRect = { left: x, top: y, width: x2 - x, height: y2 - y };
      return mappedRect;
    }
    exports.mapWindowToElement = mapWindowToElement2;
  }
});

// ../../node_modules/rc-dock/es/DockTabs.js
var import_react37 = __toESM(require_react());

// ../../node_modules/rc-dock/es/DockData.js
var import_react = __toESM(require_react());
var defaultGroup = {
  floatable: true,
  maximizable: true
};
var placeHolderStyle = "place-holder";
var maximePlaceHolderId = "-maximized-placeholder-";
var placeHolderGroup = {
  floatable: false
};
var DockContextType = import_react.default.createContext(null);
var DockContextProvider = DockContextType.Provider;
var DockContextConsumer = DockContextType.Consumer;

// ../../node_modules/rc-tabs/es/Tabs.js
init_extends();
var React60 = __toESM(require_react());
var import_react25 = __toESM(require_react());
var import_classnames22 = __toESM(require_classnames());

// ../../node_modules/rc-util/es/Children/toArray.js
var import_react2 = __toESM(require_react());
var import_react_is = __toESM(require_react_is());
function toArray(children) {
  var option = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var ret = [];
  import_react2.default.Children.forEach(children, function(child) {
    if ((child === void 0 || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if ((0, import_react_is.isFragment)(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}

// ../../node_modules/rc-util/es/isMobile.js
var isMobile_default = function() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  var agent = navigator.userAgent || navigator.vendor || window.opera;
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(agent === null || agent === void 0 ? void 0 : agent.substr(0, 4));
};

// ../../node_modules/rc-tabs/es/TabNavList/index.js
init_extends();
var React57 = __toESM(require_react());
var import_react24 = __toESM(require_react());
var import_classnames19 = __toESM(require_classnames());

// ../../node_modules/rc-util/es/raf.js
var raf = function raf2(callback) {
  return +setTimeout(callback, 16);
};
var caf = function caf2(num) {
  return clearTimeout(num);
};
if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
  raf = function raf3(callback) {
    return window.requestAnimationFrame(callback);
  };
  caf = function caf3(handle) {
    return window.cancelAnimationFrame(handle);
  };
}
var rafUUID = 0;
var rafIds = /* @__PURE__ */ new Map();
function cleanup(id) {
  rafIds.delete(id);
}
var wrapperRaf = function wrapperRaf2(callback) {
  var times = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
  rafUUID += 1;
  var id = rafUUID;
  function callRef(leftTimes) {
    if (leftTimes === 0) {
      cleanup(id);
      callback();
    } else {
      var realId = raf(function() {
        callRef(leftTimes - 1);
      });
      rafIds.set(id, realId);
    }
  }
  callRef(times);
  return id;
};
wrapperRaf.cancel = function(id) {
  var realId = rafIds.get(id);
  cleanup(realId);
  return caf(realId);
};
var raf_default = wrapperRaf;

// ../../node_modules/rc-resize-observer/es/index.js
init_extends();
var React8 = __toESM(require_react());

// ../../node_modules/rc-util/es/ref.js
var import_react_is2 = __toESM(require_react_is());

// ../../node_modules/rc-util/es/hooks/useMemo.js
var React3 = __toESM(require_react());
function useMemo(getValue, condition, shouldUpdate) {
  var cacheRef = React3.useRef({});
  if (!("value" in cacheRef.current) || shouldUpdate(cacheRef.current.condition, condition)) {
    cacheRef.current.value = getValue();
    cacheRef.current.condition = condition;
  }
  return cacheRef.current.value;
}

// ../../node_modules/rc-util/es/ref.js
function fillRef(ref, node) {
  if (typeof ref === "function") {
    ref(node);
  } else if (_typeof(ref) === "object" && ref && "current" in ref) {
    ref.current = node;
  }
}
function composeRef() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }
  var refList = refs.filter(function(ref) {
    return ref;
  });
  if (refList.length <= 1) {
    return refList[0];
  }
  return function(node) {
    refs.forEach(function(ref) {
      fillRef(ref, node);
    });
  };
}
function supportRef(nodeOrComponent) {
  var _type$prototype, _nodeOrComponent$prot;
  var type = (0, import_react_is2.isMemo)(nodeOrComponent) ? nodeOrComponent.type.type : nodeOrComponent.type;
  if (typeof type === "function" && !((_type$prototype = type.prototype) !== null && _type$prototype !== void 0 && _type$prototype.render)) {
    return false;
  }
  if (typeof nodeOrComponent === "function" && !((_nodeOrComponent$prot = nodeOrComponent.prototype) !== null && _nodeOrComponent$prot !== void 0 && _nodeOrComponent$prot.render)) {
    return false;
  }
  return true;
}

// ../../node_modules/rc-resize-observer/es/SingleObserver/index.js
var React7 = __toESM(require_react());

// ../../node_modules/rc-util/es/Dom/findDOMNode.js
var import_react3 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
function isDOM(node) {
  return node instanceof HTMLElement || node instanceof SVGElement;
}
function findDOMNode(node) {
  if (isDOM(node)) {
    return node;
  }
  if (node instanceof import_react3.default.Component) {
    return import_react_dom.default.findDOMNode(node);
  }
  return null;
}

// ../../node_modules/rc-resize-observer/es/utils/observerUtil.js
var elementListeners = /* @__PURE__ */ new Map();
function onResize(entities) {
  entities.forEach(function(entity) {
    var _elementListeners$get;
    var target = entity.target;
    (_elementListeners$get = elementListeners.get(target)) === null || _elementListeners$get === void 0 ? void 0 : _elementListeners$get.forEach(function(listener) {
      return listener(target);
    });
  });
}
var resizeObserver = new ResizeObserver_es_default(onResize);
function observe(element, callback) {
  if (!elementListeners.has(element)) {
    elementListeners.set(element, /* @__PURE__ */ new Set());
    resizeObserver.observe(element);
  }
  elementListeners.get(element).add(callback);
}
function unobserve(element, callback) {
  if (elementListeners.has(element)) {
    elementListeners.get(element).delete(callback);
    if (!elementListeners.get(element).size) {
      resizeObserver.unobserve(element);
      elementListeners.delete(element);
    }
  }
}

// ../../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
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

// ../../node_modules/@babel/runtime/helpers/esm/createSuper.js
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

// ../../node_modules/rc-resize-observer/es/SingleObserver/DomWrapper.js
var React5 = __toESM(require_react());
var DomWrapper = function(_React$Component) {
  _inherits(DomWrapper3, _React$Component);
  var _super = _createSuper(DomWrapper3);
  function DomWrapper3() {
    _classCallCheck(this, DomWrapper3);
    return _super.apply(this, arguments);
  }
  _createClass(DomWrapper3, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper3;
}(React5.Component);

// ../../node_modules/rc-resize-observer/es/Collection.js
var React6 = __toESM(require_react());
var CollectionContext = React6.createContext(null);
function Collection(_ref) {
  var children = _ref.children, onBatchResize = _ref.onBatchResize;
  var resizeIdRef = React6.useRef(0);
  var resizeInfosRef = React6.useRef([]);
  var onCollectionResize = React6.useContext(CollectionContext);
  var onResize2 = React6.useCallback(function(size, element, data) {
    resizeIdRef.current += 1;
    var currentId = resizeIdRef.current;
    resizeInfosRef.current.push({
      size,
      element,
      data
    });
    Promise.resolve().then(function() {
      if (currentId === resizeIdRef.current) {
        onBatchResize === null || onBatchResize === void 0 ? void 0 : onBatchResize(resizeInfosRef.current);
        resizeInfosRef.current = [];
      }
    });
    onCollectionResize === null || onCollectionResize === void 0 ? void 0 : onCollectionResize(size, element, data);
  }, [onBatchResize, onCollectionResize]);
  return React6.createElement(CollectionContext.Provider, {
    value: onResize2
  }, children);
}

// ../../node_modules/rc-resize-observer/es/SingleObserver/index.js
function SingleObserver(props, ref) {
  var children = props.children, disabled = props.disabled;
  var elementRef = React7.useRef(null);
  var wrapperRef = React7.useRef(null);
  var onCollectionResize = React7.useContext(CollectionContext);
  var isRenderProps = typeof children === "function";
  var mergedChildren = isRenderProps ? children(elementRef) : children;
  var sizeRef = React7.useRef({
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1
  });
  var canRef = !isRenderProps && React7.isValidElement(mergedChildren) && supportRef(mergedChildren);
  var originRef = canRef ? mergedChildren.ref : null;
  var mergedRef = React7.useMemo(function() {
    return composeRef(originRef, elementRef);
  }, [originRef, elementRef]);
  var getDom = function getDom2() {
    return findDOMNode(elementRef.current) || findDOMNode(wrapperRef.current);
  };
  React7.useImperativeHandle(ref, function() {
    return getDom();
  });
  var propsRef = React7.useRef(props);
  propsRef.current = props;
  var onInternalResize = React7.useCallback(function(target) {
    var _propsRef$current = propsRef.current, onResize2 = _propsRef$current.onResize, data = _propsRef$current.data;
    var _target$getBoundingCl = target.getBoundingClientRect(), width = _target$getBoundingCl.width, height = _target$getBoundingCl.height;
    var offsetWidth = target.offsetWidth, offsetHeight = target.offsetHeight;
    var fixedWidth = Math.floor(width);
    var fixedHeight = Math.floor(height);
    if (sizeRef.current.width !== fixedWidth || sizeRef.current.height !== fixedHeight || sizeRef.current.offsetWidth !== offsetWidth || sizeRef.current.offsetHeight !== offsetHeight) {
      var size = {
        width: fixedWidth,
        height: fixedHeight,
        offsetWidth,
        offsetHeight
      };
      sizeRef.current = size;
      var mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
      var mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;
      var sizeInfo = _objectSpread2(_objectSpread2({}, size), {}, {
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight
      });
      onCollectionResize === null || onCollectionResize === void 0 ? void 0 : onCollectionResize(sizeInfo, target, data);
      if (onResize2) {
        Promise.resolve().then(function() {
          onResize2(sizeInfo, target);
        });
      }
    }
  }, []);
  React7.useEffect(function() {
    var currentElement = getDom();
    if (currentElement && !disabled) {
      observe(currentElement, onInternalResize);
    }
    return function() {
      return unobserve(currentElement, onInternalResize);
    };
  }, [elementRef.current, disabled]);
  return React7.createElement(DomWrapper, {
    ref: wrapperRef
  }, canRef ? React7.cloneElement(mergedChildren, {
    ref: mergedRef
  }) : mergedChildren);
}
var RefSingleObserver = React7.forwardRef(SingleObserver);
if (true) {
  RefSingleObserver.displayName = "SingleObserver";
}
var SingleObserver_default = RefSingleObserver;

// ../../node_modules/rc-resize-observer/es/index.js
var INTERNAL_PREFIX_KEY = "rc-observer-key";
function ResizeObserver(props, ref) {
  var children = props.children;
  var childNodes = typeof children === "function" ? [children] : toArray(children);
  if (true) {
    if (childNodes.length > 1) {
      warning(false, "Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.");
    } else if (childNodes.length === 0) {
      warning(false, "`children` of ResizeObserver is empty. Nothing is in observe.");
    }
  }
  return childNodes.map(function(child, index) {
    var key = (child === null || child === void 0 ? void 0 : child.key) || "".concat(INTERNAL_PREFIX_KEY, "-").concat(index);
    return React8.createElement(SingleObserver_default, _extends({}, props, {
      key,
      ref: index === 0 ? ref : void 0
    }), child);
  });
}
var RefResizeObserver = React8.forwardRef(ResizeObserver);
if (true) {
  RefResizeObserver.displayName = "ResizeObserver";
}
RefResizeObserver.Collection = Collection;
var es_default = RefResizeObserver;

// ../../node_modules/rc-tabs/es/hooks/useRaf.js
var import_react4 = __toESM(require_react());
function useRaf(callback) {
  var rafRef = (0, import_react4.useRef)();
  var removedRef = (0, import_react4.useRef)(false);
  function trigger() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (!removedRef.current) {
      raf_default.cancel(rafRef.current);
      rafRef.current = raf_default(function() {
        callback.apply(void 0, args);
      });
    }
  }
  (0, import_react4.useEffect)(function() {
    removedRef.current = false;
    return function() {
      removedRef.current = true;
      raf_default.cancel(rafRef.current);
    };
  }, []);
  return trigger;
}
function useRafState(defaultState) {
  var batchRef = (0, import_react4.useRef)([]);
  var _useState = (0, import_react4.useState)({}), _useState2 = _slicedToArray(_useState, 2), forceUpdate = _useState2[1];
  var state = (0, import_react4.useRef)(typeof defaultState === "function" ? defaultState() : defaultState);
  var flushUpdate = useRaf(function() {
    var current = state.current;
    batchRef.current.forEach(function(callback) {
      current = callback(current);
    });
    batchRef.current = [];
    state.current = current;
    forceUpdate({});
  });
  function updater(callback) {
    batchRef.current.push(callback);
    flushUpdate();
  }
  return [state.current, updater];
}

// ../../node_modules/rc-tabs/es/TabNavList/TabNode.js
var React9 = __toESM(require_react());
var import_classnames = __toESM(require_classnames());
function TabNode(_ref, ref) {
  var _classNames;
  var prefixCls = _ref.prefixCls, id = _ref.id, active = _ref.active, _ref$tab = _ref.tab, key = _ref$tab.key, tab = _ref$tab.tab, disabled = _ref$tab.disabled, closeIcon = _ref$tab.closeIcon, closable = _ref.closable, renderWrapper = _ref.renderWrapper, removeAriaLabel = _ref.removeAriaLabel, editable = _ref.editable, onClick = _ref.onClick, onRemove = _ref.onRemove, onFocus = _ref.onFocus, style2 = _ref.style;
  var tabPrefix = "".concat(prefixCls, "-tab");
  React9.useEffect(function() {
    return onRemove;
  }, []);
  var removable = editable && closable !== false && !disabled;
  function onInternalClick(e) {
    if (disabled) {
      return;
    }
    onClick(e);
  }
  function onRemoveTab(event) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit("remove", {
      key,
      event
    });
  }
  var node = React9.createElement("div", {
    key,
    ref,
    className: (0, import_classnames.default)(tabPrefix, (_classNames = {}, _defineProperty(_classNames, "".concat(tabPrefix, "-with-remove"), removable), _defineProperty(_classNames, "".concat(tabPrefix, "-active"), active), _defineProperty(_classNames, "".concat(tabPrefix, "-disabled"), disabled), _classNames)),
    style: style2,
    onClick: onInternalClick
  }, React9.createElement("div", {
    role: "tab",
    "aria-selected": active,
    id: id && "".concat(id, "-tab-").concat(key),
    className: "".concat(tabPrefix, "-btn"),
    "aria-controls": id && "".concat(id, "-panel-").concat(key),
    "aria-disabled": disabled,
    tabIndex: disabled ? null : 0,
    onClick: function onClick2(e) {
      e.stopPropagation();
      onInternalClick(e);
    },
    onKeyDown: function onKeyDown(e) {
      if ([KeyCode_default.SPACE, KeyCode_default.ENTER].includes(e.which)) {
        e.preventDefault();
        onInternalClick(e);
      }
    },
    onFocus
  }, tab), removable && React9.createElement("button", {
    type: "button",
    "aria-label": removeAriaLabel || "remove",
    tabIndex: 0,
    className: "".concat(tabPrefix, "-remove"),
    onClick: function onClick2(e) {
      e.stopPropagation();
      onRemoveTab(e);
    }
  }, closeIcon || editable.removeIcon || "×"));
  return renderWrapper ? renderWrapper(node) : node;
}
var TabNode_default = React9.forwardRef(TabNode);

// ../../node_modules/rc-tabs/es/hooks/useOffsets.js
var import_react5 = __toESM(require_react());
var DEFAULT_SIZE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0
};
function useOffsets(tabs, tabSizes, holderScrollWidth) {
  return (0, import_react5.useMemo)(function() {
    var _tabs$;
    var map = /* @__PURE__ */ new Map();
    var lastOffset = tabSizes.get((_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.key) || DEFAULT_SIZE;
    var rightOffset = lastOffset.left + lastOffset.width;
    for (var i = 0; i < tabs.length; i += 1) {
      var key = tabs[i].key;
      var data = tabSizes.get(key);
      if (!data) {
        var _tabs;
        data = tabSizes.get((_tabs = tabs[i - 1]) === null || _tabs === void 0 ? void 0 : _tabs.key) || DEFAULT_SIZE;
      }
      var entity = map.get(key) || _objectSpread2({}, data);
      entity.right = rightOffset - entity.left - entity.width;
      map.set(key, entity);
    }
    return map;
  }, [tabs.map(function(tab) {
    return tab.key;
  }).join("_"), tabSizes, holderScrollWidth]);
}

// ../../node_modules/rc-tabs/es/hooks/useVisibleRange.js
var import_react6 = __toESM(require_react());
var DEFAULT_SIZE2 = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  right: 0
};
function useVisibleRange(tabOffsets, containerSize, tabContentNodeSize, addNodeSize, _ref) {
  var tabs = _ref.tabs, tabPosition = _ref.tabPosition, rtl = _ref.rtl;
  var unit;
  var position;
  var transformSize;
  if (["top", "bottom"].includes(tabPosition)) {
    unit = "width";
    position = rtl ? "right" : "left";
    transformSize = Math.abs(containerSize.left);
  } else {
    unit = "height";
    position = "top";
    transformSize = -containerSize.top;
  }
  var basicSize = containerSize[unit];
  var tabContentSize = tabContentNodeSize[unit];
  var addSize = addNodeSize[unit];
  var mergedBasicSize = basicSize;
  if (tabContentSize + addSize > basicSize && tabContentSize < basicSize) {
    mergedBasicSize = basicSize - addSize;
  }
  return (0, import_react6.useMemo)(function() {
    if (!tabs.length) {
      return [0, 0];
    }
    var len = tabs.length;
    var endIndex = len;
    for (var i = 0; i < len; i += 1) {
      var offset2 = tabOffsets.get(tabs[i].key) || DEFAULT_SIZE2;
      if (offset2[position] + offset2[unit] > transformSize + mergedBasicSize) {
        endIndex = i - 1;
        break;
      }
    }
    var startIndex = 0;
    for (var _i = len - 1; _i >= 0; _i -= 1) {
      var _offset = tabOffsets.get(tabs[_i].key) || DEFAULT_SIZE2;
      if (_offset[position] < transformSize) {
        startIndex = _i + 1;
        break;
      }
    }
    return [startIndex, endIndex];
  }, [tabOffsets, transformSize, mergedBasicSize, tabPosition, tabs.map(function(tab) {
    return tab.key;
  }).join("_"), rtl]);
}

// ../../node_modules/rc-tabs/es/TabNavList/OperationNode.js
var React53 = __toESM(require_react());
var import_classnames18 = __toESM(require_classnames());
var import_react20 = __toESM(require_react());

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/Menu.js
init_extends();
var React47 = __toESM(require_react());
var import_classnames14 = __toESM(require_classnames());
var import_shallowequal2 = __toESM(require_shallowequal());

// ../../node_modules/rc-overflow/es/Overflow.js
init_extends();
var React13 = __toESM(require_react());
var import_react7 = __toESM(require_react());
var import_classnames4 = __toESM(require_classnames());

// ../../node_modules/rc-overflow/es/Item.js
init_extends();
var React10 = __toESM(require_react());
var import_classnames2 = __toESM(require_classnames());
var _excluded = ["prefixCls", "invalidate", "item", "renderItem", "responsive", "responsiveDisabled", "registerSize", "itemKey", "className", "style", "children", "display", "order", "component"];
var UNDEFINED = void 0;
function InternalItem(props, ref) {
  var prefixCls = props.prefixCls, invalidate = props.invalidate, item = props.item, renderItem = props.renderItem, responsive = props.responsive, responsiveDisabled = props.responsiveDisabled, registerSize = props.registerSize, itemKey = props.itemKey, className = props.className, style2 = props.style, children = props.children, display = props.display, order = props.order, _props$component = props.component, Component7 = _props$component === void 0 ? "div" : _props$component, restProps = _objectWithoutProperties(props, _excluded);
  var mergedHidden = responsive && !display;
  function internalRegisterSize(width) {
    registerSize(itemKey, width);
  }
  React10.useEffect(function() {
    return function() {
      internalRegisterSize(null);
    };
  }, []);
  var childNode = renderItem && item !== UNDEFINED ? renderItem(item) : children;
  var overflowStyle;
  if (!invalidate) {
    overflowStyle = {
      opacity: mergedHidden ? 0 : 1,
      height: mergedHidden ? 0 : UNDEFINED,
      overflowY: mergedHidden ? "hidden" : UNDEFINED,
      order: responsive ? order : UNDEFINED,
      pointerEvents: mergedHidden ? "none" : UNDEFINED,
      position: mergedHidden ? "absolute" : UNDEFINED
    };
  }
  var overflowProps = {};
  if (mergedHidden) {
    overflowProps["aria-hidden"] = true;
  }
  var itemNode = React10.createElement(Component7, _extends({
    className: (0, import_classnames2.default)(!invalidate && prefixCls, className),
    style: _objectSpread2(_objectSpread2({}, overflowStyle), style2)
  }, overflowProps, restProps, {
    ref
  }), childNode);
  if (responsive) {
    itemNode = React10.createElement(es_default, {
      onResize: function onResize2(_ref) {
        var offsetWidth = _ref.offsetWidth;
        internalRegisterSize(offsetWidth);
      },
      disabled: responsiveDisabled
    }, itemNode);
  }
  return itemNode;
}
var Item = React10.forwardRef(InternalItem);
Item.displayName = "Item";
var Item_default = Item;

// ../../node_modules/rc-overflow/es/hooks/useEffectState.js
var React11 = __toESM(require_react());
var import_react_dom2 = __toESM(require_react_dom());

// ../../node_modules/rc-overflow/es/hooks/channelUpdate.js
function channelUpdate(callback) {
  if (typeof MessageChannel === "undefined") {
    raf_default(callback);
  } else {
    var channel = new MessageChannel();
    channel.port1.onmessage = function() {
      return callback();
    };
    channel.port2.postMessage(void 0);
  }
}

// ../../node_modules/rc-overflow/es/hooks/useEffectState.js
function useBatcher() {
  var updateFuncRef = React11.useRef(null);
  var notifyEffectUpdate = function notifyEffectUpdate2(callback) {
    if (!updateFuncRef.current) {
      updateFuncRef.current = [];
      channelUpdate(function() {
        (0, import_react_dom2.unstable_batchedUpdates)(function() {
          updateFuncRef.current.forEach(function(fn) {
            fn();
          });
          updateFuncRef.current = null;
        });
      });
    }
    updateFuncRef.current.push(callback);
  };
  return notifyEffectUpdate;
}
function useEffectState(notifyEffectUpdate, defaultValue) {
  var _React$useState = React11.useState(defaultValue), _React$useState2 = _slicedToArray(_React$useState, 2), stateValue = _React$useState2[0], setStateValue = _React$useState2[1];
  var setEffectVal = useEvent(function(nextValue) {
    notifyEffectUpdate(function() {
      setStateValue(nextValue);
    });
  });
  return [stateValue, setEffectVal];
}

// ../../node_modules/rc-overflow/es/RawItem.js
init_extends();
var React12 = __toESM(require_react());
var import_classnames3 = __toESM(require_classnames());
var _excluded2 = ["component"];
var _excluded22 = ["className"];
var _excluded3 = ["className"];
var InternalRawItem = function InternalRawItem2(props, ref) {
  var context = React12.useContext(OverflowContext);
  if (!context) {
    var _props$component = props.component, Component7 = _props$component === void 0 ? "div" : _props$component, _restProps = _objectWithoutProperties(props, _excluded2);
    return React12.createElement(Component7, _extends({}, _restProps, {
      ref
    }));
  }
  var contextClassName = context.className, restContext = _objectWithoutProperties(context, _excluded22);
  var className = props.className, restProps = _objectWithoutProperties(props, _excluded3);
  return React12.createElement(OverflowContext.Provider, {
    value: null
  }, React12.createElement(Item_default, _extends({
    ref,
    className: (0, import_classnames3.default)(contextClassName, className)
  }, restContext, restProps)));
};
var RawItem = React12.forwardRef(InternalRawItem);
RawItem.displayName = "RawItem";
var RawItem_default = RawItem;

// ../../node_modules/rc-overflow/es/Overflow.js
var _excluded4 = ["prefixCls", "data", "renderItem", "renderRawItem", "itemKey", "itemWidth", "ssr", "style", "className", "maxCount", "renderRest", "renderRawRest", "suffix", "component", "itemComponent", "onVisibleChange"];
var OverflowContext = React13.createContext(null);
var RESPONSIVE = "responsive";
var INVALIDATE = "invalidate";
function defaultRenderRest(omittedItems) {
  return "+ ".concat(omittedItems.length, " ...");
}
function Overflow(props, ref) {
  var _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-overflow" : _props$prefixCls, _props$data = props.data, data = _props$data === void 0 ? [] : _props$data, renderItem = props.renderItem, renderRawItem = props.renderRawItem, itemKey = props.itemKey, _props$itemWidth = props.itemWidth, itemWidth = _props$itemWidth === void 0 ? 10 : _props$itemWidth, ssr = props.ssr, style2 = props.style, className = props.className, maxCount = props.maxCount, renderRest = props.renderRest, renderRawRest = props.renderRawRest, suffix = props.suffix, _props$component = props.component, Component7 = _props$component === void 0 ? "div" : _props$component, itemComponent = props.itemComponent, onVisibleChange = props.onVisibleChange, restProps = _objectWithoutProperties(props, _excluded4);
  var fullySSR = ssr === "full";
  var notifyEffectUpdate = useBatcher();
  var _useEffectState = useEffectState(notifyEffectUpdate, null), _useEffectState2 = _slicedToArray(_useEffectState, 2), containerWidth = _useEffectState2[0], setContainerWidth = _useEffectState2[1];
  var mergedContainerWidth = containerWidth || 0;
  var _useEffectState3 = useEffectState(notifyEffectUpdate, /* @__PURE__ */ new Map()), _useEffectState4 = _slicedToArray(_useEffectState3, 2), itemWidths = _useEffectState4[0], setItemWidths = _useEffectState4[1];
  var _useEffectState5 = useEffectState(notifyEffectUpdate, 0), _useEffectState6 = _slicedToArray(_useEffectState5, 2), prevRestWidth = _useEffectState6[0], setPrevRestWidth = _useEffectState6[1];
  var _useEffectState7 = useEffectState(notifyEffectUpdate, 0), _useEffectState8 = _slicedToArray(_useEffectState7, 2), restWidth = _useEffectState8[0], setRestWidth = _useEffectState8[1];
  var _useEffectState9 = useEffectState(notifyEffectUpdate, 0), _useEffectState10 = _slicedToArray(_useEffectState9, 2), suffixWidth = _useEffectState10[0], setSuffixWidth = _useEffectState10[1];
  var _useState = (0, import_react7.useState)(null), _useState2 = _slicedToArray(_useState, 2), suffixFixedStart = _useState2[0], setSuffixFixedStart = _useState2[1];
  var _useState3 = (0, import_react7.useState)(null), _useState4 = _slicedToArray(_useState3, 2), displayCount = _useState4[0], setDisplayCount = _useState4[1];
  var mergedDisplayCount = React13.useMemo(function() {
    if (displayCount === null && fullySSR) {
      return Number.MAX_SAFE_INTEGER;
    }
    return displayCount || 0;
  }, [displayCount, containerWidth]);
  var _useState5 = (0, import_react7.useState)(false), _useState6 = _slicedToArray(_useState5, 2), restReady = _useState6[0], setRestReady = _useState6[1];
  var itemPrefixCls = "".concat(prefixCls, "-item");
  var mergedRestWidth = Math.max(prevRestWidth, restWidth);
  var isResponsive = maxCount === RESPONSIVE;
  var shouldResponsive = data.length && isResponsive;
  var invalidate = maxCount === INVALIDATE;
  var showRest = shouldResponsive || typeof maxCount === "number" && data.length > maxCount;
  var mergedData = (0, import_react7.useMemo)(function() {
    var items = data;
    if (shouldResponsive) {
      if (containerWidth === null && fullySSR) {
        items = data;
      } else {
        items = data.slice(0, Math.min(data.length, mergedContainerWidth / itemWidth));
      }
    } else if (typeof maxCount === "number") {
      items = data.slice(0, maxCount);
    }
    return items;
  }, [data, itemWidth, containerWidth, maxCount, shouldResponsive]);
  var omittedItems = (0, import_react7.useMemo)(function() {
    if (shouldResponsive) {
      return data.slice(mergedDisplayCount + 1);
    }
    return data.slice(mergedData.length);
  }, [data, mergedData, shouldResponsive, mergedDisplayCount]);
  var getKey = (0, import_react7.useCallback)(function(item, index) {
    var _ref;
    if (typeof itemKey === "function") {
      return itemKey(item);
    }
    return (_ref = itemKey && (item === null || item === void 0 ? void 0 : item[itemKey])) !== null && _ref !== void 0 ? _ref : index;
  }, [itemKey]);
  var mergedRenderItem = (0, import_react7.useCallback)(renderItem || function(item) {
    return item;
  }, [renderItem]);
  function updateDisplayCount(count, suffixFixedStartVal, notReady) {
    if (displayCount === count && (suffixFixedStartVal === void 0 || suffixFixedStartVal === suffixFixedStart)) {
      return;
    }
    setDisplayCount(count);
    if (!notReady) {
      setRestReady(count < data.length - 1);
      onVisibleChange === null || onVisibleChange === void 0 ? void 0 : onVisibleChange(count);
    }
    if (suffixFixedStartVal !== void 0) {
      setSuffixFixedStart(suffixFixedStartVal);
    }
  }
  function onOverflowResize(_, element) {
    setContainerWidth(element.clientWidth);
  }
  function registerSize(key, width) {
    setItemWidths(function(origin) {
      var clone3 = new Map(origin);
      if (width === null) {
        clone3.delete(key);
      } else {
        clone3.set(key, width);
      }
      return clone3;
    });
  }
  function registerOverflowSize(_, width) {
    setRestWidth(width);
    setPrevRestWidth(restWidth);
  }
  function registerSuffixSize(_, width) {
    setSuffixWidth(width);
  }
  function getItemWidth(index) {
    return itemWidths.get(getKey(mergedData[index], index));
  }
  useLayoutEffect_default(function() {
    if (mergedContainerWidth && typeof mergedRestWidth === "number" && mergedData) {
      var totalWidth = suffixWidth;
      var len = mergedData.length;
      var lastIndex = len - 1;
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }
      for (var i = 0; i < len; i += 1) {
        var currentItemWidth = getItemWidth(i);
        if (fullySSR) {
          currentItemWidth = currentItemWidth || 0;
        }
        if (currentItemWidth === void 0) {
          updateDisplayCount(i - 1, void 0, true);
          break;
        }
        totalWidth += currentItemWidth;
        if (
          // Only one means `totalWidth` is the final width
          lastIndex === 0 && totalWidth <= mergedContainerWidth || // Last two width will be the final width
          i === lastIndex - 1 && totalWidth + getItemWidth(lastIndex) <= mergedContainerWidth
        ) {
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth > mergedContainerWidth) {
          updateDisplayCount(i - 1, totalWidth - currentItemWidth - suffixWidth + restWidth);
          break;
        }
      }
      if (suffix && getItemWidth(0) + suffixWidth > mergedContainerWidth) {
        setSuffixFixedStart(null);
      }
    }
  }, [mergedContainerWidth, itemWidths, restWidth, suffixWidth, getKey, mergedData]);
  var displayRest = restReady && !!omittedItems.length;
  var suffixStyle = {};
  if (suffixFixedStart !== null && shouldResponsive) {
    suffixStyle = {
      position: "absolute",
      left: suffixFixedStart,
      top: 0
    };
  }
  var itemSharedProps = {
    prefixCls: itemPrefixCls,
    responsive: shouldResponsive,
    component: itemComponent,
    invalidate
  };
  var internalRenderItemNode = renderRawItem ? function(item, index) {
    var key = getKey(item, index);
    return React13.createElement(OverflowContext.Provider, {
      key,
      value: _objectSpread2(_objectSpread2({}, itemSharedProps), {}, {
        order: index,
        item,
        itemKey: key,
        registerSize,
        display: index <= mergedDisplayCount
      })
    }, renderRawItem(item, index));
  } : function(item, index) {
    var key = getKey(item, index);
    return React13.createElement(Item_default, _extends({}, itemSharedProps, {
      order: index,
      key,
      item,
      renderItem: mergedRenderItem,
      itemKey: key,
      registerSize,
      display: index <= mergedDisplayCount
    }));
  };
  var restNode;
  var restContextProps = {
    order: displayRest ? mergedDisplayCount : Number.MAX_SAFE_INTEGER,
    className: "".concat(itemPrefixCls, "-rest"),
    registerSize: registerOverflowSize,
    display: displayRest
  };
  if (!renderRawRest) {
    var mergedRenderRest = renderRest || defaultRenderRest;
    restNode = React13.createElement(Item_default, _extends({}, itemSharedProps, restContextProps), typeof mergedRenderRest === "function" ? mergedRenderRest(omittedItems) : mergedRenderRest);
  } else if (renderRawRest) {
    restNode = React13.createElement(OverflowContext.Provider, {
      value: _objectSpread2(_objectSpread2({}, itemSharedProps), restContextProps)
    }, renderRawRest(omittedItems));
  }
  var overflowNode = React13.createElement(Component7, _extends({
    className: (0, import_classnames4.default)(!invalidate && prefixCls, className),
    style: style2,
    ref
  }, restProps), mergedData.map(internalRenderItemNode), showRest ? restNode : null, suffix && React13.createElement(Item_default, _extends({}, itemSharedProps, {
    responsive: isResponsive,
    responsiveDisabled: !shouldResponsive,
    order: mergedDisplayCount,
    className: "".concat(itemPrefixCls, "-suffix"),
    registerSize: registerSuffixSize,
    display: true,
    style: suffixStyle
  }), suffix));
  if (isResponsive) {
    overflowNode = React13.createElement(es_default, {
      onResize: onOverflowResize,
      disabled: !shouldResponsive
    }, overflowNode);
  }
  return overflowNode;
}
var ForwardOverflow = React13.forwardRef(Overflow);
ForwardOverflow.displayName = "Overflow";
ForwardOverflow.Item = RawItem_default;
ForwardOverflow.RESPONSIVE = RESPONSIVE;
ForwardOverflow.INVALIDATE = INVALIDATE;
var Overflow_default = ForwardOverflow;

// ../../node_modules/rc-overflow/es/index.js
var es_default2 = Overflow_default;

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/MenuItem.js
init_extends();
var React21 = __toESM(require_react());
var import_classnames5 = __toESM(require_classnames());

// ../../node_modules/rc-util/es/omit.js
function omit(obj, fields) {
  var clone3 = _objectSpread2({}, obj);
  if (Array.isArray(fields)) {
    fields.forEach(function(key) {
      delete clone3[key];
    });
  }
  return clone3;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/context/MenuContext.js
var React14 = __toESM(require_react());
var import_shallowequal = __toESM(require_shallowequal());
var _excluded5 = ["children", "locked"];
var MenuContext = React14.createContext(null);
function mergeProps(origin, target) {
  var clone3 = _objectSpread2({}, origin);
  Object.keys(target).forEach(function(key) {
    var value = target[key];
    if (value !== void 0) {
      clone3[key] = value;
    }
  });
  return clone3;
}
function InheritableContextProvider(_ref) {
  var children = _ref.children, locked = _ref.locked, restProps = _objectWithoutProperties(_ref, _excluded5);
  var context = React14.useContext(MenuContext);
  var inheritableContext = useMemo(function() {
    return mergeProps(context, restProps);
  }, [context, restProps], function(prev, next) {
    return !locked && (prev[0] !== next[0] || !(0, import_shallowequal.default)(prev[1], next[1]));
  });
  return React14.createElement(MenuContext.Provider, {
    value: inheritableContext
  }, children);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useActive.js
var React15 = __toESM(require_react());
function useActive(eventKey, disabled, onMouseEnter, onMouseLeave) {
  var _React$useContext = React15.useContext(MenuContext), activeKey = _React$useContext.activeKey, onActive = _React$useContext.onActive, onInactive = _React$useContext.onInactive;
  var ret = {
    active: activeKey === eventKey
  };
  if (!disabled) {
    ret.onMouseEnter = function(domEvent) {
      onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
        key: eventKey,
        domEvent
      });
      onActive(eventKey);
    };
    ret.onMouseLeave = function(domEvent) {
      onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
        key: eventKey,
        domEvent
      });
      onInactive(eventKey);
    };
  }
  return ret;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/utils/warnUtil.js
var _excluded6 = ["item"];
function warnItemProp(_ref) {
  var item = _ref.item, restInfo = _objectWithoutProperties(_ref, _excluded6);
  Object.defineProperty(restInfo, "item", {
    get: function get() {
      warning_default(false, "`info.item` is deprecated since we will move to function component that not provides React Node instance in future.");
      return item;
    }
  });
  return restInfo;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/Icon.js
var React16 = __toESM(require_react());
function Icon(_ref) {
  var icon = _ref.icon, props = _ref.props, children = _ref.children;
  var iconNode;
  if (typeof icon === "function") {
    iconNode = React16.createElement(icon, _objectSpread2({}, props));
  } else {
    iconNode = icon;
  }
  return iconNode || children || null;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useDirectionStyle.js
var React17 = __toESM(require_react());
function useDirectionStyle(level) {
  var _React$useContext = React17.useContext(MenuContext), mode = _React$useContext.mode, rtl = _React$useContext.rtl, inlineIndent = _React$useContext.inlineIndent;
  if (mode !== "inline") {
    return null;
  }
  var len = level;
  return rtl ? {
    paddingRight: len * inlineIndent
  } : {
    paddingLeft: len * inlineIndent
  };
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/context/PathContext.js
var React18 = __toESM(require_react());
var EmptyList = [];
var PathRegisterContext = React18.createContext(null);
function useMeasure() {
  return React18.useContext(PathRegisterContext);
}
var PathTrackerContext = React18.createContext(EmptyList);
function useFullPath(eventKey) {
  var parentKeyPath = React18.useContext(PathTrackerContext);
  return React18.useMemo(function() {
    return eventKey !== void 0 ? [].concat(_toConsumableArray(parentKeyPath), [eventKey]) : parentKeyPath;
  }, [parentKeyPath, eventKey]);
}
var PathUserContext = React18.createContext(null);

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/context/IdContext.js
var React19 = __toESM(require_react());
var IdContext = React19.createContext(null);
function getMenuId(uuid2, eventKey) {
  if (uuid2 === void 0) {
    return null;
  }
  return "".concat(uuid2, "-").concat(eventKey);
}
function useMenuId(eventKey) {
  var id = React19.useContext(IdContext);
  return getMenuId(id, eventKey);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/context/PrivateContext.js
var React20 = __toESM(require_react());
var PrivateContext = React20.createContext({});
var PrivateContext_default = PrivateContext;

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/MenuItem.js
var _excluded7 = ["title", "attribute", "elementRef"];
var _excluded23 = ["style", "className", "eventKey", "warnKey", "disabled", "itemIcon", "children", "role", "onMouseEnter", "onMouseLeave", "onClick", "onKeyDown", "onFocus"];
var _excluded32 = ["active"];
var LegacyMenuItem = function(_React$Component) {
  _inherits(LegacyMenuItem3, _React$Component);
  var _super = _createSuper(LegacyMenuItem3);
  function LegacyMenuItem3() {
    _classCallCheck(this, LegacyMenuItem3);
    return _super.apply(this, arguments);
  }
  _createClass(LegacyMenuItem3, [{
    key: "render",
    value: function render() {
      var _this$props = this.props, title = _this$props.title, attribute = _this$props.attribute, elementRef = _this$props.elementRef, restProps = _objectWithoutProperties(_this$props, _excluded7);
      var passedProps = omit(restProps, ["eventKey"]);
      warning_default(!attribute, "`attribute` of Menu.Item is deprecated. Please pass attribute directly.");
      return React21.createElement(es_default2.Item, _extends({}, attribute, {
        title: typeof title === "string" ? title : void 0
      }, passedProps, {
        ref: elementRef
      }));
    }
  }]);
  return LegacyMenuItem3;
}(React21.Component);
var InternalMenuItem = function InternalMenuItem2(props) {
  var _classNames;
  var style2 = props.style, className = props.className, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, itemIcon = props.itemIcon, children = props.children, role = props.role, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onClick = props.onClick, onKeyDown = props.onKeyDown, onFocus = props.onFocus, restProps = _objectWithoutProperties(props, _excluded23);
  var domDataId = useMenuId(eventKey);
  var _React$useContext = React21.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, onItemClick = _React$useContext.onItemClick, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, contextItemIcon = _React$useContext.itemIcon, selectedKeys = _React$useContext.selectedKeys, onActive = _React$useContext.onActive;
  var _React$useContext2 = React21.useContext(PrivateContext_default), _internalRenderMenuItem = _React$useContext2._internalRenderMenuItem;
  var itemCls = "".concat(prefixCls, "-item");
  var legacyMenuItemRef = React21.useRef();
  var elementRef = React21.useRef();
  var mergedDisabled = contextDisabled || disabled;
  var connectedKeys = useFullPath(eventKey);
  if (warnKey) {
    warning_default(false, "MenuItem should not leave undefined `key`.");
  }
  var getEventInfo = function getEventInfo2(e) {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: _toConsumableArray(connectedKeys).reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };
  var mergedItemIcon = itemIcon || contextItemIcon;
  var _useActive = useActive(eventKey, mergedDisabled, onMouseEnter, onMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded32);
  var selected = selectedKeys.includes(eventKey);
  var directionStyle = useDirectionStyle(connectedKeys.length);
  var onInternalClick = function onInternalClick2(e) {
    if (mergedDisabled) {
      return;
    }
    var info = getEventInfo(e);
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp(info));
    onItemClick(info);
  };
  var onInternalKeyDown = function onInternalKeyDown2(e) {
    onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
    if (e.which === KeyCode_default.ENTER) {
      var info = getEventInfo(e);
      onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp(info));
      onItemClick(info);
    }
  };
  var onInternalFocus = function onInternalFocus2(e) {
    onActive(eventKey);
    onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
  };
  var optionRoleProps = {};
  if (props.role === "option") {
    optionRoleProps["aria-selected"] = selected;
  }
  var renderNode = React21.createElement(LegacyMenuItem, _extends({
    ref: legacyMenuItemRef,
    elementRef,
    role: role === null ? "none" : role || "menuitem",
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, restProps, activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: _objectSpread2(_objectSpread2({}, directionStyle), style2),
    className: (0, import_classnames5.default)(itemCls, (_classNames = {}, _defineProperty(_classNames, "".concat(itemCls, "-active"), active), _defineProperty(_classNames, "".concat(itemCls, "-selected"), selected), _defineProperty(_classNames, "".concat(itemCls, "-disabled"), mergedDisabled), _classNames), className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, React21.createElement(Icon, {
    props: _objectSpread2(_objectSpread2({}, props), {}, {
      isSelected: selected
    }),
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected
    });
  }
  return renderNode;
};
function MenuItem(props) {
  var eventKey = props.eventKey;
  var measure = useMeasure();
  var connectedKeyPath = useFullPath(eventKey);
  React21.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }
  return React21.createElement(InternalMenuItem, props);
}
var MenuItem_default = MenuItem;

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/utils/nodeUtil.js
init_extends();
var React22 = __toESM(require_react());
var _excluded8 = ["label", "children", "key", "type"];
function parseChildren(children, keyPath) {
  return toArray(children).map(function(child, index) {
    if (React22.isValidElement(child)) {
      var _child$props$eventKey, _child$props;
      var key = child.key;
      var eventKey = (_child$props$eventKey = (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.eventKey) !== null && _child$props$eventKey !== void 0 ? _child$props$eventKey : key;
      var emptyKey = eventKey === null || eventKey === void 0;
      if (emptyKey) {
        eventKey = "tmp_key-".concat([].concat(_toConsumableArray(keyPath), [index]).join("-"));
      }
      var cloneProps = {
        key: eventKey,
        eventKey
      };
      if (emptyKey) {
        cloneProps.warnKey = true;
      }
      return React22.cloneElement(child, cloneProps);
    }
    return child;
  });
}
function convertItemsToNodes(list) {
  return (list || []).map(function(opt, index) {
    if (opt && _typeof(opt) === "object") {
      var label = opt.label, children = opt.children, key = opt.key, type = opt.type, restProps = _objectWithoutProperties(opt, _excluded8);
      var mergedKey = key !== null && key !== void 0 ? key : "tmp-".concat(index);
      if (children || type === "group") {
        if (type === "group") {
          return React22.createElement(MenuItemGroup, _extends({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes(children));
        }
        return React22.createElement(SubMenu, _extends({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes(children));
      }
      if (type === "divider") {
        return React22.createElement(Divider, _extends({
          key: mergedKey
        }, restProps));
      }
      return React22.createElement(MenuItem_default, _extends({
        key: mergedKey
      }, restProps), label);
    }
    return null;
  }).filter(function(opt) {
    return opt;
  });
}
function parseItems(children, items, keyPath) {
  var childNodes = children;
  if (items) {
    childNodes = convertItemsToNodes(items);
  }
  return parseChildren(childNodes, keyPath);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useMemoCallback.js
var React23 = __toESM(require_react());
function useMemoCallback(func) {
  var funRef = React23.useRef(func);
  funRef.current = func;
  var callback = React23.useCallback(function() {
    var _funRef$current;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return (_funRef$current = funRef.current) === null || _funRef$current === void 0 ? void 0 : _funRef$current.call.apply(_funRef$current, [funRef].concat(args));
  }, []);
  return func ? callback : void 0;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/index.js
init_extends();
var React43 = __toESM(require_react());
var import_classnames13 = __toESM(require_classnames());

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/SubMenuList.js
init_extends();
var React24 = __toESM(require_react());
var import_classnames6 = __toESM(require_classnames());
var _excluded9 = ["className", "children"];
var InternalSubMenuList = function InternalSubMenuList2(_ref, ref) {
  var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded9);
  var _React$useContext = React24.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, rtl = _React$useContext.rtl;
  return React24.createElement("ul", _extends({
    className: (0, import_classnames6.default)(prefixCls, rtl && "".concat(prefixCls, "-rtl"), "".concat(prefixCls, "-sub"), "".concat(prefixCls, "-").concat(mode === "inline" ? "inline" : "vertical"), className)
  }, restProps, {
    "data-menu-list": true,
    ref
  }), children);
};
var SubMenuList = React24.forwardRef(InternalSubMenuList);
SubMenuList.displayName = "SubMenuList";
var SubMenuList_default = SubMenuList;

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var React41 = __toESM(require_react());

// ../../node_modules/rc-trigger/es/index.js
init_extends();
var React40 = __toESM(require_react());
var import_react_dom5 = __toESM(require_react_dom());

// ../../node_modules/rc-util/es/Dom/contains.js
function contains(root, n) {
  if (!root) {
    return false;
  }
  if (root.contains) {
    return root.contains(n);
  }
  var node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

// ../../node_modules/rc-util/es/Dom/addEventListener.js
var import_react_dom3 = __toESM(require_react_dom());
function addEventListenerWrap(target, eventType, cb, option) {
  var callback = import_react_dom3.default.unstable_batchedUpdates ? function run(e) {
    import_react_dom3.default.unstable_batchedUpdates(cb, e);
  } : cb;
  if (target.addEventListener) {
    target.addEventListener(eventType, callback, option);
  }
  return {
    remove: function remove() {
      if (target.removeEventListener) {
        target.removeEventListener(eventType, callback, option);
      }
    }
  };
}

// ../../node_modules/rc-util/es/Portal.js
var import_react8 = __toESM(require_react());
var import_react_dom4 = __toESM(require_react_dom());
var Portal = (0, import_react8.forwardRef)(function(props, ref) {
  var didUpdate = props.didUpdate, getContainer = props.getContainer, children = props.children;
  var parentRef = (0, import_react8.useRef)();
  var containerRef = (0, import_react8.useRef)();
  (0, import_react8.useImperativeHandle)(ref, function() {
    return {};
  });
  var initRef = (0, import_react8.useRef)(false);
  if (!initRef.current && canUseDom()) {
    containerRef.current = getContainer();
    parentRef.current = containerRef.current.parentNode;
    initRef.current = true;
  }
  (0, import_react8.useEffect)(function() {
    didUpdate === null || didUpdate === void 0 ? void 0 : didUpdate(props);
  });
  (0, import_react8.useEffect)(function() {
    if (containerRef.current.parentNode === null && parentRef.current !== null) {
      parentRef.current.appendChild(containerRef.current);
    }
    return function() {
      var _containerRef$current, _containerRef$current2;
      (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : (_containerRef$current2 = _containerRef$current.parentNode) === null || _containerRef$current2 === void 0 ? void 0 : _containerRef$current2.removeChild(containerRef.current);
    };
  }, []);
  return containerRef.current ? import_react_dom4.default.createPortal(children, containerRef.current) : null;
});
var Portal_default = Portal;

// ../../node_modules/rc-trigger/es/index.js
var import_classnames11 = __toESM(require_classnames());

// ../../node_modules/rc-trigger/es/utils/alignUtil.js
function isPointsEq(a1, a2, isAlignPoint) {
  if (isAlignPoint) {
    return a1[0] === a2[0];
  }
  return a1[0] === a2[0] && a1[1] === a2[1];
}
function getAlignFromPlacement(builtinPlacements, placementStr, align) {
  var baseAlign = builtinPlacements[placementStr] || {};
  return _objectSpread2(_objectSpread2({}, baseAlign), align);
}
function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
  var points = align.points;
  var placements5 = Object.keys(builtinPlacements);
  for (var i = 0; i < placements5.length; i += 1) {
    var placement = placements5[i];
    if (isPointsEq(builtinPlacements[placement].points, points, isAlignPoint)) {
      return "".concat(prefixCls, "-placement-").concat(placement);
    }
  }
  return "";
}

// ../../node_modules/rc-trigger/es/Popup/index.js
init_extends();
var React38 = __toESM(require_react());
var import_react17 = __toESM(require_react());

// ../../node_modules/rc-trigger/es/Popup/Mask.js
init_extends();
var React32 = __toESM(require_react());
var import_classnames8 = __toESM(require_classnames());

// ../../node_modules/rc-motion/es/CSSMotion.js
var React30 = __toESM(require_react());
var import_react12 = __toESM(require_react());
var import_classnames7 = __toESM(require_classnames());

// ../../node_modules/rc-motion/es/util/motion.js
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit".concat(styleProp)] = "webkit".concat(eventName);
  prefixes["Moz".concat(styleProp)] = "moz".concat(eventName);
  prefixes["ms".concat(styleProp)] = "MS".concat(eventName);
  prefixes["O".concat(styleProp)] = "o".concat(eventName.toLowerCase());
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  var prefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  };
  if (domSupport) {
    if (!("AnimationEvent" in win)) {
      delete prefixes.animationend.animation;
    }
    if (!("TransitionEvent" in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
var vendorPrefixes = getVendorPrefixes(canUseDom(), typeof window !== "undefined" ? window : {});
var style = {};
if (canUseDom()) {
  _document$createEleme = document.createElement("div");
  style = _document$createEleme.style;
}
var _document$createEleme;
var prefixedEventNames = {};
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  var prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    var stylePropList = Object.keys(prefixMap);
    var len = stylePropList.length;
    for (var i = 0; i < len; i += 1) {
      var styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return "";
}
var internalAnimationEndName = getVendorPrefixedEventName("animationend");
var internalTransitionEndName = getVendorPrefixedEventName("transitionend");
var supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
var animationEndName = internalAnimationEndName || "animationend";
var transitionEndName = internalTransitionEndName || "transitionend";
function getTransitionName(transitionName, transitionType) {
  if (!transitionName)
    return null;
  if (_typeof(transitionName) === "object") {
    var type = transitionType.replace(/-\w/g, function(match) {
      return match[1].toUpperCase();
    });
    return transitionName[type];
  }
  return "".concat(transitionName, "-").concat(transitionType);
}

// ../../node_modules/rc-motion/es/interface.js
var STATUS_NONE = "none";
var STATUS_APPEAR = "appear";
var STATUS_ENTER = "enter";
var STATUS_LEAVE = "leave";
var STEP_NONE = "none";
var STEP_PREPARE = "prepare";
var STEP_START = "start";
var STEP_ACTIVE = "active";
var STEP_ACTIVATED = "end";

// ../../node_modules/rc-motion/es/hooks/useStatus.js
var React28 = __toESM(require_react());
var import_react11 = __toESM(require_react());

// ../../node_modules/rc-motion/es/hooks/useStepQueue.js
var React26 = __toESM(require_react());

// ../../node_modules/rc-motion/es/hooks/useNextFrame.js
var React25 = __toESM(require_react());
var useNextFrame_default = function() {
  var nextFrameRef = React25.useRef(null);
  function cancelNextFrame() {
    raf_default.cancel(nextFrameRef.current);
  }
  function nextFrame(callback) {
    var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
    cancelNextFrame();
    var nextFrameId = raf_default(function() {
      if (delay <= 1) {
        callback({
          isCanceled: function isCanceled() {
            return nextFrameId !== nextFrameRef.current;
          }
        });
      } else {
        nextFrame(callback, delay - 1);
      }
    });
    nextFrameRef.current = nextFrameId;
  }
  React25.useEffect(function() {
    return function() {
      cancelNextFrame();
    };
  }, []);
  return [nextFrame, cancelNextFrame];
};

// ../../node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js
var import_react9 = __toESM(require_react());
var useIsomorphicLayoutEffect = canUseDom() ? import_react9.useLayoutEffect : import_react9.useEffect;
var useIsomorphicLayoutEffect_default = useIsomorphicLayoutEffect;

// ../../node_modules/rc-motion/es/hooks/useStepQueue.js
var STEP_QUEUE = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED];
var SkipStep = false;
var DoStep = true;
function isActive(step) {
  return step === STEP_ACTIVE || step === STEP_ACTIVATED;
}
var useStepQueue_default = function(status, callback) {
  var _useState = useSafeState(STEP_NONE), _useState2 = _slicedToArray(_useState, 2), step = _useState2[0], setStep = _useState2[1];
  var _useNextFrame = useNextFrame_default(), _useNextFrame2 = _slicedToArray(_useNextFrame, 2), nextFrame = _useNextFrame2[0], cancelNextFrame = _useNextFrame2[1];
  function startQueue() {
    setStep(STEP_PREPARE, true);
  }
  useIsomorphicLayoutEffect_default(function() {
    if (step !== STEP_NONE && step !== STEP_ACTIVATED) {
      var index = STEP_QUEUE.indexOf(step);
      var nextStep = STEP_QUEUE[index + 1];
      var result = callback(step);
      if (result === SkipStep) {
        setStep(nextStep, true);
      } else {
        nextFrame(function(info) {
          function doNext() {
            if (info.isCanceled())
              return;
            setStep(nextStep, true);
          }
          if (result === true) {
            doNext();
          } else {
            Promise.resolve(result).then(doNext);
          }
        });
      }
    }
  }, [status, step]);
  React26.useEffect(function() {
    return function() {
      cancelNextFrame();
    };
  }, []);
  return [startQueue, step];
};

// ../../node_modules/rc-motion/es/hooks/useDomMotionEvents.js
var React27 = __toESM(require_react());
var import_react10 = __toESM(require_react());
var useDomMotionEvents_default = function(callback) {
  var cacheElementRef = (0, import_react10.useRef)();
  var callbackRef = (0, import_react10.useRef)(callback);
  callbackRef.current = callback;
  var onInternalMotionEnd = React27.useCallback(function(event) {
    callbackRef.current(event);
  }, []);
  function removeMotionEvents(element) {
    if (element) {
      element.removeEventListener(transitionEndName, onInternalMotionEnd);
      element.removeEventListener(animationEndName, onInternalMotionEnd);
    }
  }
  function patchMotionEvents(element) {
    if (cacheElementRef.current && cacheElementRef.current !== element) {
      removeMotionEvents(cacheElementRef.current);
    }
    if (element && element !== cacheElementRef.current) {
      element.addEventListener(transitionEndName, onInternalMotionEnd);
      element.addEventListener(animationEndName, onInternalMotionEnd);
      cacheElementRef.current = element;
    }
  }
  React27.useEffect(function() {
    return function() {
      removeMotionEvents(cacheElementRef.current);
    };
  }, []);
  return [patchMotionEvents, removeMotionEvents];
};

// ../../node_modules/rc-motion/es/hooks/useStatus.js
function useStatus(supportMotion, visible, getElement2, _ref) {
  var _ref$motionEnter = _ref.motionEnter, motionEnter = _ref$motionEnter === void 0 ? true : _ref$motionEnter, _ref$motionAppear = _ref.motionAppear, motionAppear = _ref$motionAppear === void 0 ? true : _ref$motionAppear, _ref$motionLeave = _ref.motionLeave, motionLeave = _ref$motionLeave === void 0 ? true : _ref$motionLeave, motionDeadline = _ref.motionDeadline, motionLeaveImmediately = _ref.motionLeaveImmediately, onAppearPrepare = _ref.onAppearPrepare, onEnterPrepare = _ref.onEnterPrepare, onLeavePrepare = _ref.onLeavePrepare, onAppearStart = _ref.onAppearStart, onEnterStart = _ref.onEnterStart, onLeaveStart = _ref.onLeaveStart, onAppearActive = _ref.onAppearActive, onEnterActive = _ref.onEnterActive, onLeaveActive = _ref.onLeaveActive, onAppearEnd = _ref.onAppearEnd, onEnterEnd = _ref.onEnterEnd, onLeaveEnd = _ref.onLeaveEnd, onVisibleChanged = _ref.onVisibleChanged;
  var _useState = useSafeState(), _useState2 = _slicedToArray(_useState, 2), asyncVisible = _useState2[0], setAsyncVisible = _useState2[1];
  var _useState3 = useSafeState(STATUS_NONE), _useState4 = _slicedToArray(_useState3, 2), status = _useState4[0], setStatus = _useState4[1];
  var _useState5 = useSafeState(null), _useState6 = _slicedToArray(_useState5, 2), style2 = _useState6[0], setStyle = _useState6[1];
  var mountedRef = (0, import_react11.useRef)(false);
  var deadlineRef = (0, import_react11.useRef)(null);
  function getDomElement() {
    return getElement2();
  }
  var activeRef = (0, import_react11.useRef)(false);
  function onInternalMotionEnd(event) {
    var element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      return;
    }
    var currentActive = activeRef.current;
    var canEnd;
    if (status === STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd === null || onAppearEnd === void 0 ? void 0 : onAppearEnd(element, event);
    } else if (status === STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd === null || onEnterEnd === void 0 ? void 0 : onEnterEnd(element, event);
    } else if (status === STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd === null || onLeaveEnd === void 0 ? void 0 : onLeaveEnd(element, event);
    }
    if (status !== STATUS_NONE && currentActive && canEnd !== false) {
      setStatus(STATUS_NONE, true);
      setStyle(null, true);
    }
  }
  var _useDomMotionEvents = useDomMotionEvents_default(onInternalMotionEnd), _useDomMotionEvents2 = _slicedToArray(_useDomMotionEvents, 1), patchMotionEvents = _useDomMotionEvents2[0];
  var eventHandlers = React28.useMemo(function() {
    var _ref2, _ref3, _ref4;
    switch (status) {
      case STATUS_APPEAR:
        return _ref2 = {}, _defineProperty(_ref2, STEP_PREPARE, onAppearPrepare), _defineProperty(_ref2, STEP_START, onAppearStart), _defineProperty(_ref2, STEP_ACTIVE, onAppearActive), _ref2;
      case STATUS_ENTER:
        return _ref3 = {}, _defineProperty(_ref3, STEP_PREPARE, onEnterPrepare), _defineProperty(_ref3, STEP_START, onEnterStart), _defineProperty(_ref3, STEP_ACTIVE, onEnterActive), _ref3;
      case STATUS_LEAVE:
        return _ref4 = {}, _defineProperty(_ref4, STEP_PREPARE, onLeavePrepare), _defineProperty(_ref4, STEP_START, onLeaveStart), _defineProperty(_ref4, STEP_ACTIVE, onLeaveActive), _ref4;
      default:
        return {};
    }
  }, [status]);
  var _useStepQueue = useStepQueue_default(status, function(newStep) {
    if (newStep === STEP_PREPARE) {
      var onPrepare = eventHandlers[STEP_PREPARE];
      if (!onPrepare) {
        return SkipStep;
      }
      return onPrepare(getDomElement());
    }
    if (step in eventHandlers) {
      var _eventHandlers$step;
      setStyle(((_eventHandlers$step = eventHandlers[step]) === null || _eventHandlers$step === void 0 ? void 0 : _eventHandlers$step.call(eventHandlers, getDomElement(), null)) || null);
    }
    if (step === STEP_ACTIVE) {
      patchMotionEvents(getDomElement());
      if (motionDeadline > 0) {
        clearTimeout(deadlineRef.current);
        deadlineRef.current = setTimeout(function() {
          onInternalMotionEnd({
            deadline: true
          });
        }, motionDeadline);
      }
    }
    return DoStep;
  }), _useStepQueue2 = _slicedToArray(_useStepQueue, 2), startStep = _useStepQueue2[0], step = _useStepQueue2[1];
  var active = isActive(step);
  activeRef.current = active;
  useIsomorphicLayoutEffect_default(function() {
    setAsyncVisible(visible);
    var isMounted = mountedRef.current;
    mountedRef.current = true;
    if (!supportMotion) {
      return;
    }
    var nextStatus;
    if (!isMounted && visible && motionAppear) {
      nextStatus = STATUS_APPEAR;
    }
    if (isMounted && visible && motionEnter) {
      nextStatus = STATUS_ENTER;
    }
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = STATUS_LEAVE;
    }
    if (nextStatus) {
      setStatus(nextStatus);
      startStep();
    }
  }, [visible]);
  (0, import_react11.useEffect)(function() {
    if (
      // Cancel appear
      status === STATUS_APPEAR && !motionAppear || // Cancel enter
      status === STATUS_ENTER && !motionEnter || // Cancel leave
      status === STATUS_LEAVE && !motionLeave
    ) {
      setStatus(STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0, import_react11.useEffect)(function() {
    return function() {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    };
  }, []);
  var firstMountChangeRef = React28.useRef(false);
  (0, import_react11.useEffect)(function() {
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== void 0 && status === STATUS_NONE) {
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged === null || onVisibleChanged === void 0 ? void 0 : onVisibleChanged(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, status]);
  var mergedStyle = style2;
  if (eventHandlers[STEP_PREPARE] && step === STEP_START) {
    mergedStyle = _objectSpread2({
      transition: "none"
    }, mergedStyle);
  }
  return [status, step, mergedStyle, asyncVisible !== null && asyncVisible !== void 0 ? asyncVisible : visible];
}

// ../../node_modules/rc-motion/es/DomWrapper.js
var React29 = __toESM(require_react());
var DomWrapper2 = function(_React$Component) {
  _inherits(DomWrapper3, _React$Component);
  var _super = _createSuper(DomWrapper3);
  function DomWrapper3() {
    _classCallCheck(this, DomWrapper3);
    return _super.apply(this, arguments);
  }
  _createClass(DomWrapper3, [{
    key: "render",
    value: function render() {
      return this.props.children;
    }
  }]);
  return DomWrapper3;
}(React29.Component);
var DomWrapper_default = DomWrapper2;

// ../../node_modules/rc-motion/es/CSSMotion.js
function genCSSMotion(config) {
  var transitionSupport = config;
  if (_typeof(config) === "object") {
    transitionSupport = config.transitionSupport;
  }
  function isSupportTransition(props) {
    return !!(props.motionName && transitionSupport);
  }
  var CSSMotion = React30.forwardRef(function(props, ref) {
    var _props$visible = props.visible, visible = _props$visible === void 0 ? true : _props$visible, _props$removeOnLeave = props.removeOnLeave, removeOnLeave = _props$removeOnLeave === void 0 ? true : _props$removeOnLeave, forceRender = props.forceRender, children = props.children, motionName = props.motionName, leavedClassName = props.leavedClassName, eventProps = props.eventProps;
    var supportMotion = isSupportTransition(props);
    var nodeRef = (0, import_react12.useRef)();
    var wrapperNodeRef = (0, import_react12.useRef)();
    function getDomElement() {
      try {
        return nodeRef.current instanceof HTMLElement ? nodeRef.current : findDOMNode(wrapperNodeRef.current);
      } catch (e) {
        return null;
      }
    }
    var _useStatus = useStatus(supportMotion, visible, getDomElement, props), _useStatus2 = _slicedToArray(_useStatus, 4), status = _useStatus2[0], statusStep = _useStatus2[1], statusStyle = _useStatus2[2], mergedVisible = _useStatus2[3];
    var renderedRef = React30.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }
    var setNodeRef = React30.useCallback(function(node) {
      nodeRef.current = node;
      fillRef(ref, node);
    }, [ref]);
    var motionChildren;
    var mergedProps = _objectSpread2(_objectSpread2({}, eventProps), {}, {
      visible
    });
    if (!children) {
      motionChildren = null;
    } else if (status === STATUS_NONE || !isSupportTransition(props)) {
      if (mergedVisible) {
        motionChildren = children(_objectSpread2({}, mergedProps), setNodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          className: leavedClassName
        }), setNodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          style: {
            display: "none"
          }
        }), setNodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      var _classNames;
      var statusSuffix;
      if (statusStep === STEP_PREPARE) {
        statusSuffix = "prepare";
      } else if (isActive(statusStep)) {
        statusSuffix = "active";
      } else if (statusStep === STEP_START) {
        statusSuffix = "start";
      }
      motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
        className: (0, import_classnames7.default)(getTransitionName(motionName, status), (_classNames = {}, _defineProperty(_classNames, getTransitionName(motionName, "".concat(status, "-").concat(statusSuffix)), statusSuffix), _defineProperty(_classNames, motionName, typeof motionName === "string"), _classNames)),
        style: statusStyle
      }), setNodeRef);
    }
    if (React30.isValidElement(motionChildren) && supportRef(motionChildren)) {
      var _ref = motionChildren, originNodeRef = _ref.ref;
      if (!originNodeRef) {
        motionChildren = React30.cloneElement(motionChildren, {
          ref: setNodeRef
        });
      }
    }
    return React30.createElement(DomWrapper_default, {
      ref: wrapperNodeRef
    }, motionChildren);
  });
  CSSMotion.displayName = "CSSMotion";
  return CSSMotion;
}
var CSSMotion_default = genCSSMotion(supportTransition);

// ../../node_modules/rc-motion/es/CSSMotionList.js
init_extends();
var React31 = __toESM(require_react());

// ../../node_modules/rc-motion/es/util/diff.js
var STATUS_ADD = "add";
var STATUS_KEEP = "keep";
var STATUS_REMOVE = "remove";
var STATUS_REMOVED = "removed";
function wrapKeyToObject(key) {
  var keyObj;
  if (key && _typeof(key) === "object" && "key" in key) {
    keyObj = key;
  } else {
    keyObj = {
      key
    };
  }
  return _objectSpread2(_objectSpread2({}, keyObj), {}, {
    key: String(keyObj.key)
  });
}
function parseKeys() {
  var keys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  return keys.map(wrapKeyToObject);
}
function diffKeys() {
  var prevKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  var currentKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var list = [];
  var currentIndex = 0;
  var currentLen = currentKeys.length;
  var prevKeyObjects = parseKeys(prevKeys);
  var currentKeyObjects = parseKeys(currentKeys);
  prevKeyObjects.forEach(function(keyObj) {
    var hit = false;
    for (var i = currentIndex; i < currentLen; i += 1) {
      var currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(function(obj) {
            return _objectSpread2(_objectSpread2({}, obj), {}, {
              status: STATUS_ADD
            });
          }));
          currentIndex = i;
        }
        list.push(_objectSpread2(_objectSpread2({}, currentKeyObj), {}, {
          status: STATUS_KEEP
        }));
        currentIndex += 1;
        hit = true;
        break;
      }
    }
    if (!hit) {
      list.push(_objectSpread2(_objectSpread2({}, keyObj), {}, {
        status: STATUS_REMOVE
      }));
    }
  });
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(function(obj) {
      return _objectSpread2(_objectSpread2({}, obj), {}, {
        status: STATUS_ADD
      });
    }));
  }
  var keys = {};
  list.forEach(function(_ref) {
    var key = _ref.key;
    keys[key] = (keys[key] || 0) + 1;
  });
  var duplicatedKeys = Object.keys(keys).filter(function(key) {
    return keys[key] > 1;
  });
  duplicatedKeys.forEach(function(matchKey) {
    list = list.filter(function(_ref2) {
      var key = _ref2.key, status = _ref2.status;
      return key !== matchKey || status !== STATUS_REMOVE;
    });
    list.forEach(function(node) {
      if (node.key === matchKey) {
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}

// ../../node_modules/rc-motion/es/CSSMotionList.js
var _excluded10 = ["component", "children", "onVisibleChanged", "onAllRemoved"];
var _excluded24 = ["status"];
var MOTION_PROP_NAMES = ["eventProps", "visible", "children", "motionName", "motionAppear", "motionEnter", "motionLeave", "motionLeaveImmediately", "motionDeadline", "removeOnLeave", "leavedClassName", "onAppearStart", "onAppearActive", "onAppearEnd", "onEnterStart", "onEnterActive", "onEnterEnd", "onLeaveStart", "onLeaveActive", "onLeaveEnd"];
function genCSSMotionList(transitionSupport) {
  var CSSMotion = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : CSSMotion_default;
  var CSSMotionList = function(_React$Component) {
    _inherits(CSSMotionList2, _React$Component);
    var _super = _createSuper(CSSMotionList2);
    function CSSMotionList2() {
      var _this;
      _classCallCheck(this, CSSMotionList2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "state", {
        keyEntities: []
      });
      _defineProperty(_assertThisInitialized(_this), "removeKey", function(removeKey) {
        var keyEntities = _this.state.keyEntities;
        var nextKeyEntities = keyEntities.map(function(entity) {
          if (entity.key !== removeKey)
            return entity;
          return _objectSpread2(_objectSpread2({}, entity), {}, {
            status: STATUS_REMOVED
          });
        });
        _this.setState({
          keyEntities: nextKeyEntities
        });
        return nextKeyEntities.filter(function(_ref) {
          var status = _ref.status;
          return status !== STATUS_REMOVED;
        }).length;
      });
      return _this;
    }
    _createClass(CSSMotionList2, [{
      key: "render",
      value: function render() {
        var _this2 = this;
        var keyEntities = this.state.keyEntities;
        var _this$props = this.props, component = _this$props.component, children = _this$props.children, _onVisibleChanged = _this$props.onVisibleChanged, onAllRemoved = _this$props.onAllRemoved, restProps = _objectWithoutProperties(_this$props, _excluded10);
        var Component7 = component || React31.Fragment;
        var motionProps = {};
        MOTION_PROP_NAMES.forEach(function(prop) {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return React31.createElement(Component7, restProps, keyEntities.map(function(_ref2) {
          var status = _ref2.status, eventProps = _objectWithoutProperties(_ref2, _excluded24);
          var visible = status === STATUS_ADD || status === STATUS_KEEP;
          return React31.createElement(CSSMotion, _extends({}, motionProps, {
            key: eventProps.key,
            visible,
            eventProps,
            onVisibleChanged: function onVisibleChanged(changedVisible) {
              _onVisibleChanged === null || _onVisibleChanged === void 0 ? void 0 : _onVisibleChanged(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                var restKeysCount = _this2.removeKey(eventProps.key);
                if (restKeysCount === 0 && onAllRemoved) {
                  onAllRemoved();
                }
              }
            }
          }), children);
        }));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref3, _ref4) {
        var keys = _ref3.keys;
        var keyEntities = _ref4.keyEntities;
        var parsedKeyObjects = parseKeys(keys);
        var mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter(function(entity) {
            var prevEntity = keyEntities.find(function(_ref5) {
              var key = _ref5.key;
              return entity.key === key;
            });
            if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
      // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
    }]);
    return CSSMotionList2;
  }(React31.Component);
  _defineProperty(CSSMotionList, "defaultProps", {
    component: "div"
  });
  return CSSMotionList;
}
var CSSMotionList_default = genCSSMotionList(supportTransition);

// ../../node_modules/rc-motion/es/index.js
var es_default3 = CSSMotion_default;

// ../../node_modules/rc-trigger/es/utils/legacyUtil.js
function getMotion(_ref) {
  var prefixCls = _ref.prefixCls, motion = _ref.motion, animation = _ref.animation, transitionName = _ref.transitionName;
  if (motion) {
    return motion;
  }
  if (animation) {
    return {
      motionName: "".concat(prefixCls, "-").concat(animation)
    };
  }
  if (transitionName) {
    return {
      motionName: transitionName
    };
  }
  return null;
}

// ../../node_modules/rc-trigger/es/Popup/Mask.js
function Mask(props) {
  var prefixCls = props.prefixCls, visible = props.visible, zIndex = props.zIndex, mask = props.mask, maskMotion = props.maskMotion, maskAnimation = props.maskAnimation, maskTransitionName = props.maskTransitionName;
  if (!mask) {
    return null;
  }
  var motion = {};
  if (maskMotion || maskTransitionName || maskAnimation) {
    motion = _objectSpread2({
      motionAppear: true
    }, getMotion({
      motion: maskMotion,
      prefixCls,
      transitionName: maskTransitionName,
      animation: maskAnimation
    }));
  }
  return React32.createElement(es_default3, _extends({}, motion, {
    visible,
    removeOnLeave: true
  }), function(_ref) {
    var className = _ref.className;
    return React32.createElement("div", {
      style: {
        zIndex
      },
      className: (0, import_classnames8.default)("".concat(prefixCls, "-mask"), className)
    });
  });
}

// ../../node_modules/rc-trigger/es/Popup/PopupInner.js
init_extends();
var React36 = __toESM(require_react());
var import_react16 = __toESM(require_react());

// ../../node_modules/dom-align/dist-web/index.js
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
function _objectSpread22(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty2(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _typeof2(obj) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof2(obj);
}
function _defineProperty2(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var vendorPrefix;
var jsCssMap = {
  Webkit: "-webkit-",
  Moz: "-moz-",
  // IE did it wrong again ...
  ms: "-ms-",
  O: "-o-"
};
function getVendorPrefix() {
  if (vendorPrefix !== void 0) {
    return vendorPrefix;
  }
  vendorPrefix = "";
  var style2 = document.createElement("p").style;
  var testProp = "Transform";
  for (var key in jsCssMap) {
    if (key + testProp in style2) {
      vendorPrefix = key;
    }
  }
  return vendorPrefix;
}
function getTransitionName2() {
  return getVendorPrefix() ? "".concat(getVendorPrefix(), "TransitionProperty") : "transitionProperty";
}
function getTransformName() {
  return getVendorPrefix() ? "".concat(getVendorPrefix(), "Transform") : "transform";
}
function setTransitionProperty(node, value) {
  var name = getTransitionName2();
  if (name) {
    node.style[name] = value;
    if (name !== "transitionProperty") {
      node.style.transitionProperty = value;
    }
  }
}
function setTransform(node, value) {
  var name = getTransformName();
  if (name) {
    node.style[name] = value;
    if (name !== "transform") {
      node.style.transform = value;
    }
  }
}
function getTransitionProperty(node) {
  return node.style.transitionProperty || node.style[getTransitionName2()];
}
function getTransformXY(node) {
  var style2 = window.getComputedStyle(node, null);
  var transform = style2.getPropertyValue("transform") || style2.getPropertyValue(getTransformName());
  if (transform && transform !== "none") {
    var matrix = transform.replace(/[^0-9\-.,]/g, "").split(",");
    return {
      x: parseFloat(matrix[12] || matrix[4], 0),
      y: parseFloat(matrix[13] || matrix[5], 0)
    };
  }
  return {
    x: 0,
    y: 0
  };
}
var matrix2d = /matrix\((.*)\)/;
var matrix3d = /matrix3d\((.*)\)/;
function setTransformXY(node, xy) {
  var style2 = window.getComputedStyle(node, null);
  var transform = style2.getPropertyValue("transform") || style2.getPropertyValue(getTransformName());
  if (transform && transform !== "none") {
    var arr;
    var match2d = transform.match(matrix2d);
    if (match2d) {
      match2d = match2d[1];
      arr = match2d.split(",").map(function(item) {
        return parseFloat(item, 10);
      });
      arr[4] = xy.x;
      arr[5] = xy.y;
      setTransform(node, "matrix(".concat(arr.join(","), ")"));
    } else {
      var match3d = transform.match(matrix3d)[1];
      arr = match3d.split(",").map(function(item) {
        return parseFloat(item, 10);
      });
      arr[12] = xy.x;
      arr[13] = xy.y;
      setTransform(node, "matrix3d(".concat(arr.join(","), ")"));
    }
  } else {
    setTransform(node, "translateX(".concat(xy.x, "px) translateY(").concat(xy.y, "px) translateZ(0)"));
  }
}
var RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source;
var getComputedStyleX;
function forceRelayout(elem) {
  var originalStyle = elem.style.display;
  elem.style.display = "none";
  elem.offsetHeight;
  elem.style.display = originalStyle;
}
function css(el, name, v) {
  var value = v;
  if (_typeof2(name) === "object") {
    for (var i in name) {
      if (name.hasOwnProperty(i)) {
        css(el, i, name[i]);
      }
    }
    return void 0;
  }
  if (typeof value !== "undefined") {
    if (typeof value === "number") {
      value = "".concat(value, "px");
    }
    el.style[name] = value;
    return void 0;
  }
  return getComputedStyleX(el, name);
}
function getClientPosition(elem) {
  var box;
  var x;
  var y;
  var doc = elem.ownerDocument;
  var body = doc.body;
  var docElem = doc && doc.documentElement;
  box = elem.getBoundingClientRect();
  x = Math.floor(box.left);
  y = Math.floor(box.top);
  x -= docElem.clientLeft || body.clientLeft || 0;
  y -= docElem.clientTop || body.clientTop || 0;
  return {
    left: x,
    top: y
  };
}
function getScroll(w, top) {
  var ret = w["page".concat(top ? "Y" : "X", "Offset")];
  var method = "scroll".concat(top ? "Top" : "Left");
  if (typeof ret !== "number") {
    var d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== "number") {
      ret = d.body[method];
    }
  }
  return ret;
}
function getScrollLeft(w) {
  return getScroll(w);
}
function getScrollTop(w) {
  return getScroll(w, true);
}
function getOffset(el) {
  var pos = getClientPosition(el);
  var doc = el.ownerDocument;
  var w = doc.defaultView || doc.parentWindow;
  pos.left += getScrollLeft(w);
  pos.top += getScrollTop(w);
  return pos;
}
function isWindow(obj) {
  return obj !== null && obj !== void 0 && obj == obj.window;
}
function getDocument(node) {
  if (isWindow(node)) {
    return node.document;
  }
  if (node.nodeType === 9) {
    return node;
  }
  return node.ownerDocument;
}
function _getComputedStyle(elem, name, cs) {
  var computedStyle = cs;
  var val = "";
  var d = getDocument(elem);
  computedStyle = computedStyle || d.defaultView.getComputedStyle(elem, null);
  if (computedStyle) {
    val = computedStyle.getPropertyValue(name) || computedStyle[name];
  }
  return val;
}
var _RE_NUM_NO_PX = new RegExp("^(".concat(RE_NUM, ")(?!px)[a-z%]+$"), "i");
var RE_POS = /^(top|right|bottom|left)$/;
var CURRENT_STYLE = "currentStyle";
var RUNTIME_STYLE = "runtimeStyle";
var LEFT = "left";
var PX = "px";
function _getComputedStyleIE(elem, name) {
  var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];
  if (_RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
    var style2 = elem.style;
    var left = style2[LEFT];
    var rsLeft = elem[RUNTIME_STYLE][LEFT];
    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
    style2[LEFT] = name === "fontSize" ? "1em" : ret || 0;
    ret = style2.pixelLeft + PX;
    style2[LEFT] = left;
    elem[RUNTIME_STYLE][LEFT] = rsLeft;
  }
  return ret === "" ? "auto" : ret;
}
if (typeof window !== "undefined") {
  getComputedStyleX = window.getComputedStyle ? _getComputedStyle : _getComputedStyleIE;
}
function getOffsetDirection(dir, option) {
  if (dir === "left") {
    return option.useCssRight ? "right" : dir;
  }
  return option.useCssBottom ? "bottom" : dir;
}
function oppositeOffsetDirection(dir) {
  if (dir === "left") {
    return "right";
  } else if (dir === "right") {
    return "left";
  } else if (dir === "top") {
    return "bottom";
  } else if (dir === "bottom") {
    return "top";
  }
}
function setLeftTop(elem, offset2, option) {
  if (css(elem, "position") === "static") {
    elem.style.position = "relative";
  }
  var presetH = -999;
  var presetV = -999;
  var horizontalProperty = getOffsetDirection("left", option);
  var verticalProperty = getOffsetDirection("top", option);
  var oppositeHorizontalProperty = oppositeOffsetDirection(horizontalProperty);
  var oppositeVerticalProperty = oppositeOffsetDirection(verticalProperty);
  if (horizontalProperty !== "left") {
    presetH = 999;
  }
  if (verticalProperty !== "top") {
    presetV = 999;
  }
  var originalTransition = "";
  var originalOffset = getOffset(elem);
  if ("left" in offset2 || "top" in offset2) {
    originalTransition = getTransitionProperty(elem) || "";
    setTransitionProperty(elem, "none");
  }
  if ("left" in offset2) {
    elem.style[oppositeHorizontalProperty] = "";
    elem.style[horizontalProperty] = "".concat(presetH, "px");
  }
  if ("top" in offset2) {
    elem.style[oppositeVerticalProperty] = "";
    elem.style[verticalProperty] = "".concat(presetV, "px");
  }
  forceRelayout(elem);
  var old = getOffset(elem);
  var originalStyle = {};
  for (var key in offset2) {
    if (offset2.hasOwnProperty(key)) {
      var dir = getOffsetDirection(key, option);
      var preset = key === "left" ? presetH : presetV;
      var off = originalOffset[key] - old[key];
      if (dir === key) {
        originalStyle[dir] = preset + off;
      } else {
        originalStyle[dir] = preset - off;
      }
    }
  }
  css(elem, originalStyle);
  forceRelayout(elem);
  if ("left" in offset2 || "top" in offset2) {
    setTransitionProperty(elem, originalTransition);
  }
  var ret = {};
  for (var _key in offset2) {
    if (offset2.hasOwnProperty(_key)) {
      var _dir = getOffsetDirection(_key, option);
      var _off = offset2[_key] - originalOffset[_key];
      if (_key === _dir) {
        ret[_dir] = originalStyle[_dir] + _off;
      } else {
        ret[_dir] = originalStyle[_dir] - _off;
      }
    }
  }
  css(elem, ret);
}
function setTransform$1(elem, offset2) {
  var originalOffset = getOffset(elem);
  var originalXY = getTransformXY(elem);
  var resultXY = {
    x: originalXY.x,
    y: originalXY.y
  };
  if ("left" in offset2) {
    resultXY.x = originalXY.x + offset2.left - originalOffset.left;
  }
  if ("top" in offset2) {
    resultXY.y = originalXY.y + offset2.top - originalOffset.top;
  }
  setTransformXY(elem, resultXY);
}
function setOffset(elem, offset2, option) {
  if (option.ignoreShake) {
    var oriOffset = getOffset(elem);
    var oLeft = oriOffset.left.toFixed(0);
    var oTop = oriOffset.top.toFixed(0);
    var tLeft = offset2.left.toFixed(0);
    var tTop = offset2.top.toFixed(0);
    if (oLeft === tLeft && oTop === tTop) {
      return;
    }
  }
  if (option.useCssRight || option.useCssBottom) {
    setLeftTop(elem, offset2, option);
  } else if (option.useCssTransform && getTransformName() in document.body.style) {
    setTransform$1(elem, offset2);
  } else {
    setLeftTop(elem, offset2, option);
  }
}
function each(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    fn(arr[i]);
  }
}
function isBorderBoxFn(elem) {
  return getComputedStyleX(elem, "boxSizing") === "border-box";
}
var BOX_MODELS = ["margin", "border", "padding"];
var CONTENT_INDEX = -1;
var PADDING_INDEX = 2;
var BORDER_INDEX = 1;
var MARGIN_INDEX = 0;
function swap(elem, options, callback) {
  var old = {};
  var style2 = elem.style;
  var name;
  for (name in options) {
    if (options.hasOwnProperty(name)) {
      old[name] = style2[name];
      style2[name] = options[name];
    }
  }
  callback.call(elem);
  for (name in options) {
    if (options.hasOwnProperty(name)) {
      style2[name] = old[name];
    }
  }
}
function getPBMWidth(elem, props, which) {
  var value = 0;
  var prop;
  var j;
  var i;
  for (j = 0; j < props.length; j++) {
    prop = props[j];
    if (prop) {
      for (i = 0; i < which.length; i++) {
        var cssProp = void 0;
        if (prop === "border") {
          cssProp = "".concat(prop).concat(which[i], "Width");
        } else {
          cssProp = prop + which[i];
        }
        value += parseFloat(getComputedStyleX(elem, cssProp)) || 0;
      }
    }
  }
  return value;
}
var domUtils = {
  getParent: function getParent(element) {
    var parent = element;
    do {
      if (parent.nodeType === 11 && parent.host) {
        parent = parent.host;
      } else {
        parent = parent.parentNode;
      }
    } while (parent && parent.nodeType !== 1 && parent.nodeType !== 9);
    return parent;
  }
};
each(["Width", "Height"], function(name) {
  domUtils["doc".concat(name)] = function(refWin) {
    var d = refWin.document;
    return Math.max(
      // firefox chrome documentElement.scrollHeight< body.scrollHeight
      // ie standard mode : documentElement.scrollHeight> body.scrollHeight
      d.documentElement["scroll".concat(name)],
      // quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
      d.body["scroll".concat(name)],
      domUtils["viewport".concat(name)](d)
    );
  };
  domUtils["viewport".concat(name)] = function(win) {
    var prop = "client".concat(name);
    var doc = win.document;
    var body = doc.body;
    var documentElement = doc.documentElement;
    var documentElementProp = documentElement[prop];
    return doc.compatMode === "CSS1Compat" && documentElementProp || body && body[prop] || documentElementProp;
  };
});
function getWH(elem, name, ex) {
  var extra = ex;
  if (isWindow(elem)) {
    return name === "width" ? domUtils.viewportWidth(elem) : domUtils.viewportHeight(elem);
  } else if (elem.nodeType === 9) {
    return name === "width" ? domUtils.docWidth(elem) : domUtils.docHeight(elem);
  }
  var which = name === "width" ? ["Left", "Right"] : ["Top", "Bottom"];
  var borderBoxValue = name === "width" ? Math.floor(elem.getBoundingClientRect().width) : Math.floor(elem.getBoundingClientRect().height);
  var isBorderBox = isBorderBoxFn(elem);
  var cssBoxValue = 0;
  if (borderBoxValue === null || borderBoxValue === void 0 || borderBoxValue <= 0) {
    borderBoxValue = void 0;
    cssBoxValue = getComputedStyleX(elem, name);
    if (cssBoxValue === null || cssBoxValue === void 0 || Number(cssBoxValue) < 0) {
      cssBoxValue = elem.style[name] || 0;
    }
    cssBoxValue = Math.floor(parseFloat(cssBoxValue)) || 0;
  }
  if (extra === void 0) {
    extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
  }
  var borderBoxValueOrIsBorderBox = borderBoxValue !== void 0 || isBorderBox;
  var val = borderBoxValue || cssBoxValue;
  if (extra === CONTENT_INDEX) {
    if (borderBoxValueOrIsBorderBox) {
      return val - getPBMWidth(elem, ["border", "padding"], which);
    }
    return cssBoxValue;
  } else if (borderBoxValueOrIsBorderBox) {
    if (extra === BORDER_INDEX) {
      return val;
    }
    return val + (extra === PADDING_INDEX ? -getPBMWidth(elem, ["border"], which) : getPBMWidth(elem, ["margin"], which));
  }
  return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which);
}
var cssShow = {
  position: "absolute",
  visibility: "hidden",
  display: "block"
};
function getWHIgnoreDisplay() {
  for (var _len = arguments.length, args = new Array(_len), _key2 = 0; _key2 < _len; _key2++) {
    args[_key2] = arguments[_key2];
  }
  var val;
  var elem = args[0];
  if (elem.offsetWidth !== 0) {
    val = getWH.apply(void 0, args);
  } else {
    swap(elem, cssShow, function() {
      val = getWH.apply(void 0, args);
    });
  }
  return val;
}
each(["width", "height"], function(name) {
  var first = name.charAt(0).toUpperCase() + name.slice(1);
  domUtils["outer".concat(first)] = function(el, includeMargin) {
    return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX);
  };
  var which = name === "width" ? ["Left", "Right"] : ["Top", "Bottom"];
  domUtils[name] = function(elem, v) {
    var val = v;
    if (val !== void 0) {
      if (elem) {
        var isBorderBox = isBorderBoxFn(elem);
        if (isBorderBox) {
          val += getPBMWidth(elem, ["padding", "border"], which);
        }
        return css(elem, name, val);
      }
      return void 0;
    }
    return elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX);
  };
});
function mix(to, from) {
  for (var i in from) {
    if (from.hasOwnProperty(i)) {
      to[i] = from[i];
    }
  }
  return to;
}
var utils = {
  getWindow: function getWindow(node) {
    if (node && node.document && node.setTimeout) {
      return node;
    }
    var doc = node.ownerDocument || node;
    return doc.defaultView || doc.parentWindow;
  },
  getDocument,
  offset: function offset(el, value, option) {
    if (typeof value !== "undefined") {
      setOffset(el, value, option || {});
    } else {
      return getOffset(el);
    }
  },
  isWindow,
  each,
  css,
  clone: function clone(obj) {
    var i;
    var ret = {};
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        ret[i] = obj[i];
      }
    }
    var overflow = obj.overflow;
    if (overflow) {
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          ret.overflow[i] = obj.overflow[i];
        }
      }
    }
    return ret;
  },
  mix,
  getWindowScrollLeft: function getWindowScrollLeft(w) {
    return getScrollLeft(w);
  },
  getWindowScrollTop: function getWindowScrollTop(w) {
    return getScrollTop(w);
  },
  merge: function merge() {
    var ret = {};
    for (var i = 0; i < arguments.length; i++) {
      utils.mix(ret, i < 0 || arguments.length <= i ? void 0 : arguments[i]);
    }
    return ret;
  },
  viewportWidth: 0,
  viewportHeight: 0
};
mix(utils, domUtils);
var getParent2 = utils.getParent;
function getOffsetParent(element) {
  if (utils.isWindow(element) || element.nodeType === 9) {
    return null;
  }
  var doc = utils.getDocument(element);
  var body = doc.body;
  var parent;
  var positionStyle = utils.css(element, "position");
  var skipStatic = positionStyle === "fixed" || positionStyle === "absolute";
  if (!skipStatic) {
    return element.nodeName.toLowerCase() === "html" ? null : getParent2(element);
  }
  for (parent = getParent2(element); parent && parent !== body && parent.nodeType !== 9; parent = getParent2(parent)) {
    positionStyle = utils.css(parent, "position");
    if (positionStyle !== "static") {
      return parent;
    }
  }
  return null;
}
var getParent$1 = utils.getParent;
function isAncestorFixed(element) {
  if (utils.isWindow(element) || element.nodeType === 9) {
    return false;
  }
  var doc = utils.getDocument(element);
  var body = doc.body;
  var parent = null;
  for (
    parent = getParent$1(element);
    // 修复元素位于 document.documentElement 下导致崩溃问题
    parent && parent !== body && parent !== doc;
    parent = getParent$1(parent)
  ) {
    var positionStyle = utils.css(parent, "position");
    if (positionStyle === "fixed") {
      return true;
    }
  }
  return false;
}
function getVisibleRectForElement(element, alwaysByViewport) {
  var visibleRect = {
    left: 0,
    right: Infinity,
    top: 0,
    bottom: Infinity
  };
  var el = getOffsetParent(element);
  var doc = utils.getDocument(element);
  var win = doc.defaultView || doc.parentWindow;
  var body = doc.body;
  var documentElement = doc.documentElement;
  while (el) {
    if ((navigator.userAgent.indexOf("MSIE") === -1 || el.clientWidth !== 0) && // body may have overflow set on it, yet we still get the entire
    // viewport. In some browsers, el.offsetParent may be
    // document.documentElement, so check for that too.
    el !== body && el !== documentElement && utils.css(el, "overflow") !== "visible") {
      var pos = utils.offset(el);
      pos.left += el.clientLeft;
      pos.top += el.clientTop;
      visibleRect.top = Math.max(visibleRect.top, pos.top);
      visibleRect.right = Math.min(
        visibleRect.right,
        // consider area without scrollBar
        pos.left + el.clientWidth
      );
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.left);
    } else if (el === body || el === documentElement) {
      break;
    }
    el = getOffsetParent(el);
  }
  var originalPosition = null;
  if (!utils.isWindow(element) && element.nodeType !== 9) {
    originalPosition = element.style.position;
    var position = utils.css(element, "position");
    if (position === "absolute") {
      element.style.position = "fixed";
    }
  }
  var scrollX = utils.getWindowScrollLeft(win);
  var scrollY = utils.getWindowScrollTop(win);
  var viewportWidth = utils.viewportWidth(win);
  var viewportHeight = utils.viewportHeight(win);
  var documentWidth = documentElement.scrollWidth;
  var documentHeight = documentElement.scrollHeight;
  var bodyStyle = window.getComputedStyle(body);
  if (bodyStyle.overflowX === "hidden") {
    documentWidth = win.innerWidth;
  }
  if (bodyStyle.overflowY === "hidden") {
    documentHeight = win.innerHeight;
  }
  if (element.style) {
    element.style.position = originalPosition;
  }
  if (alwaysByViewport || isAncestorFixed(element)) {
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    visibleRect.right = Math.min(visibleRect.right, scrollX + viewportWidth);
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + viewportHeight);
  } else {
    var maxVisibleWidth = Math.max(documentWidth, scrollX + viewportWidth);
    visibleRect.right = Math.min(visibleRect.right, maxVisibleWidth);
    var maxVisibleHeight = Math.max(documentHeight, scrollY + viewportHeight);
    visibleRect.bottom = Math.min(visibleRect.bottom, maxVisibleHeight);
  }
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null;
}
function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
  var pos = utils.clone(elFuturePos);
  var size = {
    width: elRegion.width,
    height: elRegion.height
  };
  if (overflow.adjustX && pos.left < visibleRect.left) {
    pos.left = visibleRect.left;
  }
  if (overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right) {
    size.width -= pos.left + size.width - visibleRect.right;
  }
  if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
    pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
  }
  if (overflow.adjustY && pos.top < visibleRect.top) {
    pos.top = visibleRect.top;
  }
  if (overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom) {
    size.height -= pos.top + size.height - visibleRect.bottom;
  }
  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
  }
  return utils.mix(pos, size);
}
function getRegion(node) {
  var offset2;
  var w;
  var h;
  if (!utils.isWindow(node) && node.nodeType !== 9) {
    offset2 = utils.offset(node);
    w = utils.outerWidth(node);
    h = utils.outerHeight(node);
  } else {
    var win = utils.getWindow(node);
    offset2 = {
      left: utils.getWindowScrollLeft(win),
      top: utils.getWindowScrollTop(win)
    };
    w = utils.viewportWidth(win);
    h = utils.viewportHeight(win);
  }
  offset2.width = w;
  offset2.height = h;
  return offset2;
}
function getAlignOffset(region, align) {
  var V = align.charAt(0);
  var H = align.charAt(1);
  var w = region.width;
  var h = region.height;
  var x = region.left;
  var y = region.top;
  if (V === "c") {
    y += h / 2;
  } else if (V === "b") {
    y += h;
  }
  if (H === "c") {
    x += w / 2;
  } else if (H === "r") {
    x += w;
  }
  return {
    left: x,
    top: y
  };
}
function getElFuturePos(elRegion, refNodeRegion, points, offset2, targetOffset3) {
  var p1 = getAlignOffset(refNodeRegion, points[1]);
  var p2 = getAlignOffset(elRegion, points[0]);
  var diff = [p2.left - p1.left, p2.top - p1.top];
  return {
    left: Math.round(elRegion.left - diff[0] + offset2[0] - targetOffset3[0]),
    top: Math.round(elRegion.top - diff[1] + offset2[1] - targetOffset3[1])
  };
}
function isFailX(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right;
}
function isFailY(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom;
}
function isCompleteFailX(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.left > visibleRect.right || elFuturePos.left + elRegion.width < visibleRect.left;
}
function isCompleteFailY(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.top > visibleRect.bottom || elFuturePos.top + elRegion.height < visibleRect.top;
}
function flip(points, reg, map) {
  var ret = [];
  utils.each(points, function(p) {
    ret.push(p.replace(reg, function(m) {
      return map[m];
    }));
  });
  return ret;
}
function flipOffset(offset2, index) {
  offset2[index] = -offset2[index];
  return offset2;
}
function convertOffset(str, offsetLen) {
  var n;
  if (/%$/.test(str)) {
    n = parseInt(str.substring(0, str.length - 1), 10) / 100 * offsetLen;
  } else {
    n = parseInt(str, 10);
  }
  return n || 0;
}
function normalizeOffset(offset2, el) {
  offset2[0] = convertOffset(offset2[0], el.width);
  offset2[1] = convertOffset(offset2[1], el.height);
}
function doAlign(el, tgtRegion, align, isTgtRegionVisible) {
  var points = align.points;
  var offset2 = align.offset || [0, 0];
  var targetOffset3 = align.targetOffset || [0, 0];
  var overflow = align.overflow;
  var source = align.source || el;
  offset2 = [].concat(offset2);
  targetOffset3 = [].concat(targetOffset3);
  overflow = overflow || {};
  var newOverflowCfg = {};
  var fail = 0;
  var alwaysByViewport = !!(overflow && overflow.alwaysByViewport);
  var visibleRect = getVisibleRectForElement(source, alwaysByViewport);
  var elRegion = getRegion(source);
  normalizeOffset(offset2, elRegion);
  normalizeOffset(targetOffset3, tgtRegion);
  var elFuturePos = getElFuturePos(elRegion, tgtRegion, points, offset2, targetOffset3);
  var newElRegion = utils.merge(elRegion, elFuturePos);
  if (visibleRect && (overflow.adjustX || overflow.adjustY) && isTgtRegionVisible) {
    if (overflow.adjustX) {
      if (isFailX(elFuturePos, elRegion, visibleRect)) {
        var newPoints = flip(points, /[lr]/gi, {
          l: "r",
          r: "l"
        });
        var newOffset = flipOffset(offset2, 0);
        var newTargetOffset = flipOffset(targetOffset3, 0);
        var newElFuturePos = getElFuturePos(elRegion, tgtRegion, newPoints, newOffset, newTargetOffset);
        if (!isCompleteFailX(newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = newPoints;
          offset2 = newOffset;
          targetOffset3 = newTargetOffset;
        }
      }
    }
    if (overflow.adjustY) {
      if (isFailY(elFuturePos, elRegion, visibleRect)) {
        var _newPoints = flip(points, /[tb]/gi, {
          t: "b",
          b: "t"
        });
        var _newOffset = flipOffset(offset2, 1);
        var _newTargetOffset = flipOffset(targetOffset3, 1);
        var _newElFuturePos = getElFuturePos(elRegion, tgtRegion, _newPoints, _newOffset, _newTargetOffset);
        if (!isCompleteFailY(_newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = _newPoints;
          offset2 = _newOffset;
          targetOffset3 = _newTargetOffset;
        }
      }
    }
    if (fail) {
      elFuturePos = getElFuturePos(elRegion, tgtRegion, points, offset2, targetOffset3);
      utils.mix(newElRegion, elFuturePos);
    }
    var isStillFailX = isFailX(elFuturePos, elRegion, visibleRect);
    var isStillFailY = isFailY(elFuturePos, elRegion, visibleRect);
    if (isStillFailX || isStillFailY) {
      var _newPoints2 = points;
      if (isStillFailX) {
        _newPoints2 = flip(points, /[lr]/gi, {
          l: "r",
          r: "l"
        });
      }
      if (isStillFailY) {
        _newPoints2 = flip(points, /[tb]/gi, {
          t: "b",
          b: "t"
        });
      }
      points = _newPoints2;
      offset2 = align.offset || [0, 0];
      targetOffset3 = align.targetOffset || [0, 0];
    }
    newOverflowCfg.adjustX = overflow.adjustX && isStillFailX;
    newOverflowCfg.adjustY = overflow.adjustY && isStillFailY;
    if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  if (newElRegion.width !== elRegion.width) {
    utils.css(source, "width", utils.width(source) + newElRegion.width - elRegion.width);
  }
  if (newElRegion.height !== elRegion.height) {
    utils.css(source, "height", utils.height(source) + newElRegion.height - elRegion.height);
  }
  utils.offset(source, {
    left: newElRegion.left,
    top: newElRegion.top
  }, {
    useCssRight: align.useCssRight,
    useCssBottom: align.useCssBottom,
    useCssTransform: align.useCssTransform,
    ignoreShake: align.ignoreShake
  });
  return {
    points,
    offset: offset2,
    targetOffset: targetOffset3,
    overflow: newOverflowCfg
  };
}
function isOutOfVisibleRect(target, alwaysByViewport) {
  var visibleRect = getVisibleRectForElement(target, alwaysByViewport);
  var targetRegion = getRegion(target);
  return !visibleRect || targetRegion.left + targetRegion.width <= visibleRect.left || targetRegion.top + targetRegion.height <= visibleRect.top || targetRegion.left >= visibleRect.right || targetRegion.top >= visibleRect.bottom;
}
function alignElement(el, refNode, align) {
  var target = align.target || refNode;
  var refNodeRegion = getRegion(target);
  var isTargetNotOutOfVisible = !isOutOfVisibleRect(target, align.overflow && align.overflow.alwaysByViewport);
  return doAlign(el, refNodeRegion, align, isTargetNotOutOfVisible);
}
alignElement.__getOffsetParent = getOffsetParent;
alignElement.__getVisibleRectForElement = getVisibleRectForElement;
function alignPoint(el, tgtPoint, align) {
  var pageX;
  var pageY;
  var doc = utils.getDocument(el);
  var win = doc.defaultView || doc.parentWindow;
  var scrollX = utils.getWindowScrollLeft(win);
  var scrollY = utils.getWindowScrollTop(win);
  var viewportWidth = utils.viewportWidth(win);
  var viewportHeight = utils.viewportHeight(win);
  if ("pageX" in tgtPoint) {
    pageX = tgtPoint.pageX;
  } else {
    pageX = scrollX + tgtPoint.clientX;
  }
  if ("pageY" in tgtPoint) {
    pageY = tgtPoint.pageY;
  } else {
    pageY = scrollY + tgtPoint.clientY;
  }
  var tgtRegion = {
    left: pageX,
    top: pageY,
    width: 0,
    height: 0
  };
  var pointInView = pageX >= 0 && pageX <= scrollX + viewportWidth && pageY >= 0 && pageY <= scrollY + viewportHeight;
  var points = [align.points[0], "cc"];
  return doAlign(el, tgtRegion, _objectSpread22(_objectSpread22({}, align), {}, {
    points
  }), pointInView);
}

// ../../node_modules/rc-util/es/isEqual.js
function isEqual(obj1, obj2) {
  var shallow = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
  var refSet = /* @__PURE__ */ new Set();
  function deepEqual(a, b) {
    var level = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
    var circular = refSet.has(a);
    warning_default(!circular, "Warning: There may be circular references");
    if (circular) {
      return false;
    }
    if (a === b) {
      return true;
    }
    if (shallow && level > 1) {
      return false;
    }
    refSet.add(a);
    var newLevel = level + 1;
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i], newLevel)) {
          return false;
        }
      }
      return true;
    }
    if (a && b && _typeof(a) === "object" && _typeof(b) === "object") {
      var keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) {
        return false;
      }
      return keys.every(function(key) {
        return deepEqual(a[key], b[key], newLevel);
      });
    }
    return false;
  }
  return deepEqual(obj1, obj2);
}
var isEqual_default = isEqual;

// ../../node_modules/rc-util/es/Dom/isVisible.js
var isVisible_default = function(element) {
  if (!element) {
    return false;
  }
  if (element instanceof Element) {
    if (element.offsetParent) {
      return true;
    }
    if (element.getBBox) {
      var _getBBox = element.getBBox(), width = _getBBox.width, height = _getBBox.height;
      if (width || height) {
        return true;
      }
    }
    if (element.getBoundingClientRect) {
      var _element$getBoundingC = element.getBoundingClientRect(), _width = _element$getBoundingC.width, _height = _element$getBoundingC.height;
      if (_width || _height) {
        return true;
      }
    }
  }
  return false;
};

// ../../node_modules/rc-align/es/Align.js
var import_react14 = __toESM(require_react());

// ../../node_modules/rc-align/es/hooks/useBuffer.js
var import_react13 = __toESM(require_react());
var useBuffer_default = function(callback, buffer) {
  var calledRef = import_react13.default.useRef(false);
  var timeoutRef = import_react13.default.useRef(null);
  function cancelTrigger() {
    window.clearTimeout(timeoutRef.current);
  }
  function trigger(force) {
    cancelTrigger();
    if (!calledRef.current || force === true) {
      if (callback(force) === false) {
        return;
      }
      calledRef.current = true;
      timeoutRef.current = window.setTimeout(function() {
        calledRef.current = false;
      }, buffer);
    } else {
      timeoutRef.current = window.setTimeout(function() {
        calledRef.current = false;
        trigger();
      }, buffer);
    }
  }
  return [trigger, function() {
    calledRef.current = false;
    cancelTrigger();
  }];
};

// ../../node_modules/rc-align/es/util.js
function isSamePoint(prev, next) {
  if (prev === next)
    return true;
  if (!prev || !next)
    return false;
  if ("pageX" in next && "pageY" in next) {
    return prev.pageX === next.pageX && prev.pageY === next.pageY;
  }
  if ("clientX" in next && "clientY" in next) {
    return prev.clientX === next.clientX && prev.clientY === next.clientY;
  }
  return false;
}
function restoreFocus(activeElement, container) {
  if (activeElement !== document.activeElement && contains(container, activeElement) && typeof activeElement.focus === "function") {
    activeElement.focus();
  }
}
function monitorResize(element, callback) {
  var prevWidth = null;
  var prevHeight = null;
  function onResize2(_ref) {
    var _ref2 = _slicedToArray(_ref, 1), target = _ref2[0].target;
    if (!document.documentElement.contains(target))
      return;
    var _target$getBoundingCl = target.getBoundingClientRect(), width = _target$getBoundingCl.width, height = _target$getBoundingCl.height;
    var fixedWidth = Math.floor(width);
    var fixedHeight = Math.floor(height);
    if (prevWidth !== fixedWidth || prevHeight !== fixedHeight) {
      Promise.resolve().then(function() {
        callback({
          width: fixedWidth,
          height: fixedHeight
        });
      });
    }
    prevWidth = fixedWidth;
    prevHeight = fixedHeight;
  }
  var resizeObserver2 = new ResizeObserver_es_default(onResize2);
  if (element) {
    resizeObserver2.observe(element);
  }
  return function() {
    resizeObserver2.disconnect();
  };
}

// ../../node_modules/rc-align/es/Align.js
function getElement(func) {
  if (typeof func !== "function")
    return null;
  return func();
}
function getPoint(point) {
  if (_typeof(point) !== "object" || !point)
    return null;
  return point;
}
var Align = function Align2(_ref, ref) {
  var children = _ref.children, disabled = _ref.disabled, target = _ref.target, align = _ref.align, onAlign = _ref.onAlign, monitorWindowResize = _ref.monitorWindowResize, _ref$monitorBufferTim = _ref.monitorBufferTime, monitorBufferTime = _ref$monitorBufferTim === void 0 ? 0 : _ref$monitorBufferTim;
  var cacheRef = import_react14.default.useRef({});
  var nodeRef = import_react14.default.useRef();
  var childNode = import_react14.default.Children.only(children);
  var forceAlignPropsRef = import_react14.default.useRef({});
  forceAlignPropsRef.current.disabled = disabled;
  forceAlignPropsRef.current.target = target;
  forceAlignPropsRef.current.align = align;
  forceAlignPropsRef.current.onAlign = onAlign;
  var _useBuffer = useBuffer_default(function() {
    var _forceAlignPropsRef$c = forceAlignPropsRef.current, latestDisabled = _forceAlignPropsRef$c.disabled, latestTarget = _forceAlignPropsRef$c.target, latestAlign = _forceAlignPropsRef$c.align, latestOnAlign = _forceAlignPropsRef$c.onAlign;
    var source = nodeRef.current;
    if (!latestDisabled && latestTarget && source) {
      var _result;
      var _element = getElement(latestTarget);
      var _point = getPoint(latestTarget);
      cacheRef.current.element = _element;
      cacheRef.current.point = _point;
      cacheRef.current.align = latestAlign;
      var _document = document, activeElement = _document.activeElement;
      if (_element && isVisible_default(_element)) {
        _result = alignElement(source, _element, latestAlign);
      } else if (_point) {
        _result = alignPoint(source, _point, latestAlign);
      }
      restoreFocus(activeElement, source);
      if (latestOnAlign && _result) {
        latestOnAlign(source, _result);
      }
      return true;
    }
    return false;
  }, monitorBufferTime), _useBuffer2 = _slicedToArray(_useBuffer, 2), _forceAlign = _useBuffer2[0], cancelForceAlign = _useBuffer2[1];
  var _React$useState = import_react14.default.useState(), _React$useState2 = _slicedToArray(_React$useState, 2), element = _React$useState2[0], setElement = _React$useState2[1];
  var _React$useState3 = import_react14.default.useState(), _React$useState4 = _slicedToArray(_React$useState3, 2), point = _React$useState4[0], setPoint = _React$useState4[1];
  useLayoutEffect_default(function() {
    setElement(getElement(target));
    setPoint(getPoint(target));
  });
  import_react14.default.useEffect(function() {
    if (cacheRef.current.element !== element || !isSamePoint(cacheRef.current.point, point) || !isEqual_default(cacheRef.current.align, align)) {
      _forceAlign();
    }
  });
  import_react14.default.useEffect(function() {
    var cancelFn = monitorResize(nodeRef.current, _forceAlign);
    return cancelFn;
  }, [nodeRef.current]);
  import_react14.default.useEffect(function() {
    var cancelFn = monitorResize(element, _forceAlign);
    return cancelFn;
  }, [element]);
  import_react14.default.useEffect(function() {
    if (!disabled) {
      _forceAlign();
    } else {
      cancelForceAlign();
    }
  }, [disabled]);
  import_react14.default.useEffect(function() {
    if (monitorWindowResize) {
      var cancelFn = addEventListenerWrap(window, "resize", _forceAlign);
      return cancelFn.remove;
    }
  }, [monitorWindowResize]);
  import_react14.default.useEffect(function() {
    return function() {
      cancelForceAlign();
    };
  }, []);
  import_react14.default.useImperativeHandle(ref, function() {
    return {
      forceAlign: function forceAlign() {
        return _forceAlign(true);
      }
    };
  });
  if (import_react14.default.isValidElement(childNode)) {
    childNode = import_react14.default.cloneElement(childNode, {
      ref: composeRef(childNode.ref, nodeRef)
    });
  }
  return childNode;
};
var RcAlign = import_react14.default.forwardRef(Align);
RcAlign.displayName = "Align";
var Align_default = RcAlign;

// ../../node_modules/rc-align/es/index.js
var es_default4 = Align_default;

// ../../node_modules/rc-trigger/es/Popup/PopupInner.js
var import_classnames9 = __toESM(require_classnames());

// ../../node_modules/@babel/runtime/helpers/esm/regeneratorRuntime.js
function _regeneratorRuntime() {
  "use strict";
  _regeneratorRuntime = function _regeneratorRuntime2() {
    return exports;
  };
  var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function(obj, key, desc) {
    obj[key] = desc.value;
  }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define2(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {
  }
  function GeneratorFunction() {
  }
  function GeneratorFunctionPrototype() {
  }
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function() {
    return this;
  });
  var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
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
    defineProperty(this, "_invoke", {
      value: function value(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
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
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method, method = delegate.iterator[methodName];
    if (void 0 === method)
      return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = void 0, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type)
      return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = void 0), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(true);
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
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: void 0,
      done: true
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: true
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: true
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function(genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function(genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function(arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function() {
    return this;
  }), define(Gp, "toString", function() {
    return "[object Generator]";
  }), exports.keys = function(val) {
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
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = false, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(resetTryEntry), !skipTempReset)
        for (var name in this)
          "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = void 0);
    },
    stop: function stop() {
      this.done = true;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type)
        throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
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
    },
    abrupt: function abrupt(type, arg) {
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
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type)
        throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc)
          return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
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
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName,
        nextLoc
      }, "next" === this.method && (this.arg = void 0), ContinueSentinel;
    }
  }, exports;
}

// ../../node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
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

// ../../node_modules/rc-trigger/es/Popup/useVisibleStatus.js
var import_react15 = __toESM(require_react());
var StatusQueue = ["measure", "alignPre", "align", null, "motion"];
var useVisibleStatus_default = function(visible, doMeasure) {
  var _useState = useSafeState(null), _useState2 = _slicedToArray(_useState, 2), status = _useState2[0], setInternalStatus = _useState2[1];
  var rafRef = (0, import_react15.useRef)();
  function setStatus(nextStatus) {
    setInternalStatus(nextStatus, true);
  }
  function cancelRaf() {
    raf_default.cancel(rafRef.current);
  }
  function goNextStatus(callback) {
    cancelRaf();
    rafRef.current = raf_default(function() {
      setStatus(function(prev) {
        switch (status) {
          case "align":
            return "motion";
          case "motion":
            return "stable";
          default:
        }
        return prev;
      });
      callback === null || callback === void 0 ? void 0 : callback();
    });
  }
  (0, import_react15.useEffect)(function() {
    setStatus("measure");
  }, [visible]);
  (0, import_react15.useEffect)(function() {
    switch (status) {
      case "measure":
        doMeasure();
        break;
      default:
    }
    if (status) {
      rafRef.current = raf_default(_asyncToGenerator(_regeneratorRuntime().mark(function _callee() {
        var index, nextStatus;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                index = StatusQueue.indexOf(status);
                nextStatus = StatusQueue[index + 1];
                if (nextStatus && index !== -1) {
                  setStatus(nextStatus);
                }
              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      })));
    }
  }, [status]);
  (0, import_react15.useEffect)(function() {
    return function() {
      cancelRaf();
    };
  }, []);
  return [status, goNextStatus];
};

// ../../node_modules/rc-trigger/es/Popup/useStretchStyle.js
var React35 = __toESM(require_react());
var useStretchStyle_default = function(stretch) {
  var _React$useState = React35.useState({
    width: 0,
    height: 0
  }), _React$useState2 = _slicedToArray(_React$useState, 2), targetSize = _React$useState2[0], setTargetSize = _React$useState2[1];
  function measureStretch(element) {
    var tgtWidth = element.offsetWidth, tgtHeight = element.offsetHeight;
    var _element$getBoundingC = element.getBoundingClientRect(), width = _element$getBoundingC.width, height = _element$getBoundingC.height;
    if (Math.abs(tgtWidth - width) < 1 && Math.abs(tgtHeight - height) < 1) {
      tgtWidth = width;
      tgtHeight = height;
    }
    setTargetSize({
      width: tgtWidth,
      height: tgtHeight
    });
  }
  var style2 = React35.useMemo(function() {
    var sizeStyle = {};
    if (stretch) {
      var width = targetSize.width, height = targetSize.height;
      if (stretch.indexOf("height") !== -1 && height) {
        sizeStyle.height = height;
      } else if (stretch.indexOf("minHeight") !== -1 && height) {
        sizeStyle.minHeight = height;
      }
      if (stretch.indexOf("width") !== -1 && width) {
        sizeStyle.width = width;
      } else if (stretch.indexOf("minWidth") !== -1 && width) {
        sizeStyle.minWidth = width;
      }
    }
    return sizeStyle;
  }, [stretch, targetSize]);
  return [style2, measureStretch];
};

// ../../node_modules/rc-trigger/es/Popup/PopupInner.js
var PopupInner = React36.forwardRef(function(props, ref) {
  var visible = props.visible, prefixCls = props.prefixCls, className = props.className, style2 = props.style, children = props.children, zIndex = props.zIndex, stretch = props.stretch, destroyPopupOnHide = props.destroyPopupOnHide, forceRender = props.forceRender, align = props.align, point = props.point, getRootDomNode = props.getRootDomNode, getClassNameFromAlign = props.getClassNameFromAlign, onAlign = props.onAlign, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onMouseDown = props.onMouseDown, onTouchStart = props.onTouchStart, onClick = props.onClick;
  var alignRef = (0, import_react16.useRef)();
  var elementRef = (0, import_react16.useRef)();
  var _useState = (0, import_react16.useState)(), _useState2 = _slicedToArray(_useState, 2), alignedClassName = _useState2[0], setAlignedClassName = _useState2[1];
  var _useStretchStyle = useStretchStyle_default(stretch), _useStretchStyle2 = _slicedToArray(_useStretchStyle, 2), stretchStyle = _useStretchStyle2[0], measureStretchStyle = _useStretchStyle2[1];
  function doMeasure() {
    if (stretch) {
      measureStretchStyle(getRootDomNode());
    }
  }
  var _useVisibleStatus = useVisibleStatus_default(visible, doMeasure), _useVisibleStatus2 = _slicedToArray(_useVisibleStatus, 2), status = _useVisibleStatus2[0], goNextStatus = _useVisibleStatus2[1];
  var _useState3 = (0, import_react16.useState)(0), _useState4 = _slicedToArray(_useState3, 2), alignTimes = _useState4[0], setAlignTimes = _useState4[1];
  var prepareResolveRef = (0, import_react16.useRef)();
  useLayoutEffect_default(function() {
    if (status === "alignPre") {
      setAlignTimes(0);
    }
  }, [status]);
  function getAlignTarget() {
    if (point) {
      return point;
    }
    return getRootDomNode;
  }
  function forceAlign() {
    var _alignRef$current;
    (_alignRef$current = alignRef.current) === null || _alignRef$current === void 0 ? void 0 : _alignRef$current.forceAlign();
  }
  function onInternalAlign(popupDomNode, matchAlign) {
    var nextAlignedClassName = getClassNameFromAlign(matchAlign);
    if (alignedClassName !== nextAlignedClassName) {
      setAlignedClassName(nextAlignedClassName);
    }
    setAlignTimes(function(val) {
      return val + 1;
    });
    if (status === "align") {
      onAlign === null || onAlign === void 0 ? void 0 : onAlign(popupDomNode, matchAlign);
    }
  }
  useLayoutEffect_default(function() {
    if (status === "align") {
      if (alignTimes < 3) {
        forceAlign();
      } else {
        goNextStatus(function() {
          var _prepareResolveRef$cu;
          (_prepareResolveRef$cu = prepareResolveRef.current) === null || _prepareResolveRef$cu === void 0 ? void 0 : _prepareResolveRef$cu.call(prepareResolveRef);
        });
      }
    }
  }, [alignTimes]);
  var motion = _objectSpread2({}, getMotion(props));
  ["onAppearEnd", "onEnterEnd", "onLeaveEnd"].forEach(function(eventName) {
    var originHandler = motion[eventName];
    motion[eventName] = function(element, event) {
      goNextStatus();
      return originHandler === null || originHandler === void 0 ? void 0 : originHandler(element, event);
    };
  });
  function onShowPrepare() {
    return new Promise(function(resolve) {
      prepareResolveRef.current = resolve;
    });
  }
  React36.useEffect(function() {
    if (!motion.motionName && status === "motion") {
      goNextStatus();
    }
  }, [motion.motionName, status]);
  React36.useImperativeHandle(ref, function() {
    return {
      forceAlign,
      getElement: function getElement2() {
        return elementRef.current;
      }
    };
  });
  var mergedStyle = _objectSpread2(_objectSpread2({}, stretchStyle), {}, {
    zIndex,
    opacity: status === "motion" || status === "stable" || !visible ? void 0 : 0,
    // Cannot interact with disappearing elements
    // https://github.com/ant-design/ant-design/issues/35051#issuecomment-1101340714
    pointerEvents: !visible && status !== "stable" ? "none" : void 0
  }, style2);
  var alignDisabled = true;
  if (align !== null && align !== void 0 && align.points && (status === "align" || status === "stable")) {
    alignDisabled = false;
  }
  var childNode = children;
  if (React36.Children.count(children) > 1) {
    childNode = React36.createElement("div", {
      className: "".concat(prefixCls, "-content")
    }, children);
  }
  return React36.createElement(es_default3, _extends({
    visible,
    ref: elementRef,
    leavedClassName: "".concat(prefixCls, "-hidden")
  }, motion, {
    onAppearPrepare: onShowPrepare,
    onEnterPrepare: onShowPrepare,
    removeOnLeave: destroyPopupOnHide,
    forceRender
  }), function(_ref, motionRef) {
    var motionClassName = _ref.className, motionStyle = _ref.style;
    var mergedClassName = (0, import_classnames9.default)(prefixCls, className, alignedClassName, motionClassName);
    return React36.createElement(es_default4, {
      target: getAlignTarget(),
      key: "popup",
      ref: alignRef,
      monitorWindowResize: true,
      disabled: alignDisabled,
      align,
      onAlign: onInternalAlign
    }, React36.createElement("div", {
      ref: motionRef,
      className: mergedClassName,
      onMouseEnter,
      onMouseLeave,
      onMouseDownCapture: onMouseDown,
      onTouchStartCapture: onTouchStart,
      onClick,
      style: _objectSpread2(_objectSpread2({}, motionStyle), mergedStyle)
    }, childNode));
  });
});
PopupInner.displayName = "PopupInner";
var PopupInner_default = PopupInner;

// ../../node_modules/rc-trigger/es/Popup/MobilePopupInner.js
init_extends();
var React37 = __toESM(require_react());
var import_classnames10 = __toESM(require_classnames());
var MobilePopupInner = React37.forwardRef(function(props, ref) {
  var prefixCls = props.prefixCls, visible = props.visible, zIndex = props.zIndex, children = props.children, _props$mobile = props.mobile;
  _props$mobile = _props$mobile === void 0 ? {} : _props$mobile;
  var popupClassName = _props$mobile.popupClassName, popupStyle = _props$mobile.popupStyle, _props$mobile$popupMo = _props$mobile.popupMotion, popupMotion = _props$mobile$popupMo === void 0 ? {} : _props$mobile$popupMo, popupRender = _props$mobile.popupRender, onClick = props.onClick;
  var elementRef = React37.useRef();
  React37.useImperativeHandle(ref, function() {
    return {
      forceAlign: function forceAlign() {
      },
      getElement: function getElement2() {
        return elementRef.current;
      }
    };
  });
  var mergedStyle = _objectSpread2({
    zIndex
  }, popupStyle);
  var childNode = children;
  if (React37.Children.count(children) > 1) {
    childNode = React37.createElement("div", {
      className: "".concat(prefixCls, "-content")
    }, children);
  }
  if (popupRender) {
    childNode = popupRender(childNode);
  }
  return React37.createElement(es_default3, _extends({
    visible,
    ref: elementRef,
    removeOnLeave: true
  }, popupMotion), function(_ref, motionRef) {
    var motionClassName = _ref.className, motionStyle = _ref.style;
    var mergedClassName = (0, import_classnames10.default)(prefixCls, popupClassName, motionClassName);
    return React37.createElement("div", {
      ref: motionRef,
      className: mergedClassName,
      onClick,
      style: _objectSpread2(_objectSpread2({}, motionStyle), mergedStyle)
    }, childNode);
  });
});
MobilePopupInner.displayName = "MobilePopupInner";
var MobilePopupInner_default = MobilePopupInner;

// ../../node_modules/rc-trigger/es/Popup/index.js
var _excluded11 = ["visible", "mobile"];
var Popup = React38.forwardRef(function(_ref, ref) {
  var visible = _ref.visible, mobile = _ref.mobile, props = _objectWithoutProperties(_ref, _excluded11);
  var _useState = (0, import_react17.useState)(visible), _useState2 = _slicedToArray(_useState, 2), innerVisible = _useState2[0], serInnerVisible = _useState2[1];
  var _useState3 = (0, import_react17.useState)(false), _useState4 = _slicedToArray(_useState3, 2), inMobile = _useState4[0], setInMobile = _useState4[1];
  var cloneProps = _objectSpread2(_objectSpread2({}, props), {}, {
    visible: innerVisible
  });
  (0, import_react17.useEffect)(function() {
    serInnerVisible(visible);
    if (visible && mobile) {
      setInMobile(isMobile_default());
    }
  }, [visible, mobile]);
  var popupNode = inMobile ? React38.createElement(MobilePopupInner_default, _extends({}, cloneProps, {
    mobile,
    ref
  })) : React38.createElement(PopupInner_default, _extends({}, cloneProps, {
    ref
  }));
  return React38.createElement("div", null, React38.createElement(Mask, cloneProps), popupNode);
});
Popup.displayName = "Popup";
var Popup_default = Popup;

// ../../node_modules/rc-trigger/es/context.js
var React39 = __toESM(require_react());
var TriggerContext = React39.createContext(null);
var context_default = TriggerContext;

// ../../node_modules/rc-trigger/es/index.js
function noop() {
}
function returnEmptyString() {
  return "";
}
function returnDocument(element) {
  if (element) {
    return element.ownerDocument;
  }
  return window.document;
}
var ALL_HANDLERS = ["onClick", "onMouseDown", "onTouchStart", "onMouseEnter", "onMouseLeave", "onFocus", "onBlur", "onContextMenu"];
function generateTrigger(PortalComponent) {
  var Trigger = function(_React$Component) {
    _inherits(Trigger2, _React$Component);
    var _super = _createSuper(Trigger2);
    function Trigger2(props) {
      var _this;
      _classCallCheck(this, Trigger2);
      _this = _super.call(this, props);
      _defineProperty(_assertThisInitialized(_this), "popupRef", React40.createRef());
      _defineProperty(_assertThisInitialized(_this), "triggerRef", React40.createRef());
      _defineProperty(_assertThisInitialized(_this), "portalContainer", void 0);
      _defineProperty(_assertThisInitialized(_this), "attachId", void 0);
      _defineProperty(_assertThisInitialized(_this), "clickOutsideHandler", void 0);
      _defineProperty(_assertThisInitialized(_this), "touchOutsideHandler", void 0);
      _defineProperty(_assertThisInitialized(_this), "contextMenuOutsideHandler1", void 0);
      _defineProperty(_assertThisInitialized(_this), "contextMenuOutsideHandler2", void 0);
      _defineProperty(_assertThisInitialized(_this), "mouseDownTimeout", void 0);
      _defineProperty(_assertThisInitialized(_this), "focusTime", void 0);
      _defineProperty(_assertThisInitialized(_this), "preClickTime", void 0);
      _defineProperty(_assertThisInitialized(_this), "preTouchTime", void 0);
      _defineProperty(_assertThisInitialized(_this), "delayTimer", void 0);
      _defineProperty(_assertThisInitialized(_this), "hasPopupMouseDown", void 0);
      _defineProperty(_assertThisInitialized(_this), "onMouseEnter", function(e) {
        var mouseEnterDelay = _this.props.mouseEnterDelay;
        _this.fireEvents("onMouseEnter", e);
        _this.delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
      });
      _defineProperty(_assertThisInitialized(_this), "onMouseMove", function(e) {
        _this.fireEvents("onMouseMove", e);
        _this.setPoint(e);
      });
      _defineProperty(_assertThisInitialized(_this), "onMouseLeave", function(e) {
        _this.fireEvents("onMouseLeave", e);
        _this.delaySetPopupVisible(false, _this.props.mouseLeaveDelay);
      });
      _defineProperty(_assertThisInitialized(_this), "onPopupMouseEnter", function() {
        _this.clearDelayTimer();
      });
      _defineProperty(_assertThisInitialized(_this), "onPopupMouseLeave", function(e) {
        var _this$popupRef$curren;
        if (e.relatedTarget && !e.relatedTarget.setTimeout && contains((_this$popupRef$curren = _this.popupRef.current) === null || _this$popupRef$curren === void 0 ? void 0 : _this$popupRef$curren.getElement(), e.relatedTarget)) {
          return;
        }
        _this.delaySetPopupVisible(false, _this.props.mouseLeaveDelay);
      });
      _defineProperty(_assertThisInitialized(_this), "onFocus", function(e) {
        _this.fireEvents("onFocus", e);
        _this.clearDelayTimer();
        if (_this.isFocusToShow()) {
          _this.focusTime = Date.now();
          _this.delaySetPopupVisible(true, _this.props.focusDelay);
        }
      });
      _defineProperty(_assertThisInitialized(_this), "onMouseDown", function(e) {
        _this.fireEvents("onMouseDown", e);
        _this.preClickTime = Date.now();
      });
      _defineProperty(_assertThisInitialized(_this), "onTouchStart", function(e) {
        _this.fireEvents("onTouchStart", e);
        _this.preTouchTime = Date.now();
      });
      _defineProperty(_assertThisInitialized(_this), "onBlur", function(e) {
        _this.fireEvents("onBlur", e);
        _this.clearDelayTimer();
        if (_this.isBlurToHide()) {
          _this.delaySetPopupVisible(false, _this.props.blurDelay);
        }
      });
      _defineProperty(_assertThisInitialized(_this), "onContextMenu", function(e) {
        e.preventDefault();
        _this.fireEvents("onContextMenu", e);
        _this.setPopupVisible(true, e);
      });
      _defineProperty(_assertThisInitialized(_this), "onContextMenuClose", function() {
        if (_this.isContextMenuToShow()) {
          _this.close();
        }
      });
      _defineProperty(_assertThisInitialized(_this), "onClick", function(event) {
        _this.fireEvents("onClick", event);
        if (_this.focusTime) {
          var preTime;
          if (_this.preClickTime && _this.preTouchTime) {
            preTime = Math.min(_this.preClickTime, _this.preTouchTime);
          } else if (_this.preClickTime) {
            preTime = _this.preClickTime;
          } else if (_this.preTouchTime) {
            preTime = _this.preTouchTime;
          }
          if (Math.abs(preTime - _this.focusTime) < 20) {
            return;
          }
          _this.focusTime = 0;
        }
        _this.preClickTime = 0;
        _this.preTouchTime = 0;
        if (_this.isClickToShow() && (_this.isClickToHide() || _this.isBlurToHide()) && event && event.preventDefault) {
          event.preventDefault();
        }
        var nextVisible = !_this.state.popupVisible;
        if (_this.isClickToHide() && !nextVisible || nextVisible && _this.isClickToShow()) {
          _this.setPopupVisible(!_this.state.popupVisible, event);
        }
      });
      _defineProperty(_assertThisInitialized(_this), "onPopupMouseDown", function() {
        _this.hasPopupMouseDown = true;
        clearTimeout(_this.mouseDownTimeout);
        _this.mouseDownTimeout = window.setTimeout(function() {
          _this.hasPopupMouseDown = false;
        }, 0);
        if (_this.context) {
          var _this$context;
          (_this$context = _this.context).onPopupMouseDown.apply(_this$context, arguments);
        }
      });
      _defineProperty(_assertThisInitialized(_this), "onDocumentClick", function(event) {
        if (_this.props.mask && !_this.props.maskClosable) {
          return;
        }
        var target = event.target;
        var root = _this.getRootDomNode();
        var popupNode = _this.getPopupDomNode();
        if (
          // mousedown on the target should also close popup when action is contextMenu.
          // https://github.com/ant-design/ant-design/issues/29853
          (!contains(root, target) || _this.isContextMenuOnly()) && !contains(popupNode, target) && !_this.hasPopupMouseDown
        ) {
          _this.close();
        }
      });
      _defineProperty(_assertThisInitialized(_this), "getRootDomNode", function() {
        var getTriggerDOMNode = _this.props.getTriggerDOMNode;
        if (getTriggerDOMNode) {
          return getTriggerDOMNode(_this.triggerRef.current);
        }
        try {
          var domNode = findDOMNode(_this.triggerRef.current);
          if (domNode) {
            return domNode;
          }
        } catch (err) {
        }
        return import_react_dom5.default.findDOMNode(_assertThisInitialized(_this));
      });
      _defineProperty(_assertThisInitialized(_this), "getPopupClassNameFromAlign", function(align) {
        var className = [];
        var _this$props = _this.props, popupPlacement = _this$props.popupPlacement, builtinPlacements = _this$props.builtinPlacements, prefixCls = _this$props.prefixCls, alignPoint2 = _this$props.alignPoint, getPopupClassNameFromAlign = _this$props.getPopupClassNameFromAlign;
        if (popupPlacement && builtinPlacements) {
          className.push(getAlignPopupClassName(builtinPlacements, prefixCls, align, alignPoint2));
        }
        if (getPopupClassNameFromAlign) {
          className.push(getPopupClassNameFromAlign(align));
        }
        return className.join(" ");
      });
      _defineProperty(_assertThisInitialized(_this), "getComponent", function() {
        var _this$props2 = _this.props, prefixCls = _this$props2.prefixCls, destroyPopupOnHide = _this$props2.destroyPopupOnHide, popupClassName = _this$props2.popupClassName, onPopupAlign = _this$props2.onPopupAlign, popupMotion = _this$props2.popupMotion, popupAnimation = _this$props2.popupAnimation, popupTransitionName = _this$props2.popupTransitionName, popupStyle = _this$props2.popupStyle, mask = _this$props2.mask, maskAnimation = _this$props2.maskAnimation, maskTransitionName = _this$props2.maskTransitionName, maskMotion = _this$props2.maskMotion, zIndex = _this$props2.zIndex, popup = _this$props2.popup, stretch = _this$props2.stretch, alignPoint2 = _this$props2.alignPoint, mobile = _this$props2.mobile, forceRender = _this$props2.forceRender, onPopupClick = _this$props2.onPopupClick;
        var _this$state = _this.state, popupVisible = _this$state.popupVisible, point = _this$state.point;
        var align = _this.getPopupAlign();
        var mouseProps = {};
        if (_this.isMouseEnterToShow()) {
          mouseProps.onMouseEnter = _this.onPopupMouseEnter;
        }
        if (_this.isMouseLeaveToHide()) {
          mouseProps.onMouseLeave = _this.onPopupMouseLeave;
        }
        mouseProps.onMouseDown = _this.onPopupMouseDown;
        mouseProps.onTouchStart = _this.onPopupMouseDown;
        return React40.createElement(Popup_default, _extends({
          prefixCls,
          destroyPopupOnHide,
          visible: popupVisible,
          point: alignPoint2 && point,
          className: popupClassName,
          align,
          onAlign: onPopupAlign,
          animation: popupAnimation,
          getClassNameFromAlign: _this.getPopupClassNameFromAlign
        }, mouseProps, {
          stretch,
          getRootDomNode: _this.getRootDomNode,
          style: popupStyle,
          mask,
          zIndex,
          transitionName: popupTransitionName,
          maskAnimation,
          maskTransitionName,
          maskMotion,
          ref: _this.popupRef,
          motion: popupMotion,
          mobile,
          forceRender,
          onClick: onPopupClick
        }), typeof popup === "function" ? popup() : popup);
      });
      _defineProperty(_assertThisInitialized(_this), "attachParent", function(popupContainer) {
        raf_default.cancel(_this.attachId);
        var _this$props3 = _this.props, getPopupContainer = _this$props3.getPopupContainer, getDocument2 = _this$props3.getDocument;
        var domNode = _this.getRootDomNode();
        var mountNode;
        if (!getPopupContainer) {
          mountNode = getDocument2(_this.getRootDomNode()).body;
        } else if (domNode || getPopupContainer.length === 0) {
          mountNode = getPopupContainer(domNode);
        }
        if (mountNode) {
          mountNode.appendChild(popupContainer);
        } else {
          _this.attachId = raf_default(function() {
            _this.attachParent(popupContainer);
          });
        }
      });
      _defineProperty(_assertThisInitialized(_this), "getContainer", function() {
        if (!_this.portalContainer) {
          var getDocument2 = _this.props.getDocument;
          var popupContainer = getDocument2(_this.getRootDomNode()).createElement("div");
          popupContainer.style.position = "absolute";
          popupContainer.style.top = "0";
          popupContainer.style.left = "0";
          popupContainer.style.width = "100%";
          _this.portalContainer = popupContainer;
        }
        _this.attachParent(_this.portalContainer);
        return _this.portalContainer;
      });
      _defineProperty(_assertThisInitialized(_this), "setPoint", function(point) {
        var alignPoint2 = _this.props.alignPoint;
        if (!alignPoint2 || !point)
          return;
        _this.setState({
          point: {
            pageX: point.pageX,
            pageY: point.pageY
          }
        });
      });
      _defineProperty(_assertThisInitialized(_this), "handlePortalUpdate", function() {
        if (_this.state.prevPopupVisible !== _this.state.popupVisible) {
          _this.props.afterPopupVisibleChange(_this.state.popupVisible);
        }
      });
      _defineProperty(_assertThisInitialized(_this), "triggerContextValue", {
        onPopupMouseDown: _this.onPopupMouseDown
      });
      var _popupVisible;
      if ("popupVisible" in props) {
        _popupVisible = !!props.popupVisible;
      } else {
        _popupVisible = !!props.defaultPopupVisible;
      }
      _this.state = {
        prevPopupVisible: _popupVisible,
        popupVisible: _popupVisible
      };
      ALL_HANDLERS.forEach(function(h) {
        _this["fire".concat(h)] = function(e) {
          _this.fireEvents(h, e);
        };
      });
      return _this;
    }
    _createClass(Trigger2, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.componentDidUpdate();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        var props = this.props;
        var state = this.state;
        if (state.popupVisible) {
          var currentDocument;
          if (!this.clickOutsideHandler && (this.isClickToHide() || this.isContextMenuToShow())) {
            currentDocument = props.getDocument(this.getRootDomNode());
            this.clickOutsideHandler = addEventListenerWrap(currentDocument, "mousedown", this.onDocumentClick);
          }
          if (!this.touchOutsideHandler) {
            currentDocument = currentDocument || props.getDocument(this.getRootDomNode());
            this.touchOutsideHandler = addEventListenerWrap(currentDocument, "touchstart", this.onDocumentClick);
          }
          if (!this.contextMenuOutsideHandler1 && this.isContextMenuToShow()) {
            currentDocument = currentDocument || props.getDocument(this.getRootDomNode());
            this.contextMenuOutsideHandler1 = addEventListenerWrap(currentDocument, "scroll", this.onContextMenuClose);
          }
          if (!this.contextMenuOutsideHandler2 && this.isContextMenuToShow()) {
            this.contextMenuOutsideHandler2 = addEventListenerWrap(window, "blur", this.onContextMenuClose);
          }
          return;
        }
        this.clearOutsideHandler();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.clearDelayTimer();
        this.clearOutsideHandler();
        clearTimeout(this.mouseDownTimeout);
        raf_default.cancel(this.attachId);
      }
    }, {
      key: "getPopupDomNode",
      value: function getPopupDomNode() {
        var _this$popupRef$curren2;
        return ((_this$popupRef$curren2 = this.popupRef.current) === null || _this$popupRef$curren2 === void 0 ? void 0 : _this$popupRef$curren2.getElement()) || null;
      }
    }, {
      key: "getPopupAlign",
      value: function getPopupAlign() {
        var props = this.props;
        var popupPlacement = props.popupPlacement, popupAlign = props.popupAlign, builtinPlacements = props.builtinPlacements;
        if (popupPlacement && builtinPlacements) {
          return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
        }
        return popupAlign;
      }
    }, {
      key: "setPopupVisible",
      value: (
        /**
         * @param popupVisible    Show or not the popup element
         * @param event           SyntheticEvent, used for `pointAlign`
         */
        function setPopupVisible(popupVisible, event) {
          var alignPoint2 = this.props.alignPoint;
          var prevPopupVisible = this.state.popupVisible;
          this.clearDelayTimer();
          if (prevPopupVisible !== popupVisible) {
            if (!("popupVisible" in this.props)) {
              this.setState({
                popupVisible,
                prevPopupVisible
              });
            }
            this.props.onPopupVisibleChange(popupVisible);
          }
          if (alignPoint2 && event && popupVisible) {
            this.setPoint(event);
          }
        }
      )
    }, {
      key: "delaySetPopupVisible",
      value: function delaySetPopupVisible(visible, delayS, event) {
        var _this2 = this;
        var delay = delayS * 1e3;
        this.clearDelayTimer();
        if (delay) {
          var point = event ? {
            pageX: event.pageX,
            pageY: event.pageY
          } : null;
          this.delayTimer = window.setTimeout(function() {
            _this2.setPopupVisible(visible, point);
            _this2.clearDelayTimer();
          }, delay);
        } else {
          this.setPopupVisible(visible, event);
        }
      }
    }, {
      key: "clearDelayTimer",
      value: function clearDelayTimer() {
        if (this.delayTimer) {
          clearTimeout(this.delayTimer);
          this.delayTimer = null;
        }
      }
    }, {
      key: "clearOutsideHandler",
      value: function clearOutsideHandler() {
        if (this.clickOutsideHandler) {
          this.clickOutsideHandler.remove();
          this.clickOutsideHandler = null;
        }
        if (this.contextMenuOutsideHandler1) {
          this.contextMenuOutsideHandler1.remove();
          this.contextMenuOutsideHandler1 = null;
        }
        if (this.contextMenuOutsideHandler2) {
          this.contextMenuOutsideHandler2.remove();
          this.contextMenuOutsideHandler2 = null;
        }
        if (this.touchOutsideHandler) {
          this.touchOutsideHandler.remove();
          this.touchOutsideHandler = null;
        }
      }
    }, {
      key: "createTwoChains",
      value: function createTwoChains(event) {
        var childPros = this.props.children.props;
        var props = this.props;
        if (childPros[event] && props[event]) {
          return this["fire".concat(event)];
        }
        return childPros[event] || props[event];
      }
    }, {
      key: "isClickToShow",
      value: function isClickToShow() {
        var _this$props4 = this.props, action = _this$props4.action, showAction = _this$props4.showAction;
        return action.indexOf("click") !== -1 || showAction.indexOf("click") !== -1;
      }
    }, {
      key: "isContextMenuOnly",
      value: function isContextMenuOnly() {
        var action = this.props.action;
        return action === "contextMenu" || action.length === 1 && action[0] === "contextMenu";
      }
    }, {
      key: "isContextMenuToShow",
      value: function isContextMenuToShow() {
        var _this$props5 = this.props, action = _this$props5.action, showAction = _this$props5.showAction;
        return action.indexOf("contextMenu") !== -1 || showAction.indexOf("contextMenu") !== -1;
      }
    }, {
      key: "isClickToHide",
      value: function isClickToHide() {
        var _this$props6 = this.props, action = _this$props6.action, hideAction = _this$props6.hideAction;
        return action.indexOf("click") !== -1 || hideAction.indexOf("click") !== -1;
      }
    }, {
      key: "isMouseEnterToShow",
      value: function isMouseEnterToShow() {
        var _this$props7 = this.props, action = _this$props7.action, showAction = _this$props7.showAction;
        return action.indexOf("hover") !== -1 || showAction.indexOf("mouseEnter") !== -1;
      }
    }, {
      key: "isMouseLeaveToHide",
      value: function isMouseLeaveToHide() {
        var _this$props8 = this.props, action = _this$props8.action, hideAction = _this$props8.hideAction;
        return action.indexOf("hover") !== -1 || hideAction.indexOf("mouseLeave") !== -1;
      }
    }, {
      key: "isFocusToShow",
      value: function isFocusToShow() {
        var _this$props9 = this.props, action = _this$props9.action, showAction = _this$props9.showAction;
        return action.indexOf("focus") !== -1 || showAction.indexOf("focus") !== -1;
      }
    }, {
      key: "isBlurToHide",
      value: function isBlurToHide() {
        var _this$props10 = this.props, action = _this$props10.action, hideAction = _this$props10.hideAction;
        return action.indexOf("focus") !== -1 || hideAction.indexOf("blur") !== -1;
      }
    }, {
      key: "forcePopupAlign",
      value: function forcePopupAlign() {
        if (this.state.popupVisible) {
          var _this$popupRef$curren3;
          (_this$popupRef$curren3 = this.popupRef.current) === null || _this$popupRef$curren3 === void 0 ? void 0 : _this$popupRef$curren3.forceAlign();
        }
      }
    }, {
      key: "fireEvents",
      value: function fireEvents(type, e) {
        var childCallback = this.props.children.props[type];
        if (childCallback) {
          childCallback(e);
        }
        var callback = this.props[type];
        if (callback) {
          callback(e);
        }
      }
    }, {
      key: "close",
      value: function close() {
        this.setPopupVisible(false);
      }
    }, {
      key: "render",
      value: function render() {
        var popupVisible = this.state.popupVisible;
        var _this$props11 = this.props, children = _this$props11.children, forceRender = _this$props11.forceRender, alignPoint2 = _this$props11.alignPoint, className = _this$props11.className, autoDestroy = _this$props11.autoDestroy;
        var child = React40.Children.only(children);
        var newChildProps = {
          key: "trigger"
        };
        if (this.isContextMenuToShow()) {
          newChildProps.onContextMenu = this.onContextMenu;
        } else {
          newChildProps.onContextMenu = this.createTwoChains("onContextMenu");
        }
        if (this.isClickToHide() || this.isClickToShow()) {
          newChildProps.onClick = this.onClick;
          newChildProps.onMouseDown = this.onMouseDown;
          newChildProps.onTouchStart = this.onTouchStart;
        } else {
          newChildProps.onClick = this.createTwoChains("onClick");
          newChildProps.onMouseDown = this.createTwoChains("onMouseDown");
          newChildProps.onTouchStart = this.createTwoChains("onTouchStart");
        }
        if (this.isMouseEnterToShow()) {
          newChildProps.onMouseEnter = this.onMouseEnter;
          if (alignPoint2) {
            newChildProps.onMouseMove = this.onMouseMove;
          }
        } else {
          newChildProps.onMouseEnter = this.createTwoChains("onMouseEnter");
        }
        if (this.isMouseLeaveToHide()) {
          newChildProps.onMouseLeave = this.onMouseLeave;
        } else {
          newChildProps.onMouseLeave = this.createTwoChains("onMouseLeave");
        }
        if (this.isFocusToShow() || this.isBlurToHide()) {
          newChildProps.onFocus = this.onFocus;
          newChildProps.onBlur = this.onBlur;
        } else {
          newChildProps.onFocus = this.createTwoChains("onFocus");
          newChildProps.onBlur = this.createTwoChains("onBlur");
        }
        var childrenClassName = (0, import_classnames11.default)(child && child.props && child.props.className, className);
        if (childrenClassName) {
          newChildProps.className = childrenClassName;
        }
        var cloneProps = _objectSpread2({}, newChildProps);
        if (supportRef(child)) {
          cloneProps.ref = composeRef(this.triggerRef, child.ref);
        }
        var trigger = React40.cloneElement(child, cloneProps);
        var portal;
        if (popupVisible || this.popupRef.current || forceRender) {
          portal = React40.createElement(PortalComponent, {
            key: "portal",
            getContainer: this.getContainer,
            didUpdate: this.handlePortalUpdate
          }, this.getComponent());
        }
        if (!popupVisible && autoDestroy) {
          portal = null;
        }
        return React40.createElement(context_default.Provider, {
          value: this.triggerContextValue
        }, trigger, portal);
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref, prevState) {
        var popupVisible = _ref.popupVisible;
        var newState = {};
        if (popupVisible !== void 0 && prevState.popupVisible !== popupVisible) {
          newState.popupVisible = popupVisible;
          newState.prevPopupVisible = prevState.popupVisible;
        }
        return newState;
      }
    }]);
    return Trigger2;
  }(React40.Component);
  _defineProperty(Trigger, "contextType", context_default);
  _defineProperty(Trigger, "defaultProps", {
    prefixCls: "rc-trigger-popup",
    getPopupClassNameFromAlign: returnEmptyString,
    getDocument: returnDocument,
    onPopupVisibleChange: noop,
    afterPopupVisibleChange: noop,
    onPopupAlign: noop,
    popupClassName: "",
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0.1,
    focusDelay: 0,
    blurDelay: 0.15,
    popupStyle: {},
    destroyPopupOnHide: false,
    popupAlign: {},
    defaultPopupVisible: false,
    mask: false,
    maskClosable: true,
    action: [],
    showAction: [],
    hideAction: [],
    autoDestroy: false
  });
  return Trigger;
}
var es_default5 = generateTrigger(Portal_default);

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var import_classnames12 = __toESM(require_classnames());

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/placements.js
var autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1
};
var placements = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow,
    offset: [0, -7]
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow,
    offset: [0, 7]
  },
  leftTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow,
    offset: [-4, 0]
  },
  rightTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow,
    offset: [4, 0]
  }
};
var placementsRtl = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow,
    offset: [0, -7]
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow,
    offset: [0, 7]
  },
  rightTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow,
    offset: [-4, 0]
  },
  leftTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow,
    offset: [4, 0]
  }
};

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/utils/motionUtil.js
function getMotion2(mode, motion, defaultMotions) {
  if (motion) {
    return motion;
  }
  if (defaultMotions) {
    return defaultMotions[mode] || defaultMotions.other;
  }
  return void 0;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var popupPlacementMap = {
  horizontal: "bottomLeft",
  vertical: "rightTop",
  "vertical-left": "rightTop",
  "vertical-right": "leftTop"
};
function PopupTrigger(_ref) {
  var prefixCls = _ref.prefixCls, visible = _ref.visible, children = _ref.children, popup = _ref.popup, popupClassName = _ref.popupClassName, popupOffset = _ref.popupOffset, disabled = _ref.disabled, mode = _ref.mode, onVisibleChange = _ref.onVisibleChange;
  var _React$useContext = React41.useContext(MenuContext), getPopupContainer = _React$useContext.getPopupContainer, rtl = _React$useContext.rtl, subMenuOpenDelay = _React$useContext.subMenuOpenDelay, subMenuCloseDelay = _React$useContext.subMenuCloseDelay, builtinPlacements = _React$useContext.builtinPlacements, triggerSubMenuAction = _React$useContext.triggerSubMenuAction, forceSubMenuRender = _React$useContext.forceSubMenuRender, rootClassName = _React$useContext.rootClassName, motion = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions;
  var _React$useState = React41.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), innerVisible = _React$useState2[0], setInnerVisible = _React$useState2[1];
  var placement = rtl ? _objectSpread2(_objectSpread2({}, placementsRtl), builtinPlacements) : _objectSpread2(_objectSpread2({}, placements), builtinPlacements);
  var popupPlacement = popupPlacementMap[mode];
  var targetMotion = getMotion2(mode, motion, defaultMotions);
  var mergedMotion = _objectSpread2(_objectSpread2({}, targetMotion), {}, {
    leavedClassName: "".concat(prefixCls, "-hidden"),
    removeOnLeave: false,
    motionAppear: true
  });
  var visibleRef = React41.useRef();
  React41.useEffect(function() {
    visibleRef.current = raf_default(function() {
      setInnerVisible(visible);
    });
    return function() {
      raf_default.cancel(visibleRef.current);
    };
  }, [visible]);
  return React41.createElement(es_default5, {
    prefixCls,
    popupClassName: (0, import_classnames12.default)("".concat(prefixCls, "-popup"), _defineProperty({}, "".concat(prefixCls, "-rtl"), rtl), popupClassName, rootClassName),
    stretch: mode === "horizontal" ? "minWidth" : null,
    getPopupContainer,
    builtinPlacements: placement,
    popupPlacement,
    popupVisible: innerVisible,
    popup,
    popupAlign: popupOffset && {
      offset: popupOffset
    },
    action: disabled ? [] : [triggerSubMenuAction],
    mouseEnterDelay: subMenuOpenDelay,
    mouseLeaveDelay: subMenuCloseDelay,
    onPopupVisibleChange: onVisibleChange,
    forceRender: forceSubMenuRender,
    popupMotion: mergedMotion
  }, children);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/InlineSubMenuList.js
init_extends();
var React42 = __toESM(require_react());
function InlineSubMenuList(_ref) {
  var id = _ref.id, open = _ref.open, keyPath = _ref.keyPath, children = _ref.children;
  var fixedMode = "inline";
  var _React$useContext = React42.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, forceSubMenuRender = _React$useContext.forceSubMenuRender, motion = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions, mode = _React$useContext.mode;
  var sameModeRef = React42.useRef(false);
  sameModeRef.current = mode === fixedMode;
  var _React$useState = React42.useState(!sameModeRef.current), _React$useState2 = _slicedToArray(_React$useState, 2), destroy = _React$useState2[0], setDestroy = _React$useState2[1];
  var mergedOpen = sameModeRef.current ? open : false;
  React42.useEffect(function() {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);
  var mergedMotion = _objectSpread2({}, getMotion2(fixedMode, motion, defaultMotions));
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }
  var originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = function(newVisible) {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged === null || originOnVisibleChanged === void 0 ? void 0 : originOnVisibleChanged(newVisible);
  };
  if (destroy) {
    return null;
  }
  return React42.createElement(InheritableContextProvider, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, React42.createElement(es_default3, _extends({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: "".concat(prefixCls, "-hidden")
  }), function(_ref2) {
    var motionClassName = _ref2.className, motionStyle = _ref2.style;
    return React42.createElement(SubMenuList_default, {
      id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/SubMenu/index.js
var _excluded12 = ["style", "className", "title", "eventKey", "warnKey", "disabled", "internalPopupClose", "children", "itemIcon", "expandIcon", "popupClassName", "popupOffset", "onClick", "onMouseEnter", "onMouseLeave", "onTitleClick", "onTitleMouseEnter", "onTitleMouseLeave"];
var _excluded25 = ["active"];
var InternalSubMenu = function InternalSubMenu2(props) {
  var _classNames;
  var style2 = props.style, className = props.className, title = props.title, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, internalPopupClose = props.internalPopupClose, children = props.children, itemIcon = props.itemIcon, expandIcon = props.expandIcon, popupClassName = props.popupClassName, popupOffset = props.popupOffset, onClick = props.onClick, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onTitleClick = props.onTitleClick, onTitleMouseEnter = props.onTitleMouseEnter, onTitleMouseLeave = props.onTitleMouseLeave, restProps = _objectWithoutProperties(props, _excluded12);
  var domDataId = useMenuId(eventKey);
  var _React$useContext = React43.useContext(MenuContext), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, openKeys = _React$useContext.openKeys, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, activeKey = _React$useContext.activeKey, selectedKeys = _React$useContext.selectedKeys, contextItemIcon = _React$useContext.itemIcon, contextExpandIcon = _React$useContext.expandIcon, onItemClick = _React$useContext.onItemClick, onOpenChange = _React$useContext.onOpenChange, onActive = _React$useContext.onActive;
  var _React$useContext2 = React43.useContext(PrivateContext_default), _internalRenderSubMenuItem = _React$useContext2._internalRenderSubMenuItem;
  var _React$useContext3 = React43.useContext(PathUserContext), isSubPathKey = _React$useContext3.isSubPathKey;
  var connectedPath = useFullPath();
  var subMenuPrefixCls = "".concat(prefixCls, "-submenu");
  var mergedDisabled = contextDisabled || disabled;
  var elementRef = React43.useRef();
  var popupRef = React43.useRef();
  if (warnKey) {
    warning_default(false, "SubMenu should not leave undefined `key`.");
  }
  var mergedItemIcon = itemIcon || contextItemIcon;
  var mergedExpandIcon = expandIcon || contextExpandIcon;
  var originOpen = openKeys.includes(eventKey);
  var open = !overflowDisabled && originOpen;
  var childrenSelected = isSubPathKey(selectedKeys, eventKey);
  var _useActive = useActive(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded25);
  var _React$useState = React43.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), childrenActive = _React$useState2[0], setChildrenActive = _React$useState2[1];
  var triggerChildrenActive = function triggerChildrenActive2(newActive) {
    if (!mergedDisabled) {
      setChildrenActive(newActive);
    }
  };
  var onInternalMouseEnter = function onInternalMouseEnter2(domEvent) {
    triggerChildrenActive(true);
    onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
      key: eventKey,
      domEvent
    });
  };
  var onInternalMouseLeave = function onInternalMouseLeave2(domEvent) {
    triggerChildrenActive(false);
    onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
      key: eventKey,
      domEvent
    });
  };
  var mergedActive = React43.useMemo(function() {
    if (active) {
      return active;
    }
    if (mode !== "inline") {
      return childrenActive || isSubPathKey([activeKey], eventKey);
    }
    return false;
  }, [mode, active, activeKey, childrenActive, eventKey, isSubPathKey]);
  var directionStyle = useDirectionStyle(connectedPath.length);
  var onInternalTitleClick = function onInternalTitleClick2(e) {
    if (mergedDisabled) {
      return;
    }
    onTitleClick === null || onTitleClick === void 0 ? void 0 : onTitleClick({
      key: eventKey,
      domEvent: e
    });
    if (mode === "inline") {
      onOpenChange(eventKey, !originOpen);
    }
  };
  var onMergedItemClick = useMemoCallback(function(info) {
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp(info));
    onItemClick(info);
  });
  var onPopupVisibleChange = function onPopupVisibleChange2(newVisible) {
    if (mode !== "inline") {
      onOpenChange(eventKey, newVisible);
    }
  };
  var onInternalFocus = function onInternalFocus2() {
    onActive(eventKey);
  };
  var popupId = domDataId && "".concat(domDataId, "-popup");
  var titleNode = React43.createElement("div", _extends({
    role: "menuitem",
    style: directionStyle,
    className: "".concat(subMenuPrefixCls, "-title"),
    tabIndex: mergedDisabled ? null : -1,
    ref: elementRef,
    title: typeof title === "string" ? title : null,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId,
    "aria-expanded": open,
    "aria-haspopup": true,
    "aria-controls": popupId,
    "aria-disabled": mergedDisabled,
    onClick: onInternalTitleClick,
    onFocus: onInternalFocus
  }, activeProps), title, React43.createElement(Icon, {
    icon: mode !== "horizontal" ? mergedExpandIcon : null,
    props: _objectSpread2(_objectSpread2({}, props), {}, {
      isOpen: open,
      // [Legacy] Not sure why need this mark
      isSubMenu: true
    })
  }, React43.createElement("i", {
    className: "".concat(subMenuPrefixCls, "-arrow")
  })));
  var triggerModeRef = React43.useRef(mode);
  if (mode !== "inline") {
    triggerModeRef.current = connectedPath.length > 1 ? "vertical" : mode;
  }
  if (!overflowDisabled) {
    var triggerMode = triggerModeRef.current;
    titleNode = React43.createElement(PopupTrigger, {
      mode: triggerMode,
      prefixCls: subMenuPrefixCls,
      visible: !internalPopupClose && open && mode !== "inline",
      popupClassName,
      popupOffset,
      popup: React43.createElement(
        InheritableContextProvider,
        {
          mode: triggerMode === "horizontal" ? "vertical" : triggerMode
        },
        React43.createElement(SubMenuList_default, {
          id: popupId,
          ref: popupRef
        }, children)
      ),
      disabled: mergedDisabled,
      onVisibleChange: onPopupVisibleChange
    }, titleNode);
  }
  var listNode = React43.createElement(es_default2.Item, _extends({
    role: "none"
  }, restProps, {
    component: "li",
    style: style2,
    className: (0, import_classnames13.default)(subMenuPrefixCls, "".concat(subMenuPrefixCls, "-").concat(mode), className, (_classNames = {}, _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-open"), open), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-active"), mergedActive), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-selected"), childrenSelected), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-disabled"), mergedDisabled), _classNames)),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && React43.createElement(InlineSubMenuList, {
    id: popupId,
    open,
    keyPath: connectedPath
  }, children));
  if (_internalRenderSubMenuItem) {
    listNode = _internalRenderSubMenuItem(listNode, props, {
      selected: childrenSelected,
      active: mergedActive,
      open,
      disabled: mergedDisabled
    });
  }
  return React43.createElement(InheritableContextProvider, {
    onItemClick: onMergedItemClick,
    mode: mode === "horizontal" ? "vertical" : mode,
    itemIcon: mergedItemIcon,
    expandIcon: mergedExpandIcon
  }, listNode);
};
function SubMenu(props) {
  var eventKey = props.eventKey, children = props.children;
  var connectedKeyPath = useFullPath(eventKey);
  var childList = parseChildren(children, connectedKeyPath);
  var measure = useMeasure();
  React43.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  var renderNode;
  if (measure) {
    renderNode = childList;
  } else {
    renderNode = React43.createElement(InternalSubMenu, props, childList);
  }
  return React43.createElement(PathTrackerContext.Provider, {
    value: connectedKeyPath
  }, renderNode);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useAccessibility.js
var React44 = __toESM(require_react());

// ../../node_modules/rc-util/es/Dom/focus.js
function focusable(node) {
  var includePositive = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  if (isVisible_default(node)) {
    var nodeName = node.nodeName.toLowerCase();
    var isFocusableElement = (
      // Focusable element
      ["input", "select", "textarea", "button"].includes(nodeName) || // Editable element
      node.isContentEditable || // Anchor with href element
      nodeName === "a" && !!node.getAttribute("href")
    );
    var tabIndexAttr = node.getAttribute("tabindex");
    var tabIndexNum = Number(tabIndexAttr);
    var tabIndex = null;
    if (tabIndexAttr && !Number.isNaN(tabIndexNum)) {
      tabIndex = tabIndexNum;
    } else if (isFocusableElement && tabIndex === null) {
      tabIndex = 0;
    }
    if (isFocusableElement && node.disabled) {
      tabIndex = null;
    }
    return tabIndex !== null && (tabIndex >= 0 || includePositive && tabIndex < 0);
  }
  return false;
}
function getFocusNodeList(node) {
  var includePositive = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  var res = _toConsumableArray(node.querySelectorAll("*")).filter(function(child) {
    return focusable(child, includePositive);
  });
  if (focusable(node, includePositive)) {
    res.unshift(node);
  }
  return res;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useAccessibility.js
var LEFT2 = KeyCode_default.LEFT;
var RIGHT = KeyCode_default.RIGHT;
var UP = KeyCode_default.UP;
var DOWN = KeyCode_default.DOWN;
var ENTER = KeyCode_default.ENTER;
var ESC = KeyCode_default.ESC;
var HOME = KeyCode_default.HOME;
var END = KeyCode_default.END;
var ArrowKeys = [UP, DOWN, LEFT2, RIGHT];
function getOffset2(mode, isRootLevel, isRtl, which) {
  var _inline, _horizontal, _vertical, _offsets;
  var prev = "prev";
  var next = "next";
  var children = "children";
  var parent = "parent";
  if (mode === "inline" && which === ENTER) {
    return {
      inlineTrigger: true
    };
  }
  var inline = (_inline = {}, _defineProperty(_inline, UP, prev), _defineProperty(_inline, DOWN, next), _inline);
  var horizontal = (_horizontal = {}, _defineProperty(_horizontal, LEFT2, isRtl ? next : prev), _defineProperty(_horizontal, RIGHT, isRtl ? prev : next), _defineProperty(_horizontal, DOWN, children), _defineProperty(_horizontal, ENTER, children), _horizontal);
  var vertical = (_vertical = {}, _defineProperty(_vertical, UP, prev), _defineProperty(_vertical, DOWN, next), _defineProperty(_vertical, ENTER, children), _defineProperty(_vertical, ESC, parent), _defineProperty(_vertical, LEFT2, isRtl ? children : parent), _defineProperty(_vertical, RIGHT, isRtl ? parent : children), _vertical);
  var offsets = {
    inline,
    horizontal,
    vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical
  };
  var type = (_offsets = offsets["".concat(mode).concat(isRootLevel ? "" : "Sub")]) === null || _offsets === void 0 ? void 0 : _offsets[which];
  switch (type) {
    case prev:
      return {
        offset: -1,
        sibling: true
      };
    case next:
      return {
        offset: 1,
        sibling: true
      };
    case parent:
      return {
        offset: -1,
        sibling: false
      };
    case children:
      return {
        offset: 1,
        sibling: false
      };
    default:
      return null;
  }
}
function findContainerUL(element) {
  var current = element;
  while (current) {
    if (current.getAttribute("data-menu-list")) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusElement(activeElement, elements) {
  var current = activeElement || document.activeElement;
  while (current) {
    if (elements.has(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusableElements(container, elements) {
  var list = getFocusNodeList(container, true);
  return list.filter(function(ele) {
    return elements.has(ele);
  });
}
function getNextFocusElement(parentQueryContainer, elements, focusMenuElement) {
  var offset2 = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
  if (!parentQueryContainer) {
    return null;
  }
  var sameLevelFocusableMenuElementList = getFocusableElements(parentQueryContainer, elements);
  var count = sameLevelFocusableMenuElementList.length;
  var focusIndex = sameLevelFocusableMenuElementList.findIndex(function(ele) {
    return focusMenuElement === ele;
  });
  if (offset2 < 0) {
    if (focusIndex === -1) {
      focusIndex = count - 1;
    } else {
      focusIndex -= 1;
    }
  } else if (offset2 > 0) {
    focusIndex += 1;
  }
  focusIndex = (focusIndex + count) % count;
  return sameLevelFocusableMenuElementList[focusIndex];
}
function useAccessibility(mode, activeKey, isRtl, id, containerRef, getKeys, getKeyPath, triggerActiveKey, triggerAccessibilityOpen, originOnKeyDown) {
  var rafRef = React44.useRef();
  var activeRef = React44.useRef();
  activeRef.current = activeKey;
  var cleanRaf = function cleanRaf2() {
    raf_default.cancel(rafRef.current);
  };
  React44.useEffect(function() {
    return function() {
      cleanRaf();
    };
  }, []);
  return function(e) {
    var which = e.which;
    if ([].concat(ArrowKeys, [ENTER, ESC, HOME, END]).includes(which)) {
      var elements;
      var key2element;
      var element2key;
      var refreshElements = function refreshElements2() {
        elements = /* @__PURE__ */ new Set();
        key2element = /* @__PURE__ */ new Map();
        element2key = /* @__PURE__ */ new Map();
        var keys = getKeys();
        keys.forEach(function(key) {
          var element = document.querySelector("[data-menu-id='".concat(getMenuId(id, key), "']"));
          if (element) {
            elements.add(element);
            element2key.set(element, key);
            key2element.set(key, element);
          }
        });
        return elements;
      };
      refreshElements();
      var activeElement = key2element.get(activeKey);
      var focusMenuElement = getFocusElement(activeElement, elements);
      var focusMenuKey = element2key.get(focusMenuElement);
      var offsetObj = getOffset2(mode, getKeyPath(focusMenuKey, true).length === 1, isRtl, which);
      if (!offsetObj && which !== HOME && which !== END) {
        return;
      }
      if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
        e.preventDefault();
      }
      var tryFocus = function tryFocus2(menuElement) {
        if (menuElement) {
          var focusTargetElement = menuElement;
          var link = menuElement.querySelector("a");
          if (link === null || link === void 0 ? void 0 : link.getAttribute("href")) {
            focusTargetElement = link;
          }
          var targetKey = element2key.get(menuElement);
          triggerActiveKey(targetKey);
          cleanRaf();
          rafRef.current = raf_default(function() {
            if (activeRef.current === targetKey) {
              focusTargetElement.focus();
            }
          });
        }
      };
      if ([HOME, END].includes(which) || offsetObj.sibling || !focusMenuElement) {
        var parentQueryContainer;
        if (!focusMenuElement || mode === "inline") {
          parentQueryContainer = containerRef.current;
        } else {
          parentQueryContainer = findContainerUL(focusMenuElement);
        }
        var targetElement;
        var focusableElements = getFocusableElements(parentQueryContainer, elements);
        if (which === HOME) {
          targetElement = focusableElements[0];
        } else if (which === END) {
          targetElement = focusableElements[focusableElements.length - 1];
        } else {
          targetElement = getNextFocusElement(parentQueryContainer, elements, focusMenuElement, offsetObj.offset);
        }
        tryFocus(targetElement);
      } else if (offsetObj.inlineTrigger) {
        triggerAccessibilityOpen(focusMenuKey);
      } else if (offsetObj.offset > 0) {
        triggerAccessibilityOpen(focusMenuKey, true);
        cleanRaf();
        rafRef.current = raf_default(function() {
          refreshElements();
          var controlId = focusMenuElement.getAttribute("aria-controls");
          var subQueryContainer = document.getElementById(controlId);
          var targetElement2 = getNextFocusElement(subQueryContainer, elements);
          tryFocus(targetElement2);
        }, 5);
      } else if (offsetObj.offset < 0) {
        var keyPath = getKeyPath(focusMenuKey, true);
        var parentKey = keyPath[keyPath.length - 2];
        var parentMenuElement = key2element.get(parentKey);
        triggerAccessibilityOpen(parentKey, false);
        tryFocus(parentMenuElement);
      }
    }
    originOnKeyDown === null || originOnKeyDown === void 0 ? void 0 : originOnKeyDown(e);
  };
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useUUID.js
var React45 = __toESM(require_react());
var uniquePrefix = Math.random().toFixed(5).toString().slice(2);
var internalId = 0;
function useUUID(id) {
  var _useMergedState = useMergedState(id, {
    value: id
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), uuid2 = _useMergedState2[0], setUUID = _useMergedState2[1];
  React45.useEffect(function() {
    internalId += 1;
    var newId = false ? "test" : "".concat(uniquePrefix, "-").concat(internalId);
    setUUID("rc-menu-uuid-".concat(newId));
  }, []);
  return uuid2;
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useKeyRecords.js
var React46 = __toESM(require_react());
var import_react18 = __toESM(require_react());

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/utils/timeUtil.js
function nextSlice(callback) {
  Promise.resolve().then(callback);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/hooks/useKeyRecords.js
var PATH_SPLIT = "__RC_UTIL_PATH_SPLIT__";
var getPathStr = function getPathStr2(keyPath) {
  return keyPath.join(PATH_SPLIT);
};
var getPathKeys = function getPathKeys2(keyPathStr) {
  return keyPathStr.split(PATH_SPLIT);
};
var OVERFLOW_KEY = "rc-menu-more";
function useKeyRecords() {
  var _React$useState = React46.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), internalForceUpdate = _React$useState2[1];
  var key2pathRef = (0, import_react18.useRef)(/* @__PURE__ */ new Map());
  var path2keyRef = (0, import_react18.useRef)(/* @__PURE__ */ new Map());
  var _React$useState3 = React46.useState([]), _React$useState4 = _slicedToArray(_React$useState3, 2), overflowKeys = _React$useState4[0], setOverflowKeys = _React$useState4[1];
  var updateRef = (0, import_react18.useRef)(0);
  var destroyRef = (0, import_react18.useRef)(false);
  var forceUpdate = function forceUpdate2() {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  var registerPath = (0, import_react18.useCallback)(function(key, keyPath) {
    if (true) {
      warning_default(!key2pathRef.current.has(key), "Duplicated key '".concat(key, "' used in Menu by path [").concat(keyPath.join(" > "), "]"));
    }
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    var id = updateRef.current;
    nextSlice(function() {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  var unregisterPath = (0, import_react18.useCallback)(function(key, keyPath) {
    var connectedPath = getPathStr(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  var refreshOverflowKeys = (0, import_react18.useCallback)(function(keys) {
    setOverflowKeys(keys);
  }, []);
  var getKeyPath = (0, import_react18.useCallback)(function(eventKey, includeOverflow) {
    var fullPath = key2pathRef.current.get(eventKey) || "";
    var keys = getPathKeys(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY);
    }
    return keys;
  }, [overflowKeys]);
  var isSubPathKey = (0, import_react18.useCallback)(function(pathKeys, eventKey) {
    return pathKeys.some(function(pathKey) {
      var pathKeyList = getKeyPath(pathKey, true);
      return pathKeyList.includes(eventKey);
    });
  }, [getKeyPath]);
  var getKeys = function getKeys2() {
    var keys = _toConsumableArray(key2pathRef.current.keys());
    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY);
    }
    return keys;
  };
  var getSubPathKeys = (0, import_react18.useCallback)(function(key) {
    var connectedPath = "".concat(key2pathRef.current.get(key)).concat(PATH_SPLIT);
    var pathKeys = /* @__PURE__ */ new Set();
    _toConsumableArray(path2keyRef.current.keys()).forEach(function(pathKey) {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);
  React46.useEffect(function() {
    return function() {
      destroyRef.current = true;
    };
  }, []);
  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys
  };
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/Menu.js
var import_react19 = __toESM(require_react());
var _excluded13 = ["prefixCls", "rootClassName", "style", "className", "tabIndex", "items", "children", "direction", "id", "mode", "inlineCollapsed", "disabled", "disabledOverflow", "subMenuOpenDelay", "subMenuCloseDelay", "forceSubMenuRender", "defaultOpenKeys", "openKeys", "activeKey", "defaultActiveFirst", "selectable", "multiple", "defaultSelectedKeys", "selectedKeys", "onSelect", "onDeselect", "inlineIndent", "motion", "defaultMotions", "triggerSubMenuAction", "builtinPlacements", "itemIcon", "expandIcon", "overflowedIndicator", "overflowedIndicatorPopupClassName", "getPopupContainer", "onClick", "onOpenChange", "onKeyDown", "openAnimation", "openTransitionName", "_internalRenderMenuItem", "_internalRenderSubMenuItem"];
var EMPTY_LIST = [];
var Menu = React47.forwardRef(function(props, ref) {
  var _childList$, _classNames;
  var _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-menu" : _props$prefixCls, rootClassName = props.rootClassName, style2 = props.style, className = props.className, _props$tabIndex = props.tabIndex, tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex, items = props.items, children = props.children, direction = props.direction, id = props.id, _props$mode = props.mode, mode = _props$mode === void 0 ? "vertical" : _props$mode, inlineCollapsed = props.inlineCollapsed, disabled = props.disabled, disabledOverflow = props.disabledOverflow, _props$subMenuOpenDel = props.subMenuOpenDelay, subMenuOpenDelay = _props$subMenuOpenDel === void 0 ? 0.1 : _props$subMenuOpenDel, _props$subMenuCloseDe = props.subMenuCloseDelay, subMenuCloseDelay = _props$subMenuCloseDe === void 0 ? 0.1 : _props$subMenuCloseDe, forceSubMenuRender = props.forceSubMenuRender, defaultOpenKeys = props.defaultOpenKeys, openKeys = props.openKeys, activeKey = props.activeKey, defaultActiveFirst = props.defaultActiveFirst, _props$selectable = props.selectable, selectable = _props$selectable === void 0 ? true : _props$selectable, _props$multiple = props.multiple, multiple = _props$multiple === void 0 ? false : _props$multiple, defaultSelectedKeys = props.defaultSelectedKeys, selectedKeys = props.selectedKeys, onSelect = props.onSelect, onDeselect = props.onDeselect, _props$inlineIndent = props.inlineIndent, inlineIndent = _props$inlineIndent === void 0 ? 24 : _props$inlineIndent, motion = props.motion, defaultMotions = props.defaultMotions, _props$triggerSubMenu = props.triggerSubMenuAction, triggerSubMenuAction = _props$triggerSubMenu === void 0 ? "hover" : _props$triggerSubMenu, builtinPlacements = props.builtinPlacements, itemIcon = props.itemIcon, expandIcon = props.expandIcon, _props$overflowedIndi = props.overflowedIndicator, overflowedIndicator = _props$overflowedIndi === void 0 ? "..." : _props$overflowedIndi, overflowedIndicatorPopupClassName = props.overflowedIndicatorPopupClassName, getPopupContainer = props.getPopupContainer, onClick = props.onClick, onOpenChange = props.onOpenChange, onKeyDown = props.onKeyDown, openAnimation = props.openAnimation, openTransitionName = props.openTransitionName, _internalRenderMenuItem = props._internalRenderMenuItem, _internalRenderSubMenuItem = props._internalRenderSubMenuItem, restProps = _objectWithoutProperties(props, _excluded13);
  var childList = React47.useMemo(function() {
    return parseItems(children, items, EMPTY_LIST);
  }, [children, items]);
  var _React$useState = React47.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), mounted = _React$useState2[0], setMounted = _React$useState2[1];
  var containerRef = React47.useRef();
  var uuid2 = useUUID(id);
  var isRtl = direction === "rtl";
  if (true) {
    warning_default(!openAnimation && !openTransitionName, "`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.");
  }
  var _React$useMemo = React47.useMemo(function() {
    if ((mode === "inline" || mode === "vertical") && inlineCollapsed) {
      return ["vertical", inlineCollapsed];
    }
    return [mode, false];
  }, [mode, inlineCollapsed]), _React$useMemo2 = _slicedToArray(_React$useMemo, 2), mergedMode = _React$useMemo2[0], mergedInlineCollapsed = _React$useMemo2[1];
  var _React$useState3 = React47.useState(0), _React$useState4 = _slicedToArray(_React$useState3, 2), lastVisibleIndex = _React$useState4[0], setLastVisibleIndex = _React$useState4[1];
  var allVisible = lastVisibleIndex >= childList.length - 1 || mergedMode !== "horizontal" || disabledOverflow;
  var _useMergedState = useMergedState(defaultOpenKeys, {
    value: openKeys,
    postState: function postState(keys) {
      return keys || EMPTY_LIST;
    }
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedOpenKeys = _useMergedState2[0], setMergedOpenKeys = _useMergedState2[1];
  var triggerOpenKeys = function triggerOpenKeys2(keys) {
    setMergedOpenKeys(keys);
    onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(keys);
  };
  var _React$useState5 = React47.useState(mergedOpenKeys), _React$useState6 = _slicedToArray(_React$useState5, 2), inlineCacheOpenKeys = _React$useState6[0], setInlineCacheOpenKeys = _React$useState6[1];
  var isInlineMode = mergedMode === "inline";
  var mountRef = React47.useRef(false);
  React47.useEffect(function() {
    if (isInlineMode) {
      setInlineCacheOpenKeys(mergedOpenKeys);
    }
  }, [mergedOpenKeys]);
  React47.useEffect(function() {
    if (!mountRef.current) {
      return;
    }
    if (isInlineMode) {
      setMergedOpenKeys(inlineCacheOpenKeys);
    } else {
      triggerOpenKeys(EMPTY_LIST);
    }
  }, [isInlineMode]);
  React47.useEffect(function() {
    mountRef.current = true;
    return function() {
      mountRef.current = false;
    };
  }, []);
  var _useKeyRecords = useKeyRecords(), registerPath = _useKeyRecords.registerPath, unregisterPath = _useKeyRecords.unregisterPath, refreshOverflowKeys = _useKeyRecords.refreshOverflowKeys, isSubPathKey = _useKeyRecords.isSubPathKey, getKeyPath = _useKeyRecords.getKeyPath, getKeys = _useKeyRecords.getKeys, getSubPathKeys = _useKeyRecords.getSubPathKeys;
  var registerPathContext = React47.useMemo(function() {
    return {
      registerPath,
      unregisterPath
    };
  }, [registerPath, unregisterPath]);
  var pathUserContext = React47.useMemo(function() {
    return {
      isSubPathKey
    };
  }, [isSubPathKey]);
  React47.useEffect(function() {
    refreshOverflowKeys(allVisible ? EMPTY_LIST : childList.slice(lastVisibleIndex + 1).map(function(child) {
      return child.key;
    }));
  }, [lastVisibleIndex, allVisible]);
  var _useMergedState3 = useMergedState(activeKey || defaultActiveFirst && ((_childList$ = childList[0]) === null || _childList$ === void 0 ? void 0 : _childList$.key), {
    value: activeKey
  }), _useMergedState4 = _slicedToArray(_useMergedState3, 2), mergedActiveKey = _useMergedState4[0], setMergedActiveKey = _useMergedState4[1];
  var onActive = useMemoCallback(function(key) {
    setMergedActiveKey(key);
  });
  var onInactive = useMemoCallback(function() {
    setMergedActiveKey(void 0);
  });
  (0, import_react19.useImperativeHandle)(ref, function() {
    return {
      list: containerRef.current,
      focus: function focus(options) {
        var _childList$find;
        var shouldFocusKey = mergedActiveKey !== null && mergedActiveKey !== void 0 ? mergedActiveKey : (_childList$find = childList.find(function(node) {
          return !node.props.disabled;
        })) === null || _childList$find === void 0 ? void 0 : _childList$find.key;
        if (shouldFocusKey) {
          var _containerRef$current, _containerRef$current2, _containerRef$current3;
          (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : (_containerRef$current2 = _containerRef$current.querySelector("li[data-menu-id='".concat(getMenuId(uuid2, shouldFocusKey), "']"))) === null || _containerRef$current2 === void 0 ? void 0 : (_containerRef$current3 = _containerRef$current2.focus) === null || _containerRef$current3 === void 0 ? void 0 : _containerRef$current3.call(_containerRef$current2, options);
        }
      }
    };
  });
  var _useMergedState5 = useMergedState(defaultSelectedKeys || [], {
    value: selectedKeys,
    // Legacy convert key to array
    postState: function postState(keys) {
      if (Array.isArray(keys)) {
        return keys;
      }
      if (keys === null || keys === void 0) {
        return EMPTY_LIST;
      }
      return [keys];
    }
  }), _useMergedState6 = _slicedToArray(_useMergedState5, 2), mergedSelectKeys = _useMergedState6[0], setMergedSelectKeys = _useMergedState6[1];
  var triggerSelection = function triggerSelection2(info) {
    if (selectable) {
      var targetKey = info.key;
      var exist = mergedSelectKeys.includes(targetKey);
      var newSelectKeys;
      if (multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys.filter(function(key) {
            return key !== targetKey;
          });
        } else {
          newSelectKeys = [].concat(_toConsumableArray(mergedSelectKeys), [targetKey]);
        }
      } else {
        newSelectKeys = [targetKey];
      }
      setMergedSelectKeys(newSelectKeys);
      var selectInfo = _objectSpread2(_objectSpread2({}, info), {}, {
        selectedKeys: newSelectKeys
      });
      if (exist) {
        onDeselect === null || onDeselect === void 0 ? void 0 : onDeselect(selectInfo);
      } else {
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(selectInfo);
      }
    }
    if (!multiple && mergedOpenKeys.length && mergedMode !== "inline") {
      triggerOpenKeys(EMPTY_LIST);
    }
  };
  var onInternalClick = useMemoCallback(function(info) {
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp(info));
    triggerSelection(info);
  });
  var onInternalOpenChange = useMemoCallback(function(key, open) {
    var newOpenKeys = mergedOpenKeys.filter(function(k) {
      return k !== key;
    });
    if (open) {
      newOpenKeys.push(key);
    } else if (mergedMode !== "inline") {
      var subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(function(k) {
        return !subPathKeys.has(k);
      });
    }
    if (!(0, import_shallowequal2.default)(mergedOpenKeys, newOpenKeys)) {
      triggerOpenKeys(newOpenKeys);
    }
  });
  var getInternalPopupContainer = useMemoCallback(getPopupContainer);
  var triggerAccessibilityOpen = function triggerAccessibilityOpen2(key, open) {
    var nextOpen = open !== null && open !== void 0 ? open : !mergedOpenKeys.includes(key);
    onInternalOpenChange(key, nextOpen);
  };
  var onInternalKeyDown = useAccessibility(mergedMode, mergedActiveKey, isRtl, uuid2, containerRef, getKeys, getKeyPath, setMergedActiveKey, triggerAccessibilityOpen, onKeyDown);
  React47.useEffect(function() {
    setMounted(true);
  }, []);
  var privateContext = React47.useMemo(function() {
    return {
      _internalRenderMenuItem,
      _internalRenderSubMenuItem
    };
  }, [_internalRenderMenuItem, _internalRenderSubMenuItem]);
  var wrappedChildList = mergedMode !== "horizontal" || disabledOverflow ? childList : (
    // Need wrap for overflow dropdown that do not response for open
    childList.map(function(child, index) {
      return (
        // Always wrap provider to avoid sub node re-mount
        React47.createElement(InheritableContextProvider, {
          key: child.key,
          overflowDisabled: index > lastVisibleIndex
        }, child)
      );
    })
  );
  var container = React47.createElement(es_default2, _extends({
    id,
    ref: containerRef,
    prefixCls: "".concat(prefixCls, "-overflow"),
    component: "ul",
    itemComponent: MenuItem_default,
    className: (0, import_classnames14.default)(prefixCls, "".concat(prefixCls, "-root"), "".concat(prefixCls, "-").concat(mergedMode), className, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-inline-collapsed"), mergedInlineCollapsed), _defineProperty(_classNames, "".concat(prefixCls, "-rtl"), isRtl), _classNames), rootClassName),
    dir: direction,
    style: style2,
    role: "menu",
    tabIndex,
    data: wrappedChildList,
    renderRawItem: function renderRawItem(node) {
      return node;
    },
    renderRawRest: function renderRawRest(omitItems) {
      var len = omitItems.length;
      var originOmitItems = len ? childList.slice(-len) : null;
      return React47.createElement(SubMenu, {
        eventKey: OVERFLOW_KEY,
        title: overflowedIndicator,
        disabled: allVisible,
        internalPopupClose: len === 0,
        popupClassName: overflowedIndicatorPopupClassName
      }, originOmitItems);
    },
    maxCount: mergedMode !== "horizontal" || disabledOverflow ? es_default2.INVALIDATE : es_default2.RESPONSIVE,
    ssr: "full",
    "data-menu-list": true,
    onVisibleChange: function onVisibleChange(newLastIndex) {
      setLastVisibleIndex(newLastIndex);
    },
    onKeyDown: onInternalKeyDown
  }, restProps));
  return React47.createElement(PrivateContext_default.Provider, {
    value: privateContext
  }, React47.createElement(IdContext.Provider, {
    value: uuid2
  }, React47.createElement(InheritableContextProvider, {
    prefixCls,
    rootClassName,
    mode: mergedMode,
    openKeys: mergedOpenKeys,
    rtl: isRtl,
    disabled,
    motion: mounted ? motion : null,
    defaultMotions: mounted ? defaultMotions : null,
    activeKey: mergedActiveKey,
    onActive,
    onInactive,
    selectedKeys: mergedSelectKeys,
    inlineIndent,
    subMenuOpenDelay,
    subMenuCloseDelay,
    forceSubMenuRender,
    builtinPlacements,
    triggerSubMenuAction,
    getPopupContainer: getInternalPopupContainer,
    itemIcon,
    expandIcon,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange
  }, React47.createElement(PathUserContext.Provider, {
    value: pathUserContext
  }, container), React47.createElement("div", {
    style: {
      display: "none"
    },
    "aria-hidden": true
  }, React47.createElement(PathRegisterContext.Provider, {
    value: registerPathContext
  }, childList)))));
});
var Menu_default = Menu;

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/MenuItemGroup.js
init_extends();
var React48 = __toESM(require_react());
var import_classnames15 = __toESM(require_classnames());
var _excluded14 = ["className", "title", "eventKey", "children"];
var _excluded26 = ["children"];
var InternalMenuItemGroup = function InternalMenuItemGroup2(_ref) {
  var className = _ref.className, title = _ref.title, eventKey = _ref.eventKey, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded14);
  var _React$useContext = React48.useContext(MenuContext), prefixCls = _React$useContext.prefixCls;
  var groupPrefixCls = "".concat(prefixCls, "-item-group");
  return React48.createElement("li", _extends({}, restProps, {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    className: (0, import_classnames15.default)(groupPrefixCls, className)
  }), React48.createElement("div", {
    className: "".concat(groupPrefixCls, "-title"),
    title: typeof title === "string" ? title : void 0
  }, title), React48.createElement("ul", {
    className: "".concat(groupPrefixCls, "-list")
  }, children));
};
function MenuItemGroup(_ref2) {
  var children = _ref2.children, props = _objectWithoutProperties(_ref2, _excluded26);
  var connectedKeyPath = useFullPath(props.eventKey);
  var childList = parseChildren(children, connectedKeyPath);
  var measure = useMeasure();
  if (measure) {
    return childList;
  }
  return React48.createElement(InternalMenuItemGroup, omit(props, ["warnKey"]), childList);
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/Divider.js
var React49 = __toESM(require_react());
var import_classnames16 = __toESM(require_classnames());
function Divider(_ref) {
  var className = _ref.className, style2 = _ref.style;
  var _React$useContext = React49.useContext(MenuContext), prefixCls = _React$useContext.prefixCls;
  var measure = useMeasure();
  if (measure) {
    return null;
  }
  return React49.createElement("li", {
    className: (0, import_classnames16.default)("".concat(prefixCls, "-item-divider"), className),
    style: style2
  });
}

// ../../node_modules/rc-tabs/node_modules/rc-menu/es/index.js
var ExportMenu = Menu_default;
ExportMenu.Item = MenuItem_default;
ExportMenu.SubMenu = SubMenu;
ExportMenu.ItemGroup = MenuItemGroup;
ExportMenu.Divider = Divider;
var es_default6 = ExportMenu;

// ../../node_modules/rc-tabs/node_modules/rc-dropdown/es/Dropdown.js
var React51 = __toESM(require_react());
var import_classnames17 = __toESM(require_classnames());

// ../../node_modules/rc-tabs/node_modules/rc-dropdown/es/placements.js
var autoAdjustOverflow2 = {
  adjustX: 1,
  adjustY: 1
};
var targetOffset = [0, 0];
var placements2 = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow2,
    offset: [0, -4],
    targetOffset
  },
  topCenter: {
    points: ["bc", "tc"],
    overflow: autoAdjustOverflow2,
    offset: [0, -4],
    targetOffset
  },
  topRight: {
    points: ["br", "tr"],
    overflow: autoAdjustOverflow2,
    offset: [0, -4],
    targetOffset
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow2,
    offset: [0, 4],
    targetOffset
  },
  bottomCenter: {
    points: ["tc", "bc"],
    overflow: autoAdjustOverflow2,
    offset: [0, 4],
    targetOffset
  },
  bottomRight: {
    points: ["tr", "br"],
    overflow: autoAdjustOverflow2,
    offset: [0, 4],
    targetOffset
  }
};
var placements_default = placements2;

// ../../node_modules/rc-tabs/node_modules/rc-dropdown/es/hooks/useAccessibility.js
var React50 = __toESM(require_react());
var ESC2 = KeyCode_default.ESC;
var TAB = KeyCode_default.TAB;
function useAccessibility2(_ref) {
  var visible = _ref.visible, setTriggerVisible = _ref.setTriggerVisible, triggerRef = _ref.triggerRef, onVisibleChange = _ref.onVisibleChange, autoFocus = _ref.autoFocus;
  var focusMenuRef = React50.useRef(false);
  var handleCloseMenuAndReturnFocus = function handleCloseMenuAndReturnFocus2() {
    if (visible && triggerRef.current) {
      var _triggerRef$current, _triggerRef$current$t, _triggerRef$current$t2, _triggerRef$current$t3;
      (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 ? void 0 : (_triggerRef$current$t = _triggerRef$current.triggerRef) === null || _triggerRef$current$t === void 0 ? void 0 : (_triggerRef$current$t2 = _triggerRef$current$t.current) === null || _triggerRef$current$t2 === void 0 ? void 0 : (_triggerRef$current$t3 = _triggerRef$current$t2.focus) === null || _triggerRef$current$t3 === void 0 ? void 0 : _triggerRef$current$t3.call(_triggerRef$current$t2);
      setTriggerVisible(false);
      if (typeof onVisibleChange === "function") {
        onVisibleChange(false);
      }
    }
  };
  var focusMenu = function focusMenu2() {
    var _triggerRef$current2, _triggerRef$current2$, _triggerRef$current2$2, _triggerRef$current2$3;
    var elements = getFocusNodeList((_triggerRef$current2 = triggerRef.current) === null || _triggerRef$current2 === void 0 ? void 0 : (_triggerRef$current2$ = _triggerRef$current2.popupRef) === null || _triggerRef$current2$ === void 0 ? void 0 : (_triggerRef$current2$2 = _triggerRef$current2$.current) === null || _triggerRef$current2$2 === void 0 ? void 0 : (_triggerRef$current2$3 = _triggerRef$current2$2.getElement) === null || _triggerRef$current2$3 === void 0 ? void 0 : _triggerRef$current2$3.call(_triggerRef$current2$2));
    var firstElement = elements[0];
    if (firstElement === null || firstElement === void 0 ? void 0 : firstElement.focus) {
      firstElement.focus();
      focusMenuRef.current = true;
      return true;
    }
    return false;
  };
  var handleKeyDown = function handleKeyDown2(event) {
    switch (event.keyCode) {
      case ESC2:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB: {
        var focusResult = false;
        if (!focusMenuRef.current) {
          focusResult = focusMenu();
        }
        if (focusResult) {
          event.preventDefault();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
      }
    }
  };
  React50.useEffect(function() {
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
      if (autoFocus) {
        raf_default(focusMenu, 3);
      }
      return function() {
        window.removeEventListener("keydown", handleKeyDown);
        focusMenuRef.current = false;
      };
    }
    return function() {
      focusMenuRef.current = false;
    };
  }, [visible]);
}

// ../../node_modules/rc-tabs/node_modules/rc-dropdown/es/Dropdown.js
var _excluded15 = ["arrow", "prefixCls", "transitionName", "animation", "align", "placement", "placements", "getPopupContainer", "showAction", "hideAction", "overlayClassName", "overlayStyle", "visible", "trigger", "autoFocus"];
function Dropdown(props, ref) {
  var _props$arrow = props.arrow, arrow = _props$arrow === void 0 ? false : _props$arrow, _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-dropdown" : _props$prefixCls, transitionName = props.transitionName, animation = props.animation, align = props.align, _props$placement = props.placement, placement = _props$placement === void 0 ? "bottomLeft" : _props$placement, _props$placements = props.placements, placements5 = _props$placements === void 0 ? placements_default : _props$placements, getPopupContainer = props.getPopupContainer, showAction = props.showAction, hideAction = props.hideAction, overlayClassName = props.overlayClassName, overlayStyle = props.overlayStyle, visible = props.visible, _props$trigger = props.trigger, trigger = _props$trigger === void 0 ? ["hover"] : _props$trigger, autoFocus = props.autoFocus, otherProps = _objectWithoutProperties(props, _excluded15);
  var _React$useState = React51.useState(), _React$useState2 = _slicedToArray(_React$useState, 2), triggerVisible = _React$useState2[0], setTriggerVisible = _React$useState2[1];
  var mergedVisible = "visible" in props ? visible : triggerVisible;
  var triggerRef = React51.useRef(null);
  React51.useImperativeHandle(ref, function() {
    return triggerRef.current;
  });
  useAccessibility2({
    visible: mergedVisible,
    setTriggerVisible,
    triggerRef,
    onVisibleChange: props.onVisibleChange,
    autoFocus
  });
  var getOverlayElement = function getOverlayElement2() {
    var overlay = props.overlay;
    var overlayElement;
    if (typeof overlay === "function") {
      overlayElement = overlay();
    } else {
      overlayElement = overlay;
    }
    return overlayElement;
  };
  var onClick = function onClick2(e) {
    var onOverlayClick = props.onOverlayClick;
    setTriggerVisible(false);
    if (onOverlayClick) {
      onOverlayClick(e);
    }
  };
  var onVisibleChange = function onVisibleChange2(newVisible) {
    var onVisibleChangeProp = props.onVisibleChange;
    setTriggerVisible(newVisible);
    if (typeof onVisibleChangeProp === "function") {
      onVisibleChangeProp(newVisible);
    }
  };
  var getMenuElement = function getMenuElement2() {
    var overlayElement = getOverlayElement();
    return React51.createElement(React51.Fragment, null, arrow && React51.createElement("div", {
      className: "".concat(prefixCls, "-arrow")
    }), overlayElement);
  };
  var getMenuElementOrLambda = function getMenuElementOrLambda2() {
    var overlay = props.overlay;
    if (typeof overlay === "function") {
      return getMenuElement;
    }
    return getMenuElement();
  };
  var getMinOverlayWidthMatchTrigger = function getMinOverlayWidthMatchTrigger2() {
    var minOverlayWidthMatchTrigger = props.minOverlayWidthMatchTrigger, alignPoint2 = props.alignPoint;
    if ("minOverlayWidthMatchTrigger" in props) {
      return minOverlayWidthMatchTrigger;
    }
    return !alignPoint2;
  };
  var getOpenClassName = function getOpenClassName2() {
    var openClassName = props.openClassName;
    if (openClassName !== void 0) {
      return openClassName;
    }
    return "".concat(prefixCls, "-open");
  };
  var renderChildren = function renderChildren2() {
    var children = props.children;
    var childrenProps = children.props ? children.props : {};
    var childClassName = (0, import_classnames17.default)(childrenProps.className, getOpenClassName());
    return mergedVisible && children ? React51.cloneElement(children, {
      className: childClassName
    }) : children;
  };
  var triggerHideAction = hideAction;
  if (!triggerHideAction && trigger.indexOf("contextMenu") !== -1) {
    triggerHideAction = ["click"];
  }
  return React51.createElement(es_default5, _objectSpread2(_objectSpread2({
    builtinPlacements: placements5
  }, otherProps), {}, {
    prefixCls,
    ref: triggerRef,
    popupClassName: (0, import_classnames17.default)(overlayClassName, _defineProperty({}, "".concat(prefixCls, "-show-arrow"), arrow)),
    popupStyle: overlayStyle,
    action: trigger,
    showAction,
    hideAction: triggerHideAction || [],
    popupPlacement: placement,
    popupAlign: align,
    popupTransitionName: transitionName,
    popupAnimation: animation,
    popupVisible: mergedVisible,
    stretch: getMinOverlayWidthMatchTrigger() ? "minWidth" : "",
    popup: getMenuElementOrLambda(),
    onPopupVisibleChange: onVisibleChange,
    onPopupClick: onClick,
    getPopupContainer
  }), renderChildren());
}
var Dropdown_default = React51.forwardRef(Dropdown);

// ../../node_modules/rc-tabs/node_modules/rc-dropdown/es/index.js
var es_default7 = Dropdown_default;

// ../../node_modules/rc-tabs/es/TabNavList/AddButton.js
var React52 = __toESM(require_react());
function AddButton(_ref, ref) {
  var prefixCls = _ref.prefixCls, editable = _ref.editable, locale = _ref.locale, style2 = _ref.style;
  if (!editable || editable.showAdd === false) {
    return null;
  }
  return React52.createElement("button", {
    ref,
    type: "button",
    className: "".concat(prefixCls, "-nav-add"),
    style: style2,
    "aria-label": (locale === null || locale === void 0 ? void 0 : locale.addAriaLabel) || "Add tab",
    onClick: function onClick(event) {
      editable.onEdit("add", {
        event
      });
    }
  }, editable.addIcon || "+");
}
var AddButton_default = React52.forwardRef(AddButton);

// ../../node_modules/rc-tabs/es/TabNavList/OperationNode.js
function OperationNode(_ref, ref) {
  var prefixCls = _ref.prefixCls, id = _ref.id, tabs = _ref.tabs, locale = _ref.locale, mobile = _ref.mobile, _ref$moreIcon = _ref.moreIcon, moreIcon = _ref$moreIcon === void 0 ? "More" : _ref$moreIcon, moreTransitionName = _ref.moreTransitionName, style2 = _ref.style, className = _ref.className, editable = _ref.editable, tabBarGutter = _ref.tabBarGutter, rtl = _ref.rtl, removeAriaLabel = _ref.removeAriaLabel, onTabClick = _ref.onTabClick, getPopupContainer = _ref.getPopupContainer, popupClassName = _ref.popupClassName;
  var _useState = (0, import_react20.useState)(false), _useState2 = _slicedToArray(_useState, 2), open = _useState2[0], setOpen = _useState2[1];
  var _useState3 = (0, import_react20.useState)(null), _useState4 = _slicedToArray(_useState3, 2), selectedKey = _useState4[0], setSelectedKey = _useState4[1];
  var popupId = "".concat(id, "-more-popup");
  var dropdownPrefix = "".concat(prefixCls, "-dropdown");
  var selectedItemId = selectedKey !== null ? "".concat(popupId, "-").concat(selectedKey) : null;
  var dropdownAriaLabel = locale === null || locale === void 0 ? void 0 : locale.dropdownAriaLabel;
  function onRemoveTab(event, key) {
    event.preventDefault();
    event.stopPropagation();
    editable.onEdit("remove", {
      key,
      event
    });
  }
  var menu = React53.createElement(es_default6, {
    onClick: function onClick(_ref2) {
      var key = _ref2.key, domEvent = _ref2.domEvent;
      onTabClick(key, domEvent);
      setOpen(false);
    },
    prefixCls: "".concat(dropdownPrefix, "-menu"),
    id: popupId,
    tabIndex: -1,
    role: "listbox",
    "aria-activedescendant": selectedItemId,
    selectedKeys: [selectedKey],
    "aria-label": dropdownAriaLabel !== void 0 ? dropdownAriaLabel : "expanded dropdown"
  }, tabs.map(function(tab) {
    var removable = editable && tab.closable !== false && !tab.disabled;
    return React53.createElement(MenuItem_default, {
      key: tab.key,
      id: "".concat(popupId, "-").concat(tab.key),
      role: "option",
      "aria-controls": id && "".concat(id, "-panel-").concat(tab.key),
      disabled: tab.disabled
    }, React53.createElement("span", null, tab.tab), removable && React53.createElement("button", {
      type: "button",
      "aria-label": removeAriaLabel || "remove",
      tabIndex: 0,
      className: "".concat(dropdownPrefix, "-menu-item-remove"),
      onClick: function onClick(e) {
        e.stopPropagation();
        onRemoveTab(e, tab.key);
      }
    }, tab.closeIcon || editable.removeIcon || "×"));
  }));
  function selectOffset(offset2) {
    var enabledTabs = tabs.filter(function(tab2) {
      return !tab2.disabled;
    });
    var selectedIndex = enabledTabs.findIndex(function(tab2) {
      return tab2.key === selectedKey;
    }) || 0;
    var len = enabledTabs.length;
    for (var i = 0; i < len; i += 1) {
      selectedIndex = (selectedIndex + offset2 + len) % len;
      var tab = enabledTabs[selectedIndex];
      if (!tab.disabled) {
        setSelectedKey(tab.key);
        return;
      }
    }
  }
  function onKeyDown(e) {
    var which = e.which;
    if (!open) {
      if ([KeyCode_default.DOWN, KeyCode_default.SPACE, KeyCode_default.ENTER].includes(which)) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (which) {
      case KeyCode_default.UP:
        selectOffset(-1);
        e.preventDefault();
        break;
      case KeyCode_default.DOWN:
        selectOffset(1);
        e.preventDefault();
        break;
      case KeyCode_default.ESC:
        setOpen(false);
        break;
      case KeyCode_default.SPACE:
      case KeyCode_default.ENTER:
        if (selectedKey !== null)
          onTabClick(selectedKey, e);
        break;
    }
  }
  (0, import_react20.useEffect)(function() {
    var ele = document.getElementById(selectedItemId);
    if (ele && ele.scrollIntoView) {
      ele.scrollIntoView(false);
    }
  }, [selectedKey]);
  (0, import_react20.useEffect)(function() {
    if (!open) {
      setSelectedKey(null);
    }
  }, [open]);
  var moreStyle = _defineProperty({}, rtl ? "marginRight" : "marginLeft", tabBarGutter);
  if (!tabs.length) {
    moreStyle.visibility = "hidden";
    moreStyle.order = 1;
  }
  var overlayClassName = (0, import_classnames18.default)(_defineProperty({}, "".concat(dropdownPrefix, "-rtl"), rtl));
  var moreNode = mobile ? null : React53.createElement(es_default7, {
    prefixCls: dropdownPrefix,
    overlay: menu,
    trigger: ["hover"],
    visible: tabs.length ? open : false,
    transitionName: moreTransitionName,
    onVisibleChange: setOpen,
    overlayClassName: (0, import_classnames18.default)(overlayClassName, popupClassName),
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
    getPopupContainer
  }, React53.createElement("button", {
    type: "button",
    className: "".concat(prefixCls, "-nav-more"),
    style: moreStyle,
    tabIndex: -1,
    "aria-hidden": "true",
    "aria-haspopup": "listbox",
    "aria-controls": popupId,
    id: "".concat(id, "-more"),
    "aria-expanded": open,
    onKeyDown
  }, moreIcon));
  return React53.createElement("div", {
    className: (0, import_classnames18.default)("".concat(prefixCls, "-nav-operations"), className),
    style: style2,
    ref
  }, moreNode, React53.createElement(AddButton_default, {
    prefixCls,
    locale,
    editable
  }));
}
var OperationNode_default = React53.memo(React53.forwardRef(OperationNode), function(_, next) {
  return (
    // https://github.com/ant-design/ant-design/issues/32544
    // We'd better remove syntactic sugar in `rc-menu` since this has perf issue
    next.tabMoving
  );
});

// ../../node_modules/rc-tabs/es/TabContext.js
var import_react21 = __toESM(require_react());
var TabContext_default = (0, import_react21.createContext)(null);

// ../../node_modules/rc-tabs/es/hooks/useTouchMove.js
var React54 = __toESM(require_react());
var import_react22 = __toESM(require_react());
var MIN_SWIPE_DISTANCE = 0.1;
var STOP_SWIPE_DISTANCE = 0.01;
var REFRESH_INTERVAL = 20;
var SPEED_OFF_MULTIPLE = Math.pow(0.995, REFRESH_INTERVAL);
function useTouchMove(ref, onOffset) {
  var _useState = (0, import_react22.useState)(), _useState2 = _slicedToArray(_useState, 2), touchPosition = _useState2[0], setTouchPosition = _useState2[1];
  var _useState3 = (0, import_react22.useState)(0), _useState4 = _slicedToArray(_useState3, 2), lastTimestamp = _useState4[0], setLastTimestamp = _useState4[1];
  var _useState5 = (0, import_react22.useState)(0), _useState6 = _slicedToArray(_useState5, 2), lastTimeDiff = _useState6[0], setLastTimeDiff = _useState6[1];
  var _useState7 = (0, import_react22.useState)(), _useState8 = _slicedToArray(_useState7, 2), lastOffset = _useState8[0], setLastOffset = _useState8[1];
  var motionRef = (0, import_react22.useRef)();
  function onTouchStart(e) {
    var _e$touches$ = e.touches[0], screenX = _e$touches$.screenX, screenY = _e$touches$.screenY;
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    window.clearInterval(motionRef.current);
  }
  function onTouchMove(e) {
    if (!touchPosition)
      return;
    e.preventDefault();
    var _e$touches$2 = e.touches[0], screenX = _e$touches$2.screenX, screenY = _e$touches$2.screenY;
    setTouchPosition({
      x: screenX,
      y: screenY
    });
    var offsetX = screenX - touchPosition.x;
    var offsetY = screenY - touchPosition.y;
    onOffset(offsetX, offsetY);
    var now = Date.now();
    setLastTimestamp(now);
    setLastTimeDiff(now - lastTimestamp);
    setLastOffset({
      x: offsetX,
      y: offsetY
    });
  }
  function onTouchEnd() {
    if (!touchPosition)
      return;
    setTouchPosition(null);
    setLastOffset(null);
    if (lastOffset) {
      var distanceX = lastOffset.x / lastTimeDiff;
      var distanceY = lastOffset.y / lastTimeDiff;
      var absX = Math.abs(distanceX);
      var absY = Math.abs(distanceY);
      if (Math.max(absX, absY) < MIN_SWIPE_DISTANCE)
        return;
      var currentX = distanceX;
      var currentY = distanceY;
      motionRef.current = window.setInterval(function() {
        if (Math.abs(currentX) < STOP_SWIPE_DISTANCE && Math.abs(currentY) < STOP_SWIPE_DISTANCE) {
          window.clearInterval(motionRef.current);
          return;
        }
        currentX *= SPEED_OFF_MULTIPLE;
        currentY *= SPEED_OFF_MULTIPLE;
        onOffset(currentX * REFRESH_INTERVAL, currentY * REFRESH_INTERVAL);
      }, REFRESH_INTERVAL);
    }
  }
  var lastWheelDirectionRef = (0, import_react22.useRef)();
  function onWheel(e) {
    var deltaX = e.deltaX, deltaY = e.deltaY;
    var mixed = 0;
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);
    if (absX === absY) {
      mixed = lastWheelDirectionRef.current === "x" ? deltaX : deltaY;
    } else if (absX > absY) {
      mixed = deltaX;
      lastWheelDirectionRef.current = "x";
    } else {
      mixed = deltaY;
      lastWheelDirectionRef.current = "y";
    }
    if (onOffset(-mixed, -mixed)) {
      e.preventDefault();
    }
  }
  var touchEventsRef = (0, import_react22.useRef)(null);
  touchEventsRef.current = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onWheel
  };
  React54.useEffect(function() {
    function onProxyTouchStart(e) {
      touchEventsRef.current.onTouchStart(e);
    }
    function onProxyTouchMove(e) {
      touchEventsRef.current.onTouchMove(e);
    }
    function onProxyTouchEnd(e) {
      touchEventsRef.current.onTouchEnd(e);
    }
    function onProxyWheel(e) {
      touchEventsRef.current.onWheel(e);
    }
    document.addEventListener("touchmove", onProxyTouchMove, {
      passive: false
    });
    document.addEventListener("touchend", onProxyTouchEnd, {
      passive: false
    });
    ref.current.addEventListener("touchstart", onProxyTouchStart, {
      passive: false
    });
    ref.current.addEventListener("wheel", onProxyWheel);
    return function() {
      document.removeEventListener("touchmove", onProxyTouchMove);
      document.removeEventListener("touchend", onProxyTouchEnd);
    };
  }, []);
}

// ../../node_modules/rc-tabs/es/hooks/useRefs.js
var React55 = __toESM(require_react());
var import_react23 = __toESM(require_react());
function useRefs() {
  var cacheRefs = (0, import_react23.useRef)(/* @__PURE__ */ new Map());
  function getRef(key) {
    if (!cacheRefs.current.has(key)) {
      cacheRefs.current.set(key, React55.createRef());
    }
    return cacheRefs.current.get(key);
  }
  function removeRef(key) {
    cacheRefs.current.delete(key);
  }
  return [getRef, removeRef];
}

// ../../node_modules/rc-tabs/es/hooks/useSyncState.js
var React56 = __toESM(require_react());
function useSyncState(defaultState, onChange) {
  var stateRef = React56.useRef(defaultState);
  var _React$useState = React56.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), forceUpdate = _React$useState2[1];
  function setState(updater) {
    var newValue = typeof updater === "function" ? updater(stateRef.current) : updater;
    if (newValue !== stateRef.current) {
      onChange(newValue, stateRef.current);
    }
    stateRef.current = newValue;
    forceUpdate({});
  }
  return [stateRef.current, setState];
}

// ../../node_modules/rc-tabs/es/TabNavList/index.js
var ExtraContent = function ExtraContent2(_ref) {
  var position = _ref.position, prefixCls = _ref.prefixCls, extra = _ref.extra;
  if (!extra)
    return null;
  var content;
  var assertExtra = {};
  if (extra && _typeof(extra) === "object" && !React57.isValidElement(extra)) {
    assertExtra = extra;
  } else {
    assertExtra.right = extra;
  }
  if (position === "right") {
    content = assertExtra.right;
  }
  if (position === "left") {
    content = assertExtra.left;
  }
  return content ? React57.createElement("div", {
    className: "".concat(prefixCls, "-extra-content")
  }, content) : null;
};
function TabNavList(props, ref) {
  var _classNames;
  var _React$useContext = React57.useContext(TabContext_default), prefixCls = _React$useContext.prefixCls, tabs = _React$useContext.tabs;
  var className = props.className, style2 = props.style, id = props.id, animated = props.animated, activeKey = props.activeKey, rtl = props.rtl, extra = props.extra, editable = props.editable, locale = props.locale, tabPosition = props.tabPosition, tabBarGutter = props.tabBarGutter, children = props.children, onTabClick = props.onTabClick, onTabScroll = props.onTabScroll;
  var tabsWrapperRef = (0, import_react24.useRef)();
  var tabListRef = (0, import_react24.useRef)();
  var operationsRef = (0, import_react24.useRef)();
  var innerAddButtonRef = (0, import_react24.useRef)();
  var _useRefs = useRefs(), _useRefs2 = _slicedToArray(_useRefs, 2), getBtnRef = _useRefs2[0], removeBtnRef = _useRefs2[1];
  var tabPositionTopOrBottom = tabPosition === "top" || tabPosition === "bottom";
  var _useSyncState = useSyncState(0, function(next, prev) {
    if (tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? "left" : "right"
      });
    }
  }), _useSyncState2 = _slicedToArray(_useSyncState, 2), transformLeft = _useSyncState2[0], setTransformLeft = _useSyncState2[1];
  var _useSyncState3 = useSyncState(0, function(next, prev) {
    if (!tabPositionTopOrBottom && onTabScroll) {
      onTabScroll({
        direction: next > prev ? "top" : "bottom"
      });
    }
  }), _useSyncState4 = _slicedToArray(_useSyncState3, 2), transformTop = _useSyncState4[0], setTransformTop = _useSyncState4[1];
  var _useState = (0, import_react24.useState)(0), _useState2 = _slicedToArray(_useState, 2), wrapperScrollWidth = _useState2[0], setWrapperScrollWidth = _useState2[1];
  var _useState3 = (0, import_react24.useState)(0), _useState4 = _slicedToArray(_useState3, 2), wrapperScrollHeight = _useState4[0], setWrapperScrollHeight = _useState4[1];
  var _useState5 = (0, import_react24.useState)(null), _useState6 = _slicedToArray(_useState5, 2), wrapperWidth = _useState6[0], setWrapperWidth = _useState6[1];
  var _useState7 = (0, import_react24.useState)(null), _useState8 = _slicedToArray(_useState7, 2), wrapperHeight = _useState8[0], setWrapperHeight = _useState8[1];
  var _useState9 = (0, import_react24.useState)(0), _useState10 = _slicedToArray(_useState9, 2), addWidth = _useState10[0], setAddWidth = _useState10[1];
  var _useState11 = (0, import_react24.useState)(0), _useState12 = _slicedToArray(_useState11, 2), addHeight = _useState12[0], setAddHeight = _useState12[1];
  var _useRafState = useRafState(/* @__PURE__ */ new Map()), _useRafState2 = _slicedToArray(_useRafState, 2), tabSizes = _useRafState2[0], setTabSizes = _useRafState2[1];
  var tabOffsets = useOffsets(tabs, tabSizes, wrapperScrollWidth);
  var operationsHiddenClassName = "".concat(prefixCls, "-nav-operations-hidden");
  var transformMin = 0;
  var transformMax = 0;
  if (!tabPositionTopOrBottom) {
    transformMin = Math.min(0, wrapperHeight - wrapperScrollHeight);
    transformMax = 0;
  } else if (rtl) {
    transformMin = 0;
    transformMax = Math.max(0, wrapperScrollWidth - wrapperWidth);
  } else {
    transformMin = Math.min(0, wrapperWidth - wrapperScrollWidth);
    transformMax = 0;
  }
  function alignInRange(value) {
    if (value < transformMin) {
      return transformMin;
    }
    if (value > transformMax) {
      return transformMax;
    }
    return value;
  }
  var touchMovingRef = (0, import_react24.useRef)();
  var _useState13 = (0, import_react24.useState)(), _useState14 = _slicedToArray(_useState13, 2), lockAnimation = _useState14[0], setLockAnimation = _useState14[1];
  function doLockAnimation() {
    setLockAnimation(Date.now());
  }
  function clearTouchMoving() {
    window.clearTimeout(touchMovingRef.current);
  }
  useTouchMove(tabsWrapperRef, function(offsetX, offsetY) {
    function doMove(setState, offset2) {
      setState(function(value) {
        var newValue = alignInRange(value + offset2);
        return newValue;
      });
    }
    if (tabPositionTopOrBottom) {
      if (wrapperWidth >= wrapperScrollWidth) {
        return false;
      }
      doMove(setTransformLeft, offsetX);
    } else {
      if (wrapperHeight >= wrapperScrollHeight) {
        return false;
      }
      doMove(setTransformTop, offsetY);
    }
    clearTouchMoving();
    doLockAnimation();
    return true;
  });
  (0, import_react24.useEffect)(function() {
    clearTouchMoving();
    if (lockAnimation) {
      touchMovingRef.current = window.setTimeout(function() {
        setLockAnimation(0);
      }, 100);
    }
    return clearTouchMoving;
  }, [lockAnimation]);
  function scrollToTab() {
    var key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : activeKey;
    var tabOffset = tabOffsets.get(key) || {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0
    };
    if (tabPositionTopOrBottom) {
      var newTransform = transformLeft;
      if (rtl) {
        if (tabOffset.right < transformLeft) {
          newTransform = tabOffset.right;
        } else if (tabOffset.right + tabOffset.width > transformLeft + wrapperWidth) {
          newTransform = tabOffset.right + tabOffset.width - wrapperWidth;
        }
      } else if (tabOffset.left < -transformLeft) {
        newTransform = -tabOffset.left;
      } else if (tabOffset.left + tabOffset.width > -transformLeft + wrapperWidth) {
        newTransform = -(tabOffset.left + tabOffset.width - wrapperWidth);
      }
      setTransformTop(0);
      setTransformLeft(alignInRange(newTransform));
    } else {
      var _newTransform = transformTop;
      if (tabOffset.top < -transformTop) {
        _newTransform = -tabOffset.top;
      } else if (tabOffset.top + tabOffset.height > -transformTop + wrapperHeight) {
        _newTransform = -(tabOffset.top + tabOffset.height - wrapperHeight);
      }
      setTransformLeft(0);
      setTransformTop(alignInRange(_newTransform));
    }
  }
  var _useVisibleRange = useVisibleRange(tabOffsets, {
    width: wrapperWidth,
    height: wrapperHeight,
    left: transformLeft,
    top: transformTop
  }, {
    width: wrapperScrollWidth,
    height: wrapperScrollHeight
  }, {
    width: addWidth,
    height: addHeight
  }, _objectSpread2(_objectSpread2({}, props), {}, {
    tabs
  })), _useVisibleRange2 = _slicedToArray(_useVisibleRange, 2), visibleStart = _useVisibleRange2[0], visibleEnd = _useVisibleRange2[1];
  var tabNodeStyle = {};
  if (tabPosition === "top" || tabPosition === "bottom") {
    tabNodeStyle[rtl ? "marginRight" : "marginLeft"] = tabBarGutter;
  } else {
    tabNodeStyle.marginTop = tabBarGutter;
  }
  var tabNodes = tabs.map(function(tab, i) {
    var key = tab.key;
    return React57.createElement(TabNode_default, {
      id,
      prefixCls,
      key,
      tab,
      style: i === 0 ? void 0 : tabNodeStyle,
      closable: tab.closable,
      editable,
      active: key === activeKey,
      renderWrapper: children,
      removeAriaLabel: locale === null || locale === void 0 ? void 0 : locale.removeAriaLabel,
      ref: getBtnRef(key),
      onClick: function onClick(e) {
        onTabClick(key, e);
      },
      onRemove: function onRemove() {
        removeBtnRef(key);
      },
      onFocus: function onFocus() {
        scrollToTab(key);
        doLockAnimation();
        if (!tabsWrapperRef.current) {
          return;
        }
        if (!rtl) {
          tabsWrapperRef.current.scrollLeft = 0;
        }
        tabsWrapperRef.current.scrollTop = 0;
      }
    });
  });
  var onListHolderResize = useRaf(function() {
    var _tabsWrapperRef$curre, _tabsWrapperRef$curre2, _innerAddButtonRef$cu, _innerAddButtonRef$cu2, _tabListRef$current, _tabListRef$current2;
    var offsetWidth = ((_tabsWrapperRef$curre = tabsWrapperRef.current) === null || _tabsWrapperRef$curre === void 0 ? void 0 : _tabsWrapperRef$curre.offsetWidth) || 0;
    var offsetHeight = ((_tabsWrapperRef$curre2 = tabsWrapperRef.current) === null || _tabsWrapperRef$curre2 === void 0 ? void 0 : _tabsWrapperRef$curre2.offsetHeight) || 0;
    var newAddWidth = ((_innerAddButtonRef$cu = innerAddButtonRef.current) === null || _innerAddButtonRef$cu === void 0 ? void 0 : _innerAddButtonRef$cu.offsetWidth) || 0;
    var newAddHeight = ((_innerAddButtonRef$cu2 = innerAddButtonRef.current) === null || _innerAddButtonRef$cu2 === void 0 ? void 0 : _innerAddButtonRef$cu2.offsetHeight) || 0;
    setWrapperWidth(offsetWidth);
    setWrapperHeight(offsetHeight);
    setAddWidth(newAddWidth);
    setAddHeight(newAddHeight);
    var newWrapperScrollWidth = (((_tabListRef$current = tabListRef.current) === null || _tabListRef$current === void 0 ? void 0 : _tabListRef$current.offsetWidth) || 0) - newAddWidth;
    var newWrapperScrollHeight = (((_tabListRef$current2 = tabListRef.current) === null || _tabListRef$current2 === void 0 ? void 0 : _tabListRef$current2.offsetHeight) || 0) - newAddHeight;
    setWrapperScrollWidth(newWrapperScrollWidth);
    setWrapperScrollHeight(newWrapperScrollHeight);
    setTabSizes(function() {
      var newSizes = /* @__PURE__ */ new Map();
      tabs.forEach(function(_ref2) {
        var key = _ref2.key;
        var btnNode = getBtnRef(key).current;
        if (btnNode) {
          newSizes.set(key, {
            width: btnNode.offsetWidth,
            height: btnNode.offsetHeight,
            left: btnNode.offsetLeft,
            top: btnNode.offsetTop
          });
        }
      });
      return newSizes;
    });
  });
  var startHiddenTabs = tabs.slice(0, visibleStart);
  var endHiddenTabs = tabs.slice(visibleEnd + 1);
  var hiddenTabs = [].concat(_toConsumableArray(startHiddenTabs), _toConsumableArray(endHiddenTabs));
  var _useState15 = (0, import_react24.useState)(), _useState16 = _slicedToArray(_useState15, 2), inkStyle = _useState16[0], setInkStyle = _useState16[1];
  var activeTabOffset = tabOffsets.get(activeKey);
  var inkBarRafRef = (0, import_react24.useRef)();
  function cleanInkBarRaf() {
    raf_default.cancel(inkBarRafRef.current);
  }
  (0, import_react24.useEffect)(function() {
    var newInkStyle = {};
    if (activeTabOffset) {
      if (tabPositionTopOrBottom) {
        if (rtl) {
          newInkStyle.right = activeTabOffset.right;
        } else {
          newInkStyle.left = activeTabOffset.left;
        }
        newInkStyle.width = activeTabOffset.width;
      } else {
        newInkStyle.top = activeTabOffset.top;
        newInkStyle.height = activeTabOffset.height;
      }
    }
    cleanInkBarRaf();
    inkBarRafRef.current = raf_default(function() {
      setInkStyle(newInkStyle);
    });
    return cleanInkBarRaf;
  }, [activeTabOffset, tabPositionTopOrBottom, rtl]);
  (0, import_react24.useEffect)(function() {
    scrollToTab();
  }, [activeKey, activeTabOffset, tabOffsets, tabPositionTopOrBottom]);
  (0, import_react24.useEffect)(function() {
    onListHolderResize();
  }, [rtl, tabBarGutter, activeKey, tabs.map(function(tab) {
    return tab.key;
  }).join("_")]);
  var hasDropdown = !!hiddenTabs.length;
  var wrapPrefix = "".concat(prefixCls, "-nav-wrap");
  var pingLeft;
  var pingRight;
  var pingTop;
  var pingBottom;
  if (tabPositionTopOrBottom) {
    if (rtl) {
      pingRight = transformLeft > 0;
      pingLeft = transformLeft + wrapperWidth < wrapperScrollWidth;
    } else {
      pingLeft = transformLeft < 0;
      pingRight = -transformLeft + wrapperWidth < wrapperScrollWidth;
    }
  } else {
    pingTop = transformTop < 0;
    pingBottom = -transformTop + wrapperHeight < wrapperScrollHeight;
  }
  return React57.createElement("div", {
    ref,
    role: "tablist",
    className: (0, import_classnames19.default)("".concat(prefixCls, "-nav"), className),
    style: style2,
    onKeyDown: function onKeyDown() {
      doLockAnimation();
    }
  }, React57.createElement(ExtraContent, {
    position: "left",
    extra,
    prefixCls
  }), React57.createElement(es_default, {
    onResize: onListHolderResize
  }, React57.createElement("div", {
    className: (0, import_classnames19.default)(wrapPrefix, (_classNames = {}, _defineProperty(_classNames, "".concat(wrapPrefix, "-ping-left"), pingLeft), _defineProperty(_classNames, "".concat(wrapPrefix, "-ping-right"), pingRight), _defineProperty(_classNames, "".concat(wrapPrefix, "-ping-top"), pingTop), _defineProperty(_classNames, "".concat(wrapPrefix, "-ping-bottom"), pingBottom), _classNames)),
    ref: tabsWrapperRef
  }, React57.createElement(es_default, {
    onResize: onListHolderResize
  }, React57.createElement("div", {
    ref: tabListRef,
    className: "".concat(prefixCls, "-nav-list"),
    style: {
      transform: "translate(".concat(transformLeft, "px, ").concat(transformTop, "px)"),
      transition: lockAnimation ? "none" : void 0
    }
  }, tabNodes, React57.createElement(AddButton_default, {
    ref: innerAddButtonRef,
    prefixCls,
    locale,
    editable,
    style: _objectSpread2(_objectSpread2({}, tabNodes.length === 0 ? void 0 : tabNodeStyle), {}, {
      visibility: hasDropdown ? "hidden" : null
    })
  }), React57.createElement("div", {
    className: (0, import_classnames19.default)("".concat(prefixCls, "-ink-bar"), _defineProperty({}, "".concat(prefixCls, "-ink-bar-animated"), animated.inkBar)),
    style: inkStyle
  }))))), React57.createElement(OperationNode_default, _extends({}, props, {
    removeAriaLabel: locale === null || locale === void 0 ? void 0 : locale.removeAriaLabel,
    ref: operationsRef,
    prefixCls,
    tabs: hiddenTabs,
    className: !hasDropdown && operationsHiddenClassName,
    tabMoving: !!lockAnimation
  })), React57.createElement(ExtraContent, {
    position: "right",
    extra,
    prefixCls
  }));
}
var TabNavList_default = React57.forwardRef(TabNavList);

// ../../node_modules/rc-tabs/es/TabPanelList/index.js
var React58 = __toESM(require_react());
var import_classnames20 = __toESM(require_classnames());
function TabPanelList(_ref) {
  var id = _ref.id, activeKey = _ref.activeKey, animated = _ref.animated, tabPosition = _ref.tabPosition, rtl = _ref.rtl, destroyInactiveTabPane = _ref.destroyInactiveTabPane;
  var _React$useContext = React58.useContext(TabContext_default), prefixCls = _React$useContext.prefixCls, tabs = _React$useContext.tabs;
  var tabPaneAnimated = animated.tabPane;
  var activeIndex = tabs.findIndex(function(tab) {
    return tab.key === activeKey;
  });
  return React58.createElement("div", {
    className: (0, import_classnames20.default)("".concat(prefixCls, "-content-holder"))
  }, React58.createElement("div", {
    className: (0, import_classnames20.default)("".concat(prefixCls, "-content"), "".concat(prefixCls, "-content-").concat(tabPosition), _defineProperty({}, "".concat(prefixCls, "-content-animated"), tabPaneAnimated)),
    style: activeIndex && tabPaneAnimated ? _defineProperty({}, rtl ? "marginRight" : "marginLeft", "-".concat(activeIndex, "00%")) : null
  }, tabs.map(function(tab) {
    return React58.cloneElement(tab.node, {
      key: tab.key,
      prefixCls,
      tabKey: tab.key,
      id,
      animated: tabPaneAnimated,
      active: tab.key === activeKey,
      destroyInactiveTabPane
    });
  })));
}

// ../../node_modules/rc-tabs/es/TabPanelList/TabPane.js
var React59 = __toESM(require_react());
var import_classnames21 = __toESM(require_classnames());
function TabPane(_ref) {
  var prefixCls = _ref.prefixCls, forceRender = _ref.forceRender, className = _ref.className, style2 = _ref.style, id = _ref.id, active = _ref.active, animated = _ref.animated, destroyInactiveTabPane = _ref.destroyInactiveTabPane, tabKey = _ref.tabKey, children = _ref.children;
  var _React$useState = React59.useState(forceRender), _React$useState2 = _slicedToArray(_React$useState, 2), visited = _React$useState2[0], setVisited = _React$useState2[1];
  React59.useEffect(function() {
    if (active) {
      setVisited(true);
    } else if (destroyInactiveTabPane) {
      setVisited(false);
    }
  }, [active, destroyInactiveTabPane]);
  var mergedStyle = {};
  if (!active) {
    if (animated) {
      mergedStyle.visibility = "hidden";
      mergedStyle.height = 0;
      mergedStyle.overflowY = "hidden";
    } else {
      mergedStyle.display = "none";
    }
  }
  return React59.createElement("div", {
    id: id && "".concat(id, "-panel-").concat(tabKey),
    role: "tabpanel",
    tabIndex: active ? 0 : -1,
    "aria-labelledby": id && "".concat(id, "-tab-").concat(tabKey),
    "aria-hidden": !active,
    style: _objectSpread2(_objectSpread2({}, mergedStyle), style2),
    className: (0, import_classnames21.default)("".concat(prefixCls, "-tabpane"), active && "".concat(prefixCls, "-tabpane-active"), className)
  }, (active || visited || forceRender) && children);
}

// ../../node_modules/rc-tabs/es/Tabs.js
var _excluded16 = ["id", "prefixCls", "className", "children", "direction", "activeKey", "defaultActiveKey", "editable", "animated", "tabPosition", "tabBarGutter", "tabBarStyle", "tabBarExtraContent", "locale", "moreIcon", "moreTransitionName", "destroyInactiveTabPane", "renderTabBar", "onChange", "onTabClick", "onTabScroll", "getPopupContainer", "popupClassName"];
var uuid = 0;
function parseTabList(children) {
  return toArray(children).map(function(node) {
    if (React60.isValidElement(node)) {
      var key = node.key !== void 0 ? String(node.key) : void 0;
      return _objectSpread2(_objectSpread2({
        key
      }, node.props), {}, {
        node
      });
    }
    return null;
  }).filter(function(tab) {
    return tab;
  });
}
function Tabs(_ref, ref) {
  var _classNames;
  var id = _ref.id, _ref$prefixCls = _ref.prefixCls, prefixCls = _ref$prefixCls === void 0 ? "rc-tabs" : _ref$prefixCls, className = _ref.className, children = _ref.children, direction = _ref.direction, activeKey = _ref.activeKey, defaultActiveKey = _ref.defaultActiveKey, editable = _ref.editable, _ref$animated = _ref.animated, animated = _ref$animated === void 0 ? {
    inkBar: true,
    tabPane: false
  } : _ref$animated, _ref$tabPosition = _ref.tabPosition, tabPosition = _ref$tabPosition === void 0 ? "top" : _ref$tabPosition, tabBarGutter = _ref.tabBarGutter, tabBarStyle = _ref.tabBarStyle, tabBarExtraContent = _ref.tabBarExtraContent, locale = _ref.locale, moreIcon = _ref.moreIcon, moreTransitionName = _ref.moreTransitionName, destroyInactiveTabPane = _ref.destroyInactiveTabPane, renderTabBar = _ref.renderTabBar, onChange = _ref.onChange, onTabClick = _ref.onTabClick, onTabScroll = _ref.onTabScroll, getPopupContainer = _ref.getPopupContainer, popupClassName = _ref.popupClassName, restProps = _objectWithoutProperties(_ref, _excluded16);
  var tabs = parseTabList(children);
  var rtl = direction === "rtl";
  var mergedAnimated;
  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true
    };
  } else {
    mergedAnimated = _objectSpread2({
      inkBar: true,
      tabPane: false
    }, _typeof(animated) === "object" ? animated : {});
  }
  var _useState = (0, import_react25.useState)(false), _useState2 = _slicedToArray(_useState, 2), mobile = _useState2[0], setMobile = _useState2[1];
  (0, import_react25.useEffect)(function() {
    setMobile(isMobile_default());
  }, []);
  var _useMergedState = useMergedState(function() {
    var _tabs$;
    return (_tabs$ = tabs[0]) === null || _tabs$ === void 0 ? void 0 : _tabs$.key;
  }, {
    value: activeKey,
    defaultValue: defaultActiveKey
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedActiveKey = _useMergedState2[0], setMergedActiveKey = _useMergedState2[1];
  var _useState3 = (0, import_react25.useState)(function() {
    return tabs.findIndex(function(tab) {
      return tab.key === mergedActiveKey;
    });
  }), _useState4 = _slicedToArray(_useState3, 2), activeIndex = _useState4[0], setActiveIndex = _useState4[1];
  (0, import_react25.useEffect)(function() {
    var newActiveIndex = tabs.findIndex(function(tab) {
      return tab.key === mergedActiveKey;
    });
    if (newActiveIndex === -1) {
      var _tabs$newActiveIndex;
      newActiveIndex = Math.max(0, Math.min(activeIndex, tabs.length - 1));
      setMergedActiveKey((_tabs$newActiveIndex = tabs[newActiveIndex]) === null || _tabs$newActiveIndex === void 0 ? void 0 : _tabs$newActiveIndex.key);
    }
    setActiveIndex(newActiveIndex);
  }, [tabs.map(function(tab) {
    return tab.key;
  }).join("_"), mergedActiveKey, activeIndex]);
  var _useMergedState3 = useMergedState(null, {
    value: id
  }), _useMergedState4 = _slicedToArray(_useMergedState3, 2), mergedId = _useMergedState4[0], setMergedId = _useMergedState4[1];
  var mergedTabPosition = tabPosition;
  if (mobile && !["left", "right"].includes(tabPosition)) {
    mergedTabPosition = "top";
  }
  (0, import_react25.useEffect)(function() {
    if (!id) {
      setMergedId("rc-tabs-".concat(false ? "test" : uuid));
      uuid += 1;
    }
  }, []);
  function onInternalTabClick(key, e) {
    onTabClick === null || onTabClick === void 0 ? void 0 : onTabClick(key, e);
    var isActiveChanged = key !== mergedActiveKey;
    setMergedActiveKey(key);
    if (isActiveChanged) {
      onChange === null || onChange === void 0 ? void 0 : onChange(key);
    }
  }
  var sharedProps = {
    id: mergedId,
    activeKey: mergedActiveKey,
    animated: mergedAnimated,
    tabPosition: mergedTabPosition,
    rtl,
    mobile
  };
  var tabNavBar;
  var tabNavBarProps = _objectSpread2(_objectSpread2({}, sharedProps), {}, {
    editable,
    locale,
    moreIcon,
    moreTransitionName,
    tabBarGutter,
    onTabClick: onInternalTabClick,
    onTabScroll,
    extra: tabBarExtraContent,
    style: tabBarStyle,
    panes: children,
    getPopupContainer,
    popupClassName
  });
  if (renderTabBar) {
    tabNavBar = renderTabBar(tabNavBarProps, TabNavList_default);
  } else {
    tabNavBar = React60.createElement(TabNavList_default, tabNavBarProps);
  }
  return React60.createElement(TabContext_default.Provider, {
    value: {
      tabs,
      prefixCls
    }
  }, React60.createElement("div", _extends({
    ref,
    id,
    className: (0, import_classnames22.default)(prefixCls, "".concat(prefixCls, "-").concat(mergedTabPosition), (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-mobile"), mobile), _defineProperty(_classNames, "".concat(prefixCls, "-editable"), editable), _defineProperty(_classNames, "".concat(prefixCls, "-rtl"), rtl), _classNames), className)
  }, restProps), tabNavBar, React60.createElement(TabPanelList, _extends({
    destroyInactiveTabPane
  }, sharedProps, {
    animated: mergedAnimated
  }))));
}
var ForwardTabs = React60.forwardRef(Tabs);
ForwardTabs.TabPane = TabPane;
var Tabs_default = ForwardTabs;

// ../../node_modules/rc-tabs/es/index.js
var es_default8 = Tabs_default;

// ../../node_modules/rc-menu/es/Menu.js
init_extends();
var import_classnames27 = __toESM(require_classnames());
var React78 = __toESM(require_react());
var import_react27 = __toESM(require_react());
var import_react_dom6 = __toESM(require_react_dom());

// ../../node_modules/rc-menu/es/context/IdContext.js
var React61 = __toESM(require_react());
var IdContext2 = React61.createContext(null);
function getMenuId2(uuid2, eventKey) {
  if (uuid2 === void 0) {
    return null;
  }
  return "".concat(uuid2, "-").concat(eventKey);
}
function useMenuId2(eventKey) {
  var id = React61.useContext(IdContext2);
  return getMenuId2(id, eventKey);
}

// ../../node_modules/rc-menu/es/context/MenuContext.js
var React62 = __toESM(require_react());
var _excluded17 = ["children", "locked"];
var MenuContext2 = React62.createContext(null);
function mergeProps2(origin, target) {
  var clone3 = _objectSpread2({}, origin);
  Object.keys(target).forEach(function(key) {
    var value = target[key];
    if (value !== void 0) {
      clone3[key] = value;
    }
  });
  return clone3;
}
function InheritableContextProvider2(_ref) {
  var children = _ref.children, locked = _ref.locked, restProps = _objectWithoutProperties(_ref, _excluded17);
  var context = React62.useContext(MenuContext2);
  var inheritableContext = useMemo(function() {
    return mergeProps2(context, restProps);
  }, [context, restProps], function(prev, next) {
    return !locked && (prev[0] !== next[0] || !isEqual_default(prev[1], next[1], true));
  });
  return React62.createElement(MenuContext2.Provider, {
    value: inheritableContext
  }, children);
}

// ../../node_modules/rc-menu/es/context/PathContext.js
var React63 = __toESM(require_react());
var EmptyList2 = [];
var PathRegisterContext2 = React63.createContext(null);
function useMeasure2() {
  return React63.useContext(PathRegisterContext2);
}
var PathTrackerContext2 = React63.createContext(EmptyList2);
function useFullPath2(eventKey) {
  var parentKeyPath = React63.useContext(PathTrackerContext2);
  return React63.useMemo(function() {
    return eventKey !== void 0 ? [].concat(_toConsumableArray(parentKeyPath), [eventKey]) : parentKeyPath;
  }, [parentKeyPath, eventKey]);
}
var PathUserContext2 = React63.createContext(null);

// ../../node_modules/rc-menu/es/context/PrivateContext.js
var React64 = __toESM(require_react());
var PrivateContext2 = React64.createContext({});
var PrivateContext_default2 = PrivateContext2;

// ../../node_modules/rc-menu/es/hooks/useAccessibility.js
var React65 = __toESM(require_react());
var LEFT3 = KeyCode_default.LEFT;
var RIGHT2 = KeyCode_default.RIGHT;
var UP2 = KeyCode_default.UP;
var DOWN2 = KeyCode_default.DOWN;
var ENTER2 = KeyCode_default.ENTER;
var ESC3 = KeyCode_default.ESC;
var HOME2 = KeyCode_default.HOME;
var END2 = KeyCode_default.END;
var ArrowKeys2 = [UP2, DOWN2, LEFT3, RIGHT2];
function getOffset3(mode, isRootLevel, isRtl, which) {
  var _inline, _horizontal, _vertical, _offsets;
  var prev = "prev";
  var next = "next";
  var children = "children";
  var parent = "parent";
  if (mode === "inline" && which === ENTER2) {
    return {
      inlineTrigger: true
    };
  }
  var inline = (_inline = {}, _defineProperty(_inline, UP2, prev), _defineProperty(_inline, DOWN2, next), _inline);
  var horizontal = (_horizontal = {}, _defineProperty(_horizontal, LEFT3, isRtl ? next : prev), _defineProperty(_horizontal, RIGHT2, isRtl ? prev : next), _defineProperty(_horizontal, DOWN2, children), _defineProperty(_horizontal, ENTER2, children), _horizontal);
  var vertical = (_vertical = {}, _defineProperty(_vertical, UP2, prev), _defineProperty(_vertical, DOWN2, next), _defineProperty(_vertical, ENTER2, children), _defineProperty(_vertical, ESC3, parent), _defineProperty(_vertical, LEFT3, isRtl ? children : parent), _defineProperty(_vertical, RIGHT2, isRtl ? parent : children), _vertical);
  var offsets = {
    inline,
    horizontal,
    vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical
  };
  var type = (_offsets = offsets["".concat(mode).concat(isRootLevel ? "" : "Sub")]) === null || _offsets === void 0 ? void 0 : _offsets[which];
  switch (type) {
    case prev:
      return {
        offset: -1,
        sibling: true
      };
    case next:
      return {
        offset: 1,
        sibling: true
      };
    case parent:
      return {
        offset: -1,
        sibling: false
      };
    case children:
      return {
        offset: 1,
        sibling: false
      };
    default:
      return null;
  }
}
function findContainerUL2(element) {
  var current = element;
  while (current) {
    if (current.getAttribute("data-menu-list")) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusElement2(activeElement, elements) {
  var current = activeElement || document.activeElement;
  while (current) {
    if (elements.has(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
function getFocusableElements2(container, elements) {
  var list = getFocusNodeList(container, true);
  return list.filter(function(ele) {
    return elements.has(ele);
  });
}
function getNextFocusElement2(parentQueryContainer, elements, focusMenuElement) {
  var offset2 = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
  if (!parentQueryContainer) {
    return null;
  }
  var sameLevelFocusableMenuElementList = getFocusableElements2(parentQueryContainer, elements);
  var count = sameLevelFocusableMenuElementList.length;
  var focusIndex = sameLevelFocusableMenuElementList.findIndex(function(ele) {
    return focusMenuElement === ele;
  });
  if (offset2 < 0) {
    if (focusIndex === -1) {
      focusIndex = count - 1;
    } else {
      focusIndex -= 1;
    }
  } else if (offset2 > 0) {
    focusIndex += 1;
  }
  focusIndex = (focusIndex + count) % count;
  return sameLevelFocusableMenuElementList[focusIndex];
}
function useAccessibility3(mode, activeKey, isRtl, id, containerRef, getKeys, getKeyPath, triggerActiveKey, triggerAccessibilityOpen, originOnKeyDown) {
  var rafRef = React65.useRef();
  var activeRef = React65.useRef();
  activeRef.current = activeKey;
  var cleanRaf = function cleanRaf2() {
    raf_default.cancel(rafRef.current);
  };
  React65.useEffect(function() {
    return function() {
      cleanRaf();
    };
  }, []);
  return function(e) {
    var which = e.which;
    if ([].concat(ArrowKeys2, [ENTER2, ESC3, HOME2, END2]).includes(which)) {
      var elements;
      var key2element;
      var element2key;
      var refreshElements = function refreshElements2() {
        elements = /* @__PURE__ */ new Set();
        key2element = /* @__PURE__ */ new Map();
        element2key = /* @__PURE__ */ new Map();
        var keys = getKeys();
        keys.forEach(function(key) {
          var element = document.querySelector("[data-menu-id='".concat(getMenuId2(id, key), "']"));
          if (element) {
            elements.add(element);
            element2key.set(element, key);
            key2element.set(key, element);
          }
        });
        return elements;
      };
      refreshElements();
      var activeElement = key2element.get(activeKey);
      var focusMenuElement = getFocusElement2(activeElement, elements);
      var focusMenuKey = element2key.get(focusMenuElement);
      var offsetObj = getOffset3(mode, getKeyPath(focusMenuKey, true).length === 1, isRtl, which);
      if (!offsetObj && which !== HOME2 && which !== END2) {
        return;
      }
      if (ArrowKeys2.includes(which) || [HOME2, END2].includes(which)) {
        e.preventDefault();
      }
      var tryFocus = function tryFocus2(menuElement) {
        if (menuElement) {
          var focusTargetElement = menuElement;
          var link = menuElement.querySelector("a");
          if (link !== null && link !== void 0 && link.getAttribute("href")) {
            focusTargetElement = link;
          }
          var targetKey = element2key.get(menuElement);
          triggerActiveKey(targetKey);
          cleanRaf();
          rafRef.current = raf_default(function() {
            if (activeRef.current === targetKey) {
              focusTargetElement.focus();
            }
          });
        }
      };
      if ([HOME2, END2].includes(which) || offsetObj.sibling || !focusMenuElement) {
        var parentQueryContainer;
        if (!focusMenuElement || mode === "inline") {
          parentQueryContainer = containerRef.current;
        } else {
          parentQueryContainer = findContainerUL2(focusMenuElement);
        }
        var targetElement;
        var focusableElements = getFocusableElements2(parentQueryContainer, elements);
        if (which === HOME2) {
          targetElement = focusableElements[0];
        } else if (which === END2) {
          targetElement = focusableElements[focusableElements.length - 1];
        } else {
          targetElement = getNextFocusElement2(parentQueryContainer, elements, focusMenuElement, offsetObj.offset);
        }
        tryFocus(targetElement);
      } else if (offsetObj.inlineTrigger) {
        triggerAccessibilityOpen(focusMenuKey);
      } else if (offsetObj.offset > 0) {
        triggerAccessibilityOpen(focusMenuKey, true);
        cleanRaf();
        rafRef.current = raf_default(function() {
          refreshElements();
          var controlId = focusMenuElement.getAttribute("aria-controls");
          var subQueryContainer = document.getElementById(controlId);
          var targetElement2 = getNextFocusElement2(subQueryContainer, elements);
          tryFocus(targetElement2);
        }, 5);
      } else if (offsetObj.offset < 0) {
        var keyPath = getKeyPath(focusMenuKey, true);
        var parentKey = keyPath[keyPath.length - 2];
        var parentMenuElement = key2element.get(parentKey);
        triggerAccessibilityOpen(parentKey, false);
        tryFocus(parentMenuElement);
      }
    }
    originOnKeyDown === null || originOnKeyDown === void 0 ? void 0 : originOnKeyDown(e);
  };
}

// ../../node_modules/rc-menu/es/hooks/useKeyRecords.js
var React66 = __toESM(require_react());
var import_react26 = __toESM(require_react());

// ../../node_modules/rc-menu/es/utils/timeUtil.js
function nextSlice2(callback) {
  Promise.resolve().then(callback);
}

// ../../node_modules/rc-menu/es/hooks/useKeyRecords.js
var PATH_SPLIT2 = "__RC_UTIL_PATH_SPLIT__";
var getPathStr3 = function getPathStr4(keyPath) {
  return keyPath.join(PATH_SPLIT2);
};
var getPathKeys3 = function getPathKeys4(keyPathStr) {
  return keyPathStr.split(PATH_SPLIT2);
};
var OVERFLOW_KEY2 = "rc-menu-more";
function useKeyRecords2() {
  var _React$useState = React66.useState({}), _React$useState2 = _slicedToArray(_React$useState, 2), internalForceUpdate = _React$useState2[1];
  var key2pathRef = (0, import_react26.useRef)(/* @__PURE__ */ new Map());
  var path2keyRef = (0, import_react26.useRef)(/* @__PURE__ */ new Map());
  var _React$useState3 = React66.useState([]), _React$useState4 = _slicedToArray(_React$useState3, 2), overflowKeys = _React$useState4[0], setOverflowKeys = _React$useState4[1];
  var updateRef = (0, import_react26.useRef)(0);
  var destroyRef = (0, import_react26.useRef)(false);
  var forceUpdate = function forceUpdate2() {
    if (!destroyRef.current) {
      internalForceUpdate({});
    }
  };
  var registerPath = (0, import_react26.useCallback)(function(key, keyPath) {
    if (true) {
      warning_default(!key2pathRef.current.has(key), "Duplicated key '".concat(key, "' used in Menu by path [").concat(keyPath.join(" > "), "]"));
    }
    var connectedPath = getPathStr3(keyPath);
    path2keyRef.current.set(connectedPath, key);
    key2pathRef.current.set(key, connectedPath);
    updateRef.current += 1;
    var id = updateRef.current;
    nextSlice2(function() {
      if (id === updateRef.current) {
        forceUpdate();
      }
    });
  }, []);
  var unregisterPath = (0, import_react26.useCallback)(function(key, keyPath) {
    var connectedPath = getPathStr3(keyPath);
    path2keyRef.current.delete(connectedPath);
    key2pathRef.current.delete(key);
  }, []);
  var refreshOverflowKeys = (0, import_react26.useCallback)(function(keys) {
    setOverflowKeys(keys);
  }, []);
  var getKeyPath = (0, import_react26.useCallback)(function(eventKey, includeOverflow) {
    var fullPath = key2pathRef.current.get(eventKey) || "";
    var keys = getPathKeys3(fullPath);
    if (includeOverflow && overflowKeys.includes(keys[0])) {
      keys.unshift(OVERFLOW_KEY2);
    }
    return keys;
  }, [overflowKeys]);
  var isSubPathKey = (0, import_react26.useCallback)(function(pathKeys, eventKey) {
    return pathKeys.some(function(pathKey) {
      var pathKeyList = getKeyPath(pathKey, true);
      return pathKeyList.includes(eventKey);
    });
  }, [getKeyPath]);
  var getKeys = function getKeys2() {
    var keys = _toConsumableArray(key2pathRef.current.keys());
    if (overflowKeys.length) {
      keys.push(OVERFLOW_KEY2);
    }
    return keys;
  };
  var getSubPathKeys = (0, import_react26.useCallback)(function(key) {
    var connectedPath = "".concat(key2pathRef.current.get(key)).concat(PATH_SPLIT2);
    var pathKeys = /* @__PURE__ */ new Set();
    _toConsumableArray(path2keyRef.current.keys()).forEach(function(pathKey) {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.current.get(pathKey));
      }
    });
    return pathKeys;
  }, []);
  React66.useEffect(function() {
    return function() {
      destroyRef.current = true;
    };
  }, []);
  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,
    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys
  };
}

// ../../node_modules/rc-menu/es/hooks/useMemoCallback.js
var React67 = __toESM(require_react());
function useMemoCallback2(func) {
  var funRef = React67.useRef(func);
  funRef.current = func;
  var callback = React67.useCallback(function() {
    var _funRef$current;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return (_funRef$current = funRef.current) === null || _funRef$current === void 0 ? void 0 : _funRef$current.call.apply(_funRef$current, [funRef].concat(args));
  }, []);
  return func ? callback : void 0;
}

// ../../node_modules/rc-menu/es/hooks/useUUID.js
var React68 = __toESM(require_react());
var uniquePrefix2 = Math.random().toFixed(5).toString().slice(2);
var internalId2 = 0;
function useUUID2(id) {
  var _useMergedState = useMergedState(id, {
    value: id
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), uuid2 = _useMergedState2[0], setUUID = _useMergedState2[1];
  React68.useEffect(function() {
    internalId2 += 1;
    var newId = false ? "test" : "".concat(uniquePrefix2, "-").concat(internalId2);
    setUUID("rc-menu-uuid-".concat(newId));
  }, []);
  return uuid2;
}

// ../../node_modules/rc-menu/es/MenuItem.js
init_extends();
var React72 = __toESM(require_react());
var import_classnames23 = __toESM(require_classnames());

// ../../node_modules/rc-menu/es/hooks/useActive.js
var React69 = __toESM(require_react());
function useActive2(eventKey, disabled, onMouseEnter, onMouseLeave) {
  var _React$useContext = React69.useContext(MenuContext2), activeKey = _React$useContext.activeKey, onActive = _React$useContext.onActive, onInactive = _React$useContext.onInactive;
  var ret = {
    active: activeKey === eventKey
  };
  if (!disabled) {
    ret.onMouseEnter = function(domEvent) {
      onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
        key: eventKey,
        domEvent
      });
      onActive(eventKey);
    };
    ret.onMouseLeave = function(domEvent) {
      onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
        key: eventKey,
        domEvent
      });
      onInactive(eventKey);
    };
  }
  return ret;
}

// ../../node_modules/rc-menu/es/utils/warnUtil.js
var _excluded18 = ["item"];
function warnItemProp2(_ref) {
  var item = _ref.item, restInfo = _objectWithoutProperties(_ref, _excluded18);
  Object.defineProperty(restInfo, "item", {
    get: function get() {
      warning_default(false, "`info.item` is deprecated since we will move to function component that not provides React Node instance in future.");
      return item;
    }
  });
  return restInfo;
}

// ../../node_modules/rc-menu/es/Icon.js
var React70 = __toESM(require_react());
function Icon2(_ref) {
  var icon = _ref.icon, props = _ref.props, children = _ref.children;
  var iconNode;
  if (typeof icon === "function") {
    iconNode = React70.createElement(icon, _objectSpread2({}, props));
  } else {
    iconNode = icon;
  }
  return iconNode || children || null;
}

// ../../node_modules/rc-menu/es/hooks/useDirectionStyle.js
var React71 = __toESM(require_react());
function useDirectionStyle2(level) {
  var _React$useContext = React71.useContext(MenuContext2), mode = _React$useContext.mode, rtl = _React$useContext.rtl, inlineIndent = _React$useContext.inlineIndent;
  if (mode !== "inline") {
    return null;
  }
  var len = level;
  return rtl ? {
    paddingRight: len * inlineIndent
  } : {
    paddingLeft: len * inlineIndent
  };
}

// ../../node_modules/rc-menu/es/MenuItem.js
var _excluded19 = ["title", "attribute", "elementRef"];
var _excluded27 = ["style", "className", "eventKey", "warnKey", "disabled", "itemIcon", "children", "role", "onMouseEnter", "onMouseLeave", "onClick", "onKeyDown", "onFocus"];
var _excluded33 = ["active"];
var LegacyMenuItem2 = function(_React$Component) {
  _inherits(LegacyMenuItem3, _React$Component);
  var _super = _createSuper(LegacyMenuItem3);
  function LegacyMenuItem3() {
    _classCallCheck(this, LegacyMenuItem3);
    return _super.apply(this, arguments);
  }
  _createClass(LegacyMenuItem3, [{
    key: "render",
    value: function render() {
      var _this$props = this.props, title = _this$props.title, attribute = _this$props.attribute, elementRef = _this$props.elementRef, restProps = _objectWithoutProperties(_this$props, _excluded19);
      var passedProps = omit(restProps, ["eventKey"]);
      warning_default(!attribute, "`attribute` of Menu.Item is deprecated. Please pass attribute directly.");
      return React72.createElement(es_default2.Item, _extends({}, attribute, {
        title: typeof title === "string" ? title : void 0
      }, passedProps, {
        ref: elementRef
      }));
    }
  }]);
  return LegacyMenuItem3;
}(React72.Component);
var InternalMenuItem3 = function InternalMenuItem4(props) {
  var _classNames;
  var style2 = props.style, className = props.className, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, itemIcon = props.itemIcon, children = props.children, role = props.role, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onClick = props.onClick, onKeyDown = props.onKeyDown, onFocus = props.onFocus, restProps = _objectWithoutProperties(props, _excluded27);
  var domDataId = useMenuId2(eventKey);
  var _React$useContext = React72.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls, onItemClick = _React$useContext.onItemClick, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, contextItemIcon = _React$useContext.itemIcon, selectedKeys = _React$useContext.selectedKeys, onActive = _React$useContext.onActive;
  var _React$useContext2 = React72.useContext(PrivateContext_default2), _internalRenderMenuItem = _React$useContext2._internalRenderMenuItem;
  var itemCls = "".concat(prefixCls, "-item");
  var legacyMenuItemRef = React72.useRef();
  var elementRef = React72.useRef();
  var mergedDisabled = contextDisabled || disabled;
  var connectedKeys = useFullPath2(eventKey);
  if (warnKey) {
    warning_default(false, "MenuItem should not leave undefined `key`.");
  }
  var getEventInfo = function getEventInfo2(e) {
    return {
      key: eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: _toConsumableArray(connectedKeys).reverse(),
      item: legacyMenuItemRef.current,
      domEvent: e
    };
  };
  var mergedItemIcon = itemIcon || contextItemIcon;
  var _useActive = useActive2(eventKey, mergedDisabled, onMouseEnter, onMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded33);
  var selected = selectedKeys.includes(eventKey);
  var directionStyle = useDirectionStyle2(connectedKeys.length);
  var onInternalClick = function onInternalClick2(e) {
    if (mergedDisabled) {
      return;
    }
    var info = getEventInfo(e);
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp2(info));
    onItemClick(info);
  };
  var onInternalKeyDown = function onInternalKeyDown2(e) {
    onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
    if (e.which === KeyCode_default.ENTER) {
      var info = getEventInfo(e);
      onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp2(info));
      onItemClick(info);
    }
  };
  var onInternalFocus = function onInternalFocus2(e) {
    onActive(eventKey);
    onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
  };
  var optionRoleProps = {};
  if (props.role === "option") {
    optionRoleProps["aria-selected"] = selected;
  }
  var renderNode = React72.createElement(LegacyMenuItem2, _extends({
    ref: legacyMenuItemRef,
    elementRef,
    role: role === null ? "none" : role || "menuitem",
    tabIndex: disabled ? null : -1,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId
  }, restProps, activeProps, optionRoleProps, {
    component: "li",
    "aria-disabled": disabled,
    style: _objectSpread2(_objectSpread2({}, directionStyle), style2),
    className: (0, import_classnames23.default)(itemCls, (_classNames = {}, _defineProperty(_classNames, "".concat(itemCls, "-active"), active), _defineProperty(_classNames, "".concat(itemCls, "-selected"), selected), _defineProperty(_classNames, "".concat(itemCls, "-disabled"), mergedDisabled), _classNames), className),
    onClick: onInternalClick,
    onKeyDown: onInternalKeyDown,
    onFocus: onInternalFocus
  }), children, React72.createElement(Icon2, {
    props: _objectSpread2(_objectSpread2({}, props), {}, {
      isSelected: selected
    }),
    icon: mergedItemIcon
  }));
  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, {
      selected
    });
  }
  return renderNode;
};
function MenuItem2(props) {
  var eventKey = props.eventKey;
  var measure = useMeasure2();
  var connectedKeyPath = useFullPath2(eventKey);
  React72.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  if (measure) {
    return null;
  }
  return React72.createElement(InternalMenuItem3, props);
}
var MenuItem_default2 = MenuItem2;

// ../../node_modules/rc-menu/es/SubMenu/index.js
init_extends();
var React77 = __toESM(require_react());
var import_classnames26 = __toESM(require_classnames());

// ../../node_modules/rc-menu/es/SubMenu/SubMenuList.js
init_extends();
var React73 = __toESM(require_react());
var import_classnames24 = __toESM(require_classnames());
var _excluded20 = ["className", "children"];
var InternalSubMenuList3 = function InternalSubMenuList4(_ref, ref) {
  var className = _ref.className, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded20);
  var _React$useContext = React73.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, rtl = _React$useContext.rtl;
  return React73.createElement("ul", _extends({
    className: (0, import_classnames24.default)(prefixCls, rtl && "".concat(prefixCls, "-rtl"), "".concat(prefixCls, "-sub"), "".concat(prefixCls, "-").concat(mode === "inline" ? "inline" : "vertical"), className),
    role: "menu"
  }, restProps, {
    "data-menu-list": true,
    ref
  }), children);
};
var SubMenuList2 = React73.forwardRef(InternalSubMenuList3);
SubMenuList2.displayName = "SubMenuList";
var SubMenuList_default2 = SubMenuList2;

// ../../node_modules/rc-menu/es/utils/nodeUtil.js
init_extends();
var React74 = __toESM(require_react());
var _excluded21 = ["label", "children", "key", "type"];
function parseChildren2(children, keyPath) {
  return toArray(children).map(function(child, index) {
    if (React74.isValidElement(child)) {
      var _eventKey, _child$props;
      var key = child.key;
      var eventKey = (_eventKey = (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.eventKey) !== null && _eventKey !== void 0 ? _eventKey : key;
      var emptyKey = eventKey === null || eventKey === void 0;
      if (emptyKey) {
        eventKey = "tmp_key-".concat([].concat(_toConsumableArray(keyPath), [index]).join("-"));
      }
      var cloneProps = {
        key: eventKey,
        eventKey
      };
      if (emptyKey) {
        cloneProps.warnKey = true;
      }
      return React74.cloneElement(child, cloneProps);
    }
    return child;
  });
}
function convertItemsToNodes2(list) {
  return (list || []).map(function(opt, index) {
    if (opt && _typeof(opt) === "object") {
      var _ref = opt, label = _ref.label, children = _ref.children, key = _ref.key, type = _ref.type, restProps = _objectWithoutProperties(_ref, _excluded21);
      var mergedKey = key !== null && key !== void 0 ? key : "tmp-".concat(index);
      if (children || type === "group") {
        if (type === "group") {
          return React74.createElement(MenuItemGroup2, _extends({
            key: mergedKey
          }, restProps, {
            title: label
          }), convertItemsToNodes2(children));
        }
        return React74.createElement(SubMenu2, _extends({
          key: mergedKey
        }, restProps, {
          title: label
        }), convertItemsToNodes2(children));
      }
      if (type === "divider") {
        return React74.createElement(Divider2, _extends({
          key: mergedKey
        }, restProps));
      }
      return React74.createElement(MenuItem_default2, _extends({
        key: mergedKey
      }, restProps), label);
    }
    return null;
  }).filter(function(opt) {
    return opt;
  });
}
function parseItems2(children, items, keyPath) {
  var childNodes = children;
  if (items) {
    childNodes = convertItemsToNodes2(items);
  }
  return parseChildren2(childNodes, keyPath);
}

// ../../node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var React75 = __toESM(require_react());
var import_classnames25 = __toESM(require_classnames());

// ../../node_modules/rc-menu/es/placements.js
var autoAdjustOverflow3 = {
  adjustX: 1,
  adjustY: 1
};
var placements3 = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow3,
    offset: [0, -7]
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow3,
    offset: [0, 7]
  },
  leftTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow3,
    offset: [-4, 0]
  },
  rightTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow3,
    offset: [4, 0]
  }
};
var placementsRtl2 = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow3,
    offset: [0, -7]
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow3,
    offset: [0, 7]
  },
  rightTop: {
    points: ["tr", "tl"],
    overflow: autoAdjustOverflow3,
    offset: [-4, 0]
  },
  leftTop: {
    points: ["tl", "tr"],
    overflow: autoAdjustOverflow3,
    offset: [4, 0]
  }
};

// ../../node_modules/rc-menu/es/utils/motionUtil.js
function getMotion3(mode, motion, defaultMotions) {
  if (motion) {
    return motion;
  }
  if (defaultMotions) {
    return defaultMotions[mode] || defaultMotions.other;
  }
  return void 0;
}

// ../../node_modules/rc-menu/es/SubMenu/PopupTrigger.js
var popupPlacementMap2 = {
  horizontal: "bottomLeft",
  vertical: "rightTop",
  "vertical-left": "rightTop",
  "vertical-right": "leftTop"
};
function PopupTrigger2(_ref) {
  var prefixCls = _ref.prefixCls, visible = _ref.visible, children = _ref.children, popup = _ref.popup, popupClassName = _ref.popupClassName, popupOffset = _ref.popupOffset, disabled = _ref.disabled, mode = _ref.mode, onVisibleChange = _ref.onVisibleChange;
  var _React$useContext = React75.useContext(MenuContext2), getPopupContainer = _React$useContext.getPopupContainer, rtl = _React$useContext.rtl, subMenuOpenDelay = _React$useContext.subMenuOpenDelay, subMenuCloseDelay = _React$useContext.subMenuCloseDelay, builtinPlacements = _React$useContext.builtinPlacements, triggerSubMenuAction = _React$useContext.triggerSubMenuAction, forceSubMenuRender = _React$useContext.forceSubMenuRender, rootClassName = _React$useContext.rootClassName, motion = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions;
  var _React$useState = React75.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), innerVisible = _React$useState2[0], setInnerVisible = _React$useState2[1];
  var placement = rtl ? _objectSpread2(_objectSpread2({}, placementsRtl2), builtinPlacements) : _objectSpread2(_objectSpread2({}, placements3), builtinPlacements);
  var popupPlacement = popupPlacementMap2[mode];
  var targetMotion = getMotion3(mode, motion, defaultMotions);
  var targetMotionRef = React75.useRef(targetMotion);
  if (mode !== "inline") {
    targetMotionRef.current = targetMotion;
  }
  var mergedMotion = _objectSpread2(_objectSpread2({}, targetMotionRef.current), {}, {
    leavedClassName: "".concat(prefixCls, "-hidden"),
    removeOnLeave: false,
    motionAppear: true
  });
  var visibleRef = React75.useRef();
  React75.useEffect(function() {
    visibleRef.current = raf_default(function() {
      setInnerVisible(visible);
    });
    return function() {
      raf_default.cancel(visibleRef.current);
    };
  }, [visible]);
  return React75.createElement(es_default5, {
    prefixCls,
    popupClassName: (0, import_classnames25.default)("".concat(prefixCls, "-popup"), _defineProperty({}, "".concat(prefixCls, "-rtl"), rtl), popupClassName, rootClassName),
    stretch: mode === "horizontal" ? "minWidth" : null,
    getPopupContainer,
    builtinPlacements: placement,
    popupPlacement,
    popupVisible: innerVisible,
    popup,
    popupAlign: popupOffset && {
      offset: popupOffset
    },
    action: disabled ? [] : [triggerSubMenuAction],
    mouseEnterDelay: subMenuOpenDelay,
    mouseLeaveDelay: subMenuCloseDelay,
    onPopupVisibleChange: onVisibleChange,
    forceRender: forceSubMenuRender,
    popupMotion: mergedMotion
  }, children);
}

// ../../node_modules/rc-menu/es/SubMenu/InlineSubMenuList.js
init_extends();
var React76 = __toESM(require_react());
function InlineSubMenuList2(_ref) {
  var id = _ref.id, open = _ref.open, keyPath = _ref.keyPath, children = _ref.children;
  var fixedMode = "inline";
  var _React$useContext = React76.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls, forceSubMenuRender = _React$useContext.forceSubMenuRender, motion = _React$useContext.motion, defaultMotions = _React$useContext.defaultMotions, mode = _React$useContext.mode;
  var sameModeRef = React76.useRef(false);
  sameModeRef.current = mode === fixedMode;
  var _React$useState = React76.useState(!sameModeRef.current), _React$useState2 = _slicedToArray(_React$useState, 2), destroy = _React$useState2[0], setDestroy = _React$useState2[1];
  var mergedOpen = sameModeRef.current ? open : false;
  React76.useEffect(function() {
    if (sameModeRef.current) {
      setDestroy(false);
    }
  }, [mode]);
  var mergedMotion = _objectSpread2({}, getMotion3(fixedMode, motion, defaultMotions));
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }
  var originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = function(newVisible) {
    if (!sameModeRef.current && !newVisible) {
      setDestroy(true);
    }
    return originOnVisibleChanged === null || originOnVisibleChanged === void 0 ? void 0 : originOnVisibleChanged(newVisible);
  };
  if (destroy) {
    return null;
  }
  return React76.createElement(InheritableContextProvider2, {
    mode: fixedMode,
    locked: !sameModeRef.current
  }, React76.createElement(es_default3, _extends({
    visible: mergedOpen
  }, mergedMotion, {
    forceRender: forceSubMenuRender,
    removeOnLeave: false,
    leavedClassName: "".concat(prefixCls, "-hidden")
  }), function(_ref2) {
    var motionClassName = _ref2.className, motionStyle = _ref2.style;
    return React76.createElement(SubMenuList_default2, {
      id,
      className: motionClassName,
      style: motionStyle
    }, children);
  }));
}

// ../../node_modules/rc-menu/es/SubMenu/index.js
var _excluded28 = ["style", "className", "title", "eventKey", "warnKey", "disabled", "internalPopupClose", "children", "itemIcon", "expandIcon", "popupClassName", "popupOffset", "onClick", "onMouseEnter", "onMouseLeave", "onTitleClick", "onTitleMouseEnter", "onTitleMouseLeave"];
var _excluded29 = ["active"];
var InternalSubMenu3 = function InternalSubMenu4(props) {
  var _classNames;
  var style2 = props.style, className = props.className, title = props.title, eventKey = props.eventKey, warnKey = props.warnKey, disabled = props.disabled, internalPopupClose = props.internalPopupClose, children = props.children, itemIcon = props.itemIcon, expandIcon = props.expandIcon, popupClassName = props.popupClassName, popupOffset = props.popupOffset, onClick = props.onClick, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onTitleClick = props.onTitleClick, onTitleMouseEnter = props.onTitleMouseEnter, onTitleMouseLeave = props.onTitleMouseLeave, restProps = _objectWithoutProperties(props, _excluded28);
  var domDataId = useMenuId2(eventKey);
  var _React$useContext = React77.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls, mode = _React$useContext.mode, openKeys = _React$useContext.openKeys, contextDisabled = _React$useContext.disabled, overflowDisabled = _React$useContext.overflowDisabled, activeKey = _React$useContext.activeKey, selectedKeys = _React$useContext.selectedKeys, contextItemIcon = _React$useContext.itemIcon, contextExpandIcon = _React$useContext.expandIcon, onItemClick = _React$useContext.onItemClick, onOpenChange = _React$useContext.onOpenChange, onActive = _React$useContext.onActive;
  var _React$useContext2 = React77.useContext(PrivateContext_default2), _internalRenderSubMenuItem = _React$useContext2._internalRenderSubMenuItem;
  var _React$useContext3 = React77.useContext(PathUserContext2), isSubPathKey = _React$useContext3.isSubPathKey;
  var connectedPath = useFullPath2();
  var subMenuPrefixCls = "".concat(prefixCls, "-submenu");
  var mergedDisabled = contextDisabled || disabled;
  var elementRef = React77.useRef();
  var popupRef = React77.useRef();
  if (warnKey) {
    warning_default(false, "SubMenu should not leave undefined `key`.");
  }
  var mergedItemIcon = itemIcon || contextItemIcon;
  var mergedExpandIcon = expandIcon || contextExpandIcon;
  var originOpen = openKeys.includes(eventKey);
  var open = !overflowDisabled && originOpen;
  var childrenSelected = isSubPathKey(selectedKeys, eventKey);
  var _useActive = useActive2(eventKey, mergedDisabled, onTitleMouseEnter, onTitleMouseLeave), active = _useActive.active, activeProps = _objectWithoutProperties(_useActive, _excluded29);
  var _React$useState = React77.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), childrenActive = _React$useState2[0], setChildrenActive = _React$useState2[1];
  var triggerChildrenActive = function triggerChildrenActive2(newActive) {
    if (!mergedDisabled) {
      setChildrenActive(newActive);
    }
  };
  var onInternalMouseEnter = function onInternalMouseEnter2(domEvent) {
    triggerChildrenActive(true);
    onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter({
      key: eventKey,
      domEvent
    });
  };
  var onInternalMouseLeave = function onInternalMouseLeave2(domEvent) {
    triggerChildrenActive(false);
    onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave({
      key: eventKey,
      domEvent
    });
  };
  var mergedActive = React77.useMemo(function() {
    if (active) {
      return active;
    }
    if (mode !== "inline") {
      return childrenActive || isSubPathKey([activeKey], eventKey);
    }
    return false;
  }, [mode, active, activeKey, childrenActive, eventKey, isSubPathKey]);
  var directionStyle = useDirectionStyle2(connectedPath.length);
  var onInternalTitleClick = function onInternalTitleClick2(e) {
    if (mergedDisabled) {
      return;
    }
    onTitleClick === null || onTitleClick === void 0 ? void 0 : onTitleClick({
      key: eventKey,
      domEvent: e
    });
    if (mode === "inline") {
      onOpenChange(eventKey, !originOpen);
    }
  };
  var onMergedItemClick = useMemoCallback2(function(info) {
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp2(info));
    onItemClick(info);
  });
  var onPopupVisibleChange = function onPopupVisibleChange2(newVisible) {
    if (mode !== "inline") {
      onOpenChange(eventKey, newVisible);
    }
  };
  var onInternalFocus = function onInternalFocus2() {
    onActive(eventKey);
  };
  var popupId = domDataId && "".concat(domDataId, "-popup");
  var titleNode = React77.createElement("div", _extends({
    role: "menuitem",
    style: directionStyle,
    className: "".concat(subMenuPrefixCls, "-title"),
    tabIndex: mergedDisabled ? null : -1,
    ref: elementRef,
    title: typeof title === "string" ? title : null,
    "data-menu-id": overflowDisabled && domDataId ? null : domDataId,
    "aria-expanded": open,
    "aria-haspopup": true,
    "aria-controls": popupId,
    "aria-disabled": mergedDisabled,
    onClick: onInternalTitleClick,
    onFocus: onInternalFocus
  }, activeProps), title, React77.createElement(Icon2, {
    icon: mode !== "horizontal" ? mergedExpandIcon : null,
    props: _objectSpread2(_objectSpread2({}, props), {}, {
      isOpen: open,
      // [Legacy] Not sure why need this mark
      isSubMenu: true
    })
  }, React77.createElement("i", {
    className: "".concat(subMenuPrefixCls, "-arrow")
  })));
  var triggerModeRef = React77.useRef(mode);
  if (mode !== "inline" && connectedPath.length > 1) {
    triggerModeRef.current = "vertical";
  } else {
    triggerModeRef.current = mode;
  }
  if (!overflowDisabled) {
    var triggerMode = triggerModeRef.current;
    titleNode = React77.createElement(PopupTrigger2, {
      mode: triggerMode,
      prefixCls: subMenuPrefixCls,
      visible: !internalPopupClose && open && mode !== "inline",
      popupClassName,
      popupOffset,
      popup: React77.createElement(
        InheritableContextProvider2,
        {
          mode: triggerMode === "horizontal" ? "vertical" : triggerMode
        },
        React77.createElement(SubMenuList_default2, {
          id: popupId,
          ref: popupRef
        }, children)
      ),
      disabled: mergedDisabled,
      onVisibleChange: onPopupVisibleChange
    }, titleNode);
  }
  var listNode = React77.createElement(es_default2.Item, _extends({
    role: "none"
  }, restProps, {
    component: "li",
    style: style2,
    className: (0, import_classnames26.default)(subMenuPrefixCls, "".concat(subMenuPrefixCls, "-").concat(mode), className, (_classNames = {}, _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-open"), open), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-active"), mergedActive), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-selected"), childrenSelected), _defineProperty(_classNames, "".concat(subMenuPrefixCls, "-disabled"), mergedDisabled), _classNames)),
    onMouseEnter: onInternalMouseEnter,
    onMouseLeave: onInternalMouseLeave
  }), titleNode, !overflowDisabled && React77.createElement(InlineSubMenuList2, {
    id: popupId,
    open,
    keyPath: connectedPath
  }, children));
  if (_internalRenderSubMenuItem) {
    listNode = _internalRenderSubMenuItem(listNode, props, {
      selected: childrenSelected,
      active: mergedActive,
      open,
      disabled: mergedDisabled
    });
  }
  return React77.createElement(InheritableContextProvider2, {
    onItemClick: onMergedItemClick,
    mode: mode === "horizontal" ? "vertical" : mode,
    itemIcon: mergedItemIcon,
    expandIcon: mergedExpandIcon
  }, listNode);
};
function SubMenu2(props) {
  var eventKey = props.eventKey, children = props.children;
  var connectedKeyPath = useFullPath2(eventKey);
  var childList = parseChildren2(children, connectedKeyPath);
  var measure = useMeasure2();
  React77.useEffect(function() {
    if (measure) {
      measure.registerPath(eventKey, connectedKeyPath);
      return function() {
        measure.unregisterPath(eventKey, connectedKeyPath);
      };
    }
  }, [connectedKeyPath]);
  var renderNode;
  if (measure) {
    renderNode = childList;
  } else {
    renderNode = React77.createElement(InternalSubMenu3, props, childList);
  }
  return React77.createElement(PathTrackerContext2.Provider, {
    value: connectedKeyPath
  }, renderNode);
}

// ../../node_modules/rc-menu/es/Menu.js
var _excluded30 = ["prefixCls", "rootClassName", "style", "className", "tabIndex", "items", "children", "direction", "id", "mode", "inlineCollapsed", "disabled", "disabledOverflow", "subMenuOpenDelay", "subMenuCloseDelay", "forceSubMenuRender", "defaultOpenKeys", "openKeys", "activeKey", "defaultActiveFirst", "selectable", "multiple", "defaultSelectedKeys", "selectedKeys", "onSelect", "onDeselect", "inlineIndent", "motion", "defaultMotions", "triggerSubMenuAction", "builtinPlacements", "itemIcon", "expandIcon", "overflowedIndicator", "overflowedIndicatorPopupClassName", "getPopupContainer", "onClick", "onOpenChange", "onKeyDown", "openAnimation", "openTransitionName", "_internalRenderMenuItem", "_internalRenderSubMenuItem"];
var EMPTY_LIST2 = [];
var Menu2 = React78.forwardRef(function(props, ref) {
  var _childList$, _classNames;
  var _ref = props, _ref$prefixCls = _ref.prefixCls, prefixCls = _ref$prefixCls === void 0 ? "rc-menu" : _ref$prefixCls, rootClassName = _ref.rootClassName, style2 = _ref.style, className = _ref.className, _ref$tabIndex = _ref.tabIndex, tabIndex = _ref$tabIndex === void 0 ? 0 : _ref$tabIndex, items = _ref.items, children = _ref.children, direction = _ref.direction, id = _ref.id, _ref$mode = _ref.mode, mode = _ref$mode === void 0 ? "vertical" : _ref$mode, inlineCollapsed = _ref.inlineCollapsed, disabled = _ref.disabled, disabledOverflow = _ref.disabledOverflow, _ref$subMenuOpenDelay = _ref.subMenuOpenDelay, subMenuOpenDelay = _ref$subMenuOpenDelay === void 0 ? 0.1 : _ref$subMenuOpenDelay, _ref$subMenuCloseDela = _ref.subMenuCloseDelay, subMenuCloseDelay = _ref$subMenuCloseDela === void 0 ? 0.1 : _ref$subMenuCloseDela, forceSubMenuRender = _ref.forceSubMenuRender, defaultOpenKeys = _ref.defaultOpenKeys, openKeys = _ref.openKeys, activeKey = _ref.activeKey, defaultActiveFirst = _ref.defaultActiveFirst, _ref$selectable = _ref.selectable, selectable = _ref$selectable === void 0 ? true : _ref$selectable, _ref$multiple = _ref.multiple, multiple = _ref$multiple === void 0 ? false : _ref$multiple, defaultSelectedKeys = _ref.defaultSelectedKeys, selectedKeys = _ref.selectedKeys, onSelect = _ref.onSelect, onDeselect = _ref.onDeselect, _ref$inlineIndent = _ref.inlineIndent, inlineIndent = _ref$inlineIndent === void 0 ? 24 : _ref$inlineIndent, motion = _ref.motion, defaultMotions = _ref.defaultMotions, _ref$triggerSubMenuAc = _ref.triggerSubMenuAction, triggerSubMenuAction = _ref$triggerSubMenuAc === void 0 ? "hover" : _ref$triggerSubMenuAc, builtinPlacements = _ref.builtinPlacements, itemIcon = _ref.itemIcon, expandIcon = _ref.expandIcon, _ref$overflowedIndica = _ref.overflowedIndicator, overflowedIndicator = _ref$overflowedIndica === void 0 ? "..." : _ref$overflowedIndica, overflowedIndicatorPopupClassName = _ref.overflowedIndicatorPopupClassName, getPopupContainer = _ref.getPopupContainer, onClick = _ref.onClick, onOpenChange = _ref.onOpenChange, onKeyDown = _ref.onKeyDown, openAnimation = _ref.openAnimation, openTransitionName = _ref.openTransitionName, _internalRenderMenuItem = _ref._internalRenderMenuItem, _internalRenderSubMenuItem = _ref._internalRenderSubMenuItem, restProps = _objectWithoutProperties(_ref, _excluded30);
  var childList = React78.useMemo(function() {
    return parseItems2(children, items, EMPTY_LIST2);
  }, [children, items]);
  var _React$useState = React78.useState(false), _React$useState2 = _slicedToArray(_React$useState, 2), mounted = _React$useState2[0], setMounted = _React$useState2[1];
  var containerRef = React78.useRef();
  var uuid2 = useUUID2(id);
  var isRtl = direction === "rtl";
  if (true) {
    warning_default(!openAnimation && !openTransitionName, "`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.");
  }
  var _useMergedState = useMergedState(defaultOpenKeys, {
    value: openKeys,
    postState: function postState(keys) {
      return keys || EMPTY_LIST2;
    }
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedOpenKeys = _useMergedState2[0], setMergedOpenKeys = _useMergedState2[1];
  var triggerOpenKeys = function triggerOpenKeys2(keys) {
    var forceFlush = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    function doUpdate() {
      setMergedOpenKeys(keys);
      onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(keys);
    }
    if (forceFlush) {
      (0, import_react_dom6.flushSync)(doUpdate);
    } else {
      doUpdate();
    }
  };
  var _React$useState3 = React78.useState(mergedOpenKeys), _React$useState4 = _slicedToArray(_React$useState3, 2), inlineCacheOpenKeys = _React$useState4[0], setInlineCacheOpenKeys = _React$useState4[1];
  var mountRef = React78.useRef(false);
  var _React$useMemo = React78.useMemo(function() {
    if ((mode === "inline" || mode === "vertical") && inlineCollapsed) {
      return ["vertical", inlineCollapsed];
    }
    return [mode, false];
  }, [mode, inlineCollapsed]), _React$useMemo2 = _slicedToArray(_React$useMemo, 2), mergedMode = _React$useMemo2[0], mergedInlineCollapsed = _React$useMemo2[1];
  var isInlineMode = mergedMode === "inline";
  var _React$useState5 = React78.useState(mergedMode), _React$useState6 = _slicedToArray(_React$useState5, 2), internalMode = _React$useState6[0], setInternalMode = _React$useState6[1];
  var _React$useState7 = React78.useState(mergedInlineCollapsed), _React$useState8 = _slicedToArray(_React$useState7, 2), internalInlineCollapsed = _React$useState8[0], setInternalInlineCollapsed = _React$useState8[1];
  React78.useEffect(function() {
    setInternalMode(mergedMode);
    setInternalInlineCollapsed(mergedInlineCollapsed);
    if (!mountRef.current) {
      return;
    }
    if (isInlineMode) {
      setMergedOpenKeys(inlineCacheOpenKeys);
    } else {
      triggerOpenKeys(EMPTY_LIST2);
    }
  }, [mergedMode, mergedInlineCollapsed]);
  var _React$useState9 = React78.useState(0), _React$useState10 = _slicedToArray(_React$useState9, 2), lastVisibleIndex = _React$useState10[0], setLastVisibleIndex = _React$useState10[1];
  var allVisible = lastVisibleIndex >= childList.length - 1 || internalMode !== "horizontal" || disabledOverflow;
  React78.useEffect(function() {
    if (isInlineMode) {
      setInlineCacheOpenKeys(mergedOpenKeys);
    }
  }, [mergedOpenKeys]);
  React78.useEffect(function() {
    mountRef.current = true;
    return function() {
      mountRef.current = false;
    };
  }, []);
  var _useKeyRecords = useKeyRecords2(), registerPath = _useKeyRecords.registerPath, unregisterPath = _useKeyRecords.unregisterPath, refreshOverflowKeys = _useKeyRecords.refreshOverflowKeys, isSubPathKey = _useKeyRecords.isSubPathKey, getKeyPath = _useKeyRecords.getKeyPath, getKeys = _useKeyRecords.getKeys, getSubPathKeys = _useKeyRecords.getSubPathKeys;
  var registerPathContext = React78.useMemo(function() {
    return {
      registerPath,
      unregisterPath
    };
  }, [registerPath, unregisterPath]);
  var pathUserContext = React78.useMemo(function() {
    return {
      isSubPathKey
    };
  }, [isSubPathKey]);
  React78.useEffect(function() {
    refreshOverflowKeys(allVisible ? EMPTY_LIST2 : childList.slice(lastVisibleIndex + 1).map(function(child) {
      return child.key;
    }));
  }, [lastVisibleIndex, allVisible]);
  var _useMergedState3 = useMergedState(activeKey || defaultActiveFirst && ((_childList$ = childList[0]) === null || _childList$ === void 0 ? void 0 : _childList$.key), {
    value: activeKey
  }), _useMergedState4 = _slicedToArray(_useMergedState3, 2), mergedActiveKey = _useMergedState4[0], setMergedActiveKey = _useMergedState4[1];
  var onActive = useMemoCallback2(function(key) {
    setMergedActiveKey(key);
  });
  var onInactive = useMemoCallback2(function() {
    setMergedActiveKey(void 0);
  });
  (0, import_react27.useImperativeHandle)(ref, function() {
    return {
      list: containerRef.current,
      focus: function focus(options) {
        var _childList$find;
        var shouldFocusKey = mergedActiveKey !== null && mergedActiveKey !== void 0 ? mergedActiveKey : (_childList$find = childList.find(function(node) {
          return !node.props.disabled;
        })) === null || _childList$find === void 0 ? void 0 : _childList$find.key;
        if (shouldFocusKey) {
          var _containerRef$current, _containerRef$current2, _containerRef$current3;
          (_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : (_containerRef$current2 = _containerRef$current.querySelector("li[data-menu-id='".concat(getMenuId2(uuid2, shouldFocusKey), "']"))) === null || _containerRef$current2 === void 0 ? void 0 : (_containerRef$current3 = _containerRef$current2.focus) === null || _containerRef$current3 === void 0 ? void 0 : _containerRef$current3.call(_containerRef$current2, options);
        }
      }
    };
  });
  var _useMergedState5 = useMergedState(defaultSelectedKeys || [], {
    value: selectedKeys,
    // Legacy convert key to array
    postState: function postState(keys) {
      if (Array.isArray(keys)) {
        return keys;
      }
      if (keys === null || keys === void 0) {
        return EMPTY_LIST2;
      }
      return [keys];
    }
  }), _useMergedState6 = _slicedToArray(_useMergedState5, 2), mergedSelectKeys = _useMergedState6[0], setMergedSelectKeys = _useMergedState6[1];
  var triggerSelection = function triggerSelection2(info) {
    if (selectable) {
      var targetKey = info.key;
      var exist = mergedSelectKeys.includes(targetKey);
      var newSelectKeys;
      if (multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys.filter(function(key) {
            return key !== targetKey;
          });
        } else {
          newSelectKeys = [].concat(_toConsumableArray(mergedSelectKeys), [targetKey]);
        }
      } else {
        newSelectKeys = [targetKey];
      }
      setMergedSelectKeys(newSelectKeys);
      var selectInfo = _objectSpread2(_objectSpread2({}, info), {}, {
        selectedKeys: newSelectKeys
      });
      if (exist) {
        onDeselect === null || onDeselect === void 0 ? void 0 : onDeselect(selectInfo);
      } else {
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(selectInfo);
      }
    }
    if (!multiple && mergedOpenKeys.length && internalMode !== "inline") {
      triggerOpenKeys(EMPTY_LIST2);
    }
  };
  var onInternalClick = useMemoCallback2(function(info) {
    onClick === null || onClick === void 0 ? void 0 : onClick(warnItemProp2(info));
    triggerSelection(info);
  });
  var onInternalOpenChange = useMemoCallback2(function(key, open) {
    var newOpenKeys = mergedOpenKeys.filter(function(k) {
      return k !== key;
    });
    if (open) {
      newOpenKeys.push(key);
    } else if (internalMode !== "inline") {
      var subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(function(k) {
        return !subPathKeys.has(k);
      });
    }
    if (!isEqual_default(mergedOpenKeys, newOpenKeys, true)) {
      triggerOpenKeys(newOpenKeys, true);
    }
  });
  var getInternalPopupContainer = useMemoCallback2(getPopupContainer);
  var triggerAccessibilityOpen = function triggerAccessibilityOpen2(key, open) {
    var nextOpen = open !== null && open !== void 0 ? open : !mergedOpenKeys.includes(key);
    onInternalOpenChange(key, nextOpen);
  };
  var onInternalKeyDown = useAccessibility3(internalMode, mergedActiveKey, isRtl, uuid2, containerRef, getKeys, getKeyPath, setMergedActiveKey, triggerAccessibilityOpen, onKeyDown);
  React78.useEffect(function() {
    setMounted(true);
  }, []);
  var privateContext = React78.useMemo(function() {
    return {
      _internalRenderMenuItem,
      _internalRenderSubMenuItem
    };
  }, [_internalRenderMenuItem, _internalRenderSubMenuItem]);
  var wrappedChildList = internalMode !== "horizontal" || disabledOverflow ? childList : (
    // Need wrap for overflow dropdown that do not response for open
    childList.map(function(child, index) {
      return (
        // Always wrap provider to avoid sub node re-mount
        React78.createElement(InheritableContextProvider2, {
          key: child.key,
          overflowDisabled: index > lastVisibleIndex
        }, child)
      );
    })
  );
  var container = React78.createElement(es_default2, _extends({
    id,
    ref: containerRef,
    prefixCls: "".concat(prefixCls, "-overflow"),
    component: "ul",
    itemComponent: MenuItem_default2,
    className: (0, import_classnames27.default)(prefixCls, "".concat(prefixCls, "-root"), "".concat(prefixCls, "-").concat(internalMode), className, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-inline-collapsed"), internalInlineCollapsed), _defineProperty(_classNames, "".concat(prefixCls, "-rtl"), isRtl), _classNames), rootClassName),
    dir: direction,
    style: style2,
    role: "menu",
    tabIndex,
    data: wrappedChildList,
    renderRawItem: function renderRawItem(node) {
      return node;
    },
    renderRawRest: function renderRawRest(omitItems) {
      var len = omitItems.length;
      var originOmitItems = len ? childList.slice(-len) : null;
      return React78.createElement(SubMenu2, {
        eventKey: OVERFLOW_KEY2,
        title: overflowedIndicator,
        disabled: allVisible,
        internalPopupClose: len === 0,
        popupClassName: overflowedIndicatorPopupClassName
      }, originOmitItems);
    },
    maxCount: internalMode !== "horizontal" || disabledOverflow ? es_default2.INVALIDATE : es_default2.RESPONSIVE,
    ssr: "full",
    "data-menu-list": true,
    onVisibleChange: function onVisibleChange(newLastIndex) {
      setLastVisibleIndex(newLastIndex);
    },
    onKeyDown: onInternalKeyDown
  }, restProps));
  return React78.createElement(PrivateContext_default2.Provider, {
    value: privateContext
  }, React78.createElement(IdContext2.Provider, {
    value: uuid2
  }, React78.createElement(InheritableContextProvider2, {
    prefixCls,
    rootClassName,
    mode: internalMode,
    openKeys: mergedOpenKeys,
    rtl: isRtl,
    disabled,
    motion: mounted ? motion : null,
    defaultMotions: mounted ? defaultMotions : null,
    activeKey: mergedActiveKey,
    onActive,
    onInactive,
    selectedKeys: mergedSelectKeys,
    inlineIndent,
    subMenuOpenDelay,
    subMenuCloseDelay,
    forceSubMenuRender,
    builtinPlacements,
    triggerSubMenuAction,
    getPopupContainer: getInternalPopupContainer,
    itemIcon,
    expandIcon,
    onItemClick: onInternalClick,
    onOpenChange: onInternalOpenChange
  }, React78.createElement(PathUserContext2.Provider, {
    value: pathUserContext
  }, container), React78.createElement("div", {
    style: {
      display: "none"
    },
    "aria-hidden": true
  }, React78.createElement(PathRegisterContext2.Provider, {
    value: registerPathContext
  }, childList)))));
});
var Menu_default2 = Menu2;

// ../../node_modules/rc-menu/es/MenuItemGroup.js
init_extends();
var import_classnames28 = __toESM(require_classnames());
var React79 = __toESM(require_react());
var _excluded31 = ["className", "title", "eventKey", "children"];
var _excluded210 = ["children"];
var InternalMenuItemGroup3 = function InternalMenuItemGroup4(_ref) {
  var className = _ref.className, title = _ref.title, eventKey = _ref.eventKey, children = _ref.children, restProps = _objectWithoutProperties(_ref, _excluded31);
  var _React$useContext = React79.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls;
  var groupPrefixCls = "".concat(prefixCls, "-item-group");
  return React79.createElement("li", _extends({
    role: "presentation"
  }, restProps, {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    className: (0, import_classnames28.default)(groupPrefixCls, className)
  }), React79.createElement("div", {
    role: "presentation",
    className: "".concat(groupPrefixCls, "-title"),
    title: typeof title === "string" ? title : void 0
  }, title), React79.createElement("ul", {
    role: "group",
    className: "".concat(groupPrefixCls, "-list")
  }, children));
};
function MenuItemGroup2(_ref2) {
  var children = _ref2.children, props = _objectWithoutProperties(_ref2, _excluded210);
  var connectedKeyPath = useFullPath2(props.eventKey);
  var childList = parseChildren2(children, connectedKeyPath);
  var measure = useMeasure2();
  if (measure) {
    return childList;
  }
  return React79.createElement(InternalMenuItemGroup3, omit(props, ["warnKey"]), childList);
}

// ../../node_modules/rc-menu/es/Divider.js
var React80 = __toESM(require_react());
var import_classnames29 = __toESM(require_classnames());
function Divider2(_ref) {
  var className = _ref.className, style2 = _ref.style;
  var _React$useContext = React80.useContext(MenuContext2), prefixCls = _React$useContext.prefixCls;
  var measure = useMeasure2();
  if (measure) {
    return null;
  }
  return React80.createElement("li", {
    className: (0, import_classnames29.default)("".concat(prefixCls, "-item-divider"), className),
    style: style2
  });
}

// ../../node_modules/rc-menu/es/index.js
var ExportMenu2 = Menu_default2;
ExportMenu2.Item = MenuItem_default2;
ExportMenu2.SubMenu = SubMenu2;
ExportMenu2.ItemGroup = MenuItemGroup2;
ExportMenu2.Divider = Divider2;
var es_default9 = ExportMenu2;

// ../../node_modules/rc-dropdown/es/Dropdown.js
var React82 = __toESM(require_react());
var import_classnames30 = __toESM(require_classnames());

// ../../node_modules/rc-dropdown/es/placements.js
var autoAdjustOverflow4 = {
  adjustX: 1,
  adjustY: 1
};
var targetOffset2 = [0, 0];
var placements4 = {
  topLeft: {
    points: ["bl", "tl"],
    overflow: autoAdjustOverflow4,
    offset: [0, -4],
    targetOffset: targetOffset2
  },
  topCenter: {
    points: ["bc", "tc"],
    overflow: autoAdjustOverflow4,
    offset: [0, -4],
    targetOffset: targetOffset2
  },
  topRight: {
    points: ["br", "tr"],
    overflow: autoAdjustOverflow4,
    offset: [0, -4],
    targetOffset: targetOffset2
  },
  bottomLeft: {
    points: ["tl", "bl"],
    overflow: autoAdjustOverflow4,
    offset: [0, 4],
    targetOffset: targetOffset2
  },
  bottomCenter: {
    points: ["tc", "bc"],
    overflow: autoAdjustOverflow4,
    offset: [0, 4],
    targetOffset: targetOffset2
  },
  bottomRight: {
    points: ["tr", "br"],
    overflow: autoAdjustOverflow4,
    offset: [0, 4],
    targetOffset: targetOffset2
  }
};
var placements_default2 = placements4;

// ../../node_modules/rc-dropdown/es/hooks/useAccessibility.js
var React81 = __toESM(require_react());
var ESC4 = KeyCode_default.ESC;
var TAB2 = KeyCode_default.TAB;
function useAccessibility4(_ref) {
  var visible = _ref.visible, setTriggerVisible = _ref.setTriggerVisible, triggerRef = _ref.triggerRef, menuRef = _ref.menuRef, onVisibleChange = _ref.onVisibleChange, autoFocus = _ref.autoFocus;
  var focusMenuRef = React81.useRef(false);
  var handleCloseMenuAndReturnFocus = function handleCloseMenuAndReturnFocus2() {
    if (visible && triggerRef.current) {
      var _triggerRef$current, _triggerRef$current$t, _triggerRef$current$t2, _triggerRef$current$t3;
      (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 ? void 0 : (_triggerRef$current$t = _triggerRef$current.triggerRef) === null || _triggerRef$current$t === void 0 ? void 0 : (_triggerRef$current$t2 = _triggerRef$current$t.current) === null || _triggerRef$current$t2 === void 0 ? void 0 : (_triggerRef$current$t3 = _triggerRef$current$t2.focus) === null || _triggerRef$current$t3 === void 0 ? void 0 : _triggerRef$current$t3.call(_triggerRef$current$t2);
      setTriggerVisible(false);
      if (typeof onVisibleChange === "function") {
        onVisibleChange(false);
      }
    }
  };
  var focusMenu = function focusMenu2() {
    var _menuRef$current, _menuRef$current$focu;
    (_menuRef$current = menuRef.current) === null || _menuRef$current === void 0 ? void 0 : (_menuRef$current$focu = _menuRef$current.focus) === null || _menuRef$current$focu === void 0 ? void 0 : _menuRef$current$focu.call(_menuRef$current);
    focusMenuRef.current = true;
  };
  var handleKeyDown = function handleKeyDown2(event) {
    var _menuRef$current2;
    switch (event.keyCode) {
      case ESC4:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB2:
        if (!focusMenuRef.current && ((_menuRef$current2 = menuRef.current) === null || _menuRef$current2 === void 0 ? void 0 : _menuRef$current2.focus)) {
          event.preventDefault();
          focusMenu();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
    }
  };
  React81.useEffect(function() {
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
      if (autoFocus) {
        raf_default(focusMenu, 3);
      }
      return function() {
        window.removeEventListener("keydown", handleKeyDown);
        focusMenuRef.current = false;
      };
    }
    return function() {
      focusMenuRef.current = false;
    };
  }, [visible]);
}

// ../../node_modules/rc-dropdown/es/Dropdown.js
var _excluded34 = ["arrow", "prefixCls", "transitionName", "animation", "align", "placement", "placements", "getPopupContainer", "showAction", "hideAction", "overlayClassName", "overlayStyle", "visible", "trigger", "autoFocus"];
function Dropdown2(props, ref) {
  var _props$arrow = props.arrow, arrow = _props$arrow === void 0 ? false : _props$arrow, _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-dropdown" : _props$prefixCls, transitionName = props.transitionName, animation = props.animation, align = props.align, _props$placement = props.placement, placement = _props$placement === void 0 ? "bottomLeft" : _props$placement, _props$placements = props.placements, placements5 = _props$placements === void 0 ? placements_default2 : _props$placements, getPopupContainer = props.getPopupContainer, showAction = props.showAction, hideAction = props.hideAction, overlayClassName = props.overlayClassName, overlayStyle = props.overlayStyle, visible = props.visible, _props$trigger = props.trigger, trigger = _props$trigger === void 0 ? ["hover"] : _props$trigger, autoFocus = props.autoFocus, otherProps = _objectWithoutProperties(props, _excluded34);
  var _React$useState = React82.useState(), _React$useState2 = _slicedToArray(_React$useState, 2), triggerVisible = _React$useState2[0], setTriggerVisible = _React$useState2[1];
  var mergedVisible = "visible" in props ? visible : triggerVisible;
  var triggerRef = React82.useRef(null);
  React82.useImperativeHandle(ref, function() {
    return triggerRef.current;
  });
  var menuRef = React82.useRef(null);
  var menuClassName = "".concat(prefixCls, "-menu");
  useAccessibility4({
    visible: mergedVisible,
    setTriggerVisible,
    triggerRef,
    menuRef,
    onVisibleChange: props.onVisibleChange,
    autoFocus
  });
  var getOverlayElement = function getOverlayElement2() {
    var overlay = props.overlay;
    var overlayElement;
    if (typeof overlay === "function") {
      overlayElement = overlay();
    } else {
      overlayElement = overlay;
    }
    return overlayElement;
  };
  var onClick = function onClick2(e) {
    var onOverlayClick = props.onOverlayClick;
    var overlayProps = getOverlayElement().props;
    setTriggerVisible(false);
    if (onOverlayClick) {
      onOverlayClick(e);
    }
    if (overlayProps.onClick) {
      overlayProps.onClick(e);
    }
  };
  var onVisibleChange = function onVisibleChange2(newVisible) {
    var onVisibleChangeProp = props.onVisibleChange;
    setTriggerVisible(newVisible);
    if (typeof onVisibleChangeProp === "function") {
      onVisibleChangeProp(newVisible);
    }
  };
  var getMenuElement = function getMenuElement2() {
    var _extraOverlayProps;
    var overlayElement = getOverlayElement();
    var composedMenuRef = composeRef(menuRef, overlayElement.ref);
    var extraOverlayProps = (_extraOverlayProps = {
      prefixCls: menuClassName
    }, _defineProperty(_extraOverlayProps, "data-dropdown-inject", true), _defineProperty(_extraOverlayProps, "onClick", onClick), _defineProperty(_extraOverlayProps, "ref", supportRef(overlayElement) ? composedMenuRef : void 0), _extraOverlayProps);
    if (typeof overlayElement.type === "string") {
      delete extraOverlayProps.prefixCls;
      delete extraOverlayProps["data-dropdown-inject"];
    }
    return React82.createElement(React82.Fragment, null, arrow && React82.createElement("div", {
      className: "".concat(prefixCls, "-arrow")
    }), React82.cloneElement(overlayElement, extraOverlayProps));
  };
  var getMenuElementOrLambda = function getMenuElementOrLambda2() {
    var overlay = props.overlay;
    if (typeof overlay === "function") {
      return getMenuElement;
    }
    return getMenuElement();
  };
  var getMinOverlayWidthMatchTrigger = function getMinOverlayWidthMatchTrigger2() {
    var minOverlayWidthMatchTrigger = props.minOverlayWidthMatchTrigger, alignPoint2 = props.alignPoint;
    if ("minOverlayWidthMatchTrigger" in props) {
      return minOverlayWidthMatchTrigger;
    }
    return !alignPoint2;
  };
  var getOpenClassName = function getOpenClassName2() {
    var openClassName = props.openClassName;
    if (openClassName !== void 0) {
      return openClassName;
    }
    return "".concat(prefixCls, "-open");
  };
  var renderChildren = function renderChildren2() {
    var children = props.children;
    var childrenProps = children.props ? children.props : {};
    var childClassName = (0, import_classnames30.default)(childrenProps.className, getOpenClassName());
    return mergedVisible && children ? React82.cloneElement(children, {
      className: childClassName
    }) : children;
  };
  var triggerHideAction = hideAction;
  if (!triggerHideAction && trigger.indexOf("contextMenu") !== -1) {
    triggerHideAction = ["click"];
  }
  return React82.createElement(es_default5, _objectSpread2(_objectSpread2({
    builtinPlacements: placements5
  }, otherProps), {}, {
    prefixCls,
    ref: triggerRef,
    popupClassName: (0, import_classnames30.default)(overlayClassName, _defineProperty({}, "".concat(prefixCls, "-show-arrow"), arrow)),
    popupStyle: overlayStyle,
    action: trigger,
    showAction,
    hideAction: triggerHideAction || [],
    popupPlacement: placement,
    popupAlign: align,
    popupTransitionName: transitionName,
    popupAnimation: animation,
    popupVisible: mergedVisible,
    stretch: getMinOverlayWidthMatchTrigger() ? "minWidth" : "",
    popup: getMenuElementOrLambda(),
    onPopupVisibleChange: onVisibleChange,
    getPopupContainer
  }), renderChildren());
}
var Dropdown_default2 = React82.forwardRef(Dropdown2);

// ../../node_modules/rc-dropdown/es/index.js
var es_default10 = Dropdown_default2;

// ../../node_modules/rc-dock/es/dragdrop/DragManager.js
var DragState = class {
  constructor(event, component, init = false) {
    this.pageX = 0;
    this.pageY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.dx = 0;
    this.dy = 0;
    this.event = event;
    this.component = component;
    this._init = init;
    if (event) {
      if (event.type.startsWith("touch")) {
        let touch;
        if (event.type === "touchend") {
          touch = event.changedTouches[0];
        } else {
          touch = event.touches[0];
        }
        this.pageX = touch.pageX;
        this.pageY = touch.pageY;
        this.clientX = touch.clientX;
        this.clientY = touch.clientY;
      } else if ("pageX" in event) {
        this.pageX = event.pageX;
        this.pageY = event.pageY;
        this.clientX = event.clientX;
        this.clientY = event.clientY;
      }
      this.dx = (this.pageX - component.baseX) * component.scaleX;
      this.dy = (this.pageY - component.baseY) * component.scaleY;
    }
  }
  moved() {
    return Math.abs(this.dx) >= 1 || Math.abs(this.dy) >= 1;
  }
  /**
   * @param refElement, the element being moved
   * @param draggingHtml, the element show in the dragging layer
   */
  startDrag(refElement, draggingHtml) {
    if (!this._init) {
      throw new Error("startDrag can only be used in onDragStart callback");
    }
    if (refElement === void 0) {
      refElement = this.component.element;
    }
    createDraggingElement(this, refElement, draggingHtml);
    this.component.ownerDocument.body.classList.add("dock-dragging");
  }
  setData(data, scope) {
    if (!this._init) {
      throw new Error("setData can only be used in onDragStart callback");
    }
    _dataScope = scope;
    _data = data;
  }
  static getData(field, scope) {
    if (scope === _dataScope && _data) {
      return _data[field];
    }
    return null;
  }
  get dragType() {
    return this.component.dragType;
  }
  accept(message = "") {
    this.acceptMessage = message;
    this.rejected = false;
  }
  reject() {
    this.rejected = true;
  }
  _onMove() {
    if (_data) {
      let ownerDocument = this.component.ownerDocument;
      let searchElement = ownerDocument.elementFromPoint(this.clientX, this.clientY);
      let droppingHandlers;
      while (searchElement && searchElement !== ownerDocument.body) {
        if (_dragListeners.has(searchElement)) {
          let handlers = _dragListeners.get(searchElement);
          if (handlers.onDragOverT) {
            handlers.onDragOverT(this);
            if (this.acceptMessage != null) {
              droppingHandlers = handlers;
              break;
            }
          }
        }
        searchElement = searchElement.parentElement;
      }
      setDroppingHandler(droppingHandlers, this);
    }
    moveDraggingElement(this);
  }
  _onDragEnd(canceled = false) {
    if (_droppingHandlers && _droppingHandlers.onDropT && !canceled) {
      _droppingHandlers.onDropT(this);
      if (this.component.dragType === "right") {
        this.component.ownerDocument.addEventListener("contextmenu", preventDefault, true);
        setTimeout(() => {
          this.component.ownerDocument.removeEventListener("contextmenu", preventDefault, true);
        }, 0);
      }
    }
    destroyDraggingElement(this);
    this.component.ownerDocument.body.classList.remove("dock-dragging");
  }
};
function preventDefault(e) {
  e.preventDefault();
  e.stopPropagation();
}
var _dataScope;
var _data;
var _draggingState;
var _refElement;
var _droppingHandlers;
function setDroppingHandler(handlers, state) {
  if (_droppingHandlers === handlers) {
    return;
  }
  if (_droppingHandlers && _droppingHandlers.onDragLeaveT) {
    _droppingHandlers.onDragLeaveT(state);
  }
  _droppingHandlers = handlers;
}
var _dragListeners = /* @__PURE__ */ new WeakMap();
function isDragging() {
  return _draggingState != null;
}
function addHandlers(element, handlers) {
  _dragListeners.set(element, handlers);
}
function removeHandlers(element) {
  let handlers = _dragListeners.get(element);
  if (handlers === _droppingHandlers) {
    _droppingHandlers = null;
  }
  _dragListeners.delete(element);
}
var _draggingDiv;
var _draggingIcon;
function _createDraggingDiv(doc) {
  _draggingDiv = doc.createElement("div");
  _draggingIcon = doc.createElement("div");
  _draggingDiv.className = "dragging-layer";
  _draggingDiv.appendChild(document.createElement("div"));
  _draggingDiv.appendChild(_draggingIcon);
}
function createDraggingElement(state, refElement, draggingHtml) {
  _draggingState = state;
  if (refElement) {
    refElement.classList.add("dragging");
    _refElement = refElement;
  }
  _createDraggingDiv(state.component.ownerDocument);
  state.component.ownerDocument.body.appendChild(_draggingDiv);
  let draggingWidth = 0;
  let draggingHeight = 0;
  if (draggingHtml === void 0) {
    draggingHtml = state.component.element;
  }
  if (draggingHtml && "outerHTML" in draggingHtml) {
    draggingWidth = draggingHtml.offsetWidth;
    draggingHeight = draggingHtml.offsetHeight;
    draggingHtml = draggingHtml.outerHTML;
  }
  if (draggingHtml) {
    _draggingDiv.firstElementChild.outerHTML = draggingHtml;
    if (window.getComputedStyle(_draggingDiv.firstElementChild).backgroundColor === "rgba(0, 0, 0, 0)") {
      _draggingDiv.firstElementChild.style.backgroundColor = window.getComputedStyle(_draggingDiv).getPropertyValue("--default-background-color");
    }
    if (draggingWidth) {
      if (draggingWidth > 400)
        draggingWidth = 400;
      _draggingDiv.firstElementChild.style.width = `${draggingWidth}px`;
    }
    if (draggingHeight) {
      if (draggingHeight > 300)
        draggingHeight = 300;
      _draggingDiv.firstElementChild.style.height = `${draggingHeight}px`;
    }
  }
  for (let callback of _dragStateListener) {
    if (_dataScope) {
      callback(_dataScope);
    } else {
      callback(true);
    }
  }
}
function moveDraggingElement(state) {
  _draggingDiv.style.left = `${state.pageX}px`;
  _draggingDiv.style.top = `${state.pageY}px`;
  if (state.rejected) {
    _draggingIcon.className = "drag-accept-reject";
  } else if (state.acceptMessage) {
    _draggingIcon.className = state.acceptMessage;
  } else {
    _draggingIcon.className = "";
  }
}
function destroyDraggingElement(e) {
  if (_refElement) {
    _refElement.classList.remove("dragging");
    _refElement = null;
  }
  if (_draggingDiv) {
    _draggingDiv.remove();
    _draggingDiv = null;
  }
  _draggingState = null;
  setDroppingHandler(null, e);
  _dataScope = null;
  _data = null;
  for (let callback of _dragStateListener) {
    callback(null);
  }
}
var _dragStateListener = /* @__PURE__ */ new Set();
function addDragStateListener(callback) {
  _dragStateListener.add(callback);
}
function removeDragStateListener(callback) {
  _dragStateListener.delete(callback);
}
if (typeof window !== "undefined" && window.navigator && window.navigator.platform && /iP(ad|hone|od)/.test(window.navigator.platform)) {
  document.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && document.body.classList.contains("dock-dragging")) {
      e.preventDefault();
    }
  }, { passive: false });
}

// ../../node_modules/rc-dock/es/dragdrop/DragDropDiv.js
var import_react28 = __toESM(require_react());

// ../../node_modules/rc-dock/es/dragdrop/GestureManager.js
var GestureState = class {
  constructor(event, component, init = false) {
    this.dx1 = 0;
    this.dy1 = 0;
    this.dx2 = 0;
    this.dy2 = 0;
    this.scale = 1;
    this.rotate = 0;
    this.dx = 0;
    this.dy = 0;
    this.event = event;
    this.component = component;
    this._init = init;
    if (event) {
      if (event.touches.length === 2) {
        let touch1 = event.touches[0];
        let touch2 = event.touches[1];
        this.dx1 = (touch1.pageX - component.baseX) * component.scaleX;
        this.dy1 = (touch1.pageY - component.baseY) * component.scaleY;
        this.dx2 = (touch2.pageX - component.baseX2) * component.scaleX;
        this.dy2 = (touch2.pageY - component.baseY2) * component.scaleY;
        if (this.dx1 * this.dx2 >= 0) {
          this.dx = (this.dx1 + this.dx2) / 2;
        }
        if (this.dy1 * this.dy2 >= 0) {
          this.dy = (this.dy1 + this.dy2) / 2;
        }
        this.scale = Math.sqrt(Math.pow(touch2.pageX - touch1.pageX, 2) + Math.pow(touch2.pageY - touch1.pageY, 2)) / component.baseDis;
        this.rotate = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX) - component.baseAng;
        if (this.rotate > Math.PI) {
          this.rotate -= Math.PI * 2;
        } else if (this.rotate < -Math.PI) {
          this.rotate += Math.PI * 2;
        }
      }
    }
  }
  moved() {
    return Math.max(Math.abs(this.dx1), Math.abs(this.dx2), Math.abs(this.dy1), Math.abs(this.dy2));
  }
  pageCenter() {
    let touch1 = this.event.touches[0];
    let touch2 = this.event.touches[1];
    return [(touch1.pageX + touch2.pageX) / 2, (touch1.pageY + touch2.pageY) / 2];
  }
  clientCenter() {
    let touch1 = this.event.touches[0];
    let touch2 = this.event.touches[1];
    return [(touch1.clientX + touch2.clientX) / 2, (touch1.clientY + touch2.clientY) / 2];
  }
};

// ../../node_modules/rc-dock/es/dragdrop/DragDropDiv.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var DragDropDiv = class extends import_react28.default.PureComponent {
  constructor() {
    super(...arguments);
    this._getRef = (r) => {
      if (r === this.element) {
        return;
      }
      let { getRef, onDragOverT } = this.props;
      if (this.element && onDragOverT) {
        removeHandlers(this.element);
      }
      this.element = r;
      if (r) {
        this.ownerDocument = r.ownerDocument;
      }
      if (getRef) {
        getRef(r);
      }
      if (r && onDragOverT) {
        addHandlers(r, this.props);
      }
    };
    this.dragType = null;
    this.waitingMove = false;
    this.listening = false;
    this.gesturing = false;
    this.onPointerDown = (e) => {
      let nativeTarget = e.nativeEvent.target;
      if (nativeTarget instanceof HTMLInputElement || nativeTarget instanceof HTMLTextAreaElement || nativeTarget.classList.contains("drag-ignore")) {
        return;
      }
      let { onDragStartT, onGestureStartT, onGestureMoveT, useRightButtonDragT } = this.props;
      let event = e.nativeEvent;
      this.cancel();
      if (event.type === "touchstart") {
        if (event.touches.length === 1) {
          if (onDragStartT) {
            this.onDragStart(event);
          }
        } else if (event.touches.length === 2) {
          if (onGestureStartT && onGestureMoveT) {
            this.onGestureStart(event);
          }
        }
      } else if (onDragStartT) {
        if (event.button === 2 && !useRightButtonDragT) {
          return;
        }
        this.onDragStart(event);
      }
    };
    this.onMouseMove = (e) => {
      let { onDragMoveT } = this.props;
      if (this.waitingMove) {
        if (isDragging()) {
          this.onDragEnd();
          return;
        }
        if (!this.checkFirstMove(e)) {
          return;
        }
      } else {
        let state = new DragState(e, this);
        state._onMove();
        if (onDragMoveT) {
          onDragMoveT(state);
        }
      }
      e.preventDefault();
    };
    this.onTouchMove = (e) => {
      let { onDragMoveT } = this.props;
      if (this.waitingMove) {
        if (isDragging()) {
          this.onDragEnd();
          return;
        }
        if (!this.checkFirstMove(e)) {
          return;
        }
      } else if (e.touches.length !== 1) {
        this.onDragEnd();
      } else {
        let state = new DragState(e, this);
        state._onMove();
        if (onDragMoveT) {
          onDragMoveT(state);
        }
      }
      e.preventDefault();
    };
    this.onDragEnd = (e) => {
      let { onDragEndT } = this.props;
      let state = new DragState(e, this);
      this.removeListeners();
      if (!this.waitingMove) {
        state._onDragEnd(e == null);
        if (onDragEndT) {
          onDragEndT(state);
        }
      }
      this.cleanupDrag(state);
    };
    this.onGestureMove = (e) => {
      let { onGestureMoveT, gestureSensitivity } = this.props;
      let state = new GestureState(e, this);
      if (this.waitingMove) {
        if (!(gestureSensitivity > 0)) {
          gestureSensitivity = 10;
        }
        if (state.moved() > gestureSensitivity) {
          this.waitingMove = false;
        } else {
          return;
        }
      }
      if (onGestureMoveT) {
        onGestureMoveT(state);
      }
    };
    this.onGestureEnd = (e) => {
      let { onGestureEndT } = this.props;
      let state = new DragState(e, this);
      this.removeListeners();
      if (onGestureEndT) {
        onGestureEndT();
      }
    };
    this.onKeyDown = (e) => {
      if (e.key === "Escape") {
        this.cancel();
      }
    };
  }
  onDragStart(event) {
    if (isDragging()) {
      return;
    }
    let state = new DragState(event, this, true);
    this.baseX = state.pageX;
    this.baseY = state.pageY;
    let baseElement = this.element.parentElement;
    let rect = baseElement.getBoundingClientRect();
    this.scaleX = baseElement.offsetWidth / Math.round(rect.width);
    this.scaleY = baseElement.offsetHeight / Math.round(rect.height);
    this.addDragListeners(event);
    if (this.props.directDragT) {
      this.executeFirstMove(state);
    }
  }
  addDragListeners(event) {
    let { onDragStartT } = this.props;
    if (event.type === "touchstart") {
      this.ownerDocument.addEventListener("touchmove", this.onTouchMove);
      this.ownerDocument.addEventListener("touchend", this.onDragEnd);
      this.dragType = "touch";
    } else {
      this.ownerDocument.addEventListener("mousemove", this.onMouseMove);
      this.ownerDocument.addEventListener("mouseup", this.onDragEnd);
      if (event.button === 2) {
        this.dragType = "right";
      } else {
        this.dragType = "left";
      }
    }
    this.waitingMove = true;
    this.listening = true;
  }
  // return true for a valid move
  checkFirstMove(e) {
    let state = new DragState(e, this, true);
    if (!state.moved()) {
      return false;
    }
    return this.executeFirstMove(state);
  }
  executeFirstMove(state) {
    let { onDragStartT } = this.props;
    this.waitingMove = false;
    onDragStartT(state);
    if (!isDragging()) {
      this.onDragEnd();
      return false;
    }
    state._onMove();
    this.ownerDocument.addEventListener("keydown", this.onKeyDown);
    return true;
  }
  addGestureListeners(event) {
    this.ownerDocument.addEventListener("touchmove", this.onGestureMove);
    this.ownerDocument.addEventListener("touchend", this.onGestureEnd);
    this.ownerDocument.addEventListener("keydown", this.onKeyDown);
    this.gesturing = true;
    this.waitingMove = true;
  }
  onGestureStart(event) {
    if (!isDragging()) {
      return;
    }
    let { onGestureStartT } = this.props;
    this.baseX = event.touches[0].pageX;
    this.baseY = event.touches[0].pageY;
    this.baseX2 = event.touches[1].pageX;
    this.baseY2 = event.touches[1].pageY;
    let baseElement = this.element.parentElement;
    let rect = baseElement.getBoundingClientRect();
    this.scaleX = baseElement.offsetWidth / Math.round(rect.width);
    this.scaleY = baseElement.offsetHeight / Math.round(rect.height);
    this.baseDis = Math.sqrt(Math.pow(this.baseX - this.baseX2, 2) + Math.pow(this.baseY - this.baseY2, 2));
    this.baseAng = Math.atan2(this.baseY2 - this.baseY, this.baseX2 - this.baseX);
    let state = new GestureState(event, this, true);
    if (onGestureStartT(state)) {
      this.addGestureListeners(event);
      event.preventDefault();
    }
  }
  cancel() {
    if (this.listening) {
      this.onDragEnd();
    }
    if (this.gesturing) {
      this.onGestureEnd();
    }
  }
  removeListeners() {
    if (this.gesturing) {
      this.ownerDocument.removeEventListener("touchmove", this.onGestureMove);
      this.ownerDocument.removeEventListener("touchend", this.onGestureEnd);
    } else if (this.listening) {
      if (this.dragType === "touch") {
        this.ownerDocument.removeEventListener("touchmove", this.onTouchMove);
        this.ownerDocument.removeEventListener("touchend", this.onDragEnd);
      } else {
        this.ownerDocument.removeEventListener("mousemove", this.onMouseMove);
        this.ownerDocument.removeEventListener("mouseup", this.onDragEnd);
      }
    }
    this.ownerDocument.removeEventListener("keydown", this.onKeyDown);
    this.listening = false;
    this.gesturing = false;
  }
  cleanupDrag(state) {
    this.dragType = null;
    this.waitingMove = false;
  }
  render() {
    let _a = this.props, { getRef, children, className, directDragT, onDragStartT, onDragMoveT, onDragEndT, onDragOverT, onDragLeaveT, onDropT, onGestureStartT, onGestureMoveT, onGestureEndT, useRightButtonDragT } = _a, others = __rest(_a, ["getRef", "children", "className", "directDragT", "onDragStartT", "onDragMoveT", "onDragEndT", "onDragOverT", "onDragLeaveT", "onDropT", "onGestureStartT", "onGestureMoveT", "onGestureEndT", "useRightButtonDragT"]);
    let onTouchDown = this.onPointerDown;
    let onMouseDown = this.onPointerDown;
    if (!onDragStartT) {
      onMouseDown = null;
      if (!onGestureStartT) {
        onTouchDown = null;
      }
    }
    if (onDragStartT || onGestureStartT) {
      if (className) {
        className = `${className} drag-initiator`;
      } else {
        className = "drag-initiator";
      }
    }
    return import_react28.default.createElement("div", Object.assign({ ref: this._getRef, className }, others, { onMouseDown, onTouchStart: onTouchDown }), children);
  }
  componentDidUpdate(prevProps) {
    let { onDragOverT, onDragEndT, onDragLeaveT } = this.props;
    if (this.element && (prevProps.onDragOverT !== onDragOverT || prevProps.onDragLeaveT !== onDragLeaveT || prevProps.onDragEndT !== onDragEndT)) {
      if (onDragOverT) {
        addHandlers(this.element, this.props);
      } else {
        removeHandlers(this.element);
      }
    }
  }
  componentWillUnmount() {
    let { onDragOverT } = this.props;
    if (this.element && onDragOverT) {
      removeHandlers(this.element);
    }
    this.cancel();
  }
};

// ../../node_modules/rc-dock/es/DockTabBar.js
var import_react29 = __toESM(require_react());
var __rest2 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
function checkLocalTabMove(key, tabbar) {
  if (key === "ArrowLeft" || key === "ArrowRight") {
    let tabs = Array.from(tabbar.querySelectorAll(".dock-tab-btn"));
    let activeTab = tabbar.querySelector(".dock-tab-active>.dock-tab-btn");
    let i = tabs.indexOf(activeTab);
    if (i >= 0) {
      if (key === "ArrowLeft") {
        if (i > 0) {
          tabs[i - 1].click();
          tabs[i - 1].focus();
          return true;
        }
      } else {
        if (i < tabs.length - 1) {
          tabs[i + 1].click();
          tabs[i + 1].focus();
          return true;
        }
      }
    }
  }
  return false;
}
function DockTabBar(props) {
  const { onDragStart, onDragMove, onDragEnd, TabNavList: TabNavList2, isMaximized } = props, restProps = __rest2(props, ["onDragStart", "onDragMove", "onDragEnd", "TabNavList", "isMaximized"]);
  const layout = import_react29.default.useContext(DockContextType);
  const ref = import_react29.default.useRef();
  const getRef = (div) => {
    ref.current = div;
  };
  const onKeyDown = (e) => {
    if (e.key.startsWith("Arrow")) {
      if (!checkLocalTabMove(e.key, ref.current) && !isMaximized) {
        layout.navigateToPanel(ref.current, e.key);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };
  return import_react29.default.createElement(
    DragDropDiv,
    { onDragStartT: onDragStart, onDragMoveT: onDragMove, onDragEndT: onDragEnd, role: "tablist", className: "dock-bar", onKeyDown, getRef, tabIndex: -1 },
    import_react29.default.createElement(TabNavList2, Object.assign({}, restProps))
  );
}

// ../../node_modules/rc-dock/es/DockTabPane.js
var import_react30 = __toESM(require_react());
var import_classnames31 = __toESM(require_classnames());
var DockTabPane = class extends import_react30.default.PureComponent {
  constructor() {
    super(...arguments);
    this.getRef = (r) => {
      this._ref = r;
    };
  }
  updateCache() {
    const { cached, children, cacheId } = this.props;
    if (this._cache) {
      if (!cached || cacheId !== this._cache.id) {
        this.context.removeTabCache(this._cache.id, this);
        this._cache = null;
      }
    }
    if (cached && this._ref) {
      this._cache = this.context.getTabCache(cacheId, this);
      if (!this._ref.contains(this._cache.div)) {
        this._ref.appendChild(this._cache.div);
      }
      this.context.updateTabCache(this._cache.id, children);
    }
  }
  render() {
    const { cacheId, cached, prefixCls, forceRender, className, style: style2, id, active, animated, destroyInactiveTabPane, tabKey, children } = this.props;
    if (active) {
      this.visited = true;
    } else if (destroyInactiveTabPane) {
      this.visited = false;
    }
    const mergedStyle = {};
    if (!active) {
      if (animated) {
        mergedStyle.visibility = "hidden";
        mergedStyle.height = 0;
        mergedStyle.overflowY = "hidden";
      } else {
        mergedStyle.display = "none";
      }
    }
    const isRender = cached === false ? active : this.visited;
    let renderChildren = null;
    if (cached) {
      renderChildren = null;
    } else if (isRender || forceRender) {
      renderChildren = children;
    }
    let getRef = cached ? this.getRef : null;
    return import_react30.default.createElement("div", { ref: getRef, id: cacheId, role: "tabpanel", "aria-labelledby": id && `${id}-tab-${tabKey}`, "aria-hidden": !active, style: Object.assign(Object.assign({}, mergedStyle), style2), className: (0, import_classnames31.default)(`${prefixCls}-tabpane`, active && `${prefixCls}-tabpane-active`, className) }, (active || this.visited || forceRender) && renderChildren);
  }
  componentDidMount() {
    this.updateCache();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.updateCache();
  }
  componentWillUnmount() {
    if (this._cache) {
      this.context.removeTabCache(this._cache.id, this);
    }
  }
};
DockTabPane.contextType = DockContextType;

// ../../node_modules/rc-dock/es/Algorithm.js
var _watchObjectChange = /* @__PURE__ */ new WeakMap();
function getUpdatedObject(obj) {
  let result = _watchObjectChange.get(obj);
  if (result) {
    return getUpdatedObject(result);
  }
  return obj;
}
function clearObjectCache() {
  _watchObjectChange = /* @__PURE__ */ new WeakMap();
}
function clone2(value, extra) {
  let newValue = Object.assign(Object.assign({}, value), extra);
  if (Array.isArray(newValue.tabs)) {
    newValue.tabs = newValue.tabs.concat();
  }
  if (Array.isArray(newValue.children)) {
    newValue.children = newValue.children.concat();
  }
  _watchObjectChange.set(value, newValue);
  return newValue;
}
function maxFlex(currentFlex, newFlex) {
  if (currentFlex == null) {
    return newFlex;
  }
  return Math.max(currentFlex, newFlex);
}
function mergeFlex(currentFlex, newFlex) {
  if (currentFlex == null) {
    return newFlex;
  }
  if (currentFlex === newFlex) {
    return newFlex;
  }
  if (currentFlex >= 1) {
    if (newFlex <= 1) {
      return 1;
    }
    return Math.min(currentFlex, newFlex);
  } else {
    if (newFlex >= 1) {
      return 1;
    }
    return Math.max(currentFlex, newFlex);
  }
}
var _idCount = 0;
function nextId() {
  ++_idCount;
  return `+${_idCount}`;
}
var _zCount = 0;
function nextZIndex(current) {
  if (current === _zCount) {
    return current;
  }
  return ++_zCount;
}
function findInPanel(panel, id, filter) {
  if (panel.id === id && filter & Filter.Panel) {
    return panel;
  }
  if (filter & Filter.Tab) {
    for (let tab of panel.tabs) {
      if (tab.id === id) {
        return tab;
      }
    }
  }
  return null;
}
function findInBox(box, id, filter) {
  let result;
  if (filter | Filter.Box && box.id === id) {
    return box;
  }
  for (let child of box.children) {
    if ("children" in child) {
      if (result = findInBox(child, id, filter)) {
        break;
      }
    } else if ("tabs" in child) {
      if (result = findInPanel(child, id, filter)) {
        break;
      }
    }
  }
  return result;
}
var Filter;
(function(Filter2) {
  Filter2[Filter2["Tab"] = 1] = "Tab";
  Filter2[Filter2["Panel"] = 2] = "Panel";
  Filter2[Filter2["Box"] = 4] = "Box";
  Filter2[Filter2["Docked"] = 8] = "Docked";
  Filter2[Filter2["Floated"] = 16] = "Floated";
  Filter2[Filter2["Windowed"] = 32] = "Windowed";
  Filter2[Filter2["Max"] = 64] = "Max";
  Filter2[Filter2["EveryWhere"] = 120] = "EveryWhere";
  Filter2[Filter2["AnyTab"] = 121] = "AnyTab";
  Filter2[Filter2["AnyPanel"] = 122] = "AnyPanel";
  Filter2[Filter2["AnyTabPanel"] = 123] = "AnyTabPanel";
  Filter2[Filter2["All"] = 127] = "All";
})(Filter || (Filter = {}));
function find(layout, id, filter = Filter.AnyTabPanel) {
  let result;
  if (filter & Filter.Docked) {
    result = findInBox(layout.dockbox, id, filter);
  }
  if (result)
    return result;
  if (filter & Filter.Floated) {
    result = findInBox(layout.floatbox, id, filter);
  }
  if (result)
    return result;
  if (filter & Filter.Windowed) {
    result = findInBox(layout.windowbox, id, filter);
  }
  if (result)
    return result;
  if (filter & Filter.Max) {
    result = findInBox(layout.maxbox, id, filter);
  }
  return result;
}
function addNextToTab(layout, source, target, direction) {
  let pos = target.parent.tabs.indexOf(target);
  if (pos >= 0) {
    if (direction === "after-tab") {
      ++pos;
    }
    return addTabToPanel(layout, source, target.parent, pos);
  }
  return layout;
}
function addTabToPanel(layout, source, panel, idx = -1) {
  if (idx === -1) {
    idx = panel.tabs.length;
  }
  let tabs;
  let activeId;
  if ("tabs" in source) {
    tabs = source.tabs;
    activeId = source.activeId;
  } else {
    tabs = [source];
  }
  if (tabs.length) {
    let newPanel = clone2(panel);
    newPanel.tabs.splice(idx, 0, ...tabs);
    newPanel.activeId = tabs[tabs.length - 1].id;
    for (let tab of tabs) {
      tab.parent = newPanel;
    }
    if (activeId) {
      newPanel.activeId = activeId;
    }
    layout = replacePanel(layout, panel, newPanel);
  }
  return layout;
}
function converToPanel(source) {
  if ("tabs" in source) {
    return source;
  } else {
    let newPanel = { tabs: [source], group: source.group, activeId: source.id };
    source.parent = newPanel;
    return newPanel;
  }
}
function dockPanelToPanel(layout, newPanel, panel, direction) {
  let box = panel.parent;
  let dockMode = direction === "left" || direction === "right" ? "horizontal" : "vertical";
  let afterPanel = direction === "bottom" || direction === "right";
  let pos = box.children.indexOf(panel);
  if (pos >= 0) {
    let newBox = clone2(box);
    if (dockMode === box.mode) {
      if (afterPanel) {
        ++pos;
      }
      panel.size *= 0.5;
      newPanel.size = panel.size;
      newBox.children.splice(pos, 0, newPanel);
    } else {
      let newChildBox = { mode: dockMode, children: [] };
      newChildBox.size = panel.size;
      if (afterPanel) {
        newChildBox.children = [panel, newPanel];
      } else {
        newChildBox.children = [newPanel, panel];
      }
      panel.parent = newChildBox;
      panel.size = 200;
      newPanel.parent = newChildBox;
      newPanel.size = 200;
      newBox.children[pos] = newChildBox;
      newChildBox.parent = newBox;
    }
    return replaceBox(layout, box, newBox);
  }
  return layout;
}
function dockPanelToBox(layout, newPanel, box, direction) {
  let parentBox = box.parent;
  let dockMode = direction === "left" || direction === "right" ? "horizontal" : "vertical";
  let afterPanel = direction === "bottom" || direction === "right";
  if (parentBox) {
    let pos = parentBox.children.indexOf(box);
    if (pos >= 0) {
      let newParentBox = clone2(parentBox);
      if (dockMode === parentBox.mode) {
        if (afterPanel) {
          ++pos;
        }
        newPanel.size = box.size * 0.3;
        box.size *= 0.7;
        newParentBox.children.splice(pos, 0, newPanel);
      } else {
        let newChildBox = { mode: dockMode, children: [] };
        newChildBox.size = box.size;
        if (afterPanel) {
          newChildBox.children = [box, newPanel];
        } else {
          newChildBox.children = [newPanel, box];
        }
        box.parent = newChildBox;
        box.size = 280;
        newPanel.parent = newChildBox;
        newPanel.size = 120;
        newParentBox.children[pos] = newChildBox;
      }
      return replaceBox(layout, parentBox, newParentBox);
    }
  } else if (box === layout.dockbox) {
    let newBox = clone2(box);
    if (dockMode === box.mode) {
      let pos = 0;
      if (afterPanel) {
        pos = newBox.children.length;
      }
      newPanel.size = box.size * 0.3;
      box.size *= 0.7;
      newBox.children.splice(pos, 0, newPanel);
      return replaceBox(layout, box, newBox);
    } else {
      let newDockBox = { mode: dockMode, children: [] };
      newDockBox.size = box.size;
      if (afterPanel) {
        newDockBox.children = [newBox, newPanel];
      } else {
        newDockBox.children = [newPanel, newBox];
      }
      newBox.size = 280;
      newPanel.size = 120;
      return replaceBox(layout, box, newDockBox);
    }
  } else if (box === layout.maxbox) {
    let newBox = clone2(box);
    newBox.children.push(newPanel);
    return replaceBox(layout, box, newBox);
  }
  return layout;
}
function floatPanel(layout, newPanel, rect) {
  let newBox = clone2(layout.floatbox);
  if (rect) {
    newPanel.x = rect.left;
    newPanel.y = rect.top;
    newPanel.w = rect.width;
    newPanel.h = rect.height;
  }
  newBox.children.push(newPanel);
  return replaceBox(layout, layout.floatbox, newBox);
}
function panelToWindow(layout, newPanel) {
  let newBox = clone2(layout.windowbox);
  newBox.children.push(newPanel);
  return replaceBox(layout, layout.windowbox, newBox);
}
function removeFromLayout(layout, source) {
  if (source) {
    let panelData;
    if ("tabs" in source) {
      panelData = source;
      layout = removePanel(layout, panelData);
    } else {
      panelData = source.parent;
      layout = removeTab(layout, source);
    }
    if (panelData && panelData.parent && panelData.parent.mode === "maximize") {
      let newPanel = layout.maxbox.children[0];
      if (!newPanel || newPanel.tabs.length === 0 && !newPanel.panelLock) {
        let placeHolder = find(layout, maximePlaceHolderId);
        if (placeHolder) {
          return removePanel(layout, placeHolder);
        }
      }
    }
  }
  return layout;
}
function removePanel(layout, panel) {
  let box = panel.parent;
  if (box) {
    let pos = box.children.indexOf(panel);
    if (pos >= 0) {
      let newBox = clone2(box);
      newBox.children.splice(pos, 1);
      return replaceBox(layout, box, newBox);
    }
  }
  return layout;
}
function removeTab(layout, tab) {
  let panel = tab.parent;
  if (panel) {
    let pos = panel.tabs.indexOf(tab);
    if (pos >= 0) {
      let newPanel = clone2(panel);
      newPanel.tabs.splice(pos, 1);
      if (newPanel.activeId === tab.id) {
        if (newPanel.tabs.length > pos) {
          newPanel.activeId = newPanel.tabs[pos].id;
        } else if (newPanel.tabs.length) {
          newPanel.activeId = newPanel.tabs[0].id;
        }
      }
      return replacePanel(layout, panel, newPanel);
    }
  }
  return layout;
}
function moveToFront(layout, source) {
  if (source) {
    let panelData;
    let needUpdate = false;
    let changes = {};
    if ("tabs" in source) {
      panelData = source;
    } else {
      panelData = source.parent;
      if (panelData.activeId !== source.id) {
        changes.activeId = source.id;
        needUpdate = true;
      }
    }
    if (panelData && panelData.parent && panelData.parent.mode === "float") {
      let newZ = nextZIndex(panelData.z);
      if (newZ !== panelData.z) {
        changes.z = newZ;
        needUpdate = true;
      }
    }
    if (needUpdate) {
      layout = replacePanel(layout, panelData, clone2(panelData, changes));
    }
  }
  return layout;
}
function maximize(layout, source) {
  if (source) {
    if ("tabs" in source) {
      if (source.parent.mode === "maximize") {
        return restorePanel(layout, source);
      } else {
        return maximizePanel(layout, source);
      }
    } else {
      return maximizeTab(layout, source);
    }
  }
  return layout;
}
function maximizePanel(layout, panel) {
  let maxbox = layout.maxbox;
  if (maxbox.children.length) {
    return layout;
  }
  let placeHodlerPanel = Object.assign(Object.assign({}, panel), { id: maximePlaceHolderId, tabs: [], panelLock: {} });
  layout = replacePanel(layout, panel, placeHodlerPanel);
  layout = dockPanelToBox(layout, panel, layout.maxbox, "middle");
  return layout;
}
function restorePanel(layout, panel) {
  layout = removePanel(layout, panel);
  let placeHolder = find(layout, maximePlaceHolderId);
  if (placeHolder) {
    let { x, y, z, w, h } = placeHolder;
    panel = Object.assign(Object.assign({}, panel), { x, y, z, w, h });
    return replacePanel(layout, placeHolder, panel);
  } else {
    return dockPanelToBox(layout, panel, layout.dockbox, "right");
  }
}
function maximizeTab(layout, tab) {
  return layout;
}
function fixFloatPanelPos(layout, layoutWidth, layoutHeight) {
  let layoutChanged = false;
  if (layout && layout.floatbox && layoutWidth > 200 && layoutHeight > 200) {
    let newFloatChildren = layout.floatbox.children.concat();
    for (let i = 0; i < newFloatChildren.length; ++i) {
      let panel = newFloatChildren[i];
      let panelChange = {};
      if (panel.w > layoutWidth) {
        panelChange.w = layoutWidth;
      }
      if (panel.h > layoutHeight) {
        panelChange.h = layoutHeight;
      }
      if (panel.y > layoutHeight - 16) {
        panelChange.y = Math.max(layoutHeight - 16 - (panel.h >> 1), 0);
      } else if (panel.y < 0) {
        panelChange.y = 0;
      }
      if (panel.x + panel.w < 16) {
        panelChange.x = 16 - (panel.w >> 1);
      } else if (panel.x > layoutWidth - 16) {
        panelChange.x = layoutWidth - 16 - (panel.w >> 1);
      }
      if (Object.keys(panelChange).length) {
        newFloatChildren[i] = clone2(panel, panelChange);
        layoutChanged = true;
      }
    }
    if (layoutChanged) {
      let newBox = clone2(layout.floatbox);
      newBox.children = newFloatChildren;
      return replaceBox(layout, layout.floatbox, newBox);
    }
  }
  return layout;
}
function fixLayoutData(layout, groups, loadTab) {
  function fixPanelOrBox(d) {
    if (d.id == null) {
      d.id = nextId();
    } else if (d.id.startsWith("+")) {
      let idnum = Number(d.id);
      if (idnum > _idCount) {
        _idCount = idnum;
      }
    }
    if (!(d.size >= 0)) {
      d.size = 200;
    }
    d.minWidth = 0;
    d.minHeight = 0;
    d.widthFlex = null;
    d.heightFlex = null;
  }
  function fixPanelData(panel) {
    fixPanelOrBox(panel);
    let findActiveId = false;
    if (loadTab) {
      for (let i = 0; i < panel.tabs.length; ++i) {
        panel.tabs[i] = loadTab(panel.tabs[i]);
      }
    }
    if (panel.group == null && panel.tabs.length) {
      panel.group = panel.tabs[0].group;
    }
    let tabGroup = groups === null || groups === void 0 ? void 0 : groups[panel.group];
    if (tabGroup) {
      if (tabGroup.widthFlex != null) {
        panel.widthFlex = tabGroup.widthFlex;
      }
      if (tabGroup.heightFlex != null) {
        panel.heightFlex = tabGroup.heightFlex;
      }
    }
    for (let child of panel.tabs) {
      child.parent = panel;
      if (child.id === panel.activeId) {
        findActiveId = true;
      }
      if (child.minWidth > panel.minWidth)
        panel.minWidth = child.minWidth;
      if (child.minHeight > panel.minHeight)
        panel.minHeight = child.minHeight;
    }
    if (!findActiveId && panel.tabs.length) {
      panel.activeId = panel.tabs[0].id;
    }
    if (panel.minWidth <= 0) {
      panel.minWidth = 1;
    }
    if (panel.minHeight <= 0) {
      panel.minHeight = 1;
    }
    let { panelLock } = panel;
    if (panelLock) {
      if (panel.minWidth < panelLock.minWidth) {
        panel.minWidth = panelLock.minWidth;
      }
      if (panel.minHeight < panelLock.minHeight) {
        panel.minHeight = panelLock.minHeight;
      }
      if (panel.panelLock.widthFlex != null) {
        panel.widthFlex = panelLock.widthFlex;
      }
      if (panel.panelLock.heightFlex != null) {
        panel.heightFlex = panelLock.heightFlex;
      }
    }
    if (panel.z > _zCount) {
      _zCount = panel.z;
    }
    return panel;
  }
  function fixBoxData(box) {
    fixPanelOrBox(box);
    for (let i = 0; i < box.children.length; ++i) {
      let child = box.children[i];
      child.parent = box;
      if ("children" in child) {
        fixBoxData(child);
        if (child.children.length === 0) {
          box.children.splice(i, 1);
          --i;
        } else if (child.children.length === 1) {
          let subChild = child.children[0];
          if (subChild.mode === box.mode) {
            let totalSubSize = 0;
            for (let subsubChild of subChild.children) {
              totalSubSize += subsubChild.size;
            }
            let sizeScale = child.size / totalSubSize;
            for (let subsubChild of subChild.children) {
              subsubChild.size *= sizeScale;
            }
            box.children.splice(i, 1, ...subChild.children);
          } else {
            subChild.size = child.size;
            box.children[i] = subChild;
          }
          --i;
        }
      } else if ("tabs" in child) {
        fixPanelData(child);
        if (child.tabs.length === 0) {
          if (!child.panelLock) {
            box.children.splice(i, 1);
            --i;
          } else if (child.group === placeHolderStyle && (box.children.length > 1 || box.parent)) {
            box.children.splice(i, 1);
            --i;
          }
        }
      }
      switch (box.mode) {
        case "horizontal":
          if (child.minWidth > 0)
            box.minWidth += child.minWidth;
          if (child.minHeight > box.minHeight)
            box.minHeight = child.minHeight;
          if (child.widthFlex != null) {
            box.widthFlex = maxFlex(box.widthFlex, child.widthFlex);
          }
          if (child.heightFlex != null) {
            box.heightFlex = mergeFlex(box.heightFlex, child.heightFlex);
          }
          break;
        case "vertical":
          if (child.minWidth > box.minWidth)
            box.minWidth = child.minWidth;
          if (child.minHeight > 0)
            box.minHeight += child.minHeight;
          if (child.heightFlex != null) {
            box.heightFlex = maxFlex(box.heightFlex, child.heightFlex);
          }
          if (child.widthFlex != null) {
            box.widthFlex = mergeFlex(box.widthFlex, child.widthFlex);
          }
          break;
      }
    }
    if (box.children.length > 1) {
      switch (box.mode) {
        case "horizontal":
          box.minWidth += (box.children.length - 1) * 4;
          break;
        case "vertical":
          box.minHeight += (box.children.length - 1) * 4;
          break;
      }
    }
    return box;
  }
  if (layout.floatbox) {
    layout.floatbox.mode = "float";
  } else {
    layout.floatbox = { mode: "float", children: [], size: 1 };
  }
  if (layout.windowbox) {
    layout.windowbox.mode = "window";
  } else {
    layout.windowbox = { mode: "window", children: [], size: 1 };
  }
  if (layout.maxbox) {
    layout.maxbox.mode = "maximize";
  } else {
    layout.maxbox = { mode: "maximize", children: [], size: 1 };
  }
  fixBoxData(layout.dockbox);
  fixBoxData(layout.floatbox);
  fixBoxData(layout.windowbox);
  fixBoxData(layout.maxbox);
  if (layout.dockbox.children.length === 0) {
    let newPanel = { id: "+0", group: placeHolderStyle, panelLock: {}, size: 200, tabs: [] };
    newPanel.parent = layout.dockbox;
    layout.dockbox.children.push(newPanel);
  } else {
    while (layout.dockbox.children.length === 1 && "children" in layout.dockbox.children[0]) {
      let newDockBox = clone2(layout.dockbox.children[0]);
      layout.dockbox = newDockBox;
      for (let child of newDockBox.children) {
        child.parent = newDockBox;
      }
    }
  }
  layout.dockbox.parent = null;
  layout.floatbox.parent = null;
  layout.windowbox.parent = null;
  layout.maxbox.parent = null;
  clearObjectCache();
  return layout;
}
function replacePanel(layout, panel, newPanel) {
  for (let tab of newPanel.tabs) {
    tab.parent = newPanel;
  }
  let box = panel.parent;
  if (box) {
    let pos = box.children.indexOf(panel);
    if (pos >= 0) {
      let newBox = clone2(box);
      newBox.children[pos] = newPanel;
      return replaceBox(layout, box, newBox);
    }
  }
  return layout;
}
function replaceBox(layout, box, newBox) {
  for (let child of newBox.children) {
    child.parent = newBox;
  }
  let parentBox = box.parent;
  if (parentBox) {
    let pos = parentBox.children.indexOf(box);
    if (pos >= 0) {
      let newParentBox = clone2(parentBox);
      newParentBox.children[pos] = newBox;
      return replaceBox(layout, parentBox, newParentBox);
    }
  } else {
    if (box.id === layout.dockbox.id || box === layout.dockbox) {
      return Object.assign(Object.assign({}, layout), { dockbox: newBox });
    } else if (box.id === layout.floatbox.id || box === layout.floatbox) {
      return Object.assign(Object.assign({}, layout), { floatbox: newBox });
    } else if (box.id === layout.windowbox.id || box === layout.windowbox) {
      return Object.assign(Object.assign({}, layout), { windowbox: newBox });
    } else if (box.id === layout.maxbox.id || box === layout.maxbox) {
      return Object.assign(Object.assign({}, layout), { maxbox: newBox });
    }
  }
  return layout;
}
function getFloatPanelSize(panel, tabGroup) {
  if (!panel) {
    return [300, 300];
  }
  let panelWidth = panel.offsetWidth;
  let panelHeight = panel.offsetHeight;
  let [minWidth, maxWidth] = tabGroup.preferredFloatWidth || [100, 600];
  let [minHeight, maxHeight] = tabGroup.preferredFloatHeight || [50, 500];
  if (!(panelWidth >= minWidth)) {
    panelWidth = minWidth;
  } else if (!(panelWidth <= maxWidth)) {
    panelWidth = maxWidth;
  }
  if (!(panelHeight >= minHeight)) {
    panelHeight = minHeight;
  } else if (!(panelHeight <= maxHeight)) {
    panelHeight = maxHeight;
  }
  return [panelWidth, panelHeight];
}
function findNearestPanel(rectFrom, rectTo, direction) {
  let distance = -1;
  let overlap = -1;
  let alignment = 0;
  switch (direction) {
    case "ArrowUp": {
      distance = rectFrom.top - rectTo.bottom + rectFrom.height;
      overlap = Math.min(rectFrom.right, rectTo.right) - Math.max(rectFrom.left, rectTo.left);
      break;
    }
    case "ArrowDown": {
      distance = rectTo.top - rectFrom.bottom + rectFrom.height;
      overlap = Math.min(rectFrom.right, rectTo.right) - Math.max(rectFrom.left, rectTo.left);
      break;
    }
    case "ArrowLeft": {
      distance = rectFrom.left - rectTo.right + rectFrom.width;
      overlap = Math.min(rectFrom.bottom, rectTo.bottom) - Math.max(rectFrom.top, rectTo.top);
      alignment = Math.abs(rectFrom.top - rectTo.top);
      break;
    }
    case "ArrowRight": {
      distance = rectTo.left - rectFrom.right + rectFrom.width;
      overlap = Math.min(rectFrom.bottom, rectTo.bottom) - Math.max(rectFrom.top, rectTo.top);
      alignment = Math.abs(rectFrom.top - rectTo.top);
      break;
    }
  }
  if (distance < 0 || overlap <= 0) {
    return -1;
  }
  return distance * (alignment + 1) - overlap * 1e-3;
}

// ../../node_modules/rc-dock/es/WindowBox.js
var import_react36 = __toESM(require_react());

// ../../node_modules/rc-dock/es/WindowPanel.js
var import_react35 = __toESM(require_react());

// ../../node_modules/rc-new-window/es/index.js
var import_react31 = __toESM(require_react());
var import_react_dom7 = __toESM(require_react_dom());
var import_debounce = __toESM(require_debounce());

// ../../node_modules/bowser/src/constants.js
var BROWSER_ALIASES_MAP = {
  "Amazon Silk": "amazon_silk",
  "Android Browser": "android",
  Bada: "bada",
  BlackBerry: "blackberry",
  Chrome: "chrome",
  Chromium: "chromium",
  Electron: "electron",
  Epiphany: "epiphany",
  Firefox: "firefox",
  Focus: "focus",
  Generic: "generic",
  "Google Search": "google_search",
  Googlebot: "googlebot",
  "Internet Explorer": "ie",
  "K-Meleon": "k_meleon",
  Maxthon: "maxthon",
  "Microsoft Edge": "edge",
  "MZ Browser": "mz",
  "NAVER Whale Browser": "naver",
  Opera: "opera",
  "Opera Coast": "opera_coast",
  PhantomJS: "phantomjs",
  Puffin: "puffin",
  QupZilla: "qupzilla",
  QQ: "qq",
  QQLite: "qqlite",
  Safari: "safari",
  Sailfish: "sailfish",
  "Samsung Internet for Android": "samsung_internet",
  SeaMonkey: "seamonkey",
  Sleipnir: "sleipnir",
  Swing: "swing",
  Tizen: "tizen",
  "UC Browser": "uc",
  Vivaldi: "vivaldi",
  "WebOS Browser": "webos",
  WeChat: "wechat",
  "Yandex Browser": "yandex",
  Roku: "roku"
};
var BROWSER_MAP = {
  amazon_silk: "Amazon Silk",
  android: "Android Browser",
  bada: "Bada",
  blackberry: "BlackBerry",
  chrome: "Chrome",
  chromium: "Chromium",
  electron: "Electron",
  epiphany: "Epiphany",
  firefox: "Firefox",
  focus: "Focus",
  generic: "Generic",
  googlebot: "Googlebot",
  google_search: "Google Search",
  ie: "Internet Explorer",
  k_meleon: "K-Meleon",
  maxthon: "Maxthon",
  edge: "Microsoft Edge",
  mz: "MZ Browser",
  naver: "NAVER Whale Browser",
  opera: "Opera",
  opera_coast: "Opera Coast",
  phantomjs: "PhantomJS",
  puffin: "Puffin",
  qupzilla: "QupZilla",
  qq: "QQ Browser",
  qqlite: "QQ Browser Lite",
  safari: "Safari",
  sailfish: "Sailfish",
  samsung_internet: "Samsung Internet for Android",
  seamonkey: "SeaMonkey",
  sleipnir: "Sleipnir",
  swing: "Swing",
  tizen: "Tizen",
  uc: "UC Browser",
  vivaldi: "Vivaldi",
  webos: "WebOS Browser",
  wechat: "WeChat",
  yandex: "Yandex Browser"
};
var PLATFORMS_MAP = {
  tablet: "tablet",
  mobile: "mobile",
  desktop: "desktop",
  tv: "tv"
};
var OS_MAP = {
  WindowsPhone: "Windows Phone",
  Windows: "Windows",
  MacOS: "macOS",
  iOS: "iOS",
  Android: "Android",
  WebOS: "WebOS",
  BlackBerry: "BlackBerry",
  Bada: "Bada",
  Tizen: "Tizen",
  Linux: "Linux",
  ChromeOS: "Chrome OS",
  PlayStation4: "PlayStation 4",
  Roku: "Roku"
};
var ENGINE_MAP = {
  EdgeHTML: "EdgeHTML",
  Blink: "Blink",
  Trident: "Trident",
  Presto: "Presto",
  Gecko: "Gecko",
  WebKit: "WebKit"
};

// ../../node_modules/bowser/src/utils.js
var Utils = class {
  /**
   * Get first matched item for a string
   * @param {RegExp} regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getFirstMatch(regexp, ua) {
    const match = ua.match(regexp);
    return match && match.length > 0 && match[1] || "";
  }
  /**
   * Get second matched item for a string
   * @param regexp
   * @param {String} ua
   * @return {Array|{index: number, input: string}|*|boolean|string}
   */
  static getSecondMatch(regexp, ua) {
    const match = ua.match(regexp);
    return match && match.length > 1 && match[2] || "";
  }
  /**
   * Match a regexp and return a constant or undefined
   * @param {RegExp} regexp
   * @param {String} ua
   * @param {*} _const Any const that will be returned if regexp matches the string
   * @return {*}
   */
  static matchAndReturnConst(regexp, ua, _const) {
    if (regexp.test(ua)) {
      return _const;
    }
    return void 0;
  }
  static getWindowsVersionName(version) {
    switch (version) {
      case "NT":
        return "NT";
      case "XP":
        return "XP";
      case "NT 5.0":
        return "2000";
      case "NT 5.1":
        return "XP";
      case "NT 5.2":
        return "2003";
      case "NT 6.0":
        return "Vista";
      case "NT 6.1":
        return "7";
      case "NT 6.2":
        return "8";
      case "NT 6.3":
        return "8.1";
      case "NT 10.0":
        return "10";
      default:
        return void 0;
    }
  }
  /**
   * Get macOS version name
   *    10.5 - Leopard
   *    10.6 - Snow Leopard
   *    10.7 - Lion
   *    10.8 - Mountain Lion
   *    10.9 - Mavericks
   *    10.10 - Yosemite
   *    10.11 - El Capitan
   *    10.12 - Sierra
   *    10.13 - High Sierra
   *    10.14 - Mojave
   *    10.15 - Catalina
   *
   * @example
   *   getMacOSVersionName("10.14") // 'Mojave'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getMacOSVersionName(version) {
    const v = version.split(".").splice(0, 2).map((s) => parseInt(s, 10) || 0);
    v.push(0);
    if (v[0] !== 10)
      return void 0;
    switch (v[1]) {
      case 5:
        return "Leopard";
      case 6:
        return "Snow Leopard";
      case 7:
        return "Lion";
      case 8:
        return "Mountain Lion";
      case 9:
        return "Mavericks";
      case 10:
        return "Yosemite";
      case 11:
        return "El Capitan";
      case 12:
        return "Sierra";
      case 13:
        return "High Sierra";
      case 14:
        return "Mojave";
      case 15:
        return "Catalina";
      default:
        return void 0;
    }
  }
  /**
   * Get Android version name
   *    1.5 - Cupcake
   *    1.6 - Donut
   *    2.0 - Eclair
   *    2.1 - Eclair
   *    2.2 - Froyo
   *    2.x - Gingerbread
   *    3.x - Honeycomb
   *    4.0 - Ice Cream Sandwich
   *    4.1 - Jelly Bean
   *    4.4 - KitKat
   *    5.x - Lollipop
   *    6.x - Marshmallow
   *    7.x - Nougat
   *    8.x - Oreo
   *    9.x - Pie
   *
   * @example
   *   getAndroidVersionName("7.0") // 'Nougat'
   *
   * @param  {string} version
   * @return {string} versionName
   */
  static getAndroidVersionName(version) {
    const v = version.split(".").splice(0, 2).map((s) => parseInt(s, 10) || 0);
    v.push(0);
    if (v[0] === 1 && v[1] < 5)
      return void 0;
    if (v[0] === 1 && v[1] < 6)
      return "Cupcake";
    if (v[0] === 1 && v[1] >= 6)
      return "Donut";
    if (v[0] === 2 && v[1] < 2)
      return "Eclair";
    if (v[0] === 2 && v[1] === 2)
      return "Froyo";
    if (v[0] === 2 && v[1] > 2)
      return "Gingerbread";
    if (v[0] === 3)
      return "Honeycomb";
    if (v[0] === 4 && v[1] < 1)
      return "Ice Cream Sandwich";
    if (v[0] === 4 && v[1] < 4)
      return "Jelly Bean";
    if (v[0] === 4 && v[1] >= 4)
      return "KitKat";
    if (v[0] === 5)
      return "Lollipop";
    if (v[0] === 6)
      return "Marshmallow";
    if (v[0] === 7)
      return "Nougat";
    if (v[0] === 8)
      return "Oreo";
    if (v[0] === 9)
      return "Pie";
    return void 0;
  }
  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  static getVersionPrecision(version) {
    return version.split(".").length;
  }
  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
   *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
   *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
   *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
   *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
   *
   * @param {String} versionA versions versions to compare
   * @param {String} versionB versions versions to compare
   * @param {boolean} [isLoose] enable loose comparison
   * @return {Number} comparison result: -1 when versionA is lower,
   * 1 when versionA is bigger, 0 when both equal
   */
  /* eslint consistent-return: 1 */
  static compareVersions(versionA, versionB, isLoose = false) {
    const versionAPrecision = Utils.getVersionPrecision(versionA);
    const versionBPrecision = Utils.getVersionPrecision(versionB);
    let precision = Math.max(versionAPrecision, versionBPrecision);
    let lastPrecision = 0;
    const chunks = Utils.map([versionA, versionB], (version) => {
      const delta = precision - Utils.getVersionPrecision(version);
      const _version = version + new Array(delta + 1).join(".0");
      return Utils.map(_version.split("."), (chunk) => new Array(20 - chunk.length).join("0") + chunk).reverse();
    });
    if (isLoose) {
      lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
    }
    precision -= 1;
    while (precision >= lastPrecision) {
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === lastPrecision) {
          return 0;
        }
        precision -= 1;
      } else if (chunks[0][precision] < chunks[1][precision]) {
        return -1;
      }
    }
    return void 0;
  }
  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  static map(arr, iterator) {
    const result = [];
    let i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i += 1) {
      result.push(iterator(arr[i]));
    }
    return result;
  }
  /**
   * Array::find polyfill
   *
   * @param  {Array} arr
   * @param  {Function} predicate
   * @return {Array}
   */
  static find(arr, predicate) {
    let i;
    let l;
    if (Array.prototype.find) {
      return Array.prototype.find.call(arr, predicate);
    }
    for (i = 0, l = arr.length; i < l; i += 1) {
      const value = arr[i];
      if (predicate(value, i)) {
        return value;
      }
    }
    return void 0;
  }
  /**
   * Object::assign polyfill
   *
   * @param  {Object} obj
   * @param  {Object} ...objs
   * @return {Object}
   */
  static assign(obj, ...assigners) {
    const result = obj;
    let i;
    let l;
    if (Object.assign) {
      return Object.assign(obj, ...assigners);
    }
    for (i = 0, l = assigners.length; i < l; i += 1) {
      const assigner = assigners[i];
      if (typeof assigner === "object" && assigner !== null) {
        const keys = Object.keys(assigner);
        keys.forEach((key) => {
          result[key] = assigner[key];
        });
      }
    }
    return obj;
  }
  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('Microsoft Edge') // edge
   *
   * @param  {string} browserName
   * @return {string}
   */
  static getBrowserAlias(browserName) {
    return BROWSER_ALIASES_MAP[browserName];
  }
  /**
   * Get short version/alias for a browser name
   *
   * @example
   *   getBrowserAlias('edge') // Microsoft Edge
   *
   * @param  {string} browserAlias
   * @return {string}
   */
  static getBrowserTypeByAlias(browserAlias) {
    return BROWSER_MAP[browserAlias] || "";
  }
};

// ../../node_modules/bowser/src/parser-browsers.js
var commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;
var browsersList = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe(ua) {
      const browser2 = {
        name: "Googlebot"
      };
      const version = Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* Opera < 13.0 */
  {
    test: [/opera/i],
    describe(ua) {
      const browser2 = {
        name: "Opera"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* Opera > 13.0 */
  {
    test: [/opr\/|opios/i],
    describe(ua) {
      const browser2 = {
        name: "Opera"
      };
      const version = Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/SamsungBrowser/i],
    describe(ua) {
      const browser2 = {
        name: "Samsung Internet for Android"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/Whale/i],
    describe(ua) {
      const browser2 = {
        name: "NAVER Whale Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/MZBrowser/i],
    describe(ua) {
      const browser2 = {
        name: "MZ Browser"
      };
      const version = Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/focus/i],
    describe(ua) {
      const browser2 = {
        name: "Focus"
      };
      const version = Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/swing/i],
    describe(ua) {
      const browser2 = {
        name: "Swing"
      };
      const version = Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/coast/i],
    describe(ua) {
      const browser2 = {
        name: "Opera Coast"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/opt\/\d+(?:.?_?\d+)+/i],
    describe(ua) {
      const browser2 = {
        name: "Opera Touch"
      };
      const version = Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/yabrowser/i],
    describe(ua) {
      const browser2 = {
        name: "Yandex Browser"
      };
      const version = Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/ucbrowser/i],
    describe(ua) {
      const browser2 = {
        name: "UC Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/Maxthon|mxios/i],
    describe(ua) {
      const browser2 = {
        name: "Maxthon"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/epiphany/i],
    describe(ua) {
      const browser2 = {
        name: "Epiphany"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/puffin/i],
    describe(ua) {
      const browser2 = {
        name: "Puffin"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/sleipnir/i],
    describe(ua) {
      const browser2 = {
        name: "Sleipnir"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/k-meleon/i],
    describe(ua) {
      const browser2 = {
        name: "K-Meleon"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/micromessenger/i],
    describe(ua) {
      const browser2 = {
        name: "WeChat"
      };
      const version = Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/qqbrowser/i],
    describe(ua) {
      const browser2 = {
        name: /qqbrowserlite/i.test(ua) ? "QQ Browser Lite" : "QQ Browser"
      };
      const version = Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/msie|trident/i],
    describe(ua) {
      const browser2 = {
        name: "Internet Explorer"
      };
      const version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/\sedg\//i],
    describe(ua) {
      const browser2 = {
        name: "Microsoft Edge"
      };
      const version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/edg([ea]|ios)/i],
    describe(ua) {
      const browser2 = {
        name: "Microsoft Edge"
      };
      const version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/vivaldi/i],
    describe(ua) {
      const browser2 = {
        name: "Vivaldi"
      };
      const version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/seamonkey/i],
    describe(ua) {
      const browser2 = {
        name: "SeaMonkey"
      };
      const version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/sailfish/i],
    describe(ua) {
      const browser2 = {
        name: "Sailfish"
      };
      const version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/silk/i],
    describe(ua) {
      const browser2 = {
        name: "Amazon Silk"
      };
      const version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/phantom/i],
    describe(ua) {
      const browser2 = {
        name: "PhantomJS"
      };
      const version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/slimerjs/i],
    describe(ua) {
      const browser2 = {
        name: "SlimerJS"
      };
      const version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const browser2 = {
        name: "BlackBerry"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const browser2 = {
        name: "WebOS Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/bada/i],
    describe(ua) {
      const browser2 = {
        name: "Bada"
      };
      const version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/tizen/i],
    describe(ua) {
      const browser2 = {
        name: "Tizen"
      };
      const version = Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/qupzilla/i],
    describe(ua) {
      const browser2 = {
        name: "QupZilla"
      };
      const version = Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/firefox|iceweasel|fxios/i],
    describe(ua) {
      const browser2 = {
        name: "Firefox"
      };
      const version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/electron/i],
    describe(ua) {
      const browser2 = {
        name: "Electron"
      };
      const version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/MiuiBrowser/i],
    describe(ua) {
      const browser2 = {
        name: "Miui"
      };
      const version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/chromium/i],
    describe(ua) {
      const browser2 = {
        name: "Chromium"
      };
      const version = Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/chrome|crios|crmo/i],
    describe(ua) {
      const browser2 = {
        name: "Chrome"
      };
      const version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  {
    test: [/GSA/i],
    describe(ua) {
      const browser2 = {
        name: "Google Search"
      };
      const version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* Android Browser */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const browser2 = {
        name: "Android Browser"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* PlayStation 4 */
  {
    test: [/playstation 4/i],
    describe(ua) {
      const browser2 = {
        name: "PlayStation 4"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* Safari */
  {
    test: [/safari|applewebkit/i],
    describe(ua) {
      const browser2 = {
        name: "Safari"
      };
      const version = Utils.getFirstMatch(commonVersionIdentifier, ua);
      if (version) {
        browser2.version = version;
      }
      return browser2;
    }
  },
  /* Something else */
  {
    test: [/.*/i],
    describe(ua) {
      const regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
      const regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
      const hasDeviceSpec = ua.search("\\(") !== -1;
      const regexp = hasDeviceSpec ? regexpWithDeviceSpec : regexpWithoutDeviceSpec;
      return {
        name: Utils.getFirstMatch(regexp, ua),
        version: Utils.getSecondMatch(regexp, ua)
      };
    }
  }
];
var parser_browsers_default = browsersList;

// ../../node_modules/bowser/src/parser-os.js
var parser_os_default = [
  /* Roku */
  {
    test: [/Roku\/DVP/],
    describe(ua) {
      const version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua);
      return {
        name: OS_MAP.Roku,
        version
      };
    }
  },
  /* Windows Phone */
  {
    test: [/windows phone/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.WindowsPhone,
        version
      };
    }
  },
  /* Windows */
  {
    test: [/windows /i],
    describe(ua) {
      const version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua);
      const versionName = Utils.getWindowsVersionName(version);
      return {
        name: OS_MAP.Windows,
        version,
        versionName
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe(ua) {
      const result = {
        name: OS_MAP.iOS
      };
      const version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua);
      if (version) {
        result.version = version;
      }
      return result;
    }
  },
  /* macOS */
  {
    test: [/macintosh/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, ".");
      const versionName = Utils.getMacOSVersionName(version);
      const os = {
        name: OS_MAP.MacOS,
        version
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    }
  },
  /* iOS */
  {
    test: [/(ipod|iphone|ipad)/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, ".");
      return {
        name: OS_MAP.iOS,
        version
      };
    }
  },
  /* Android */
  {
    test(parser) {
      const notLikeAndroid = !parser.test(/like android/i);
      const butAndroid = parser.test(/android/i);
      return notLikeAndroid && butAndroid;
    },
    describe(ua) {
      const version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua);
      const versionName = Utils.getAndroidVersionName(version);
      const os = {
        name: OS_MAP.Android,
        version
      };
      if (versionName) {
        os.versionName = versionName;
      }
      return os;
    }
  },
  /* WebOS */
  {
    test: [/(web|hpw)[o0]s/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua);
      const os = {
        name: OS_MAP.WebOS
      };
      if (version && version.length) {
        os.version = version;
      }
      return os;
    }
  },
  /* BlackBerry */
  {
    test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua) || Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua) || Utils.getFirstMatch(/\bbb(\d+)/i, ua);
      return {
        name: OS_MAP.BlackBerry,
        version
      };
    }
  },
  /* Bada */
  {
    test: [/bada/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Bada,
        version
      };
    }
  },
  /* Tizen */
  {
    test: [/tizen/i],
    describe(ua) {
      const version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.Tizen,
        version
      };
    }
  },
  /* Linux */
  {
    test: [/linux/i],
    describe() {
      return {
        name: OS_MAP.Linux
      };
    }
  },
  /* Chrome OS */
  {
    test: [/CrOS/],
    describe() {
      return {
        name: OS_MAP.ChromeOS
      };
    }
  },
  /* Playstation 4 */
  {
    test: [/PlayStation 4/],
    describe(ua) {
      const version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua);
      return {
        name: OS_MAP.PlayStation4,
        version
      };
    }
  }
];

// ../../node_modules/bowser/src/parser-platforms.js
var parser_platforms_default = [
  /* Googlebot */
  {
    test: [/googlebot/i],
    describe() {
      return {
        type: "bot",
        vendor: "Google"
      };
    }
  },
  /* Huawei */
  {
    test: [/huawei/i],
    describe(ua) {
      const model = Utils.getFirstMatch(/(can-l01)/i, ua) && "Nova";
      const platform = {
        type: PLATFORMS_MAP.mobile,
        vendor: "Huawei"
      };
      if (model) {
        platform.model = model;
      }
      return platform;
    }
  },
  /* Nexus Tablet */
  {
    test: [/nexus\s*(?:7|8|9|10).*/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Nexus"
      };
    }
  },
  /* iPad */
  {
    test: [/ipad/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Apple",
        model: "iPad"
      };
    }
  },
  /* Firefox on iPad */
  {
    test: [/Macintosh(.*?) FxiOS(.*?)\//],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Apple",
        model: "iPad"
      };
    }
  },
  /* Amazon Kindle Fire */
  {
    test: [/kftt build/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Amazon",
        model: "Kindle Fire HD 7"
      };
    }
  },
  /* Another Amazon Tablet with Silk */
  {
    test: [/silk/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet,
        vendor: "Amazon"
      };
    }
  },
  /* Tablet */
  {
    test: [/tablet(?! pc)/i],
    describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* iPod/iPhone */
  {
    test(parser) {
      const iDevice = parser.test(/ipod|iphone/i);
      const likeIDevice = parser.test(/like (ipod|iphone)/i);
      return iDevice && !likeIDevice;
    },
    describe(ua) {
      const model = Utils.getFirstMatch(/(ipod|iphone)/i, ua);
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Apple",
        model
      };
    }
  },
  /* Nexus Mobile */
  {
    test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Nexus"
      };
    }
  },
  /* Mobile */
  {
    test: [/[^-]mobi/i],
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* BlackBerry */
  {
    test(parser) {
      return parser.getBrowserName(true) === "blackberry";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "BlackBerry"
      };
    }
  },
  /* Bada */
  {
    test(parser) {
      return parser.getBrowserName(true) === "bada";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* Windows Phone */
  {
    test(parser) {
      return parser.getBrowserName() === "windows phone";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile,
        vendor: "Microsoft"
      };
    }
  },
  /* Android Tablet */
  {
    test(parser) {
      const osMajorVersion = Number(String(parser.getOSVersion()).split(".")[0]);
      return parser.getOSName(true) === "android" && osMajorVersion >= 3;
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tablet
      };
    }
  },
  /* Android Mobile */
  {
    test(parser) {
      return parser.getOSName(true) === "android";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.mobile
      };
    }
  },
  /* desktop */
  {
    test(parser) {
      return parser.getOSName(true) === "macos";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop,
        vendor: "Apple"
      };
    }
  },
  /* Windows */
  {
    test(parser) {
      return parser.getOSName(true) === "windows";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* Linux */
  {
    test(parser) {
      return parser.getOSName(true) === "linux";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.desktop
      };
    }
  },
  /* PlayStation 4 */
  {
    test(parser) {
      return parser.getOSName(true) === "playstation 4";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  },
  /* Roku */
  {
    test(parser) {
      return parser.getOSName(true) === "roku";
    },
    describe() {
      return {
        type: PLATFORMS_MAP.tv
      };
    }
  }
];

// ../../node_modules/bowser/src/parser-engines.js
var parser_engines_default = [
  /* EdgeHTML */
  {
    test(parser) {
      return parser.getBrowserName(true) === "microsoft edge";
    },
    describe(ua) {
      const isBlinkBased = /\sedg\//i.test(ua);
      if (isBlinkBased) {
        return {
          name: ENGINE_MAP.Blink
        };
      }
      const version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua);
      return {
        name: ENGINE_MAP.EdgeHTML,
        version
      };
    }
  },
  /* Trident */
  {
    test: [/trident/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Trident
      };
      const version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Presto */
  {
    test(parser) {
      return parser.test(/presto/i);
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Presto
      };
      const version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Gecko */
  {
    test(parser) {
      const isGecko = parser.test(/gecko/i);
      const likeGecko = parser.test(/like gecko/i);
      return isGecko && !likeGecko;
    },
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.Gecko
      };
      const version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  },
  /* Blink */
  {
    test: [/(apple)?webkit\/537\.36/i],
    describe() {
      return {
        name: ENGINE_MAP.Blink
      };
    }
  },
  /* WebKit */
  {
    test: [/(apple)?webkit/i],
    describe(ua) {
      const engine = {
        name: ENGINE_MAP.WebKit
      };
      const version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua);
      if (version) {
        engine.version = version;
      }
      return engine;
    }
  }
];

// ../../node_modules/bowser/src/parser.js
var Parser = class {
  /**
   * Create instance of Parser
   *
   * @param {String} UA User-Agent string
   * @param {Boolean} [skipParsing=false] parser can skip parsing in purpose of performance
   * improvements if you need to make a more particular parsing
   * like {@link Parser#parseBrowser} or {@link Parser#parsePlatform}
   *
   * @throw {Error} in case of empty UA String
   *
   * @constructor
   */
  constructor(UA, skipParsing = false) {
    if (UA === void 0 || UA === null || UA === "") {
      throw new Error("UserAgent parameter can't be empty");
    }
    this._ua = UA;
    this.parsedResult = {};
    if (skipParsing !== true) {
      this.parse();
    }
  }
  /**
   * Get UserAgent string of current Parser instance
   * @return {String} User-Agent String of the current <Parser> object
   *
   * @public
   */
  getUA() {
    return this._ua;
  }
  /**
   * Test a UA string for a regexp
   * @param {RegExp} regex
   * @return {Boolean}
   */
  test(regex) {
    return regex.test(this._ua);
  }
  /**
   * Get parsed browser object
   * @return {Object}
   */
  parseBrowser() {
    this.parsedResult.browser = {};
    const browserDescriptor = Utils.find(parser_browsers_default, (_browser) => {
      if (typeof _browser.test === "function") {
        return _browser.test(this);
      }
      if (_browser.test instanceof Array) {
        return _browser.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (browserDescriptor) {
      this.parsedResult.browser = browserDescriptor.describe(this.getUA());
    }
    return this.parsedResult.browser;
  }
  /**
   * Get parsed browser object
   * @return {Object}
   *
   * @public
   */
  getBrowser() {
    if (this.parsedResult.browser) {
      return this.parsedResult.browser;
    }
    return this.parseBrowser();
  }
  /**
   * Get browser's name
   * @return {String} Browser's name or an empty string
   *
   * @public
   */
  getBrowserName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getBrowser().name).toLowerCase() || "";
    }
    return this.getBrowser().name || "";
  }
  /**
   * Get browser's version
   * @return {String} version of browser
   *
   * @public
   */
  getBrowserVersion() {
    return this.getBrowser().version;
  }
  /**
   * Get OS
   * @return {Object}
   *
   * @example
   * this.getOS();
   * {
   *   name: 'macOS',
   *   version: '10.11.12'
   * }
   */
  getOS() {
    if (this.parsedResult.os) {
      return this.parsedResult.os;
    }
    return this.parseOS();
  }
  /**
   * Parse OS and save it to this.parsedResult.os
   * @return {*|{}}
   */
  parseOS() {
    this.parsedResult.os = {};
    const os = Utils.find(parser_os_default, (_os) => {
      if (typeof _os.test === "function") {
        return _os.test(this);
      }
      if (_os.test instanceof Array) {
        return _os.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (os) {
      this.parsedResult.os = os.describe(this.getUA());
    }
    return this.parsedResult.os;
  }
  /**
   * Get OS name
   * @param {Boolean} [toLowerCase] return lower-cased value
   * @return {String} name of the OS — macOS, Windows, Linux, etc.
   */
  getOSName(toLowerCase) {
    const { name } = this.getOS();
    if (toLowerCase) {
      return String(name).toLowerCase() || "";
    }
    return name || "";
  }
  /**
   * Get OS version
   * @return {String} full version with dots ('10.11.12', '5.6', etc)
   */
  getOSVersion() {
    return this.getOS().version;
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  getPlatform() {
    if (this.parsedResult.platform) {
      return this.parsedResult.platform;
    }
    return this.parsePlatform();
  }
  /**
   * Get platform name
   * @param {Boolean} [toLowerCase=false]
   * @return {*}
   */
  getPlatformType(toLowerCase = false) {
    const { type } = this.getPlatform();
    if (toLowerCase) {
      return String(type).toLowerCase() || "";
    }
    return type || "";
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  parsePlatform() {
    this.parsedResult.platform = {};
    const platform = Utils.find(parser_platforms_default, (_platform) => {
      if (typeof _platform.test === "function") {
        return _platform.test(this);
      }
      if (_platform.test instanceof Array) {
        return _platform.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (platform) {
      this.parsedResult.platform = platform.describe(this.getUA());
    }
    return this.parsedResult.platform;
  }
  /**
   * Get parsed engine
   * @return {{}}
   */
  getEngine() {
    if (this.parsedResult.engine) {
      return this.parsedResult.engine;
    }
    return this.parseEngine();
  }
  /**
   * Get engines's name
   * @return {String} Engines's name or an empty string
   *
   * @public
   */
  getEngineName(toLowerCase) {
    if (toLowerCase) {
      return String(this.getEngine().name).toLowerCase() || "";
    }
    return this.getEngine().name || "";
  }
  /**
   * Get parsed platform
   * @return {{}}
   */
  parseEngine() {
    this.parsedResult.engine = {};
    const engine = Utils.find(parser_engines_default, (_engine) => {
      if (typeof _engine.test === "function") {
        return _engine.test(this);
      }
      if (_engine.test instanceof Array) {
        return _engine.test.some((condition) => this.test(condition));
      }
      throw new Error("Browser's test function is not valid");
    });
    if (engine) {
      this.parsedResult.engine = engine.describe(this.getUA());
    }
    return this.parsedResult.engine;
  }
  /**
   * Parse full information about the browser
   * @returns {Parser}
   */
  parse() {
    this.parseBrowser();
    this.parseOS();
    this.parsePlatform();
    this.parseEngine();
    return this;
  }
  /**
   * Get parsed result
   * @return {ParsedResult}
   */
  getResult() {
    return Utils.assign({}, this.parsedResult);
  }
  /**
   * Check if parsed browser matches certain conditions
   *
   * @param {Object} checkTree It's one or two layered object,
   * which can include a platform or an OS on the first layer
   * and should have browsers specs on the bottom-laying layer
   *
   * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
   * Returns `undefined` when the browser is no described in the checkTree object.
   *
   * @example
   * const browser = Bowser.getParser(window.navigator.userAgent);
   * if (browser.satisfies({chrome: '>118.01.1322' }))
   * // or with os
   * if (browser.satisfies({windows: { chrome: '>118.01.1322' } }))
   * // or with platforms
   * if (browser.satisfies({desktop: { chrome: '>118.01.1322' } }))
   */
  satisfies(checkTree) {
    const platformsAndOSes = {};
    let platformsAndOSCounter = 0;
    const browsers = {};
    let browsersCounter = 0;
    const allDefinitions = Object.keys(checkTree);
    allDefinitions.forEach((key) => {
      const currentDefinition = checkTree[key];
      if (typeof currentDefinition === "string") {
        browsers[key] = currentDefinition;
        browsersCounter += 1;
      } else if (typeof currentDefinition === "object") {
        platformsAndOSes[key] = currentDefinition;
        platformsAndOSCounter += 1;
      }
    });
    if (platformsAndOSCounter > 0) {
      const platformsAndOSNames = Object.keys(platformsAndOSes);
      const OSMatchingDefinition = Utils.find(platformsAndOSNames, (name) => this.isOS(name));
      if (OSMatchingDefinition) {
        const osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);
        if (osResult !== void 0) {
          return osResult;
        }
      }
      const platformMatchingDefinition = Utils.find(
        platformsAndOSNames,
        (name) => this.isPlatform(name)
      );
      if (platformMatchingDefinition) {
        const platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);
        if (platformResult !== void 0) {
          return platformResult;
        }
      }
    }
    if (browsersCounter > 0) {
      const browserNames = Object.keys(browsers);
      const matchingDefinition = Utils.find(browserNames, (name) => this.isBrowser(name, true));
      if (matchingDefinition !== void 0) {
        return this.compareVersion(browsers[matchingDefinition]);
      }
    }
    return void 0;
  }
  /**
   * Check if the browser name equals the passed string
   * @param browserName The string to compare with the browser name
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {boolean}
   */
  isBrowser(browserName, includingAlias = false) {
    const defaultBrowserName = this.getBrowserName().toLowerCase();
    let browserNameLower = browserName.toLowerCase();
    const alias = Utils.getBrowserTypeByAlias(browserNameLower);
    if (includingAlias && alias) {
      browserNameLower = alias.toLowerCase();
    }
    return browserNameLower === defaultBrowserName;
  }
  compareVersion(version) {
    let expectedResults = [0];
    let comparableVersion = version;
    let isLoose = false;
    const currentBrowserVersion = this.getBrowserVersion();
    if (typeof currentBrowserVersion !== "string") {
      return void 0;
    }
    if (version[0] === ">" || version[0] === "<") {
      comparableVersion = version.substr(1);
      if (version[1] === "=") {
        isLoose = true;
        comparableVersion = version.substr(2);
      } else {
        expectedResults = [];
      }
      if (version[0] === ">") {
        expectedResults.push(1);
      } else {
        expectedResults.push(-1);
      }
    } else if (version[0] === "=") {
      comparableVersion = version.substr(1);
    } else if (version[0] === "~") {
      isLoose = true;
      comparableVersion = version.substr(1);
    }
    return expectedResults.indexOf(
      Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)
    ) > -1;
  }
  isOS(osName) {
    return this.getOSName(true) === String(osName).toLowerCase();
  }
  isPlatform(platformType) {
    return this.getPlatformType(true) === String(platformType).toLowerCase();
  }
  isEngine(engineName) {
    return this.getEngineName(true) === String(engineName).toLowerCase();
  }
  /**
   * Is anything? Check if the browser is called "anything",
   * the OS called "anything" or the platform called "anything"
   * @param {String} anything
   * @param [includingAlias=false] The flag showing whether alias will be included into comparison
   * @returns {Boolean}
   */
  is(anything, includingAlias = false) {
    return this.isBrowser(anything, includingAlias) || this.isOS(anything) || this.isPlatform(anything);
  }
  /**
   * Check if any of the given values satisfies this.is(anything)
   * @param {String[]} anythings
   * @returns {Boolean}
   */
  some(anythings = []) {
    return anythings.some((anything) => this.is(anything));
  }
};
var parser_default = Parser;

// ../../node_modules/bowser/src/bowser.js
var Bowser = class {
  /**
   * Creates a {@link Parser} instance
   *
   * @param {String} UA UserAgent string
   * @param {Boolean} [skipParsing=false] Will make the Parser postpone parsing until you ask it
   * explicitly. Same as `skipParsing` for {@link Parser}.
   * @returns {Parser}
   * @throws {Error} when UA is not a String
   *
   * @example
   * const parser = Bowser.getParser(window.navigator.userAgent);
   * const result = parser.getResult();
   */
  static getParser(UA, skipParsing = false) {
    if (typeof UA !== "string") {
      throw new Error("UserAgent should be a string");
    }
    return new parser_default(UA, skipParsing);
  }
  /**
   * Creates a {@link Parser} instance and runs {@link Parser.getResult} immediately
   *
   * @param UA
   * @return {ParsedResult}
   *
   * @example
   * const result = Bowser.parse(window.navigator.userAgent);
   */
  static parse(UA) {
    return new parser_default(UA).getResult();
  }
  static get BROWSER_MAP() {
    return BROWSER_MAP;
  }
  static get ENGINE_MAP() {
    return ENGINE_MAP;
  }
  static get OS_MAP() {
    return OS_MAP;
  }
  static get PLATFORMS_MAP() {
    return PLATFORMS_MAP;
  }
};
var bowser_default = Bowser;

// ../../node_modules/rc-new-window/es/BrowserPopupWindow.js
var browser = typeof window === "object" ? bowser_default.getParser(window.navigator.userAgent) : null;
function gerWindowBorder() {
  switch (browser === null || browser === void 0 ? void 0 : browser.getOSName(true)) {
    case "windows": {
      let result;
      switch (browser.getBrowserName(true)) {
        case "firefox":
          result = [68, 8, 8];
          break;
        case "microsoft edge":
          result = [62, 8, 8];
          break;
        default:
          result = [60, 8, 8];
      }
      if (window.devicePixelRatio > 1) {
        result[0] -= 2;
        result[1] -= 1;
        result[2] -= 1;
      }
      return result;
    }
    case "macos": {
      switch (browser.getBrowserName(true)) {
        case "safari":
          return [22, 0, 0];
        case "firefox":
          return [59, 0, 0];
        default:
          return [51, 0, 0];
      }
    }
  }
  return [60, 8, 8];
}
var isSafari = (browser === null || browser === void 0 ? void 0 : browser.getBrowserName(true)) === "safari";
var popupSupported = (browser === null || browser === void 0 ? void 0 : browser.getPlatformType()) === "desktop";
var popupWindowBorder = gerWindowBorder();

// ../../node_modules/rc-new-window/es/index.js
var onNewWindowResize = (0, import_debounce.default)(() => {
  let div = document.createElement("div");
  document.body.append(div);
  div.remove();
}, 200);
var NewWindow = class extends import_react31.default.PureComponent {
  /**
   * The NewWindow function constructor.
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.released = false;
    this.container = document.createElement("div");
    this.state = { mounted: false };
    this.onMainWindowUnload = () => {
      if (this.window) {
        this.window.close();
      }
    };
    this.release = (event) => {
      if (this.released) {
        return;
      }
      this.released = true;
      if (this.windowCheckerInterval) {
        clearInterval(this.windowCheckerInterval);
        this.windowCheckerInterval = null;
      }
      window.removeEventListener("beforeunload", this.onMainWindowUnload);
      this.window.removeEventListener("beforeunload", this.release);
      if (event) {
        const { onClose } = this.props;
        if (typeof onClose === "function") {
          onClose();
        }
      }
    };
  }
  /**
   * Render the NewWindow component.
   */
  render() {
    if (!this.state.mounted)
      return null;
    return import_react_dom7.default.createPortal(this.props.children, this.container);
  }
  componentDidMount() {
    this.openChild();
    this.setState({ mounted: true });
  }
  /**
   * Create the new window when NewWindow component mount.
   */
  openChild() {
    const { url, title, name, width, height, initPopupInnerRect, initPopupOuterRect, onBlock, onOpen, onClose } = this.props;
    let features = { width, height };
    if (initPopupOuterRect) {
      features = initPopupOuterRect();
      const [topBorder, sideBorder, bottomBorder] = popupWindowBorder;
      if (!isSafari) {
        features.width -= sideBorder * 2;
        features.height -= topBorder + bottomBorder;
      }
    } else if (initPopupInnerRect) {
      features = initPopupInnerRect();
      const [topBorder, sideBorder] = popupWindowBorder;
      features.left -= sideBorder;
      features.top -= topBorder;
      if (isSafari) {
        features.height += topBorder;
      }
    } else {
      features.left = window.top.outerWidth / 2 + window.top.screenX - width / 2;
      features.top = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    }
    this.window = window.open(url, name, toWindowFeatures(features));
    if (this.window) {
      window.addEventListener("beforeunload", this.onMainWindowUnload);
      this.window.addEventListener("resize", onNewWindowResize);
      this.window.document.title = title || document.title;
      this.window.document.body.appendChild(this.container);
      if (this.props.copyStyles) {
        setTimeout(() => copyStyles(document, this.window.document), 0);
      }
      if (typeof onOpen === "function") {
        onOpen(this.window);
      }
      if (url && onClose) {
        this.windowCheckerInterval = setInterval(() => {
          if (!this.window || this.window.closed) {
            this.release(true);
          }
        }, 50);
      }
      this.window.addEventListener("beforeunload", this.release);
    } else {
      if (typeof onBlock === "function") {
        onBlock();
      } else {
        console.warn("A new window could not be opened. Maybe it was blocked.");
      }
    }
  }
  /**
   * Close the opened window (if any) when NewWindow will unmount.
   */
  componentWillUnmount() {
    if (this.window) {
      this.release();
      this.window.close();
    }
  }
};
NewWindow.supported = popupSupported;
NewWindow.defaultProps = {
  url: "",
  name: "",
  width: 640,
  height: 480,
  copyStyles: true
};
function copyStyles(source, target) {
  Array.from(source.styleSheets).forEach((styleSheet) => {
    let rules;
    if (styleSheet.href) {
      const newLinkEl = source.createElement("link");
      newLinkEl.rel = "stylesheet";
      newLinkEl.href = styleSheet.href;
      target.head.appendChild(newLinkEl);
    } else {
      try {
        rules = styleSheet.cssRules;
      } catch (err) {
      }
      if (rules) {
        const newStyleEl = source.createElement("style");
        Array.from(styleSheet.cssRules).forEach((cssRule) => {
          const { cssText, type } = cssRule;
          let returnText = cssText;
          if ([3, 5].includes(type)) {
            returnText = cssText.split("url(").map((line) => {
              if (line[1] === "/") {
                return `${line.slice(0, 1)}${window.location.origin}${line.slice(1)}`;
              }
              return line;
            }).join("url(");
          }
          newStyleEl.appendChild(source.createTextNode(returnText));
        });
        target.head.appendChild(newStyleEl);
      }
    }
  });
}
function toWindowFeatures(obj) {
  return Object.keys(obj).reduce((features, name) => {
    const value = obj[name];
    if (typeof value === "boolean") {
      features.push(`${name}=${value ? "yes" : "no"}`);
    } else {
      features.push(`${name}=${value}`);
    }
    return features;
  }, []).join(",");
}
var es_default11 = NewWindow;

// ../../node_modules/rc-dock/es/DockPanel.js
var import_react34 = __toESM(require_react());

// ../../node_modules/rc-dock/es/DockDropLayer.js
var import_react32 = __toESM(require_react());
var DockDropSquare = class extends import_react32.default.PureComponent {
  constructor() {
    super(...arguments);
    this.state = { dropping: false };
    this.onDragOver = (e) => {
      let { panelElement: targetElement, direction, depth, panelData } = this.props;
      this.setState({ dropping: true });
      for (let i = 0; i < depth; ++i) {
        targetElement = targetElement.parentElement;
      }
      if (panelData.group === placeHolderStyle && direction !== "float") {
        this.context.setDropRect(targetElement, "middle", this, e);
      } else {
        let dockId = this.context.getDockId();
        let panelSize = DragState.getData("panelSize", dockId);
        this.context.setDropRect(targetElement, direction, this, e, panelSize);
      }
      e.accept("");
    };
    this.onDragLeave = (e) => {
      let { panelElement, direction } = this.props;
      this.setState({ dropping: false });
      this.context.setDropRect(null, "remove", this);
    };
    this.onDrop = (e) => {
      let dockId = this.context.getDockId();
      let source = DragState.getData("tab", dockId);
      if (!source) {
        source = DragState.getData("panel", dockId);
      }
      if (source) {
        let { panelData, direction, depth } = this.props;
        let target = panelData;
        for (let i = 0; i < depth; ++i) {
          target = target.parent;
        }
        this.context.dockMove(source, target, direction);
      }
    };
  }
  render() {
    let { direction, depth } = this.props;
    let { dropping } = this.state;
    let classes = ["dock-drop-square"];
    classes.push(`dock-drop-${direction}`);
    if (depth) {
      classes.push(`dock-drop-deep`);
    }
    if (dropping) {
      classes.push("dock-drop-square-dropping");
    }
    return import_react32.default.createElement(
      DragDropDiv,
      { className: classes.join(" "), onDragOverT: this.onDragOver, onDragLeaveT: this.onDragLeave, onDropT: this.onDrop },
      import_react32.default.createElement("div", { className: "dock-drop-square-box" })
    );
  }
  componentWillUnmount() {
    this.context.setDropRect(null, "remove", this);
  }
};
DockDropSquare.contextType = DockContextType;
var DockDropLayer = class extends import_react32.default.PureComponent {
  static addDepthSquare(children, mode, panelData, panelElement, depth) {
    if (mode === "horizontal") {
      children.push(import_react32.default.createElement(DockDropSquare, { key: `top${depth}`, direction: "top", depth, panelData, panelElement }));
      children.push(import_react32.default.createElement(DockDropSquare, { key: `bottom${depth}`, direction: "bottom", depth, panelData, panelElement }));
    } else {
      children.push(import_react32.default.createElement(DockDropSquare, { key: `left${depth}`, direction: "left", depth, panelData, panelElement }));
      children.push(import_react32.default.createElement(DockDropSquare, { key: `right${depth}`, direction: "right", depth, panelData, panelElement }));
    }
  }
  render() {
    var _a;
    let { panelData, panelElement, dropFromPanel } = this.props;
    let dockId = this.context.getDockId();
    let children = [];
    let draggingPanel = DragState.getData("panel", dockId);
    let fromGroup = this.context.getGroup(dropFromPanel.group);
    if (fromGroup.floatable !== false && (!draggingPanel || !draggingPanel.panelLock && // panel with panelLock can't float
    ((_a = draggingPanel.parent) === null || _a === void 0 ? void 0 : _a.mode) !== "float" && // don't show float drop when over a float panel
    !(fromGroup.floatable === "singleTab" && draggingPanel.tabs.length > 1))) {
      children.push(import_react32.default.createElement(DockDropSquare, { key: "float", direction: "float", panelData, panelElement }));
    }
    if (draggingPanel !== panelData && !fromGroup.disableDock) {
      DockDropLayer.addDepthSquare(children, "horizontal", panelData, panelElement, 0);
      DockDropLayer.addDepthSquare(children, "vertical", panelData, panelElement, 0);
      if (!(draggingPanel === null || draggingPanel === void 0 ? void 0 : draggingPanel.panelLock) && panelData.group === dropFromPanel.group && panelData !== dropFromPanel) {
        children.push(import_react32.default.createElement(DockDropSquare, { key: "middle", direction: "middle", panelData, panelElement }));
      }
      let box = panelData.parent;
      if (box && box.children.length > 1) {
        DockDropLayer.addDepthSquare(children, box.mode, panelData, panelElement, 1);
        if (box.parent) {
          DockDropLayer.addDepthSquare(children, box.parent.mode, panelData, panelElement, 2);
        }
      }
    }
    return import_react32.default.createElement("div", { className: "dock-drop-layer" }, children);
  }
};
DockDropLayer.contextType = DockContextType;

// ../../node_modules/rc-dock/es/DockDropEdge.js
var import_react33 = __toESM(require_react());
var DockDropEdge = class extends import_react33.default.PureComponent {
  constructor() {
    super(...arguments);
    this.getRef = (r) => {
      this._ref = r;
    };
    this.onDragOver = (e) => {
      var _a, _b, _c;
      let { panelData, panelElement, dropFromPanel } = this.props;
      let dockId = this.context.getDockId();
      let draggingPanel = DragState.getData("panel", dockId);
      let fromGroup = this.context.getGroup(dropFromPanel.group);
      if (draggingPanel && ((_a = draggingPanel.parent) === null || _a === void 0 ? void 0 : _a.mode) === "float") {
        return;
      }
      let { direction, mode, depth } = this.getDirection(e, fromGroup, draggingPanel === panelData, (_c = (_b = draggingPanel === null || draggingPanel === void 0 ? void 0 : draggingPanel.tabs) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 1);
      depth = this.getActualDepth(depth, mode, direction);
      if (!direction || direction === "float" && dropFromPanel.panelLock) {
        this.context.setDropRect(null, "remove", this);
        return;
      }
      let targetElement = panelElement;
      for (let i = 0; i < depth; ++i) {
        targetElement = targetElement.parentElement;
      }
      let panelSize = DragState.getData("panelSize", dockId);
      this.context.setDropRect(targetElement, direction, this, e, panelSize);
      e.accept("");
    };
    this.onDragLeave = (e) => {
      this.context.setDropRect(null, "remove", this);
    };
    this.onDrop = (e) => {
      var _a, _b;
      let { panelData, dropFromPanel } = this.props;
      let dockId = this.context.getDockId();
      let fromGroup = this.context.getGroup(dropFromPanel.group);
      let source = DragState.getData("tab", dockId);
      let draggingPanel = DragState.getData("panel", dockId);
      if (!source) {
        source = draggingPanel;
      }
      if (source) {
        let { direction, mode, depth } = this.getDirection(e, fromGroup, draggingPanel === panelData, (_b = (_a = draggingPanel === null || draggingPanel === void 0 ? void 0 : draggingPanel.tabs) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1);
        depth = this.getActualDepth(depth, mode, direction);
        if (!direction) {
          return;
        }
        let target = panelData;
        for (let i = 0; i < depth; ++i) {
          target = target.parent;
        }
        this.context.dockMove(source, target, direction);
      }
    };
  }
  getDirection(e, group, samePanel, tabLength) {
    let rect = this._ref.getBoundingClientRect();
    let widthRate = Math.min(rect.width, 500);
    let heightRate = Math.min(rect.height, 500);
    let left = (e.clientX - rect.left) / widthRate;
    let right = (rect.right - e.clientX) / widthRate;
    let top = (e.clientY - rect.top) / heightRate;
    let bottom = (rect.bottom - e.clientY) / heightRate;
    let min = Math.min(left, right, top, bottom);
    let depth = 0;
    if (group.disableDock || samePanel) {
      min = 1;
    }
    if (min < 0) {
      return { direction: null, depth: 0 };
    } else if (min < 0.075) {
      depth = 3;
    } else if (min < 0.15) {
      depth = 1;
    } else if (min < 0.3) {
    } else if (group.floatable) {
      if (group.floatable === "singleTab") {
        if (tabLength === 1) {
          return { direction: "float", mode: "float", depth: 0 };
        }
      } else {
        return { direction: "float", mode: "float", depth: 0 };
      }
    }
    switch (min) {
      case left: {
        return { direction: "left", mode: "horizontal", depth };
      }
      case right: {
        return { direction: "right", mode: "horizontal", depth };
      }
      case top: {
        return { direction: "top", mode: "vertical", depth };
      }
      case bottom: {
        return { direction: "bottom", mode: "vertical", depth };
      }
    }
    return { direction: null, depth: 0 };
  }
  getActualDepth(depth, mode, direction) {
    let afterPanel = direction === "bottom" || direction === "right";
    if (!depth) {
      return depth;
    }
    let { panelData } = this.props;
    let previousTarget = panelData;
    let targetBox = panelData.parent;
    let lastDepth = 0;
    if (panelData.parent.mode === mode) {
      ++depth;
    }
    while (targetBox && lastDepth < depth) {
      if (targetBox.mode === mode) {
        if (afterPanel) {
          if (targetBox.children[targetBox.children.length - 1] !== previousTarget) {
            break;
          }
        } else {
          if (targetBox.children[0] !== previousTarget) {
            break;
          }
        }
      }
      previousTarget = targetBox;
      targetBox = targetBox.parent;
      ++lastDepth;
    }
    while (depth > lastDepth) {
      depth -= 2;
    }
    return depth;
  }
  render() {
    return import_react33.default.createElement(DragDropDiv, { getRef: this.getRef, className: "dock-drop-edge", onDragOverT: this.onDragOver, onDragLeaveT: this.onDragLeave, onDropT: this.onDrop });
  }
  componentWillUnmount() {
    this.context.setDropRect(null, "remove", this);
  }
};
DockDropEdge.contextType = DockContextType;

// ../../node_modules/rc-dock/es/DockPanel.js
var DockPanel = class extends import_react34.default.PureComponent {
  constructor() {
    super(...arguments);
    this.getRef = (r) => {
      this._ref = r;
      if (r) {
        let { parent } = this.props.panelData;
        if ((parent === null || parent === void 0 ? void 0 : parent.mode) === "float") {
          r.addEventListener("pointerdown", this.onFloatPointerDown, { capture: true, passive: true });
        }
      }
    };
    this.state = { dropFromPanel: null, draggingHeader: false };
    this.onDragOver = (e) => {
      if (DockPanel._droppingPanel === this) {
        return;
      }
      let { panelData } = this.props;
      let dockId = this.context.getDockId();
      let tab = DragState.getData("tab", dockId);
      let panel = DragState.getData("panel", dockId);
      if (tab || panel) {
        DockPanel.droppingPanel = this;
      }
      if (tab) {
        if (tab.parent) {
          this.setState({ dropFromPanel: tab.parent });
        } else {
          this.setState({ dropFromPanel: { activeId: "", tabs: [], group: tab.group } });
        }
      } else if (panel) {
        this.setState({ dropFromPanel: panel });
      }
    };
    this.onPanelHeaderDragStart = (event) => {
      let { panelData } = this.props;
      let { parent, x, y, z } = panelData;
      let dockId = this.context.getDockId();
      if ((parent === null || parent === void 0 ? void 0 : parent.mode) === "float") {
        this._movingX = x;
        this._movingY = y;
        event.setData({ panel: this.props.panelData }, dockId);
        event.startDrag(null, null);
        this.onFloatPointerDown();
      } else {
        let tabGroup = this.context.getGroup(panelData.group);
        let [panelWidth, panelHeight] = getFloatPanelSize(this._ref, tabGroup);
        event.setData({ panel: panelData, panelSize: [panelWidth, panelHeight] }, dockId);
        event.startDrag(null);
      }
      this.setState({ draggingHeader: true });
    };
    this.onPanelHeaderDragMove = (e) => {
      let { width, height } = this.context.getLayoutSize();
      let { panelData } = this.props;
      panelData.x = this._movingX + e.dx;
      panelData.y = this._movingY + e.dy;
      if (width > 200 && height > 200) {
        if (panelData.y < 0) {
          panelData.y = 0;
        } else if (panelData.y > height - 16) {
          panelData.y = height - 16;
        }
        if (panelData.x + panelData.w < 16) {
          panelData.x = 16 - panelData.w;
        } else if (panelData.x > width - 16) {
          panelData.x = width - 16;
        }
      }
      this.forceUpdate();
    };
    this.onPanelHeaderDragEnd = (e) => {
      if (!this._unmounted) {
        this.setState({ draggingHeader: false });
        this.context.onSilentChange(this.props.panelData.activeId, "move");
      }
    };
    this.onPanelCornerDragT = (e) => {
      this.onPanelCornerDrag(e, "t");
    };
    this.onPanelCornerDragB = (e) => {
      this.onPanelCornerDrag(e, "b");
    };
    this.onPanelCornerDragL = (e) => {
      this.onPanelCornerDrag(e, "l");
    };
    this.onPanelCornerDragR = (e) => {
      this.onPanelCornerDrag(e, "r");
    };
    this.onPanelCornerDragTL = (e) => {
      this.onPanelCornerDrag(e, "tl");
    };
    this.onPanelCornerDragTR = (e) => {
      this.onPanelCornerDrag(e, "tr");
    };
    this.onPanelCornerDragBL = (e) => {
      this.onPanelCornerDrag(e, "bl");
    };
    this.onPanelCornerDragBR = (e) => {
      this.onPanelCornerDrag(e, "br");
    };
    this.onPanelCornerDragMove = (e) => {
      let { panelData } = this.props;
      let { dx, dy } = e;
      if (this._movingCorner.startsWith("t")) {
        let { width, height } = this.context.getLayoutSize();
        if (this._movingY + dy < 0) {
          dy = -this._movingY;
        } else if (this._movingY + dy > height - 16) {
          dy = height - 16 - this._movingY;
        }
      }
      switch (this._movingCorner) {
        case "t": {
          panelData.y = this._movingY + dy;
          panelData.h = this._movingH - dy;
          break;
        }
        case "b": {
          panelData.h = this._movingH + dy;
          break;
        }
        case "l": {
          panelData.x = this._movingX + dx;
          panelData.w = this._movingW - dx;
          break;
        }
        case "r": {
          panelData.w = this._movingW + dx;
          break;
        }
        case "tl": {
          panelData.x = this._movingX + dx;
          panelData.w = this._movingW - dx;
          panelData.y = this._movingY + dy;
          panelData.h = this._movingH - dy;
          break;
        }
        case "tr": {
          panelData.w = this._movingW + dx;
          panelData.y = this._movingY + dy;
          panelData.h = this._movingH - dy;
          break;
        }
        case "bl": {
          panelData.x = this._movingX + dx;
          panelData.w = this._movingW - dx;
          panelData.h = this._movingH + dy;
          break;
        }
        case "br": {
          panelData.w = this._movingW + dx;
          panelData.h = this._movingH + dy;
          break;
        }
      }
      this.forceUpdate();
    };
    this.onPanelCornerDragEnd = (e) => {
      this.context.onSilentChange(this.props.panelData.activeId, "move");
    };
    this.onFloatPointerDown = () => {
      let { panelData } = this.props;
      let { z } = panelData;
      let newZ = nextZIndex(z);
      if (newZ !== z) {
        panelData.z = newZ;
        this.forceUpdate();
      }
    };
    this.onPanelClicked = (e) => {
      const target = e.nativeEvent.target;
      if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
        this._ref.querySelector(".dock-bar").focus();
      }
    };
    this._unmounted = false;
  }
  static set droppingPanel(panel) {
    if (DockPanel._droppingPanel === panel) {
      return;
    }
    if (DockPanel._droppingPanel) {
      DockPanel._droppingPanel.onDragOverOtherPanel();
    }
    DockPanel._droppingPanel = panel;
  }
  onDragOverOtherPanel() {
    if (this.state.dropFromPanel) {
      this.setState({ dropFromPanel: null });
    }
  }
  onPanelCornerDrag(e, corner) {
    let { parent, x, y, w, h } = this.props.panelData;
    if ((parent === null || parent === void 0 ? void 0 : parent.mode) === "float") {
      this._movingCorner = corner;
      this._movingX = x;
      this._movingY = y;
      this._movingW = w;
      this._movingH = h;
      e.startDrag(null, null);
    }
  }
  render() {
    let { dropFromPanel, draggingHeader } = this.state;
    let { panelData, size } = this.props;
    let { minWidth, minHeight, group, id, parent, panelLock } = panelData;
    let styleName = group;
    let tabGroup = this.context.getGroup(group);
    let { widthFlex, heightFlex } = tabGroup;
    if (panelLock) {
      let { panelStyle, widthFlex: panelWidthFlex, heightFlex: panelHeightFlex } = panelLock;
      if (panelStyle) {
        styleName = panelStyle;
      }
      if (typeof panelWidthFlex === "number") {
        widthFlex = panelWidthFlex;
      }
      if (typeof panelHeightFlex === "number") {
        heightFlex = panelHeightFlex;
      }
    }
    let panelClass;
    if (styleName) {
      panelClass = styleName.split(" ").map((name) => `dock-style-${name}`).join(" ");
    }
    let isMax = (parent === null || parent === void 0 ? void 0 : parent.mode) === "maximize";
    let isFloat = (parent === null || parent === void 0 ? void 0 : parent.mode) === "float";
    let isHBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === "horizontal";
    let isVBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === "vertical";
    let onPanelHeaderDragStart = this.onPanelHeaderDragStart;
    if (isMax) {
      dropFromPanel = null;
      onPanelHeaderDragStart = null;
    }
    let cls = `dock-panel ${panelClass ? panelClass : ""}${dropFromPanel ? " dock-panel-dropping" : ""}${draggingHeader ? " dragging" : ""}`;
    let flex = 1;
    if (isHBox && widthFlex != null) {
      flex = widthFlex;
    } else if (isVBox && heightFlex != null) {
      flex = heightFlex;
    }
    let flexGrow = flex * size;
    let flexShrink = flex * 1e6;
    if (flexShrink < 1) {
      flexShrink = 1;
    }
    let style2 = { minWidth, minHeight, flex: `${flexGrow} ${flexShrink} ${size}px` };
    if (isFloat) {
      style2.left = panelData.x;
      style2.top = panelData.y;
      style2.width = panelData.w;
      style2.height = panelData.h;
      style2.zIndex = panelData.z;
    }
    let droppingLayer;
    if (dropFromPanel) {
      let dropFromGroup = this.context.getGroup(dropFromPanel.group);
      let dockId = this.context.getDockId();
      if (!dropFromGroup.tabLocked || DragState.getData("tab", dockId) == null) {
        let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
        droppingLayer = import_react34.default.createElement(DockDropClass, { panelData, panelElement: this._ref, dropFromPanel });
      }
    }
    return import_react34.default.createElement(
      DragDropDiv,
      { getRef: this.getRef, className: cls, style: style2, "data-dockid": id, onDragOverT: isFloat ? null : this.onDragOver, onClick: this.onPanelClicked },
      import_react34.default.createElement(DockTabs, { panelData, onPanelDragStart: onPanelHeaderDragStart, onPanelDragMove: this.onPanelHeaderDragMove, onPanelDragEnd: this.onPanelHeaderDragEnd }),
      isFloat ? [
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-t", className: "dock-panel-drag-size dock-panel-drag-size-t", onDragStartT: this.onPanelCornerDragT, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-b", className: "dock-panel-drag-size dock-panel-drag-size-b", onDragStartT: this.onPanelCornerDragB, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-l", className: "dock-panel-drag-size dock-panel-drag-size-l", onDragStartT: this.onPanelCornerDragL, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-r", className: "dock-panel-drag-size dock-panel-drag-size-r", onDragStartT: this.onPanelCornerDragR, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-t-l", className: "dock-panel-drag-size dock-panel-drag-size-t-l", onDragStartT: this.onPanelCornerDragTL, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-t-r", className: "dock-panel-drag-size dock-panel-drag-size-t-r", onDragStartT: this.onPanelCornerDragTR, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-b-l", className: "dock-panel-drag-size dock-panel-drag-size-b-l", onDragStartT: this.onPanelCornerDragBL, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd }),
        import_react34.default.createElement(DragDropDiv, { key: "drag-size-b-r", className: "dock-panel-drag-size dock-panel-drag-size-b-r", onDragStartT: this.onPanelCornerDragBR, onDragMoveT: this.onPanelCornerDragMove, onDragEndT: this.onPanelCornerDragEnd })
      ] : null,
      droppingLayer
    );
  }
  componentWillUnmount() {
    if (DockPanel._droppingPanel === this) {
      DockPanel.droppingPanel = null;
    }
    if (this._ref) {
      this._ref.removeEventListener("pointerdown", this.onFloatPointerDown, { capture: true });
    }
    this._unmounted = true;
  }
};
DockPanel.contextType = DockContextType;

// ../../node_modules/rc-dock/es/WindowPanel.js
var import_ScreenPosition = __toESM(require_ScreenPosition());
var WindowPanel = class extends import_react35.default.PureComponent {
  constructor() {
    super(...arguments);
    this.onOpen = (w) => {
      if (!this._window && w) {
        this._window = w;
      }
    };
    this.onUnload = () => {
      let { panelData } = this.props;
      let layoutRoot = this.context.getRootElement();
      const rect = (0, import_ScreenPosition.mapWindowToElement)(layoutRoot, this._window);
      if (rect.width > 0 && rect.height > 0) {
        panelData.x = rect.left;
        panelData.y = rect.top;
        panelData.w = rect.width;
        panelData.h = rect.height;
      }
      this.context.dockMove(panelData, null, "float");
    };
    this.initPopupInnerRect = () => {
      let { panelData } = this.props;
      return (0, import_ScreenPosition.mapElementToScreenRect)(this.context.getRootElement(), {
        left: panelData.x,
        top: panelData.y,
        width: panelData.w,
        height: panelData.h
      });
    };
  }
  render() {
    let { panelData } = this.props;
    let { x, y, w, h } = panelData;
    return import_react35.default.createElement(
      es_default11,
      { copyStyles: true, onOpen: this.onOpen, onClose: this.onUnload, onBlock: this.onUnload, initPopupInnerRect: this.initPopupInnerRect, width: w, height: h },
      import_react35.default.createElement(
        "div",
        { className: "dock-wbox" },
        import_react35.default.createElement(DockPanel, { size: panelData.size, panelData, key: panelData.id })
      )
    );
  }
};
WindowPanel.contextType = DockContextType;

// ../../node_modules/rc-dock/es/WindowBox.js
var WindowBox = class extends import_react36.default.PureComponent {
  render() {
    let { children } = this.props.boxData;
    let childrenRender = [];
    for (let child of children) {
      if ("tabs" in child) {
        childrenRender.push(import_react36.default.createElement(WindowPanel, { key: child.id, panelData: child }));
      }
    }
    return import_react36.default.createElement(import_react36.default.Fragment, null, childrenRender);
  }
};
WindowBox.enabled = typeof window === "object" && ((window === null || window === void 0 ? void 0 : window.navigator.platform) === "Win32" || (window === null || window === void 0 ? void 0 : window.navigator.platform) === "MacIntel");

// ../../node_modules/rc-dock/es/DockTabs.js
function findParentPanel(element) {
  for (let i = 0; i < 10; ++i) {
    if (!element) {
      return null;
    }
    if (element.classList.contains("dock-panel")) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}
function isPopupDiv(r) {
  var _a, _b;
  return r == null || ((_a = r.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === "LI" || ((_b = r.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement.tagName) === "LI";
}
var TabCache = class {
  constructor(context) {
    this.getRef = (r) => {
      if (isPopupDiv(r)) {
        return;
      }
      this._ref = r;
    };
    this.getHitAreaRef = (r) => {
      if (isPopupDiv(r)) {
        return;
      }
      this._hitAreaRef = r;
    };
    this.onCloseClick = (e) => {
      this.context.dockMove(this.data, null, "remove");
      e.stopPropagation();
    };
    this.onDragStart = (e) => {
      let panel = this.data.parent;
      if (panel.parent.mode === "float" && panel.tabs.length === 1) {
        return;
      }
      let panelElement = findParentPanel(this._ref);
      let tabGroup = this.context.getGroup(this.data.group);
      let [panelWidth, panelHeight] = getFloatPanelSize(panelElement, tabGroup);
      e.setData({ tab: this.data, panelSize: [panelWidth, panelHeight] }, this.context.getDockId());
      e.startDrag(this._ref.parentElement, this._ref.parentElement);
    };
    this.onDragOver = (e) => {
      var _a, _b;
      let dockId = this.context.getDockId();
      let tab = DragState.getData("tab", dockId);
      let panel = DragState.getData("panel", dockId);
      let group;
      if (tab) {
        panel = tab.parent;
        group = tab.group;
      } else {
        if (!panel) {
          return;
        }
        if (panel === null || panel === void 0 ? void 0 : panel.panelLock) {
          e.reject();
          return;
        }
        group = panel.group;
      }
      let tabGroup = this.context.getGroup(group);
      if (group !== this.data.group) {
        e.reject();
      } else if ((tabGroup === null || tabGroup === void 0 ? void 0 : tabGroup.floatable) === "singleTab" && ((_b = (_a = this.data.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.mode) === "float") {
        e.reject();
      } else if (tab && tab !== this.data) {
        let direction = this.getDropDirection(e);
        this.context.setDropRect(this._hitAreaRef, direction, this);
        e.accept("");
      } else if (panel && panel !== this.data.parent) {
        let direction = this.getDropDirection(e);
        this.context.setDropRect(this._hitAreaRef, direction, this);
        e.accept("");
      }
    };
    this.onDragLeave = (e) => {
      this.context.setDropRect(null, "remove", this);
    };
    this.onDrop = (e) => {
      let dockId = this.context.getDockId();
      let panel;
      let tab = DragState.getData("tab", dockId);
      if (tab) {
        panel = tab.parent;
      } else {
        panel = DragState.getData("panel", dockId);
      }
      if (tab && tab !== this.data) {
        let direction = this.getDropDirection(e);
        this.context.dockMove(tab, this.data, direction);
      } else if (panel && panel !== this.data.parent) {
        let direction = this.getDropDirection(e);
        this.context.dockMove(panel, this.data, direction);
      }
    };
    this.context = context;
  }
  setData(data) {
    if (data !== this.data) {
      this.data = data;
      this.content = this.render();
      return true;
    }
    return false;
  }
  getDropDirection(e) {
    let rect = this._hitAreaRef.getBoundingClientRect();
    let midx = rect.left + rect.width * 0.5;
    return e.clientX > midx ? "after-tab" : "before-tab";
  }
  render() {
    let { id, title, group, content, closable, cached, parent } = this.data;
    let { onDragStart, onDragOver, onDrop, onDragLeave } = this;
    if (parent.parent.mode === "window") {
      onDragStart = null;
      onDragOver = null;
      onDrop = null;
      onDragLeave = null;
    }
    let tabGroup = this.context.getGroup(group);
    if (typeof content === "function") {
      content = content(this.data);
    }
    let tab = import_react37.default.createElement(
      DragDropDiv,
      { getRef: this.getRef, onDragStartT: onDragStart, role: "tab", "aria-selected": parent.activeId === id, onDragOverT: onDragOver, onDropT: onDrop, onDragLeaveT: onDragLeave },
      title,
      closable ? import_react37.default.createElement("div", { className: "dock-tab-close-btn", onClick: this.onCloseClick }) : null,
      import_react37.default.createElement("div", { className: "dock-tab-hit-area", ref: this.getHitAreaRef })
    );
    return import_react37.default.createElement(DockTabPane, { key: id, cacheId: id, cached, tab }, content);
  }
  destroy() {
  }
};
var DockTabs = class extends import_react37.default.PureComponent {
  constructor() {
    super(...arguments);
    this._cache = /* @__PURE__ */ new Map();
    this.onMaximizeClick = (e) => {
      let { panelData } = this.props;
      this.context.dockMove(panelData, null, "maximize");
      e.stopPropagation();
    };
    this.onNewWindowClick = () => {
      let { panelData } = this.props;
      this.context.dockMove(panelData, null, "new-window");
    };
    this.renderTabBar = (props, TabNavList2) => {
      let { panelData, onPanelDragStart, onPanelDragMove, onPanelDragEnd } = this.props;
      let { group: groupName, panelLock } = panelData;
      let group = this.context.getGroup(groupName);
      let { panelExtra } = group;
      let maximizable = group.maximizable;
      if (panelData.parent.mode === "window") {
        onPanelDragStart = null;
        maximizable = false;
      }
      if (panelLock) {
        if (panelLock.panelExtra) {
          panelExtra = panelLock.panelExtra;
        }
      }
      let showNewWindowButton = group.newWindow && WindowBox.enabled && panelData.parent.mode === "float";
      let panelExtraContent;
      if (panelExtra) {
        panelExtraContent = panelExtra(panelData, this.context);
      } else if (maximizable || showNewWindowButton) {
        panelExtraContent = import_react37.default.createElement("div", { className: "dock-panel-max-btn", onClick: maximizable ? this.onMaximizeClick : null });
        if (showNewWindowButton) {
          panelExtraContent = this.addNewWindowMenu(panelExtraContent, !maximizable);
        }
      }
      return import_react37.default.createElement(DockTabBar, Object.assign({ onDragStart: onPanelDragStart, onDragMove: onPanelDragMove, onDragEnd: onPanelDragEnd, TabNavList: TabNavList2, isMaximized: panelData.parent.mode === "maximize" }, props, { extra: panelExtraContent }));
    };
    this.onTabChange = (activeId) => {
      this.props.panelData.activeId = activeId;
      this.context.onSilentChange(activeId, "active");
      this.forceUpdate();
    };
  }
  updateTabs(tabs) {
    if (tabs === this.cachedTabs) {
      return;
    }
    this.cachedTabs = tabs;
    let newCache = /* @__PURE__ */ new Map();
    let reused = 0;
    for (let tabData of tabs) {
      let { id } = tabData;
      if (this._cache.has(id)) {
        let tab = this._cache.get(id);
        newCache.set(id, tab);
        tab.setData(tabData);
        ++reused;
      } else {
        let tab = new TabCache(this.context);
        newCache.set(id, tab);
        tab.setData(tabData);
      }
    }
    if (reused !== this._cache.size) {
      for (let [id, tab] of this._cache) {
        if (!newCache.has(id)) {
          tab.destroy();
        }
      }
    }
    this._cache = newCache;
  }
  addNewWindowMenu(element, showWithLeftClick) {
    const nativeMenu = import_react37.default.createElement(
      es_default9,
      { onClick: this.onNewWindowClick },
      import_react37.default.createElement(MenuItem_default2, null, "New Window")
    );
    let trigger = showWithLeftClick ? ["contextMenu", "click"] : ["contextMenu"];
    return import_react37.default.createElement(es_default10, { prefixCls: "dock-dropdown", overlay: nativeMenu, trigger, mouseEnterDelay: 0.1, mouseLeaveDelay: 0.1 }, element);
  }
  render() {
    let { group, tabs, activeId } = this.props.panelData;
    let tabGroup = this.context.getGroup(group);
    let { animated } = tabGroup;
    if (animated == null) {
      animated = true;
    }
    this.updateTabs(tabs);
    let children = [];
    for (let [id, tab] of this._cache) {
      children.push(tab.content);
    }
    return import_react37.default.createElement(es_default8, { prefixCls: "dock", moreIcon: "...", animated, renderTabBar: this.renderTabBar, activeKey: activeId, onChange: this.onTabChange }, children);
  }
};
DockTabs.contextType = DockContextType;
DockTabs.propKeys = ["group", "tabs", "activeId", "onTabChange"];

// ../../node_modules/rc-dock/es/DockBox.js
var import_react39 = __toESM(require_react());

// ../../node_modules/rc-dock/es/Divider.js
var import_react38 = __toESM(require_react());
var BoxDataCache = class {
  constructor(data) {
    this.beforeSize = 0;
    this.beforeMinSize = 0;
    this.afterSize = 0;
    this.afterMinSize = 0;
    this.element = data.element;
    this.beforeDivider = data.beforeDivider;
    this.afterDivider = data.afterDivider;
    for (let child of this.beforeDivider) {
      this.beforeSize += child.size;
      if (child.minSize > 0) {
        this.beforeMinSize += child.minSize;
      }
    }
    for (let child of this.afterDivider) {
      this.afterSize += child.size;
      if (child.minSize > 0) {
        this.afterMinSize += child.minSize;
      }
    }
  }
};
function spiltSize(newSize, oldSize, children) {
  let reservedSize = -1;
  let sizes = [];
  let requiredMinSize = 0;
  while (requiredMinSize !== reservedSize) {
    reservedSize = requiredMinSize;
    requiredMinSize = 0;
    let ratio = (newSize - reservedSize) / (oldSize - reservedSize);
    if (!(ratio >= 0)) {
      break;
    }
    for (let i = 0; i < children.length; ++i) {
      let size = children[i].size * ratio;
      if (size < children[i].minSize) {
        size = children[i].minSize;
        requiredMinSize += size;
      }
      sizes[i] = size;
    }
  }
  return sizes;
}
var Divider3 = class extends import_react38.default.PureComponent {
  constructor() {
    super(...arguments);
    this.startDrag = (e) => {
      this.boxData = new BoxDataCache(this.props.getDividerData(this.props.idx));
      e.startDrag(this.boxData.element, null);
    };
    this.dragMove = (e) => {
      if (e.event.shiftKey || e.event.ctrlKey || e.event.altKey) {
        this.dragMoveAll(e, e.dx, e.dy);
      } else {
        this.dragMove2(e, e.dx, e.dy);
      }
    };
    this.dragEnd = (e) => {
      let { onDragEnd } = this.props;
      this.boxData = null;
      if (onDragEnd) {
        onDragEnd();
      }
    };
  }
  dragMove2(e, dx, dy) {
    let { isVertical, changeSizes } = this.props;
    let { beforeDivider, afterDivider } = this.boxData;
    if (!(beforeDivider.length && afterDivider.length)) {
      return;
    }
    let d = isVertical ? dy : dx;
    let leftChild = beforeDivider[beforeDivider.length - 1];
    let rightCild = afterDivider[0];
    let leftSize = leftChild.size + d;
    let rightSize = rightCild.size - d;
    if (d > 0) {
      if (rightSize < rightCild.minSize) {
        rightSize = rightCild.minSize;
        leftSize = leftChild.size + rightCild.size - rightSize;
      }
    } else if (leftSize < leftChild.minSize) {
      leftSize = leftChild.minSize;
      rightSize = leftChild.size + rightCild.size - leftSize;
    }
    let sizes = beforeDivider.concat(afterDivider).map((child) => child.size);
    sizes[beforeDivider.length - 1] = leftSize;
    sizes[beforeDivider.length] = rightSize;
    changeSizes(sizes);
  }
  dragMoveAll(e, dx, dy) {
    let { isVertical, changeSizes } = this.props;
    let { beforeSize, beforeMinSize, afterSize, afterMinSize, beforeDivider, afterDivider } = this.boxData;
    let d = isVertical ? dy : dx;
    let newBeforeSize = beforeSize + d;
    let newAfterSize = afterSize - d;
    if (d > 0) {
      if (newAfterSize < afterMinSize) {
        newAfterSize = afterMinSize;
        newBeforeSize = beforeSize + afterSize - afterMinSize;
      }
    } else if (newBeforeSize < beforeMinSize) {
      newBeforeSize = beforeMinSize;
      newAfterSize = beforeSize + afterSize - beforeMinSize;
    }
    changeSizes(spiltSize(newBeforeSize, beforeSize, beforeDivider).concat(spiltSize(newAfterSize, afterSize, afterDivider)));
  }
  render() {
    let { className } = this.props;
    if (!className) {
      className = "dock-divider";
    }
    return import_react38.default.createElement(DragDropDiv, { className, onDragStartT: this.startDrag, onDragMoveT: this.dragMove, onDragEndT: this.dragEnd });
  }
};

// ../../node_modules/rc-dock/es/DockBox.js
var DockBox = class extends import_react39.default.PureComponent {
  constructor() {
    super(...arguments);
    this.getRef = (r) => {
      this._ref = r;
    };
    this.getDividerData = (idx) => {
      if (this._ref) {
        let { children, mode } = this.props.boxData;
        let nodes = this._ref.childNodes;
        if (nodes.length === children.length * 2 - 1) {
          let dividerChildren = [];
          for (let i = 0; i < children.length; ++i) {
            if (mode === "vertical") {
              dividerChildren.push({ size: nodes[i * 2].offsetHeight, minSize: children[i].minHeight });
            } else {
              dividerChildren.push({ size: nodes[i * 2].offsetWidth, minSize: children[i].minWidth });
            }
          }
          return {
            element: this._ref,
            beforeDivider: dividerChildren.slice(0, idx),
            afterDivider: dividerChildren.slice(idx)
          };
        }
      }
      return null;
    };
    this.changeSizes = (sizes) => {
      let { children } = this.props.boxData;
      if (children.length === sizes.length) {
        for (let i = 0; i < children.length; ++i) {
          children[i].size = sizes[i];
        }
        this.forceUpdate();
      }
    };
    this.onDragEnd = () => {
      this.context.onSilentChange(null, "move");
    };
  }
  render() {
    let { boxData } = this.props;
    let { minWidth, minHeight, size, children, mode, id, widthFlex, heightFlex } = boxData;
    let isVertical = mode === "vertical";
    let childrenRender = [];
    for (let i = 0; i < children.length; ++i) {
      if (i > 0) {
        childrenRender.push(import_react39.default.createElement(Divider3, { idx: i, key: i, isVertical, onDragEnd: this.onDragEnd, getDividerData: this.getDividerData, changeSizes: this.changeSizes }));
      }
      let child = children[i];
      if ("tabs" in child) {
        childrenRender.push(import_react39.default.createElement(DockPanel, { size: child.size, panelData: child, key: child.id }));
      } else if ("children" in child) {
        childrenRender.push(import_react39.default.createElement(DockBox, { size: child.size, boxData: child, key: child.id }));
      }
    }
    let cls;
    let flex = 1;
    if (mode === "vertical") {
      cls = "dock-box dock-vbox";
      if (widthFlex != null) {
        flex = widthFlex;
      }
    } else {
      cls = "dock-box dock-hbox";
      if (heightFlex != null) {
        flex = heightFlex;
      }
    }
    let flexGrow = flex * size;
    let flexShrink = flex * 1e6;
    if (flexShrink < 1) {
      flexShrink = 1;
    }
    return import_react39.default.createElement("div", { ref: this.getRef, className: cls, "data-dockid": id, style: { minWidth, minHeight, flex: `${flexGrow} ${flexShrink} ${size}px` } }, childrenRender);
  }
};
DockBox.contextType = DockContextType;

// ../../node_modules/rc-dock/es/DockLayout.js
var import_react42 = __toESM(require_react());
var import_react_dom8 = __toESM(require_react_dom());
var import_debounce2 = __toESM(require_debounce());

// ../../node_modules/rc-dock/es/FloatBox.js
var import_react40 = __toESM(require_react());
var FloatBox = class extends import_react40.default.PureComponent {
  render() {
    let { children } = this.props.boxData;
    let childrenRender = [];
    for (let child of children) {
      if ("tabs" in child) {
        childrenRender.push(import_react40.default.createElement(DockPanel, { size: child.size, panelData: child, key: child.id }));
      }
    }
    return import_react40.default.createElement("div", { className: "dock-box dock-fbox" }, childrenRender);
  }
};

// ../../node_modules/rc-dock/es/Serializer.js
function addPanelToCache(panelData, cache) {
  cache.panels.set(panelData.id, panelData);
  for (let tab of panelData.tabs) {
    cache.tabs.set(tab.id, tab);
  }
}
function addBoxToCache(boxData, cache) {
  for (let child of boxData.children) {
    if ("tabs" in child) {
      addPanelToCache(child, cache);
    } else if ("children" in child) {
      addBoxToCache(child, cache);
    }
  }
}
function createLayoutCache(defaultLayout) {
  let cache = {
    panels: /* @__PURE__ */ new Map(),
    tabs: /* @__PURE__ */ new Map()
  };
  if (defaultLayout) {
    if ("children" in defaultLayout) {
      addBoxToCache(defaultLayout, cache);
    } else {
      if ("dockbox" in defaultLayout) {
        addBoxToCache(defaultLayout.dockbox, cache);
      }
      if ("floatbox" in defaultLayout) {
        addBoxToCache(defaultLayout.floatbox, cache);
      }
    }
  }
  return cache;
}
function saveLayoutData(layout, saveTab, afterPanelSaved) {
  function saveTabData(tabData) {
    if (saveTab) {
      return saveTab(tabData);
    }
    return { id: tabData.id };
  }
  function savePanelData(panelData) {
    let tabs = [];
    for (let tab of panelData.tabs) {
      let savedTab = saveTabData(tab);
      if (savedTab) {
        tabs.push(savedTab);
      }
    }
    let { id, size, activeId } = panelData;
    let savedPanel;
    if (panelData.parent.mode === "float" || panelData.parent.mode === "window") {
      let { x, y, z, w, h } = panelData;
      savedPanel = { id, size, tabs, activeId, x, y, z, w, h };
    } else {
      savedPanel = { id, size, tabs, activeId };
    }
    if (afterPanelSaved) {
      afterPanelSaved(savedPanel, panelData);
    }
    return savedPanel;
  }
  function saveBoxData(boxData) {
    let children = [];
    for (let child of boxData.children) {
      if ("tabs" in child) {
        children.push(savePanelData(child));
      } else if ("children" in child) {
        children.push(saveBoxData(child));
      }
    }
    let { id, size, mode } = boxData;
    return { id, size, mode, children };
  }
  return {
    dockbox: saveBoxData(layout.dockbox),
    floatbox: saveBoxData(layout.floatbox),
    windowbox: saveBoxData(layout.windowbox),
    maxbox: saveBoxData(layout.maxbox)
  };
}
function loadLayoutData(savedLayout, defaultLayout, loadTab, afterPanelLoaded) {
  var _a, _b, _c;
  let cache = createLayoutCache(defaultLayout);
  function loadTabData(savedTab) {
    if (loadTab) {
      return loadTab(savedTab);
    }
    let { id } = savedTab;
    if (cache.tabs.has(id)) {
      return cache.tabs.get(id);
    }
    return null;
  }
  function loadPanelData(savedPanel) {
    let { id, size, activeId, x, y, z, w, h } = savedPanel;
    let tabs = [];
    for (let savedTab of savedPanel.tabs) {
      let tabData = loadTabData(savedTab);
      if (tabData) {
        tabs.push(tabData);
      }
    }
    let panelData;
    if (w || h || x || y || z) {
      panelData = { id, size, activeId, x, y, z, w, h, tabs };
    } else {
      panelData = { id, size, activeId, tabs };
    }
    if (savedPanel.id === maximePlaceHolderId) {
      panelData.panelLock = {};
    } else if (afterPanelLoaded) {
      afterPanelLoaded(savedPanel, panelData);
    } else if (cache.panels.has(id)) {
      panelData = Object.assign(Object.assign({}, cache.panels.get(id)), panelData);
    }
    return panelData;
  }
  function loadBoxData(savedBox) {
    if (!savedBox) {
      return null;
    }
    let children = [];
    for (let child of savedBox.children) {
      if ("tabs" in child) {
        children.push(loadPanelData(child));
      } else if ("children" in child) {
        children.push(loadBoxData(child));
      }
    }
    let { id, size, mode } = savedBox;
    return { id, size, mode, children };
  }
  return {
    dockbox: loadBoxData(savedLayout.dockbox),
    floatbox: loadBoxData((_a = savedLayout.floatbox) !== null && _a !== void 0 ? _a : { mode: "float", children: [], size: 0 }),
    windowbox: loadBoxData((_b = savedLayout.windowbox) !== null && _b !== void 0 ? _b : { mode: "window", children: [], size: 0 }),
    maxbox: loadBoxData((_c = savedLayout.maxbox) !== null && _c !== void 0 ? _c : { mode: "maximize", children: [], size: 1 })
  };
}

// ../../node_modules/rc-dock/es/MaxBox.js
var import_react41 = __toESM(require_react());
var MaxBox = class extends import_react41.default.PureComponent {
  render() {
    let panelData = this.props.boxData.children[0];
    if (panelData) {
      this.hidePanelData = Object.assign(Object.assign({}, panelData), { id: "", tabs: [] });
      return import_react41.default.createElement(
        "div",
        { className: "dock-box dock-mbox dock-mbox-show" },
        import_react41.default.createElement(DockPanel, { size: 100, panelData })
      );
    } else if (this.hidePanelData) {
      let hidePanelData = this.hidePanelData;
      this.hidePanelData = null;
      return import_react41.default.createElement(
        "div",
        { className: "dock-box dock-mbox dock-mbox-hide" },
        import_react41.default.createElement(DockPanel, { size: 100, panelData: hidePanelData })
      );
    } else {
      return import_react41.default.createElement("div", { className: "dock-box dock-mbox dock-mbox-hide" });
    }
  }
};

// ../../node_modules/rc-dock/es/DockLayout.js
var __rest3 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var DockPortalManager = class extends import_react42.default.PureComponent {
  constructor() {
    super(...arguments);
    this._caches = /* @__PURE__ */ new Map();
    this.destroyRemovedPane = () => {
      this._pendingDestroy = null;
      let cacheRemoved = false;
      for (let [id, cache] of this._caches) {
        if (cache.owner == null) {
          this._caches.delete(id);
          cacheRemoved = true;
        }
      }
      if (cacheRemoved) {
        this.forceUpdate();
      }
    };
  }
  /** @ignore */
  getTabCache(id, owner) {
    let cache = this._caches.get(id);
    if (!cache) {
      let div = document.createElement("div");
      div.className = "dock-pane-cache";
      cache = { div, id, owner };
      this._caches.set(id, cache);
    } else {
      cache.owner = owner;
    }
    return cache;
  }
  /** @ignore */
  removeTabCache(id, owner) {
    let cache = this._caches.get(id);
    if (cache && cache.owner === owner) {
      cache.owner = null;
      if (!this._pendingDestroy) {
        this._pendingDestroy = setTimeout(this.destroyRemovedPane, 1);
      }
    }
  }
  /** @ignore */
  updateTabCache(id, children) {
    let cache = this._caches.get(id);
    if (cache) {
      cache.portal = import_react_dom8.default.createPortal(children, cache.div, cache.id);
      this.forceUpdate();
    }
  }
};
var DockLayout = class extends DockPortalManager {
  constructor(props) {
    var _a;
    super(props);
    this.getRef = (r) => {
      this._ref = r;
    };
    this.onDragStateChange = (draggingScope) => {
      if (draggingScope == null) {
        DockPanel.droppingPanel = null;
        if (this.state.dropRect) {
          this.setState({ dropRect: null });
        }
      }
    };
    this._onWindowResize = (0, import_debounce2.default)(() => {
      let layout2 = this.getLayout();
      if (this._ref) {
        let newLayout = fixFloatPanelPos(layout2, this._ref.offsetWidth, this._ref.offsetHeight);
        if (layout2 !== newLayout) {
          newLayout = fixLayoutData(newLayout, this.props.groups);
          this.changeLayout(newLayout, null, "move");
        }
      }
    }, 200);
    let { layout, defaultLayout, loadTab } = props;
    let preparedLayout;
    if (defaultLayout) {
      preparedLayout = this.prepareInitData(props.defaultLayout);
    } else if (!loadTab) {
      throw new Error("DockLayout.loadTab and DockLayout.defaultLayout should not both be undefined.");
    }
    if (layout) {
      this.state = {
        layout: DockLayout.loadLayoutData(layout, props),
        dropRect: null
      };
    } else {
      this.state = {
        layout: preparedLayout,
        dropRect: null
      };
    }
    addDragStateListener(this.onDragStateChange);
    (_a = globalThis.addEventListener) === null || _a === void 0 ? void 0 : _a.call(globalThis, "resize", this._onWindowResize);
  }
  /** @ignore */
  getRootElement() {
    return this._ref;
  }
  /** @ignore */
  prepareInitData(data) {
    let layout = Object.assign({}, data);
    fixLayoutData(layout, this.props.groups, this.props.loadTab);
    return layout;
  }
  /** @ignore */
  getDockId() {
    return this.props.dockId || this;
  }
  /** @inheritDoc */
  getGroup(name) {
    if (name) {
      let { groups } = this.props;
      if (groups && name in groups) {
        return groups[name];
      }
      if (name === placeHolderStyle) {
        return placeHolderGroup;
      }
    }
    return defaultGroup;
  }
  /**
   * @inheritDoc
   * @param source @inheritDoc
   * @param target @inheritDoc
   * @param direction @inheritDoc
   */
  dockMove(source, target, direction) {
    let layout = this.getLayout();
    if (direction === "maximize") {
      layout = maximize(layout, source);
      this.panelToFocus = source.id;
    } else if (direction === "front") {
      layout = moveToFront(layout, source);
    } else {
      layout = removeFromLayout(layout, source);
    }
    if (typeof target === "string") {
      target = this.find(target, Filter.All);
    } else {
      target = getUpdatedObject(target);
    }
    if (direction === "float") {
      let newPanel = converToPanel(source);
      newPanel.z = nextZIndex(null);
      if (this.state.dropRect) {
        layout = floatPanel(layout, newPanel, this.state.dropRect);
      } else {
        layout = floatPanel(layout, newPanel);
        if (this._ref) {
          layout = fixFloatPanelPos(layout, this._ref.offsetWidth, this._ref.offsetHeight);
        }
      }
    } else if (direction === "new-window") {
      let newPanel = converToPanel(source);
      layout = panelToWindow(layout, newPanel);
    } else if (target) {
      if ("tabs" in target) {
        if (direction === "middle") {
          layout = addTabToPanel(layout, source, target);
        } else {
          let newPanel = converToPanel(source);
          layout = dockPanelToPanel(layout, newPanel, target, direction);
        }
      } else if ("children" in target) {
        let newPanel = converToPanel(source);
        layout = dockPanelToBox(layout, newPanel, target, direction);
      } else {
        layout = addNextToTab(layout, source, target, direction);
      }
    }
    if (layout !== this.getLayout()) {
      layout = fixLayoutData(layout, this.props.groups);
      let currentTabId = null;
      if (source.hasOwnProperty("tabs")) {
        currentTabId = source.activeId;
      } else {
        currentTabId = source.id;
      }
      this.changeLayout(layout, currentTabId, direction);
    }
    this.onDragStateChange(false);
  }
  /** @inheritDoc */
  find(id, filter) {
    return find(this.getLayout(), id, filter);
  }
  /** @ignore */
  getLayoutSize() {
    if (this._ref) {
      return { width: this._ref.offsetWidth, height: this._ref.offsetHeight };
    }
    return { width: 0, height: 0 };
  }
  /** @inheritDoc */
  updateTab(id, newTab, makeActive = true) {
    var _a;
    let tab = this.find(id, Filter.AnyTab);
    if (tab) {
      let panelData = tab.parent;
      let idx = panelData.tabs.indexOf(tab);
      if (idx >= 0) {
        let { loadTab } = this.props;
        let layout = this.getLayout();
        if (newTab) {
          let activeId = panelData.activeId;
          if (loadTab && !("content" in newTab && "title" in newTab)) {
            newTab = loadTab(newTab);
          }
          layout = removeFromLayout(layout, tab);
          panelData = getUpdatedObject(panelData);
          layout = addTabToPanel(layout, newTab, panelData, idx);
          panelData = getUpdatedObject(panelData);
          if (!makeActive) {
            panelData.activeId = activeId;
            this.panelToFocus = panelData.id;
          }
        } else if (makeActive && panelData.activeId !== id) {
          layout = replacePanel(layout, panelData, Object.assign(Object.assign({}, panelData), { activeId: id }));
        }
        layout = fixLayoutData(layout, this.props.groups);
        this.changeLayout(layout, (_a = newTab === null || newTab === void 0 ? void 0 : newTab.id) !== null && _a !== void 0 ? _a : id, "update");
        return true;
      }
    }
    return false;
  }
  /** @inheritDoc */
  navigateToPanel(fromElement, direction) {
    if (!direction) {
      if (!fromElement) {
        fromElement = this._ref.querySelector(".dock-tab-active>.dock-tab-btn");
      }
      fromElement.focus();
      return;
    }
    let targetTab;
    let selector = direction === "ArrowUp" || direction === "ArrowDown" ? ".dock>.dock-bar" : ".dock-box>.dock-panel";
    let panels = Array.from(this._ref.querySelectorAll(selector));
    let currentPanel = panels.find((panel) => panel.contains(fromElement));
    let currentRect = currentPanel.getBoundingClientRect();
    let matches = [];
    for (let panel of panels) {
      if (panel !== currentPanel) {
        let rect = panel.getBoundingClientRect();
        let distance = findNearestPanel(currentRect, rect, direction);
        if (distance >= 0) {
          matches.push({ panel, rect, distance });
        }
      }
    }
    matches.sort((a, b) => a.distance - b.distance);
    for (let match of matches) {
      targetTab = match.panel.querySelector(".dock-tab-active>.dock-tab-btn");
      if (targetTab) {
        break;
      }
    }
    if (targetTab) {
      targetTab.focus();
    }
  }
  /** @ignore */
  useEdgeDrop() {
    return this.props.dropMode === "edge";
  }
  /** @ignore */
  setDropRect(element, direction, source, event, panelSize = [300, 300]) {
    let { dropRect } = this.state;
    if (dropRect) {
      if (direction === "remove") {
        if (dropRect.source === source) {
          this.setState({ dropRect: null });
        }
        return;
      } else if (dropRect.element === element && dropRect.direction === direction && direction !== "float") {
        return;
      }
    }
    if (!element) {
      this.setState({ dropRect: null });
      return;
    }
    let layoutRect = this._ref.getBoundingClientRect();
    let scaleX = this._ref.offsetWidth / layoutRect.width;
    let scaleY = this._ref.offsetHeight / layoutRect.height;
    let elemRect = element.getBoundingClientRect();
    let left = (elemRect.left - layoutRect.left) * scaleX;
    let top = (elemRect.top - layoutRect.top) * scaleY;
    let width = elemRect.width * scaleX;
    let height = elemRect.height * scaleY;
    let ratio = 0.5;
    if (element.classList.contains("dock-box")) {
      ratio = 0.3;
    }
    switch (direction) {
      case "float": {
        let x = (event.clientX - layoutRect.left) * scaleX;
        let y = (event.clientY - layoutRect.top) * scaleY;
        top = y - 15;
        width = panelSize[0];
        height = panelSize[1];
        left = x - (width >> 1);
        break;
      }
      case "right":
        left += width * (1 - ratio);
      case "left":
        width *= ratio;
        break;
      case "bottom":
        top += height * (1 - ratio);
      case "top":
        height *= ratio;
        break;
      case "after-tab":
        left += width - 15;
        width = 30;
        break;
      case "before-tab":
        left -= 15;
        width = 30;
        break;
    }
    this.setState({ dropRect: { left, top, width, height, element, source, direction } });
  }
  /** @ignore */
  render() {
    this.tempLayout = null;
    let { style: style2, maximizeTo } = this.props;
    let { layout, dropRect } = this.state;
    let dropRectStyle;
    if (dropRect) {
      let { element, direction } = dropRect, rect = __rest3(dropRect, ["element", "direction"]);
      dropRectStyle = Object.assign(Object.assign({}, rect), { display: "block" });
      if (direction === "float") {
        dropRectStyle.transition = "none";
      }
    }
    let maximize2;
    if (maximizeTo) {
      if (typeof maximizeTo === "string") {
        maximizeTo = document.getElementById(maximizeTo);
      }
      maximize2 = import_react_dom8.default.createPortal(import_react42.default.createElement(MaxBox, { boxData: layout.maxbox }), maximizeTo);
    } else {
      maximize2 = import_react42.default.createElement(MaxBox, { boxData: layout.maxbox });
    }
    let portals = [];
    for (let [key, cache] of this._caches) {
      if (cache.portal) {
        portals.push(cache.portal);
      }
    }
    return import_react42.default.createElement(
      "div",
      { ref: this.getRef, className: "dock-layout", style: style2 },
      import_react42.default.createElement(
        DockContextProvider,
        { value: this },
        import_react42.default.createElement(DockBox, { size: 1, boxData: layout.dockbox }),
        import_react42.default.createElement(FloatBox, { boxData: layout.floatbox }),
        import_react42.default.createElement(WindowBox, { boxData: layout.windowbox }),
        maximize2,
        portals
      ),
      import_react42.default.createElement("div", { className: "dock-drop-indicator", style: dropRectStyle })
    );
  }
  /** @ignore
   * move focus to panelToFocus
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    var _a;
    if (this.panelToFocus) {
      let panel = this._ref.querySelector(`.dock-panel[data-dockid="${this.panelToFocus}"]`);
      if (panel && !panel.contains(this._ref.ownerDocument.activeElement)) {
        (_a = panel.querySelector(".dock-bar")) === null || _a === void 0 ? void 0 : _a.focus();
      }
      this.panelToFocus = null;
    }
  }
  /** @ignore */
  componentWillUnmount() {
    var _a;
    (_a = globalThis.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(globalThis, "resize", this._onWindowResize);
    removeDragStateListener(this.onDragStateChange);
    this._onWindowResize.cancel();
  }
  setLayout(layout) {
    this.tempLayout = layout;
    this.setState({ layout });
  }
  getLayout() {
    return this.tempLayout || this.state.layout;
  }
  /** @ignore
   * change layout
   */
  changeLayout(layoutData, currentTabId, direction, silent = false) {
    let { layout, onLayoutChange } = this.props;
    let savedLayout;
    if (onLayoutChange) {
      savedLayout = saveLayoutData(layoutData, this.props.saveTab, this.props.afterPanelSaved);
      layoutData.loadedFrom = savedLayout;
      onLayoutChange(savedLayout, currentTabId, direction);
      if (layout) {
        this.forceUpdate();
      }
    }
    if (!layout && !silent) {
      this.setLayout(layoutData);
    }
  }
  /** @ignore
   * some layout change were handled by component silently
   * but they should still call this function to trigger onLayoutChange
   */
  onSilentChange(currentTabId = null, direction) {
    let { onLayoutChange } = this.props;
    if (onLayoutChange) {
      let layout = this.getLayout();
      this.changeLayout(layout, currentTabId, direction, true);
    }
  }
  // public api
  saveLayout() {
    return saveLayoutData(this.getLayout(), this.props.saveTab, this.props.afterPanelSaved);
  }
  /**
   * load layout
   * calling this api won't trigger the [[LayoutProps.onLayoutChange]] callback
   */
  loadLayout(savedLayout) {
    this.setLayout(DockLayout.loadLayoutData(savedLayout, this.props, this._ref.offsetWidth, this._ref.offsetHeight));
  }
  /** @ignore */
  static loadLayoutData(savedLayout, props, width = 0, height = 0) {
    let { defaultLayout, loadTab, afterPanelLoaded, groups } = props;
    let layout = loadLayoutData(savedLayout, defaultLayout, loadTab, afterPanelLoaded);
    layout = fixFloatPanelPos(layout, width, height);
    layout = fixLayoutData(layout, groups);
    layout.loadedFrom = savedLayout;
    return layout;
  }
  static getDerivedStateFromProps(props, state) {
    let { layout: layoutToLoad } = props;
    let { layout: currentLayout } = state;
    if (layoutToLoad && layoutToLoad !== currentLayout.loadedFrom) {
      return {
        layout: DockLayout.loadLayoutData(layoutToLoad, props)
      };
    }
    return null;
  }
};

// ../../node_modules/rc-dock/es/DividerBox.js
var import_react43 = __toESM(require_react());
var __rest4 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var DividerBox = class extends import_react43.default.PureComponent {
  constructor() {
    super(...arguments);
    this.getRef = (r) => {
      this._ref = r;
    };
    this.getDividerData = (idx) => {
      if (this._ref) {
        let { children, mode } = this.props;
        let nodes = this._ref.childNodes;
        let length = 1;
        if (Array.isArray(children)) {
          length = children.length;
        }
        if (nodes.length === length * 2 - 1) {
          let dividerChildren = [];
          for (let i = 0; i < length; ++i) {
            if (mode === "vertical") {
              dividerChildren.push({ size: nodes[i * 2].offsetHeight });
            } else {
              dividerChildren.push({ size: nodes[i * 2].offsetWidth });
            }
          }
          return {
            element: this._ref,
            beforeDivider: dividerChildren.slice(0, idx),
            afterDivider: dividerChildren.slice(idx)
          };
        }
      }
      return null;
    };
    this.changeSizes = (sizes) => {
      let { mode } = this.props;
      let nodes = this._ref.childNodes;
      if (nodes.length === sizes.length * 2 - 1) {
        for (let i = 0; i < sizes.length; ++i) {
          if (mode === "vertical") {
            nodes[i * 2].style.height = `${sizes[i]}px`;
          } else {
            nodes[i * 2].style.width = `${sizes[i]}px`;
          }
        }
        this.forceUpdate();
      }
    };
  }
  render() {
    let _a = this.props, { children, mode, className } = _a, others = __rest4(_a, ["children", "mode", "className"]);
    let isVertical = mode === "vertical";
    let childrenRender = [];
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; ++i) {
        if (i > 0) {
          childrenRender.push(import_react43.default.createElement(Divider3, { idx: i, key: i, isVertical, getDividerData: this.getDividerData, changeSizes: this.changeSizes }));
        }
        childrenRender.push(children[i]);
      }
    } else {
      childrenRender = children;
    }
    let cls;
    if (mode === "vertical") {
      cls = "divider-box dock-vbox";
    } else {
      cls = "divider-box dock-hbox";
    }
    if (className) {
      cls = `${cls} ${className}`;
    }
    return import_react43.default.createElement("div", Object.assign({ ref: this.getRef, className: cls }, others), childrenRender);
  }
};
DividerBox.contextType = DockContextType;

// ../../node_modules/rc-dock/es/index.js
var es_default12 = DockLayout;
export {
  Divider3 as Divider,
  DividerBox,
  DockBox,
  DockContextConsumer,
  DockContextProvider,
  DockContextType,
  DockLayout,
  DockPanel,
  DockTabs,
  DragDropDiv,
  DragState,
  GestureState,
  TabCache,
  addDragStateListener,
  addHandlers,
  es_default12 as default,
  defaultGroup,
  destroyDraggingElement,
  isDragging,
  maximePlaceHolderId,
  placeHolderGroup,
  placeHolderStyle,
  removeDragStateListener,
  removeHandlers
};
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

@babel/runtime/helpers/esm/regeneratorRuntime.js:
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE *)

bowser/src/bowser.js:
  (*!
   * Bowser - a browser detector
   * https://github.com/lancedikson/bowser
   * MIT License | (c) Dustin Diaz 2012-2015
   * MIT License | (c) Denis Demchenko 2015-2019
   *)
*/
//# sourceMappingURL=rc-dock.js.map
