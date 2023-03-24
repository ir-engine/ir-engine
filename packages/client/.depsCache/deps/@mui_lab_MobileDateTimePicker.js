import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/lab/MobileDateTimePicker/MobileDateTimePicker.js
var React = __toESM(require_react());
var warnedOnce = false;
var warn = () => {
  if (!warnedOnce) {
    console.warn(["MUI: The MobileDateTimePicker component was moved from `@mui/lab` to `@mui/x-date-pickers`.", "", "You should use `import { MobileDateTimePicker } from '@mui/x-date-pickers'`", "or `import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'`", "", "More information about this migration on our blog: https://mui.com/blog/lab-date-pickers-to-mui-x/."].join("\n"));
    warnedOnce = true;
  }
};
var MobileDateTimePicker = React.forwardRef(function DeprecatedMobileDateTimePicker() {
  warn();
  return null;
});
var MobileDateTimePicker_default = MobileDateTimePicker;
export {
  MobileDateTimePicker_default as default
};
//# sourceMappingURL=@mui_lab_MobileDateTimePicker.js.map
