import { Component } from "../../ecs/classes/Component";
interface PropTypes {
    scale: number[];
}
export declare class ScaleComponent extends Component<PropTypes> {
    scale: number[];
    constructor();
    copy(src: this): this;
    reset(): void;
}
export {};
