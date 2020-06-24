import { Component } from "ecsy";
export class GamepadInputState extends Component {
    constructor() {
        super();
        this.axis_threshold = 0.4;
        this.connected = false;
    }
}
