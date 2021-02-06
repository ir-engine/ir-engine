import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { Quaternion, Vector3 } from "three";
export declare class ServerSpawnSystem extends System {
    spawnPoints: Entity[];
    lastSpawnIndex: number;
    constructor(attributes?: SystemAttributes);
    getRandomSpawnPoint(): {
        position: Vector3;
        rotation: Quaternion;
    };
    execute(): void;
}
