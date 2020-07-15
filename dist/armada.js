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

class BehaviorComponent extends Component {
    constructor() {
        super(false);
        this.data = new Map();
        this.data = new Map();
    }
    copy(src) {
        this.map = src.map;
        this.data = new Map(src.data);
        return this;
    }
    reset() {
        this.data.clear();
    }
}

// Input inherits from BehaviorComponent, which adds .map and .data
class Input extends BehaviorComponent {
}
// Set schema to itself plus gamepad data
Input.schema = Object.assign(Object.assign({}, Input.schema), { gamepadConnected: { type: Types.Boolean, default: false }, gamepadThreshold: { type: Types.Number, default: 0.1 }, gamepadButtons: { type: Types.Array, default: [] }, gamepadInput: { type: Types.Array, default: [] } });

// Button -- discrete states of ON and OFF, like a button
// OneD -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TwoD -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// ThreeD -- Three dimensional value, just in case
// 6DOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
var InputType;
(function (InputType) {
    InputType[InputType["BUTTON"] = 0] = "BUTTON";
    InputType[InputType["ONED"] = 1] = "ONED";
    InputType[InputType["TWOD"] = 2] = "TWOD";
    InputType[InputType["THREED"] = 3] = "THREED";
    InputType[InputType["SIXDOF"] = 4] = "SIXDOF";
})(InputType || (InputType = {}));

// Local reference to input component
let input;
// System behavior called whenever the mouse pressed
const handleMouseMovement = (entity, args) => {
    // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
    entity.getMutableComponent(Input).data.set(input.map.mouseInputMap["mousePosition"], {
        type: InputType.TWOD,
        value: [(args.event.clientX / window.innerWidth) * 2 - 1, (args.event.clientY / window.innerHeight) * -2 + 1]
    });
};
// System behavior called when a mouse button is fired
const handleMouseButton = (entity, args, delta) => {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
    input = entity.getComponent(Input);
    if (input.map.mouseInputMap.buttons[args.event.button] === undefined)
        return;
    // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
    entity.getMutableComponent(Input).data.set(input.map.mouseInputMap.buttons[args.event.button], {
        type: InputType.BUTTON,
        value: args.value
    });
};
// System behavior called when a keyboard key is pressed
function handleKey(entity, args) {
    // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
    input = entity.getComponent(Input);
    if (input.map.keyboardInputMap[args.event.key] === undefined)
        return;
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input.data.has(input.map.keyboardInputMap[args.event.key]) && input.data.get(input.map.keyboardInputMap[args.event.key]).value === args.value)
        return;
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    input.data.set(input.map.keyboardInputMap[args.event.key], {
        type: InputType.BUTTON,
        value: args.value
    });
}

var BinaryValue;
(function (BinaryValue) {
    BinaryValue[BinaryValue["ON"] = 1] = "ON";
    BinaryValue[BinaryValue["OFF"] = 0] = "OFF";
})(BinaryValue || (BinaryValue = {}));
var BinaryValue$1 = BinaryValue;

var GamepadButtons;
(function (GamepadButtons) {
    GamepadButtons[GamepadButtons["A"] = 0] = "A";
    GamepadButtons[GamepadButtons["B"] = 1] = "B";
    GamepadButtons[GamepadButtons["X"] = 2] = "X";
    GamepadButtons[GamepadButtons["Y"] = 3] = "Y";
    GamepadButtons[GamepadButtons["LBumper"] = 4] = "LBumper";
    GamepadButtons[GamepadButtons["RBumper"] = 5] = "RBumper";
    GamepadButtons[GamepadButtons["LTrigger"] = 6] = "LTrigger";
    GamepadButtons[GamepadButtons["RTrigger"] = 7] = "RTrigger";
    GamepadButtons[GamepadButtons["Back"] = 8] = "Back";
    GamepadButtons[GamepadButtons["Start"] = 9] = "Start";
    GamepadButtons[GamepadButtons["LStick"] = 10] = "LStick";
    GamepadButtons[GamepadButtons["RString"] = 11] = "RString";
    GamepadButtons[GamepadButtons["DPad1"] = 12] = "DPad1";
    GamepadButtons[GamepadButtons["DPad2"] = 13] = "DPad2";
    GamepadButtons[GamepadButtons["DPad3"] = 14] = "DPad3";
    GamepadButtons[GamepadButtons["DPad4"] = 15] = "DPad4";
})(GamepadButtons || (GamepadButtons = {}));

var Thumbsticks;
(function (Thumbsticks) {
    Thumbsticks[Thumbsticks["Left"] = 0] = "Left";
    Thumbsticks[Thumbsticks["Right"] = 1] = "Right";
})(Thumbsticks || (Thumbsticks = {}));

function preventDefault(e) {
    event.preventDefault();
}

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
function preventDefault$1(e) {
    e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault$1(e);
        return false;
    }
}
// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", {
        get: function () {
            supportsPassive = true;
        }
    }));
    // eslint-disable-next-line no-empty
}
catch (e) { }
const wheelOpt = supportsPassive ? { passive: false } : false;
const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";
// call this to Disable
function disableScroll() {
    window.addEventListener("DOMMouseScroll", preventDefault$1, false); // older FF
    window.addEventListener(wheelEvent, preventDefault$1, wheelOpt); // modern desktop
    window.addEventListener("touchmove", preventDefault$1, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false);
}
// call this to Enable
function enableScroll() {
    window.removeEventListener("DOMMouseScroll", preventDefault$1, false);
    window.removeEventListener(wheelEvent, preventDefault$1);
    window.removeEventListener("touchmove", preventDefault$1);
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}

let input$1;
let gamepad;
// When a gamepad connects
const handleGamepadConnected = (entity, args) => {
    input$1 = entity.getMutableComponent(Input);
    console.log("A gamepad connected:", args.event.gamepad, args.event.gamepad.mapping);
    if (args.event.gamepad.mapping !== "standard")
        return console.error("Non-standard gamepad mapping detected, not properly handled");
    input$1.gamepadConnected = true;
    gamepad = args.event.gamepad;
    for (let index = 0; index < gamepad.buttons.length; index++) {
        if (typeof input$1.gamepadButtons[index] === "undefined")
            input$1.gamepadButtons[index] = BinaryValue$1.OFF;
    }
};
// When a gamepad disconnects
const handleGamepadDisconnected = (entity, args) => {
    input$1 = entity.getMutableComponent(Input);
    console.log("A gamepad disconnected:", args.event.gamepad);
    input$1.gamepadConnected = false;
    if (!input$1.map)
        return; // Already disconnected?
    for (let index = 0; index < input$1.gamepadButtons.length; index++) {
        if (input$1.gamepadButtons[index] === BinaryValue$1.ON && typeof input$1.map.gamepadInputMap.axes[index] !== "undefined") {
            input$1.data.set(input$1.map.gamepadInputMap.axes[index], {
                type: InputType.BUTTON,
                value: BinaryValue$1.OFF
            });
        }
        input$1.gamepadButtons[index] = BinaryValue$1.OFF;
    }
};

class Idle extends TagComponent {
}

class Moving extends TagComponent {
}

class Jumping extends Component {
}
Jumping.schema = {
    t: { type: Types.Number, default: 0 },
    height: { type: Types.Number, default: 0.5 },
    duration: { type: Types.Number, default: 0.5 }
};

class Crouching extends TagComponent {
}

class Sprinting extends TagComponent {
}

const vector3Identity = [0, 0, 0];
const vector3ScaleIdentity = [1, 1, 1];
const quaternionIdentity = [0, 0, 0, 1];
class TransformComponent extends Component {
    constructor() {
        super();
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
    copy(src) {
        this.position = src.position;
        this.rotation = src.rotation;
        this.scale = src.scale;
        this.velocity = src.velocity;
        return this;
    }
    reset() {
        this.position = vector3Identity;
        this.rotation = quaternionIdentity;
        this.scale = vector3ScaleIdentity;
        this.velocity = vector3Identity;
    }
}

let jumping;
let transform;
const jump = (entity, args, delta) => {
    console.log("Jump!");
    jumping = entity.getComponent(Jumping);
    jumping.duration = 1.0;
    transform = entity.getComponent(TransformComponent);
    jumping.t += delta;
    if (jumping.t < jumping.duration) {
        transform.velocity[1] = transform.velocity[1] + Math.cos((jumping.t / jumping.duration) * Math.PI);
        console.log(jumping.t);
        return;
    }
    // needs to remove self from stack!
    //  removeComponentsFromStateGroup(entity, args.stateGroup, Jumping as any)
    // if t < duration, remove this component
    console.log("Jumped");
};

class Actor extends Component {
    constructor() {
        super();
        this.reset();
    }
    copy(src) {
        this.rotationSpeedX = src.rotationSpeedX;
        this.rotationSpeedY = src.rotationSpeedY;
        this.maxSpeed = src.maxSpeed;
        this.accelerationSpeed = src.accelerationSpeed;
        return this;
    }
    reset() {
        this.rotationSpeedX = 1;
        this.rotationSpeedY = 1;
        this.maxSpeed = 10;
        this.accelerationSpeed = 1;
    }
}

/**
 * Common utilities
 * @module glMatrix
 */
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

let actor;
let transform$1;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const decelerate = (entity, delta) => {
    // get actor comonent
    actor = entity.getComponent(Actor);
    // get the transform
    transform$1 = entity.getComponent(TransformComponent);
    // if magnitude of velocity is more than .001
    if (length(transform$1.velocity) > 0.001) {
        // add to velocity by adding state value * acceleration * delta
        transform$1.velocity[0] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0);
        // transform.velocity[1] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0)
        transform$1.velocity[2] *= Math.max(1.0 - actor.accelerationSpeed * delta, 0);
        console.log(transform$1.velocity[0] + " | " + transform$1.velocity[1] + " | " + transform$1.velocity[2]);
    }
    // clamp velocity to max value
};

const DefaultStateTypes = {
    // Main States
    IDLE: 0,
    MOVING: 1,
    JUMPING: 2,
    FALLING: 3,
    // Modifier States
    CROUCHING: 4,
    WALKING: 5,
    SPRINTING: 6,
    INTERACTING: 7,
    // Moving substates
    MOVING_FORWARD: 8,
    MOVING_BACKWARD: 9,
    MOVING_LEFT: 10,
    MOVING_RIGHT: 11
};
const DefaultStateGroups = {
    MOVEMENT: 0,
    MOVEMENT_MODIFIERS: 1
};
const DefaultStateMap = {
    groups: {
        [DefaultStateGroups.MOVEMENT]: {
            exclusive: true,
            default: DefaultStateTypes.IDLE,
            states: [DefaultStateTypes.IDLE, DefaultStateTypes.MOVING]
        },
        [DefaultStateGroups.MOVEMENT_MODIFIERS]: {
            exclusive: true,
            states: [DefaultStateTypes.CROUCHING, DefaultStateTypes.SPRINTING, DefaultStateTypes.JUMPING]
        }
    },
    states: {
        [DefaultStateTypes.IDLE]: { group: DefaultStateGroups.MOVEMENT, component: Idle, onUpdate: { behavior: decelerate } },
        [DefaultStateTypes.MOVING]: {
            group: DefaultStateGroups.MOVEMENT,
            component: Moving
        },
        [DefaultStateTypes.JUMPING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Jumping, onUpdate: { behavior: jump } },
        [DefaultStateTypes.CROUCHING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Crouching, blockedBy: DefaultStateTypes.JUMPING },
        [DefaultStateTypes.SPRINTING]: { group: DefaultStateGroups.MOVEMENT_MODIFIERS, component: Sprinting }
    }
};

class State extends BehaviorComponent {
    constructor() {
        super(...arguments);
        this.map = DefaultStateMap;
    }
}

var StateType;
(function (StateType) {
    StateType[StateType["DISCRETE"] = 0] = "DISCRETE";
    StateType[StateType["ONED"] = 1] = "ONED";
    StateType[StateType["TWOD"] = 2] = "TWOD";
    StateType[StateType["THREED"] = 3] = "THREED";
})(StateType || (StateType = {}));

let stateComponent;
const addState = (entity, args) => {
    stateComponent = entity.getComponent(State);
    if (stateComponent.data.has(args.state) && stateComponent.data.get(args.state).value === BinaryValue$1.ON) {
        return;
    }
    console.log("Adding state: " + args.state);
    stateComponent.data.set(args.state, {
        state: args.state,
        type: StateType.DISCRETE,
        value: BinaryValue$1.ON,
        group: stateComponent.map.states[args.state].group
    });
    // stateGroup = stateComponent.map.states[args.state].group
    // // If state group is set to exclusive (XOR) then check if other states from state group are on
    // if (stateComponent.map.groups[stateGroup].exclusive) {
    //   stateComponent.data.set(args.state, { ...stateComponent.data.get(args.state), value: BinaryValue.OFF })
    // }
};
const removeState = (entity, args) => {
    // check state group
    stateComponent = entity.getComponent(State);
    stateComponent.data.set(args.state, Object.assign({}, (stateComponent.data.has(args.state)
        ? stateComponent.data.get(args.state)
        : {
            state: args.state,
            type: StateType.DISCRETE,
            value: BinaryValue$1.OFF,
            group: stateComponent.map.states[args.state].group
        })));
    console.log("Removed component from " + entity.id);
};

let input$2;
let actor$1;
let transform$2;
let inputValue; // Could be a (small) source of garbage
let inputType;
let movementModifer;
let outputSpeed;
const move = (entity, args, delta) => {
    input$2 = entity.getComponent(Input);
    actor$1 = entity.getComponent(Actor);
    transform$2 = entity.getComponent(TransformComponent);
    movementModifer = entity.hasComponent(Crouching) ? 0.5 : entity.hasComponent(Sprinting) ? 1.5 : 1.0;
    outputSpeed = actor$1.accelerationSpeed * delta * movementModifer;
    if (inputType === InputType.TWOD) {
        inputValue = input$2.data.get(args.input).value;
        transform$2.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor$1.maxSpeed);
        transform$2.velocity[2] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor$1.maxSpeed);
    }
    if (inputType === InputType.THREED) {
        inputValue = input$2.data.get(args.input).value;
        transform$2.velocity[0] += Math.min(inputValue[0] + inputValue[0] * outputSpeed, actor$1.maxSpeed);
        transform$2.velocity[1] += Math.min(inputValue[1] + inputValue[1] * outputSpeed, actor$1.maxSpeed);
        transform$2.velocity[2] += Math.min(inputValue[2] + inputValue[2] * outputSpeed, actor$1.maxSpeed);
    }
    else {
        console.error("Movement is only available for 2D and 3D inputs");
    }
    console.log("Moved");
};

const MouseButtons = {
    LeftButton: 0,
    MiddleButton: 1,
    RightButton: 2
};

// Abstract inputs that all input devices get mapped to
const DefaultInput = {
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
    SPRINT: 13,
    SNEAK: 14,
    SCREENXY: 15,
    MOVEMENT_PLAYERONE: 16,
    LOOKTURN_PLAYERONE: 17,
    MOVEMENT_PLAYERTWO: 18,
    LOOKTURN_PLAYERTWO: 19,
    ALTERNATE: 20
};
const DefaultInputMap = {
    // When an Input component is added, the system will call this array of behaviors
    onAdded: [
        {
            behavior: disableScroll
            // args: { }
        }
    ],
    // When an Input component is removed, the system will call this array of behaviors
    onRemoved: [
        {
            behavior: enableScroll
            // args: { }
        }
    ],
    // When the input component is added or removed, the system will bind/unbind these events to the DOM
    eventBindings: {
        // Mouse
        ["contextmenu"]: {
            behavior: preventDefault
        },
        ["mousemove"]: {
            behavior: handleMouseMovement,
            args: {
                value: DefaultInput.SCREENXY
            }
        },
        ["mouseup"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue$1.OFF
            }
        },
        ["mousedown"]: {
            behavior: handleMouseButton,
            args: {
                value: BinaryValue$1.ON
            }
        },
        // Keys
        ["keyup"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue$1.OFF
            }
        },
        ["keydown"]: {
            behavior: handleKey,
            args: {
                value: BinaryValue$1.ON
            }
        },
        // Gamepad
        ["gamepadconnected"]: {
            behavior: handleGamepadConnected
        },
        ["gamepaddisconnected"]: {
            behavior: handleGamepadDisconnected
        }
    },
    // Map mouse buttons to abstract input
    mouseInputMap: {
        buttons: {
            [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
            [MouseButtons.RightButton]: DefaultInput.SECONDARY,
            [MouseButtons.MiddleButton]: DefaultInput.INTERACT
        },
        axes: {
            mousePosition: DefaultInput.SCREENXY
        }
    },
    // Map gamepad buttons to abstract input
    gamepadInputMap: {
        buttons: {
            [GamepadButtons.A]: DefaultInput.JUMP,
            [GamepadButtons.B]: DefaultInput.CROUCH,
            [GamepadButtons.X]: DefaultInput.SPRINT,
            [GamepadButtons.Y]: DefaultInput.INTERACT,
            // 4: DefaultInput.DEFAULT, // LB
            // 5: DefaultInput.DEFAULT, // RB
            // 6: DefaultInput.DEFAULT, // LT
            // 7: DefaultInput.DEFAULT, // RT
            // 8: DefaultInput.DEFAULT, // Back
            // 9: DefaultInput.DEFAULT, // Start
            // 10: DefaultInput.DEFAULT, // LStick
            // 11: DefaultInput.DEFAULT, // RStick
            [GamepadButtons.DPad1]: DefaultInput.FORWARD,
            [GamepadButtons.DPad2]: DefaultInput.BACKWARD,
            [GamepadButtons.DPad3]: DefaultInput.LEFT,
            [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
        },
        axes: {
            [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
            [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
        }
    },
    // Map keyboard buttons to abstract input
    keyboardInputMap: {
        w: DefaultInput.FORWARD,
        a: DefaultInput.LEFT,
        s: DefaultInput.RIGHT,
        d: DefaultInput.BACKWARD,
        [" "]: DefaultInput.JUMP,
        shift: DefaultInput.CROUCH
    },
    // Map how inputs relate to each other
    inputRelationships: {
        [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] },
        [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] },
        [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] },
        [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] },
        [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] },
        [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] },
        [DefaultInput.SPRINT]: { blockedBy: [DefaultInput.JUMP], overrides: [DefaultInput.CROUCH] },
        [DefaultInput.WALK]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT], overrides: [DefaultInput.CROUCH] },
        [DefaultInput.INTERACT]: { blockedBy: [DefaultInput.JUMP] }
    },
    // "Button behaviors" are called when button input is called (i.e. not axis input)
    inputButtonBehaviors: {
        [DefaultInput.JUMP]: {
            [BinaryValue$1.ON]: {
                behavior: addState,
                args: { state: DefaultStateTypes.JUMPING }
            }
        },
        [DefaultInput.CROUCH]: {
            [BinaryValue$1.ON]: {
                behavior: addState,
                args: { state: DefaultStateTypes.CROUCHING }
            },
            [BinaryValue$1.OFF]: {
                behavior: removeState,
                args: { state: DefaultStateTypes.CROUCHING }
            }
        },
        [DefaultInput.SPRINT]: {
            [BinaryValue$1.ON]: {
                behavior: addState,
                args: { state: DefaultStateTypes.SPRINTING }
            },
            [BinaryValue$1.OFF]: {
                behavior: removeState,
                args: { state: DefaultStateTypes.SPRINTING }
            }
        }
    },
    // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
    inputAxisBehaviors: {
        [DefaultInput.MOVEMENT_PLAYERONE]: {
            behavior: move,
            args: {
                input: DefaultInput.MOVEMENT_PLAYERONE,
                inputType: InputType.TWOD
            }
        }
        // },
        // [DefaultInput.SCREENXY]: {
        //   behavior: console.log,
        //   args: {
        //     input: DefaultInput.LOOKTURN_PLAYERONE,
        //     inputType: InputType.TWOD
        //   }
    }
};

class InputSystem extends System {
    execute(delta) {
        // Called when input component is added to entity
        this.queries.inputs.added.forEach(entity => {
            var _a;
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // If input doesn't have a map, set the default
            if (this._inputComponent.map === undefined)
                this._inputComponent.map = DefaultInputMap;
            // Call all behaviors in "onAdded" of input map
            this._inputComponent.map.onAdded.forEach(behavior => {
                behavior.behavior(entity, Object.assign({}, behavior.args));
            });
            // Bind DOM events to event behavior
            (_a = Object.keys(this._inputComponent.map.eventBindings)) === null || _a === void 0 ? void 0 : _a.forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called when input component is removed from entity
        this.queries.inputs.removed.forEach(entity => {
            // Get component reference
            this._inputComponent = entity.getComponent(Input);
            // Call all behaviors in "onRemoved" of input map
            this._inputComponent.map.onRemoved.forEach(behavior => {
                behavior.behavior(entity, behavior.args);
            });
            // Unbind events from DOM
            Object.keys(this._inputComponent.map.eventBindings).forEach((key) => {
                document.addEventListener(key, e => {
                    this._inputComponent.map.eventBindings[key].behavior(entity, Object.assign({ event: e }, this._inputComponent.map.eventBindings[key].args));
                });
            });
        });
        // Called every frame on all input components
        this.queries.inputs.results.forEach(entity => handleInput(entity, delta));
    }
}
let input$3;
const handleInput = (entity, delta) => {
    input$3 = entity.getComponent(Input);
    input$3.data.forEach((value, key) => {
        if (value.type === InputType.BUTTON) {
            if (input$3.map.inputButtonBehaviors[key] && input$3.map.inputButtonBehaviors[key][value.value]) {
                input$3.map.inputButtonBehaviors[key][value.value].behavior(entity, input$3.map.inputButtonBehaviors[key][value.value].args, delta);
            }
        }
        else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
            if (input$3.map.inputAxisBehaviors[key]) {
                input$3.map.inputButtonBehaviors[key][value.value].behavior(entity, input$3.map.inputAxisBehaviors[key].args, delta);
            }
        }
        else {
            console.error("handleInput called with an invalid input type");
        }
    });
};
InputSystem.queries = {
    inputs: {
        components: [Input],
        listen: {
            added: true,
            removed: true
        }
    }
};

const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

class Subscription extends BehaviorComponent {
}

class StateSystem extends System {
    constructor() {
        super(...arguments);
        this.callBehaviorsForPhase = (entity, args, delta) => {
            this._state = entity.getComponent(State);
            this._state.data.forEach((stateValue) => {
                if (stateValue.type == StateType.DISCRETE && stateValue.value == BinaryValue$1.OFF)
                    return;
                if (this._state.map.states[stateValue.type] !== undefined && this._state.map.states[stateValue.type][args.phase] !== undefined) {
                    this._state.map.states[stateValue.type][args.phase].behavior(entity, this._state.map.states[stateValue.type][args.phase].args, delta);
                }
            });
        };
    }
    execute(delta, time) {
        var _a, _b, _c, _d;
        (_a = this.queries.state.added) === null || _a === void 0 ? void 0 : _a.forEach(entity => {
            // Set default states is there is one
            this.callBehaviorsForPhase(entity, { phase: "onAdded" }, delta);
        });
        (_b = this.queries.state.changed) === null || _b === void 0 ? void 0 : _b.forEach(entity => {
            this.callBehaviorsForPhase(entity, { phase: "onChanged" }, delta);
        });
        (_c = this.queries.state.results) === null || _c === void 0 ? void 0 : _c.forEach(entity => {
            this.callBehaviorsForPhase(entity, { phase: "onUpdate" }, delta);
            this.callBehaviorsForPhase(entity, { phase: "onLateUpdate" }, delta);
        });
        (_d = this.queries.state.removed) === null || _d === void 0 ? void 0 : _d.forEach(entity => {
            this.callBehaviorsForPhase(entity, { phase: "onRemoved" }, delta);
        });
    }
}
StateSystem.queries = {
    state: {
        components: [State],
        listen: {
            added: true,
            changed: true,
            removed: true
        }
    }
};

const DEFAULT_OPTIONS = {
    debug: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS, inputMap) {
    if (options.debug)
        console.log("Initializing input systems...");
    if (!isBrowser) {
        console.error("Couldn't initialize input, are you in a browser?");
        return null;
    }
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    world.registerSystem(InputSystem).registerSystem(StateSystem);
    world
        .registerComponent(Input)
        .registerComponent(State)
        .registerComponent(Subscription)
        .registerComponent(Actor)
        .registerComponent(Jumping)
        .registerComponent(TransformComponent);
    const inputSystemEntity = world
        .createEntity()
        .addComponent(Input)
        .addComponent(State)
        .addComponent(Actor)
        .addComponent(Subscription)
        .addComponent(Jumping)
        .addComponent(TransformComponent);
    // Custom Action Map
    if (inputMap) {
        console.log("Using input map:");
        console.log(inputMap);
        inputSystemEntity.getMutableComponent(Input).map = inputMap;
    }
    else {
        console.log("No input map provided, defaulting to default input");
        inputSystemEntity.getMutableComponent(Input).map = DefaultInputMap;
    }
    // if (options.debug) {
    //   world.registerSystem(InputDebugSystem)
    //   console.log("INPUT: Registered input systems.")
    // }
    return world;
}
function addInputHandlingToEntity(entity, inputFilter) {
    // Try get component on inputhandler, inputreceiver
    if (entity.getComponent(Input) !== undefined)
        console.warn("Warning: Entity already has input component");
    else {
        entity
            .addComponent(Input)
            .addComponent(State)
            .addComponent(Subscription);
    }
    return entity;
}

export { addInputHandlingToEntity, initializeInputSystems };
//# sourceMappingURL=armada.js.map
