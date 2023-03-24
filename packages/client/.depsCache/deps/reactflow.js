import {
  MiniMap$1
} from "./chunk-T7KHFXHK.js";
import {
  ControlButton,
  Controls$1
} from "./chunk-VPMJZLSK.js";
import {
  Background$1,
  BackgroundVariant
} from "./chunk-YNUHJBP7.js";
import {
  BaseEdge,
  BezierEdge,
  ConnectionLineType,
  ConnectionMode,
  EdgeLabelRenderer,
  EdgeText$1,
  Handle$1,
  MarkerType,
  PanOnScrollMode,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  SimpleBezierEdge,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  boxToRect,
  cc,
  clamp,
  getBezierPath,
  getBoundsOfRects,
  getConnectedEdges,
  getIncomers,
  getMarkerEnd,
  getNodePositionWithOrigin,
  getOutgoers,
  getRectOfNodes,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
  getTransformForBounds,
  internalsSymbol,
  isEdge,
  isNode,
  rectToBox,
  shallow,
  updateEdge,
  useEdges,
  useEdgesState,
  useGetPointerPosition,
  useKeyPress,
  useNodeId,
  useNodes,
  useNodesInitialized,
  useNodesState,
  useOnSelectionChange,
  useOnViewportChange,
  useReactFlow,
  useStore,
  useStoreApi,
  useUpdateNodeInternals,
  useViewport
} from "./chunk-MBQQU74W.js";
import {
  require_react_dom
} from "./chunk-LKNG5Z43.js";
import "./chunk-25FF4RY5.js";
import {
  require_jsx_runtime
} from "./chunk-HFC6VKRH.js";
import {
  require_react
} from "./chunk-KY3Y3TWH.js";
import {
  __toESM
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/@reactflow/node-toolbar/dist/esm/index.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var import_react = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var selector = (state) => state.domNode?.querySelector(".react-flow__renderer");
function NodeToolbarPortal({ children }) {
  const wrapperRef = useStore(selector);
  if (!wrapperRef) {
    return null;
  }
  return (0, import_react_dom.createPortal)(children, wrapperRef);
}
var nodeEqualityFn = (a, b) => a?.positionAbsolute?.x === b?.positionAbsolute?.x && a?.positionAbsolute?.y === b?.positionAbsolute?.y && a?.width === b?.width && a?.height === b?.height && a?.selected === b?.selected && a?.[internalsSymbol]?.z === b?.[internalsSymbol]?.z;
var nodesEqualityFn = (a, b) => {
  return a.length === b.length && a.every((node, i) => nodeEqualityFn(node, b[i]));
};
var storeSelector = (state) => ({
  transform: state.transform,
  nodeOrigin: state.nodeOrigin,
  selectedNodesCount: state.getNodes().filter((node) => node.selected).length
});
function getTransform(nodeRect, transform, position, offset) {
  let xPos = (nodeRect.x + nodeRect.width / 2) * transform[2] + transform[0];
  let yPos = nodeRect.y * transform[2] + transform[1] - offset;
  let xShift = -50;
  let yShift = -100;
  switch (position) {
    case Position.Right:
      xPos = (nodeRect.x + nodeRect.width) * transform[2] + transform[0] + offset;
      yPos = (nodeRect.y + nodeRect.height / 2) * transform[2] + transform[1];
      xShift = 0;
      yShift = -50;
      break;
    case Position.Bottom:
      yPos = (nodeRect.y + nodeRect.height) * transform[2] + transform[1] + offset;
      yShift = 0;
      break;
    case Position.Left:
      xPos = nodeRect.x * transform[2] + transform[0] - offset;
      yPos = (nodeRect.y + nodeRect.height / 2) * transform[2] + transform[1];
      xShift = -100;
      yShift = -50;
      break;
  }
  return `translate(${xPos}px, ${yPos}px) translate(${xShift}%, ${yShift}%)`;
}
function NodeToolbar({ nodeId, children, className, style, isVisible, position = Position.Top, offset = 10, ...rest }) {
  const contextNodeId = useNodeId();
  const nodesSelector = (0, import_react.useCallback)((state) => {
    const nodeIds = Array.isArray(nodeId) ? nodeId : [nodeId || contextNodeId || ""];
    return nodeIds.reduce((acc, id) => {
      const node = state.nodeInternals.get(id);
      if (node) {
        acc.push(node);
      }
      return acc;
    }, []);
  }, [nodeId, contextNodeId]);
  const nodes = useStore(nodesSelector, nodesEqualityFn);
  const { transform, nodeOrigin, selectedNodesCount } = useStore(storeSelector, shallow);
  const isActive = typeof isVisible === "boolean" ? isVisible : nodes.length === 1 && nodes[0].selected && selectedNodesCount === 1;
  if (!isActive || !nodes.length) {
    return null;
  }
  const nodeRect = getRectOfNodes(nodes, nodeOrigin);
  const zIndex = Math.max(...nodes.map((node) => (node[internalsSymbol]?.z || 1) + 1));
  const wrapperStyle = {
    position: "absolute",
    transform: getTransform(nodeRect, transform, position, offset),
    zIndex,
    ...style
  };
  return (0, import_jsx_runtime.jsx)(NodeToolbarPortal, { children: (0, import_jsx_runtime.jsx)("div", { style: wrapperStyle, className: cc(["react-flow__node-toolbar", className]), ...rest, children }) });
}
export {
  Background$1 as Background,
  BackgroundVariant,
  BaseEdge,
  BezierEdge,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls$1 as Controls,
  EdgeLabelRenderer,
  EdgeText$1 as EdgeText,
  Handle$1 as Handle,
  MarkerType,
  MiniMap$1 as MiniMap,
  NodeToolbar,
  PanOnScrollMode,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  SimpleBezierEdge,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  boxToRect,
  clamp,
  ReactFlow as default,
  getBezierPath,
  getBoundsOfRects,
  getConnectedEdges,
  getIncomers,
  getMarkerEnd,
  getNodePositionWithOrigin,
  getOutgoers,
  getRectOfNodes,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
  getTransformForBounds,
  internalsSymbol,
  isEdge,
  isNode,
  rectToBox,
  updateEdge,
  useEdges,
  useEdgesState,
  useGetPointerPosition,
  useKeyPress,
  useNodeId,
  useNodes,
  useNodesInitialized,
  useNodesState,
  useOnSelectionChange,
  useOnViewportChange,
  useReactFlow,
  useStore,
  useStoreApi,
  useUpdateNodeInternals,
  useViewport
};
//# sourceMappingURL=reactflow.js.map
