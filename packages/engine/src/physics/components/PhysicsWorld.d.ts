import { ContactMaterial } from "cannon-es/src/material/ContactMaterial";
import { Material } from "cannon-es/src/material/Material";
import { Component } from "../../ecs/classes/Component";
export declare class PhysicsWorld extends Component<any> {
    static instance: PhysicsWorld;
    frame: number;
    physicsWorld: any;
    timeStep: number;
    groundMaterial: Material;
    wheelMaterial: Material;
    wheelGroundContactMaterial: ContactMaterial;
    constructor();
}
