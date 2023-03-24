import {
  Panel,
  cc,
  getBoundsOfRects,
  getNodePositionWithOrigin,
  getRectOfNodes,
  identity,
  pointer_default,
  select_default,
  shallow,
  useStore,
  useStoreApi,
  zoom_default
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

// ../../node_modules/@reactflow/minimap/dist/esm/index.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var import_react = __toESM(require_react());
var MiniMapNode = ({ id, x, y, width, height, style, color, strokeColor, strokeWidth, className, borderRadius, shapeRendering, onClick }) => {
  const { background, backgroundColor } = style || {};
  const fill = color || background || backgroundColor;
  return (0, import_jsx_runtime.jsx)("rect", { className: cc(["react-flow__minimap-node", className]), x, y, rx: borderRadius, ry: borderRadius, width, height, fill, stroke: strokeColor, strokeWidth, shapeRendering, onClick: onClick ? (event) => onClick(event, id) : void 0 });
};
MiniMapNode.displayName = "MiniMapNode";
var MiniMapNode$1 = (0, import_react.memo)(MiniMapNode);
var defaultWidth = 200;
var defaultHeight = 150;
var selector = (s) => {
  const nodes = s.getNodes();
  const viewBB = {
    x: -s.transform[0] / s.transform[2],
    y: -s.transform[1] / s.transform[2],
    width: s.width / s.transform[2],
    height: s.height / s.transform[2]
  };
  return {
    nodes: nodes.filter((node) => !node.hidden && node.width && node.height),
    viewBB,
    boundingRect: nodes.length > 0 ? getBoundsOfRects(getRectOfNodes(nodes, s.nodeOrigin), viewBB) : viewBB,
    rfId: s.rfId,
    nodeOrigin: s.nodeOrigin
  };
};
var getAttrFunction = (func) => func instanceof Function ? func : () => func;
var ARIA_LABEL_KEY = "react-flow__minimap-desc";
function MiniMap({
  style,
  className,
  nodeStrokeColor = "transparent",
  nodeColor = "#e2e2e2",
  nodeClassName = "",
  nodeBorderRadius = 5,
  nodeStrokeWidth = 2,
  // We need to rename the prop to be `CapitalCase` so that JSX will render it as
  // a component properly. 
  nodeComponent: NodeComponent = MiniMapNode$1,
  maskColor = "rgb(240, 240, 240, 0.6)",
  maskStrokeColor = "none",
  maskStrokeWidth = 1,
  position = "bottom-right",
  onClick,
  onNodeClick,
  pannable = false,
  zoomable = false,
  ariaLabel = "React Flow mini map"
}) {
  const store = useStoreApi();
  const svg = (0, import_react.useRef)(null);
  const { boundingRect, viewBB, nodes, rfId, nodeOrigin } = useStore(selector, shallow);
  const elementWidth = style?.width ?? defaultWidth;
  const elementHeight = style?.height ?? defaultHeight;
  const nodeColorFunc = getAttrFunction(nodeColor);
  const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
  const nodeClassNameFunc = getAttrFunction(nodeClassName);
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = 5 * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const shapeRendering = typeof window === "undefined" || !!window.chrome ? "crispEdges" : "geometricPrecision";
  const labelledBy = `${ARIA_LABEL_KEY}-${rfId}`;
  const viewScaleRef = (0, import_react.useRef)(0);
  viewScaleRef.current = viewScale;
  (0, import_react.useEffect)(() => {
    if (svg.current) {
      const selection = select_default(svg.current);
      const zoomHandler = (event) => {
        const { transform, d3Selection, d3Zoom } = store.getState();
        if (event.sourceEvent.type !== "wheel" || !d3Selection || !d3Zoom) {
          return;
        }
        const pinchDelta = -event.sourceEvent.deltaY * (event.sourceEvent.deltaMode === 1 ? 0.05 : event.sourceEvent.deltaMode ? 1 : 2e-3) * 10;
        const zoom = transform[2] * Math.pow(2, pinchDelta);
        d3Zoom.scaleTo(d3Selection, zoom);
      };
      const panHandler = (event) => {
        const { transform, d3Selection, d3Zoom, translateExtent, width: width2, height: height2 } = store.getState();
        if (event.sourceEvent.type !== "mousemove" || !d3Selection || !d3Zoom) {
          return;
        }
        const position2 = {
          x: transform[0] - event.sourceEvent.movementX * viewScaleRef.current * Math.max(1, transform[2]),
          y: transform[1] - event.sourceEvent.movementY * viewScaleRef.current * Math.max(1, transform[2])
        };
        const extent = [
          [0, 0],
          [width2, height2]
        ];
        const nextTransform = identity.translate(position2.x, position2.y).scale(transform[2]);
        const constrainedTransform = d3Zoom.constrain()(nextTransform, extent, translateExtent);
        d3Zoom.transform(d3Selection, constrainedTransform);
      };
      const zoomAndPanHandler = zoom_default().on("zoom", pannable ? panHandler : null).on("zoom.wheel", zoomable ? zoomHandler : null);
      selection.call(zoomAndPanHandler);
      return () => {
        selection.on("zoom", null);
      };
    }
  }, [pannable, zoomable]);
  const onSvgClick = onClick ? (event) => {
    const rfCoord = pointer_default(event);
    onClick(event, { x: rfCoord[0], y: rfCoord[1] });
  } : void 0;
  const onSvgNodeClick = onNodeClick ? (event, nodeId) => {
    const node = store.getState().nodeInternals.get(nodeId);
    onNodeClick(event, node);
  } : void 0;
  return (0, import_jsx_runtime.jsx)(Panel, { position, style, className: cc(["react-flow__minimap", className]), "data-testid": "rf__minimap", children: (0, import_jsx_runtime.jsxs)("svg", { width: elementWidth, height: elementHeight, viewBox: `${x} ${y} ${width} ${height}`, role: "img", "aria-labelledby": labelledBy, ref: svg, onClick: onSvgClick, children: [ariaLabel && (0, import_jsx_runtime.jsx)("title", { id: labelledBy, children: ariaLabel }), nodes.map((node) => {
    const { x: x2, y: y2 } = getNodePositionWithOrigin(node, nodeOrigin).positionAbsolute;
    return (0, import_jsx_runtime.jsx)(NodeComponent, { x: x2, y: y2, width: node.width, height: node.height, style: node.style, className: nodeClassNameFunc(node), color: nodeColorFunc(node), borderRadius: nodeBorderRadius, strokeColor: nodeStrokeColorFunc(node), strokeWidth: nodeStrokeWidth, shapeRendering, onClick: onSvgNodeClick, id: node.id }, node.id);
  }), (0, import_jsx_runtime.jsx)("path", { className: "react-flow__minimap-mask", d: `M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`, fill: maskColor, fillRule: "evenodd", stroke: maskStrokeColor, strokeWidth: maskStrokeWidth, pointerEvents: "none" })] }) });
}
MiniMap.displayName = "MiniMap";
var MiniMap$1 = (0, import_react.memo)(MiniMap);

export {
  MiniMap$1
};
//# sourceMappingURL=chunk-T7KHFXHK.js.map
