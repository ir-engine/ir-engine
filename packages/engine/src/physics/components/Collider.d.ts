import { Component } from "../../ecs/classes/Component";
export declare class ColliderComponent extends Component<ColliderComponent> {
    collider: any;
    type: string;
    mass: number;
    scale: number[];
}
