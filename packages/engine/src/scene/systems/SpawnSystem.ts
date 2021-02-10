import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import SpawnPointComponent from "../components/SpawnPointComponent";
import TeleportToSpawnPoint from "../components/TeleportToSpawnPoint";
import { Engine } from "../../ecs/classes/Engine";
import { Quaternion, Vector3 } from "three";

export class ServerSpawnSystem extends System {
    spawnPoints: Entity[] = []
    lastSpawnIndex = 0;

    constructor(attributes?: SystemAttributes) {
        super(attributes);

        Engine.spawnSystem = this;
    }

    getRandomSpawnPoint(): { position: Vector3, rotation: Quaternion } {
        if (this.spawnPoints.length < 1) {
            console.warn("Couldn't spawn entity at spawn point, no spawn points available");
            return {
                position: new Vector3(),
                rotation: new Quaternion()
            };
        }

        // Get new spawn point (round robin)
        this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length;

        const spawnTransform = getComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent);
        return {
            position: spawnTransform.position.clone(),
            rotation: spawnTransform.rotation.clone(),
        };
    }

    execute(): void {
        // Keep a list of spawn points so we can send our user to one
        this.queryResults.spawnPoint.added?.forEach(entity => {
            if (!hasComponent(entity, TransformComponent))
                return console.warn("Can't add spawn point, no transform component on entity")
            this.spawnPoints.push(entity);
        });
        this.queryResults.spawnPoint.removed?.forEach(entity => {
            this.spawnPoints.splice(this.spawnPoints.indexOf(entity))
        });
    }
}

ServerSpawnSystem.queries = {
    toBeSpawned: {
        components: [TeleportToSpawnPoint, TransformComponent],
        listen: {
            added: true,
            removed: true
        }
    },
    spawnPoint: {
        components: [SpawnPointComponent, TransformComponent],
        listen: {
            added: true,
            removed: true
        }
    },
};
