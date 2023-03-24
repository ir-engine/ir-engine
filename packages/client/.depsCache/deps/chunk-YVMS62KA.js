import {
  Typography_default
} from "./chunk-EQM5VT3B.js";
import {
  DialogContext_default
} from "./chunk-6BMKQOFP.js";
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

// ../../node_modules/@mui/material/DialogTitle/DialogTitle.js
init_extends();
init_objectWithoutPropertiesLoose();
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());
init_clsx_m();
init_base();
init_styled();
init_useThemeProps();

// ../../node_modules/@mui/material/DialogTitle/dialogTitleClasses.js
init_esm();
init_generateUtilityClass();
function getDialogTitleUtilityClass(slot) {
  return generateUtilityClass("MuiDialogTitle", slot);
}
var dialogTitleClasses = generateUtilityClasses("MuiDialogTitle", ["root"]);
var dialogTitleClasses_default = dialogTitleClasses;

// ../../node_modules/@mui/material/DialogTitle/DialogTitle.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var _excluded = ["className", "id"];
var useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getDialogTitleUtilityClass, classes);
};
var DialogTitleRoot = styled_default(Typography_default, {
  name: "MuiDialogTitle",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  padding: "16px 24px",
  flex: "0 0 auto"
});
var DialogTitle = React.forwardRef(function DialogTitle2(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: "MuiDialogTitle"
  });
  const {
    className,
    id: idProp
  } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);
  const {
    titleId: id = idProp
  } = React.useContext(DialogContext_default);
  return (0, import_jsx_runtime.jsx)(DialogTitleRoot, _extends({
    component: "h2",
    className: clsx_m_default(classes.root, className),
    ownerState,
    ref,
    variant: "h6",
    id
  }, other));
});
true ? DialogTitle.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
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
   * @ignore
   */
  id: import_prop_types.default.string,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object])
} : void 0;
var DialogTitle_default = DialogTitle;

export {
  getDialogTitleUtilityClass,
  dialogTitleClasses_default,
  DialogTitle_default
};
//# sourceMappingURL=chunk-YVMS62KA.js.map
