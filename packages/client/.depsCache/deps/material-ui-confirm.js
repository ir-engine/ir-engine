import {
  Button_default,
  DialogActions_default,
  DialogContentText_default,
  DialogContent_default
} from "./chunk-TFNKSDW2.js";
import {
  Dialog_default
} from "./chunk-NO55N7JY.js";
import {
  DialogTitle_default
} from "./chunk-YVMS62KA.js";
import "./chunk-EQM5VT3B.js";
import "./chunk-6BMKQOFP.js";
import "./chunk-MGZB25OO.js";
import "./chunk-6ZQRC4WD.js";
import "./chunk-C3VJWKU4.js";
import "./chunk-GBHERAQV.js";
import "./chunk-U45QOC6H.js";
import "./chunk-ZCRLRY76.js";
import "./chunk-WZBUROHK.js";
import "./chunk-NTFZ534X.js";
import "./chunk-HXG77NMB.js";
import "./chunk-XPJ6LRS4.js";
import "./chunk-NCSYTVYE.js";
import "./chunk-IJ2Q6GXI.js";
import "./chunk-PUU2PL6X.js";
import "./chunk-7FGJOYDS.js";
import "./chunk-F37X24WP.js";
import "./chunk-CG6AQHSK.js";
import "./chunk-HUTERJYR.js";
import "./chunk-VEQ5P4GR.js";
import "./chunk-HRHMLWDD.js";
import "./chunk-OYVSTIMG.js";
import "./chunk-ZB65E5F4.js";
import "./chunk-MKJAMJDI.js";
import "./chunk-5YQ4RE4D.js";
import "./chunk-MBQSVJUP.js";
import "./chunk-VPHPUOIA.js";
import "./chunk-O66WZVWD.js";
import "./chunk-KLJMLWCS.js";
import "./chunk-ZEIPKT2T.js";
import "./chunk-WM2OC5CN.js";
import "./chunk-LKNG5Z43.js";
import "./chunk-25FF4RY5.js";
import "./chunk-HFC6VKRH.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/material-ui-confirm/dist/material-ui-confirm.esm.js
var import_react = __toESM(require_react());
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr))
    return arr;
}
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i)
        break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null)
        _i["return"]();
    } finally {
      if (_d)
        throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var ConfirmContext = (0, import_react.createContext)();
var ConfirmationDialog = function ConfirmationDialog2(_ref) {
  var open = _ref.open, options = _ref.options, onCancel = _ref.onCancel, onConfirm = _ref.onConfirm, onClose = _ref.onClose;
  var title = options.title, description = options.description, content = options.content, confirmationText = options.confirmationText, cancellationText = options.cancellationText, dialogProps = options.dialogProps, confirmationButtonProps = options.confirmationButtonProps, cancellationButtonProps = options.cancellationButtonProps, titleProps = options.titleProps, contentProps = options.contentProps, allowClose = options.allowClose;
  return import_react.default.createElement(Dialog_default, _extends({
    fullWidth: true
  }, dialogProps, {
    open,
    onClose: allowClose ? onClose : null
  }), title && import_react.default.createElement(DialogTitle_default, titleProps, title), content ? import_react.default.createElement(DialogContent_default, contentProps, content) : description && import_react.default.createElement(DialogContent_default, contentProps, import_react.default.createElement(DialogContentText_default, null, description)), import_react.default.createElement(DialogActions_default, null, import_react.default.createElement(Button_default, _extends({}, cancellationButtonProps, {
    onClick: onCancel
  }), cancellationText), import_react.default.createElement(Button_default, _extends({
    color: "primary"
  }, confirmationButtonProps, {
    onClick: onConfirm
  }), confirmationText)));
};
var DEFAULT_OPTIONS = {
  title: "Are you sure?",
  description: "",
  content: null,
  confirmationText: "Ok",
  cancellationText: "Cancel",
  dialogProps: {},
  confirmationButtonProps: {},
  cancellationButtonProps: {},
  titleProps: {},
  contentProps: {},
  allowClose: true
};
var buildOptions = function buildOptions2(defaultOptions, options) {
  var dialogProps = _objectSpread2(_objectSpread2({}, defaultOptions.dialogProps || DEFAULT_OPTIONS.dialogProps), options.dialogProps || {});
  var confirmationButtonProps = _objectSpread2(_objectSpread2({}, defaultOptions.confirmationButtonProps || DEFAULT_OPTIONS.confirmationButtonProps), options.confirmationButtonProps || {});
  var cancellationButtonProps = _objectSpread2(_objectSpread2({}, defaultOptions.cancellationButtonProps || DEFAULT_OPTIONS.cancellationButtonProps), options.cancellationButtonProps || {});
  var titleProps = _objectSpread2(_objectSpread2({}, defaultOptions.titleProps || DEFAULT_OPTIONS.titleProps), options.titleProps || {});
  var contentProps = _objectSpread2(_objectSpread2({}, defaultOptions.contentProps || DEFAULT_OPTIONS.contentProps), options.contentProps || {});
  return _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_OPTIONS), defaultOptions), options), {}, {
    dialogProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps
  });
};
var ConfirmProvider = function ConfirmProvider2(_ref) {
  var children = _ref.children, _ref$defaultOptions = _ref.defaultOptions, defaultOptions = _ref$defaultOptions === void 0 ? {} : _ref$defaultOptions;
  var _useState = (0, import_react.useState)({}), _useState2 = _slicedToArray(_useState, 2), options = _useState2[0], setOptions = _useState2[1];
  var _useState3 = (0, import_react.useState)([]), _useState4 = _slicedToArray(_useState3, 2), resolveReject = _useState4[0], setResolveReject = _useState4[1];
  var _resolveReject = _slicedToArray(resolveReject, 2), resolve = _resolveReject[0], reject = _resolveReject[1];
  var confirm = (0, import_react.useCallback)(function() {
    var options2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return new Promise(function(resolve2, reject2) {
      setOptions(options2);
      setResolveReject([resolve2, reject2]);
    });
  }, []);
  var handleClose = (0, import_react.useCallback)(function() {
    setResolveReject([]);
  }, []);
  var handleCancel = (0, import_react.useCallback)(function() {
    if (reject) {
      reject();
      handleClose();
    }
  }, [reject, handleClose]);
  var handleConfirm = (0, import_react.useCallback)(function() {
    if (resolve) {
      resolve();
      handleClose();
    }
  }, [resolve, handleClose]);
  return import_react.default.createElement(import_react.Fragment, null, import_react.default.createElement(ConfirmContext.Provider, {
    value: confirm
  }, children), import_react.default.createElement(ConfirmationDialog, {
    open: resolveReject.length === 2,
    options: buildOptions(defaultOptions, options),
    onClose: handleClose,
    onCancel: handleCancel,
    onConfirm: handleConfirm
  }));
};
var useConfirm = function useConfirm2() {
  var confirm = (0, import_react.useContext)(ConfirmContext);
  return confirm;
};
export {
  ConfirmProvider,
  useConfirm
};
//# sourceMappingURL=material-ui-confirm.js.map
