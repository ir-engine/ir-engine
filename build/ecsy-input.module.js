import { Component as Component$1, Types, TagComponent, System as System$1 } from 'ecsy';

class VRInputState extends Component$1 {}
VRInputState.schema = {
  id: { default: 0, type: Types.Number },
  controller: { default: null, type: Types.Object }
};

class VRInputBehaviour extends Component$1 {}
VRInputBehaviour.schema = {
  select: { default: null, type: Types.Object },
  selectstart: { default: null, type: Types.Object },
  selectend: { default: null, type: Types.Object },

  connected: { default: null, type: Types.Object },
  disconnected: { default: null, type: Types.Object },

  squeeze: { default: null, type: Types.Object },
  squeezestart: { default: null, type: Types.Object },
  squeezeend: { default: null, type: Types.Object }
};

class KeyboardInputState extends Component {
  constructor() {
      super();
      this.states = {};
      this.mapping = {
          ' ':'jump',
          'ArrowLeft':'left',
          'ArrowRight':'right',
          'ArrowUp':'up',
          'ArrowDown':'down',
      };
      this.on_keydown = (e) => {
          this.setKeyState(e.key,'down');
      };
      this.on_keyup = (e) => {
          this.setKeyState(e.key,'up');
      };
  }
  setKeyState(key,value) {
      let state = this.getKeyState(key);
      state.prev = state.current;
      state.current = value;
  }
  getKeyState(key) {
      if(!this.states[key]) {
          this.states[key] = {
              prev:'up',
              current:'up',
          };
      }
      return this.states[key]
  }
  isPressed(name) {
      return this.getKeyState(name).current === 'down'
  }
}

const BUTTONS$1 = {
  LEFT:'left-button',
  PRESSED:'down',
  RELEASED:'up',
};
class MouseInputState {
  constructor() {
      this.clientX = 0;
      this.clientY = 0;
      this.states = {};
      this.downHandler = (e) => {
          this.setKeyState(BUTTONS$1.LEFT,BUTTONS$1.PRESSED);
      };
      this.moveHandler = (e) =>  {
          this.clientX = e.clientX;
          this.lastTimestamp = e.timeStamp;
      };
      this.upHandler = (e) => {
          this.setKeyState(BUTTONS$1.LEFT,BUTTONS$1.RELEASED);
      };

  }
  setKeyState(key,value) {
      let state = this.getKeyState(key);
      state.prev = state.current;
      state.current = value;
  }
  getKeyState(key) {
      if(!this.states[key]) {
          this.states[key] = {
              prev:BUTTONS$1.RELEASED,
              current:BUTTONS$1.RELEASED,
          };
      }
      return this.states[key]
  }
}

class GamepadInputState extends Component {
  constructor() {
      super();
      this.axis_threshold = 0.4;
      this.connected = false;
  }
}

class InputState extends Component$1 {
  constructor() {
    super();
    this.states = {};
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

class ControllerConnected extends TagComponent {}

class Draggable extends Component$1 {}
Draggable.schema = {
  value: { default: false, type: Types.Boolean }
};

class Dragging extends TagComponent {}

class VRInputSystem extends System$1 {    
  set debug(debug){
      this.debug = debug;
  }
  
  init() {
    this.world
      .registerComponent(VRInputState)
      .registerComponent(VRInputBehaviour)
      .registerComponent(ControllerConnected);
  }

  execute() {

    this.queries.controllers.added.forEach(entity => {
      let controllerId = entity.getComponent(VRController).id;
      var controller = renderer.xr.getController(controllerId);
      controller.name = "controller";

      controller.addEventListener("connected", () => {
        entity.addComponent(ControllerConnected);
      });

      controller.addEventListener("disconnected", () => {
        entity.removeComponent(ControllerConnected);
      });

      if (entity.hasComponent(VRInputBehaviour)) {
        var behaviour = entity.getComponent(VRInputBehaviour);
        Object.keys(behaviour).forEach(eventName => {
          if (behaviour[eventName]) {
            controller.addEventListener(eventName, behaviour[eventName]);
          }
        });
      }

      let controllerGrip = renderer.xr.getControllerGrip(controllerId);
      controllerGrip.name = "model";
    });

  }
}

VRInputSystem.queries = {
  controllers: {
    components: [VRInputState],
    listen: {
      added: true
    }
  }
};

class KeyboardInputSystem extends System {
    set debug(debug){
        this.debug = debug;
    }

    execute(delta, time) {
        this.queries.controls.added.forEach( ent => {
            let cont = ent.getMutableComponent(KeyboardState);
            document.addEventListener('keydown',cont.on_keydown);
            document.addEventListener('keyup',cont.on_keyup);
        });
        this.queries.controls.results.forEach(ent => {
            let kb = ent.getComponent(KeyboardState);
            let inp = ent.getMutableComponent(InputState);
            Object.keys(kb.mapping).forEach(key => {
                let name = kb.mapping[key];
                let state = kb.getKeyState(key);
                if(state.current === 'down' && state.prev === 'up') {
                    inp.states[name] = (state.current === 'down');
                    inp.changed = true;
                    if(debug) console.log(name + " changed to " + state);
                }
                if(state.current === 'up' && state.prev === 'down') {
                    inp.states[name] = (state.current === 'down');
                    inp.changed = true;
                    inp.released = true;
                    if(debug) console.log(name + " changed to " + state);
                }
                state.prev = state.current;
            });
            // console.log("key mapping", kb.mapping['a'], kb.states['a'], "left state",inp.states['left'])
        });
    }
}

KeyboardInputSystem.queries = {
    controls: {
        components:[KeyboardState, InputState],
        listen: { added:true, removed: true},
    },
};

// TODO: Add middle and right mouse button support
class MouseInputSystem extends System {
    set debug(debug){
        this.debug = debug;
    }

    execute(delta, time) {
        this.queries.mouse.added.forEach(ent => {
            let mouse = ent.getMutableComponent(MouseState);
            document.addEventListener('mousemove', mouse.moveHandler, false);
            document.addEventListener('mousedown', mouse.downHandler, false);
            document.addEventListener('mouseup',   mouse.upHandler,   false);
        });
        this.queries.mouse.results.forEach(ent => {
            let mouse = ent.getComponent(MouseState);
            let inp = ent.getMutableComponent(InputState);
            let name = BUTTONS.LEFT;
            let state = mouse.getKeyState(name);
            // just pressed down
            if(state.current === BUTTONS.PRESSED && state.prev === BUTTONS.RELEASED) {
                inp.states[name] = (state.current === BUTTONS.PRESSED);
                inp.changed = true;
            }
            // just released up
            if(state.current === BUTTONS.RELEASED && state.prev === BUTTONS.PRESSED) {
                inp.states[name] = (state.current === BUTTONS.PRESSED);
                inp.changed = true;
                inp.released = true;
            }
            if(state.current !== state.prev && debug) console.log("New state: " + state.current);
            state.prev = state.current;
        });
        this.queries.mouse.removed.forEach(ent => {
            let mouse = ent.getMutableComponent(MouseState);
            if(mouse) document.removeEventListener('mousemove', mouse.moveHandler);
        });
    }
}
MouseInputSystem.queries = {
    mouse: {
        components:[MouseState, InputState],
        listen: {
            added:true,
            removed:true
        }
    }
};

class GamepadInputSystem extends System {
    set debug(debug){
        this.debug = debug;
    }

    execute(delta, time) {
        this.queries.simple.added.forEach(ent => {
            let gp = ent.getMutableComponent(SimpleGamepadState);
            window.addEventListener("gamepadconnected", (event) => {
                console.log("A gamepad connected:", event.gamepad);
                gp.connected = true;
            });
            window.addEventListener("gamepaddisconnected", (event) => {
                console.log("A gamepad disconnected:", event.gamepad);
                gp.connected = false;
            });
        });
        this.queries.simple.results.forEach(ent => {
            let gp = ent.getMutableComponent(SimpleGamepadState);
            if(gp.connected) {
                this._scan_gamepads(gp,ent.getMutableComponent(InputState));
            }
        });
    }

    _scan_gamepads(gp, inp) {
        const gamepads = navigator.getGamepads();
        gamepads.forEach(gamepad => {
            if(gamepad.axes) {
                if(gamepad.axes.length >= 2) {
                    this.scan_x(gp,gamepad.axes[0],inp);
                    this.scan_y(gp,gamepad.axes[1],inp);
                }
            }
        });
    }

    scan_x(gp, x, input) {
        if(x < -gp.axis_threshold) {
            input.states.left = true;
            input.states.right = false;
            return
        }
        if(x > gp.axis_threshold) {
            input.states.left = false;
            input.states.right = true;
            return
        }
        input.states.left = false;
        input.states.right = false;

        if (debug) console.log("left: " + input.states.left);
        if (debug) console.log("right: " + input.states.right);
    }

    scan_y(gp, y, input) {
        if(y < -gp.axis_threshold) {
            input.states.up = false;
            input.states.down = true;
            return
        }
        if(y > gp.axis_threshold) {
            input.states.up = true;
            input.states.down = false;
            return
        }
        input.states.up = false;
        input.states.down = false;

        if (debug) console.log("up: " + input.states.up);
        if (debug) console.log("down: " + input.states.down);
    }
}

GamepadInputSystem.queries = {
    simple: {
        components:[SimpleGamepadState, InputState],
        listen: {
            added:true,
            removed:true,
        }
    }
};

const DEFAULT_OPTIONS = {
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
};

function initializeInputSystems(
  world,
  options = DEFAULT_OPTIONS
) {
  if (options.debug) {
    console.log("Registering input systems with the following options:");
    console.log(options);
  }

  if (!isBrowser)
    return console.error("Couldn't initialize input, are you in a browser?");

  if (options.mouse) world.registerSystem(MouseInputSystem);
  if (options.keyboard) world.registerSystem(KeyboardInputSystem);
  if (options.gamepad) world.registerSystem(GamepadInputSystem);
  // TODO: Add touchscreen

  if (navigator && navigator.xr && options.vr)
    world.registerSystem(VRInputSystem);

  if (options.debug) console.log("INPUT: Registered input systems.");
}

export default initializeInputSystems;
export { ControllerConnected, Draggable, Dragging, GamepadInputState, GamepadInputSystem, InputState, KeyboardInputState, KeyboardInputSystem, MouseInputState, MouseInputSystem, VRInputBehaviour, VRInputState, VRInputSystem };
