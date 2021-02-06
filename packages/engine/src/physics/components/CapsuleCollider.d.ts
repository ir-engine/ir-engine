import { Vec3, Body } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
export declare class CapsuleCollider extends Component<CapsuleCollider> {
    options: any;
    body: Body;
    mass: number;
    position: Vec3;
    height: number;
    radius: number;
    segments: number;
    friction: number;
    constructor(options: any);
    copy(options: any): any;
    reapplyOptions(options: any): void;
}
