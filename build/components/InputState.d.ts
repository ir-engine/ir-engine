import { Component } from "ecsy";
interface Inputs {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}
export declare class InputState extends Component {
    states: Inputs;
    changed: boolean;
    released: boolean;
    constructor();
    anyChanged(): boolean;
    anyReleased(): boolean;
}
export {};
