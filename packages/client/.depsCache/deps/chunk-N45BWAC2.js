import {
  capitalize_default,
  init_capitalize
} from "./chunk-F37X24WP.js";
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
  init_esm as init_esm2,
  init_generateUtilityClass
} from "./chunk-HRHMLWDD.js";
import {
  Ce,
  Ue
} from "./chunk-OYVSTIMG.js";
import {
  clsx_m_default,
  init_clsx_m
} from "./chunk-MKJAMJDI.js";
import {
  _objectWithoutPropertiesLoose,
  init_objectWithoutPropertiesLoose
} from "./chunk-MBQSVJUP.js";
import {
  chainPropTypes,
  composeClasses,
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

// ../../node_modules/@mui/material/CircularProgress/CircularProgress.js
init_objectWithoutPropertiesLoose();
init_extends();
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());
init_clsx_m();
init_esm();
init_base();
init_esm2();
init_capitalize();
init_useThemeProps();
init_styled();

// ../../node_modules/@mui/material/CircularProgress/circularProgressClasses.js
init_esm();
init_generateUtilityClass();
function getCircularProgressUtilityClass(slot) {
  return generateUtilityClass("MuiCircularProgress", slot);
}
var circularProgressClasses = generateUtilityClasses("MuiCircularProgress", ["root", "determinate", "indeterminate", "colorPrimary", "colorSecondary", "svg", "circle", "circleDeterminate", "circleIndeterminate", "circleDisableShrink"]);
var circularProgressClasses_default = circularProgressClasses;

// ../../node_modules/@mui/material/CircularProgress/CircularProgress.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var _excluded = ["className", "color", "disableShrink", "size", "style", "thickness", "value", "variant"];
var _ = (t) => t;
var _t;
var _t2;
var _t3;
var _t4;
var SIZE = 44;
var circularRotateKeyframe = Ue(_t || (_t = _`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`));
var circularDashKeyframe = Ue(_t2 || (_t2 = _`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
`));
var useUtilityClasses = (ownerState) => {
  const {
    classes,
    variant,
    color,
    disableShrink
  } = ownerState;
  const slots = {
    root: ["root", variant, `color${capitalize_default(color)}`],
    svg: ["svg"],
    circle: ["circle", `circle${capitalize_default(variant)}`, disableShrink && "circleDisableShrink"]
  };
  return composeClasses(slots, getCircularProgressUtilityClass, classes);
};
var CircularProgressRoot = styled_default("span", {
  name: "MuiCircularProgress",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.root, styles[ownerState.variant], styles[`color${capitalize_default(ownerState.color)}`]];
  }
})(({
  ownerState,
  theme
}) => _extends({
  display: "inline-block"
}, ownerState.variant === "determinate" && {
  transition: theme.transitions.create("transform")
}, ownerState.color !== "inherit" && {
  color: (theme.vars || theme).palette[ownerState.color].main
}), ({
  ownerState
}) => ownerState.variant === "indeterminate" && Ce(_t3 || (_t3 = _`
      animation: ${0} 1.4s linear infinite;
    `), circularRotateKeyframe));
var CircularProgressSVG = styled_default("svg", {
  name: "MuiCircularProgress",
  slot: "Svg",
  overridesResolver: (props, styles) => styles.svg
})({
  display: "block"
  // Keeps the progress centered
});
var CircularProgressCircle = styled_default("circle", {
  name: "MuiCircularProgress",
  slot: "Circle",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.circle, styles[`circle${capitalize_default(ownerState.variant)}`], ownerState.disableShrink && styles.circleDisableShrink];
  }
})(({
  ownerState,
  theme
}) => _extends({
  stroke: "currentColor"
}, ownerState.variant === "determinate" && {
  transition: theme.transitions.create("stroke-dashoffset")
}, ownerState.variant === "indeterminate" && {
  // Some default value that looks fine waiting for the animation to kicks in.
  strokeDasharray: "80px, 200px",
  strokeDashoffset: 0
  // Add the unit to fix a Edge 16 and below bug.
}), ({
  ownerState
}) => ownerState.variant === "indeterminate" && !ownerState.disableShrink && Ce(_t4 || (_t4 = _`
      animation: ${0} 1.4s ease-in-out infinite;
    `), circularDashKeyframe));
var CircularProgress = React.forwardRef(function CircularProgress2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiCircularProgress"
  });
  const {
    className,
    color = "primary",
    disableShrink = false,
    size = 40,
    style,
    thickness = 3.6,
    value = 0,
    variant = "indeterminate"
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = _extends({}, props, {
    color,
    disableShrink,
    size,
    thickness,
    value,
    variant
  });
  const classes = useUtilityClasses(ownerState);
  const circleStyle = {};
  const rootStyle = {};
  const rootProps = {};
  if (variant === "determinate") {
    const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
    circleStyle.strokeDasharray = circumference.toFixed(3);
    rootProps["aria-valuenow"] = Math.round(value);
    circleStyle.strokeDashoffset = `${((100 - value) / 100 * circumference).toFixed(3)}px`;
    rootStyle.transform = "rotate(-90deg)";
  }
  return (0, import_jsx_runtime.jsx)(CircularProgressRoot, _extends({
    className: clsx_m_default(classes.root, className),
    style: _extends({
      width: size,
      height: size
    }, rootStyle, style),
    ownerState,
    ref,
    role: "progressbar"
  }, rootProps, other, {
    children: (0, import_jsx_runtime.jsx)(CircularProgressSVG, {
      className: classes.svg,
      ownerState,
      viewBox: `${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`,
      children: (0, import_jsx_runtime.jsx)(CircularProgressCircle, {
        className: classes.circle,
        style: circleStyle,
        ownerState,
        cx: SIZE,
        cy: SIZE,
        r: (SIZE - thickness) / 2,
        fill: "none",
        strokeWidth: thickness
      })
    })
  }));
});
true ? CircularProgress.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: import_prop_types.default.object,
  /**
   * @ignore
   */
  className: import_prop_types.default.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#adding-new-colors).
   * @default 'primary'
   */
  color: import_prop_types.default.oneOfType([import_prop_types.default.oneOf(["inherit", "primary", "secondary", "error", "info", "success", "warning"]), import_prop_types.default.string]),
  /**
   * If `true`, the shrink animation is disabled.
   * This only works if variant is `indeterminate`.
   * @default false
   */
  disableShrink: chainPropTypes(import_prop_types.default.bool, (props) => {
    if (props.disableShrink && props.variant && props.variant !== "indeterminate") {
      return new Error("MUI: You have provided the `disableShrink` prop with a variant other than `indeterminate`. This will have no effect.");
    }
    return null;
  }),
  /**
   * The size of the component.
   * If using a number, the pixel unit is assumed.
   * If using a string, you need to provide the CSS unit, e.g '3rem'.
   * @default 40
   */
  size: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
  /**
   * @ignore
   */
  style: import_prop_types.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object]),
  /**
   * The thickness of the circle.
   * @default 3.6
   */
  thickness: import_prop_types.default.number,
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: import_prop_types.default.number,
  /**
   * The variant to use.
   * Use indeterminate when there is no progress value.
   * @default 'indeterminate'
   */
  variant: import_prop_types.default.oneOf(["determinate", "indeterminate"])
} : void 0;
var CircularProgress_default = CircularProgress;

export {
  getCircularProgressUtilityClass,
  circularProgressClasses_default,
  CircularProgress_default
};
//# sourceMappingURL=chunk-N45BWAC2.js.map
