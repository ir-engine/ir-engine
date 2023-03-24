import {
  createBox,
  createTheme_default,
  init_esm as init_esm2
} from "./chunk-HRHMLWDD.js";
import {
  ClassNameGenerator_default,
  init_esm
} from "./chunk-O66WZVWD.js";
import {
  require_prop_types
} from "./chunk-WM2OC5CN.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/material/Box/Box.js
init_esm2();
var import_prop_types = __toESM(require_prop_types());

// ../../node_modules/@mui/material/className/index.js
init_esm();

// ../../node_modules/@mui/material/Box/Box.js
var defaultTheme = createTheme_default();
var Box = createBox({
  defaultTheme,
  defaultClassName: "MuiBox-root",
  generateClassName: ClassNameGenerator_default.generate
});
true ? Box.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * @ignore
   */
  children: import_prop_types.default.node,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: import_prop_types.default.elementType,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object])
} : void 0;
var Box_default = Box;

export {
  Box_default
};
//# sourceMappingURL=chunk-ANLCC5IZ.js.map
