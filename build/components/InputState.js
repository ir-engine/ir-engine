import { Component } from "ecsy";
export class InputState extends Component {
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
