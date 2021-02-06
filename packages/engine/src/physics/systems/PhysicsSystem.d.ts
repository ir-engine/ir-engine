import { ContactMaterial, Material, World } from 'cannon-es';
import { System } from '../../ecs/classes/System';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
export declare class PhysicsSystem extends System {
    updateType: SystemUpdateType;
    static frame: number;
    static physicsWorld: World;
    static simulate: boolean;
    static serverOnlyRigidBodyCollides: boolean;
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
    execute(delta: number): void;
}
