import {
  exactProp,
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
  __esm,
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/private-theming/useTheme/ThemeContext.js
var React, ThemeContext, ThemeContext_default;
var init_ThemeContext = __esm({
  "../../node_modules/@mui/private-theming/useTheme/ThemeContext.js"() {
    React = __toESM(require_react());
    ThemeContext = React.createContext(null);
    if (true) {
      ThemeContext.displayName = "ThemeContext";
    }
    ThemeContext_default = ThemeContext;
  }
});

// ../../node_modules/@mui/private-theming/useTheme/useTheme.js
function useTheme() {
  const theme = React2.useContext(ThemeContext_default);
  if (true) {
    React2.useDebugValue(theme);
  }
  return theme;
}
var React2;
var init_useTheme = __esm({
  "../../node_modules/@mui/private-theming/useTheme/useTheme.js"() {
    React2 = __toESM(require_react());
    init_ThemeContext();
  }
});

// ../../node_modules/@mui/private-theming/useTheme/index.js
var init_useTheme2 = __esm({
  "../../node_modules/@mui/private-theming/useTheme/index.js"() {
    init_useTheme();
  }
});

// ../../node_modules/@mui/private-theming/ThemeProvider/nested.js
var hasSymbol, nested_default;
var init_nested = __esm({
  "../../node_modules/@mui/private-theming/ThemeProvider/nested.js"() {
    hasSymbol = typeof Symbol === "function" && Symbol.for;
    nested_default = hasSymbol ? Symbol.for("mui.nested") : "__THEME_NESTED__";
  }
});

// ../../node_modules/@mui/private-theming/ThemeProvider/ThemeProvider.js
function mergeOuterLocalTheme(outerTheme, localTheme) {
  if (typeof localTheme === "function") {
    const mergedTheme = localTheme(outerTheme);
    if (true) {
      if (!mergedTheme) {
        console.error(["MUI: You should return an object from your theme function, i.e.", "<ThemeProvider theme={() => ({})} />"].join("\n"));
      }
    }
    return mergedTheme;
  }
  return _extends({}, outerTheme, localTheme);
}
function ThemeProvider(props) {
  const {
    children,
    theme: localTheme
  } = props;
  const outerTheme = useTheme();
  if (true) {
    if (outerTheme === null && typeof localTheme === "function") {
      console.error(["MUI: You are providing a theme function prop to the ThemeProvider component:", "<ThemeProvider theme={outerTheme => outerTheme} />", "", "However, no outer theme is present.", "Make sure a theme is already injected higher in the React tree or provide a theme object."].join("\n"));
    }
  }
  const theme = React3.useMemo(() => {
    const output = outerTheme === null ? localTheme : mergeOuterLocalTheme(outerTheme, localTheme);
    if (output != null) {
      output[nested_default] = outerTheme !== null;
    }
    return output;
  }, [localTheme, outerTheme]);
  return (0, import_jsx_runtime.jsx)(ThemeContext_default.Provider, {
    value: theme,
    children
  });
}
var React3, import_prop_types, import_jsx_runtime, ThemeProvider_default;
var init_ThemeProvider = __esm({
  "../../node_modules/@mui/private-theming/ThemeProvider/ThemeProvider.js"() {
    init_extends();
    React3 = __toESM(require_react());
    import_prop_types = __toESM(require_prop_types());
    init_esm();
    init_ThemeContext();
    init_useTheme2();
    init_nested();
    import_jsx_runtime = __toESM(require_jsx_runtime());
    true ? ThemeProvider.propTypes = {
      /**
       * Your component tree.
       */
      children: import_prop_types.default.node,
      /**
       * A theme object. You can provide a function to extend the outer theme.
       */
      theme: import_prop_types.default.oneOfType([import_prop_types.default.object, import_prop_types.default.func]).isRequired
    } : void 0;
    if (true) {
      true ? ThemeProvider.propTypes = exactProp(ThemeProvider.propTypes) : void 0;
    }
    ThemeProvider_default = ThemeProvider;
  }
});

// ../../node_modules/@mui/private-theming/ThemeProvider/index.js
var init_ThemeProvider2 = __esm({
  "../../node_modules/@mui/private-theming/ThemeProvider/index.js"() {
    init_ThemeProvider();
    init_nested();
  }
});

export {
  useTheme,
  init_useTheme2 as init_useTheme,
  nested_default,
  ThemeProvider_default,
  init_ThemeProvider2 as init_ThemeProvider
};
//# sourceMappingURL=chunk-5YQ4RE4D.js.map
