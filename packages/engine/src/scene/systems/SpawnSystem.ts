import { Entity } from "../../ecs/classes/Entity";
import { System } from "../../ecs/classes/System";
import { getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import SpawnPointComponent from "../components/SpawnPointComponent";
import TeleportToSpawnPoint from "../components/TeleportToSpawnPoint";

export class ServerSpawnSystem extends System {
    spawnPoints: Entity[] = []
    lastSpawnIndex = 0;
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

        this.queryResults.toBeSpawned.all?.forEach(entity => {
            console.log("Spawning ", entity.id);
            if (this.spawnPoints.length < 1)
                return console.warn("Couldn't spawn entity at spawn point, no spawn points available");

            // Get new spawn point (round robin)
            this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length;

            // Copy spawn transform to entity transform
            const transform = getMutableComponent(entity, TransformComponent);
            const spawnTransform = getMutableComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent);
            console.log('spawnTransform.position', spawnTransform.position.toArray());
            console.log('spawnTransform.rotation', spawnTransform.rotation.toArray());
            transform.position.copy(spawnTransform.position);
            transform.rotation.copy(spawnTransform.rotation);

            // Remove the component
            removeComponent(entity, TeleportToSpawnPoint);
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
