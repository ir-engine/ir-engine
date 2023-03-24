import {
  KeyCode_default,
  useMergedState,
  warning_default
} from "./chunk-IBJKFKWG.js";
import {
  _objectWithoutProperties,
  _slicedToArray
} from "./chunk-JZYXS4PR.js";
import {
  _objectSpread2
} from "./chunk-E3DKBAGC.js";
import "./chunk-MXYNQK7U.js";
import {
  _defineProperty
} from "./chunk-NW535ZXL.js";
import {
  require_classnames
} from "./chunk-KX4TENJ5.js";
import {
  _toConsumableArray
} from "./chunk-PR4QTJVS.js";
import "./chunk-2YGCHIEQ.js";
import "./chunk-5MV6YXQN.js";
import {
  _typeof
} from "./chunk-2WLBNMVK.js";
import {
  require_shallowequal
} from "./chunk-ZB65E5F4.js";
import "./chunk-MBQSVJUP.js";
import {
  _extends,
  init_extends
} from "./chunk-ZEIPKT2T.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/rc-slider/es/Slider.js
var React12 = __toESM(require_react());
var import_classnames5 = __toESM(require_classnames());
var import_shallowequal = __toESM(require_shallowequal());

// ../../node_modules/rc-slider/es/Handles/index.js
init_extends();
var React3 = __toESM(require_react());

// ../../node_modules/rc-slider/es/Handles/Handle.js
init_extends();
var React2 = __toESM(require_react());
var import_classnames = __toESM(require_classnames());

// ../../node_modules/rc-slider/es/context.js
var React = __toESM(require_react());
var SliderContext = React.createContext({
  min: 0,
  max: 0,
  direction: "ltr",
  step: 1,
  includedStart: 0,
  includedEnd: 0,
  tabIndex: 0
});
var context_default = SliderContext;

// ../../node_modules/rc-slider/es/util.js
function getOffset(value, min, max) {
  return (value - min) / (max - min);
}
function getDirectionStyle(direction, value, min, max) {
  var offset = getOffset(value, min, max);
  var positionStyle = {};
  switch (direction) {
    case "rtl":
      positionStyle.right = "".concat(offset * 100, "%");
      positionStyle.transform = "translateX(50%)";
      break;
    case "btt":
      positionStyle.bottom = "".concat(offset * 100, "%");
      positionStyle.transform = "translateY(50%)";
      break;
    case "ttb":
      positionStyle.top = "".concat(offset * 100, "%");
      positionStyle.transform = "translateY(-50%)";
      break;
    default:
      positionStyle.left = "".concat(offset * 100, "%");
      positionStyle.transform = "translateX(-50%)";
      break;
  }
  return positionStyle;
}
function getIndex(value, index) {
  return Array.isArray(value) ? value[index] : value;
}

// ../../node_modules/rc-slider/es/Handles/Handle.js
var _excluded = ["prefixCls", "value", "valueIndex", "onStartMove", "style", "render", "dragging", "onOffsetChange"];
var Handle = React2.forwardRef(function(props, ref) {
  var _classNames, _getIndex;
  var prefixCls = props.prefixCls, value = props.value, valueIndex = props.valueIndex, onStartMove = props.onStartMove, style = props.style, render = props.render, dragging = props.dragging, onOffsetChange = props.onOffsetChange, restProps = _objectWithoutProperties(props, _excluded);
  var _React$useContext = React2.useContext(context_default), min = _React$useContext.min, max = _React$useContext.max, direction = _React$useContext.direction, disabled = _React$useContext.disabled, range = _React$useContext.range, tabIndex = _React$useContext.tabIndex, ariaLabelForHandle = _React$useContext.ariaLabelForHandle, ariaLabelledByForHandle = _React$useContext.ariaLabelledByForHandle, ariaValueTextFormatterForHandle = _React$useContext.ariaValueTextFormatterForHandle;
  var handlePrefixCls = "".concat(prefixCls, "-handle");
  var onInternalStartMove = function onInternalStartMove2(e) {
    if (!disabled) {
      onStartMove(e, valueIndex);
    }
  };
  var onKeyDown = function onKeyDown2(e) {
    if (!disabled) {
      var offset = null;
      switch (e.which || e.keyCode) {
        case KeyCode_default.LEFT:
          offset = direction === "ltr" || direction === "btt" ? -1 : 1;
          break;
        case KeyCode_default.RIGHT:
          offset = direction === "ltr" || direction === "btt" ? 1 : -1;
          break;
        case KeyCode_default.UP:
          offset = direction !== "ttb" ? 1 : -1;
          break;
        case KeyCode_default.DOWN:
          offset = direction !== "ttb" ? -1 : 1;
          break;
        case KeyCode_default.HOME:
          offset = "min";
          break;
        case KeyCode_default.END:
          offset = "max";
          break;
        case KeyCode_default.PAGE_UP:
          offset = 2;
          break;
        case KeyCode_default.PAGE_DOWN:
          offset = -2;
          break;
      }
      if (offset !== null) {
        e.preventDefault();
        onOffsetChange(offset, valueIndex);
      }
    }
  };
  var positionStyle = getDirectionStyle(direction, value, min, max);
  var handleNode = React2.createElement("div", _extends({
    ref,
    className: (0, import_classnames.default)(handlePrefixCls, (_classNames = {}, _defineProperty(_classNames, "".concat(handlePrefixCls, "-").concat(valueIndex + 1), range), _defineProperty(_classNames, "".concat(handlePrefixCls, "-dragging"), dragging), _classNames)),
    style: _objectSpread2(_objectSpread2({}, positionStyle), style),
    onMouseDown: onInternalStartMove,
    onTouchStart: onInternalStartMove,
    onKeyDown,
    tabIndex: disabled ? null : getIndex(tabIndex, valueIndex),
    role: "slider",
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-disabled": disabled,
    "aria-label": getIndex(ariaLabelForHandle, valueIndex),
    "aria-labelledby": getIndex(ariaLabelledByForHandle, valueIndex),
    "aria-valuetext": (_getIndex = getIndex(ariaValueTextFormatterForHandle, valueIndex)) === null || _getIndex === void 0 ? void 0 : _getIndex(value)
  }, restProps));
  if (render) {
    handleNode = render(handleNode, {
      index: valueIndex,
      prefixCls,
      value,
      dragging
    });
  }
  return handleNode;
});
if (true) {
  Handle.displayName = "Handle";
}
var Handle_default = Handle;

// ../../node_modules/rc-slider/es/Handles/index.js
var _excluded2 = ["prefixCls", "style", "onStartMove", "onOffsetChange", "values", "handleRender", "draggingIndex"];
var Handles = React3.forwardRef(function(props, ref) {
  var prefixCls = props.prefixCls, style = props.style, onStartMove = props.onStartMove, onOffsetChange = props.onOffsetChange, values = props.values, handleRender = props.handleRender, draggingIndex = props.draggingIndex, restProps = _objectWithoutProperties(props, _excluded2);
  var handlesRef = React3.useRef({});
  React3.useImperativeHandle(ref, function() {
    return {
      focus: function focus(index) {
        var _handlesRef$current$i;
        (_handlesRef$current$i = handlesRef.current[index]) === null || _handlesRef$current$i === void 0 ? void 0 : _handlesRef$current$i.focus();
      }
    };
  });
  return React3.createElement(React3.Fragment, null, values.map(function(value, index) {
    return React3.createElement(Handle_default, _extends({
      ref: function ref2(node) {
        if (!node) {
          delete handlesRef.current[index];
        } else {
          handlesRef.current[index] = node;
        }
      },
      dragging: draggingIndex === index,
      prefixCls,
      style: getIndex(style, index),
      key: index,
      value,
      valueIndex: index,
      onStartMove,
      onOffsetChange,
      render: handleRender
    }, restProps));
  }));
});
if (true) {
  Handles.displayName = "Handles";
}
var Handles_default = Handles;

// ../../node_modules/rc-slider/es/hooks/useDrag.js
var React4 = __toESM(require_react());
function getPosition(e) {
  var obj = "touches" in e ? e.touches[0] : e;
  return {
    pageX: obj.pageX,
    pageY: obj.pageY
  };
}
function useDrag(containerRef, direction, rawValues, min, max, formatValue, triggerChange, finishChange, offsetValues) {
  var _React$useState = React4.useState(null), _React$useState2 = _slicedToArray(_React$useState, 2), draggingValue = _React$useState2[0], setDraggingValue = _React$useState2[1];
  var _React$useState3 = React4.useState(-1), _React$useState4 = _slicedToArray(_React$useState3, 2), draggingIndex = _React$useState4[0], setDraggingIndex = _React$useState4[1];
  var _React$useState5 = React4.useState(rawValues), _React$useState6 = _slicedToArray(_React$useState5, 2), cacheValues = _React$useState6[0], setCacheValues = _React$useState6[1];
  var _React$useState7 = React4.useState(rawValues), _React$useState8 = _slicedToArray(_React$useState7, 2), originValues = _React$useState8[0], setOriginValues = _React$useState8[1];
  var mouseMoveEventRef = React4.useRef(null);
  var mouseUpEventRef = React4.useRef(null);
  React4.useEffect(function() {
    if (draggingIndex === -1) {
      setCacheValues(rawValues);
    }
  }, [rawValues, draggingIndex]);
  React4.useEffect(function() {
    return function() {
      document.removeEventListener("mousemove", mouseMoveEventRef.current);
      document.removeEventListener("mouseup", mouseUpEventRef.current);
      document.removeEventListener("touchmove", mouseMoveEventRef.current);
      document.removeEventListener("touchend", mouseUpEventRef.current);
    };
  }, []);
  var flushValues = function flushValues2(nextValues, nextValue) {
    if (cacheValues.some(function(val, i) {
      return val !== nextValues[i];
    })) {
      if (nextValue !== void 0) {
        setDraggingValue(nextValue);
      }
      setCacheValues(nextValues);
      triggerChange(nextValues);
    }
  };
  var updateCacheValue = function updateCacheValue2(valueIndex, offsetPercent) {
    if (valueIndex === -1) {
      var startValue = originValues[0];
      var endValue = originValues[originValues.length - 1];
      var maxStartOffset = min - startValue;
      var maxEndOffset = max - endValue;
      var offset = offsetPercent * (max - min);
      offset = Math.max(offset, maxStartOffset);
      offset = Math.min(offset, maxEndOffset);
      var formatStartValue = formatValue(startValue + offset);
      offset = formatStartValue - startValue;
      var cloneCacheValues = originValues.map(function(val) {
        return val + offset;
      });
      flushValues(cloneCacheValues);
    } else {
      var offsetDist = (max - min) * offsetPercent;
      var cloneValues = _toConsumableArray(cacheValues);
      cloneValues[valueIndex] = originValues[valueIndex];
      var next = offsetValues(cloneValues, offsetDist, valueIndex, "dist");
      flushValues(next.values, next.value);
    }
  };
  var updateCacheValueRef = React4.useRef(updateCacheValue);
  updateCacheValueRef.current = updateCacheValue;
  var onStartMove = function onStartMove2(e, valueIndex) {
    e.stopPropagation();
    var originValue = rawValues[valueIndex];
    setDraggingIndex(valueIndex);
    setDraggingValue(originValue);
    setOriginValues(rawValues);
    var _getPosition = getPosition(e), startX = _getPosition.pageX, startY = _getPosition.pageY;
    var onMouseMove = function onMouseMove2(event) {
      event.preventDefault();
      var _getPosition2 = getPosition(event), moveX = _getPosition2.pageX, moveY = _getPosition2.pageY;
      var offsetX = moveX - startX;
      var offsetY = moveY - startY;
      var _containerRef$current = containerRef.current.getBoundingClientRect(), width = _containerRef$current.width, height = _containerRef$current.height;
      var offSetPercent;
      switch (direction) {
        case "btt":
          offSetPercent = -offsetY / height;
          break;
        case "ttb":
          offSetPercent = offsetY / height;
          break;
        case "rtl":
          offSetPercent = -offsetX / width;
          break;
        default:
          offSetPercent = offsetX / width;
      }
      updateCacheValueRef.current(valueIndex, offSetPercent);
    };
    var onMouseUp = function onMouseUp2(event) {
      event.preventDefault();
      document.removeEventListener("mouseup", onMouseUp2);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp2);
      document.removeEventListener("touchmove", onMouseMove);
      mouseMoveEventRef.current = null;
      mouseUpEventRef.current = null;
      setDraggingIndex(-1);
      finishChange();
    };
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchend", onMouseUp);
    document.addEventListener("touchmove", onMouseMove);
    mouseMoveEventRef.current = onMouseMove;
    mouseUpEventRef.current = onMouseUp;
  };
  var returnValues = React4.useMemo(function() {
    var sourceValues = _toConsumableArray(rawValues).sort(function(a, b) {
      return a - b;
    });
    var targetValues = _toConsumableArray(cacheValues).sort(function(a, b) {
      return a - b;
    });
    return sourceValues.every(function(val, index) {
      return val === targetValues[index];
    }) ? cacheValues : rawValues;
  }, [rawValues, cacheValues]);
  return [draggingIndex, draggingValue, returnValues, onStartMove];
}

// ../../node_modules/rc-slider/es/Tracks/index.js
var React6 = __toESM(require_react());

// ../../node_modules/rc-slider/es/Tracks/Track.js
var React5 = __toESM(require_react());
var import_classnames2 = __toESM(require_classnames());
function Track(props) {
  var prefixCls = props.prefixCls, style = props.style, start = props.start, end = props.end, index = props.index, onStartMove = props.onStartMove;
  var _React$useContext = React5.useContext(context_default), direction = _React$useContext.direction, min = _React$useContext.min, max = _React$useContext.max, disabled = _React$useContext.disabled, range = _React$useContext.range;
  var trackPrefixCls = "".concat(prefixCls, "-track");
  var offsetStart = getOffset(start, min, max);
  var offsetEnd = getOffset(end, min, max);
  var onInternalStartMove = function onInternalStartMove2(e) {
    if (!disabled && onStartMove) {
      onStartMove(e, -1);
    }
  };
  var positionStyle = {};
  switch (direction) {
    case "rtl":
      positionStyle.right = "".concat(offsetStart * 100, "%");
      positionStyle.width = "".concat(offsetEnd * 100 - offsetStart * 100, "%");
      break;
    case "btt":
      positionStyle.bottom = "".concat(offsetStart * 100, "%");
      positionStyle.height = "".concat(offsetEnd * 100 - offsetStart * 100, "%");
      break;
    case "ttb":
      positionStyle.top = "".concat(offsetStart * 100, "%");
      positionStyle.height = "".concat(offsetEnd * 100 - offsetStart * 100, "%");
      break;
    default:
      positionStyle.left = "".concat(offsetStart * 100, "%");
      positionStyle.width = "".concat(offsetEnd * 100 - offsetStart * 100, "%");
  }
  return React5.createElement("div", {
    className: (0, import_classnames2.default)(trackPrefixCls, range && "".concat(trackPrefixCls, "-").concat(index + 1)),
    style: _objectSpread2(_objectSpread2({}, positionStyle), style),
    onMouseDown: onInternalStartMove,
    onTouchStart: onInternalStartMove
  });
}

// ../../node_modules/rc-slider/es/Tracks/index.js
function Tracks(props) {
  var prefixCls = props.prefixCls, style = props.style, values = props.values, startPoint = props.startPoint, onStartMove = props.onStartMove;
  var _React$useContext = React6.useContext(context_default), included = _React$useContext.included, range = _React$useContext.range, min = _React$useContext.min;
  var trackList = React6.useMemo(function() {
    if (!range) {
      if (values.length === 0) {
        return [];
      }
      var startValue = startPoint !== null && startPoint !== void 0 ? startPoint : min;
      var endValue = values[0];
      return [{
        start: Math.min(startValue, endValue),
        end: Math.max(startValue, endValue)
      }];
    }
    var list = [];
    for (var i = 0; i < values.length - 1; i += 1) {
      list.push({
        start: values[i],
        end: values[i + 1]
      });
    }
    return list;
  }, [values, range, startPoint, min]);
  return included ? trackList.map(function(_ref, index) {
    var start = _ref.start, end = _ref.end;
    return React6.createElement(Track, {
      index,
      prefixCls,
      style: getIndex(style, index),
      start,
      end,
      key: index,
      onStartMove
    });
  }) : null;
}

// ../../node_modules/rc-slider/es/Marks/index.js
var React8 = __toESM(require_react());

// ../../node_modules/rc-slider/es/Marks/Mark.js
var React7 = __toESM(require_react());
var import_classnames3 = __toESM(require_classnames());
function Mark(props) {
  var prefixCls = props.prefixCls, style = props.style, children = props.children, value = props.value, _onClick = props.onClick;
  var _React$useContext = React7.useContext(context_default), min = _React$useContext.min, max = _React$useContext.max, direction = _React$useContext.direction, includedStart = _React$useContext.includedStart, includedEnd = _React$useContext.includedEnd, included = _React$useContext.included;
  var textCls = "".concat(prefixCls, "-text");
  var positionStyle = getDirectionStyle(direction, value, min, max);
  return React7.createElement("span", {
    className: (0, import_classnames3.default)(textCls, _defineProperty({}, "".concat(textCls, "-active"), included && includedStart <= value && value <= includedEnd)),
    style: _objectSpread2(_objectSpread2({}, positionStyle), style),
    onMouseDown: function onMouseDown(e) {
      e.stopPropagation();
    },
    onClick: function onClick() {
      _onClick(value);
    }
  }, children);
}

// ../../node_modules/rc-slider/es/Marks/index.js
function Marks(props) {
  var prefixCls = props.prefixCls, marks = props.marks, onClick = props.onClick;
  var markPrefixCls = "".concat(prefixCls, "-mark");
  if (!marks.length) {
    return null;
  }
  return React8.createElement("div", {
    className: markPrefixCls
  }, marks.map(function(_ref) {
    var value = _ref.value, style = _ref.style, label = _ref.label;
    return React8.createElement(Mark, {
      key: value,
      prefixCls: markPrefixCls,
      style,
      value,
      onClick
    }, label);
  }));
}

// ../../node_modules/rc-slider/es/Steps/index.js
var React10 = __toESM(require_react());

// ../../node_modules/rc-slider/es/Steps/Dot.js
var React9 = __toESM(require_react());
var import_classnames4 = __toESM(require_classnames());
function Dot(props) {
  var prefixCls = props.prefixCls, value = props.value, style = props.style, activeStyle = props.activeStyle;
  var _React$useContext = React9.useContext(context_default), min = _React$useContext.min, max = _React$useContext.max, direction = _React$useContext.direction, included = _React$useContext.included, includedStart = _React$useContext.includedStart, includedEnd = _React$useContext.includedEnd;
  var dotClassName = "".concat(prefixCls, "-dot");
  var active = included && includedStart <= value && value <= includedEnd;
  var mergedStyle = _objectSpread2(_objectSpread2({}, getDirectionStyle(direction, value, min, max)), style);
  if (active) {
    mergedStyle = _objectSpread2(_objectSpread2({}, mergedStyle), activeStyle);
  }
  return React9.createElement("span", {
    className: (0, import_classnames4.default)(dotClassName, _defineProperty({}, "".concat(dotClassName, "-active"), active)),
    style: mergedStyle
  });
}

// ../../node_modules/rc-slider/es/Steps/index.js
function Steps(props) {
  var prefixCls = props.prefixCls, marks = props.marks, dots = props.dots, style = props.style, activeStyle = props.activeStyle;
  var _React$useContext = React10.useContext(context_default), min = _React$useContext.min, max = _React$useContext.max, step = _React$useContext.step;
  var stepDots = React10.useMemo(function() {
    var dotSet = /* @__PURE__ */ new Set();
    marks.forEach(function(mark) {
      dotSet.add(mark.value);
    });
    if (dots) {
      var current = min;
      while (current <= max) {
        dotSet.add(current);
        current += step;
      }
    }
    return Array.from(dotSet);
  }, [min, max, step, dots, marks]);
  return React10.createElement("div", {
    className: "".concat(prefixCls, "-step")
  }, stepDots.map(function(dotValue) {
    return React10.createElement(Dot, {
      prefixCls,
      key: dotValue,
      value: dotValue,
      style,
      activeStyle
    });
  }));
}

// ../../node_modules/rc-slider/es/hooks/useOffset.js
var React11 = __toESM(require_react());
function useOffset(min, max, step, markList, allowCross, pushable) {
  var formatRangeValue = React11.useCallback(function(val) {
    var formatNextValue = isFinite(val) ? val : min;
    formatNextValue = Math.min(max, val);
    formatNextValue = Math.max(min, formatNextValue);
    return formatNextValue;
  }, [min, max]);
  var formatStepValue = React11.useCallback(function(val) {
    if (step !== null) {
      var stepValue = min + Math.round((formatRangeValue(val) - min) / step) * step;
      var getDecimal = function getDecimal2(num) {
        return (String(num).split(".")[1] || "").length;
      };
      var maxDecimal = Math.max(getDecimal(step), getDecimal(max), getDecimal(min));
      var fixedValue = Number(stepValue.toFixed(maxDecimal));
      return min <= fixedValue && fixedValue <= max ? fixedValue : null;
    }
    return null;
  }, [step, min, max, formatRangeValue]);
  var formatValue = React11.useCallback(function(val) {
    var formatNextValue = formatRangeValue(val);
    var alignValues = markList.map(function(mark) {
      return mark.value;
    });
    if (step !== null) {
      alignValues.push(formatStepValue(val));
    }
    alignValues.push(min, max);
    var closeValue = alignValues[0];
    var closeDist = max - min;
    alignValues.forEach(function(alignValue) {
      var dist = Math.abs(formatNextValue - alignValue);
      if (dist <= closeDist) {
        closeValue = alignValue;
        closeDist = dist;
      }
    });
    return closeValue;
  }, [min, max, markList, step, formatRangeValue, formatStepValue]);
  var offsetValue = function offsetValue2(values, offset, valueIndex) {
    var mode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unit";
    if (typeof offset === "number") {
      var nextValue;
      var originValue = values[valueIndex];
      var targetDistValue = originValue + offset;
      var potentialValues = [];
      markList.forEach(function(mark) {
        potentialValues.push(mark.value);
      });
      potentialValues.push(min, max);
      potentialValues.push(formatStepValue(originValue));
      var sign = offset > 0 ? 1 : -1;
      if (mode === "unit") {
        potentialValues.push(formatStepValue(originValue + sign * step));
      } else {
        potentialValues.push(formatStepValue(targetDistValue));
      }
      potentialValues = potentialValues.filter(function(val) {
        return val !== null;
      }).filter(function(val) {
        return offset < 0 ? val <= originValue : val >= originValue;
      });
      if (mode === "unit") {
        potentialValues = potentialValues.filter(function(val) {
          return val !== originValue;
        });
      }
      var compareValue = mode === "unit" ? originValue : targetDistValue;
      nextValue = potentialValues[0];
      var valueDist = Math.abs(nextValue - compareValue);
      potentialValues.forEach(function(potentialValue) {
        var dist = Math.abs(potentialValue - compareValue);
        if (dist < valueDist) {
          nextValue = potentialValue;
          valueDist = dist;
        }
      });
      if (nextValue === void 0) {
        return offset < 0 ? min : max;
      }
      if (mode === "dist") {
        return nextValue;
      }
      if (Math.abs(offset) > 1) {
        var cloneValues = _toConsumableArray(values);
        cloneValues[valueIndex] = nextValue;
        return offsetValue2(cloneValues, offset - sign, valueIndex, mode);
      }
      return nextValue;
    } else if (offset === "min") {
      return min;
    } else if (offset === "max") {
      return max;
    }
  };
  var offsetChangedValue = function offsetChangedValue2(values, offset, valueIndex) {
    var mode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unit";
    var originValue = values[valueIndex];
    var nextValue = offsetValue(values, offset, valueIndex, mode);
    return {
      value: nextValue,
      changed: nextValue !== originValue
    };
  };
  var needPush = function needPush2(dist) {
    return pushable === null && dist === 0 || typeof pushable === "number" && dist < pushable;
  };
  var offsetValues = function offsetValues2(values, offset, valueIndex) {
    var mode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "unit";
    var nextValues = values.map(formatValue);
    var originValue = nextValues[valueIndex];
    var nextValue = offsetValue(nextValues, offset, valueIndex, mode);
    nextValues[valueIndex] = nextValue;
    if (allowCross === false) {
      var pushNum = pushable || 0;
      if (valueIndex > 0 && nextValues[valueIndex - 1] !== originValue) {
        nextValues[valueIndex] = Math.max(nextValues[valueIndex], nextValues[valueIndex - 1] + pushNum);
      }
      if (valueIndex < nextValues.length - 1 && nextValues[valueIndex + 1] !== originValue) {
        nextValues[valueIndex] = Math.min(nextValues[valueIndex], nextValues[valueIndex + 1] - pushNum);
      }
    } else if (typeof pushable === "number" || pushable === null) {
      for (var i = valueIndex + 1; i < nextValues.length; i += 1) {
        var changed = true;
        while (needPush(nextValues[i] - nextValues[i - 1]) && changed) {
          var _offsetChangedValue = offsetChangedValue(nextValues, 1, i);
          nextValues[i] = _offsetChangedValue.value;
          changed = _offsetChangedValue.changed;
        }
      }
      for (var _i = valueIndex; _i > 0; _i -= 1) {
        var _changed = true;
        while (needPush(nextValues[_i] - nextValues[_i - 1]) && _changed) {
          var _offsetChangedValue2 = offsetChangedValue(nextValues, -1, _i - 1);
          nextValues[_i - 1] = _offsetChangedValue2.value;
          _changed = _offsetChangedValue2.changed;
        }
      }
      for (var _i2 = nextValues.length - 1; _i2 > 0; _i2 -= 1) {
        var _changed2 = true;
        while (needPush(nextValues[_i2] - nextValues[_i2 - 1]) && _changed2) {
          var _offsetChangedValue3 = offsetChangedValue(nextValues, -1, _i2 - 1);
          nextValues[_i2 - 1] = _offsetChangedValue3.value;
          _changed2 = _offsetChangedValue3.changed;
        }
      }
      for (var _i3 = 0; _i3 < nextValues.length - 1; _i3 += 1) {
        var _changed3 = true;
        while (needPush(nextValues[_i3 + 1] - nextValues[_i3]) && _changed3) {
          var _offsetChangedValue4 = offsetChangedValue(nextValues, 1, _i3 + 1);
          nextValues[_i3 + 1] = _offsetChangedValue4.value;
          _changed3 = _offsetChangedValue4.changed;
        }
      }
    }
    return {
      value: nextValues[valueIndex],
      values: nextValues
    };
  };
  return [formatValue, offsetValues];
}

// ../../node_modules/rc-slider/es/Slider.js
var Slider = React12.forwardRef(function(props, ref) {
  var _classNames;
  var _props$prefixCls = props.prefixCls, prefixCls = _props$prefixCls === void 0 ? "rc-slider" : _props$prefixCls, className = props.className, style = props.style, _props$disabled = props.disabled, disabled = _props$disabled === void 0 ? false : _props$disabled, autoFocus = props.autoFocus, onFocus = props.onFocus, onBlur = props.onBlur, _props$min = props.min, min = _props$min === void 0 ? 0 : _props$min, _props$max = props.max, max = _props$max === void 0 ? 100 : _props$max, _props$step = props.step, step = _props$step === void 0 ? 1 : _props$step, value = props.value, defaultValue = props.defaultValue, range = props.range, count = props.count, onChange = props.onChange, onBeforeChange = props.onBeforeChange, onAfterChange = props.onAfterChange, _props$allowCross = props.allowCross, allowCross = _props$allowCross === void 0 ? true : _props$allowCross, _props$pushable = props.pushable, pushable = _props$pushable === void 0 ? false : _props$pushable, draggableTrack = props.draggableTrack, reverse = props.reverse, vertical = props.vertical, _props$included = props.included, included = _props$included === void 0 ? true : _props$included, startPoint = props.startPoint, trackStyle = props.trackStyle, handleStyle = props.handleStyle, railStyle = props.railStyle, dotStyle = props.dotStyle, activeDotStyle = props.activeDotStyle, marks = props.marks, dots = props.dots, handleRender = props.handleRender, _props$tabIndex = props.tabIndex, tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex, ariaLabelForHandle = props.ariaLabelForHandle, ariaLabelledByForHandle = props.ariaLabelledByForHandle, ariaValueTextFormatterForHandle = props.ariaValueTextFormatterForHandle;
  var handlesRef = React12.useRef();
  var containerRef = React12.useRef();
  var direction = React12.useMemo(function() {
    if (vertical) {
      return reverse ? "ttb" : "btt";
    }
    return reverse ? "rtl" : "ltr";
  }, [reverse, vertical]);
  var mergedMin = React12.useMemo(function() {
    return isFinite(min) ? min : 0;
  }, [min]);
  var mergedMax = React12.useMemo(function() {
    return isFinite(max) ? max : 100;
  }, [max]);
  var mergedStep = React12.useMemo(function() {
    return step !== null && step <= 0 ? 1 : step;
  }, [step]);
  var mergedPush = React12.useMemo(function() {
    if (pushable === true) {
      return mergedStep;
    }
    return pushable >= 0 ? pushable : false;
  }, [pushable, mergedStep]);
  var markList = React12.useMemo(function() {
    var keys = Object.keys(marks || {});
    return keys.map(function(key) {
      var mark = marks[key];
      var markObj = {
        value: Number(key)
      };
      if (mark && _typeof(mark) === "object" && !React12.isValidElement(mark) && ("label" in mark || "style" in mark)) {
        markObj.style = mark.style;
        markObj.label = mark.label;
      } else {
        markObj.label = mark;
      }
      return markObj;
    }).filter(function(_ref) {
      var label = _ref.label;
      return label || typeof label === "number";
    }).sort(function(a, b) {
      return a.value - b.value;
    });
  }, [marks]);
  var _useOffset = useOffset(mergedMin, mergedMax, mergedStep, markList, allowCross, mergedPush), _useOffset2 = _slicedToArray(_useOffset, 2), formatValue = _useOffset2[0], offsetValues = _useOffset2[1];
  var _useMergedState = useMergedState(defaultValue, {
    value
  }), _useMergedState2 = _slicedToArray(_useMergedState, 2), mergedValue = _useMergedState2[0], setValue = _useMergedState2[1];
  var rawValues = React12.useMemo(function() {
    var valueList = mergedValue === null || mergedValue === void 0 ? [] : Array.isArray(mergedValue) ? mergedValue : [mergedValue];
    var _valueList = _slicedToArray(valueList, 1), _valueList$ = _valueList[0], val0 = _valueList$ === void 0 ? mergedMin : _valueList$;
    var returnValues = mergedValue === null ? [] : [val0];
    if (range) {
      returnValues = _toConsumableArray(valueList);
      if (count || mergedValue === void 0) {
        var pointCount = count >= 0 ? count + 1 : 2;
        returnValues = returnValues.slice(0, pointCount);
        while (returnValues.length < pointCount) {
          var _returnValues;
          returnValues.push((_returnValues = returnValues[returnValues.length - 1]) !== null && _returnValues !== void 0 ? _returnValues : mergedMin);
        }
      }
      returnValues.sort(function(a, b) {
        return a - b;
      });
    }
    returnValues.forEach(function(val, index) {
      returnValues[index] = formatValue(val);
    });
    return returnValues;
  }, [mergedValue, range, mergedMin, count, formatValue]);
  var rawValuesRef = React12.useRef(rawValues);
  rawValuesRef.current = rawValues;
  var getTriggerValue = function getTriggerValue2(triggerValues) {
    return range ? triggerValues : triggerValues[0];
  };
  var triggerChange = function triggerChange2(nextValues) {
    var cloneNextValues = _toConsumableArray(nextValues).sort(function(a, b) {
      return a - b;
    });
    if (onChange && !(0, import_shallowequal.default)(cloneNextValues, rawValuesRef.current)) {
      onChange(getTriggerValue(cloneNextValues));
    }
    setValue(cloneNextValues);
  };
  var changeToCloseValue = function changeToCloseValue2(newValue) {
    if (!disabled) {
      var valueIndex = 0;
      var valueDist = mergedMax - mergedMin;
      rawValues.forEach(function(val, index) {
        var dist = Math.abs(newValue - val);
        if (dist <= valueDist) {
          valueDist = dist;
          valueIndex = index;
        }
      });
      var cloneNextValues = _toConsumableArray(rawValues);
      cloneNextValues[valueIndex] = newValue;
      if (range && !rawValues.length && count === void 0) {
        cloneNextValues.push(newValue);
      }
      onBeforeChange === null || onBeforeChange === void 0 ? void 0 : onBeforeChange(getTriggerValue(cloneNextValues));
      triggerChange(cloneNextValues);
      onAfterChange === null || onAfterChange === void 0 ? void 0 : onAfterChange(getTriggerValue(cloneNextValues));
    }
  };
  var onSliderMouseDown = function onSliderMouseDown2(e) {
    e.preventDefault();
    var _containerRef$current = containerRef.current.getBoundingClientRect(), width = _containerRef$current.width, height = _containerRef$current.height, left = _containerRef$current.left, top = _containerRef$current.top, bottom = _containerRef$current.bottom, right = _containerRef$current.right;
    var clientX = e.clientX, clientY = e.clientY;
    var percent;
    switch (direction) {
      case "btt":
        percent = (bottom - clientY) / height;
        break;
      case "ttb":
        percent = (clientY - top) / height;
        break;
      case "rtl":
        percent = (right - clientX) / width;
        break;
      default:
        percent = (clientX - left) / width;
    }
    var nextValue = mergedMin + percent * (mergedMax - mergedMin);
    changeToCloseValue(formatValue(nextValue));
  };
  var _React$useState = React12.useState(null), _React$useState2 = _slicedToArray(_React$useState, 2), keyboardValue = _React$useState2[0], setKeyboardValue = _React$useState2[1];
  var onHandleOffsetChange = function onHandleOffsetChange2(offset, valueIndex) {
    if (!disabled) {
      var next = offsetValues(rawValues, offset, valueIndex);
      onBeforeChange === null || onBeforeChange === void 0 ? void 0 : onBeforeChange(getTriggerValue(rawValues));
      triggerChange(next.values);
      onAfterChange === null || onAfterChange === void 0 ? void 0 : onAfterChange(getTriggerValue(next.values));
      setKeyboardValue(next.value);
    }
  };
  React12.useEffect(function() {
    if (keyboardValue !== null) {
      var valueIndex = rawValues.indexOf(keyboardValue);
      if (valueIndex >= 0) {
        handlesRef.current.focus(valueIndex);
      }
    }
    setKeyboardValue(null);
  }, [keyboardValue]);
  var mergedDraggableTrack = React12.useMemo(function() {
    if (draggableTrack && mergedStep === null) {
      if (true) {
        warning_default(false, "`draggableTrack` is not supported when `step` is `null`.");
      }
      return false;
    }
    return draggableTrack;
  }, [draggableTrack, mergedStep]);
  var finishChange = function finishChange2() {
    onAfterChange === null || onAfterChange === void 0 ? void 0 : onAfterChange(getTriggerValue(rawValuesRef.current));
  };
  var _useDrag = useDrag(containerRef, direction, rawValues, mergedMin, mergedMax, formatValue, triggerChange, finishChange, offsetValues), _useDrag2 = _slicedToArray(_useDrag, 4), draggingIndex = _useDrag2[0], draggingValue = _useDrag2[1], cacheValues = _useDrag2[2], onStartDrag = _useDrag2[3];
  var onStartMove = function onStartMove2(e, valueIndex) {
    onStartDrag(e, valueIndex);
    onBeforeChange === null || onBeforeChange === void 0 ? void 0 : onBeforeChange(getTriggerValue(rawValuesRef.current));
  };
  var dragging = draggingIndex !== -1;
  React12.useEffect(function() {
    if (!dragging) {
      var valueIndex = rawValues.lastIndexOf(draggingValue);
      handlesRef.current.focus(valueIndex);
    }
  }, [dragging]);
  var sortedCacheValues = React12.useMemo(function() {
    return _toConsumableArray(cacheValues).sort(function(a, b) {
      return a - b;
    });
  }, [cacheValues]);
  var _React$useMemo = React12.useMemo(function() {
    if (!range) {
      return [mergedMin, sortedCacheValues[0]];
    }
    return [sortedCacheValues[0], sortedCacheValues[sortedCacheValues.length - 1]];
  }, [sortedCacheValues, range, mergedMin]), _React$useMemo2 = _slicedToArray(_React$useMemo, 2), includedStart = _React$useMemo2[0], includedEnd = _React$useMemo2[1];
  React12.useImperativeHandle(ref, function() {
    return {
      focus: function focus() {
        handlesRef.current.focus(0);
      },
      blur: function blur() {
        var _document = document, activeElement = _document.activeElement;
        if (containerRef.current.contains(activeElement)) {
          activeElement === null || activeElement === void 0 ? void 0 : activeElement.blur();
        }
      }
    };
  });
  React12.useEffect(function() {
    if (autoFocus) {
      handlesRef.current.focus(0);
    }
  }, []);
  var context = React12.useMemo(function() {
    return {
      min: mergedMin,
      max: mergedMax,
      direction,
      disabled,
      step: mergedStep,
      included,
      includedStart,
      includedEnd,
      range,
      tabIndex,
      ariaLabelForHandle,
      ariaLabelledByForHandle,
      ariaValueTextFormatterForHandle
    };
  }, [mergedMin, mergedMax, direction, disabled, mergedStep, included, includedStart, includedEnd, range, tabIndex, ariaLabelForHandle, ariaLabelledByForHandle, ariaValueTextFormatterForHandle]);
  return React12.createElement(context_default.Provider, {
    value: context
  }, React12.createElement("div", {
    ref: containerRef,
    className: (0, import_classnames5.default)(prefixCls, className, (_classNames = {}, _defineProperty(_classNames, "".concat(prefixCls, "-disabled"), disabled), _defineProperty(_classNames, "".concat(prefixCls, "-vertical"), vertical), _defineProperty(_classNames, "".concat(prefixCls, "-horizontal"), !vertical), _defineProperty(_classNames, "".concat(prefixCls, "-with-marks"), markList.length), _classNames)),
    style,
    onMouseDown: onSliderMouseDown
  }, React12.createElement("div", {
    className: "".concat(prefixCls, "-rail"),
    style: railStyle
  }), React12.createElement(Tracks, {
    prefixCls,
    style: trackStyle,
    values: sortedCacheValues,
    startPoint,
    onStartMove: mergedDraggableTrack ? onStartMove : null
  }), React12.createElement(Steps, {
    prefixCls,
    marks: markList,
    dots,
    style: dotStyle,
    activeStyle: activeDotStyle
  }), React12.createElement(Handles_default, {
    ref: handlesRef,
    prefixCls,
    style: handleStyle,
    values: cacheValues,
    draggingIndex,
    onStartMove,
    onOffsetChange: onHandleOffsetChange,
    onFocus,
    onBlur,
    handleRender
  }), React12.createElement(Marks, {
    prefixCls,
    marks: markList,
    onClick: changeToCloseValue
  })));
});
if (true) {
  Slider.displayName = "Slider";
}
var Slider_default = Slider;
export {
  Slider_default as default
};
//# sourceMappingURL=rc-slider_es_Slider.js.map
