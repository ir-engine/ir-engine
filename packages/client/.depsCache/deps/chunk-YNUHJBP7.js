import {
  cc,
  shallow,
  useStore
} from "./chunk-MBQQU74W.js";
import {
  require_jsx_runtime
} from "./chunk-HFC6VKRH.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@reactflow/background/dist/esm/index.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var import_react = __toESM(require_react());
var BackgroundVariant;
(function(BackgroundVariant2) {
  BackgroundVariant2["Lines"] = "lines";
  BackgroundVariant2["Dots"] = "dots";
  BackgroundVariant2["Cross"] = "cross";
})(BackgroundVariant || (BackgroundVariant = {}));
function LinePattern({ color, dimensions, lineWidth }) {
  return (0, import_jsx_runtime.jsx)("path", { stroke: color, strokeWidth: lineWidth, d: `M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}` });
}
function DotPattern({ color, radius }) {
  return (0, import_jsx_runtime.jsx)("circle", { cx: radius, cy: radius, r: radius, fill: color });
}
var defaultColor = {
  [BackgroundVariant.Dots]: "#91919a",
  [BackgroundVariant.Lines]: "#eee",
  [BackgroundVariant.Cross]: "#e2e2e2"
};
var defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6
};
var selector = (s) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });
function Background({
  variant = BackgroundVariant.Dots,
  gap = 20,
  // only used for dots and cross
  size,
  // only used for lines and cross
  lineWidth = 1,
  color,
  style,
  className
}) {
  const ref = (0, import_react.useRef)(null);
  const { transform, patternId } = useStore(selector, shallow);
  const patternColor = color || defaultColor[variant];
  const patternSize = size || defaultSize[variant];
  const isDots = variant === BackgroundVariant.Dots;
  const isCross = variant === BackgroundVariant.Cross;
  const gapXY = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
  const scaledSize = patternSize * transform[2];
  const patternDimensions = isCross ? [scaledSize, scaledSize] : scaledGap;
  const patternOffset = isDots ? [scaledSize / 2, scaledSize / 2] : [patternDimensions[0] / 2, patternDimensions[1] / 2];
  return (0, import_jsx_runtime.jsxs)("svg", { className: cc(["react-flow__background", className]), style: {
    ...style,
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0
  }, ref, "data-testid": "rf__background", children: [(0, import_jsx_runtime.jsx)("pattern", { id: patternId, x: transform[0] % scaledGap[0], y: transform[1] % scaledGap[1], width: scaledGap[0], height: scaledGap[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${patternOffset[0]},-${patternOffset[1]})`, children: isDots ? (0, import_jsx_runtime.jsx)(DotPattern, { color: patternColor, radius: scaledSize / 2 }) : (0, import_jsx_runtime.jsx)(LinePattern, { dimensions: patternDimensions, color: patternColor, lineWidth }) }), (0, import_jsx_runtime.jsx)("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${patternId})` })] });
}
Background.displayName = "Background";
var Background$1 = (0, import_react.memo)(Background);

export {
  BackgroundVariant,
  Background$1
};
//# sourceMappingURL=chunk-YNUHJBP7.js.map
