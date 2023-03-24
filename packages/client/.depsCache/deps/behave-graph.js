import {
  __export
} from "./chunk-TFWDKVI3.js";

// ../../node_modules/behave-graph/dist/lib/Events/EventEmitter.js
var EventEmitter = class {
  constructor() {
    this.listeners = [];
  }
  addListener(listener) {
    this.listeners.push(listener);
  }
  removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
  clear() {
    this.listeners.splice(0, this.listeners.length);
  }
  emit(event) {
    if (this.listeners.length === 0)
      return;
    this.listeners.slice(0).forEach((listener) => {
      listener(event);
    });
  }
  get listenerCount() {
    return this.listeners.length;
  }
};

// ../../node_modules/behave-graph/dist/lib/Diagnostics/Logger.js
var Logger = class {
  static verbose(text) {
    this.onVerbose.emit(text);
  }
  static info(text) {
    this.onInfo.emit(text);
  }
  static warn(text) {
    this.onWarn.emit(text);
  }
  static error(text) {
    this.onError.emit(text);
  }
};
Logger.onVerbose = new EventEmitter();
Logger.onInfo = new EventEmitter();
Logger.onWarn = new EventEmitter();
Logger.onError = new EventEmitter();
(() => {
  const prefix = () => {
    return new Date().toLocaleTimeString().padStart(11, "0");
  };
  Logger.onVerbose.addListener((text) => {
    console.log(prefix() + ` VERB:  ${text}`);
  });
  Logger.onInfo.addListener((text) => {
    console.log(prefix() + ` INFO:  ${text}`);
  });
  Logger.onWarn.addListener((text) => {
    console.warn(prefix() + ` WARN:  ${text}`);
  });
  Logger.onError.addListener((text) => {
    console.error(prefix() + ` ERR:  ${text}`);
  });
})();

// ../../node_modules/behave-graph/dist/lib/Diagnostics/Assert.js
var Assert = class {
  static mustBeTrue(condition, msg = "") {
    if (!condition) {
      throw new Error(`failed assertion: ${msg}`);
    }
  }
};

// ../../node_modules/behave-graph/dist/lib/generateUuid.js
var lut = [];
for (let i = 0; i < 256; i++) {
  lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}
function generateUuid() {
  const d0 = Math.random() * 4294967295 | 0;
  const d1 = Math.random() * 4294967295 | 0;
  const d2 = Math.random() * 4294967295 | 0;
  const d3 = Math.random() * 4294967295 | 0;
  const uuid = `${lut[d0 & 255] + lut[d0 >> 8 & 255] + lut[d0 >> 16 & 255] + lut[d0 >> 24 & 255]}-${lut[d1 & 255]}${lut[d1 >> 8 & 255]}-${lut[d1 >> 16 & 15 | 64]}${lut[d1 >> 24 & 255]}-${lut[d2 & 63 | 128]}${lut[d2 >> 8 & 255]}-${lut[d2 >> 16 & 255]}${lut[d2 >> 24 & 255]}${lut[d3 & 255]}${lut[d3 >> 8 & 255]}${lut[d3 >> 16 & 255]}${lut[d3 >> 24 & 255]}`;
  return uuid.toUpperCase();
}

// ../../node_modules/behave-graph/dist/lib/Nodes/Registry/NodeTypeRegistry.js
var NodeTypeRegistry = class {
  constructor() {
    this.typeNameToNodeDescriptions = {};
  }
  clear() {
    for (const nodeTypeName in this.typeNameToNodeDescriptions) {
      delete this.typeNameToNodeDescriptions[nodeTypeName];
    }
  }
  register(...descriptions) {
    descriptions.forEach((description) => {
      if (description.typeName in this.typeNameToNodeDescriptions) {
        throw new Error(`already registered node type ${description.typeName} (string)`);
      }
      this.typeNameToNodeDescriptions[description.typeName] = description;
    });
  }
  contains(typeName) {
    return typeName in this.typeNameToNodeDescriptions;
  }
  get(typeName) {
    if (!(typeName in this.typeNameToNodeDescriptions)) {
      throw new Error(`no registered node with type name ${typeName}`);
    }
    return this.typeNameToNodeDescriptions[typeName];
  }
  getAllNames() {
    return Object.keys(this.typeNameToNodeDescriptions);
  }
  getAllDescriptions() {
    return Object.values(this.typeNameToNodeDescriptions);
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Node.js
var Node = class {
  constructor(description, graph, inputSockets = [], outputSockets = []) {
    this.description = description;
    this.graph = graph;
    this.inputSockets = inputSockets;
    this.outputSockets = outputSockets;
    this.id = "";
    this.label = "";
    this.metadata = {};
  }
  readInput(inputName) {
    const inputSocket = this.inputSockets.find((socket) => socket.name === inputName);
    if (inputSocket === void 0) {
      throw new Error(`can not find input socket with name ${inputName} on node of type ${this.description.typeName}`);
    }
    return inputSocket.value;
  }
  writeOutput(outputName, value) {
    const outputSocket = this.outputSockets.find((socket) => socket.name === outputName);
    if (outputSocket === void 0) {
      throw new Error(`can not find output socket with name ${outputSocket} on node of type ${this.description.typeName}`);
    }
    if (outputSocket.valueTypeName === "flow") {
      throw new Error(`can not set the value of Flow output socket ${outputName}, use commit() instead`);
    }
    outputSocket.value = value;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/EventNode.js
var EventNode = class extends Node {
  constructor(description, graph, inputSockets, outputSockets) {
    super(description, graph, inputSockets, outputSockets);
    Assert.mustBeTrue(!this.inputSockets.some((socket) => socket.valueTypeName === "flow"));
    Assert.mustBeTrue(this.outputSockets.some((socket) => socket.valueTypeName === "flow"));
  }
  init(engine) {
    throw new Error("not implemented");
  }
  dispose(engine) {
    throw new Error("not implemented");
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Registry/NodeDescription.js
function getNodeDescriptions(importWildcard) {
  return Object.keys(importWildcard).map((key) => importWildcard[key]).filter((value) => value instanceof NodeDescription);
}
var NodeDescription = class {
  constructor(typeName, category, label, factory) {
    this.typeName = typeName;
    this.category = category;
    this.label = label;
    this.factory = factory;
  }
};

// ../../node_modules/behave-graph/dist/lib/Sockets/Socket.js
var Socket = class {
  constructor(valueTypeName, name, value = void 0, label = void 0) {
    this.valueTypeName = valueTypeName;
    this.name = name;
    this.value = value;
    this.label = label;
    this.links = [];
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/CustomEvents/OnCustomEvent.js
var OnCustomEvent = class extends EventNode {
  constructor(description, graph, customEvent) {
    super(description, graph, [], [
      new Socket("flow", "flow"),
      ...customEvent.parameters.map((parameter) => new Socket(parameter.valueTypeName, parameter.name, parameter.value, parameter.label))
    ]);
    this.customEvent = customEvent;
    this.onCustomEvent = void 0;
  }
  static GetDescription(graph, customEventId) {
    const customEvent = graph.customEvents[customEventId];
    return new NodeDescription(`customEvent/onTriggered/${customEvent.id}`, "Event", `On ${customEvent.name}`, (description, graph2) => new OnCustomEvent(description, graph2, customEvent));
  }
  init(engine) {
    Assert.mustBeTrue(this.onCustomEvent === void 0);
    this.onCustomEvent = (parameters) => {
      this.customEvent.parameters.forEach((parameterSocket) => {
        if (!(parameterSocket.name in parameters)) {
          throw new Error(`parameters of custom event do not align with parameters of custom event node, missing ${parameterSocket.name}`);
        }
        this.writeOutput(parameterSocket.name, parameters[parameterSocket.name]);
      });
      engine.commitToNewFiber(this, "flow");
    };
    this.customEvent.eventEmitter.addListener(this.onCustomEvent);
  }
  dispose(engine) {
    Assert.mustBeTrue(this.onCustomEvent !== void 0);
    if (this.onCustomEvent !== void 0) {
      this.customEvent.eventEmitter.removeListener(this.onCustomEvent);
    }
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/FlowNode.js
var FlowNode = class extends Node {
  constructor(description, graph, inputSockets, outputSockets) {
    super(description, graph, inputSockets, outputSockets);
    Assert.mustBeTrue(this.inputSockets.some((socket) => socket.valueTypeName === "flow"));
  }
  triggered(fiber, triggeringSocketName) {
    throw new Error("not implemented");
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/CustomEvents/TriggerCustomEvent.js
var TriggerCustomEvent = class extends FlowNode {
  constructor(description, graph, customEvent) {
    super(description, graph, [
      new Socket("flow", "flow"),
      ...customEvent.parameters.map((parameter) => new Socket(parameter.valueTypeName, parameter.name, parameter.value, parameter.label))
    ], [new Socket("flow", "flow")]);
    this.customEvent = customEvent;
  }
  static GetDescription(graph, customEventId) {
    const customEvent = graph.customEvents[customEventId];
    return new NodeDescription(`customEvent/trigger/${customEvent.id}`, "Action", `Trigger ${customEvent.name}`, (description, graph2) => new TriggerCustomEvent(description, graph2, customEvent));
  }
  triggered(fiber, triggeringSocketName) {
    const parameters = {};
    this.customEvent.parameters.forEach((parameterSocket) => {
      parameters[parameterSocket.name] = this.readInput(parameterSocket.name);
    });
    this.customEvent.eventEmitter.emit(parameters);
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/ImmediateNode.js
var ImmediateNode = class extends Node {
  constructor(description, graph, inputSockets, outputSockets, exec) {
    super(description, graph, inputSockets, outputSockets);
    this.exec = exec;
    Assert.mustBeTrue(!this.inputSockets.some((socket) => socket.valueTypeName === "flow"));
    Assert.mustBeTrue(!this.outputSockets.some((socket) => socket.valueTypeName === "flow"));
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Variables/VariableGet.js
var VariableGet = class extends ImmediateNode {
  constructor(description, graph, variable) {
    super(description, graph, [], [new Socket(variable.valueTypeName, "value", void 0, variable.name)], () => {
      this.writeOutput("value", variable.get());
    });
    this.variable = variable;
  }
  static GetDescription(graph, variableId) {
    const variable = graph.variables[variableId];
    return new NodeDescription(`variable/get/${variable.id}`, "Query", "", (description, graph2) => new VariableGet(description, graph2, variable));
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Variables/VariableSet.js
var VariableSet = class extends FlowNode {
  constructor(description, graph, variable) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket(variable.valueTypeName, "value", void 0, variable.name)
    ], [new Socket("flow", "flow")]);
    this.variable = variable;
  }
  static GetDescription(graph, variableId) {
    const variable = graph.variables[variableId];
    return new NodeDescription(`variable/set/${variable.id}`, "Action", `Set`, (description, graph2) => new VariableSet(description, graph2, variable));
  }
  triggered(fiber, triggeredSocketName) {
    this.variable.set(this.readInput("value"));
    fiber.commit(this, "flow");
  }
};

// ../../node_modules/behave-graph/dist/lib/Graphs/Graph.js
var Graph = class {
  constructor(registry) {
    this.registry = registry;
    this.name = "";
    this.nodes = {};
    this.variables = {};
    this.customEvents = {};
    this.metadata = {};
    this.dynamicNodeRegistry = new NodeTypeRegistry();
    this.version = 0;
  }
  updateDynamicNodeDescriptions() {
    this.dynamicNodeRegistry.clear();
    for (const variableId in this.variables) {
      this.dynamicNodeRegistry.register(VariableGet.GetDescription(this, variableId), VariableSet.GetDescription(this, variableId));
    }
    for (const customEventId in this.customEvents) {
      this.dynamicNodeRegistry.register(OnCustomEvent.GetDescription(this, customEventId), TriggerCustomEvent.GetDescription(this, customEventId));
    }
  }
  createNode(nodeTypeName, nodeId = generateUuid()) {
    if (nodeId in this.nodes) {
      throw new Error(`can not create new node of type ${nodeTypeName} with id ${nodeId} as one with that id already exists.`);
    }
    let nodeDescription = void 0;
    if (this.registry.nodes.contains(nodeTypeName)) {
      nodeDescription = this.registry.nodes.get(nodeTypeName);
    }
    if (this.dynamicNodeRegistry.contains(nodeTypeName)) {
      nodeDescription = this.dynamicNodeRegistry.get(nodeTypeName);
    }
    if (nodeDescription === void 0) {
      throw new Error(`no registered node descriptions with the typeName ${nodeTypeName}`);
    }
    const node = nodeDescription.factory(nodeDescription, this);
    node.id = nodeId;
    this.nodes[nodeId] = node;
    node.inputSockets.forEach((socket) => {
      if (socket.valueTypeName !== "flow" && socket.value === void 0) {
        socket.value = this.registry.values.get(socket.valueTypeName).creator();
      }
    });
    return node;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/AsyncNode.js
var AsyncNode = class extends Node {
  constructor(description, graph, inputSockets, outputSockets) {
    super(description, graph, inputSockets, outputSockets);
    Assert.mustBeTrue(this.inputSockets.some((socket) => socket.valueTypeName === "flow"));
    Assert.mustBeTrue(this.outputSockets.some((socket) => socket.valueTypeName === "flow"));
  }
  triggered(engine, triggeringSocketName, finished) {
    throw new Error("not implemented");
  }
  dispose() {
    throw new Error("not implemented");
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Link.js
var Link = class {
  constructor(nodeId = "", socketName = "") {
    this.nodeId = nodeId;
    this.socketName = socketName;
    this._targetNode = void 0;
    this._targetSocket = void 0;
  }
};

// ../../node_modules/behave-graph/dist/lib/Values/ValueType.js
var ValueType = class {
  constructor(name, creator, deserialize, serialize) {
    this.name = name;
    this.creator = creator;
    this.deserialize = deserialize;
    this.serialize = serialize;
  }
};

// ../../node_modules/behave-graph/dist/lib/Events/CustomEvent.js
var CustomEvent = class {
  constructor(id, name, parameters = []) {
    this.id = id;
    this.name = name;
    this.parameters = parameters;
    this.label = "";
    this.metadata = {};
    this.eventEmitter = new EventEmitter();
  }
};

// ../../node_modules/behave-graph/dist/lib/Variables/Variable.js
var Variable = class {
  constructor(id, name, valueTypeName, initialValue) {
    this.id = id;
    this.name = name;
    this.valueTypeName = valueTypeName;
    this.initialValue = initialValue;
    this.label = "";
    this.metadata = {};
    this.version = 0;
    this.onChanged = new EventEmitter();
    this.value = this.initialValue;
  }
  get() {
    return this.value;
  }
  set(newValue) {
    if (newValue !== this.value) {
      this.value = newValue;
      this.version++;
      this.onChanged.emit(this);
    }
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Templates/In4Out1FuncNode.js
var In4Out1FuncNode = class extends ImmediateNode {
  constructor(description, graph, inputValueTypes, outputValueType, binaryEvalFunc, inputNames = ["a", "b", "c", "d"]) {
    if (inputValueTypes.length !== 4) {
      throw new Error(`inputValueTypes must have a length of 4, it is instead ${inputValueTypes.length}`);
    }
    if (inputNames.length !== 4) {
      throw new Error(`inputNames must have a length of 4, it is instead ${inputNames.length}`);
    }
    super(description, graph, [
      new Socket(inputValueTypes[0], inputNames[0]),
      new Socket(inputValueTypes[1], inputNames[1]),
      new Socket(inputValueTypes[2], inputNames[2]),
      new Socket(inputValueTypes[3], inputNames[3])
    ], [new Socket(outputValueType, "result")], () => {
      this.writeOutput("result", this.binaryEvalFunc(this.readInput(inputNames[0]), this.readInput(inputNames[1]), this.readInput(inputNames[2]), this.readInput(inputNames[3])));
    });
    this.binaryEvalFunc = binaryEvalFunc;
    this.inputNames = inputNames;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Templates/In3Out1FuncNode.js
var In3Out1FuncNode = class extends ImmediateNode {
  constructor(description, graph, inputValueTypes, outputValueType, binaryEvalFunc, inputNames = ["a", "b", "c"]) {
    if (inputValueTypes.length !== 3) {
      throw new Error(`inputValueTypes must have a length of 3, it is instead ${inputValueTypes.length}`);
    }
    if (inputNames.length !== 3) {
      throw new Error(`inputNames must have a length of 3, it is instead ${inputNames.length}`);
    }
    super(description, graph, [
      new Socket(inputValueTypes[0], inputNames[0]),
      new Socket(inputValueTypes[1], inputNames[1]),
      new Socket(inputValueTypes[2], inputNames[2])
    ], [new Socket(outputValueType, "result")], () => {
      this.writeOutput("result", this.binaryEvalFunc(this.readInput(inputNames[0]), this.readInput(inputNames[1]), this.readInput(inputNames[2])));
    });
    this.binaryEvalFunc = binaryEvalFunc;
    this.inputNames = inputNames;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Templates/In2Out1FuncNode.js
var In2Out1FuncNode = class extends ImmediateNode {
  constructor(description, graph, inputValueTypes, outputValueType, binaryEvalFunc, inputNames = ["a", "b"]) {
    if (inputValueTypes.length !== 2) {
      throw new Error(`inputValueTypes must have a length of 2, it is instead ${inputValueTypes.length}`);
    }
    if (inputNames.length !== 2) {
      throw new Error(`inputNames must have a length of 2, it is instead ${inputNames.length}`);
    }
    super(description, graph, [
      new Socket(inputValueTypes[0], inputNames[0]),
      new Socket(inputValueTypes[1], inputNames[1])
    ], [new Socket(outputValueType, "result")], () => {
      this.writeOutput("result", this.binaryEvalFunc(this.readInput(inputNames[0]), this.readInput(inputNames[1])));
    });
    this.binaryEvalFunc = binaryEvalFunc;
    this.inputNames = inputNames;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Templates/In1Out1FuncNode.js
var In1Out1FuncNode = class extends ImmediateNode {
  constructor(description, graph, inputValueTypes, outputValueType, unaryEvalFunc, inputNames = ["a"]) {
    if (inputValueTypes.length !== 1) {
      throw new Error(`inputValueTypes must have a length of 1, it is instead ${inputValueTypes.length}`);
    }
    if (inputNames.length !== 1) {
      throw new Error(`inputNames must have a length of 1, it is instead ${inputNames.length}`);
    }
    super(description, graph, [new Socket(inputValueTypes[0], inputNames[0])], [new Socket(outputValueType, "result")], () => {
      this.writeOutput("result", this.unaryEvalFunc(this.readInput(inputNames[0])));
    });
    this.unaryEvalFunc = unaryEvalFunc;
    this.inputNames = inputNames;
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Templates/In0Out1FuncNode.js
var In0Out1FuncNode = class extends ImmediateNode {
  constructor(description, graph, outputValueType, nullaryEvalFunc) {
    super(description, graph, [], [new Socket(outputValueType, "result")], () => {
      this.writeOutput("result", this.nullaryEvalFunc());
    });
    this.nullaryEvalFunc = nullaryEvalFunc;
  }
};

// ../../node_modules/behave-graph/dist/lib/sleep.js
function sleep(durationInSeconds) {
  return new Promise((resolve) => setTimeout(resolve, Math.round(durationInSeconds * 1e3)));
}

// ../../node_modules/behave-graph/dist/lib/Execution/Fiber.js
var Fiber = class {
  constructor(engine, nextEval, fiberCompletedListener = void 0) {
    this.engine = engine;
    this.nextEval = nextEval;
    this.fiberCompletedListenerStack = [];
    this.executionSteps = 0;
    this.graph = engine.graph;
    if (fiberCompletedListener !== void 0) {
      this.fiberCompletedListenerStack.push(fiberCompletedListener);
    }
  }
  resolveInputValueFromSocket(inputSocket) {
    if (inputSocket.links.length === 0) {
      return;
    }
    const upstreamLink = inputSocket.links[0];
    if (upstreamLink._targetNode === void 0 || upstreamLink._targetSocket === void 0) {
      Assert.mustBeTrue(inputSocket.links.length === 1);
      upstreamLink._targetNode = this.graph.nodes[upstreamLink.nodeId];
      upstreamLink._targetSocket = upstreamLink._targetNode.outputSockets.find((socket) => socket.name === upstreamLink.socketName);
      if (upstreamLink._targetSocket === void 0) {
        throw new Error(`can not find socket with the name ${upstreamLink.socketName}`);
      }
    }
    const upstreamNode = upstreamLink._targetNode;
    const upstreamOutputSocket = upstreamLink._targetSocket;
    if (upstreamNode instanceof ImmediateNode) {
      for (const upstreamInputSocket of upstreamNode.inputSockets) {
        this.resolveInputValueFromSocket(upstreamInputSocket);
      }
      this.engine.onNodeExecution.emit(upstreamNode);
      upstreamNode.exec();
      this.executionSteps++;
      inputSocket.value = upstreamOutputSocket.value;
      return;
    }
    if (upstreamNode instanceof FlowNode || upstreamNode instanceof EventNode || upstreamNode instanceof AsyncNode) {
      inputSocket.value = upstreamOutputSocket.value;
      return;
    }
    throw new TypeError(`node, ${upstreamNode.description.typeName}, must be an instance of ImmediateNode`);
  }
  commit(node, outputSocketName, fiberCompletedListener = void 0) {
    Assert.mustBeTrue(node instanceof FlowNode);
    Assert.mustBeTrue(this.nextEval === null);
    const outputSocket = node.outputSockets.find((socket) => socket.name === outputSocketName);
    if (outputSocket === void 0) {
      throw new Error(`can not find socket with the name ${outputSocketName}`);
    }
    if (outputSocket.links.length > 1) {
      throw new Error(`invalid for an output flow socket to have multiple downstream links:${node.description.typeName}.${outputSocket.name} has ${outputSocket.links.length} downlinks`);
    }
    if (outputSocket.links.length === 1) {
      const link = outputSocket.links[0];
      if (link === void 0) {
        throw new Error("link must be defined");
      }
      this.nextEval = link;
    }
    if (fiberCompletedListener !== void 0) {
      this.fiberCompletedListenerStack.push(fiberCompletedListener);
    }
  }
  executeStep() {
    const link = this.nextEval;
    this.nextEval = null;
    if (link === null) {
      if (this.fiberCompletedListenerStack.length === 0) {
        return;
      }
      const awaitingCallback = this.fiberCompletedListenerStack.pop();
      if (awaitingCallback === void 0) {
        throw new Error("awaitingCallback is empty");
      }
      awaitingCallback();
      return;
    }
    const node = this.graph.nodes[link.nodeId];
    let triggeredSocketName = "";
    node.inputSockets.forEach((inputSocket) => {
      if (inputSocket.valueTypeName === "flow") {
        if (inputSocket.name === link.socketName) {
          inputSocket.value = true;
          triggeredSocketName = inputSocket.name;
        }
        return;
      }
      this.resolveInputValueFromSocket(inputSocket);
    });
    this.engine.onNodeExecution.emit(node);
    if (node instanceof AsyncNode) {
      this.engine.asyncNodes.push(node);
      node.triggered(this.engine, triggeredSocketName, () => {
        const index = this.engine.asyncNodes.indexOf(node);
        this.engine.asyncNodes.splice(index, 1);
        this.executionSteps++;
      });
      return;
    }
    if (node instanceof FlowNode) {
      node.triggered(this, triggeredSocketName);
      this.executionSteps++;
      return;
    }
    throw new TypeError(`should not get here, unhandled node ${node.description.typeName}`);
  }
  isCompleted() {
    return this.fiberCompletedListenerStack.length === 0 && this.nextEval === null;
  }
};

// ../../node_modules/behave-graph/dist/lib/Execution/Engine.js
var Engine = class {
  constructor(graph) {
    this.graph = graph;
    this.fiberQueue = [];
    this.asyncNodes = [];
    this.eventNodes = [];
    this.onNodeExecution = new EventEmitter();
    this.executionSteps = 0;
    Object.values(graph.nodes).forEach((node) => {
      if (node instanceof EventNode) {
        this.eventNodes.push(node);
      }
    });
    this.eventNodes.forEach((eventNode) => eventNode.init(this));
  }
  dispose() {
    this.asyncNodes.forEach((asyncNode) => asyncNode.dispose());
    this.eventNodes.forEach((eventNode) => eventNode.dispose(this));
  }
  commitToNewFiber(node, outputFlowSocketName, fiberCompletedListener = void 0) {
    Assert.mustBeTrue(node instanceof EventNode || node instanceof AsyncNode);
    const outputSocket = node.outputSockets.find((socket) => socket.name === outputFlowSocketName);
    if (outputSocket === void 0) {
      throw new Error(`no socket with the name ${outputFlowSocketName}`);
    }
    if (outputSocket.links.length > 1) {
      throw new Error(`invalid for an output flow socket to have multiple downstream links:${node.description.typeName}.${outputSocket.name} has ${outputSocket.links.length} downlinks`);
    }
    if (outputSocket.links.length === 1) {
      const fiber = new Fiber(this, outputSocket.links[0], fiberCompletedListener);
      this.fiberQueue.push(fiber);
    }
  }
  executeAllSync(limitInSeconds = 100, limitInSteps = 1e8) {
    const startDateTime = Date.now();
    let elapsedSeconds = 0;
    let elapsedSteps = 0;
    while (elapsedSteps < limitInSteps && elapsedSeconds < limitInSeconds && this.fiberQueue.length > 0) {
      const currentFiber = this.fiberQueue[0];
      const startingFiberExecutionSteps = currentFiber.executionSteps;
      currentFiber.executeStep();
      elapsedSteps += currentFiber.executionSteps - startingFiberExecutionSteps;
      if (currentFiber.isCompleted()) {
        this.fiberQueue.shift();
      }
      elapsedSeconds = (Date.now() - startDateTime) * 1e-3;
    }
    this.executionSteps += elapsedSteps;
    return elapsedSteps;
  }
  async executeAllAsync(limitInSeconds = 100, limitInSteps = 1e8) {
    const startDateTime = Date.now();
    let elapsedSteps = 0;
    let elapsedTime = 0;
    let iterations = 0;
    do {
      if (iterations > 0) {
        await sleep(0);
      }
      elapsedSteps += this.executeAllSync(limitInSeconds - elapsedTime, limitInSteps - elapsedSteps);
      elapsedTime = (Date.now() - startDateTime) * 1e-3;
      iterations += 1;
    } while ((this.asyncNodes.length > 0 || this.fiberQueue.length > 0) && elapsedTime < limitInSeconds && elapsedSteps < limitInSteps);
    return elapsedSteps;
  }
};

// ../../node_modules/behave-graph/dist/lib/Execution/traceToLogger.js
function traceToLogger(node) {
  const prefix = `<< ${node.description.typeName}:${node.id} >> `;
  Logger.verbose(prefix);
}

// ../../node_modules/behave-graph/dist/lib/Graphs/IO/readGraphFromJSON.js
function readGraphFromJSON(graphJson, registry) {
  const graph = new Graph(registry);
  graph.name = graphJson?.name ?? graph.name;
  graph.metadata = graphJson?.metadata ?? graph.metadata;
  if ("variables" in graphJson) {
    readVariablesJSON(graph, graphJson.variables ?? []);
  }
  if ("customEvents" in graphJson) {
    readCustomEventsJSON(graph, graphJson.customEvents ?? []);
  }
  graph.updateDynamicNodeDescriptions();
  const nodesJson = graphJson?.nodes ?? [];
  if (nodesJson.length === 0) {
    Logger.warn("readGraphFromJSON: no nodes specified");
  }
  for (let i = 0; i < nodesJson.length; i += 1) {
    const nodeJson = nodesJson[i];
    readNodeJSON(graph, nodeJson);
  }
  Object.values(graph.nodes).forEach((node) => {
    node.inputSockets.forEach((inputSocket) => {
      inputSocket.links.forEach((link) => {
        if (!(link.nodeId in graph.nodes)) {
          throw new Error(`node '${node.description.typeName}' specifies an input '${inputSocket.name}' whose link goes to a nonexistent upstream node id: ${link.nodeId}`);
        }
        const upstreamNode = graph.nodes[link.nodeId];
        const upstreamOutputSocket = upstreamNode.outputSockets.find((socket) => socket.name === link.socketName);
        if (upstreamOutputSocket === void 0) {
          throw new Error(`node '${node.description.typeName}' specifies an input '${inputSocket.name}' whose link goes to a nonexistent output '${link.socketName}' on upstream node '${upstreamNode.description.typeName}'`);
        }
        const upstreamLink = new Link(node.id, inputSocket.name);
        if (upstreamOutputSocket.links.findIndex((value) => value.nodeId == upstreamLink.nodeId && value.socketName == upstreamLink.socketName) < 0) {
          upstreamOutputSocket.links.push(upstreamLink);
        }
      });
    });
    node.outputSockets.forEach((outputSocket) => {
      outputSocket.links.forEach((link) => {
        if (!(link.nodeId in graph.nodes)) {
          throw new Error(`node '${node.description.typeName}' specifies an output '${outputSocket.name}' whose link goes to a nonexistent downstream node id ${link.nodeId}`);
        }
        const downstreamNode = graph.nodes[link.nodeId];
        const downstreamInputSocket = downstreamNode.inputSockets.find((socket) => socket.name === link.socketName);
        if (downstreamInputSocket === void 0) {
          throw new Error(`node '${node.description.typeName}' specifies an output '${outputSocket.name}' whose link goes to a nonexistent input '${link.socketName}' on downstream node '${downstreamNode.description.typeName}'`);
        }
        const downstreamLink = new Link(node.id, outputSocket.name);
        if (downstreamInputSocket.links.findIndex((value) => value.nodeId == downstreamLink.nodeId && value.socketName == downstreamLink.socketName) < 0) {
          downstreamInputSocket.links.push(downstreamLink);
        }
      });
    });
  });
  return graph;
}
function readNodeJSON(graph, nodeJson) {
  if (nodeJson.type === void 0) {
    throw new Error("readGraphFromJSON: no type for node");
  }
  const nodeName = nodeJson.type;
  const node = graph.createNode(nodeName, nodeJson.id);
  node.label = nodeJson?.label ?? node.label;
  node.metadata = nodeJson?.metadata ?? node.metadata;
  if (nodeJson.parameters !== void 0) {
    readNodeParameterJSON(graph, node, nodeJson.parameters);
  }
  if (nodeJson.flows !== void 0) {
    readNodeFlowsJSON(graph, node, nodeJson.flows);
  }
}
function readNodeParameterJSON(graph, node, parametersJson) {
  node.inputSockets.forEach((socket) => {
    if (!(socket.name in parametersJson)) {
      return;
    }
    const inputJson = parametersJson[socket.name];
    if ("value" in inputJson) {
      socket.value = graph.registry.values.get(socket.valueTypeName).deserialize(inputJson.value);
    }
    if ("link" in inputJson) {
      const linkJson = inputJson.link;
      socket.links.push(new Link(linkJson.nodeId, linkJson.socket));
    }
  });
  for (const inputName in parametersJson) {
    const inputSocket = node.inputSockets.find((socket) => socket.name === inputName);
    if (inputSocket === void 0) {
      throw new Error(`node '${node.description.typeName}' specifies an input '${inputName}' that doesn't exist on its node type`);
    }
  }
}
function readNodeFlowsJSON(graph, node, flowsJson) {
  node.outputSockets.forEach((socket) => {
    if (socket.name in flowsJson) {
      const outputLinkJson = flowsJson[socket.name];
      socket.links.push(new Link(outputLinkJson.nodeId, outputLinkJson.socket));
    }
  });
  for (const outputName in flowsJson) {
    const outputSocket = node.outputSockets.find((socket) => socket.name === outputName);
    if (outputSocket === void 0) {
      throw new Error(`node '${node.description.typeName}' specifies an output '${outputName}' that doesn't exist on its node type`);
    }
  }
}
function readVariablesJSON(graph, variablesJson) {
  for (let i = 0; i < variablesJson.length; i += 1) {
    const variableJson = variablesJson[i];
    const variable = new Variable(variableJson.id, variableJson.name, variableJson.valueTypeName, graph.registry.values.get(variableJson.valueTypeName).deserialize(variableJson.initialValue));
    variable.label = variableJson?.label ?? variable.label;
    variable.metadata = variableJson?.metadata ?? variable.metadata;
    if (variableJson.id in graph.variables) {
      throw new Error(`duplicate variable id ${variable.id}`);
    }
    graph.variables[variableJson.id] = variable;
  }
}
function readCustomEventsJSON(graph, customEventsJson) {
  for (let i = 0; i < customEventsJson.length; i += 1) {
    const customEventJson = customEventsJson[i];
    const parameters = [];
    (customEventJson.parameters ?? []).forEach((parameterJson) => {
      parameters.push(new Socket(parameterJson.valueTypeName, parameterJson.name, graph.registry.values.get(parameterJson.valueTypeName).deserialize(parameterJson.defaultValue)));
    });
    const customEvent = new CustomEvent(customEventJson.id, customEventJson.name, parameters);
    customEvent.label = customEventJson?.label ?? customEvent.label;
    customEvent.metadata = customEventJson?.metadata ?? customEvent.metadata;
    if (customEvent.id in graph.customEvents) {
      throw new Error(`duplicate variable id ${customEvent.id}`);
    }
    graph.customEvents[customEvent.id] = customEvent;
  }
}

// ../../node_modules/behave-graph/dist/lib/Graphs/IO/writeGraphToJSON.js
function writeGraphToJSON(graph) {
  const graphJson = {};
  if (Object.keys(graph.metadata).length > 0) {
    graphJson.metadata = graph.metadata;
  }
  Object.values(graph.customEvents).forEach((customEvent) => {
    const customEventJson = {
      name: customEvent.name,
      id: customEvent.id
    };
    if (customEvent.label.length > 0) {
      customEventJson.label = customEvent.label;
    }
    if (customEvent.parameters.length > 0) {
      const parametersJson = [];
      customEvent.parameters.forEach((parameter) => {
        parametersJson.push({
          name: parameter.name,
          valueTypeName: parameter.valueTypeName,
          defaultValue: parameter.value
        });
      });
      customEventJson.parameters = parametersJson;
    }
    if (Object.keys(customEvent.metadata).length > 0) {
      customEventJson.metadata = customEvent.metadata;
    }
    if (graphJson.customEvents === void 0) {
      graphJson.customEvents = [];
    }
    graphJson.customEvents.push(customEventJson);
  });
  Object.values(graph.variables).forEach((variable) => {
    const variableJson = {
      valueTypeName: variable.valueTypeName,
      name: variable.name,
      id: variable.id,
      initialValue: graph.registry.values.get(variable.valueTypeName).serialize(variable.initialValue)
    };
    if (variable.label.length > 0) {
      variableJson.label = variable.label;
    }
    if (Object.keys(variable.metadata).length > 0) {
      variableJson.metadata = variable.metadata;
    }
    if (graphJson.variables === void 0) {
      graphJson.variables = [];
    }
    graphJson.variables.push(variableJson);
  });
  Object.values(graph.nodes).forEach((node) => {
    const nodeJson = {
      type: node.description.typeName,
      id: node.id
    };
    if (node.label.length > 0) {
      nodeJson.label = node.label;
    }
    if (Object.keys(node.metadata).length > 0) {
      nodeJson.metadata = node.metadata;
    }
    const parametersJson = {};
    node.inputSockets.forEach((inputSocket) => {
      if (inputSocket.valueTypeName === "flow")
        return;
      let parameterJson = void 0;
      if (inputSocket.links.length === 0) {
        parameterJson = {
          value: graph.registry.values.get(inputSocket.valueTypeName).serialize(inputSocket.value)
        };
      } else if (inputSocket.links.length === 1) {
        const link = inputSocket.links[0];
        parameterJson = {
          link: {
            nodeId: link.nodeId,
            socket: link.socketName
          }
        };
      } else {
        throw new Error(`should not get here, inputSocket.links.length = ${inputSocket.links.length} > 1`);
      }
      parametersJson[inputSocket.name] = parameterJson;
    });
    if (Object.keys(parametersJson).length > 0) {
      nodeJson.parameters = parametersJson;
    }
    const flowsJson = {};
    node.outputSockets.forEach((outputSocket) => {
      if (outputSocket.valueTypeName !== "flow")
        return;
      if (outputSocket.links.length === 0)
        return;
      const linkJson = {
        nodeId: outputSocket.links[0].nodeId,
        socket: outputSocket.links[0].socketName
      };
      flowsJson[outputSocket.name] = linkJson;
    });
    if (Object.keys(flowsJson).length > 0) {
      nodeJson.flows = flowsJson;
    }
    if (graphJson.nodes === void 0) {
      graphJson.nodes = [];
    }
    graphJson.nodes.push(nodeJson);
  });
  return graphJson;
}

// ../../node_modules/behave-graph/dist/lib/Graphs/IO/writeNodeSpecsToJSON.js
function writeNodeSpecsToJSON(registry) {
  const nodeSpecsJSON = [];
  const graph = new Graph(registry);
  registry.nodes.getAllNames().forEach((nodeTypeName) => {
    const node = graph.createNode(nodeTypeName);
    const nodeSpecJSON = {
      type: nodeTypeName,
      category: node.description.category,
      label: node.description.label,
      inputs: [],
      outputs: []
    };
    node.inputSockets.forEach((inputSocket) => {
      const valueType = inputSocket.valueTypeName === "flow" ? void 0 : registry.values.get(inputSocket.valueTypeName);
      let defaultValue = inputSocket.value;
      if (valueType !== void 0) {
        defaultValue = valueType.serialize(defaultValue);
      }
      if (defaultValue === void 0 && valueType !== void 0) {
        defaultValue = valueType.serialize(valueType.creator());
      }
      const socketSpecJSON = {
        name: inputSocket.name,
        valueType: inputSocket.valueTypeName,
        defaultValue
      };
      nodeSpecJSON.inputs.push(socketSpecJSON);
    });
    node.outputSockets.forEach((outputSocket) => {
      const socketSpecJSON = {
        name: outputSocket.name,
        valueType: outputSocket.valueTypeName
      };
      nodeSpecJSON.outputs.push(socketSpecJSON);
    });
    nodeSpecsJSON.push(nodeSpecJSON);
  });
  return nodeSpecsJSON;
}

// ../../node_modules/behave-graph/dist/lib/Values/ValueTypeRegistry.js
var ValueTypeRegistry = class {
  constructor() {
    this.valueTypeNameToValueType = {};
  }
  register(...valueTypes) {
    valueTypes.forEach((valueType) => {
      if (valueType.name in this.valueTypeNameToValueType) {
        throw new Error(`already registered value type ${valueType.name}`);
      }
      this.valueTypeNameToValueType[valueType.name] = valueType;
    });
  }
  get(valueTypeName) {
    if (!(valueTypeName in this.valueTypeNameToValueType)) {
      throw new Error(`can not find value type with name '${valueTypeName}`);
    }
    return this.valueTypeNameToValueType[valueTypeName];
  }
  getAllNames() {
    return Object.keys(this.valueTypeNameToValueType);
  }
};

// ../../node_modules/behave-graph/dist/lib/Registry.js
var Registry = class {
  constructor() {
    this.values = new ValueTypeRegistry();
    this.nodes = new NodeTypeRegistry();
  }
};

// ../../node_modules/behave-graph/dist/lib/Nodes/Validation/validateNodeRegistry.js
var nodeTypeNameRegex = /^\w+(\/\w+)*$/;
var socketNameRegex = /^\w+$/;
function validateNodeRegistry(registry) {
  const errorList = [];
  const graph = new Graph(registry);
  registry.nodes.getAllNames().forEach((nodeTypeName) => {
    const node = graph.createNode(nodeTypeName);
    if (node.description.typeName !== nodeTypeName) {
      errorList.push(`node with typeName '${node.description.typeName}' is registered under a different name '${nodeTypeName}'`);
    }
    if (!nodeTypeNameRegex.test(node.description.typeName)) {
      errorList.push(`invalid node type name on node ${node.description.typeName}`);
    }
    node.inputSockets.forEach((socket) => {
      if (!socketNameRegex.test(socket.name)) {
        errorList.push(`invalid socket name for input socket ${socket.name} on node ${node.description.typeName}`);
      }
      if (socket.valueTypeName === "flow") {
        return;
      }
      const valueType = registry.values.get(socket.valueTypeName);
      if (valueType === void 0) {
        errorList.push(`node '${node.description.typeName}' has on input socket '${socket.name}' an unregistered value type '${socket.valueTypeName}'`);
      }
    });
    node.outputSockets.forEach((socket) => {
      if (!socketNameRegex.test(socket.name)) {
        errorList.push(`invalid socket name for output socket ${socket.name} on node ${node.description.typeName}`);
      }
      if (socket.valueTypeName === "flow") {
        return;
      }
      const valueType = registry.values.get(socket.valueTypeName);
      if (valueType === void 0) {
        errorList.push(`node '${node.description.typeName}' has on output socket '${socket.name}' an unregistered value type '${socket.valueTypeName}'`);
      }
    });
  });
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/Values/Validation/validateValueRegistry.js
var valueTypeNameRegex = /^\w+$/;
function validateValueRegistry(graphRegistry) {
  const errorList = [];
  graphRegistry.values.getAllNames().forEach((valueTypeName) => {
    if (!valueTypeNameRegex.test(valueTypeName)) {
      errorList.push(`invalid value type name ${valueTypeName}`);
    }
    const valueType = graphRegistry.values.get(valueTypeName);
    const value = valueType.creator();
    const serializedValue = valueType.serialize(value);
    const deserializedValue = valueType.deserialize(serializedValue);
    const reserializedValue = valueType.serialize(deserializedValue);
    const redeserializedValue = valueType.deserialize(reserializedValue);
    if (JSON.stringify(serializedValue) !== JSON.stringify(reserializedValue)) {
      errorList.push(`value type (${valueTypeName}) reserialization mismatch between ${JSON.stringify(serializedValue)} and ${JSON.stringify(reserializedValue)}`);
    }
    if (typeof deserializedValue !== "bigint" && JSON.stringify(deserializedValue) !== JSON.stringify(redeserializedValue)) {
      errorList.push(`value type (${valueTypeName}) redeserialization mismatch between ${JSON.stringify(deserializedValue)} and ${JSON.stringify(redeserializedValue)}`);
    }
  });
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/validateRegistry.js
function validateRegistry(registry) {
  const errorList = [];
  errorList.push(...validateValueRegistry(registry), ...validateNodeRegistry(registry));
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/Graphs/Validation/validateGraphAcyclic.js
function validateGraphAcyclic(graph) {
  Object.values(graph.nodes).forEach((node) => {
    node.metadata["dag.marked"] = "false";
  });
  const nodesToMark = [];
  do {
    nodesToMark.length = 0;
    Object.values(graph.nodes).forEach((node) => {
      if (node.metadata["dag.marked"] === "true") {
        return;
      }
      let inputSocketsConnected = false;
      node.inputSockets.forEach((inputSocket) => {
        inputSocket.links.forEach((link) => {
          if (graph.nodes[link.nodeId].metadata["dag.marked"] === "false") {
            inputSocketsConnected = true;
          }
        });
      });
      if (!inputSocketsConnected) {
        nodesToMark.push(node);
      }
    });
    nodesToMark.forEach((node) => {
      node.metadata["dag.marked"] = "true";
    });
  } while (nodesToMark.length > 0);
  const errorList = [];
  Object.values(graph.nodes).forEach((node) => {
    if (node.metadata["dag.marked"] === "false") {
      errorList.push(`node ${node.description.typeName} is part of a cycle, not a directed acyclic graph`);
    }
    delete node.metadata["dag.marked"];
  });
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/Graphs/Validation/validateGraphLinks.js
function validateGraphLinks(graph) {
  const errorList = [];
  Object.values(graph.nodes).forEach((node) => {
    node.inputSockets.forEach((inputSocket) => {
      inputSocket.links.forEach((link) => {
        if (!(link.nodeId in graph.nodes)) {
          errorList.push(`node ${node.description.typeName}.${inputSocket.name} has link using invalid nodeId: ${link.nodeId}`);
          return;
        }
        const upstreamNode = graph.nodes[link.nodeId];
        const outputSocket = upstreamNode.outputSockets.find((socket) => socket.name === link.socketName);
        if (outputSocket === void 0) {
          errorList.push(`node ${node.description.typeName}.${inputSocket.name} has link using a non-existent socket name: ${link.socketName}, it can not be found on upstream output node: ${upstreamNode.description.typeName}`);
          return;
        }
        if (inputSocket.valueTypeName !== outputSocket.valueTypeName) {
          errorList.push(`type mismatch between ${node.description.typeName}.${inputSocket.name} [${inputSocket.valueTypeName}] and ${upstreamNode.description.typeName}.${outputSocket.name} [${outputSocket.valueTypeName}]`);
        }
      });
    });
  });
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/Graphs/Validation/validateGraph.js
function validateGraph(graph) {
  const errorList = [];
  errorList.push(...validateGraphAcyclic(graph), ...validateGraphLinks(graph));
  return errorList;
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Abstractions/Drivers/DefaultLogger.js
var DefaultLogger = class {
  verbose(text) {
    Logger.verbose(text);
  }
  info(text) {
    Logger.info(text);
  }
  warn(text) {
    Logger.warn(text);
  }
  error(text) {
    Logger.error(text);
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Abstractions/Drivers/ManualLifecycleEventEmitter.js
var ManualLifecycleEventEmitter = class {
  constructor() {
    this.startEvent = new EventEmitter();
    this.endEvent = new EventEmitter();
    this.tickEvent = new EventEmitter();
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Debug/AssertExpectTrue.js
var ExpectTrue = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("boolean", "condition"),
      new Socket("string", "description")
    ], [new Socket("flow", "flow")]);
  }
  triggered(fiber, triggeredSocketName) {
    Assert.mustBeTrue(this.readInput("condition"), this.readInput("description"));
    fiber.commit(this, "flow");
  }
};
ExpectTrue.Description = new NodeDescription("debug/expectTrue", "Action", "Assert Expect True", (description, graph) => new ExpectTrue(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Debug/DebugLog.js
var Log = class extends FlowNode {
  constructor(description, graph, logger) {
    super(description, graph, [new Socket("flow", "flow"), new Socket("string", "text")], [new Socket("flow", "flow")]);
    this.logger = logger;
  }
  triggered(fiber, triggeredSocketName) {
    this.logger.info(this.readInput("text"));
    fiber.commit(this, "flow");
  }
};
Log.Description = (logger) => new NodeDescription("debug/log", "Action", "Debug Log", (description, graph) => new Log(description, graph, logger));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Branch.js
var Branch = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [new Socket("flow", "flow"), new Socket("boolean", "condition")], [new Socket("flow", "true"), new Socket("flow", "false")]);
  }
  triggered(fiber, triggeringSocketName) {
    fiber.commit(this, this.readInput("condition") === true ? "true" : "false");
  }
};
Branch.Description = new NodeDescription("flow/branch", "Flow", "Branch", (description, graph) => new Branch(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Debounce.js
var Debounce = class extends AsyncNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("float", "waitDuration"),
      new Socket("flow", "cancel")
    ], [new Socket("flow", "flow")]);
    this.triggerVersion = 0;
  }
  triggered(engine, triggeringSocketName, finished) {
    this.triggerVersion++;
    if (triggeringSocketName === "cancel") {
      return;
    }
    const localTriggerCount = this.triggerVersion;
    setTimeout(() => {
      if (this.triggerVersion >= localTriggerCount) {
        return;
      }
      engine.commitToNewFiber(this, "flow");
      finished();
    }, this.readInput("waitDuration") * 1e3);
  }
  dispose() {
    this.triggerVersion++;
  }
};
Debounce.Description = new NodeDescription("flow/debounce", "Flow", "Debounce", (description, graph) => new Debounce(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Delay.js
var Delay = class extends AsyncNode {
  constructor(description, graph) {
    super(description, graph, [new Socket("flow", "flow"), new Socket("float", "duration", 1)], [new Socket("flow", "flow")]);
    this.timeoutPending = false;
  }
  triggered(engine, triggeringSocketName, finished) {
    if (this.timeoutPending) {
      return;
    }
    this.timeoutPending = true;
    setTimeout(() => {
      if (!this.timeoutPending)
        return;
      this.timeoutPending = false;
      engine.commitToNewFiber(this, "flow");
      finished();
    }, this.readInput("duration") * 1e3);
  }
  dispose() {
    this.timeoutPending = false;
  }
};
Delay.Description = new NodeDescription("flow/delay", "Flow", "Delay", (description, graph) => new Delay(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/FlipFlop.js
var FlipFlop = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [new Socket("flow", "flow")], [
      new Socket("flow", "on"),
      new Socket("flow", "off"),
      new Socket("boolean", "isOn")
    ]);
    this.isOn = true;
  }
  triggered(fiber, triggeringSocketName) {
    this.writeOutput("isOn", this.isOn);
    fiber.commit(this, this.isOn ? "on" : "off");
    this.isOn = !this.isOn;
  }
};
FlipFlop.Description = new NodeDescription("flow/flipFlop", "Flow", "Flip Flop", (description, graph) => new FlipFlop(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/ForLoop.js
var ForLoop = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("integer", "startIndex"),
      new Socket("integer", "endIndex")
    ], [
      new Socket("flow", "loopBody"),
      new Socket("integer", "index"),
      new Socket("flow", "completed")
    ]);
  }
  triggered(fiber, triggeringSocketName) {
    const startIndex = this.readInput("startIndex");
    const endIndex = this.readInput("endIndex");
    const loopBodyIteration = (i) => {
      if (i < endIndex) {
        this.writeOutput("index", i);
        fiber.commit(this, "loopBody", () => {
          loopBodyIteration(i + 1n);
        });
      } else {
        fiber.commit(this, "completed");
      }
    };
    loopBodyIteration(startIndex);
  }
};
ForLoop.Description = new NodeDescription("flow/forLoop", "Flow", "For Loop", (description, graph) => new ForLoop(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Sequence.js
var Sequence = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [new Socket("flow", "flow")], [
      new Socket("flow", "1"),
      new Socket("flow", "2"),
      new Socket("flow", "3")
    ]);
  }
  triggered(fiber, triggeringSocketName) {
    const sequenceIteration = (i) => {
      if (i < this.outputSockets.length) {
        const outputSocket = this.outputSockets[i];
        fiber.commit(this, outputSocket.name, () => {
          sequenceIteration(i + 1);
        });
      }
    };
    sequenceIteration(0);
  }
};
Sequence.Description = new NodeDescription("flow/sequence", "Flow", "Sequence", (description, graph) => new Sequence(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Lifecycle/LifecycleOnEnd.js
var LifecycleOnEnd = class extends EventNode {
  constructor(description, graph, lifecycleEventEmitter) {
    super(description, graph, [], [new Socket("flow", "flow")]);
    this.lifecycleEventEmitter = lifecycleEventEmitter;
    this.onEndEvent = void 0;
  }
  init(engine) {
    Assert.mustBeTrue(this.onEndEvent === void 0);
    this.onEndEvent = () => {
      engine.commitToNewFiber(this, "flow");
    };
    this.lifecycleEventEmitter.endEvent.addListener(this.onEndEvent);
  }
  dispose(engine) {
    Assert.mustBeTrue(this.onEndEvent !== void 0);
    if (this.onEndEvent !== void 0) {
      this.lifecycleEventEmitter.endEvent.removeListener(this.onEndEvent);
    }
  }
};
LifecycleOnEnd.Description = (lifecycleEventEmitter) => new NodeDescription("lifecycle/onEnd", "Event", "On End", (description, graph) => new LifecycleOnEnd(description, graph, lifecycleEventEmitter));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Lifecycle/LifecycleOnStart.js
var LifecycleOnStart = class extends EventNode {
  constructor(description, graph, lifecycleEventEmitter) {
    super(description, graph, [], [new Socket("flow", "flow")]);
    this.lifecycleEventEmitter = lifecycleEventEmitter;
    this.onStartEvent = void 0;
  }
  init(engine) {
    Assert.mustBeTrue(this.onStartEvent === void 0);
    this.onStartEvent = () => {
      engine.commitToNewFiber(this, "flow");
    };
    this.lifecycleEventEmitter.startEvent.addListener(this.onStartEvent);
  }
  dispose(engine) {
    Assert.mustBeTrue(this.onStartEvent !== void 0);
    if (this.onStartEvent !== void 0) {
      this.lifecycleEventEmitter.startEvent.removeListener(this.onStartEvent);
    }
  }
};
LifecycleOnStart.Description = (lifecycleEventEmitter) => new NodeDescription("lifecycle/onStart", "Event", "On Start", (description, graph) => new LifecycleOnStart(description, graph, lifecycleEventEmitter));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Lifecycle/LifecycleOnTick.js
var LifecycleOnTick = class extends EventNode {
  constructor(description, graph, lifecycleEventEmitter) {
    super(description, graph, [], [
      new Socket("flow", "flow"),
      new Socket("float", "deltaSeconds"),
      new Socket("float", "time")
    ]);
    this.lifecycleEventEmitter = lifecycleEventEmitter;
    this.onTickEvent = void 0;
  }
  init(engine) {
    Assert.mustBeTrue(this.onTickEvent === void 0);
    let lastTickTime = Date.now();
    this.onTickEvent = () => {
      const currentTime = Date.now();
      const deltaSeconds = (currentTime - lastTickTime) * 1e-3;
      this.writeOutput("deltaSeconds", deltaSeconds);
      this.writeOutput("time", Date.now());
      engine.commitToNewFiber(this, "flow");
      lastTickTime = currentTime;
    };
    this.lifecycleEventEmitter.tickEvent.addListener(this.onTickEvent);
  }
  dispose(engine) {
    Assert.mustBeTrue(this.onTickEvent !== void 0);
    if (this.onTickEvent !== void 0) {
      this.lifecycleEventEmitter.tickEvent.removeListener(this.onTickEvent);
    }
  }
};
LifecycleOnTick.Description = (lifecycleEventEmitter) => new NodeDescription("lifecycle/onTick", "Event", "On Tick", (description, graph) => new LifecycleOnTick(description, graph, lifecycleEventEmitter));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/BooleanNodes.js
var BooleanNodes_exports = {};
__export(BooleanNodes_exports, {
  And: () => And,
  Constant: () => Constant,
  Equal: () => Equal,
  Not: () => Not,
  Or: () => Or,
  ToFloat: () => ToFloat
});
var Constant = new NodeDescription("math/boolean", "Logic", "Boolean", (description, graph) => new In1Out1FuncNode(description, graph, ["boolean"], "boolean", (a) => a));
var And = new NodeDescription("math/and/boolean", "Logic", "∧", (description, graph) => new In2Out1FuncNode(description, graph, ["boolean", "boolean"], "boolean", (a, b) => a && b));
var Or = new NodeDescription("math/or/boolean", "Logic", "∨", (description, graph) => new In2Out1FuncNode(description, graph, ["boolean", "boolean"], "boolean", (a, b) => a || b));
var Not = new NodeDescription("math/negate/boolean", "Logic", "¬", (description, graph) => new In1Out1FuncNode(description, graph, ["boolean"], "boolean", (a) => !a));
var ToFloat = new NodeDescription("math/toFloat/boolean", "Logic", "To Float", (description, graph) => new In1Out1FuncNode(description, graph, ["boolean"], "float", (a) => a ? 1 : 0));
var Equal = new NodeDescription("math/equal/boolean", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["boolean", "boolean"], "boolean", (a, b) => a === b));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/BooleanValue.js
var BooleanValue = new ValueType("boolean", () => false, (value) => typeof value === "string" ? value.toLowerCase() === "true" : value, (value) => value);

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/FloatNodes.js
var FloatNodes_exports = {};
__export(FloatNodes_exports, {
  Abs: () => Abs,
  Acos: () => Acos,
  Add: () => Add,
  Asin: () => Asin,
  Atan: () => Atan,
  Ceil: () => Ceil,
  Clamp: () => Clamp,
  Constant: () => Constant2,
  Cos: () => Cos,
  Divide: () => Divide,
  E: () => E,
  Equal: () => Equal2,
  Exp: () => Exp,
  Floor: () => Floor,
  GreaterThan: () => GreaterThan,
  GreaterThanOrEqual: () => GreaterThanOrEqual,
  IsInf: () => IsInf,
  IsNaN: () => IsNaN,
  LessThan: () => LessThan,
  LessThanOrEqual: () => LessThanOrEqual,
  Ln: () => Ln,
  Log10: () => Log10,
  Log2: () => Log2,
  Max: () => Max,
  Min: () => Min,
  Mix: () => Mix,
  Modulus: () => Modulus,
  Multiply: () => Multiply,
  Negate: () => Negate,
  PI: () => PI,
  Power: () => Power,
  Random: () => Random,
  Round: () => Round,
  Sign: () => Sign,
  Sin: () => Sin,
  SquareRoot: () => SquareRoot,
  Subtract: () => Subtract,
  Tan: () => Tan,
  ToFloat: () => ToFloat2,
  Trunc: () => Trunc
});
var Constant2 = new NodeDescription("math/float", "Logic", "Float", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", (a) => a));
var Add = new NodeDescription("math/add/float", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => a + b));
var Subtract = new NodeDescription("math/subtract/float", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => a - b));
var Negate = new NodeDescription("math/negate/float", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", (a) => -a));
var Multiply = new NodeDescription("math/multiply/float", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => a * b));
var Divide = new NodeDescription("math/divide/float", "Logic", "÷", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => a / b));
var Modulus = new NodeDescription("math/modulus/float", "Logic", "MOD", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => a % b));
var Power = new NodeDescription("math/pow/float", "Logic", "POW", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", Math.pow));
var SquareRoot = new NodeDescription("math/sqrt/float", "Logic", "√", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.sqrt));
var E = new NodeDescription("math/e/float", "Logic", "𝑒", (description, graph) => new In0Out1FuncNode(description, graph, "float", () => Math.E));
var Exp = new NodeDescription("math/exp/float", "Logic", "EXP", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.exp));
var Ln = new NodeDescription("math/ln/float", "Logic", "LN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.log));
var Log2 = new NodeDescription("math/log2/float", "Logic", "LOG2", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.log2));
var Log10 = new NodeDescription("math/log10/float", "Logic", "LOG10", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.log10));
var PI = new NodeDescription("math/pi/float", "Logic", "π", (description, graph) => new In0Out1FuncNode(description, graph, "float", () => Math.PI));
var Sin = new NodeDescription("math/sin/float", "Logic", "SIN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.sin));
var Asin = new NodeDescription("math/asin/float", "Logic", "ASIN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.asin));
var Cos = new NodeDescription("math/cos/float", "Logic", "COS", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.cos));
var Acos = new NodeDescription("math/acos/float", "Logic", "ACOS", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.acos));
var Tan = new NodeDescription("math/tan/float", "Logic", "TAN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.tan));
var Atan = new NodeDescription("math/atan/float", "Logic", "ATAN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.atan));
var Mix = new NodeDescription("math/mix/float", "Logic", "MIX", (description, graph) => new In3Out1FuncNode(description, graph, ["float", "float", "float"], "float", (a, b, t) => {
  const s = 1 - t;
  return a * s + b * t;
}, ["a", "b", "t"]));
var ToFloat2 = new NodeDescription("math/toFloat/float", "Logic", "To Float", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", (a) => Number(a)));
var Min = new NodeDescription("math/min/float", "Logic", "MIN", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => Math.min(a, b)));
var Max = new NodeDescription("math/max/float", "Logic", "MAX", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "float", (a, b) => Math.max(a, b)));
var Clamp = new NodeDescription("math/clamp/float", "Logic", "CLAMP", (description, graph) => new In3Out1FuncNode(description, graph, ["float", "float", "float"], "float", (value, min, max) => value < min ? min : value > max ? max : value, ["value", "min", "max"]));
var Abs = new NodeDescription("math/abs/float", "Logic", "ABS", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.abs));
var Sign = new NodeDescription("math/sign/float", "Logic", "SIGN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.sign));
var Floor = new NodeDescription("math/floor/float", "Logic", "FLOOR", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.floor));
var Ceil = new NodeDescription("math/ceil/float", "Logic", "CEIL", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.ceil));
var Round = new NodeDescription("math/round/float", "Logic", "ROUND", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.round));
var Trunc = new NodeDescription("math/trunc/float", "Logic", "TRUNC", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "float", Math.trunc));
var Random = new NodeDescription("math/random/float", "Logic", "RANDOM", (description, graph) => new In0Out1FuncNode(description, graph, "float", Math.random));
var Equal2 = new NodeDescription("math/equal/float", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "boolean", (a, b) => a === b));
var GreaterThan = new NodeDescription("math/greaterThan/float", "Logic", ">", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "boolean", (a, b) => a > b));
var GreaterThanOrEqual = new NodeDescription("math/greaterThanOrEqual/float", "Logic", "≥", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "boolean", (a, b) => a >= b));
var LessThan = new NodeDescription("math/lessThan/float", "Logic", "<", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "boolean", (a, b) => a < b));
var LessThanOrEqual = new NodeDescription("math/lessThanOrEqual/float", "Logic", "≤", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "boolean", (a, b) => a <= b));
var IsNaN = new NodeDescription("math/isNaN/float", "Logic", "isNaN", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "boolean", Number.isNaN));
var IsInf = new NodeDescription("math/isInf/float", "Logic", "isInf", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "boolean", (a) => !Number.isFinite(a) && !Number.isNaN(a)));

// ../../node_modules/behave-graph/dist/lib/parseFloats.js
var cSeparator = /[^\d+.-]+/;
function parseSafeFloat(text, fallback = 0) {
  try {
    return Number.parseFloat(text);
  } catch {
    return fallback;
  }
}
function parseSafeFloats(text, fallback = 0) {
  return text.split(cSeparator).filter(Boolean).map((value) => parseSafeFloat(value, fallback));
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/FloatValue.js
var FloatValue = new ValueType("float", () => 0, (value) => typeof value === "string" ? parseSafeFloat(value, 0) : value, (value) => value);

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/IntegerNodes.js
var IntegerNodes_exports = {};
__export(IntegerNodes_exports, {
  Abs: () => Abs2,
  Add: () => Add2,
  Clamp: () => Clamp2,
  Constant: () => Constant3,
  Divide: () => Divide2,
  Equal: () => Equal3,
  GreaterThan: () => GreaterThan2,
  GreaterThanOrEqual: () => GreaterThanOrEqual2,
  LessThan: () => LessThan2,
  LessThanOrEqual: () => LessThanOrEqual2,
  Max: () => Max2,
  Min: () => Min2,
  Modulus: () => Modulus2,
  Multiply: () => Multiply2,
  Negate: () => Negate2,
  Sign: () => Sign2,
  Subtract: () => Subtract2,
  ToFloat: () => ToFloat3
});
var Constant3 = new NodeDescription("math/integer", "Logic", "Integer", (description, graph) => new In1Out1FuncNode(description, graph, ["integer"], "integer", (a) => a));
var Add2 = new NodeDescription("math/add/integer", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a + b));
var Subtract2 = new NodeDescription("math/subtract/integer", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a - b));
var Negate2 = new NodeDescription("math/negate/integer", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["integer"], "integer", (a) => -a));
var Multiply2 = new NodeDescription("math/multiply/integer", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a * b));
var Divide2 = new NodeDescription("math/divide/integer", "Logic", "÷", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a / b));
var Modulus2 = new NodeDescription("math/modulus/integer", "Logic", "MOD", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a % b));
var ToFloat3 = new NodeDescription("math/toFloat/integer", "Logic", "To Float", (description, graph) => new In1Out1FuncNode(description, graph, ["integer"], "float", (a) => Number(a)));
var Min2 = new NodeDescription("math/min/integer", "Logic", "MIN", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a > b ? b : a));
var Max2 = new NodeDescription("math/max/integer", "Logic", "MAX", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "integer", (a, b) => a > b ? a : b));
var Clamp2 = new NodeDescription("math/clamp/integer", "Logic", "CLAMP", (description, graph) => new In3Out1FuncNode(description, graph, ["integer", "integer", "integer"], "integer", (value, min, max) => value < min ? min : value > max ? max : value, ["value", "min", "max"]));
var Abs2 = new NodeDescription("math/abs/integer", "Logic", "ABS", (description, graph) => new In1Out1FuncNode(description, graph, ["integer"], "integer", (a) => a < 0n ? -a : a));
var Sign2 = new NodeDescription("math/sign/integer", "Logic", "SIGN", (description, graph) => new In1Out1FuncNode(description, graph, ["integer"], "integer", (a) => a < 0n ? -1n : a > 0n ? 1n : 0n));
var Equal3 = new NodeDescription("math/equal/integer", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "boolean", (a, b) => a === b));
var GreaterThan2 = new NodeDescription("math/greaterThan/integer", "Logic", ">", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "boolean", (a, b) => a > b));
var GreaterThanOrEqual2 = new NodeDescription("math/greaterThanOrEqual/integer", "Logic", "≥", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "boolean", (a, b) => a >= b));
var LessThan2 = new NodeDescription("math/lessThan/integer", "Logic", "<", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "boolean", (a, b) => a < b));
var LessThanOrEqual2 = new NodeDescription("math/lessThanOrEqual/integer", "Logic", "≤", (description, graph) => new In2Out1FuncNode(description, graph, ["integer", "integer"], "boolean", (a, b) => a <= b));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/IntegerValue.js
var IntegerValue = new ValueType("integer", () => 0n, (value) => BigInt(value), (value) => Number.MIN_SAFE_INTEGER <= value && value <= Number.MAX_SAFE_INTEGER ? Number(value) : value.toString());

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/StringNodes.js
var StringNodes_exports = {};
__export(StringNodes_exports, {
  Concat: () => Concat,
  Constant: () => Constant4,
  Equal: () => Equal4,
  Includes: () => Includes,
  Length: () => Length
});
var Constant4 = new NodeDescription("logic/string", "Logic", "String", (description, graph) => new In1Out1FuncNode(description, graph, ["string"], "string", (a) => a));
var Concat = new NodeDescription("logic/concat/string", "Logic", "Concat", (description, graph) => new In2Out1FuncNode(description, graph, ["string", "string"], "string", (a, b) => a.concat(b)));
var Includes = new NodeDescription("logic/includes/string", "Logic", "Includes", (description, graph) => new In2Out1FuncNode(description, graph, ["string", "string"], "boolean", (a, b) => a.includes(b)));
var Length = new NodeDescription("logic/length/string", "Logic", "Length", (description, graph) => new In1Out1FuncNode(description, graph, ["string"], "integer", (a) => BigInt(a.length)));
var Equal4 = new NodeDescription("math/equal/string", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["string", "string"], "boolean", (a, b) => a === b));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Values/StringValue.js
var StringValue = new ValueType("string", () => "", (value) => value, (value) => value);

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/DoN.js
var DoN = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("integer", "n", 1),
      new Socket("flow", "reset")
    ], [new Socket("flow", "flow"), new Socket("integer", "count")]);
    this.count = 0;
  }
  triggered(fiber, triggeringSocketName) {
    if (triggeringSocketName === "reset") {
      this.count = 0;
      return;
    }
    if (triggeringSocketName === "flow") {
      if (this.count < Number(this.readInput("n"))) {
        this.writeOutput("count", this.count);
        this.count++;
        fiber.commit(this, "flow");
      }
      return;
    }
    throw new Error("should not get here");
  }
};
DoN.Description = new NodeDescription("flow/doN", "Flow", "DoN", (description, graph) => new DoN(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/DoOnce.js
var DoOnce = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [new Socket("flow", "flow"), new Socket("flow", "reset")], [new Socket("flow", "flow")]);
    this.firedOnce = false;
  }
  triggered(fiber, triggeringSocketName) {
    if (triggeringSocketName === "reset") {
      this.firedOnce = false;
      return;
    }
    if (triggeringSocketName === "flow") {
      if (!this.firedOnce) {
        this.firedOnce = true;
        fiber.commit(this, "flow");
      }
      return;
    }
    throw new Error("should not get here");
  }
};
DoOnce.Description = new NodeDescription("flow/doOnce", "Flow", "DoOnce", (description, graph) => new DoOnce(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Gate.js
var Gate = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("flow", "open"),
      new Socket("flow", "close"),
      new Socket("flow", "toggle"),
      new Socket("boolean", "startClosed", true)
    ], [new Socket("flow", "flow")]);
    this.isInitialized = false;
    this.isClosed = true;
  }
  triggered(fiber, triggeringSocketName) {
    if (!this.isInitialized) {
      this.isClosed = this.readInput("startClosed");
      this.isInitialized = true;
    }
    switch (triggeringSocketName) {
      case "flow": {
        if (!this.isClosed) {
          fiber.commit(this, "flow");
        }
        break;
      }
      case "open": {
        this.isClosed = false;
        return;
      }
      case "close": {
        this.isClosed = true;
        return;
      }
      case "toggle": {
        this.isClosed = !this.isClosed;
        return;
      }
      default:
        new Error("should not get here");
    }
  }
};
Gate.Description = new NodeDescription("flow/gate", "Flow", "Gate", (description, graph) => new Gate(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/MultieGate.js
var MultiGate = class extends FlowNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("flow", "reset"),
      new Socket("boolean", "loop", true),
      new Socket("integer", "startIndex", 0)
    ], [
      new Socket("flow", "1"),
      new Socket("flow", "2"),
      new Socket("flow", "3")
    ]);
    this.isInitialized = false;
    this.nextIndex = 0;
  }
  triggered(fiber, triggeringSocketName) {
    if (!this.isInitialized) {
      this.nextIndex = Number(this.readInput("startIndex"));
    }
    if (this.readInput("loop")) {
      this.nextIndex = this.nextIndex % this.outputSockets.length;
    }
    switch (triggeringSocketName) {
      case "reset": {
        this.nextIndex = 0;
        return;
      }
      case "flow": {
        if (0 <= this.nextIndex && this.nextIndex < this.outputSockets.length) {
          fiber.commit(this, this.outputSockets[this.nextIndex].name);
        }
        this.nextIndex++;
        return;
      }
    }
    const sequenceIteration = (i) => {
      if (i < this.outputSockets.length) {
        const outputSocket = this.outputSockets[i];
        fiber.commit(this, outputSocket.name, () => {
          sequenceIteration(i + 1);
        });
      }
    };
    sequenceIteration(0);
  }
};
MultiGate.Description = new NodeDescription("flow/multiGate", "Flow", "MultiGate", (description, graph) => new MultiGate(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/Flow/Throttle.js
var Throttle = class extends AsyncNode {
  constructor(description, graph) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("float", "duration", 1),
      new Socket("flow", "cancel")
    ], [new Socket("flow", "flow")]);
    this.triggerVersion = 0;
    this.timeoutPending = false;
  }
  triggered(engine, triggeringSocketName, finished) {
    if (triggeringSocketName === "cancel") {
      if (this.timeoutPending) {
        this.triggerVersion++;
        this.timeoutPending = false;
      }
      return;
    }
    if (this.timeoutPending) {
      return;
    }
    this.triggerVersion++;
    const localTriggerCount = this.triggerVersion;
    this.timeoutPending = true;
    setTimeout(() => {
      if (this.triggerVersion !== localTriggerCount) {
        return;
      }
      Assert.mustBeTrue(this.timeoutPending);
      this.timeoutPending = false;
      engine.commitToNewFiber(this, "flow");
      finished();
    }, this.readInput("duration") * 1e3);
  }
  dispose() {
    this.triggerVersion++;
    this.timeoutPending = false;
  }
};
Throttle.Description = new NodeDescription("flow/throttle", "Flow", "Throttle", (description, graph) => new Throttle(description, graph));

// ../../node_modules/behave-graph/dist/lib/toCamelCase.js
function toCamelCase(text) {
  if (text.length > 0) {
    return text.at(0)?.toLocaleUpperCase() + text.slice(1);
  }
  return text;
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/registerSerializersForValueType.js
function registerSerializersForValueType(registry, valueTypeName) {
  const camelCaseValueTypeName = toCamelCase(valueTypeName);
  registry.nodes.register(new NodeDescription(`math/to${camelCaseValueTypeName}/string`, "Logic", `To ${camelCaseValueTypeName}`, (graph, nodeType) => new In1Out1FuncNode(graph, nodeType, ["string"], valueTypeName, (a) => registry.values.get(valueTypeName).deserialize(a))), new NodeDescription(`math/toString/${valueTypeName}`, "Logic", "To String", (graph, nodeType) => new In1Out1FuncNode(graph, nodeType, [valueTypeName], "string", (a) => registry.values.get(valueTypeName).serialize(a))));
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Core/registerCoreProfile.js
function registerCoreProfile(registry, logger = new DefaultLogger(), lifecycleEventEmitter = new ManualLifecycleEventEmitter()) {
  const { nodes, values } = registry;
  values.register(BooleanValue);
  values.register(StringValue);
  values.register(IntegerValue);
  values.register(FloatValue);
  nodes.register(...getNodeDescriptions(StringNodes_exports));
  nodes.register(...getNodeDescriptions(BooleanNodes_exports));
  nodes.register(...getNodeDescriptions(IntegerNodes_exports));
  nodes.register(...getNodeDescriptions(FloatNodes_exports));
  nodes.register(Log.Description(logger));
  nodes.register(ExpectTrue.Description);
  nodes.register(LifecycleOnStart.Description(lifecycleEventEmitter));
  nodes.register(LifecycleOnEnd.Description(lifecycleEventEmitter));
  nodes.register(LifecycleOnTick.Description(lifecycleEventEmitter));
  nodes.register(Branch.Description);
  nodes.register(FlipFlop.Description);
  nodes.register(ForLoop.Description);
  nodes.register(Sequence.Description);
  nodes.register(Delay.Description);
  nodes.register(Debounce.Description);
  nodes.register(Throttle.Description);
  nodes.register(DoN.Description);
  nodes.register(DoOnce.Description);
  nodes.register(Gate.Description);
  nodes.register(MultiGate.Description);
  ["boolean", "float", "integer"].forEach((valueTypeName) => {
    registerSerializersForValueType(registry, valueTypeName);
  });
  return registry;
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Internal/Vec3.js
var Vec3 = class {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  clone(optionalResult = new Vec3()) {
    return optionalResult.set(this.x, this.y, this.z);
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
};
function vec3Equals(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
function vec3Add(a, b, optionalResult = new Vec3()) {
  return optionalResult.set(a.x + b.x, a.y + b.y, a.z + b.z);
}
function vec3Subtract(a, b, optionalResult = new Vec3()) {
  return optionalResult.set(a.x - b.x, a.y - b.y, a.z - b.z);
}
function vec3Scale(a, b, optionalResult = new Vec3()) {
  return optionalResult.set(a.x * b, a.y * b, a.z * b);
}
function vec3Negate(a, optionalResult = new Vec3()) {
  return optionalResult.set(-a.x, -a.y, -a.z);
}
function vec3Length(a) {
  return Math.sqrt(vec3Dot(a, a));
}
function vec3Normalize(a, optionalResult = new Vec3()) {
  const invLength = 1 / vec3Length(a);
  return vec3Scale(a, invLength, optionalResult);
}
function vec3Dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function vec3Cross(a, b, optionalResult = new Vec3()) {
  const ax = a.x;
  const ay = a.y;
  const az = a.z;
  const bx = b.x;
  const by = b.y;
  const bz = b.z;
  return optionalResult.set(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
}
function vec3Mix(a, b, t, optionalResult = new Vec3()) {
  const s = 1 - t;
  return optionalResult.set(a.x * s + b.x * t, a.y * s + b.y * t, a.z * s + b.z * t);
}
function vec3FromArray(array, offset = 0, optionalResult = new Vec3()) {
  return optionalResult.set(array[offset + 0], array[offset + 1], array[offset + 2]);
}
function vec3ToArray(a, array, offset = 0) {
  array[offset + 0] = a.x;
  array[offset + 1] = a.y;
  array[offset + 2] = a.z;
}
function vec3ToString(a) {
  return `(${a.x}, ${a.y}, ${a.z})`;
}
function vec3Parse(text, optionalResult = new Vec3()) {
  return vec3FromArray(parseSafeFloats(text), 0, optionalResult);
}
function hslToRGB(hsl, optionalResult = new Vec3()) {
  function hue2rgb(p2, q2, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p2 + (q2 - p2) * 6 * t;
    }
    if (t < 1 / 2) {
      return q2;
    }
    if (t < 2 / 3) {
      return p2 + (q2 - p2) * 6 * (2 / 3 - t);
    }
    return p2;
  }
  const h = (hsl.x % 1 + 1) % 1;
  const s = Math.min(Math.max(hsl.y, 0), 1);
  const l = Math.min(Math.max(hsl.z, 0), 1);
  if (s === 0) {
    return optionalResult.set(1, 1, 1);
  }
  const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  const q = 2 * l - p;
  return optionalResult.set(hue2rgb(q, p, h + 1 / 3), hue2rgb(q, p, h), hue2rgb(q, p, h - 1 / 3));
}
function rgbToHSL(rgb, optionalResult = new Vec3()) {
  const r = rgb.x, g = rgb.y, b = rgb.z;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const lightness = (min + max) / 2;
  if (min === max) {
    hue = 0;
    saturation = 0;
  } else {
    const delta = max - min;
    saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
    switch (max) {
      case r:
        hue = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }
    hue /= 6;
  }
  return optionalResult.set(hue, saturation, lightness);
}
function hexToRGB(hex, optionalResult = new Vec3()) {
  hex = Math.floor(hex);
  return optionalResult.set((hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255);
}
function rgbToHex(rgb) {
  return rgb.x * 255 << 16 ^ rgb.y * 255 << 8 ^ rgb.z * 255 << 0;
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/ColorValue.js
var ColorValue = new ValueType("color", () => new Vec3(), (value) => typeof value === "string" ? vec3Parse(value) : new Vec3(value.r, value.g, value.b), (value) => ({ r: value.x, g: value.y, b: value.z }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/EulerValue.js
var EulerValue = new ValueType("euler", () => new Vec3(), (value) => typeof value === "string" ? vec3Parse(value) : new Vec3(value.x, value.y, value.z), (value) => ({ x: value.x, y: value.y, z: value.z }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Internal/Vec4.js
var Vec4 = class {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  clone(optionalResult = new Vec4()) {
    return optionalResult.set(this.x, this.y, this.z, this.w);
  }
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
};
function vec4Equals(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z && a.w == b.w;
}
function vec4Add(a, b, optionalResult = new Vec4()) {
  return optionalResult.set(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
}
function vec4Subtract(a, b, optionalResult = new Vec4()) {
  return optionalResult.set(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
}
function vec4Scale(a, b, optionalResult = new Vec4()) {
  return optionalResult.set(a.x * b, a.y * b, a.z * b, a.w * b);
}
function vec4Negate(a, optionalResult = new Vec4()) {
  return optionalResult.set(-a.x, -a.y, -a.z, -a.w);
}
function vec4Length(a) {
  return Math.sqrt(vec4Dot(a, a));
}
function vec4Normalize(a, optionalResult = new Vec4()) {
  const invLength = 1 / vec4Length(a);
  return vec4Scale(a, invLength, optionalResult);
}
function vec4Dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
}
function vec4Mix(a, b, t, optionalResult = new Vec4()) {
  const s = 1 - t;
  return optionalResult.set(a.x * s + b.x * t, a.y * s + b.y * t, a.z * s + b.z * t, a.w * s + b.w * t);
}
function vec4FromArray(array, offset = 0, optionalResult = new Vec4()) {
  return optionalResult.set(array[offset + 0], array[offset + 1], array[offset + 2], array[offset + 3]);
}
function vec4ToArray(a, array, offset = 0) {
  array[offset + 0] = a.x;
  array[offset + 1] = a.y;
  array[offset + 2] = a.z;
  array[offset + 3] = a.w;
}
function vec4ToString(a) {
  return `(${a.x}, ${a.y}, ${a.z}, ${a.w})`;
}
function vec4Parse(text, optionalResult = new Vec4()) {
  return vec4FromArray(parseSafeFloats(text), 0, optionalResult);
}
function quatConjugate(a, optionalResult = new Vec4()) {
  return optionalResult.set(-a.x, -a.y, -a.z, a.w);
}
function quatMultiply(a, b, optionalResult = new Vec4()) {
  const qax = a.x;
  const qay = a.y;
  const qaz = a.z;
  const qaw = a.w;
  const qbx = b.x;
  const qby = b.y;
  const qbz = b.z;
  const qbw = b.w;
  return optionalResult.set(qax * qbw + qaw * qbx + qay * qbz - qaz * qby, qay * qbw + qaw * qby + qaz * qbx - qax * qbz, qaz * qbw + qaw * qbz + qax * qby - qay * qbx, qaw * qbw - qax * qbx - qay * qby - qaz * qbz);
}
function quatSlerp(a, b, t, optionalResult = new Vec4()) {
  if (t <= 0)
    return a.clone(optionalResult);
  if (t >= 1)
    return b.clone(optionalResult);
  let cosHalfTheta = vec4Dot(a, b);
  if (cosHalfTheta < 0) {
    vec4Negate(b, optionalResult);
    cosHalfTheta = -cosHalfTheta;
  } else {
    b.clone(optionalResult);
  }
  if (cosHalfTheta >= 1) {
    return optionalResult;
  }
  const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
  if (sqrSinHalfTheta <= Number.EPSILON) {
    vec4Mix(a, optionalResult, t);
    vec4Normalize(optionalResult, optionalResult);
    return optionalResult;
  }
  const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
  const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
  const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
  const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
  optionalResult.w = a.w * ratioA + optionalResult.w * ratioB;
  optionalResult.x = a.x * ratioA + optionalResult.x * ratioB;
  optionalResult.y = a.y * ratioA + optionalResult.y * ratioB;
  optionalResult.z = a.z * ratioA + optionalResult.z * ratioB;
  return optionalResult;
}
function eulerToQuat(euler, optionalResult = new Vec4()) {
  const c1 = Math.cos(euler.x / 2);
  const c2 = Math.cos(euler.y / 2);
  const c3 = Math.cos(euler.z / 2);
  const s1 = Math.sin(euler.x / 2);
  const s2 = Math.sin(euler.y / 2);
  const s3 = Math.sin(euler.z / 2);
  return optionalResult.set(s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3);
}
function angleAxisToQuat(angle, axis, optionalResult = new Vec4()) {
  const halfAngle = angle / 2;
  const s = Math.sin(halfAngle);
  return optionalResult.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/QuatValue.js
var QuatValue = new ValueType("quat", () => new Vec4(), (value) => typeof value === "string" ? vec4Parse(value) : new Vec4(value.x, value.y, value.z, value.w), (value) => ({ x: value.x, y: value.y, z: value.z, w: value.w }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Internal/Vec2.js
var Vec2 = class {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  clone(optionalResult = new Vec2()) {
    return optionalResult.set(this.x, this.y);
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
};
function vec2Equals(a, b) {
  return a.x === b.x && a.y === b.y;
}
function vec2Add(a, b, optionalResult = new Vec2()) {
  return optionalResult.set(a.x + b.x, a.y + b.y);
}
function vec2Subtract(a, b, optionalResult = new Vec2()) {
  return optionalResult.set(a.x - b.x, a.y - b.y);
}
function vec2Scale(a, b, optionalResult = new Vec2()) {
  return optionalResult.set(a.x * b, a.y * b);
}
function vec2Negate(a, optionalResult = new Vec2()) {
  return optionalResult.set(-a.x, -a.y);
}
function vec2Length(a) {
  return Math.sqrt(vec2Dot(a, a));
}
function vec2Normalize(a, optionalResult = new Vec2()) {
  const invLength = 1 / vec2Length(a);
  return vec2Scale(a, invLength, optionalResult);
}
function vec2Dot(a, b) {
  return a.x * b.x + a.y * b.y;
}
function vec2Mix(a, b, t, optionalResult = new Vec2()) {
  const s = 1 - t;
  return optionalResult.set(a.x * s + b.x * t, a.y * s + b.y * t);
}
function vec2FromArray(array, offset = 0, optionalResult = new Vec2()) {
  return optionalResult.set(array[offset + 0], array[offset + 1]);
}
function vec2ToArray(a, array, offset = 0) {
  array[offset + 0] = a.x;
  array[offset + 1] = a.y;
}
function vec2ToString(a) {
  return `(${a.x}, ${a.y})`;
}
function vec2Parse(text, optionalResult = new Vec2()) {
  return vec2FromArray(parseSafeFloats(text), 0, optionalResult);
}

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec2Value.js
var Vec2Value = new ValueType("vec2", () => new Vec2(), (value) => typeof value === "string" ? vec2Parse(value) : new Vec2(value.x, value.y), (value) => ({ x: value.x, y: value.y }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec3Value.js
var Vec3Value = new ValueType("vec3", () => new Vec3(), (value) => typeof value === "string" ? vec3Parse(value) : new Vec3(value.x, value.y, value.z), (value) => ({ x: value.x, y: value.y, z: value.z }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec4Value.js
var Vec4Value = new ValueType("vec4", () => new Vec4(), (value) => typeof value === "string" ? vec4Parse(value) : new Vec4(value.x, value.y, value.z, value.w), (value) => ({ x: value.x, y: value.y, z: value.z, w: value.w }));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Abstractions/Drivers/DummyScene.js
var DummyScene = class {
  constructor() {
    this.onSceneChanged = new EventEmitter();
    this.valueRegistry = new ValueTypeRegistry();
    const values = this.valueRegistry;
    values.register(BooleanValue);
    values.register(StringValue);
    values.register(IntegerValue);
    values.register(FloatValue);
    values.register(Vec2Value);
    values.register(Vec3Value);
    values.register(Vec4Value);
    values.register(ColorValue);
    values.register(EulerValue);
    values.register(QuatValue);
  }
  getProperty(jsonPath, valueTypeName) {
    return this.valueRegistry.get(valueTypeName).creator();
  }
  setProperty() {
    this.onSceneChanged.emit();
  }
  addOnClickedListener(jsonPath, callback) {
    throw new Error("Method not implemented.");
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Actions/SetSceneProperty.js
var SetSceneProperty = class extends FlowNode {
  constructor(description, graph, valueTypeName, scene) {
    super(description, graph, [
      new Socket("flow", "flow"),
      new Socket("string", "jsonPath"),
      new Socket(valueTypeName, "value")
    ], [new Socket("flow", "flow")]);
    this.valueTypeName = valueTypeName;
    this.scene = scene;
  }
  static GetDescriptions(scene, ...valueTypeNames) {
    return valueTypeNames.map((valueTypeName) => new NodeDescription(`scene/set/${valueTypeName}`, "Action", `Set Scene ${toCamelCase(valueTypeName)}`, (description, graph) => new SetSceneProperty(description, graph, valueTypeName, scene)));
  }
  triggered(fiber, triggeringSocketName) {
    const scene = this.scene;
    const value = this.readInput("value");
    scene.setProperty(this.readInput("jsonPath"), this.valueTypeName, value);
    fiber.commit(this, "flow");
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Events/OnSceneNodeClick.js
var OnSceneNodeClick = class extends EventNode {
  constructor(description, graph) {
    super(description, graph, [], [new Socket("flow", "flow"), new Socket("float", "nodeIndex")]);
  }
};
OnSceneNodeClick.Description = new NodeDescription("scene/nodeClick", "Event", "On Node Click", (description, graph) => new OnSceneNodeClick(description, graph));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Logic/VecElements.js
var VecElements = class extends ImmediateNode {
  constructor(description, graph, valueTypeName, elementNames = ["x", "y", "z", "w"], toArray) {
    super(description, graph, [new Socket(valueTypeName, "value")], elementNames.map((elementName) => new Socket("float", elementName)), () => {
      const value = this.readInput("value");
      const elementValues = elementNames.map(() => 0);
      toArray(value, elementValues, 0);
      elementNames.forEach((elementName, index) => this.writeOutput(elementName, elementValues[index]));
    });
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Queries/GetSceneProperty.js
var GetSceneProperty = class extends ImmediateNode {
  constructor(description, graph, valueTypeName, scene) {
    super(description, graph, [new Socket("string", "jsonPath")], [new Socket(valueTypeName, "value")], () => {
      this.writeOutput("value", this.scene.getProperty(this.readInput("jsonPath"), valueTypeName));
    });
    this.valueTypeName = valueTypeName;
    this.scene = scene;
  }
  static GetDescriptions(scene, ...valueTypeNames) {
    return valueTypeNames.map((valueTypeName) => new NodeDescription(`scene/get/${valueTypeName}`, "Query", `Get Scene ${toCamelCase(valueTypeName)}`, (description, graph) => new GetSceneProperty(description, graph, valueTypeName, scene)));
  }
};

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/ColorNodes.js
var ColorNodes_exports = {};
__export(ColorNodes_exports, {
  Add: () => Add3,
  ColorToHex: () => ColorToHex,
  ColorToHsl: () => ColorToHsl,
  Constant: () => Constant5,
  Create: () => Create,
  Elements: () => Elements,
  Equal: () => Equal5,
  HexToColor: () => HexToColor,
  HslToColor: () => HslToColor,
  Mix: () => Mix2,
  Negate: () => Negate3,
  Scale: () => Scale,
  Subtract: () => Subtract3
});
var Constant5 = new NodeDescription("math/color", "Logic", "Color", (description, graph) => new In1Out1FuncNode(description, graph, ["color"], "color", (a) => a));
var Create = new NodeDescription("math/toColor/rgb", "Logic", "RGB To Color", (description, graph) => new In3Out1FuncNode(description, graph, ["float", "float", "float"], "color", (r, g, b) => new Vec3(r, g, b), ["r", "g", "b"]));
var Elements = new NodeDescription("math/toRgb/color", "Logic", "Color to RGB", (description, graph) => new VecElements(description, graph, "color", ["r", "g", "b"], vec3ToArray));
var Add3 = new NodeDescription("math/add/color", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["color", "color"], "color", vec3Add));
var Subtract3 = new NodeDescription("math/subtract/color", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["color", "color"], "color", vec3Subtract));
var Negate3 = new NodeDescription("math/negate/color", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["color"], "color", vec3Negate));
var Scale = new NodeDescription("math/scale/color", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["color", "float"], "color", vec3Scale));
var Mix2 = new NodeDescription("math/mix/color", "Logic", "÷", (description, graph) => new In3Out1FuncNode(description, graph, ["color", "color", "float"], "color", vec3Mix, ["a", "b", "t"]));
var HslToColor = new NodeDescription("math/ToColor/hsl", "Logic", "HSL to Color", (description, graph) => new In1Out1FuncNode(description, graph, ["vec3"], "color", hslToRGB));
var ColorToHsl = new NodeDescription("math/toHsl/color", "Logic", "Color to HSL", (description, graph) => new In1Out1FuncNode(description, graph, ["color"], "vec3", rgbToHSL));
var HexToColor = new NodeDescription("math/toColor/hex", "Logic", "HEX to Color", (description, graph) => new In1Out1FuncNode(description, graph, ["float"], "color", hexToRGB));
var ColorToHex = new NodeDescription("math/toHex/color", "Logic", "Color to HEX", (description, graph) => new In1Out1FuncNode(description, graph, ["color"], "float", rgbToHex));
var Equal5 = new NodeDescription("math/equal/color", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["color", "color"], "boolean", vec3Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/EulerNodes.js
var EulerNodes_exports = {};
__export(EulerNodes_exports, {
  Add: () => Add4,
  Constant: () => Constant6,
  Create: () => Create2,
  Elements: () => Elements2,
  Equal: () => Equal6,
  Mix: () => Mix3,
  Negate: () => Negate4,
  Scale: () => Scale2,
  Subtract: () => Subtract4,
  toQuat: () => toQuat
});
var Constant6 = new NodeDescription("math/euler", "Logic", "Euler", (description, graph) => new In1Out1FuncNode(description, graph, ["euler"], "euler", (a) => a));
var Create2 = new NodeDescription("math/toEuler/float", "Logic", "Float to Euler", (description, graph) => new In3Out1FuncNode(description, graph, ["float", "float", "float"], "euler", (x, y, z) => new Vec3(x, y, z), ["x", "y", "z"]));
var Elements2 = new NodeDescription("math/toFloat/euler", "Logic", "Euler to Float", (description, graph) => new VecElements(description, graph, "euler", ["x", "y", "z"], vec3ToArray));
var Add4 = new NodeDescription("math/add/euler", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["euler", "euler"], "euler", vec3Add));
var Subtract4 = new NodeDescription("math/subtract/euler", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["euler", "euler"], "euler", vec3Subtract));
var Negate4 = new NodeDescription("math/negate/euler", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["euler"], "euler", vec3Negate));
var Scale2 = new NodeDescription("math/scale/euler", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["euler", "float"], "euler", vec3Scale));
var Mix3 = new NodeDescription("math/mix/euler", "Logic", "÷", (description, graph) => new In3Out1FuncNode(description, graph, ["euler", "euler", "float"], "euler", vec3Mix, ["a", "b", "t"]));
var toQuat = new NodeDescription("math/toQuat/euler", "Logic", "÷", (description, graph) => new In1Out1FuncNode(description, graph, ["euler"], "quat", eulerToQuat));
var Equal6 = new NodeDescription("math/equal/euler", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["euler", "euler"], "boolean", vec3Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec2Nodes.js
var Vec2Nodes_exports = {};
__export(Vec2Nodes_exports, {
  Add: () => Add5,
  Constant: () => Constant7,
  Create: () => Create3,
  Dot: () => Dot,
  Elements: () => Elements3,
  Equal: () => Equal7,
  Length: () => Length2,
  Mix: () => Mix4,
  Negate: () => Negate5,
  Normalize: () => Normalize,
  Scale: () => Scale3,
  Subtract: () => Subtract5
});
var Constant7 = new NodeDescription("math/vec2", "Logic", "Vec2", (description, graph) => new In1Out1FuncNode(description, graph, ["vec2"], "vec2", (a) => a));
var Create3 = new NodeDescription("math/toVec2/float", "Logic", "Float to Vec2", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "float"], "vec2", (x, y) => new Vec2(x, y), ["x", "y"]));
var Elements3 = new NodeDescription("math/toFloat/vec2", "Logic", "Vec2 To Float", (description, graph) => new VecElements(description, graph, "vec2", ["x", "y", "z"], vec2ToArray));
var Add5 = new NodeDescription("math/add/vec2", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["vec2", "vec2"], "vec2", vec2Add));
var Subtract5 = new NodeDescription("math/subtract/vec2", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["vec2", "vec2"], "vec2", vec2Subtract));
var Negate5 = new NodeDescription("math/negate/vec2", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["vec2"], "vec2", vec2Negate));
var Scale3 = new NodeDescription("math/scale/vec2", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["vec2", "float"], "vec2", vec2Scale));
var Length2 = new NodeDescription("math/length/vec2", "Logic", "Length", (description, graph) => new In1Out1FuncNode(description, graph, ["vec2"], "float", vec2Length));
var Normalize = new NodeDescription("math/normalize/vec2", "Logic", "Normalize", (description, graph) => new In1Out1FuncNode(description, graph, ["vec2"], "vec2", vec2Normalize));
var Dot = new NodeDescription("math/dot/vec2", "Logic", "Dot Product", (description, graph) => new In2Out1FuncNode(description, graph, ["vec2", "vec2"], "float", vec2Dot));
var Mix4 = new NodeDescription("math/mix/vec2", "Logic", "÷", (description, graph) => new In3Out1FuncNode(description, graph, ["vec2", "vec2", "float"], "vec2", vec2Mix, ["a", "b", "t"]));
var Equal7 = new NodeDescription("math/equal/vec2", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["vec2", "vec2"], "boolean", vec2Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec3Nodes.js
var Vec3Nodes_exports = {};
__export(Vec3Nodes_exports, {
  Add: () => Add6,
  Constant: () => Constant8,
  Create: () => Create4,
  Cross: () => Cross,
  Dot: () => Dot2,
  Elements: () => Elements4,
  Equal: () => Equal8,
  Length: () => Length3,
  Mix: () => Mix5,
  Negate: () => Negate6,
  Normalize: () => Normalize2,
  Scale: () => Scale4,
  Subtract: () => Subtract6
});
var Constant8 = new NodeDescription("math/vec3", "Logic", "Vec3", (description, graph) => new In1Out1FuncNode(description, graph, ["vec3"], "vec3", (a) => a));
var Create4 = new NodeDescription("math/toVec3/float", "Logic", "Float to Vec3", (description, graph) => new In3Out1FuncNode(description, graph, ["float", "float", "float"], "vec3", (x, y, z) => new Vec3(x, y, z), ["x", "y", "z"]));
var Elements4 = new NodeDescription("math/toFloat/vec3", "Logic", "Vec3 To Float", (description, graph) => new VecElements(description, graph, "vec3", ["x", "y", "z"], vec3ToArray));
var Add6 = new NodeDescription("math/add/vec3", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "vec3"], "vec3", vec3Add));
var Subtract6 = new NodeDescription("math/subtract/vec3", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "vec3"], "vec3", vec3Subtract));
var Negate6 = new NodeDescription("math/negate/vec3", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["vec3"], "vec3", vec3Negate));
var Scale4 = new NodeDescription("math/scale/vec3", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "float"], "vec3", vec3Scale));
var Length3 = new NodeDescription("math/length/vec3", "Logic", "Length", (description, graph) => new In1Out1FuncNode(description, graph, ["vec3"], "float", vec3Length));
var Normalize2 = new NodeDescription("math/normalize/vec3", "Logic", "Normalize", (description, graph) => new In1Out1FuncNode(description, graph, ["vec3"], "vec3", vec3Normalize));
var Cross = new NodeDescription("math/cross/vec3", "Logic", "Cross", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "vec3"], "vec3", vec3Cross));
var Dot2 = new NodeDescription("math/dot/vec3", "Logic", "Dot", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "vec3"], "float", vec3Dot));
var Mix5 = new NodeDescription("math/mix/vec3", "Logic", "÷", (description, graph) => new In3Out1FuncNode(description, graph, ["vec3", "vec3", "float"], "vec3", vec3Mix, ["a", "b", "t"]));
var Equal8 = new NodeDescription("math/equal/vec3", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["vec3", "vec3"], "boolean", vec3Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/Vec4Nodes.js
var Vec4Nodes_exports = {};
__export(Vec4Nodes_exports, {
  Add: () => Add7,
  Constant: () => Constant9,
  Create: () => Create5,
  Dot: () => Dot3,
  Elements: () => Elements5,
  Equal: () => Equal9,
  Length: () => Length4,
  Mix: () => Mix6,
  Negate: () => Negate7,
  Normalize: () => Normalize3,
  Scale: () => Scale5,
  Subtract: () => Subtract7
});
var Constant9 = new NodeDescription("math/vec4", "Logic", "Vec4", (description, graph) => new In1Out1FuncNode(description, graph, ["vec4"], "vec4", (a) => a));
var Create5 = new NodeDescription("math/toVec4/float", "Logic", "Float to Vec4", (description, graph) => new In4Out1FuncNode(description, graph, ["float", "float", "float", "float"], "vec4", (x, y, z, w) => new Vec4(x, y, z, w), ["x", "y", "z", "w"]));
var Elements5 = new NodeDescription("math/toFloat/vec4", "Logic", "Vec4 to Float", (description, graph) => new VecElements(description, graph, "vec4", ["x", "y", "z", "w"], vec4ToArray));
var Add7 = new NodeDescription("math/add/vec4", "Logic", "+", (description, graph) => new In2Out1FuncNode(description, graph, ["vec4", "vec4"], "vec4", vec4Add));
var Subtract7 = new NodeDescription("math/subtract/vec4", "Logic", "-", (description, graph) => new In2Out1FuncNode(description, graph, ["vec4", "vec4"], "vec4", vec4Subtract));
var Negate7 = new NodeDescription("math/negate/vec4", "Logic", "-", (description, graph) => new In1Out1FuncNode(description, graph, ["vec4"], "vec4", vec4Negate));
var Scale5 = new NodeDescription("math/scale/vec4", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["vec4", "float"], "vec4", vec4Scale));
var Length4 = new NodeDescription("math/length/vec4", "Logic", "Length", (description, graph) => new In1Out1FuncNode(description, graph, ["vec4"], "float", vec4Length));
var Normalize3 = new NodeDescription("math/normalize/vec4", "Logic", "Normalize", (description, graph) => new In1Out1FuncNode(description, graph, ["vec4"], "vec4", vec4Normalize));
var Dot3 = new NodeDescription("math/dot/vec4", "Logic", "Dot Product", (description, graph) => new In2Out1FuncNode(description, graph, ["vec4", "vec4"], "float", vec4Dot));
var Mix6 = new NodeDescription("math/mix/vec4", "Logic", "÷", (description, graph) => new In3Out1FuncNode(description, graph, ["vec4", "vec4", "float"], "vec4", vec4Mix, ["a", "b", "t"]));
var Equal9 = new NodeDescription("math/equal/vec4", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["vec4", "vec4"], "boolean", vec4Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/Values/QuatNodes.js
var QuatNodes_exports = {};
__export(QuatNodes_exports, {
  Constant: () => Constant10,
  Create: () => Create6,
  Dot: () => Dot4,
  Elements: () => Elements6,
  Equal: () => Equal10,
  FromAngleAxis: () => FromAngleAxis,
  Length: () => Length5,
  Multiply: () => Multiply3,
  Negate: () => Negate8,
  Normalize: () => Normalize4,
  Scale: () => Scale6,
  Slerp: () => Slerp
});
var Constant10 = new NodeDescription("math/quat", "Logic", "Quaternion", (description, graph) => new In1Out1FuncNode(description, graph, ["quat"], "quat", (a) => a));
var Create6 = new NodeDescription("math/toQuat/float", "Logic", "Float to Quat", (description, graph) => new In4Out1FuncNode(description, graph, ["float", "float", "float", "float"], "quat", (x, y, z, w) => new Vec4(x, y, z, w), ["x", "y", "z", "w"]));
var Elements6 = new NodeDescription("math/toFloat/quat", "Logic", "Quat to Float", (description, graph) => new VecElements(description, graph, "quat", ["x", "y", "z", "w"], vec4ToArray));
var Negate8 = new NodeDescription("math/conjugate/quat", "Logic", "Conjugate", (description, graph) => new In1Out1FuncNode(description, graph, ["quat"], "quat", quatConjugate));
var Multiply3 = new NodeDescription("math/multiply/quat", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["quat", "quat"], "quat", quatMultiply));
var Scale6 = new NodeDescription("math/scale/quat", "Logic", "×", (description, graph) => new In2Out1FuncNode(description, graph, ["quat", "float"], "quat", vec4Scale));
var Length5 = new NodeDescription("math/length/quat", "Logic", "Length", (description, graph) => new In1Out1FuncNode(description, graph, ["quat"], "float", vec4Length));
var Normalize4 = new NodeDescription("math/normalize/quat", "Logic", "Normalize", (description, graph) => new In1Out1FuncNode(description, graph, ["quat"], "quat", vec4Normalize));
var Dot4 = new NodeDescription("math/dot/quat", "Logic", "Dot Product", (description, graph) => new In2Out1FuncNode(description, graph, ["quat", "quat"], "float", vec4Dot));
var FromAngleAxis = new NodeDescription("math/toQuat/angleAxis", "Logic", "Angle Axis to Quat", (description, graph) => new In2Out1FuncNode(description, graph, ["float", "vec3"], "quat", angleAxisToQuat));
var Slerp = new NodeDescription("math/slerp/quat", "Logic", "Slerp", (description, graph) => new In3Out1FuncNode(description, graph, ["quat", "quat", "float"], "quat", quatSlerp, ["a", "b", "t"]));
var Equal10 = new NodeDescription("math/equal/quat", "Logic", "=", (description, graph) => new In2Out1FuncNode(description, graph, ["quat", "quat"], "boolean", vec4Equals));

// ../../node_modules/behave-graph/dist/lib/Profiles/Scene/registerSceneProfile.js
function registerSceneProfile(registry, scene = new DummyScene()) {
  const { values, nodes } = registry;
  values.register(Vec2Value);
  values.register(Vec3Value);
  values.register(Vec4Value);
  values.register(ColorValue);
  values.register(EulerValue);
  values.register(QuatValue);
  nodes.register(...getNodeDescriptions(Vec2Nodes_exports));
  nodes.register(...getNodeDescriptions(Vec3Nodes_exports));
  nodes.register(...getNodeDescriptions(Vec4Nodes_exports));
  nodes.register(...getNodeDescriptions(ColorNodes_exports));
  nodes.register(...getNodeDescriptions(EulerNodes_exports));
  nodes.register(...getNodeDescriptions(QuatNodes_exports));
  nodes.register(OnSceneNodeClick.Description);
  const allValueTypeNames = values.getAllNames();
  nodes.register(...SetSceneProperty.GetDescriptions(scene, ...allValueTypeNames));
  nodes.register(...GetSceneProperty.GetDescriptions(scene, ...allValueTypeNames));
  const newValueTypeNames = ["vec2", "vec3", "vec4", "quat", "euler", "color"];
  newValueTypeNames.forEach((valueTypeName) => {
    registerSerializersForValueType(registry, valueTypeName);
  });
  return registry;
}
export {
  Assert,
  AsyncNode,
  BooleanNodes_exports as BooleanNodes,
  BooleanValue,
  Branch,
  ColorNodes_exports as ColorNodes,
  ColorValue,
  CustomEvent,
  Debounce,
  DefaultLogger,
  Delay,
  DummyScene,
  Engine,
  EulerNodes_exports as EulerNodes,
  EulerValue,
  EventEmitter,
  EventNode,
  ExpectTrue,
  FlipFlop,
  FloatNodes_exports as FloatNodes,
  FloatValue,
  FlowNode,
  ForLoop,
  GetSceneProperty,
  Graph,
  ImmediateNode,
  In0Out1FuncNode,
  In1Out1FuncNode,
  In2Out1FuncNode,
  In3Out1FuncNode,
  In4Out1FuncNode,
  IntegerNodes_exports as IntegerNodes,
  IntegerValue,
  LifecycleOnEnd,
  LifecycleOnStart,
  LifecycleOnTick,
  Link,
  Log,
  Logger,
  ManualLifecycleEventEmitter,
  Node,
  NodeDescription,
  NodeTypeRegistry,
  OnCustomEvent,
  OnSceneNodeClick,
  QuatNodes_exports as QuatNodes,
  QuatValue,
  Registry,
  Sequence,
  SetSceneProperty,
  Socket,
  StringNodes_exports as StringNodes,
  StringValue,
  TriggerCustomEvent,
  ValueType,
  ValueTypeRegistry,
  Variable,
  VariableGet,
  VariableSet,
  Vec2,
  Vec2Nodes_exports as Vec2Nodes,
  Vec2Value,
  Vec3,
  Vec3Nodes_exports as Vec3Nodes,
  Vec3Value,
  Vec4,
  Vec4Nodes_exports as Vec4Nodes,
  Vec4Value,
  VecElements,
  angleAxisToQuat,
  eulerToQuat,
  getNodeDescriptions,
  hexToRGB,
  hslToRGB,
  quatConjugate,
  quatMultiply,
  quatSlerp,
  readGraphFromJSON,
  registerCoreProfile,
  registerSceneProfile,
  rgbToHSL,
  rgbToHex,
  traceToLogger,
  validateGraph,
  validateGraphAcyclic,
  validateGraphLinks,
  validateNodeRegistry,
  validateRegistry,
  validateValueRegistry,
  vec2Add,
  vec2Dot,
  vec2Equals,
  vec2FromArray,
  vec2Length,
  vec2Mix,
  vec2Negate,
  vec2Normalize,
  vec2Parse,
  vec2Scale,
  vec2Subtract,
  vec2ToArray,
  vec2ToString,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Equals,
  vec3FromArray,
  vec3Length,
  vec3Mix,
  vec3Negate,
  vec3Normalize,
  vec3Parse,
  vec3Scale,
  vec3Subtract,
  vec3ToArray,
  vec3ToString,
  vec4Add,
  vec4Dot,
  vec4Equals,
  vec4FromArray,
  vec4Length,
  vec4Mix,
  vec4Negate,
  vec4Normalize,
  vec4Parse,
  vec4Scale,
  vec4Subtract,
  vec4ToArray,
  vec4ToString,
  writeGraphToJSON,
  writeNodeSpecsToJSON
};
//# sourceMappingURL=behave-graph.js.map
