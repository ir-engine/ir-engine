import { Entity } from "../../ecs/classes/Entity";
import { System } from "../../ecs/classes/System";
import { getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
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
            // console.log("Spawning ", entity.id);
            if (this.spawnPoints.length < 1)
                return console.warn("Couldn't spawn entity at spawn point, no spawn points available");

            // Get new spawn point (round robin)
            this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length;

            // Copy spawn transform to entity transform
            const actor = getMutableComponent(entity, CharacterComponent);
            const spawnTransform = getMutableComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent);
            actor.actorCapsule.body.position.set(
              spawnTransform.position.x,
              spawnTransform.position.y,
              spawnTransform.position.z
            );
            console.log('SpawnSystem1')
            actor.actorCapsule.body.quaternion.set(
              spawnTransform.rotation.x,
              spawnTransform.rotation.y,
              spawnTransform.rotation.z,
              spawnTransform.rotation.w
            );
            console.log('SpawnSystem2')
            
            console.log('SPAWN CONSOLE!!!',actor.actorCapsule, spawnTransform)
            // debugger;
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
