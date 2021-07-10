import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import SpawnPointComponent from "../components/SpawnPointComponent";
import { Quaternion, Vector3 } from "three";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";

const randomPositionCentered = (area: Vector3) => {
  return new Vector3(
    (Math.random() - 0.5) * area.x,
    (Math.random() - 0.5) * area.y,
    (Math.random() - 0.5) * area.z
  );
}

export class ServerSpawnSystem extends System {
  spawnPoints: Entity[] = []
  lastSpawnIndex = 0;

  updateType = SystemUpdateType.Fixed;

  static instance: ServerSpawnSystem;

  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    ServerSpawnSystem.instance = this;
  }

  getRandomSpawnPoint(): { position: Vector3, rotation: Quaternion } {
    const spawnTransform = getComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent);
    if(spawnTransform && this.spawnPoints.length > 0) {
      // Get new spawn point (round robin)
      this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length;
      return {
        position: spawnTransform.position.clone().add(randomPositionCentered(spawnTransform.scale)),
        rotation: spawnTransform.rotation.clone(),
      }
    }

    console.warn("Couldn't spawn entity at spawn point, no spawn points available");

    return { 
      position: randomPositionCentered(new Vector3(2, 0, 2)),
      rotation: new Quaternion()
    }
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
  spawnPoint: {
    components: [SpawnPointComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
