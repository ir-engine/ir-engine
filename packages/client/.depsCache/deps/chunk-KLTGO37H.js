import {
  Slide_default
} from "./chunk-PLPORHPJ.js";
import {
  Modal_default
} from "./chunk-MGZB25OO.js";
import {
  Paper_default
} from "./chunk-U45QOC6H.js";
import {
  useTheme
} from "./chunk-NCSYTVYE.js";
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
  rootShouldForwardProp,
  styled_default,
  useThemeProps
} from "./chunk-VEQ5P4GR.js";
import {
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
  generateUtilityClass,
  generateUtilityClasses,
  init_esm,
  integerPropType_default
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

// ../../node_modules/@mui/material/Drawer/Drawer.js
init_objectWithoutPropertiesLoose();
init_extends();
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());
init_clsx_m();
init_esm();
init_base();
init_capitalize();
init_useThemeProps();
init_styled();

// ../../node_modules/@mui/material/Drawer/drawerClasses.js
init_esm();
init_generateUtilityClass();
function getDrawerUtilityClass(slot) {
  return generateUtilityClass("MuiDrawer", slot);
}
var drawerClasses = generateUtilityClasses("MuiDrawer", ["root", "docked", "paper", "paperAnchorLeft", "paperAnchorRight", "paperAnchorTop", "paperAnchorBottom", "paperAnchorDockedLeft", "paperAnchorDockedRight", "paperAnchorDockedTop", "paperAnchorDockedBottom", "modal"]);
var drawerClasses_default = drawerClasses;

// ../../node_modules/@mui/material/Drawer/Drawer.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var _excluded = ["BackdropProps"];
var _excluded2 = ["anchor", "BackdropProps", "children", "className", "elevation", "hideBackdrop", "ModalProps", "onClose", "open", "PaperProps", "SlideProps", "TransitionComponent", "transitionDuration", "variant"];
var overridesResolver = (props, styles) => {
  const {
    ownerState
  } = props;
  return [styles.root, (ownerState.variant === "permanent" || ownerState.variant === "persistent") && styles.docked, styles.modal];
};
var useUtilityClasses = (ownerState) => {
  const {
    classes,
    anchor,
    variant
  } = ownerState;
  const slots = {
    root: ["root"],
    docked: [(variant === "permanent" || variant === "persistent") && "docked"],
    modal: ["modal"],
    paper: ["paper", `paperAnchor${capitalize_default(anchor)}`, variant !== "temporary" && `paperAnchorDocked${capitalize_default(anchor)}`]
  };
  return composeClasses(slots, getDrawerUtilityClass, classes);
};
var DrawerRoot = styled_default(Modal_default, {
  name: "MuiDrawer",
  slot: "Root",
  overridesResolver
})(({
  theme
}) => ({
  zIndex: (theme.vars || theme).zIndex.drawer
}));
var DrawerDockedRoot = styled_default("div", {
  shouldForwardProp: rootShouldForwardProp,
  name: "MuiDrawer",
  slot: "Docked",
  skipVariantsResolver: false,
  overridesResolver
})({
  flex: "0 0 auto"
});
var DrawerPaper = styled_default(Paper_default, {
  name: "MuiDrawer",
  slot: "Paper",
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.paper, styles[`paperAnchor${capitalize_default(ownerState.anchor)}`], ownerState.variant !== "temporary" && styles[`paperAnchorDocked${capitalize_default(ownerState.anchor)}`]];
  }
})(({
  theme,
  ownerState
}) => _extends({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flex: "1 0 auto",
  zIndex: (theme.vars || theme).zIndex.drawer,
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch",
  // temporary style
  position: "fixed",
  top: 0,
  // We disable the focus ring for mouse, touch and keyboard users.
  // At some point, it would be better to keep it for keyboard users.
  // :focus-ring CSS pseudo-class will help.
  outline: 0
}, ownerState.anchor === "left" && {
  left: 0
}, ownerState.anchor === "top" && {
  top: 0,
  left: 0,
  right: 0,
  height: "auto",
  maxHeight: "100%"
}, ownerState.anchor === "right" && {
  right: 0
}, ownerState.anchor === "bottom" && {
  top: "auto",
  left: 0,
  bottom: 0,
  right: 0,
  height: "auto",
  maxHeight: "100%"
}, ownerState.anchor === "left" && ownerState.variant !== "temporary" && {
  borderRight: `1px solid ${(theme.vars || theme).palette.divider}`
}, ownerState.anchor === "top" && ownerState.variant !== "temporary" && {
  borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`
}, ownerState.anchor === "right" && ownerState.variant !== "temporary" && {
  borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`
}, ownerState.anchor === "bottom" && ownerState.variant !== "temporary" && {
  borderTop: `1px solid ${(theme.vars || theme).palette.divider}`
}));
var oppositeDirection = {
  left: "right",
  right: "left",
  top: "down",
  bottom: "up"
};
function isHorizontal(anchor) {
  return ["left", "right"].indexOf(anchor) !== -1;
}
function getAnchor(theme, anchor) {
  return theme.direction === "rtl" && isHorizontal(anchor) ? oppositeDirection[anchor] : anchor;
}
var Drawer = React.forwardRef(function Drawer2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiDrawer"
  });
  const theme = useTheme();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen
  };
  const {
    anchor: anchorProp = "left",
    BackdropProps,
    children,
    className,
    elevation = 16,
    hideBackdrop = false,
    ModalProps: {
      BackdropProps: BackdropPropsProp
    } = {},
    onClose,
    open = false,
    PaperProps = {},
    SlideProps,
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Slide_default,
    transitionDuration = defaultTransitionDuration,
    variant = "temporary"
  } = props, ModalProps = _objectWithoutPropertiesLoose(props.ModalProps, _excluded), other = _objectWithoutPropertiesLoose(props, _excluded2);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  const anchorInvariant = getAnchor(theme, anchorProp);
  const anchor = anchorProp;
  const ownerState = _extends({}, props, {
    anchor,
    elevation,
    open,
    variant
  }, other);
  const classes = useUtilityClasses(ownerState);
  const drawer = (0, import_jsx_runtime.jsx)(DrawerPaper, _extends({
    elevation: variant === "temporary" ? elevation : 0,
    square: true
  }, PaperProps, {
    className: clsx_m_default(classes.paper, PaperProps.className),
    ownerState,
    children
  }));
  if (variant === "permanent") {
    return (0, import_jsx_runtime.jsx)(DrawerDockedRoot, _extends({
      className: clsx_m_default(classes.root, classes.docked, className),
      ownerState,
      ref
    }, other, {
      children: drawer
    }));
  }
  const slidingDrawer = (0, import_jsx_runtime.jsx)(TransitionComponent, _extends({
    in: open,
    direction: oppositeDirection[anchorInvariant],
    timeout: transitionDuration,
    appear: mounted.current
  }, SlideProps, {
    children: drawer
  }));
  if (variant === "persistent") {
    return (0, import_jsx_runtime.jsx)(DrawerDockedRoot, _extends({
      className: clsx_m_default(classes.root, classes.docked, className),
      ownerState,
      ref
    }, other, {
      children: slidingDrawer
    }));
  }
  return (0, import_jsx_runtime.jsx)(DrawerRoot, _extends({
    BackdropProps: _extends({}, BackdropProps, BackdropPropsProp, {
      transitionDuration
    }),
    className: clsx_m_default(classes.root, classes.modal, className),
    open,
    ownerState,
    onClose,
    hideBackdrop,
    ref
  }, other, ModalProps, {
    children: slidingDrawer
  }));
});
true ? Drawer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * Side from which the drawer will appear.
   * @default 'left'
   */
  anchor: import_prop_types.default.oneOf(["bottom", "left", "right", "top"]),
  /**
   * @ignore
   */
  BackdropProps: import_prop_types.default.object,
  /**
   * The content of the component.
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
   * The elevation of the drawer.
   * @default 16
   */
  elevation: integerPropType_default,
  /**
   * If `true`, the backdrop is not rendered.
   * @default false
   */
  hideBackdrop: import_prop_types.default.bool,
  /**
   * Props applied to the [`Modal`](/material-ui/api/modal/) element.
   * @default {}
   */
  ModalProps: import_prop_types.default.object,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   */
  onClose: import_prop_types.default.func,
  /**
   * If `true`, the component is shown.
   * @default false
   */
  open: import_prop_types.default.bool,
  /**
   * Props applied to the [`Paper`](/material-ui/api/paper/) element.
   * @default {}
   */
  PaperProps: import_prop_types.default.object,
  /**
   * Props applied to the [`Slide`](/material-ui/api/slide/) element.
   */
  SlideProps: import_prop_types.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object]),
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  transitionDuration: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.shape({
    appear: import_prop_types.default.number,
    enter: import_prop_types.default.number,
    exit: import_prop_types.default.number
  })]),
  /**
   * The variant to use.
   * @default 'temporary'
   */
  variant: import_prop_types.default.oneOf(["permanent", "persistent", "temporary"])
} : void 0;
var Drawer_default = Drawer;

export {
  getDrawerUtilityClass,
  drawerClasses_default,
  isHorizontal,
  getAnchor,
  Drawer_default
};
//# sourceMappingURL=chunk-KLTGO37H.js.map
