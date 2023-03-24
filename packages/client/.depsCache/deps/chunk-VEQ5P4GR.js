import {
  createStyled,
  defaultTheme_default,
  init_defaultTheme,
  init_esm,
  shouldForwardProp,
  useThemeProps
} from "./chunk-HRHMLWDD.js";
import {
  __esm
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@mui/material/styles/useThemeProps.js
function useThemeProps2({
  props,
  name
}) {
  return useThemeProps({
    props,
    name,
    defaultTheme: defaultTheme_default
  });
}
var init_useThemeProps = __esm({
  "../../node_modules/@mui/material/styles/useThemeProps.js"() {
    init_esm();
    init_defaultTheme();
  }
});

// ../../node_modules/@mui/material/styles/styled.js
var rootShouldForwardProp, slotShouldForwardProp, styled, styled_default;
var init_styled = __esm({
  "../../node_modules/@mui/material/styles/styled.js"() {
    init_esm();
    init_defaultTheme();
    rootShouldForwardProp = (prop) => shouldForwardProp(prop) && prop !== "classes";
    slotShouldForwardProp = shouldForwardProp;
    styled = createStyled({
      defaultTheme: defaultTheme_default,
      rootShouldForwardProp
    });
    styled_default = styled;
  }
});

export {
  useThemeProps2 as useThemeProps,
  init_useThemeProps,
  rootShouldForwardProp,
  slotShouldForwardProp,
  styled_default,
  init_styled
};
//# sourceMappingURL=chunk-VEQ5P4GR.js.map
