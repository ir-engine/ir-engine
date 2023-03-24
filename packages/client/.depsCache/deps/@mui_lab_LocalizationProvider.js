import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/lab/LocalizationProvider/LocalizationProvider.js
var React = __toESM(require_react());
var warnedOnce = false;
var warn = () => {
  if (!warnedOnce) {
    console.warn(["MUI: The LocalizationProvider component was moved from `@mui/lab` to `@mui/x-date-pickers`.", "", "You should use `import { LocalizationProvider } from '@mui/x-date-pickers'`", "or `import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'`", "", "More information about this migration on our blog: https://mui.com/blog/lab-date-pickers-to-mui-x/."].join("\n"));
    warnedOnce = true;
  }
};
var LocalizationProvider = React.forwardRef(function DeprecatedLocalizationProvider() {
  warn();
  return null;
});
var LocalizationProvider_default = LocalizationProvider;
export {
  LocalizationProvider_default as default
};
//# sourceMappingURL=@mui_lab_LocalizationProvider.js.map
