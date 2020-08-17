import { TransformComponent } from "./TransformComponent";
import { Component } from "../../ecs/classes/Component";
export declare class TransformParentComponent extends Component<any> {
    children: TransformComponent[];
}
