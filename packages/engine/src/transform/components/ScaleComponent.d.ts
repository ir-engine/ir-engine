import { Component } from '../../ecs/classes/Component';
export declare class ScaleComponent extends Component<ScaleComponent> {
    scale: number[];
    constructor();
    copy(src: this): this;
    reset(): void;
}
