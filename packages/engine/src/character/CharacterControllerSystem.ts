import { System, SystemAttributes } from "../ecs/classes/System";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "../templates/character/components/CharacterComponent";
import { updateCharacterOrientation } from "./functions/updateCharacterOrientation";
import { getComponent, getMutableComponent, hasComponent } from "../ecs/functions/EntityFunctions";
import { physicsMove } from "../physics/behaviors/physicsMove";
import { IKComponent } from "./components/IKComponent";
import { Input } from "../input/components/Input";
import { ControllerColliderComponent } from "../physics/components/ControllerColliderComponent";
import { PhysicsSystem } from "../physics/systems/PhysicsSystem";
import { CollisionGroups } from "../physics/enums/CollisionGroups";
import { Quaternion, Vector3 } from "three";
import { TransformComponent } from "../transform/components/TransformComponent";
import { Controller, SceneQueryType } from "@xr3ngine/three-physx";
import { LocalInputReceiver } from "../input/components/LocalInputReceiver";
import { NetworkObject } from "../networking/components/NetworkObject";
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
    this.queryResults.character.added.forEach((entity) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      actor.raycastQuery = PhysicsSystem.instance.addRaycastQuery({ 
        type: SceneQueryType.Closest,
        origin: new Vector3(),
        direction: new Vector3(0, -1, 0),
        maxDistance: 1,
        collisionMask: actor.collisionMask,
      });
    });

    this.queryResults.characterInput.all.forEach((entity) => {
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

    this.queryResults.controllerCollider.added?.forEach(entity => {
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent(entity, TransformComponent);
      collider.controller = PhysicsSystem.instance.createController(new Controller({
        isCapsule: true,
        collisionLayer: CollisionGroups.None,
        collisionMask: CollisionGroups.None,//CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Car | CollisionGroups.TrimeshColliders,
        position: {
          x: transform.position.x,
          y: transform.position.y + 2,
          z: transform.position.z
        },
        material: {
          dynamicFriction: collider.friction,
        }
      }));
    });

    this.queryResults.controllerCollider.all?.forEach(entity => {
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);
      const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
      
      if (actor == undefined || !actor.initialized) return;
    
      // reset if vals are invalid
      if(isNaN(collider.controller.transform.translation.x)) {
        collider.controller.transform.translation.x = 0;
        collider.controller.transform.translation.y = 0.75;
        collider.controller.transform.translation.z = 0;
        collider.playerStuck = 1000;
      }
      // onUpdate
      transform.position.set(
        collider.controller.transform.translation.x,
        collider.controller.transform.translation.y,
        collider.controller.transform.translation.z
      );
      
      const actorRaycastStart = new Vector3(collider.controller.transform.translation.x, collider.controller.transform.translation.y, collider.controller.transform.translation.z);
      actor.raycastQuery.origin = new Vector3(actorRaycastStart.x, actorRaycastStart.y, actorRaycastStart.z);
      actor.raycastQuery.direction = new Vector3(0, -1, 0);
      
      const closestHit = actor.raycastQuery.hits[0];

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
      const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent, true);
      if(collider) {
        PhysicsSystem.instance.removeController(collider.controller);
      }
    });

    // Update velocity vector for Animations
    this.queryResults.localCharacter.all?.forEach(entity => {
      const lastPos = { x:0, y:0, z:0 };
      if (!hasComponent(entity, ControllerColliderComponent)) return;
      const controllerCollider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (!actor.initialized || !controllerCollider.controller) return;

      const x = controllerCollider.controller.transform.translation.x - lastPos.x;
      const y = controllerCollider.controller.transform.translation.y - lastPos.y;
      const z = controllerCollider.controller.transform.translation.z - lastPos.z;
  
      if(isNaN(x)) {
        actor.animationVelocity = new Vector3(0,1,0);
        return;
      }
  
      lastPos.x = controllerCollider.controller.transform.translation.x;
      lastPos.y = controllerCollider.controller.transform.translation.y;
      lastPos.z = controllerCollider.controller.transform.translation.z;
  
      const q = new Quaternion().copy(transform.rotation).invert();
      actor.animationVelocity = new Vector3(x,y,z).applyQuaternion(q);
    });

  }
}

CharacterControllerSystem.queries = {
  localCharacter: {
    components: [LocalInputReceiver, ControllerColliderComponent, CharacterComponent, NetworkObject],
  },
  characterInput: {
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
  character: {
    components: [CharacterComponent],
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
