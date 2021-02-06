import { ContactMaterial, Material, World } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
export declare class PhysicsManager extends Component<any> {
    static instance: PhysicsManager;
    frame: number;
    physicsWorld: World;
    simulate: boolean;
    groundMaterial: Material;
    wheelMaterial: Material;
    trimMeshMaterial: Material;
    wheelGroundContactMaterial: ContactMaterial;
    parallelPairs: any[];
    physicsFrameRate: number;
    physicsFrameTime: number;
    physicsMaxPrediction: number;
    constructor();
    dispose(): void;
}
