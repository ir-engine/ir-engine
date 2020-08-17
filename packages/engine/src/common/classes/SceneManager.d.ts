import { Scene } from "three";
import { Component } from "../../ecs/classes/Component";
interface PropTypes {
    scene: Scene;
}
export declare class SceneManager extends Component<PropTypes> {
    static instance: SceneManager;
    scene: any;
    constructor();
}
export {};
