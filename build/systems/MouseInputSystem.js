import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { MouseInputState, BUTTONS } from "../components/MouseInputState";
// TODO: Add middle and right mouse button support
export class MouseInputSystem extends System {
    constructor() {
        super(...arguments);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.downHandler = (e, mouse) => {
            this.setMouseState(BUTTONS.LEFT, BUTTONS.PRESSED, mouse);
        };
        this.moveHandler = (e, mouse) => {
            mouse.clientX = e.clientX;
            mouse.clientY = e.clientY;
            mouse.lastTimestamp = e.timeStamp;
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.upHandler = (e, mouse) => {
            this.setMouseState(BUTTONS.LEFT, BUTTONS.RELEASED, mouse);
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(delta, time) {
        this.queries.mouse.added.forEach(ent => {
            if (window && window.DEBUG_INPUT) {
                this.debug = window.DEBUG_INPUT;
            }
            else
                this.debug = false;
            this.mouse = ent.getMutableComponent(MouseInputState);
            this.inp = ent.getMutableComponent(InputState);
            document.addEventListener("mousemove", e => this.moveHandler(e, this.mouse), false);
            document.addEventListener("mousedown", e => this.downHandler(e, this.mouse), false);
            document.addEventListener("mouseup", e => this.upHandler(e, this.mouse), false);
        });
        this.queries.mouse.results.forEach(() => {
            const name = BUTTONS.LEFT;
            const state = this.getMouseState(name, this.mouse);
            // just pressed down
            if (state.current === BUTTONS.PRESSED &&
                state.prev === BUTTONS.RELEASED) {
                this.inp.states[name] = state.current === BUTTONS.PRESSED;
                this.inp.changed = true;
            }
            // just released up
            if (state.current === BUTTONS.RELEASED &&
                state.prev === BUTTONS.PRESSED) {
                this.inp.states[name] = state.current === BUTTONS.PRESSED;
                this.inp.changed = true;
                this.inp.released = true;
            }
            if (state.current !== state.prev && this.debug)
                state.prev = state.current;
        });
        this.queries.mouse.removed.forEach(ent => {
            const mouse = ent.getMutableComponent(MouseInputState);
            if (mouse)
                document.removeEventListener("mousemove", mouse.moveHandler);
        });
    }
    setMouseState(key, value, mouse) {
        const state = this.getMouseState(key, mouse);
        state.prev = state.current;
        state.current = value;
        if (this.debug)
            console.log(`Mouse button ${key} is ${value} at ${mouse.clientX} / ${mouse.clientY}`);
    }
    getMouseState(key, mouse) {
        if (!mouse.states[key]) {
            mouse.states[key] = {
                prev: BUTTONS.RELEASED,
                current: BUTTONS.RELEASED
            };
        }
        return mouse.states[key];
    }
}
MouseInputSystem.queries = {
    mouse: {
        components: [MouseInputState, InputState],
        listen: {
            added: true,
            removed: true
        }
    }
};
