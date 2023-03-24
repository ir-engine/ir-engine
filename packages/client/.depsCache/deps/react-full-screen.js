import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/react-full-screen/dist/index.modern.js
var import_react = __toESM(require_react());

// ../../node_modules/fscreen/dist/fscreen.esm.js
var key = {
  fullscreenEnabled: 0,
  fullscreenElement: 1,
  requestFullscreen: 2,
  exitFullscreen: 3,
  fullscreenchange: 4,
  fullscreenerror: 5,
  fullscreen: 6
};
var webkit = [
  "webkitFullscreenEnabled",
  "webkitFullscreenElement",
  "webkitRequestFullscreen",
  "webkitExitFullscreen",
  "webkitfullscreenchange",
  "webkitfullscreenerror",
  "-webkit-full-screen"
];
var moz = [
  "mozFullScreenEnabled",
  "mozFullScreenElement",
  "mozRequestFullScreen",
  "mozCancelFullScreen",
  "mozfullscreenchange",
  "mozfullscreenerror",
  "-moz-full-screen"
];
var ms = [
  "msFullscreenEnabled",
  "msFullscreenElement",
  "msRequestFullscreen",
  "msExitFullscreen",
  "MSFullscreenChange",
  "MSFullscreenError",
  "-ms-fullscreen"
];
var document = typeof window !== "undefined" && typeof window.document !== "undefined" ? window.document : {};
var vendor = "fullscreenEnabled" in document && Object.keys(key) || webkit[0] in document && webkit || moz[0] in document && moz || ms[0] in document && ms || [];
var fscreen = {
  requestFullscreen: function(element) {
    return element[vendor[key.requestFullscreen]]();
  },
  requestFullscreenFunction: function(element) {
    return element[vendor[key.requestFullscreen]];
  },
  get exitFullscreen() {
    return document[vendor[key.exitFullscreen]].bind(document);
  },
  get fullscreenPseudoClass() {
    return ":" + vendor[key.fullscreen];
  },
  addEventListener: function(type, handler, options) {
    return document.addEventListener(vendor[key[type]], handler, options);
  },
  removeEventListener: function(type, handler, options) {
    return document.removeEventListener(vendor[key[type]], handler, options);
  },
  get fullscreenEnabled() {
    return Boolean(document[vendor[key.fullscreenEnabled]]);
  },
  set fullscreenEnabled(val) {
  },
  get fullscreenElement() {
    return document[vendor[key.fullscreenElement]];
  },
  set fullscreenElement(val) {
  },
  get onfullscreenchange() {
    return document[("on" + vendor[key.fullscreenchange]).toLowerCase()];
  },
  set onfullscreenchange(handler) {
    return document[("on" + vendor[key.fullscreenchange]).toLowerCase()] = handler;
  },
  get onfullscreenerror() {
    return document[("on" + vendor[key.fullscreenerror]).toLowerCase()];
  },
  set onfullscreenerror(handler) {
    return document[("on" + vendor[key.fullscreenerror]).toLowerCase()] = handler;
  }
};
var fscreen_esm_default = fscreen;

// ../../node_modules/react-full-screen/dist/index.modern.js
function useFullScreenHandle() {
  var _useState = (0, import_react.useState)(false), active = _useState[0], setActive = _useState[1];
  var node = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(function() {
    var handleChange = function handleChange2() {
      setActive(fscreen_esm_default.fullscreenElement === node.current);
    };
    fscreen_esm_default.addEventListener("fullscreenchange", handleChange);
    return function() {
      return fscreen_esm_default.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);
  var enter = (0, import_react.useCallback)(function() {
    if (fscreen_esm_default.fullscreenElement) {
      return fscreen_esm_default.exitFullscreen().then(function() {
        return fscreen_esm_default.requestFullscreen(node.current);
      });
    } else if (node.current) {
      return fscreen_esm_default.requestFullscreen(node.current);
    }
  }, []);
  var exit = (0, import_react.useCallback)(function() {
    if (fscreen_esm_default.fullscreenElement === node.current) {
      return fscreen_esm_default.exitFullscreen();
    }
    return Promise.resolve();
  }, []);
  return (0, import_react.useMemo)(function() {
    return {
      active,
      enter,
      exit,
      node
    };
  }, [active, enter, exit]);
}
var FullScreen = function FullScreen2(_ref) {
  var handle = _ref.handle, onChange = _ref.onChange, children = _ref.children, className = _ref.className;
  var classNames = [];
  if (className) {
    classNames.push(className);
  }
  classNames.push("fullscreen");
  if (handle.active) {
    classNames.push("fullscreen-enabled");
  }
  (0, import_react.useEffect)(function() {
    if (onChange) {
      onChange(handle.active, handle);
    }
  }, [handle.active]);
  return import_react.default.createElement("div", {
    className: classNames.join(" "),
    ref: handle.node,
    style: handle.active ? {
      height: "100%",
      width: "100%"
    } : void 0
  }, children);
};
export {
  FullScreen,
  useFullScreenHandle
};
//# sourceMappingURL=react-full-screen.js.map
