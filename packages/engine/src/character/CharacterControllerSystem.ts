import { System, SystemAttributes } from "../ecs/classes/System";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "../templates/character/components/CharacterComponent";
import { updateCharacterOrientation } from "./functions/updateCharacterOrientation";
import { getComponent, getMutableComponent } from "../ecs/functions/EntityFunctions";
import { physicsMove } from "../physics/behaviors/physicsMove";
import { IKComponent } from "./components/IKComponent";
import { Input } from "../input/components/Input";
import { ControllerColliderComponent } from "../physics/components/ControllerColliderComponent";
import { PhysicsSystem } from "../physics/systems/PhysicsSystem";
import { CollisionGroups } from "../physics/enums/CollisionGroups";
import { Vector3 } from "three";
import { TransformComponent } from "../transform/components/TransformComponent";
export class CharacterControllerSystem extends System {

  constructor(attributes?: SystemAttributes) {
    super(attributes);
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.character.all.forEach((entity) => {
      const actor = getComponent(entity, CharacterComponent)
      
      updateCharacterOrientation(entity, delta)
      if(actor.movementEnabled) {
        physicsMove(entity, {}, delta)
      }
    })

    this.queryResults.animation.all.forEach((entity) => {
      updateVectorAnimation(entity, delta)
    })

    this.queryResults.ikavatar.all.forEach((entity) => {
      const ikComponent = getMutableComponent(entity, IKComponent);
      if(ikComponent.avatarIKRig) {
        ikComponent.avatarIKRig.update(delta);
      }
    })
    // Capsule

    this.queryResults.controllerCollider.all?.forEach(entity => {
      const capsule = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);
      const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  
      if (actor == undefined || !actor.initialized) return;
    
      if(isNaN(capsule.body.transform.translation.x)) {
        capsule.body.transform.translation.x = 0;
        capsule.body.transform.translation.y = 0;
        capsule.body.transform.translation.z = 0;
        capsule.playerStuck = 1000;
      }
      // onUpdate
      transform.position.set(
        capsule.body.transform.translation.x,
        capsule.body.transform.translation.y,
        capsule.body.transform.translation.z
      );
      const actorRaycastOptions = {
        collisionFilterMask: CollisionGroups.Default | CollisionGroups.Car | CollisionGroups.ActiveCollider,
        skipBackfaces: true /* ignore back faces */
      };
      
      const actorRaycastStart = new Vector3(capsule.body.transform.translation.x, capsule.body.transform.translation.y, capsule.body.transform.translation.z);
      const actorRaycastEnd = new Vector3(capsule.body.transform.translation.x, capsule.body.transform.translation.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.transform.translation.z);
    
      const m = PhysicsSystem.instance.raycastClosest(actorRaycastStart, actorRaycastEnd, actorRaycastOptions, actor.rayResult);
      
      // TODO: replace this with ControllerCollider collision event

      // if (isClient && m && actor.rayResult.body.collisionFilterGroup == CollisionGroups.ActiveCollider) {
      //   actor.playerInPortal += 1
      //   if (actor.playerInPortal > 120) {
      //     EngineEvents.instance.dispatchEvent({ type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT, location: actor.rayResult.body.link });
      //     actor.playerInPortal = 0;
      //   }
      // } else {
      //   actor.playerInPortal = 0;
      // }
    });

    this.queryResults.controllerCollider.removed?.forEach(entity => {
      const removedCapsule = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent, true);
      if (removedCapsule) {
        PhysicsSystem.instance.removeBody(removedCapsule.body);
      }
      return;
    });
  }
}

CharacterControllerSystem.queries = {
  character: {
    components: [CharacterComponent, Input],
    listen: {
      added: true,
      removed: true
    }
  },
  controllerCollider: {
    components: [ControllerColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  animation: {
    components: [AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  ikavatar: {
    components: [IKComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
