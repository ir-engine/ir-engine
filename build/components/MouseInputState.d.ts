import { Component } from "ecsy";
export declare const BUTTONS: {
    LEFT: string;
    PRESSED: string;
    RELEASED: string;
};
export declare class MouseInputState extends Component {
    clientX: number;
    clientY: number;
    states: any;
    downHandler: any;
    moveHandler: any;
    upHandler: any;
    lastTimestamp: any;
    constructor();
}
