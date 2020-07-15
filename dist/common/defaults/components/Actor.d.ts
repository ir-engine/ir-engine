import { Component } from "ecsy";
interface PropTypes {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
}
export declare class Actor extends Component<PropTypes> {
    rotationSpeedX: number;
    rotationSpeedY: number;
    maxSpeed: number;
    accelerationSpeed: number;
    rotationSpeedZ: number;
    constructor();
    copy(src: this): this;
    reset(): void;
}
export {};
