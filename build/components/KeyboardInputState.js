import { Component } from "ecsy";
export class KeyboardInputState extends Component {
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
