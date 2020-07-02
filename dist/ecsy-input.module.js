/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
function getName(Component) {
  return Component.name;
}
/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */

function queryKey(Components) {
  var names = [];

  for (var n = 0; n < Components.length; n++) {
    var T = Components[n];

    if (typeof T === "object") {
      var operator = T.operator === "not" ? "!" : T.operator;
      names.push(operator + getName(T.Component));
    } else {
      names.push(getName(T));
    }
  }

  return names.sort().join("-");
} // Detector for browser's "window"

const hasWindow = typeof window !== "undefined"; // performance.now() "polyfill"

const now = hasWindow && typeof window.performance !== "undefined" ? performance.now.bind(performance) : Date.now.bind(Date);

/**
 * @private
 * @class EventDispatcher
 */
class EventDispatcher {
  constructor() {
    this._listeners = {};
    this.stats = {
      fired: 0,
      handled: 0
    };
  }
  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */


  addEventListener(eventName, listener) {
    let listeners = this._listeners;

    if (listeners[eventName] === undefined) {
      listeners[eventName] = [];
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener);
    }
  }
  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */


  hasEventListener(eventName, listener) {
    return this._listeners[eventName] !== undefined && this._listeners[eventName].indexOf(listener) !== -1;
  }
  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */


  removeEventListener(eventName, listener) {
    var listenerArray = this._listeners[eventName];

    if (listenerArray !== undefined) {
      var index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }
  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Entity} entity (Optional) Entity to emit
   * @param {Component} component
   */


  dispatchEvent(eventName, entity, component) {
    this.stats.fired++;
    var listenerArray = this._listeners[eventName];

    if (listenerArray !== undefined) {
      var array = listenerArray.slice(0);

      for (var i = 0; i < array.length; i++) {
        array[i].call(this, entity, component);
      }
    }
  }
  /**
   * Reset stats counters
   */


  resetCounters() {
    this.stats.fired = this.stats.handled = 0;
  }

}

class Query {
  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components, manager) {
    this.Components = [];
    this.NotComponents = [];
    Components.forEach(component => {
      if (typeof component === "object") {
        this.NotComponents.push(component.Component);
      } else {
        this.Components.push(component);
      }
    });

    if (this.Components.length === 0) {
      throw new Error("Can't create a query without components");
    }

    this.entities = [];
    this.eventDispatcher = new EventDispatcher(); // This query is being used by a reactive system

    this.reactive = false;
    this.key = queryKey(Components); // Fill the query with the existing entities

    for (var i = 0; i < manager._entities.length; i++) {
      var entity = manager._entities[i];

      if (this.match(entity)) {
        // @todo ??? this.addEntity(entity); => preventing the event to be generated
        entity.queries.push(this);
        this.entities.push(entity);
      }
    }
  }
  /**
   * Add entity to this query
   * @param {Entity} entity
   */


  addEntity(entity) {
    entity.queries.push(this);
    this.entities.push(entity);
    this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED, entity);
  }
  /**
   * Remove entity from this query
   * @param {Entity} entity
   */


  removeEntity(entity) {
    let index = this.entities.indexOf(entity);

    if (~index) {
      this.entities.splice(index, 1);
      index = entity.queries.indexOf(this);
      entity.queries.splice(index, 1);
      this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_REMOVED, entity);
    }
  }

  match(entity) {
    return entity.hasAllComponents(this.Components) && !entity.hasAnyComponents(this.NotComponents);
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.Components.map(C => C.name),
        not: this.NotComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    };
  }
  /**
   * Return stats for this query
   */


  stats() {
    return {
      numComponents: this.Components.length,
      numEntities: this.entities.length
    };
  }

}
Query.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";

class Component {
  constructor(props) {
    if (props !== false) {
      const schema = this.constructor.schema;

      for (const key in schema) {
        if (props && props.hasOwnProperty(key)) {
          this[key] = props[key];
        } else {
          const schemaProp = schema[key];

          if (schemaProp.hasOwnProperty("default")) {
            this[key] = schemaProp.type.clone(schemaProp.default);
          } else {
            const type = schemaProp.type;
            this[key] = type.clone(type.default);
          }
        }
      }
    }

    this._pool = null;
  }

  copy(source) {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const prop = schema[key];

      if (source.hasOwnProperty(key)) {
        this[key] = prop.type.copy(source[key], this[key]);
      }
    }

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }

  reset() {
    const schema = this.constructor.schema;

    for (const key in schema) {
      const schemaProp = schema[key];

      if (schemaProp.hasOwnProperty("default")) {
        this[key] = schemaProp.type.copy(schemaProp.default, this[key]);
      } else {
        const type = schemaProp.type;
        this[key] = type.copy(type.default, this[key]);
      }
    }
  }

  dispose() {
    if (this._pool) {
      this._pool.release(this);
    }
  }

}
Component.schema = {};
Component.isComponent = true;

class System {
  canExecute() {
    if (this._mandatoryQueries.length === 0) return true;

    for (let i = 0; i < this._mandatoryQueries.length; i++) {
      var query = this._mandatoryQueries[i];

      if (query.entities.length === 0) {
        return false;
      }
    }

    return true;
  }

  constructor(world, attributes) {
    this.world = world;
    this.enabled = true; // @todo Better naming :)

    this._queries = {};
    this.queries = {};
    this.priority = 0; // Used for stats

    this.executeTime = 0;

    if (attributes && attributes.priority) {
      this.priority = attributes.priority;
    }

    this._mandatoryQueries = [];
    this.initialized = true;

    if (this.constructor.queries) {
      for (var queryName in this.constructor.queries) {
        var queryConfig = this.constructor.queries[queryName];
        var Components = queryConfig.components;

        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query");
        }

        var query = this.world.entityManager.queryComponents(Components);
        this._queries[queryName] = query;

        if (queryConfig.mandatory === true) {
          this._mandatoryQueries.push(query);
        }

        this.queries[queryName] = {
          results: query.entities
        }; // Reactive configuration added/removed/changed

        var validEvents = ["added", "removed", "changed"];
        const eventMapping = {
          added: Query.prototype.ENTITY_ADDED,
          removed: Query.prototype.ENTITY_REMOVED,
          changed: Query.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED

        };

        if (queryConfig.listen) {
          validEvents.forEach(eventName => {
            if (!this.execute) {
              console.warn(`System '${this.constructor.name}' has defined listen events (${validEvents.join(", ")}) for query '${queryName}' but it does not implement the 'execute' method.`);
            } // Is the event enabled on this system's query?


            if (queryConfig.listen[eventName]) {
              let event = queryConfig.listen[eventName];

              if (eventName === "changed") {
                query.reactive = true;

                if (event === true) {
                  // Any change on the entity from the components in the query
                  let eventList = this.queries[queryName][eventName] = [];
                  query.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED, entity => {
                    // Avoid duplicates
                    if (eventList.indexOf(entity) === -1) {
                      eventList.push(entity);
                    }
                  });
                } else if (Array.isArray(event)) {
                  let eventList = this.queries[queryName][eventName] = [];
                  query.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED, (entity, changedComponent) => {
                    // Avoid duplicates
                    if (event.indexOf(changedComponent.constructor) !== -1 && eventList.indexOf(entity) === -1) {
                      eventList.push(entity);
                    }
                  });
                }
              } else {
                let eventList = this.queries[queryName][eventName] = [];
                query.eventDispatcher.addEventListener(eventMapping[eventName], entity => {
                  // @fixme overhead?
                  if (eventList.indexOf(entity) === -1) eventList.push(entity);
                });
              }
            }
          });
        }
      }
    }
  }

  stop() {
    this.executeTime = 0;
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  } // @question rename to clear queues?


  clearEvents() {
    for (let queryName in this.queries) {
      var query = this.queries[queryName];

      if (query.added) {
        query.added.length = 0;
      }

      if (query.removed) {
        query.removed.length = 0;
      }

      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0;
        } else {
          for (let name in query.changed) {
            query.changed[name].length = 0;
          }
        }
      }
    }
  }

  toJSON() {
    var json = {
      name: this.constructor.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      priority: this.priority,
      queries: {}
    };

    if (this.constructor.queries) {
      var queries = this.constructor.queries;

      for (let queryName in queries) {
        let query = this.queries[queryName];
        let queryDefinition = queries[queryName];
        let jsonQuery = json.queries[queryName] = {
          key: this._queries[queryName].key
        };
        jsonQuery.mandatory = queryDefinition.mandatory === true;
        jsonQuery.reactive = queryDefinition.listen && (queryDefinition.listen.added === true || queryDefinition.listen.removed === true || queryDefinition.listen.changed === true || Array.isArray(queryDefinition.listen.changed));

        if (jsonQuery.reactive) {
          jsonQuery.listen = {};
          const methods = ["added", "removed", "changed"];
          methods.forEach(method => {
            if (query[method]) {
              jsonQuery.listen[method] = {
                entities: query[method].length
              };
            }
          });
        }
      }
    }

    return json;
  }

}
System.isSystem = true;

class TagComponent extends Component {
  constructor() {
    super(false);
  }

}
TagComponent.isTagComponent = true;

const copyValue = src => src;
const cloneValue = src => src;
const copyArray = (src, dest) => {
  const srcArray = src;
  const destArray = dest;
  destArray.length = 0;

  for (let i = 0; i < srcArray.length; i++) {
    destArray.push(srcArray[i]);
  }

  return destArray;
};
const cloneArray = src => src.slice();
const copyJSON = src => JSON.parse(JSON.stringify(src));
const cloneJSON = src => JSON.parse(JSON.stringify(src));
const copyCopyable = (src, dest) => dest.copy(src);
const cloneClonable = src => src.clone();
function createType(typeDefinition) {
  var mandatoryProperties = ["name", "default", "copy", "clone"];
  var undefinedProperties = mandatoryProperties.filter(p => {
    return !typeDefinition.hasOwnProperty(p);
  });

  if (undefinedProperties.length > 0) {
    throw new Error(`createType expects a type definition with the following properties: ${undefinedProperties.join(", ")}`);
  }

  typeDefinition.isType = true;
  return typeDefinition;
}
/**
 * Standard types
 */

const Types = {
  Number: createType({
    name: "Number",
    default: 0,
    copy: copyValue,
    clone: cloneValue
  }),
  Boolean: createType({
    name: "Boolean",
    default: false,
    copy: copyValue,
    clone: cloneValue
  }),
  String: createType({
    name: "String",
    default: "",
    copy: copyValue,
    clone: cloneValue
  }),
  Array: createType({
    name: "Array",
    default: [],
    copy: copyArray,
    clone: cloneArray
  }),
  Ref: createType({
    name: "Ref",
    default: undefined,
    copy: copyValue,
    clone: cloneValue
  }),
  JSON: createType({
    name: "JSON",
    default: null,
    copy: copyJSON,
    clone: cloneJSON
  })
};

function generateId(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
function injectScript(src, onLoad) {
  var script = document.createElement("script"); // @todo Use link to the ecsy-devtools repo?

  script.src = src;
  script.onload = onLoad;
  (document.head || document.documentElement).appendChild(script);
}

/* global Peer */

function hookConsoleAndErrors(connection) {
  var wrapFunctions = ["error", "warning", "log"];
  wrapFunctions.forEach(key => {
    if (typeof console[key] === "function") {
      var fn = console[key].bind(console);

      console[key] = (...args) => {
        connection.send({
          method: "console",
          type: key,
          args: JSON.stringify(args)
        });
        return fn.apply(null, args);
      };
    }
  });
  window.addEventListener("error", error => {
    connection.send({
      method: "error",
      error: JSON.stringify({
        message: error.error.message,
        stack: error.error.stack
      })
    });
  });
}

function includeRemoteIdHTML(remoteId) {
  let infoDiv = document.createElement("div");
  infoDiv.style.cssText = `
    align-items: center;
    background-color: #333;
    color: #aaa;
    display:flex;
    font-family: Arial;
    font-size: 1.1em;
    height: 40px;
    justify-content: center;
    left: 0;
    opacity: 0.9;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  `;
  infoDiv.innerHTML = `Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${remoteId}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`;
  document.body.appendChild(infoDiv);
  return infoDiv;
}

function enableRemoteDevtools(remoteId) {
  if (!hasWindow) {
    console.warn("Remote devtools not available outside the browser");
    return;
  }

  window.generateNewCode = () => {
    window.localStorage.clear();
    remoteId = generateId(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
    window.location.reload(false);
  };

  remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId");

  if (!remoteId) {
    remoteId = generateId(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
  }

  let infoDiv = includeRemoteIdHTML(remoteId);
  window.__ECSY_REMOTE_DEVTOOLS_INJECTED = true;
  window.__ECSY_REMOTE_DEVTOOLS = {};
  let Version = ""; // This is used to collect the worlds created before the communication is being established

  let worldsBeforeLoading = [];

  let onWorldCreated = e => {
    var world = e.detail.world;
    Version = e.detail.version;
    worldsBeforeLoading.push(world);
  };

  window.addEventListener("ecsy-world-created", onWorldCreated);

  let onLoaded = () => {
    var peer = new Peer(remoteId);
    peer.on("open", () =>
    /* id */
    {
      peer.on("connection", connection => {
        window.__ECSY_REMOTE_DEVTOOLS.connection = connection;
        connection.on("open", function () {
          // infoDiv.style.visibility = "hidden";
          infoDiv.innerHTML = "Connected"; // Receive messages

          connection.on("data", function (data) {
            if (data.type === "init") {
              var script = document.createElement("script");
              script.setAttribute("type", "text/javascript");

              script.onload = () => {
                script.parentNode.removeChild(script); // Once the script is injected we don't need to listen

                window.removeEventListener("ecsy-world-created", onWorldCreated);
                worldsBeforeLoading.forEach(world => {
                  var event = new CustomEvent("ecsy-world-created", {
                    detail: {
                      world: world,
                      version: Version
                    }
                  });
                  window.dispatchEvent(event);
                });
              };

              script.innerHTML = data.script;
              (document.head || document.documentElement).appendChild(script);
              script.onload();
              hookConsoleAndErrors(connection);
            } else if (data.type === "executeScript") {
              let value = eval(data.script);

              if (data.returnEval) {
                connection.send({
                  method: "evalReturn",
                  value: value
                });
              }
            }
          });
        });
      });
    });
  }; // Inject PeerJS script


  injectScript("https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js", onLoaded);
}

if (hasWindow) {
  const urlParams = new URLSearchParams(window.location.search); // @todo Provide a way to disable it if needed

  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools();
  }
}

const ActionType = {
  DEFAULT: -1,
  PRIMARY: 0,
  SECONDARY: 1,
  FORWARD: 2,
  BACKWARD: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7,
  INTERACT: 8,
  CROUCH: 9,
  JUMP: 10,
  WALK: 11,
  RUN: 12,
  SPRINT: 13
};

var AxisType;

(function (AxisType) {
  AxisType[AxisType["SCREENXY"] = 0] = "SCREENXY";
  AxisType[AxisType["DPADONE"] = 1] = "DPADONE";
  AxisType[AxisType["DPADTWO"] = 2] = "DPADTWO";
  AxisType[AxisType["DPADTHREE"] = 3] = "DPADTHREE";
  AxisType[AxisType["DPADFOUR"] = 4] = "DPADFOUR";
})(AxisType || (AxisType = {}));

var AxisType$1 = AxisType;

const MouseInputActionMap = {
  0: ActionType.PRIMARY,
  2: ActionType.SECONDARY,
  1: ActionType.INTERACT // Middle Mouse button

};
const MouseInputAxisMap = {
  mousePosition: AxisType$1.SCREENXY
};

class MouseInput extends Component {
  constructor() {
    super(...arguments);
    this.actionMap = MouseInputActionMap;
    this.axisMap = MouseInputAxisMap;
  }

}
MouseInput.schema = {
  actionMap: {
    type: Types.Ref,
    default: MouseInputActionMap
  },
  axisMap: {
    type: Types.Ref,
    default: MouseInputAxisMap
  },
  downHandler: {
    type: Types.Ref
  },
  moveHandler: {
    type: Types.Ref
  },
  upHandler: {
    type: Types.Ref
  }
};

var LifecycleValue;

(function (LifecycleValue) {
  LifecycleValue[LifecycleValue["STARTED"] = 0] = "STARTED";
  LifecycleValue[LifecycleValue["ENDED"] = 1] = "ENDED";
  LifecycleValue[LifecycleValue["STARTING"] = 2] = "STARTING";
  LifecycleValue[LifecycleValue["CONTINUED"] = 3] = "CONTINUED";
  LifecycleValue[LifecycleValue["ENDING"] = 4] = "ENDING";
})(LifecycleValue || (LifecycleValue = {}));

var LifecycleValue$1 = LifecycleValue;

class RingBuffer {
  constructor(size) {
    this.buffer = [];
    this.pos = 0;

    if (size < 0) {
      throw new RangeError("The size does not allow negative values.");
    }

    this.size = size;
  }

  static fromArray(data, size = 0) {
    const actionBuffer = new RingBuffer(size);
    actionBuffer.fromArray(data, size === 0);
    return actionBuffer;
  }

  copy() {
    const newAxisBuffer = new RingBuffer(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  clone() {
    const newAxisBuffer = new RingBuffer(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  getSize() {
    return this.size;
  }

  getPos() {
    return this.pos;
  }

  getBufferLength() {
    return this.buffer.length;
  }

  add(...items) {
    items.forEach(item => {
      this.buffer[this.pos] = item;
      this.pos = (this.pos + 1) % this.size;
    });
  }

  get(index) {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return undefined;
    }

    if (this.buffer.length < this.size) {
      return this.buffer[index];
    }

    return this.buffer[(this.pos + index) % this.size];
  }

  getFirst() {
    return this.get(0);
  }

  getLast() {
    return this.get(-1);
  }

  remove(index, count = 1) {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return [];
    }

    const arr = this.toArray();
    const removedItems = arr.splice(index, count);
    this.fromArray(arr);
    return removedItems;
  }

  pop() {
    return this.remove(0)[0];
  }

  popLast() {
    return this.remove(-1)[0];
  }

  toArray() {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos));
  }

  fromArray(data, resize = false) {
    if (!Array.isArray(data)) {
      throw new TypeError("Input value is not an array.");
    }

    if (resize) this.resize(data.length);
    if (this.size === 0) return;
    this.buffer = data.slice(-this.size);
    this.pos = this.buffer.length % this.size;
  }

  clear() {
    this.buffer = [];
    this.pos = 0;
  }

  resize(newSize) {
    if (newSize < 0) {
      throw new RangeError("The size does not allow negative values.");
    }

    if (newSize === 0) {
      this.clear();
    } else if (newSize !== this.size) {
      const currentBuffer = this.toArray();
      this.fromArray(currentBuffer.slice(-newSize));
      this.pos = this.buffer.length % newSize;
    }

    this.size = newSize;
  }

  full() {
    return this.buffer.length === this.size;
  }

  empty() {
    return this.buffer.length === 0;
  }

}

class InputActionHandler extends Component {
  constructor() {
    super(...arguments);
    this.queue = new RingBuffer(10);
    this.schema = {
      queue: {
        type: ActionBufferType
      }
    };
  }

}
const ActionBufferType = createType({
  name: "ActionBuffer",
  default: new RingBuffer(10),
  copy: copyCopyable,
  clone: cloneClonable
});

// Should be a singleton, we only need one in our world
class UserInput extends TagComponent {}

class InputAxisHandler extends Component {
  constructor() {
    super(...arguments);
    this.queue = new RingBuffer(10);
    this.schema = {
      queue: {
        type: AxisBufferType
      }
    };
  }

}
const AxisBufferType = createType({
  name: "ActionBuffer",
  default: new RingBuffer(10),
  copy: copyCopyable,
  clone: cloneClonable
});

const keys = {
  37: 1,
  38: 1,
  39: 1,
  40: 1
};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
} // modern Chrome requires { passive: false } when adding event


let supportsPassive = false;

try {
  window.addEventListener("test", null, Object.defineProperty({}, "passive", {
    get: function () {
      supportsPassive = true;
    }
  })); // eslint-disable-next-line no-empty
} catch (e) {}

const wheelOpt = supportsPassive ? {
  passive: false
} : false;
const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel"; // call this to Disable

function disableScroll() {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF

  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop

  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile

  window.addEventListener("keydown", preventDefaultForScrollKeys, false);
} // call this to Enable

function enableScroll() {
  window.removeEventListener("DOMMouseScroll", preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault);
  window.removeEventListener("touchmove", preventDefault);
  window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

class MouseInputSystem extends System {
  constructor() {
    super(...arguments);

    this.moveHandler = (e, entity) => {
      entity.getComponent(InputAxisHandler).queue.add({
        axis: this._mouse.axisMap.mousePosition,
        value: {
          x: e.clientX,
          y: e.clientY
        }
      });
    };

    this.buttonHandler = (e, entity, value) => {
      this._mouse = entity.getComponent(MouseInput);
      if (!this._mouse || this._mouse.actionMap[e.button] === undefined) return;
      entity.getMutableComponent(InputActionHandler).queue.add({
        action: this._mouse.actionMap[e.button],
        value: value
      });
    };
  }

  execute() {
    this.queries.axis.added.forEach(ent => {
      this._mouse = ent.getMutableComponent(MouseInput);
      document.addEventListener("mousemove", e => this._mouse.moveHandler = this.moveHandler(e, ent), false);
    });
    this.queries.buttons.added.forEach(ent => {
      this._mouse = ent.getMutableComponent(MouseInput);
      document.addEventListener("contextmenu", event => event.preventDefault());
      disableScroll();
      document.addEventListener("mousedown", e => this._mouse.downHandler = this.buttonHandler(e, ent, LifecycleValue$1.STARTED), false);
      document.addEventListener("mouseup", e => this._mouse.upHandler = this.buttonHandler(e, ent, LifecycleValue$1.ENDED), false);
    });
    this.queries.axis.removed.forEach(ent => {
      const mouse = ent.getComponent(MouseInput);
      if (mouse) document.removeEventListener("mousemove", mouse.upHandler);
    });
    this.queries.buttons.removed.forEach(ent => {
      document.removeEventListener("contextmenu", event => event.preventDefault());
      enableScroll();
      const mouse = ent.getComponent(MouseInput);
      if (mouse) document.removeEventListener("mousedown", mouse.downHandler);
      if (mouse) document.removeEventListener("mouseup", mouse.moveHandler);
    });
  }

}
MouseInputSystem.queries = {
  buttons: {
    components: [MouseInput, InputActionHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  },
  axis: {
    components: [MouseInput, InputAxisHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

const KeyboardInputMap = {
  w: ActionType.FORWARD,
  a: ActionType.LEFT,
  s: ActionType.RIGHT,
  d: ActionType.BACKWARD
};

class KeyboardInput extends Component {
  constructor() {
    super(...arguments);
    this.inputMap = KeyboardInputMap;
  }

}
KeyboardInput.schema = {
  inputMap: {
    type: Types.Ref,
    default: KeyboardInputMap
  }
};

class KeyboardInputSystem extends System {
  execute() {
    // Query for user action queue
    this.queries.keyboard.added.forEach(entity => {
      document.addEventListener("keydown", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.STARTED);
      });
      document.addEventListener("keyup", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.ENDED);
      });
    });
    this.queries.keyboard.removed.forEach(entity => {
      document.removeEventListener("keydown", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.STARTED);
      });
      document.removeEventListener("keyup", e => {
        this.mapKeyToAction(entity, e.key, LifecycleValue$1.ENDED);
      });
    });
  }

  mapKeyToAction(entity, key, value) {
    this._kb = entity.getComponent(KeyboardInput);
    if (this._kb.inputMap[key] === undefined) return; // Add to action queue

    entity.getMutableComponent(InputActionHandler).queue.add({
      action: this._kb.inputMap[key],
      value: value
    });
  }

}
KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput, InputActionHandler, UserInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

class GamepadInput extends Component {}
GamepadInput.schema = {
  threshold: {
    type: Types.Number,
    default: 0.1
  },
  connected: {
    type: Types.Boolean,
    default: false
  },
  dpadOne: {
    type: Types.Number
  },
  dpadTwo: {
    type: Types.Number
  },
  buttonA: {
    type: Types.Boolean
  },
  buttonB: {
    type: Types.Boolean
  },
  buttonX: {
    type: Types.Boolean
  },
  buttonY: {
    type: Types.Boolean
  }
};

class GamepadInputSystem extends System {
  execute() {
    this.queries.gamepad.added.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput);
      window.addEventListener("gamepadconnected", event => {
        console.log("A gamepad connected:", event.gamepad);
        gp.connected = true;
      });
      window.addEventListener("gamepaddisconnected", event => {
        console.log("A gamepad disconnected:", event.gamepad);
        gp.connected = false;
      });
    });
    this.queries.gamepad.results.forEach(ent => {
      const gp = ent.getMutableComponent(GamepadInput);

      if (gp.connected) {
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {// if (gamepads[i].axes && gamepads[i].axes.length >= 2) {
          //   // X Axis
          //   if (gamepads[i].axes[0] < -gp.threshold || gamepads[i].axes[0] > gp.threshold) {
          //     if (i == 0) gp.dpadOneAxisX = gamepads[i].axes[0]
          //     else if (i == 1) gp.dpadTwoAxisX = gamepads[i].axes[0]
          //   }
          //   if (gamepads[i].axes[1] < -gp.threshold || gamepads[i].axes[1] > gp.threshold) {
          //     if (i == 0) gp.dpadOneAxisY = gamepads[i].axes[1]
          //     else if (i == 1) gp.dpadTwoAxisY = gamepads[i].axes[1]
          //   }
          // }
        }
      }
    });
  }

}
GamepadInputSystem.queries = {
  gamepad: {
    components: [GamepadInput],
    listen: {
      added: true,
      removed: true
    }
  }
};

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

// Place this component on any entity which you would like to recieve input
class InputReceiver extends TagComponent {}

class InputDebugSystem extends System {
  execute() {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("Action: ");
      console.log(entity.getComponent(InputActionHandler).queue.toArray[0]);
    });
    this.queries.axisReceivers.changed.forEach(entity => {
      console.log("Axis: ");
      console.log(entity.getComponent(InputAxisHandler).queue.toArray[0]);
    });
  }

}
InputDebugSystem.queries = {
  actionReceivers: {
    components: [UserInput, InputActionHandler],
    listen: {
      changed: true
    }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler],
    listen: {
      changed: true
    }
  }
};

const ActionMap = {
  [ActionType.FORWARD]: {
    opposes: [ActionType.BACKWARD]
  },
  [ActionType.BACKWARD]: {
    opposes: [ActionType.FORWARD]
  },
  [ActionType.LEFT]: {
    opposes: [ActionType.RIGHT]
  },
  [ActionType.RIGHT]: {
    opposes: [ActionType.LEFT]
  }
};

class InputActionMapData extends Component {
  constructor() {
    super(...arguments);
    this.actionMap = ActionMap;
  }

}
InputActionMapData.schema = {
  data: {
    type: Types.Ref,
    default: ActionMap
  }
};

class InputActionSystem extends System {
  constructor() {
    super(...arguments);
    this._actionMap = ActionMap;
  }

  execute() {
    this.queries.actionMapData.added.forEach(entity => {
      this._actionMap = entity.getComponent(InputActionMapData).actionMap;
    });
    this.queries.userInputActionQueue.changed.forEach(input => {
      this._userInputActionQueue = input.getMutableComponent(InputActionHandler);
      this.queries.actionReceivers.results.forEach(receiver => {
        receiver.getComponent(InputActionHandler).queue.clear();
        this.applyInputToListener(this._userInputActionQueue, receiver.getMutableComponent(InputActionHandler));
      });
    }); // Clear all actions

    if (this._userInputActionQueue) this._userInputActionQueue.queue.clear();
  }

  validateActions(actionHandler) {
    if (!this._actionMap) return;
    const actionQueueArray = actionHandler.queue.toArray();

    for (let i = 0; i < actionQueueArray.length; i++) {
      for (let k = 0; k < actionQueueArray.length; k++) {
        if (i == k) continue; // don't compare to self
        // Opposing actions cancel out

        if (this.actionsOpposeEachOther(actionQueueArray, i, k)) {
          actionHandler.queue.remove(i);
          actionHandler.queue.remove(k);
        } // If action is blocked by another action that overrides and is active, remove this action
        else if (this.actionIsBlockedByAnother(actionQueueArray, i, k)) {
            actionHandler.queue.remove(i);
          } // Override actions override
          else if (this.actionOverridesAnother(actionQueueArray, i, k)) {
              actionHandler.queue.remove(k);
            }
      }
    }
  } // If they oppose, cancel them


  actionsOpposeEachOther(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];

    this._actionMap[actionToTest.action].opposes.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true;
      }
    });

    return false;
  }

  actionIsBlockedByAnother(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];

    this._actionMap[actionToTest.action].blockedBy.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        // If values are both active, cancel each other out
        return true;
      }
    });

    return false;
  }

  actionOverridesAnother(actionQueueArray, arrayPosOne, arrayPoseTwo) {
    const actionToTest = actionQueueArray[arrayPosOne];
    const actionToTestAgainst = actionQueueArray[arrayPoseTwo];

    this._actionMap[actionToTest.action].overrides.forEach(action => {
      if (action === actionToTestAgainst.action && actionToTest.value === actionToTestAgainst.value) {
        return true;
      }
    });

    return false;
  }

  applyInputToListener(userInputActionQueue, listenerActionQueue) {
    // If action exists, but action state is different, update action InputActionHandler
    userInputActionQueue.queue.toArray().forEach(userInput => {
      this._skip = false;
      listenerActionQueue.queue.toArray().forEach((listenerAction, listenerIndex) => {
        // Skip action since it's already in the listener queue
        if (userInput.action === listenerAction.action && userInput.value === listenerAction.value) {
          this._skip = true;
        } else if (userInput.action === listenerAction.action && userInput.value !== listenerAction.value && userInput.value !== undefined) {
          listenerActionQueue.queue.remove(listenerIndex);
          listenerActionQueue.queue.add(userInput);
          this._skip = true;
        }
      });
      if (!this._skip) listenerActionQueue.queue.add(userInput);
    }); // If action exists, but action state is same, do nothing

    this.validateActions(listenerActionQueue);
  }

}
InputActionSystem.queries = {
  userInputActionQueue: {
    components: [UserInput, InputActionHandler],
    listen: {
      added: true,
      changed: true
    }
  },
  actionReceivers: {
    components: [InputReceiver, InputActionHandler]
  },
  actionMapData: {
    components: [InputActionMapData, UserInput],
    listen: {
      added: true
    }
  }
};

class InputAxisSystem extends System {
  execute() {
    var _a;

    (_a = this.queries.userInputAxisQueue.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
      this._userInputAxisQueue = entity.getMutableComponent(InputAxisHandler);
    }); // If the queue hasn't been set yet, or the queue length is 0

    if (!this._userInputAxisQueue || this._userInputAxisQueue.queue.getSize() < 1) return;
    this.queries.axisReceivers.results.forEach(entity => {
      entity.getComponent(InputAxisHandler).queue.clear();
      this.applyInputToListener(this._userInputAxisQueue, entity.getMutableComponent(InputAxisHandler));
    }); // Clear all axis

    this._userInputAxisQueue.queue.clear();
  }

  applyInputToListener(userInputAxisQueue, listenerAxisQueue) {
    // If axis exists, but axis state is different, update axis state
    userInputAxisQueue.queue.toArray().forEach(userInput => {
      let skip = false;
      listenerAxisQueue.queue.toArray().forEach((listenerAxis, listenerIndex) => {
        // Skip axis since it's already in the listener queue
        if (userInput.axis === listenerAxis.axis && userInput.value === listenerAxis.value) {
          skip = true;
        } else if (userInput.axis === listenerAxis.axis && userInput.value !== listenerAxis.value) {
          // Axis value updated, so skip ading to queue
          listenerAxisQueue.queue.get(listenerIndex).value = userInput.value;
          skip = true;
        }
      });
      if (!skip) listenerAxisQueue.queue.add(userInput);
    });
  }

}
InputAxisSystem.queries = {
  userInputAxisQueue: {
    components: [UserInput, InputAxisHandler]
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler]
  }
};

const DEFAULT_OPTIONS = {
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS, keyboardInputMap, mouseInputMap, // mobileInputMap?,
// VRInputMap?,
actionMap) {
  if (options.debug) console.log("Initializing input systems...");
  if (!isBrowser) return console.error("Couldn't initialize input, are you in a browser?");

  if (options.debug) {
    console.log("Registering input systems with the following options:");
    console.log(options);
  }

  world.registerSystem(InputActionSystem).registerSystem(InputAxisSystem);
  world.registerComponent(UserInput).registerComponent(InputActionHandler).registerComponent(InputAxisHandler).registerComponent(InputReceiver).registerComponent(InputActionMapData).registerComponent(UserInput);
  if (options.keyboard) world.registerSystem(KeyboardInputSystem).registerComponent(KeyboardInput);
  if (options.mouse) world.registerSystem(MouseInputSystem).registerComponent(MouseInput);
  if (options.gamepad) world.registerSystem(GamepadInputSystem).registerComponent(GamepadInput); // TODO: VR, Mobile

  const inputSystemEntity = world.createEntity().addComponent(UserInput).addComponent(InputActionHandler).addComponent(InputAxisHandler).addComponent(InputActionMapData).addComponent(InputReceiver);
  const inputReceiverEntity = world.createEntity().addComponent(InputReceiver).addComponent(InputActionHandler).addComponent(InputActionMapData).addComponent(InputAxisHandler); // Custom Action Map

  if (actionMap) {
    inputReceiverEntity.getMutableComponent(InputActionMapData).actionMap = actionMap;
  }

  if (options.keyboard) {
    inputSystemEntity.addComponent(KeyboardInput);

    if (keyboardInputMap) {
      inputSystemEntity.getMutableComponent(KeyboardInput).inputMap = keyboardInputMap;
    }

    console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity");
  }

  if (options.mouse) {
    inputSystemEntity.addComponent(MouseInput);

    if (mouseInputMap) {
      inputSystemEntity.getMutableComponent(MouseInput).actionMap = mouseInputMap;
    }

    if (options.debug) console.log("Registered MouseInputSystem and added MouseInput component to input entity");
  }

  if (options.gamepad) {
    inputSystemEntity.addComponent(GamepadInput); // TODO: Initialize with user mappings

    if (options.debug) console.log("Registered GamepadInputSystem and added MouseInput component to input entity");
  } // TODO: Add touchscreen


  if (options.touchscreen) {
    // world.registerSystem(TouchscreenInputSystem, null)
    // inputSystemEntity.addComponent(TouchscreenInput)
    if (options.debug) {
      console.log("Touchscreen is not yet implemented");
    }
  }

  if (options.debug) {
    world.registerSystem(InputDebugSystem).registerSystem(InputDebugSystem);
    console.log("INPUT: Registered input systems.");
  }
}

export { initializeInputSystems };
