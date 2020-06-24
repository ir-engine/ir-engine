import { Component, TagComponent, System } from 'https://unpkg.com/ecsy@undefined/dist/ecsy.module.js';

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

export default initializeInputSystems;
export { ControllerConnected, Draggable, Dragging, GamepadInputState, GamepadInputSystem, InputState, KeyboardInputState, KeyboardInputSystem, MouseInputState, MouseInputSystem };
