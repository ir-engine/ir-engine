import 'https://unpkg.com/ecsy@latest/build/ecsy.module.js';
import { Vector3, AmbientLight, Mesh, BoxBufferGeometry, MeshBasicMaterial, TextureLoader } from 'three';

function getName(e){return e.name}function queryKey(e){for(var t=[],n=0;n<e.length;n++){var s=e[n];if("object"==typeof s){var o="not"===s.operator?"!":s.operator;t.push(o+getName(s.Component));}else t.push(getName(s));}return t.sort().join("-")}const hasWindow="undefined"!=typeof window,now=hasWindow&&void 0!==window.performance?performance.now.bind(performance):Date.now.bind(Date);class EventDispatcher{constructor(){this._listeners={},this.stats={fired:0,handled:0};}addEventListener(e,t){let n=this._listeners;void 0===n[e]&&(n[e]=[]),-1===n[e].indexOf(t)&&n[e].push(t);}hasEventListener(e,t){return void 0!==this._listeners[e]&&-1!==this._listeners[e].indexOf(t)}removeEventListener(e,t){var n=this._listeners[e];if(void 0!==n){var s=n.indexOf(t);-1!==s&&n.splice(s,1);}}dispatchEvent(e,t,n){this.stats.fired++;var s=this._listeners[e];if(void 0!==s)for(var o=s.slice(0),r=0;r<o.length;r++)o[r].call(this,t,n);}resetCounters(){this.stats.fired=this.stats.handled=0;}}class Query{constructor(e,t){if(this.Components=[],this.NotComponents=[],e.forEach(e=>{"object"==typeof e?this.NotComponents.push(e.Component):this.Components.push(e);}),0===this.Components.length)throw new Error("Can't create a query without components");this.entities=[],this.eventDispatcher=new EventDispatcher,this.reactive=!1,this.key=queryKey(e);for(var n=0;n<t._entities.length;n++){var s=t._entities[n];this.match(s)&&(s.queries.push(this),this.entities.push(s));}}addEntity(e){e.queries.push(this),this.entities.push(e),this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED,e);}removeEntity(e){let t=this.entities.indexOf(e);~t&&(this.entities.splice(t,1),t=e.queries.indexOf(this),e.queries.splice(t,1),this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_REMOVED,e));}match(e){return e.hasAllComponents(this.Components)&&!e.hasAnyComponents(this.NotComponents)}toJSON(){return {key:this.key,reactive:this.reactive,components:{included:this.Components.map(e=>e.name),not:this.NotComponents.map(e=>e.name)},numEntities:this.entities.length}}stats(){return {numComponents:this.Components.length,numEntities:this.entities.length}}}Query.prototype.ENTITY_ADDED="Query#ENTITY_ADDED",Query.prototype.ENTITY_REMOVED="Query#ENTITY_REMOVED",Query.prototype.COMPONENT_CHANGED="Query#COMPONENT_CHANGED";class Component{constructor(e){if(!1!==e){const t=this.constructor.schema;for(const n in t)if(e&&e.hasOwnProperty(n))this[n]=e[n];else {const e=t[n];if(e.hasOwnProperty("default"))this[n]=e.type.clone(e.default);else {const t=e.type;this[n]=t.clone(t.default);}}}this._pool=null;}copy(e){const t=this.constructor.schema;for(const n in t){const s=t[n];e.hasOwnProperty(n)&&(this[n]=s.type.copy(e[n],this[n]));}return this}clone(){return (new this.constructor).copy(this)}reset(){const e=this.constructor.schema;for(const t in e){const n=e[t];if(n.hasOwnProperty("default"))this[t]=n.type.copy(n.default,this[t]);else {const e=n.type;this[t]=e.copy(e.default,this[t]);}}}dispose(){this._pool&&this._pool.release(this);}}Component.schema={},Component.isComponent=!0;class System{canExecute(){if(0===this._mandatoryQueries.length)return !0;for(let e=0;e<this._mandatoryQueries.length;e++){if(0===this._mandatoryQueries[e].entities.length)return !1}return !0}constructor(e,t){if(this.world=e,this.enabled=!0,this._queries={},this.queries={},this.priority=0,this.executeTime=0,t&&t.priority&&(this.priority=t.priority),this._mandatoryQueries=[],this.initialized=!0,this.constructor.queries)for(var n in this.constructor.queries){var s=this.constructor.queries[n],o=s.components;if(!o||0===o.length)throw new Error("'components' attribute can't be empty in a query");var r=this.world.entityManager.queryComponents(o);this._queries[n]=r,!0===s.mandatory&&this._mandatoryQueries.push(r),this.queries[n]={results:r.entities};var i=["added","removed","changed"];const e={added:Query.prototype.ENTITY_ADDED,removed:Query.prototype.ENTITY_REMOVED,changed:Query.prototype.COMPONENT_CHANGED};s.listen&&i.forEach(t=>{if(this.execute||console.warn(`System '${this.constructor.name}' has defined listen events (${i.join(", ")}) for query '${n}' but it does not implement the 'execute' method.`),s.listen[t]){let o=s.listen[t];if("changed"===t){if(r.reactive=!0,!0===o){let e=this.queries[n][t]=[];r.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED,t=>{-1===e.indexOf(t)&&e.push(t);});}else if(Array.isArray(o)){let e=this.queries[n][t]=[];r.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED,(t,n)=>{-1!==o.indexOf(n.constructor)&&-1===e.indexOf(t)&&e.push(t);});}}else {let s=this.queries[n][t]=[];r.eventDispatcher.addEventListener(e[t],e=>{-1===s.indexOf(e)&&s.push(e);});}}});}}stop(){this.executeTime=0,this.enabled=!1;}play(){this.enabled=!0;}clearEvents(){for(let t in this.queries){var e=this.queries[t];if(e.added&&(e.added.length=0),e.removed&&(e.removed.length=0),e.changed)if(Array.isArray(e.changed))e.changed.length=0;else for(let t in e.changed)e.changed[t].length=0;}}toJSON(){var e={name:this.constructor.name,enabled:this.enabled,executeTime:this.executeTime,priority:this.priority,queries:{}};if(this.constructor.queries){var t=this.constructor.queries;for(let n in t){let s=this.queries[n],o=t[n],r=e.queries[n]={key:this._queries[n].key};if(r.mandatory=!0===o.mandatory,r.reactive=o.listen&&(!0===o.listen.added||!0===o.listen.removed||!0===o.listen.changed||Array.isArray(o.listen.changed)),r.reactive){r.listen={};["added","removed","changed"].forEach(e=>{s[e]&&(r.listen[e]={entities:s[e].length});});}}}return e}}System.isSystem=!0;const copyValue=e=>e,cloneValue=e=>e,copyArray=(e,t)=>{const n=e,s=t;s.length=0;for(let e=0;e<n.length;e++)s.push(n[e]);return s},cloneArray=e=>e.slice(),copyJSON=e=>JSON.parse(JSON.stringify(e)),cloneJSON=e=>JSON.parse(JSON.stringify(e)),copyCopyable=(e,t)=>t.copy(e),cloneClonable=e=>e.clone();function createType(e){var t=["name","default","copy","clone"].filter(t=>!e.hasOwnProperty(t));if(t.length>0)throw new Error("createType expects a type definition with the following properties: "+t.join(", "));return e.isType=!0,e}const Types={Number:createType({name:"Number",default:0,copy:copyValue,clone:cloneValue}),Boolean:createType({name:"Boolean",default:!1,copy:copyValue,clone:cloneValue}),String:createType({name:"String",default:"",copy:copyValue,clone:cloneValue}),Array:createType({name:"Array",default:[],copy:copyArray,clone:cloneArray}),Ref:createType({name:"Ref",default:void 0,copy:copyValue,clone:cloneValue}),JSON:createType({name:"JSON",default:null,copy:copyJSON,clone:cloneJSON})};function generateId(e){for(var t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",s=n.length,o=0;o<e;o++)t+=n.charAt(Math.floor(Math.random()*s));return t}function injectScript(e,t){var n=document.createElement("script");n.src=e,n.onload=t,(document.head||document.documentElement).appendChild(n);}function hookConsoleAndErrors(e){["error","warning","log"].forEach(t=>{if("function"==typeof console[t]){var n=console[t].bind(console);console[t]=(...s)=>(e.send({method:"console",type:t,args:JSON.stringify(s)}),n.apply(null,s));}}),window.addEventListener("error",t=>{e.send({method:"error",error:JSON.stringify({message:t.error.message,stack:t.error.stack})});});}function includeRemoteIdHTML(e){let t=document.createElement("div");return t.style.cssText="\n    align-items: center;\n    background-color: #333;\n    color: #aaa;\n    display:flex;\n    font-family: Arial;\n    font-size: 1.1em;\n    height: 40px;\n    justify-content: center;\n    left: 0;\n    opacity: 0.9;\n    position: absolute;\n    right: 0;\n    text-align: center;\n    top: 0;\n  ",t.innerHTML=`Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${e}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`,document.body.appendChild(t),t}function enableRemoteDevtools(remoteId){if(!hasWindow)return void console.warn("Remote devtools not available outside the browser");window.generateNewCode=()=>{window.localStorage.clear(),remoteId=generateId(6),window.localStorage.setItem("ecsyRemoteId",remoteId),window.location.reload(!1);},remoteId=remoteId||window.localStorage.getItem("ecsyRemoteId"),remoteId||(remoteId=generateId(6),window.localStorage.setItem("ecsyRemoteId",remoteId));let infoDiv=includeRemoteIdHTML(remoteId);window.__ECSY_REMOTE_DEVTOOLS_INJECTED=!0,window.__ECSY_REMOTE_DEVTOOLS={};let Version="",worldsBeforeLoading=[],onWorldCreated=e=>{var t=e.detail.world;Version=e.detail.version,worldsBeforeLoading.push(t);};window.addEventListener("ecsy-world-created",onWorldCreated);let onLoaded=()=>{var peer=new Peer(remoteId);peer.on("open",()=>{peer.on("connection",connection=>{window.__ECSY_REMOTE_DEVTOOLS.connection=connection,connection.on("open",(function(){infoDiv.innerHTML="Connected",connection.on("data",(function(data){if("init"===data.type){var script=document.createElement("script");script.setAttribute("type","text/javascript"),script.onload=()=>{script.parentNode.removeChild(script),window.removeEventListener("ecsy-world-created",onWorldCreated),worldsBeforeLoading.forEach(e=>{var t=new CustomEvent("ecsy-world-created",{detail:{world:e,version:Version}});window.dispatchEvent(t);});},script.innerHTML=data.script,(document.head||document.documentElement).appendChild(script),script.onload(),hookConsoleAndErrors(connection);}else if("executeScript"===data.type){let value=eval(data.script);data.returnEval&&connection.send({method:"evalReturn",value:value});}}));}));});});};injectScript("https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js",onLoaded);}if(hasWindow){const e=new URLSearchParams(window.location.search);e.has("enable-remote-devtools")&&enableRemoteDevtools();}class Input extends Component{constructor(){super(),this.changed=!0,this.released=!1;}anyChanged(){return this.changed}anyReleased(){return this.released}}Input.schema={};class KeyboardInput extends Component{constructor(){super(),this.states={},this.mapping={" ":"jump",ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};}}class MouseInput extends Component{constructor(){super(),this.clientX=0,this.clientY=0,this.states={};}}class GamepadInput extends Component{constructor(){super(),this.axis_threshold=.1,this.connected=!1;}}var Actions;!function(e){e[e.FORWARD=0]="FORWARD",e[e.BACKWARD=1]="BACKWARD",e[e.UP=2]="UP",e[e.DOWN=3]="DOWN",e[e.LEFT=4]="LEFT",e[e.RIGHT=5]="RIGHT",e[e.INTERACT=6]="INTERACT",e[e.CROUCH=7]="CROUCH",e[e.JUMP=8]="JUMP",e[e.WALK=9]="WALK",e[e.RUN=10]="RUN",e[e.SPRINT=11]="SPRINT";}(Actions||(Actions={}));var ButtonState;!function(e){e[e.PRESSED=0]="PRESSED",e[e.RELEASED=1]="RELEASED";}(ButtonState||(ButtonState={}));var ButtonState$1=ButtonState;const MouseButtonMappings={LEFT:{name:"leftMouseButton",value:0},RIGHT:{name:"rightMouseButton",value:2},MIDDLE:{name:"middleMouseButton",value:1}};class ActionBuffer{constructor(e){if(this.buffer=[],this.pos=0,e<0)throw new RangeError("The size does not allow negative values.");this.size=e;}static fromArray(e,t=0){const n=new ActionBuffer(t);return n.fromArray(e,0===t),n}copy(){const e=new ActionBuffer(this.getBufferLength());return e.buffer=this.buffer,e}clone(){const e=new ActionBuffer(this.getBufferLength());return e.buffer=this.buffer,e}getSize(){return this.size}getPos(){return this.pos}getBufferLength(){return this.buffer.length}add(...e){e.forEach(e=>{this.buffer[this.pos]=e,this.pos=(this.pos+1)%this.size;});}get(e){if(e<0&&(e+=this.buffer.length),!(e<0||e>this.buffer.length))return this.buffer.length<this.size?this.buffer[e]:this.buffer[(this.pos+e)%this.size]}getFirst(){return this.get(0)}getLast(){return this.get(-1)}remove(e,t=1){if(e<0&&(e+=this.buffer.length),e<0||e>this.buffer.length)return [];const n=this.toArray(),s=n.splice(e,t);return this.fromArray(n),s}pop(){return this.remove(0)[0]}popLast(){return this.remove(-1)[0]}toArray(){return this.buffer.slice(this.pos).concat(this.buffer.slice(0,this.pos))}fromArray(e,t=!1){if(!Array.isArray(e))throw new TypeError("Input value is not an array.");t&&this.resize(e.length),0!==this.size&&(this.buffer=e.slice(-this.size),this.pos=this.buffer.length%this.size);}clear(){this.buffer=[],this.pos=0;}resize(e){if(e<0)throw new RangeError("The size does not allow negative values.");if(0===e)this.clear();else if(e!==this.size){const t=this.toArray();this.fromArray(t.slice(-e)),this.pos=this.buffer.length%e;}this.size=e;}full(){return this.buffer.length===this.size}empty(){return 0===this.buffer.length}}const ActionBufferType=createType({name:"ActionBuffer",default:new ActionBuffer(5),copy:copyCopyable,clone:cloneClonable});class Action extends Component{}Action.schema={actions:{type:ActionBufferType,default:new ActionBuffer(5)}};class KeyboardInputSystem extends System{execute(){this.queries.keyboard.added.forEach(()=>{document.addEventListener("keydown",e=>{this.setKeyState(this.kb,e.key,"down");}),document.addEventListener("keyup",e=>{this.setKeyState(this.kb,e.key,"up");});}),this.queries.keyboard.results.forEach(e=>{this.kb||(this.kb=e.getComponent(KeyboardInput)),this.inp||(this.inp=e.getMutableComponent(Input)),Object.keys(this.kb.mapping).forEach(e=>{const t=this.kb.mapping[e],n=this.getKeyState(this.kb,e);"down"===n.current&&"up"===n.prev&&(this.inp.states[t]="down"===n.current,this.inp.changed=!0),"up"===n.current&&"down"===n.prev&&(this.inp.states[t]="down"===n.current,this.inp.changed=!0,this.inp.released=!0),n.prev=n.current;});});}setKeyState(e,t,n){const s=this.getKeyState(e,t);s.prev=s.current,s.current=n;}getKeyState(e,t){return e.states[t]||(e.states[t]={prev:"up",current:"up"}),e.states[t]}isPressed(e,t){return "down"===this.getKeyState(e,t).current}}KeyboardInputSystem.queries={keyboard:{components:[KeyboardInput,Input],listen:{added:!0,removed:!0}}};class MouseInputSystem extends System{constructor(){super(...arguments),this.moveHandler=(e,t)=>{t.clientX=e.clientX,t.clientY=e.clientY,t.lastTimestamp=e.timeStamp;},this.buttonHandler=(e,t,n)=>{let s=MouseButtonMappings.LEFT;e.button===MouseButtonMappings.RIGHT.value?s=MouseButtonMappings.RIGHT:e.button!==MouseButtonMappings.LEFT.value&&(s=MouseButtonMappings.MIDDLE);const o=this.getMouseState(s.name,t);o.prev=o.current,o.current=n;};}execute(){this.queries.mouse.added.forEach(e=>{this.mouse=e.getMutableComponent(MouseInput),this.inp=e.getMutableComponent(Input),document.addEventListener("mousemove",e=>this.moveHandler(e,this.mouse),!1),document.addEventListener("mousedown",e=>this.buttonHandler(e,this.mouse,ButtonState$1.PRESSED),!1),document.addEventListener("mouseup",e=>this.buttonHandler(e,this.mouse,ButtonState$1.RELEASED),!1);}),this.queries.mouse.results.forEach(()=>{const e=MouseButtonMappings.LEFT.name,t=this.getMouseState(e,this.mouse);t.current===ButtonState$1.PRESSED&&t.prev===ButtonState$1.RELEASED&&(this.inp.states[e]=t.current===ButtonState$1.PRESSED,this.inp.changed=!0),t.current===ButtonState$1.RELEASED&&t.prev===ButtonState$1.PRESSED&&(this.inp.states[e]=t.current===ButtonState$1.PRESSED,this.inp.changed=!0,this.inp.released=!0),t.current!==t.prev&&(t.prev=t.current);}),this.queries.mouse.removed.forEach(e=>{const t=e.getMutableComponent(MouseInput);t&&document.removeEventListener("mousemove",t.moveHandler);});}getMouseState(e,t){return t.states[e]||(t.states[e]={prev:ButtonState$1.RELEASED,current:ButtonState$1.RELEASED}),t.states[e]}}MouseInputSystem.queries={mouse:{components:[MouseInput,Input],listen:{added:!0,removed:!0}}};class GamepadInputSystem extends System{execute(){this.queries.gamepad.added.forEach(e=>{const t=e.getMutableComponent(GamepadInput);window.addEventListener("gamepadconnected",e=>{console.log("A gamepad connected:",e.gamepad),t.connected=!0;}),window.addEventListener("gamepaddisconnected",e=>{console.log("A gamepad disconnected:",e.gamepad),t.connected=!1;});}),this.queries.gamepad.results.forEach(e=>{const t=e.getMutableComponent(GamepadInput);t.connected&&this.GetGamepadInput(t,e.getMutableComponent(Input));});}GetGamepadInput(e,t){navigator.getGamepads().forEach(n=>{n.axes&&n.axes.length>=2&&(n.axes[0]<-e.axis_threshold?t.states.right=!(t.states.left=!0):n.axes[0]>e.axis_threshold?t.states.right=!(t.states.left=!1):t.states.right=t.states.left=!1,n.axes[1]<-e.axis_threshold?t.states.down=!(t.states.up=!1):n.axes[1]>e.axis_threshold?t.states.down=!(t.states.up=!0):t.states.up=t.states.down=!1);});}}GamepadInputSystem.queries={gamepad:{components:[GamepadInput,Input],listen:{added:!0,removed:!0}}};const isBrowser="undefined"!=typeof window&&void 0!==window.document,DEFAULT_OPTIONS={mouse:!0,keyboard:!0,touchscreen:!0,gamepad:!0,debug:!1};function initializeInputSystems(e,t=DEFAULT_OPTIONS,n){if(t.debug&&console.log("Initializing input systems..."),!isBrowser)return console.error("Couldn't initialize input, are you in a browser?");window&&t.debug&&(window.DEBUG_INPUT=!0),t.debug&&(console.log("Registering input systems with the following options:"),console.log(t));const s=e.createEntity().addComponent(Input);t.keyboard&&(e.registerSystem(KeyboardInputSystem,null),s.addComponent(KeyboardInput),t.debug&&console.log("Registered KeyboardInputSystem and added KeyboardInput component to input entity")),t.mouse&&(e.registerSystem(MouseInputSystem,null),s.addComponent(MouseInput),t.debug&&console.log("Registered MouseInputSystem and added MouseInput component to input entity")),t.gamepad&&(e.registerSystem(GamepadInputSystem,null),s.addComponent(GamepadInput),t.debug&&console.log("Registered MouseInputSystem and added MouseInput component to input entity")),t.touchscreen&&t.debug&&console.log("Touchscreen is not yet implemented"),t.debug&&console.log("INPUT: Registered input systems.");}

/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
function getName$1(Component) {
  return Component.name;
}

/**
 * Return a valid property name for the Component
 * @param {Component} Component
 * @private
 */
function componentPropertyName(Component) {
  return getName$1(Component);
}

/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */
function queryKey$1(Components) {
  var names = [];
  for (var n = 0; n < Components.length; n++) {
    var T = Components[n];
    if (typeof T === "object") {
      var operator = T.operator === "not" ? "!" : T.operator;
      names.push(operator + getName$1(T.Component));
    } else {
      names.push(getName$1(T));
    }
  }

  return names.sort().join("-");
}

// Detector for browser's "window"
const hasWindow$1 = typeof window !== "undefined";

// performance.now() "polyfill"
const now$1 =
  hasWindow$1 && typeof window.performance !== "undefined"
    ? performance.now.bind(performance)
    : Date.now.bind(Date);

class SystemManager {
  constructor(world) {
    this._systems = [];
    this._executeSystems = []; // Systems that have `execute` method
    this.world = world;
    this.lastExecutedSystem = null;
  }

  registerSystem(SystemClass, attributes) {
    if (!SystemClass.isSystem) {
      throw new Error(
        `System '${SystemClass.name}' does not extend 'System' class`
      );
    }

    if (this.getSystem(SystemClass) !== undefined) {
      console.warn(`System '${SystemClass.name}' already registered.`);
      return this;
    }

    var system = new SystemClass(this.world, attributes);
    if (system.init) system.init(attributes);
    system.order = this._systems.length;
    this._systems.push(system);
    if (system.execute) {
      this._executeSystems.push(system);
      this.sortSystems();
    }
    return this;
  }

  unregisterSystem(SystemClass) {
    let system = this.getSystem(SystemClass);
    if (system === undefined) {
      console.warn(
        `Can unregister system '${SystemClass.name}'. It doesn't exist.`
      );
      return this;
    }

    this._systems.splice(this._systems.indexOf(system), 1);

    if (system.execute) {
      this._executeSystems.splice(this._executeSystems.indexOf(system), 1);
    }

    // @todo Add system.unregister() call to free resources
    return this;
  }

  sortSystems() {
    this._executeSystems.sort((a, b) => {
      return a.priority - b.priority || a.order - b.order;
    });
  }

  getSystem(SystemClass) {
    return this._systems.find(s => s instanceof SystemClass);
  }

  getSystems() {
    return this._systems;
  }

  removeSystem(SystemClass) {
    var index = this._systems.indexOf(SystemClass);
    if (!~index) return;

    this._systems.splice(index, 1);
  }

  executeSystem(system, delta, time) {
    if (system.initialized) {
      if (system.canExecute()) {
        let startTime = now$1();
        system.execute(delta, time);
        system.executeTime = now$1() - startTime;
        this.lastExecutedSystem = system;
        system.clearEvents();
      }
    }
  }

  stop() {
    this._executeSystems.forEach(system => system.stop());
  }

  execute(delta, time, forcePlay) {
    this._executeSystems.forEach(
      system =>
        (forcePlay || system.enabled) && this.executeSystem(system, delta, time)
    );
  }

  stats() {
    var stats = {
      numSystems: this._systems.length,
      systems: {}
    };

    for (var i = 0; i < this._systems.length; i++) {
      var system = this._systems[i];
      var systemStats = (stats.systems[system.constructor.name] = {
        queries: {},
        executeTime: system.executeTime
      });
      for (var name in system.ctx) {
        systemStats.queries[name] = system.ctx[name].stats();
      }
    }

    return stats;
  }
}

class ObjectPool {
  // @todo Add initial size
  constructor(T, initialSize) {
    this.freeList = [];
    this.count = 0;
    this.T = T;
    this.isObjectPool = true;

    if (typeof initialSize !== "undefined") {
      this.expand(initialSize);
    }
  }

  acquire() {
    // Grow the list by 20%ish if we're out
    if (this.freeList.length <= 0) {
      this.expand(Math.round(this.count * 0.2) + 1);
    }

    var item = this.freeList.pop();

    return item;
  }

  release(item) {
    item.reset();
    this.freeList.push(item);
  }

  expand(count) {
    for (var n = 0; n < count; n++) {
      var clone = new this.T();
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.count += count;
  }

  totalSize() {
    return this.count;
  }

  totalFree() {
    return this.freeList.length;
  }

  totalUsed() {
    return this.count - this.freeList.length;
  }
}

/**
 * @private
 * @class EventDispatcher
 */
class EventDispatcher$1 {
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

class Query$1 {
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

    this.eventDispatcher = new EventDispatcher$1();

    // This query is being used by a reactive system
    this.reactive = false;

    this.key = queryKey$1(Components);

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

    this.eventDispatcher.dispatchEvent(Query$1.prototype.ENTITY_ADDED, entity);
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
        Query$1.prototype.ENTITY_REMOVED,
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

Query$1.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query$1.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query$1.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";

/**
 * @private
 * @class QueryManager
 */
class QueryManager {
  constructor(world) {
    this._world = world;

    // Queries indexed by a unique identifier for the components it has
    this._queries = {};
  }

  onEntityRemoved(entity) {
    for (var queryName in this._queries) {
      var query = this._queries[queryName];
      if (entity.queries.indexOf(query) !== -1) {
        query.removeEntity(entity);
      }
    }
  }

  /**
   * Callback when a component is added to an entity
   * @param {Entity} entity Entity that just got the new component
   * @param {Component} Component Component added to the entity
   */
  onEntityComponentAdded(entity, Component) {
    // @todo Use bitmask for checking components?

    // Check each indexed query to see if we need to add this entity to the list
    for (var queryName in this._queries) {
      var query = this._queries[queryName];

      if (
        !!~query.NotComponents.indexOf(Component) &&
        ~query.entities.indexOf(entity)
      ) {
        query.removeEntity(entity);
        continue;
      }

      // Add the entity only if:
      // Component is in the query
      // and Entity has ALL the components of the query
      // and Entity is not already in the query
      if (
        !~query.Components.indexOf(Component) ||
        !query.match(entity) ||
        ~query.entities.indexOf(entity)
      )
        continue;

      query.addEntity(entity);
    }
  }

  /**
   * Callback when a component is removed from an entity
   * @param {Entity} entity Entity to remove the component from
   * @param {Component} Component Component to remove from the entity
   */
  onEntityComponentRemoved(entity, Component) {
    for (var queryName in this._queries) {
      var query = this._queries[queryName];

      if (
        !!~query.NotComponents.indexOf(Component) &&
        !~query.entities.indexOf(entity) &&
        query.match(entity)
      ) {
        query.addEntity(entity);
        continue;
      }

      if (
        !!~query.Components.indexOf(Component) &&
        !!~query.entities.indexOf(entity) &&
        !query.match(entity)
      ) {
        query.removeEntity(entity);
        continue;
      }
    }
  }

  /**
   * Get a query for the specified components
   * @param {Component} Components Components that the query should have
   */
  getQuery(Components) {
    var key = queryKey$1(Components);
    var query = this._queries[key];
    if (!query) {
      this._queries[key] = query = new Query$1(Components, this._world);
    }
    return query;
  }

  /**
   * Return some stats from this class
   */
  stats() {
    var stats = {};
    for (var queryName in this._queries) {
      stats[queryName] = this._queries[queryName].stats();
    }
    return stats;
  }
}

class Component$1 {
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

Component$1.schema = {};
Component$1.isComponent = true;

class SystemStateComponent extends Component$1 {}

SystemStateComponent.isSystemStateComponent = true;

class EntityPool extends ObjectPool {
  constructor(entityManager, entityClass, initialSize) {
    super(entityClass, undefined);
    this.entityManager = entityManager;

    if (typeof initialSize !== "undefined") {
      this.expand(initialSize);
    }
  }

  expand(count) {
    for (var n = 0; n < count; n++) {
      var clone = new this.T(this.entityManager);
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.count += count;
  }
}

/**
 * @private
 * @class EntityManager
 */
class EntityManager {
  constructor(world) {
    this.world = world;
    this.componentsManager = world.componentsManager;

    // All the entities in this instance
    this._entities = [];
    this._nextEntityId = 0;

    this._entitiesByNames = {};

    this._queryManager = new QueryManager(this);
    this.eventDispatcher = new EventDispatcher$1();
    this._entityPool = new EntityPool(
      this,
      this.world.options.entityClass,
      this.world.options.entityPoolSize
    );

    // Deferred deletion
    this.entitiesWithComponentsToRemove = [];
    this.entitiesToRemove = [];
    this.deferredRemovalEnabled = true;
  }

  getEntityByName(name) {
    return this._entitiesByNames[name];
  }

  /**
   * Create a new entity
   */
  createEntity(name) {
    var entity = this._entityPool.acquire();
    entity.alive = true;
    entity.name = name || "";
    if (name) {
      if (this._entitiesByNames[name]) {
        console.warn(`Entity name '${name}' already exist`);
      } else {
        this._entitiesByNames[name] = entity;
      }
    }

    this._entities.push(entity);
    this.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity);
    return entity;
  }

  // COMPONENTS

  /**
   * Add a component to an entity
   * @param {Entity} entity Entity where the component will be added
   * @param {Component} Component Component to be added to the entity
   * @param {Object} values Optional values to replace the default attributes
   */
  entityAddComponent(entity, Component, values) {
    if (!this.world.componentsManager.Components[Component.name]) {
      throw new Error(
        `Attempted to add unregistered component "${Component.name}"`
      );
    }

    if (~entity._ComponentTypes.indexOf(Component)) {
      // @todo Just on debug mode
      console.warn(
        "Component type already exists on entity.",
        entity,
        Component.name
      );
      return;
    }

    entity._ComponentTypes.push(Component);

    if (Component.__proto__ === SystemStateComponent) {
      entity.numStateComponents++;
    }

    var componentPool = this.world.componentsManager.getComponentsPool(
      Component
    );

    var component = componentPool
      ? componentPool.acquire()
      : new Component(values);

    if (componentPool && values) {
      component.copy(values);
    }

    entity._components[Component.name] = component;

    this._queryManager.onEntityComponentAdded(entity, Component);
    this.world.componentsManager.componentAddedToEntity(Component);

    this.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component);
  }

  /**
   * Remove a component from an entity
   * @param {Entity} entity Entity which will get removed the component
   * @param {*} Component Component to remove from the entity
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  entityRemoveComponent(entity, Component, immediately) {
    var index = entity._ComponentTypes.indexOf(Component);
    if (!~index) return;

    this.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, Component);

    if (immediately) {
      this._entityRemoveComponentSync(entity, Component, index);
    } else {
      if (entity._ComponentTypesToRemove.length === 0)
        this.entitiesWithComponentsToRemove.push(entity);

      entity._ComponentTypes.splice(index, 1);
      entity._ComponentTypesToRemove.push(Component);

      var componentName = getName$1(Component);
      entity._componentsToRemove[componentName] =
        entity._components[componentName];
      delete entity._components[componentName];
    }

    // Check each indexed query to see if we need to remove it
    this._queryManager.onEntityComponentRemoved(entity, Component);

    if (Component.__proto__ === SystemStateComponent) {
      entity.numStateComponents--;

      // Check if the entity was a ghost waiting for the last system state component to be removed
      if (entity.numStateComponents === 0 && !entity.alive) {
        entity.remove();
      }
    }
  }

  _entityRemoveComponentSync(entity, Component, index) {
    // Remove T listing on entity and property ref, then free the component.
    entity._ComponentTypes.splice(index, 1);
    var componentName = getName$1(Component);
    var component = entity._components[componentName];
    delete entity._components[componentName];
    component.dispose();
    this.world.componentsManager.componentRemovedFromEntity(Component);
  }

  /**
   * Remove all the components from an entity
   * @param {Entity} entity Entity from which the components will be removed
   */
  entityRemoveAllComponents(entity, immediately) {
    let Components = entity._ComponentTypes;

    for (let j = Components.length - 1; j >= 0; j--) {
      if (Components[j].__proto__ !== SystemStateComponent)
        this.entityRemoveComponent(entity, Components[j], immediately);
    }
  }

  /**
   * Remove the entity from this manager. It will clear also its components
   * @param {Entity} entity Entity to remove from the manager
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  removeEntity(entity, immediately) {
    var index = this._entities.indexOf(entity);

    if (!~index) throw new Error("Tried to remove entity not in list");

    entity.alive = false;

    if (entity.numStateComponents === 0) {
      // Remove from entity list
      this.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity);
      this._queryManager.onEntityRemoved(entity);
      if (immediately === true) {
        this._releaseEntity(entity, index);
      } else {
        this.entitiesToRemove.push(entity);
      }
    }

    this.entityRemoveAllComponents(entity, immediately);
  }

  _releaseEntity(entity, index) {
    this._entities.splice(index, 1);

    if (this._entitiesByNames[entity.name]) {
      delete this._entitiesByNames[entity.name];
    }
    entity._pool.release(entity);
  }

  /**
   * Remove all entities from this manager
   */
  removeAllEntities() {
    for (var i = this._entities.length - 1; i >= 0; i--) {
      this.removeEntity(this._entities[i]);
    }
  }

  processDeferredRemoval() {
    if (!this.deferredRemovalEnabled) {
      return;
    }

    for (let i = 0; i < this.entitiesToRemove.length; i++) {
      let entity = this.entitiesToRemove[i];
      let index = this._entities.indexOf(entity);
      this._releaseEntity(entity, index);
    }
    this.entitiesToRemove.length = 0;

    for (let i = 0; i < this.entitiesWithComponentsToRemove.length; i++) {
      let entity = this.entitiesWithComponentsToRemove[i];
      while (entity._ComponentTypesToRemove.length > 0) {
        let Component = entity._ComponentTypesToRemove.pop();

        var componentName = getName$1(Component);
        var component = entity._componentsToRemove[componentName];
        delete entity._componentsToRemove[componentName];
        component.dispose();
        this.world.componentsManager.componentRemovedFromEntity(Component);

        //this._entityRemoveComponentSync(entity, Component, index);
      }
    }

    this.entitiesWithComponentsToRemove.length = 0;
  }

  /**
   * Get a query based on a list of components
   * @param {Array(Component)} Components List of components that will form the query
   */
  queryComponents(Components) {
    return this._queryManager.getQuery(Components);
  }

  // EXTRAS

  /**
   * Return number of entities
   */
  count() {
    return this._entities.length;
  }

  /**
   * Return some stats
   */
  stats() {
    var stats = {
      numEntities: this._entities.length,
      numQueries: Object.keys(this._queryManager._queries).length,
      queries: this._queryManager.stats(),
      numComponentPool: Object.keys(this.componentsManager._componentPool)
        .length,
      componentPool: {},
      eventDispatcher: this.eventDispatcher.stats
    };

    for (var cname in this.componentsManager._componentPool) {
      var pool = this.componentsManager._componentPool[cname];
      stats.componentPool[cname] = {
        used: pool.totalUsed(),
        size: pool.count
      };
    }

    return stats;
  }
}

const ENTITY_CREATED = "EntityManager#ENTITY_CREATE";
const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED";
const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED";
const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE";

class ComponentManager {
  constructor() {
    this.Components = {};
    this._componentPool = {};
    this.numComponents = {};
  }

  registerComponent(Component, objectPool) {
    if (this.Components[Component.name]) {
      console.warn(`Component type: '${Component.name}' already registered.`);
      return;
    }

    const schema = Component.schema;

    if (!schema) {
      throw new Error(`Component "${Component.name}" has no schema property.`);
    }

    for (const propName in schema) {
      const prop = schema[propName];

      if (!prop.type) {
        throw new Error(
          `Invalid schema for component "${Component.name}". Missing type for "${propName}" property.`
        );
      }
    }

    this.Components[Component.name] = Component;
    this.numComponents[Component.name] = 0;

    if (objectPool === undefined) {
      objectPool = new ObjectPool(Component);
    } else if (objectPool === false) {
      objectPool = undefined;
    }

    this._componentPool[Component.name] = objectPool;
  }

  componentAddedToEntity(Component) {
    if (!this.Components[Component.name]) {
      this.registerComponent(Component);
    }

    this.numComponents[Component.name]++;
  }

  componentRemovedFromEntity(Component) {
    this.numComponents[Component.name]--;
  }

  getComponentsPool(Component) {
    var componentName = componentPropertyName(Component);
    return this._componentPool[componentName];
  }
}

const Version = "0.3.1";

class Entity {
  constructor(entityManager) {
    this._entityManager = entityManager || null;

    // Unique ID for this entity
    this.id = entityManager._nextEntityId++;

    // List of components types the entity has
    this._ComponentTypes = [];

    // Instance of the components
    this._components = {};

    this._componentsToRemove = {};

    // Queries where the entity is added
    this.queries = [];

    // Used for deferred removal
    this._ComponentTypesToRemove = [];

    this.alive = false;

    //if there are state components on a entity, it can't be removed completely
    this.numStateComponents = 0;
  }

  // COMPONENTS

  getComponent(Component, includeRemoved) {
    var component = this._components[Component.name];

    if (!component && includeRemoved === true) {
      component = this._componentsToRemove[Component.name];
    }

    return  component;
  }

  getRemovedComponent(Component) {
    return this._componentsToRemove[Component.name];
  }

  getComponents() {
    return this._components;
  }

  getComponentsToRemove() {
    return this._componentsToRemove;
  }

  getComponentTypes() {
    return this._ComponentTypes;
  }

  getMutableComponent(Component) {
    var component = this._components[Component.name];
    for (var i = 0; i < this.queries.length; i++) {
      var query = this.queries[i];
      // @todo accelerate this check. Maybe having query._Components as an object
      // @todo add Not components
      if (query.reactive && query.Components.indexOf(Component) !== -1) {
        query.eventDispatcher.dispatchEvent(
          Query$1.prototype.COMPONENT_CHANGED,
          this,
          component
        );
      }
    }
    return component;
  }

  addComponent(Component, values) {
    this._entityManager.entityAddComponent(this, Component, values);
    return this;
  }

  removeComponent(Component, forceImmediate) {
    this._entityManager.entityRemoveComponent(this, Component, forceImmediate);
    return this;
  }

  hasComponent(Component, includeRemoved) {
    return (
      !!~this._ComponentTypes.indexOf(Component) ||
      (includeRemoved === true && this.hasRemovedComponent(Component))
    );
  }

  hasRemovedComponent(Component) {
    return !!~this._ComponentTypesToRemove.indexOf(Component);
  }

  hasAllComponents(Components) {
    for (var i = 0; i < Components.length; i++) {
      if (!this.hasComponent(Components[i])) return false;
    }
    return true;
  }

  hasAnyComponents(Components) {
    for (var i = 0; i < Components.length; i++) {
      if (this.hasComponent(Components[i])) return true;
    }
    return false;
  }

  removeAllComponents(forceImmediate) {
    return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
  }

  copy(src) {
    // TODO: This can definitely be optimized
    for (var componentName in src._components) {
      var srcComponent = src._components[componentName];
      this.addComponent(srcComponent.constructor);
      var component = this.getComponent(srcComponent.constructor);
      component.copy(srcComponent);
    }

    return this;
  }

  clone() {
    return new Entity(this._entityManager).copy(this);
  }

  reset() {
    this.id = this._entityManager._nextEntityId++;
    this._ComponentTypes.length = 0;
    this.queries.length = 0;

    for (var componentName in this._components) {
      delete this._components[componentName];
    }
  }

  remove(forceImmediate) {
    return this._entityManager.removeEntity(this, forceImmediate);
  }
}

const DEFAULT_OPTIONS$1 = {
  entityPoolSize: 0,
  entityClass: Entity
};

class World {
  constructor(options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS$1, options);

    this.componentsManager = new ComponentManager(this);
    this.entityManager = new EntityManager(this);
    this.systemManager = new SystemManager(this);

    this.enabled = true;

    this.eventQueues = {};

    if (hasWindow$1 && typeof CustomEvent !== "undefined") {
      var event = new CustomEvent("ecsy-world-created", {
        detail: { world: this, version: Version }
      });
      window.dispatchEvent(event);
    }

    this.lastTime = now$1();
  }

  registerComponent(Component, objectPool) {
    this.componentsManager.registerComponent(Component, objectPool);
    return this;
  }

  registerSystem(System, attributes) {
    this.systemManager.registerSystem(System, attributes);
    return this;
  }

  unregisterSystem(System) {
    this.systemManager.unregisterSystem(System);
    return this;
  }

  getSystem(SystemClass) {
    return this.systemManager.getSystem(SystemClass);
  }

  getSystems() {
    return this.systemManager.getSystems();
  }

  execute(delta, time) {
    if (!delta) {
      time = now$1();
      delta = time - this.lastTime;
      this.lastTime = time;
    }

    if (this.enabled) {
      this.systemManager.execute(delta, time);
      this.entityManager.processDeferredRemoval();
    }
  }

  stop() {
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  }

  createEntity(name) {
    return this.entityManager.createEntity(name);
  }

  stats() {
    var stats = {
      entities: this.entityManager.stats(),
      system: this.systemManager.stats()
    };

    console.log(JSON.stringify(stats, null, 2));
  }
}

class System$1 {
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
          added: Query$1.prototype.ENTITY_ADDED,
          removed: Query$1.prototype.ENTITY_REMOVED,
          changed: Query$1.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED
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
                    Query$1.prototype.COMPONENT_CHANGED,
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
                    Query$1.prototype.COMPONENT_CHANGED,
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

System$1.isSystem = true;

class TagComponent extends Component$1 {
  constructor() {
    super(false);
  }
}

TagComponent.isTagComponent = true;

const copyValue$1 = src => src;

const cloneValue$1 = src => src;

const copyArray$1 = (src, dest) => {
  const srcArray = src;
  const destArray = dest;

  destArray.length = 0;

  for (let i = 0; i < srcArray.length; i++) {
    destArray.push(srcArray[i]);
  }

  return destArray;
};

const cloneArray$1 = src => src.slice();

const copyJSON$1 = src => JSON.parse(JSON.stringify(src));

const cloneJSON$1 = src => JSON.parse(JSON.stringify(src));

const copyCopyable$1 = (src, dest) => dest.copy(src);

const cloneClonable$1 = src => src.clone();

function createType$1(typeDefinition) {
  var mandatoryProperties = ["name", "default", "copy", "clone"];

  var undefinedProperties = mandatoryProperties.filter(p => {
    return !typeDefinition.hasOwnProperty(p);
  });

  if (undefinedProperties.length > 0) {
    throw new Error(
      `createType expects a type definition with the following properties: ${undefinedProperties.join(
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
const Types$1 = {
  Number: createType$1({
    name: "Number",
    default: 0,
    copy: copyValue$1,
    clone: cloneValue$1
  }),

  Boolean: createType$1({
    name: "Boolean",
    default: false,
    copy: copyValue$1,
    clone: cloneValue$1
  }),

  String: createType$1({
    name: "String",
    default: "",
    copy: copyValue$1,
    clone: cloneValue$1
  }),

  Array: createType$1({
    name: "Array",
    default: [],
    copy: copyArray$1,
    clone: cloneArray$1
  }),

  Ref: createType$1({
    name: "Ref",
    default: undefined,
    copy: copyValue$1,
    clone: cloneValue$1
  }),

  JSON: createType$1({
    name: "JSON",
    default: null,
    copy: copyJSON$1,
    clone: cloneJSON$1
  })
};

function generateId$1(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function injectScript$1(src, onLoad) {
  var script = document.createElement("script");
  // @todo Use link to the ecsy-devtools repo?
  script.src = src;
  script.onload = onLoad;
  (document.head || document.documentElement).appendChild(script);
}

/* global Peer */

function hookConsoleAndErrors$1(connection) {
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

function includeRemoteIdHTML$1(remoteId) {
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

function enableRemoteDevtools$1(remoteId) {
  if (!hasWindow$1) {
    console.warn("Remote devtools not available outside the browser");
    return;
  }

  window.generateNewCode = () => {
    window.localStorage.clear();
    remoteId = generateId$1(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
    window.location.reload(false);
  };

  remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId");
  if (!remoteId) {
    remoteId = generateId$1(6);
    window.localStorage.setItem("ecsyRemoteId", remoteId);
  }

  let infoDiv = includeRemoteIdHTML$1(remoteId);

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

              hookConsoleAndErrors$1(connection);
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
  injectScript$1(
    "https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js",
    onLoaded
  );
}

if (hasWindow$1) {
  const urlParams = new URLSearchParams(window.location.search);

  // @todo Provide a way to disable it if needed
  if (urlParams.has("enable-remote-devtools")) {
    enableRemoteDevtools$1();
  }
}

class Object3DComponent extends Component$1 {}

Object3DComponent.schema = {
  value: { default: null, type: Types$1.Ref }
};

class ECSYThreeEntity extends Entity {
  addObject3DComponent(obj, parentEntity) {
    obj.entity = this;
    this.addComponent(Object3DComponent, { value: obj });
    this._entityManager.world.object3DInflator.inflate(this, obj);
    if (parentEntity && parentEntity.hasComponent(Object3DComponent)) {
      parentEntity.getObject3D().add(obj);
    }
    return this;
  }

  removeObject3DComponent(unparent = true) {
    const obj = this.getComponent(Object3DComponent, true).value;
    if (unparent) {
      // Using "true" as the entity could be removed somewhere else
      obj.parent && obj.parent.remove(obj);
    }
    this.removeComponent(Object3DComponent);
    this._entityManager.world.object3DInflator.deflate(this, obj);
    obj.entity = null;
  }

  remove(forceImmediate) {
    if (this.hasComponent(Object3DComponent)) {
      const obj = this.getObject3D();
      obj.traverse(o => {
        if (o.entity) {
          this._entityManager.removeEntity(o.entity, forceImmediate);
        }
        o.entity = null;
      });
      obj.parent && obj.parent.remove(obj);
    }
    this._entityManager.removeEntity(this, forceImmediate);
  }

  getObject3D() {
    return this.getComponent(Object3DComponent).value;
  }
}

class SceneTagComponent extends TagComponent {}
class CameraTagComponent extends TagComponent {}
class MeshTagComponent extends TagComponent {}

const defaultObject3DInflator = {
  inflate: (entity, obj) => {
    // TODO support more tags and probably a way to add user defined ones
    if (obj.isMesh) {
      entity.addComponent(MeshTagComponent);
    } else if (obj.isScene) {
      entity.addComponent(SceneTagComponent);
    } else if (obj.isCamera) {
      entity.addComponent(CameraTagComponent);
    }
  },
  deflate: (entity, obj) => {
    // TODO support more tags and probably a way to add user defined ones
    if (obj.isMesh) {
      entity.removeComponent(MeshTagComponent);
    } else if (obj.isScene) {
      entity.removeComponent(SceneTagComponent);
    } else if (obj.isCamera) {
      entity.removeComponent(CameraTagComponent);
    }
  }
};

class ECSYThreeWorld extends World {
  constructor(options) {
    super(Object.assign({}, { entityClass: ECSYThreeEntity }, options));
    this.object3DInflator = defaultObject3DInflator;
  }
}

const Vector3Type = createType$1({
  name: "Vector3",
  default: new Vector3(),
  copy: copyCopyable$1,
  clone: cloneClonable$1
});

const ThreeTypes = {
  Vector3Type
};

// CORE

var ECSYTHREE = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ECSYThreeWorld: ECSYThreeWorld,
  defaultObject3DInflator: defaultObject3DInflator,
  ECSYThreeSystem: System$1,
  Vector3Type: Vector3Type,
  ThreeTypes: ThreeTypes,
  Types: Types$1,
  Object3DComponent: Object3DComponent,
  SceneTagComponent: SceneTagComponent,
  CameraTagComponent: CameraTagComponent,
  MeshTagComponent: MeshTagComponent
});

const {
        initialize,
        Types: Types$2,
        // Components
        Parent,
        Camera,
        Transform,
        GLTFLoader,
        Object3DComponent: Object3DComponent$1,
        ECSYThreeWorld: ECSYThreeWorld$1,
        // Systems
        WebGLRendererSystem,
        GLTFLoaderSystem
      } = ECSYTHREE;

      var world;

      init();

      function init() {
        // Create a new world to hold all our entities and systems
        world = new ECSYThreeWorld$1();

        // Initialize the default sets of entities and systems
        let data = initialize(world);
        console.log(data);

        world.registerComponent(GLTFLoader);
        world.registerSystem(GLTFLoaderSystem);

        // Grab the initialized entities
        let { scene, renderer, camera } = data.entities;
        let scene3d = scene.getObject3D();

        // Modify the position for the default camera
        let camera3d = camera.getObject3D();
        camera3d.position.z = 5;

        world
          .createEntity()
          .addObject3DComponent(new AmbientLight(), scene);

        // Create an entity to handle our rotating box
        var box = world.createEntity().addObject3DComponent(
          new Mesh(
            new BoxBufferGeometry(1, 1, 1),
            new MeshBasicMaterial({
              map: new TextureLoader().load("textures/crate.gif")
            })
          ),
          scene
        );

        const inputOptions = {
          mouse: true,
          keyboard: true,
          touchscreen: true,
          gamepad: true,
          debug: true
        };

      // TODO: Import input mapping
      // TODO: Modify some values
      // TODO: Pass to world

        initializeInputSystems(world, inputOptions);

        // Start world systems
        world.execute();
      }
