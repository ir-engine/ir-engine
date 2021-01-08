import { System } from '../../ecs/classes/System';
import { PhysicsManager } from '../components/PhysicsManager';
import { RigidBody } from "../components/RigidBody";
import { VehicleBody } from "../components/VehicleBody";
import { CapsuleCollider } from "../components/CapsuleCollider";

import { handleCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { capsuleColliderBehavior } from '../behaviors/capsuleColliderBehavior';
import { playerModelInCar } from '@xr3ngine/engine/src/templates/car/behaviors/playerModelInCar';

import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { physicsPreStep } from '../../templates/character/behaviors/physicsPreStep';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { physicsPostStep } from '../../templates/character/behaviors/physicsPostStep';
import { updateCharacter } from '../../templates/character/behaviors/updateCharacter';
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';

import { Network } from '../../networking/components/Network';
import { NetworkInterpolation } from '../../networking/components/NetworkInterpolation';
import { isClient } from '../../common/functions/isClient';
import { Vault } from '../../networking/components/Vault';
import { calculateInterpolation, addSnapshot, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';

export class PhysicsSystem extends System {
  updateType = SystemUpdateType.Fixed;

  constructor() {
    super();
    const physicsManagerComponent = addComponent<PhysicsManager>(createEntity(), PhysicsManager);
  }

  dispose(): void {
    super.dispose();

    PhysicsManager.instance?.dispose();
  }

  execute(delta: number): void {

    const clientSnapshot = {
      old: null,
      new: [],
      interpolationSnapshot: calculateInterpolation('x y z quat'),
      correction: 180 //speed correction client form server positions
    }

    if (isClient && Network.instance.worldState.snapshot) {
      clientSnapshot.old = Vault.instance.get((Network.instance.worldState.snapshot as any).time - 15, true)
/*
      if (clientSnapshot.old != undefined) {
          console.warn(clientSnapshot.old.time - Network.instance.worldState.snapshot.time);
      }
*/
    }

    // Collider

    this.queryResults.collider.added?.forEach(entity => {
      handleCollider(entity, { phase: 'onAdded' });
    });

    this.queryResults.collider.removed?.forEach(entity => {
      handleCollider(entity, { phase: 'onRemoved' });
    });

    // Capsule

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onUpdate', clientSnapshot });
    });

    // RigidBody

    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.rigidBody.all?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onUpdate', clientSnapshot });
    });

    // Vehicle

    this.queryResults.vehicleBody.added?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.vehicleBody.all?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onUpdate' });
    });
    this.queryResults.vehicleBody.removed?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onRemoved' });
    });

    // Player 3d model in car

    this.queryResults.playerInCar.added?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onAdded' }, delta);
    });

    this.queryResults.playerInCar.all?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onUpdate' }, delta);
    });

    this.queryResults.playerInCar.removed?.forEach(entity => {
      playerModelInCar(entity, { phase: 'onRemoved' }, delta);
    });
    if (PhysicsManager.instance.simulate) { // pause physics until loading all component scene
      this.queryResults.character.all?.forEach(entity => physicsPreStep(entity, null, delta));
      PhysicsManager.instance.frame++;
      PhysicsManager.instance.physicsWorld.step(PhysicsManager.instance.physicsFrameTime);
      this.queryResults.character.all?.forEach(entity => updateCharacter(entity, null, delta));
      this.queryResults.character.all?.forEach(entity => physicsPostStep(entity, null, delta));
      if (isClient) { Vault.instance.add(createSnapshot(clientSnapshot.new)) }
    }
  }
}

PhysicsSystem.queries = {
  character: {
    components: [CharacterComponent],
  },
  capsuleCollider: {
    components: [CapsuleCollider, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  rigidBody: {
    components: [RigidBody, TransformComponent],
    listen: {
      added: true
    }
  },
  vehicleBody: {
    components: [VehicleBody, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  playerInCar: {
    components: [PlayerInCar],
    listen: {
      added: true,
      removed: true
    }
  }
};
