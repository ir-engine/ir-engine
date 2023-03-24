import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __commonJS
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/react-joystick-component/build/lib/enums/shape.enum.js
var require_shape_enum = __commonJS({
  "../../node_modules/react-joystick-component/build/lib/enums/shape.enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JoystickShape = void 0;
    var JoystickShape;
    (function(JoystickShape2) {
      JoystickShape2["Circle"] = "circle";
      JoystickShape2["Square"] = "square";
    })(JoystickShape = exports.JoystickShape || (exports.JoystickShape = {}));
  }
});

// ../../node_modules/react-joystick-component/build/lib/shapes/shape.factory.js
var require_shape_factory = __commonJS({
  "../../node_modules/react-joystick-component/build/lib/shapes/shape.factory.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shapeFactory = void 0;
    var shape_enum_1 = require_shape_enum();
    var shapeFactory = function(shape, size) {
      switch (shape) {
        case shape_enum_1.JoystickShape.Circle:
          return {
            borderRadius: size
          };
        case shape_enum_1.JoystickShape.Square:
          return {
            borderRadius: Math.sqrt(size)
          };
      }
    };
    exports.shapeFactory = shapeFactory;
  }
});

// ../../node_modules/react-joystick-component/build/lib/shapes/shape.bounds.factory.js
var require_shape_bounds_factory = __commonJS({
  "../../node_modules/react-joystick-component/build/lib/shapes/shape.bounds.factory.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shapeBoundsFactory = void 0;
    var shape_enum_1 = require_shape_enum();
    var shapeBoundsFactory = function(shape, absoluteX, absoluteY, relativeX, relativeY, dist, radius, baseSize, parentRect) {
      switch (shape) {
        case shape_enum_1.JoystickShape.Square:
          relativeX = getWithinBounds(absoluteX - parentRect.left - baseSize / 2, baseSize);
          relativeY = getWithinBounds(absoluteY - parentRect.top - baseSize / 2, baseSize);
          return { relativeX, relativeY };
        default:
          if (dist > radius) {
            relativeX *= radius / dist;
            relativeY *= radius / dist;
          }
          return { relativeX, relativeY };
      }
    };
    exports.shapeBoundsFactory = shapeBoundsFactory;
    var getWithinBounds = function(value, baseSize) {
      var halfBaseSize = baseSize / 2;
      if (value > halfBaseSize) {
        return halfBaseSize;
      }
      if (value < -halfBaseSize) {
        return halfBaseSize * -1;
      }
      return value;
    };
  }
});

// ../../node_modules/react-joystick-component/build/lib/Joystick.js
var require_Joystick = __commonJS({
  "../../node_modules/react-joystick-component/build/lib/Joystick.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
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
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Joystick = void 0;
    var React = require_react();
    var shape_enum_1 = require_shape_enum();
    var shape_factory_1 = require_shape_factory();
    var shape_bounds_factory_1 = require_shape_bounds_factory();
    var InteractionEvents;
    (function(InteractionEvents2) {
      InteractionEvents2["PointerDown"] = "pointerdown";
      InteractionEvents2["PointerMove"] = "pointermove";
      InteractionEvents2["PointerUp"] = "pointerup";
    })(InteractionEvents || (InteractionEvents = {}));
    var RadianQuadrantBinding;
    (function(RadianQuadrantBinding2) {
      RadianQuadrantBinding2[RadianQuadrantBinding2["TopRight"] = 2.35619449] = "TopRight";
      RadianQuadrantBinding2[RadianQuadrantBinding2["TopLeft"] = -2.35619449] = "TopLeft";
      RadianQuadrantBinding2[RadianQuadrantBinding2["BottomRight"] = 0.785398163] = "BottomRight";
      RadianQuadrantBinding2[RadianQuadrantBinding2["BottomLeft"] = -0.785398163] = "BottomLeft";
    })(RadianQuadrantBinding || (RadianQuadrantBinding = {}));
    var Joystick = (
      /** @class */
      function(_super) {
        __extends(Joystick2, _super);
        function Joystick2(props) {
          var _this = _super.call(this, props) || this;
          _this._stickRef = React.createRef();
          _this._baseRef = React.createRef();
          _this._pointerId = null;
          _this.state = {
            dragging: false
          };
          _this._throttleMoveCallback = function() {
            var lastCall = 0;
            return function(event) {
              var now = new Date().getTime();
              var throttleAmount = _this.props.throttle || 0;
              if (now - lastCall < throttleAmount) {
                return;
              }
              lastCall = now;
              if (_this.props.move) {
                return _this.props.move(event);
              }
            };
          }();
          return _this;
        }
        Joystick2.prototype.componentWillUnmount = function() {
          var _this = this;
          if (this.props.followCursor) {
            window.removeEventListener(InteractionEvents.PointerMove, function(event) {
              return _this._pointerMove(event);
            });
          }
        };
        Joystick2.prototype.componentDidMount = function() {
          var _this = this;
          if (this.props.followCursor) {
            this._parentRect = this._baseRef.current.getBoundingClientRect();
            this.setState({
              dragging: true
            });
            window.addEventListener(InteractionEvents.PointerMove, function(event) {
              return _this._pointerMove(event);
            });
            if (this.props.start) {
              this.props.start({
                type: "start",
                x: null,
                y: null,
                distance: null,
                direction: null
              });
            }
          }
        };
        Joystick2.prototype._updatePos = function(coordinates) {
          var _this = this;
          window.requestAnimationFrame(function() {
            _this.setState({
              coordinates
            });
          });
          if (typeof this.props.minDistance === "number") {
            if (coordinates.distance < this.props.minDistance) {
              return;
            }
          }
          this._throttleMoveCallback({
            type: "move",
            x: coordinates.relativeX,
            y: -coordinates.relativeY,
            direction: coordinates.direction,
            distance: coordinates.distance
          });
        };
        Joystick2.prototype._pointerDown = function(e) {
          var _this = this;
          if (this.props.disabled || this.props.followCursor) {
            return;
          }
          this._parentRect = this._baseRef.current.getBoundingClientRect();
          this.setState({
            dragging: true
          });
          window.addEventListener(InteractionEvents.PointerUp, function(event) {
            return _this._pointerUp(event);
          });
          window.addEventListener(InteractionEvents.PointerMove, function(event) {
            return _this._pointerMove(event);
          });
          this._pointerId = e.pointerId;
          this._stickRef.current.setPointerCapture(e.pointerId);
          if (this.props.start) {
            this.props.start({
              type: "start",
              x: null,
              y: null,
              distance: null,
              direction: null
            });
          }
        };
        Joystick2.prototype._getDirection = function(atan2) {
          if (atan2 > RadianQuadrantBinding.TopRight || atan2 < RadianQuadrantBinding.TopLeft) {
            return "FORWARD";
          } else if (atan2 < RadianQuadrantBinding.TopRight && atan2 > RadianQuadrantBinding.BottomRight) {
            return "RIGHT";
          } else if (atan2 < RadianQuadrantBinding.BottomLeft) {
            return "LEFT";
          }
          return "BACKWARD";
        };
        Joystick2.prototype._distance = function(x, y) {
          return Math.hypot(x, y);
        };
        Joystick2.prototype._distanceToPercentile = function(distance) {
          var percentageBaseSize = distance / (this._baseSize / 2) * 100;
          if (percentageBaseSize > 100) {
            return 100;
          }
          return percentageBaseSize;
        };
        Joystick2.prototype._pointerMove = function(event) {
          event.preventDefault();
          if (this.state.dragging) {
            if (!this.props.followCursor && event.pointerId !== this._pointerId)
              return;
            var absoluteX = event.clientX;
            var absoluteY = event.clientY;
            var relativeX = absoluteX - this._parentRect.left - this._radius;
            var relativeY = absoluteY - this._parentRect.top - this._radius;
            var dist = this._distance(relativeX, relativeY);
            var bounded = (0, shape_bounds_factory_1.shapeBoundsFactory)(
              //@ts-ignore
              this.props.controlPlaneShape || this.props.baseShape,
              absoluteX,
              absoluteY,
              relativeX,
              relativeY,
              dist,
              this._radius,
              this._baseSize,
              this._parentRect
            );
            relativeX = bounded.relativeX;
            relativeY = bounded.relativeY;
            var atan2 = Math.atan2(relativeX, relativeY);
            this._updatePos({
              relativeX,
              relativeY,
              distance: this._distanceToPercentile(dist),
              direction: this._getDirection(atan2),
              axisX: absoluteX - this._parentRect.left,
              axisY: absoluteY - this._parentRect.top
            });
          }
        };
        Joystick2.prototype._pointerUp = function(event) {
          var _this = this;
          if (event.pointerId !== this._pointerId)
            return;
          var stateUpdate = {
            dragging: false
          };
          if (!this.props.sticky) {
            stateUpdate.coordinates = void 0;
          }
          window.requestAnimationFrame(function() {
            _this.setState(stateUpdate);
          });
          window.removeEventListener(InteractionEvents.PointerUp, function(event2) {
            return _this._pointerUp(event2);
          });
          window.removeEventListener(InteractionEvents.PointerMove, function(event2) {
            return _this._pointerMove(event2);
          });
          this._pointerId = null;
          if (this.props.stop) {
            this.props.stop({
              type: "stop",
              // @ts-ignore
              x: this.props.sticky ? this.state.coordinates.relativeX : null,
              // @ts-ignore
              y: this.props.sticky ? this.state.coordinates.relativeY : null,
              // @ts-ignore
              direction: this.props.sticky ? this.state.coordinates.direction : null,
              // @ts-ignore
              distance: this.props.sticky ? this.state.coordinates.distance : null
            });
          }
        };
        Joystick2.prototype.getBaseShapeStyle = function() {
          var shape = this.props.baseShape || shape_enum_1.JoystickShape.Circle;
          return (0, shape_factory_1.shapeFactory)(shape, this._baseSize);
        };
        Joystick2.prototype.getStickShapeStyle = function() {
          var shape = this.props.stickShape || shape_enum_1.JoystickShape.Circle;
          return (0, shape_factory_1.shapeFactory)(shape, this._baseSize);
        };
        Joystick2.prototype._getBaseStyle = function() {
          var baseColor = this.props.baseColor !== void 0 ? this.props.baseColor : "#000033";
          var baseSizeString = "".concat(this._baseSize, "px");
          var padStyle = __assign(__assign({}, this.getBaseShapeStyle()), { height: baseSizeString, width: baseSizeString, background: baseColor, display: "flex", justifyContent: "center", alignItems: "center" });
          if (this.props.baseImage) {
            padStyle.background = "url(".concat(this.props.baseImage, ")");
            padStyle.backgroundSize = "100%";
          }
          return padStyle;
        };
        Joystick2.prototype._getStickStyle = function() {
          var stickColor = this.props.stickColor !== void 0 ? this.props.stickColor : "#3D59AB";
          var stickSize = "".concat(this._baseSize / 1.5, "px");
          var stickStyle = __assign(__assign({}, this.getStickShapeStyle()), { background: stickColor, cursor: "move", height: stickSize, width: stickSize, border: "none", flexShrink: 0, touchAction: "none" });
          if (this.props.stickImage) {
            stickStyle.background = "url(".concat(this.props.stickImage, ")");
            stickStyle.backgroundSize = "100%";
          }
          if (this.state.coordinates !== void 0) {
            stickStyle = Object.assign({}, stickStyle, {
              position: "absolute",
              transform: "translate3d(".concat(this.state.coordinates.relativeX, "px, ").concat(this.state.coordinates.relativeY, "px, 0)")
            });
          }
          return stickStyle;
        };
        Joystick2.prototype.render = function() {
          var _this = this;
          this._baseSize = this.props.size || 100;
          this._radius = this._baseSize / 2;
          var baseStyle = this._getBaseStyle();
          var stickStyle = this._getStickStyle();
          return React.createElement(
            "div",
            { className: this.props.disabled ? "joystick-base-disabled" : "", ref: this._baseRef, style: baseStyle },
            React.createElement("button", { ref: this._stickRef, disabled: this.props.disabled, onPointerDown: function(event) {
              return _this._pointerDown(event);
            }, className: this.props.disabled ? "joystick-disabled" : "", style: stickStyle })
          );
        };
        return Joystick2;
      }(React.Component)
    );
    exports.Joystick = Joystick;
  }
});

// ../../node_modules/react-joystick-component/build/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/react-joystick-component/build/lib/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JoystickShape = exports.Joystick = void 0;
    var Joystick_1 = require_Joystick();
    Object.defineProperty(exports, "Joystick", { enumerable: true, get: function() {
      return Joystick_1.Joystick;
    } });
    var shape_enum_1 = require_shape_enum();
    Object.defineProperty(exports, "JoystickShape", { enumerable: true, get: function() {
      return shape_enum_1.JoystickShape;
    } });
  }
});
export default require_lib();
//# sourceMappingURL=react-joystick-component.js.map
