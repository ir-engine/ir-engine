import { Component } from "../../ecs/classes/Component";
interface PropTypes {
    position: number[];
    rotation: number[];
    velocity: number[];
}
export declare class TransformComponent extends Component<PropTypes> {
    position: number[];
    rotation: number[];
    velocity: number[];
    constructor();
    copy(src: this): this;
    reset(): void;
}
export {};
