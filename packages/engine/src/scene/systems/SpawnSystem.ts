import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { getComponent, getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import SpawnPointComponent from "../components/SpawnPointComponent";
import TeleportToSpawnPoint from "../components/TeleportToSpawnPoint";
import { Engine } from "../../ecs/classes/Engine";
import { ControllerColliderComponent } from "../../physics/components/ControllerColliderComponent";
import { Vector3 } from "three";

//import { CharacterComponent } from '../../templates/character/components/CharacterComponent';


export class ServerSpawnSystem extends System {
  spawnPoints: Entity[] = []
  lastSpawnIndex = 0;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }
  /*
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
  */
  execute(): void {
    // Keep a list of spawn points so we can send our user to one
    this.queryResults.spawnPoint.added?.forEach(entity => {
      if (!hasComponent(entity, TransformComponent))
        return console.warn("Can't add spawn point, no transform component on entity")
      this.spawnPoints.push(entity);
    });
    this.queryResults.toBeSpawned.all?.forEach(entity => {
      const collider = getMutableComponent(entity, ControllerColliderComponent);
      const transform = getMutableComponent(entity, TransformComponent);
      if(!collider.controller) return;
      // on production is NaN at start (dont know why)
      isNaN(this.lastSpawnIndex) ? this.lastSpawnIndex = 0 : '';
      let spawnPosition = new Vector3();
      if (this.spawnPoints.length > 0) {
        spawnPosition = getComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent).position;
      }
      spawnPosition.y += collider.height;
      if ( collider.playerStuck > 180) {
        this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length;
        collider.controller.velocity = { x: 0, y: 0, z: 0 };
        transform.position.copy(spawnPosition);
        console.log('spawn pos', spawnPosition)
        collider.controller.updateTransform({ translation: { x: spawnPosition.x, y: spawnPosition.y, z: spawnPosition.z } });
      } else {
        console.log('removed TeleportToSpawnPoint')
        removeComponent(entity, TeleportToSpawnPoint);
      }
    });
    this.queryResults.spawnPoint.removed?.forEach(entity => {
      this.spawnPoints.splice(this.spawnPoints.indexOf(entity))
    });
  }
}

ServerSpawnSystem.queries = {
  toBeSpawned: {
    components: [TeleportToSpawnPoint, ControllerColliderComponent],
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
