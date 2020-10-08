import { System } from '../../ecs/classes/System';
import { PhysicsManager } from '../components/PhysicsManager';
import { RigidBody } from '../../physics/components/RigidBody';
import { VehicleBody } from '../../physics/components/VehicleBody';

import { addCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { playerModelInCar } from '@xr3ngine/engine/src/templates/car/behaviors/playerModelInCar';

import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { FixedStepsRunner } from "../../common/functions/Timer";
import { physicsPreStep } from '../../templates/character/behaviors/physicsPreStep';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';

import { physicsPostStep } from '../../templates/character/behaviors/physicsPostStep';
import { updateCharacter } from '../../templates/character/behaviors/updateCharacter';
import { Engine } from '../../ecs/classes/Engine';

export class PhysicsSystem extends System {
  fixedExecute:(delta:number)=>void = null
  fixedRunner: FixedStepsRunner

  constructor() {
    super();
    this.fixedRunner = new FixedStepsRunner(Engine.physicsFrameRate, this.onFixedExecute.bind(this));
    new PhysicsManager({ framerate: Engine.physicsFrameRate });
  }

  canExecute(delta:number): boolean {
    return super.canExecute(delta) && this.fixedRunner.canRun(delta);
  }

  execute(delta:number): void {
    this.fixedRunner.run(delta);

    this.onExecute(delta);
  }

  dispose(): void {
    super.dispose();

    PhysicsManager.instance.dispose();
  }

  onExecute(delta:number): void {
    // // Collider
    this.queryResults.collider.added?.forEach(entity => {
      console.log("onAdded called on collider behavior");
      addCollider(entity, { phase: 'onAdded' });
    });

    this.queryResults.collider.removed?.forEach(entity => {
      console.log("onRemoved called on collider behavior");
      addCollider(entity, { phase: 'onRemoved' });
    });

    // RigidBody
/*
    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });
*/
    this.queryResults.rigidBody.all?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onUpdate' });
    });

    this.queryResults.rigidBody.removed?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onRemoved' });
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

  }

  onFixedExecute(delta:number): void {
    this.queryResults.character.all?.forEach(entity => physicsPreStep(entity, null, delta));
    PhysicsManager.instance.frame++;
    PhysicsManager.instance.physicsWorld.step(PhysicsManager.instance.physicsFrameTime);
    this.queryResults.character.all?.forEach(entity => updateCharacter(entity, null, delta));

   this.queryResults.character.all?.forEach(entity => physicsPostStep(entity, null, delta));
  }
}

PhysicsSystem.queries = {
  character: {
    components: [CharacterComponent],
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
      added: true,
      removed: true
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
