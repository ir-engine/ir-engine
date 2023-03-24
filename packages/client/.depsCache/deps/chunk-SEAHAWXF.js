import {
  getTransitionProps
} from "./chunk-C3VJWKU4.js";
import {
  Transition_default
} from "./chunk-ZCRLRY76.js";
import {
  useTheme
} from "./chunk-NCSYTVYE.js";
import {
  init_utils
} from "./chunk-3NGIVAYM.js";
import {
  useForkRef_default
} from "./chunk-7FGJOYDS.js";
import {
  init_base
} from "./chunk-CG6AQHSK.js";
import {
  init_styled,
  init_useThemeProps,
  styled_default,
  useThemeProps
} from "./chunk-VEQ5P4GR.js";
import {
  duration,
  init_createTransitions,
  init_generateUtilityClass
} from "./chunk-HRHMLWDD.js";
import {
  clsx_m_default,
  init_clsx_m
} from "./chunk-MKJAMJDI.js";
import {
  _objectWithoutPropertiesLoose,
  init_objectWithoutPropertiesLoose
} from "./chunk-MBQSVJUP.js";
import {
  composeClasses,
  elementTypeAcceptingRef_default,
  generateUtilityClass,
  generateUtilityClasses,
  init_esm
} from "./chunk-O66WZVWD.js";
import {
  _extends,
  init_extends
} from "./chunk-ZEIPKT2T.js";
import {
  require_prop_types
} from "./chunk-WM2OC5CN.js";
import {
  require_jsx_runtime
} from "./chunk-HFC6VKRH.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/material/Collapse/Collapse.js
init_objectWithoutPropertiesLoose();
init_extends();
var React = __toESM(require_react());
init_clsx_m();
var import_prop_types = __toESM(require_prop_types());
init_esm();
init_base();
init_styled();
init_useThemeProps();
init_createTransitions();
init_utils();

// ../../node_modules/@mui/material/Collapse/collapseClasses.js
init_esm();
init_generateUtilityClass();
function getCollapseUtilityClass(slot) {
  return generateUtilityClass("MuiCollapse", slot);
}
var collapseClasses = generateUtilityClasses("MuiCollapse", ["root", "horizontal", "vertical", "entered", "hidden", "wrapper", "wrapperInner"]);
var collapseClasses_default = collapseClasses;

// ../../node_modules/@mui/material/Collapse/Collapse.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var _excluded = ["addEndListener", "children", "className", "collapsedSize", "component", "easing", "in", "onEnter", "onEntered", "onEntering", "onExit", "onExited", "onExiting", "orientation", "style", "timeout", "TransitionComponent"];
var useUtilityClasses = (ownerState) => {
  const {
    orientation,
    classes
  } = ownerState;
  const slots = {
    root: ["root", `${orientation}`],
    entered: ["entered"],
    hidden: ["hidden"],
    wrapper: ["wrapper", `${orientation}`],
    wrapperInner: ["wrapperInner", `${orientation}`]
  };
  return composeClasses(slots, getCollapseUtilityClass, classes);
};
var CollapseRoot = styled_default("div", {
  name: "MuiCollapse",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.orientation], ownerState.state === "entered" && styles.entered, ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px" && styles.hidden];
  }
})(({
  theme,
  ownerState
}) => _extends({
  height: 0,
  overflow: "hidden",
  transition: theme.transitions.create("height")
}, ownerState.orientation === "horizontal" && {
  height: "auto",
  width: 0,
  transition: theme.transitions.create("width")
}, ownerState.state === "entered" && _extends({
  height: "auto",
  overflow: "visible"
}, ownerState.orientation === "horizontal" && {
  width: "auto"
}), ownerState.state === "exited" && !ownerState.in && ownerState.collapsedSize === "0px" && {
  visibility: "hidden"
}));
var CollapseWrapper = styled_default("div", {
  name: "MuiCollapse",
  slot: "Wrapper",
  overridesResolver: (props, styles) => styles.wrapper
})(({
  ownerState
}) => _extends({
  // Hack to get children with a negative margin to not falsify the height computation.
  display: "flex",
  width: "100%"
}, ownerState.orientation === "horizontal" && {
  width: "auto",
  height: "100%"
}));
var CollapseWrapperInner = styled_default("div", {
  name: "MuiCollapse",
  slot: "WrapperInner",
  overridesResolver: (props, styles) => styles.wrapperInner
})(({
  ownerState
}) => _extends({
  width: "100%"
}, ownerState.orientation === "horizontal" && {
  width: "auto",
  height: "100%"
}));
var Collapse = React.forwardRef(function Collapse2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiCollapse"
  });
  const {
    addEndListener,
    children,
    className,
    collapsedSize: collapsedSizeProp = "0px",
    component,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    orientation = "vertical",
    style,
    timeout = duration.standard,
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Transition_default
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = _extends({}, props, {
    orientation,
    collapsedSize: collapsedSizeProp
  });
  const classes = useUtilityClasses(ownerState);
  const theme = useTheme();
  const timer = React.useRef();
  const wrapperRef = React.useRef(null);
  const autoTransitionDuration = React.useRef();
  const collapsedSize = typeof collapsedSizeProp === "number" ? `${collapsedSizeProp}px` : collapsedSizeProp;
  const isHorizontal = orientation === "horizontal";
  const size = isHorizontal ? "width" : "height";
  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);
  const nodeRef = React.useRef(null);
  const handleRef = useForkRef_default(ref, nodeRef);
  const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
    if (callback) {
      const node = nodeRef.current;
      if (maybeIsAppearing === void 0) {
        callback(node);
      } else {
        callback(node, maybeIsAppearing);
      }
    }
  };
  const getWrapperSize = () => wrapperRef.current ? wrapperRef.current[isHorizontal ? "clientWidth" : "clientHeight"] : 0;
  const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "absolute";
    }
    node.style[size] = collapsedSize;
    if (onEnter) {
      onEnter(node, isAppearing);
    }
  });
  const handleEntering = normalizedTransitionCallback((node, isAppearing) => {
    const wrapperSize = getWrapperSize();
    if (wrapperRef.current && isHorizontal) {
      wrapperRef.current.style.position = "";
    }
    const {
      duration: transitionDuration,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "enter"
    });
    if (timeout === "auto") {
      const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }
    node.style[size] = `${wrapperSize}px`;
    node.style.transitionTimingFunction = transitionTimingFunction;
    if (onEntering) {
      onEntering(node, isAppearing);
    }
  });
  const handleEntered = normalizedTransitionCallback((node, isAppearing) => {
    node.style[size] = "auto";
    if (onEntered) {
      onEntered(node, isAppearing);
    }
  });
  const handleExit = normalizedTransitionCallback((node) => {
    node.style[size] = `${getWrapperSize()}px`;
    if (onExit) {
      onExit(node);
    }
  });
  const handleExited = normalizedTransitionCallback(onExited);
  const handleExiting = normalizedTransitionCallback((node) => {
    const wrapperSize = getWrapperSize();
    const {
      duration: transitionDuration,
      easing: transitionTimingFunction
    } = getTransitionProps({
      style,
      timeout,
      easing
    }, {
      mode: "exit"
    });
    if (timeout === "auto") {
      const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
      node.style.transitionDuration = `${duration2}ms`;
      autoTransitionDuration.current = duration2;
    } else {
      node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : `${transitionDuration}ms`;
    }
    node.style[size] = collapsedSize;
    node.style.transitionTimingFunction = transitionTimingFunction;
    if (onExiting) {
      onExiting(node);
    }
  });
  const handleAddEndListener = (next) => {
    if (timeout === "auto") {
      timer.current = setTimeout(next, autoTransitionDuration.current || 0);
    }
    if (addEndListener) {
      addEndListener(nodeRef.current, next);
    }
  };
  return (0, import_jsx_runtime.jsx)(TransitionComponent, _extends({
    in: inProp,
    onEnter: handleEnter,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited: handleExited,
    onExiting: handleExiting,
    addEndListener: handleAddEndListener,
    nodeRef,
    timeout: timeout === "auto" ? null : timeout
  }, other, {
    children: (state, childProps) => (0, import_jsx_runtime.jsx)(CollapseRoot, _extends({
      as: component,
      className: clsx_m_default(classes.root, className, {
        "entered": classes.entered,
        "exited": !inProp && collapsedSize === "0px" && classes.hidden
      }[state]),
      style: _extends({
        [isHorizontal ? "minWidth" : "minHeight"]: collapsedSize
      }, style),
      ownerState: _extends({}, ownerState, {
        state
      }),
      ref: handleRef
    }, childProps, {
      children: (0, import_jsx_runtime.jsx)(CollapseWrapper, {
        ownerState: _extends({}, ownerState, {
          state
        }),
        className: classes.wrapper,
        ref: wrapperRef,
        children: (0, import_jsx_runtime.jsx)(CollapseWrapperInner, {
          ownerState: _extends({}, ownerState, {
            state
          }),
          className: classes.wrapperInner,
          children
        })
      })
    }))
  }));
});
true ? Collapse.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * Add a custom transition end trigger. Called with the transitioning DOM
   * node and a done callback. Allows for more fine grained transition end
   * logic. Note: Timeouts are still used as a fallback if provided.
   */
  addEndListener: import_prop_types.default.func,
  /**
   * The content node to be collapsed.
   */
  children: import_prop_types.default.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: import_prop_types.default.object,
  /**
   * @ignore
   */
  className: import_prop_types.default.string,
  /**
   * The width (horizontal) or height (vertical) of the container when collapsed.
   * @default '0px'
   */
  collapsedSize: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: elementTypeAcceptingRef_default,
  /**
   * The transition timing function.
   * You may specify a single easing or a object containing enter and exit values.
   */
  easing: import_prop_types.default.oneOfType([import_prop_types.default.shape({
    enter: import_prop_types.default.string,
    exit: import_prop_types.default.string
  }), import_prop_types.default.string]),
  /**
   * If `true`, the component will transition in.
   */
  in: import_prop_types.default.bool,
  /**
   * @ignore
   */
  onEnter: import_prop_types.default.func,
  /**
   * @ignore
   */
  onEntered: import_prop_types.default.func,
  /**
   * @ignore
   */
  onEntering: import_prop_types.default.func,
  /**
   * @ignore
   */
  onExit: import_prop_types.default.func,
  /**
   * @ignore
   */
  onExited: import_prop_types.default.func,
  /**
   * @ignore
   */
  onExiting: import_prop_types.default.func,
  /**
   * The transition orientation.
   * @default 'vertical'
   */
  orientation: import_prop_types.default.oneOf(["horizontal", "vertical"]),
  /**
   * @ignore
   */
  style: import_prop_types.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object]),
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   *
   * Set to 'auto' to automatically calculate transition time based on height.
   * @default duration.standard
   */
  timeout: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["auto"]), import_prop_types.default.number, import_prop_types.default.shape({
    appear: import_prop_types.default.number,
    enter: import_prop_types.default.number,
    exit: import_prop_types.default.number
  })])
} : void 0;
Collapse.muiSupportAuto = true;
var Collapse_default = Collapse;

export {
  getCollapseUtilityClass,
  collapseClasses_default,
  Collapse_default
};
//# sourceMappingURL=chunk-SEAHAWXF.js.map
