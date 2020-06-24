import { Component } from "ecsy";
export declare class KeyboardInputState extends Component {
    states: any;
    mapping: any;
    on_keydown: any;
    on_keyup: any;
    constructor();
    setKeyState(key: string, value: string): any;
    getKeyState(key: string): any;
    isPressed(name: string): boolean;
}
