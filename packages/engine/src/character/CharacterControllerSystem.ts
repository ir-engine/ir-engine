import { System, SystemAttributes } from "../ecs/classes/System";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "../templates/character/components/CharacterComponent";
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

const lastPos = { x: 0, y: 0, z: 0 };
const lastPos2 = { x: 0, y: 0, z: 0 };

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
    
    this.queryResults.character.added?.forEach((entity) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent, true);
      globalThis.characterBody = collider.controller;
      actor.raycastQuery = PhysicsSystem.instance.addRaycastQuery({
        type: SceneQueryType.Closest,
        origin: new Vector3(),
        direction: new Vector3(0, -1, 0),
        maxDistance: 1,
        collisionMask: actor.collisionMask,
      });
    });

    this.queryResults.character.all?.forEach(entity => {

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      
      if (!actor.movementEnabled || !actor.initialized) return;
      physicsMove(entity, delta);

      // do head rotation for XR from input view vector - TODO: figure out where to put this
      // if(XRSystem.instance?.cameraDolly) XRSystem.instance.cameraDolly.setRotationFromAxisAngle(downVector, Math.atan2(actor.viewVector.z, actor.viewVector.x))

      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);

      if (actor == undefined || !actor.initialized) return;
      // console.log(collider.controller.transform.translation, collider.controller.delta)
      // reset if vals are invalid
      if (isNaN(collider.controller.transform.translation.x)) {
        console.warn("WARNING: Character physics data reporting NaN")
        collider.controller.transform.translation.x = 0;
        collider.controller.transform.translation.y = 1;
        collider.controller.transform.translation.z = 0;
        collider.playerStuck = 1000;
        return;
      }
      const x = collider.controller.transform.translation.x - lastPos2.x;
      const y = collider.controller.transform.translation.y - lastPos2.y;
      const z = collider.controller.transform.translation.z - lastPos2.z;
      // console.log(Math.round(x * 100)/100, Math.round(y * 100)/100, Math.round(z * 100)/100)

      // onUpdate
      transform.position.set(
        collider.controller.transform.translation.x,
        collider.controller.transform.translation.y,
        collider.controller.transform.translation.z
      );


      lastPos2.x = collider.controller.transform.translation.x;
      lastPos2.y = collider.controller.transform.translation.y;
      lastPos2.z = collider.controller.transform.translation.z;

      const actorRaycastStart = new Vector3(collider.controller.transform.translation.x, collider.controller.transform.translation.y, collider.controller.transform.translation.z);
      actor.raycastQuery.origin = new Vector3(actorRaycastStart.x, actorRaycastStart.y - (actor.actorCapsule.height * 0.5) - actor.actorCapsule.radius, actorRaycastStart.z);
      actor.raycastQuery.direction = new Vector3(0, -1, 0);
      actor.raycastQuery.maxDistance = 0.1;

      const closestHit = actor.raycastQuery.hits[0];
      // console.log(closestHit)

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

    this.queryResults.character.removed?.forEach(entity => {
      const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent, true);
      if (collider) {
        PhysicsSystem.instance.removeController(collider.controller);
      }
    });

    // Update velocity vector for Animations
    this.queryResults.localCharacter.all?.forEach(entity => {
      const controllerCollider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (!actor.initialized || !controllerCollider.controller) return;

      const x = controllerCollider.controller.transform.translation.x - lastPos.x;
      const y = controllerCollider.controller.transform.translation.y - lastPos.y;
      const z = controllerCollider.controller.transform.translation.z - lastPos.z;

      if (isNaN(x)) {
        actor.animationVelocity = new Vector3(0, 1, 0);
        return;
      }

      lastPos.x = controllerCollider.controller.transform.translation.x;
      lastPos.y = controllerCollider.controller.transform.translation.y;
      lastPos.z = controllerCollider.controller.transform.translation.z;

      const q = new Quaternion().copy(transform.rotation).invert();
      actor.animationVelocity = new Vector3(x, y, z).applyQuaternion(q);
    });

    this.queryResults.animation.all?.forEach((entity) => {
      updateVectorAnimation(entity, delta)
    })

    this.queryResults.ikavatar.all?.forEach((entity) => {
      const ikComponent = getMutableComponent(entity, IKComponent);
      ikComponent.avatarIKRig?.update(delta);
    })
  }
}

CharacterControllerSystem.queries = {
  localCharacter: {
    components: [LocalInputReceiver, ControllerColliderComponent, CharacterComponent, NetworkObject],
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
