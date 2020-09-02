import { System } from '../../ecs/classes/System';
import { PhysicsManager } from '../components/PhysicsManager';
import { RigidBody } from '../../physics/components/RigidBody';
import { VehicleBody } from '../../physics/components/VehicleBody';
import { WheelBody } from '../../physics/components/WheelBody';
import { addCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { WheelBehavior } from '../behaviors/WheelBehavior';
import { ColliderComponent } from '../components/ColliderComponent';
import { FixedStepsRunner } from "../../common/functions/Timer";
import { physicsPreStep } from '../../templates/character/behaviors/physicsPreStep';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { physicsPostStep } from '../../templates/character/behaviors/physicsPostStep';
import { updateCharacter } from '../../templates/character/behaviors/updateCharacter';

export class PhysicsSystem extends System {
  fixedExecute:(delta:number)=>void = null
  fixedRunner: FixedStepsRunner

  constructor() {
    super()
    this.fixedRunner = new FixedStepsRunner(60, this.onFixedExecute.bind(this))
  }

  canExecute(delta:number): boolean {
    return super.canExecute(delta) && this.fixedRunner.canRun(delta);
  }

  execute(delta):void {
    this.fixedRunner.run(delta)
  }

  init ():void {
    new PhysicsManager();
  }

  onFixedExecute(delta) {
    this.queryResults.character.all?.forEach(entity => physicsPreStep(entity, null, delta));
    PhysicsManager.instance.frame++;
    PhysicsManager.instance.physicsWorld.step(PhysicsManager.instance.timeStep);
    this.queryResults.character.all?.forEach(entity => updateCharacter(entity, null, delta));

   this.queryResults.character.all?.forEach(entity => physicsPostStep(entity, null, delta));

    // // Collider
     this.queryResults.сollider.added?.forEach(entity => {
       console.log("onAdded called on collider behavior")
       addCollider(entity, { phase: 'onAdded' });
     });

     this.queryResults.сollider.removed?.forEach(entity => {
       console.log("onRemoved called on collider behavior")
       addCollider(entity, { phase: 'onRemoved' });
     });

    // RigidBody

    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });

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

    // Wheel
    this.queryResults.wheelBody.added?.forEach(entity => {
      WheelBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.wheelBody.all?.forEach((entity, i) => {
      WheelBehavior(entity, { phase: 'onUpdate', i });
    });

    this.queryResults.wheelBody.removed?.forEach(entity => {
      WheelBehavior(entity, { phase: 'onRemoved' });
    });
  }
}

PhysicsSystem.queries = {
  character: {
    components: [CharacterComponent],
  },
  сollider: {
    components: [ColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  rigidBody: {
    components: [RigidBody],
    listen: {
      added: true,
      removed: true
    }
  },
  vehicleBody: {
    components: [VehicleBody],
    listen: {
      added: true,
      removed: true
    }
  },
  wheelBody: {
    components: [WheelBody],
    listen: {
      added: true,
      removed: true
    }
  }
};
