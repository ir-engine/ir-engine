import { Quaternion, Vector3 } from "three";
import { ControllerEvents, ControllerHitEvent, SceneQueryType } from "three-physx";
import { applyVectorMatrixXZ } from "../common/functions/applyVectorMatrixXZ";
import { isClient } from "../common/functions/isClient";
import { EngineEvents } from "../ecs/classes/EngineEvents";
import { System, SystemAttributes } from "../ecs/classes/System";
import { Not } from "../ecs/functions/ComponentFunctions";
import { getMutableComponent, getComponent, getRemovedComponent, getEntityByID } from "../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../ecs/functions/SystemUpdateType";
import { LocalInputReceiver } from "../input/components/LocalInputReceiver";
import { characterMoveBehavior } from "./behaviors/characterMoveBehavior";
import { ControllerColliderComponent } from "./components/ControllerColliderComponent";
import { InterpolationComponent } from "../physics/components/InterpolationComponent";
import { CollisionGroups } from "../physics/enums/CollisionGroups";
import { PhysicsSystem } from "../physics/systems/PhysicsSystem";
import { TransformComponent } from "../transform/components/TransformComponent";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "./components/CharacterComponent";
import { IKComponent } from "./components/IKComponent";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { loadActorAvatar } from "./prefabs/NetworkPlayerCharacter";

const forwardVector = new Vector3(0, 0, 1);
const prevControllerColliderPosition = new Vector3();

export class CharacterControllerSystem extends System {

  // Entity
  static EVENTS = {
    LOAD_AVATAR: "CHARCACTER_SYSTEM_LOAD_AVATAR",
  }

  updateType = SystemUpdateType.Fixed;
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);

    EngineEvents.instance.addEventListener(CharacterControllerSystem.EVENTS.LOAD_AVATAR, ({ entityID, avatarId, avatarURL }) => {
      const entity = getEntityByID(entityID)
      const characterAvatar = getMutableComponent(entity, CharacterComponent);
      if (characterAvatar != null) {
        characterAvatar.avatarId = avatarId;
        characterAvatar.avatarURL = avatarURL;
      }
      loadActorAvatar(entity)
    })
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
    EngineEvents.instance.removeAllListenersForEvent(CharacterControllerSystem.EVENTS.LOAD_AVATAR)
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {

    this.queryResults.character.added?.forEach((entity) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      actor.raycastQuery = PhysicsSystem.instance.addRaycastQuery({
        type: SceneQueryType.Closest,
        origin: new Vector3(),
        direction: new Vector3(0, -1, 0),
        maxDistance: 0.1,
        collisionMask: CollisionGroups.All,
      });
    });

    this.queryResults.controller.added?.forEach(entity => {
      const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      collider.controller.addEventListener(ControllerEvents.CONTROLLER_SHAPE_HIT, (ev: ControllerHitEvent) => {
        collider.collisions.push(ev);
      })
      collider.controller.addEventListener(ControllerEvents.CONTROLLER_CONTROLLER_HIT, (ev: ControllerHitEvent) => {
        collider.collisions.push(ev);
      })
      collider.controller.addEventListener(ControllerEvents.CONTROLLER_OBSTACLE_HIT, (ev: ControllerHitEvent) => {
        collider.collisions.push(ev);
      })
    });

    this.queryResults.controller.all?.forEach((entity) => {
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      // iterate on all collisions since the last update
      collider.collisions.forEach((event: ControllerHitEvent) => {
        const { length, normal, position, shape, body } = event;
        // TODO: figure out how we expose specific behaviors like this
        if (isClient) {
          const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
          if(shape.userData?.action === 'portal') {
            actor.playerInPortal += 1
            if (actor.playerInPortal > 120) {
              EngineEvents.instance.dispatchEvent({ type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT, location: shape.userData?.link });
              actor.playerInPortal = 0;
            }
          }
        }
      })
      collider.collisions = []; // clear for next loop
    })

    this.queryResults.character.all?.forEach(entity => {

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

      if (!actor.movementEnabled || !actor.initialized) return;
      // do head rotation for XR from input view vector - TODO: figure out where to put this
      // if(XRSystem.instance?.cameraDolly) XRSystem.instance.cameraDolly.setRotationFromAxisAngle(downVector, Math.atan2(actor.viewVector.z, actor.viewVector.x))

      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);

      // reset if vals are invalid
      if (isNaN(collider.controller.transform.translation.x) || collider.controller.transform.translation.y < -10) {
        console.warn("WARNING: Character physics data reporting NaN")
        collider.controller.transform.translation.x = 0;
        collider.controller.transform.translation.y = 10;
        collider.controller.transform.translation.z = 0;
        collider.playerStuck = 1000;
        return;
      }

      transform.position.set(
        collider.controller.transform.translation.x,
        collider.controller.transform.translation.y,
        collider.controller.transform.translation.z
      );

      // console.log(collider.controller.transform.translation)

      const actorRaycastStart = new Vector3(collider.controller.transform.translation.x, collider.controller.transform.translation.y, collider.controller.transform.translation.z);
      actor.raycastQuery.origin = new Vector3(actorRaycastStart.x, actorRaycastStart.y - (actor.actorCapsule.height * 0.5) - actor.actorCapsule.radius, actorRaycastStart.z);
      actor.raycastQuery.direction = new Vector3(0, -1, 0);
      actor.closestHit = actor.raycastQuery.hits[0];
      actor.isGrounded = actor.closestHit ? true : collider.controller.collisions.down;
    });

    this.queryResults.controller.removed?.forEach(entity => {
      const collider = getRemovedComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      if (collider) {
        PhysicsSystem.instance.removeController(collider.controller);
      }
    });

    // PhysicsMove LocalCharacter and Update velocity vector for Animations
    this.queryResults.localCharacter.all?.forEach(entity => {
      const controllerCollider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (!actor.initialized || !controllerCollider.controller || !actor.movementEnabled) return;

      const x = controllerCollider.controller.transform.translation.x - prevControllerColliderPosition.x;
      const y = controllerCollider.controller.transform.translation.y - prevControllerColliderPosition.y;
      const z = controllerCollider.controller.transform.translation.z - prevControllerColliderPosition.z;

      prevControllerColliderPosition.set(
        controllerCollider.controller.transform.translation.x,
        controllerCollider.controller.transform.translation.y,
        controllerCollider.controller.transform.translation.z
      )
      if (isNaN(x)) {
        actor.animationVelocity = new Vector3().set(0,0,0);
      }
      const q = new Quaternion().copy(transform.rotation).invert();
      actor.animationVelocity = new Vector3(x, y, z).applyQuaternion(q);
      // its beacose we need physicsMove on server and for localCharacter, not for all character
      characterMoveBehavior(entity, delta);
    });

    // PhysicsMove Characters On Server
    // its beacose we need physicsMove on server and for localCharacter, not for all character
    this.queryResults.characterOnServer.all?.forEach((entity) => {
      const actor = getComponent<CharacterComponent>(entity, CharacterComponent);
      const transform = getMutableComponent(entity, TransformComponent);
      // update rotationg for physics moving
      const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
      actor.orientation.copy(applyVectorMatrixXZ(flatViewVector, forwardVector))
      transform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
      characterMoveBehavior(entity, delta);
    })

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
    components: [LocalInputReceiver, ControllerColliderComponent, CharacterComponent],
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
  controller: {
    components: [ControllerColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  characterOnServer: {
    components: [Not(LocalInputReceiver), Not(InterpolationComponent), CharacterComponent],
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
