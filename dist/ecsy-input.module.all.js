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
}

// Detector for browser's "window"
const hasWindow = typeof window !== "undefined";

// performance.now() "polyfill"
const now =
  hasWindow && typeof window.performance !== "undefined"
    ? performance.now.bind(performance)
    : Date.now.bind(Date);

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
    return (
      this._listeners[eventName] !== undefined &&
      this._listeners[eventName].indexOf(listener) !== -1
    );
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

    this.eventDispatcher = new EventDispatcher();

    // This query is being used by a reactive system
    this.reactive = false;

    this.key = queryKey(Components);

    // Fill the query with the existing entities
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

      this.eventDispatcher.dispatchEvent(
        Query.prototype.ENTITY_REMOVED,
        entity
      );
    }
  }

  match(entity) {
    return (
      entity.hasAllComponents(this.Components) &&
      !entity.hasAnyComponents(this.NotComponents)
    );
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
    this.enabled = true;

    // @todo Better naming :)
    this._queries = {};
    this.queries = {};

    this.priority = 0;

    // Used for stats
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
        };

        // Reactive configuration added/removed/changed
        var validEvents = ["added", "removed", "changed"];

        const eventMapping = {
          added: Query.prototype.ENTITY_ADDED,
          removed: Query.prototype.ENTITY_REMOVED,
          changed: Query.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED
        };

        if (queryConfig.listen) {
          validEvents.forEach(eventName => {
            if (!this.execute) {
              console.warn(
                `System '${
                  this.constructor.name
                }' has defined listen events (${validEvents.join(
                  ", "
                )}) for query '${queryName}' but it does not implement the 'execute' method.`
              );
            }

            // Is the event enabled on this system's query?
            if (queryConfig.listen[eventName]) {
              let event = queryConfig.listen[eventName];

              if (eventName === "changed") {
                query.reactive = true;
                if (event === true) {
                  // Any change on the entity from the components in the query
                  let eventList = (this.queries[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(
                    Query.prototype.COMPONENT_CHANGED,
                    entity => {
                      // Avoid duplicates
                      if (eventList.indexOf(entity) === -1) {
                        eventList.push(entity);
                      }
                    }
                  );
                } else if (Array.isArray(event)) {
                  let eventList = (this.queries[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(
                    Query.prototype.COMPONENT_CHANGED,
                    (entity, changedComponent) => {
                      // Avoid duplicates
                      if (
                        event.indexOf(changedComponent.constructor) !== -1 &&
                        eventList.indexOf(entity) === -1
                      ) {
                        eventList.push(entity);
                      }
                    }
                  );
                }
              } else {
                let eventList = (this.queries[queryName][eventName] = []);

                query.eventDispatcher.addEventListener(
                  eventMapping[eventName],
                  entity => {
                    // @fixme overhead?
                    if (eventList.indexOf(entity) === -1)
                      eventList.push(entity);
                  }
                );
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
  }

  // @question rename to clear queues?
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
        let jsonQuery = (json.queries[queryName] = {
          key: this._queries[queryName].key
        });

        jsonQuery.mandatory = queryDefinition.mandatory === true;
        jsonQuery.reactive =
          queryDefinition.listen &&
          (queryDefinition.listen.added === true ||
            queryDefinition.listen.removed === true ||
            queryDefinition.listen.changed === true ||
            Array.isArray(queryDefinition.listen.changed));

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

class Component {}

Component.isComponent = true;

class TagComponent {
  reset() {}
}

TagComponent.isTagComponent = true;

function createType(typeDefinition) {
  var mandatoryFunctions = [
    "create",
    "reset",
    "clear"
    /*"copy"*/
  ];

  var undefinedFunctions = mandatoryFunctions.filter(f => {
    return !typeDefinition[f];
  });

  if (undefinedFunctions.length > 0) {
    throw new Error(
      `createType expect type definition to implements the following functions: ${undefinedFunctions.join(
        ", "
      )}`
    );
  }

  typeDefinition.isType = true;
  return typeDefinition;
}

/**
 * Standard types
 */
var Types = {};

Types.Number = createType({
  baseType: Number,
  isSimpleType: true,
  create: defaultValue => {
    return typeof defaultValue !== "undefined" ? defaultValue : 0;
  },
  reset: (src, key, defaultValue) => {
    if (typeof defaultValue !== "undefined") {
      src[key] = defaultValue;
    } else {
      src[key] = 0;
    }
  },
  clear: (src, key) => {
    src[key] = 0;
  }
});

Types.Boolean = createType({
  baseType: Boolean,
  isSimpleType: true,
  create: defaultValue => {
    return typeof defaultValue !== "undefined" ? defaultValue : false;
  },
  reset: (src, key, defaultValue) => {
    if (typeof defaultValue !== "undefined") {
      src[key] = defaultValue;
    } else {
      src[key] = false;
    }
  },
  clear: (src, key) => {
    src[key] = false;
  }
});

Types.String = createType({
  baseType: String,
  isSimpleType: true,
  create: defaultValue => {
    return typeof defaultValue !== "undefined" ? defaultValue : "";
  },
  reset: (src, key, defaultValue) => {
    if (typeof defaultValue !== "undefined") {
      src[key] = defaultValue;
    } else {
      src[key] = "";
    }
  },
  clear: (src, key) => {
    src[key] = "";
  }
});

Types.Array = createType({
  baseType: Array,
  create: defaultValue => {
    if (typeof defaultValue !== "undefined") {
      return defaultValue.slice();
    }

    return [];
  },
  reset: (src, key, defaultValue) => {
    if (typeof defaultValue !== "undefined") {
      src[key] = defaultValue.slice();
    } else {
      src[key].length = 0;
    }
  },
  clear: (src, key) => {
    src[key].length = 0;
  },
  copy: (src, dst, key) => {
    src[key] = dst[key].slice();
  }
});

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
  var script = document.createElement("script");
  // @todo Use link to the ecsy-devtools repo?
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

  let Version = "";

  // This is used to collect the worlds created before the communication is being established
  let worldsBeforeLoading = [];
  let onWorldCreated = e => {
    var world = e.detail.world;
    Version = e.detail.version;
    worldsBeforeLoading.push(world);
  };
  window.addEventListener("ecsy-world-created", onWorldCreated);

  let onLoaded = () => {
    var peer = new Peer(remoteId);
    peer.on("open", (/* id */) => {
      peer.on("connection", connection => {
        window.__ECSY_REMOTE_DEVTOOLS.connection = connection;
        connection.on("open", function() {
          // infoDiv.style.visibility = "hidden";
          infoDiv.innerHTML = "Connected";

          // Receive messages
          connection.on("data", function(data) {
            if (data.type === "init") {
              var script = document.createElement("script");
              script.setAttribute("type", "text/javascript");
              script.onload = () => {
                script.parentNode.removeChild(script);

                // Once the script is injected we don't need to listen
                window.removeEventListener(
                  "ecsy-world-created",
                  onWorldCreated
                );
                worldsBeforeLoading.forEach(world => {
                  var event = new CustomEvent("ecsy-world-created", {
                    detail: { world: world, version: Version }
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
  };

  // Inject PeerJS script
  injectScript(
    "https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js",
    onLoaded
  );
}

if (hasWindow) {
  const urlParams = new URLSearchParams(window.location.search);

  // @todo Provide a way to disable it if needed
  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools();
  }
}

class KeyboardInputState extends Component {
    constructor() {
        super();
        this.states = {};
        this.mapping = {
            " ": "jump",
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowUp: "up",
            ArrowDown: "down"
        };
        this.on_keydown = (e) => {
            this.setKeyState(e.key, "down");
        };
        this.on_keyup = (e) => {
            this.setKeyState(e.key, "up");
        };
    }
    setKeyState(key, value) {
        const state = this.getKeyState(key);
        state.prev = state.current;
        state.current = value;
    }
    getKeyState(key) {
        if (!this.states[key]) {
            this.states[key] = {
                prev: "up",
                current: "up"
            };
        }
        return this.states[key];
    }
    isPressed(name) {
        return this.getKeyState(name).current === "down";
    }
}

const BUTTONS = {
    LEFT: "left-button",
    PRESSED: "down",
    RELEASED: "up"
};
class MouseInputState extends Component {
    constructor() {
        super();
        this.clientX = 0;
        this.clientY = 0;
        this.states = {};
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.downHandler = (e) => {
            this.setKeyState(BUTTONS.LEFT, BUTTONS.PRESSED);
        };
        this.moveHandler = (e) => {
            this.clientX = e.clientX;
            this.lastTimestamp = e.timeStamp;
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.upHandler = (e) => {
            this.setKeyState(BUTTONS.LEFT, BUTTONS.RELEASED);
        };
    }
    setKeyState(key, value) {
        const state = this.getKeyState(key);
        state.prev = state.current;
        state.current = value;
    }
    getKeyState(key) {
        if (!this.states[key]) {
            this.states[key] = {
                prev: BUTTONS.RELEASED,
                current: BUTTONS.RELEASED
            };
        }
        return this.states[key];
    }
}

class GamepadInputState extends Component {
    constructor() {
        super();
        this.axis_threshold = 0.4;
        this.connected = false;
    }
}

class InputState extends Component {
    constructor() {
        super();
        this.states = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.changed = true;
        this.released = false;
    }
    anyChanged() {
        return this.changed;
    }
    anyReleased() {
        return this.released;
    }
}

class ControllerConnected extends TagComponent {
}

class Draggable extends Component {
}

class Dragging extends TagComponent {
}

class KeyboardInputSystem extends System {
    constructor() {
        super(...arguments);
        this.queries = {
            controls: {
                components: [KeyboardInputState, InputState],
                listen: { added: true, removed: true },
                added: [],
                results: []
            }
        };
    }
    set debug(debug) {
        this.debug = debug;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(delta, time) {
        this.queries.controls.added.forEach(ent => {
            const cont = ent.getMutableComponent(KeyboardInputState);
            document.addEventListener("keydown", cont.on_keydown);
            document.addEventListener("keyup", cont.on_keyup);
        });
        this.queries.controls.results.forEach(ent => {
            const kb = ent.getComponent(KeyboardInputState);
            const inp = ent.getMutableComponent(InputState);
            Object.keys(kb.mapping).forEach(key => {
                const name = kb.mapping[key];
                const state = kb.getKeyState(key);
                if (state.current === "down" && state.prev === "up") {
                    inp.states[name] = state.current === "down";
                    inp.changed = true;
                    if (this.debug)
                        console.log(name + " changed to " + state);
                }
                if (state.current === "up" && state.prev === "down") {
                    inp.states[name] = state.current === "down";
                    inp.changed = true;
                    inp.released = true;
                    if (this.debug)
                        console.log(name + " changed to " + state);
                }
                state.prev = state.current;
            });
            // console.log("key mapping", kb.mapping['a'], kb.states['a'], "left state",inp.states['left'])
        });
    }
}

// TODO: Add middle and right mouse button support
class MouseInputSystem extends System {
    constructor() {
        super(...arguments);
        this.queries = {
            mouse: {
                components: [MouseInputState, InputState],
                listen: {
                    added: true,
                    removed: true
                },
                added: [],
                results: [],
                removed: []
            }
        };
    }
    set debug(debug) {
        this.debug = debug;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(delta, time) {
        this.queries.mouse.added.forEach(ent => {
            const mouse = ent.getMutableComponent(MouseInputState);
            document.addEventListener("mousemove", mouse.moveHandler, false);
            document.addEventListener("mousedown", mouse.downHandler, false);
            document.addEventListener("mouseup", mouse.upHandler, false);
        });
        this.queries.mouse.results.forEach(ent => {
            const mouse = ent.getComponent(MouseInputState);
            const inp = ent.getMutableComponent(InputState);
            const name = BUTTONS.LEFT;
            const state = mouse.getKeyState(name);
            // just pressed down
            if (state.current === BUTTONS.PRESSED &&
                state.prev === BUTTONS.RELEASED) {
                inp.states[name] = state.current === BUTTONS.PRESSED;
                inp.changed = true;
            }
            // just released up
            if (state.current === BUTTONS.RELEASED &&
                state.prev === BUTTONS.PRESSED) {
                inp.states[name] = state.current === BUTTONS.PRESSED;
                inp.changed = true;
                inp.released = true;
            }
            if (state.current !== state.prev && this.debug)
                console.log("New state: " + state.current);
            state.prev = state.current;
        });
        this.queries.mouse.removed.forEach(ent => {
            const mouse = ent.getMutableComponent(MouseInputState);
            if (mouse)
                document.removeEventListener("mousemove", mouse.moveHandler);
        });
    }
}

class GamepadInputSystem extends System {
    constructor() {
        super(...arguments);
        this.queries = {
            gamepad: {
                components: [GamepadInputState, InputState],
                listen: {
                    added: true,
                    removed: true
                },
                added: [],
                results: []
            }
        };
    }
    set debug(debug) {
        this.debug = debug;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(delta, time) {
        this.queries.gamepad.added.forEach(ent => {
            const gp = ent.getMutableComponent(GamepadInputState);
            window.addEventListener("gamepadconnected", (event) => {
                console.log("A gamepad connected:", event.gamepad);
                gp.connected = true;
            });
            window.addEventListener("gamepaddisconnected", (event) => {
                console.log("A gamepad disconnected:", event.gamepad);
                gp.connected = false;
            });
        });
        this.queries.gamepad.results.forEach(ent => {
            const gp = ent.getMutableComponent(GamepadInputState);
            if (gp.connected) {
                this._scan_gamepads(gp, ent.getMutableComponent(InputState));
            }
        });
    }
    _scan_gamepads(gp, inp) {
        const gamepads = navigator.getGamepads();
        gamepads.forEach(gamepad => {
            if (gamepad.axes) {
                if (gamepad.axes.length >= 2) {
                    this.scan_x(gp, gamepad.axes[0], inp);
                    this.scan_y(gp, gamepad.axes[1], inp);
                }
            }
        });
    }
    scan_x(gp, x, input) {
        if (x < -gp.axis_threshold) {
            input.states.left = true;
            input.states.right = false;
            return;
        }
        if (x > gp.axis_threshold) {
            input.states.left = false;
            input.states.right = true;
            return;
        }
        input.states.left = false;
        input.states.right = false;
        if (this.debug)
            console.log("left: " + input.states.left);
        if (this.debug)
            console.log("right: " + input.states.right);
    }
    scan_y(gp, y, input) {
        if (y < -gp.axis_threshold) {
            input.states.up = false;
            input.states.down = true;
            return;
        }
        if (y > gp.axis_threshold) {
            input.states.up = true;
            input.states.down = false;
            return;
        }
        input.states.up = false;
        input.states.down = false;
        if (this.debug)
            console.log("up: " + input.states.up);
        if (this.debug)
            console.log("down: " + input.states.down);
    }
}

const DEFAULT_OPTIONS = {
    mouse: true,
    keyboard: true,
    touchscreen: true,
    gamepad: true,
    debug: false
};
function initializeInputSystems(world, options = DEFAULT_OPTIONS) {
    const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    if (!isBrowser)
        return console.error("Couldn't initialize input, are you in a browser?");
    if (options.mouse)
        world.registerSystem(MouseInputSystem, null);
    if (options.keyboard)
        world.registerSystem(KeyboardInputSystem, null);
    if (options.gamepad)
        world.registerSystem(GamepadInputSystem, null);
    // TODO: Add touchscreen
    if (options.debug)
        console.log("INPUT: Registered input systems.");
}

var index = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': initializeInputSystems,
	KeyboardInputState: KeyboardInputState,
	MouseInputState: MouseInputState,
	GamepadInputState: GamepadInputState,
	InputState: InputState,
	ControllerConnected: ControllerConnected,
	Draggable: Draggable,
	Dragging: Dragging,
	KeyboardInputSystem: KeyboardInputSystem,
	MouseInputSystem: MouseInputSystem,
	GamepadInputSystem: GamepadInputSystem
});

export { index as ECSYINPUT };
