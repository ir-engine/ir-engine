import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { MouseInputState, BUTTONS } from "../components/MouseInputState";
// TODO: Add middle and right mouse button support
export class MouseInputSystem extends System {
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
