import { Component } from "ecsy";
interface PropTypes {
    position: number[];
    rotation: number[];
    scale: number[];
    velocity: number[];
}
export declare class TransformComponent extends Component<PropTypes> {
    position: number[];
    rotation: number[];
    scale: number[];
    velocity: number[];
    constructor();
    copy(src: this): this;
    reset(): void;
}
export {};
