import { Mesh } from "three";
import { Body } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
export declare class BoxCollider extends Component<BoxCollider> {
    options: any;
    body: Body;
    debugModel: Mesh;
    constructor(options: any);
}
