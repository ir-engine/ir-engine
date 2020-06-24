import { System } from "ecsy";
import { InputState } from "../components/InputState";
import { KeyboardInputState } from "../components/KeyboardInputState";
export class KeyboardInputSystem extends System {
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
