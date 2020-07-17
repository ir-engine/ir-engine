import { Component } from "ecsy";
interface jumpVals {
    canJump: boolean;
    t?: number;
    height?: number;
    duration?: number;
}
interface PropTypes {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
    jump: jumpVals;
}
export default class Actor extends Component<PropTypes> {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
    rotationSpeedZ: number;
    jump: jumpVals;
    constructor();
    copy(src: this): this;
    reset(): void;
}
export {};
