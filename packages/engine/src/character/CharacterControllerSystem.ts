import { Quaternion, Vector3 } from "three";
import { ControllerHitEvent, RaycastQuery, SceneQueryType } from "three-physx";
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
import { CollisionGroups, DefaultCollisionMask } from "../physics/enums/CollisionGroups";
import { PhysicsSystem } from "../physics/systems/PhysicsSystem";
import { TransformComponent } from "../transform/components/TransformComponent";
import { AnimationComponent } from "./components/AnimationComponent";
import { CharacterComponent } from "./components/CharacterComponent";
import { updateVectorAnimation } from "./functions/updateVectorAnimation";
import { loadActorAvatar, teleportPlayer } from "./prefabs/NetworkPlayerCharacter";
import { Engine } from "../ecs/classes/Engine";
import { IKRigComponent } from "./components/IKRigComponent";
import { Avatar } from "../xr/classes/IKAvatar";
import { Network } from "../networking/classes/Network";
import { PortalComponent } from "../scene/components/PortalComponent";
import { detectUserInPortal } from "./functions/detectUserInPortal";

const forwardVector = new Vector3(0, 0, 1);
const prevControllerColliderPosition = new Vector3();
const vector3 = new Vector3();
const quat = new Quaternion();

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

    detectUserInPortal()

    this.queryResults.character.added?.forEach((entity) => {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (actor) actor.raycastQuery = PhysicsSystem.instance.addRaycastQuery(new RaycastQuery({
        type: SceneQueryType.Closest,
        origin: new Vector3(0, actor.actorHeight, 0),
        direction: new Vector3(0, -1, 0),
        maxDistance: 0.1 + (actor.actorHeight * 0.5) + actor.capsuleRadius,
        collisionMask: DefaultCollisionMask | CollisionGroups.Portal,
      }));
    });

    this.queryResults.controller.all?.forEach((entity) => {
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);

      // iterate on all collisions since the last update
      collider.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => { })
    })

    this.queryResults.character.all?.forEach(entity => {

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

      if (!actor.movementEnabled || !actor.initialized) return;
      
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);

      // reset if vals are invalid
      if (isNaN(collider.controller.transform.translation.x) || collider.controller.transform.translation.y < -10) {
        // console.warn("WARNING: Character physics data reporting NaN")
        collider.controller.updateTransform({
          translation: { x: 0, y: 10, z: 10 },
          rotation: {}
        });
        // collider.playerStuck = 1000;
        // return;
      }

      transform.position.set(
        collider.controller.transform.translation.x,
        collider.controller.transform.translation.y,
        collider.controller.transform.translation.z
      );

      actor.raycastQuery.origin.copy(transform.position);
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
        actor.animationVelocity.set(0,0,0);
      }
      quat.copy(transform.rotation).invert();
      actor.animationVelocity.set(x, y, z).applyQuaternion(quat);
      // its beacose we need physicsMove on server and for localCharacter, not for all character
      characterMoveBehavior(entity, delta);
    });

    // PhysicsMove Characters On Server
    // its beacose we need physicsMove on server and for localCharacter, not for all character
    this.queryResults.characterOnServer.all?.forEach((entity) => {
      const actor = getComponent<CharacterComponent>(entity, CharacterComponent);
      const transform = getMutableComponent(entity, TransformComponent);
      // update rotationg for physics moving
      vector3.copy(actor.viewVector).setY(0).normalize();
      actor.orientation.copy(applyVectorMatrixXZ(vector3, forwardVector))
      transform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
      characterMoveBehavior(entity, delta);
    })

    // temporarily disable animations on Oculus until we have buffer animation system / GPU animations
    if(!Engine.isHMD) {
      this.queryResults.animation.all?.forEach((entity) => {
        updateVectorAnimation(entity, delta)
      })
    }

    this.queryResults.ikAvatar.added?.forEach((entity) => {
      if(!isClient) return;
      const ikRigComponent = getMutableComponent(entity, IKRigComponent);
      const actor = getMutableComponent(entity, CharacterComponent);
      const avatarIKRig = new Avatar(actor.modelContainer.children[0], {
        debug: true,
        top: true,
        bottom: true,
        visemes: true,
        hair: true,
      });
      ikRigComponent.avatarIKRig = avatarIKRig;
      if(Network.instance.localClientEntity === entity) {
        // avatarIK.avatarIKRig.decapitate()
      }

      // TODO: Temporarily make rig invisible until rig is fixed
      actor.modelContainer.children[0]?.traverse((child) => {
        if(child.visible) {
          child.visible = false;
        }
      })
    })

    this.queryResults.ikAvatar.all?.forEach((entity) => {
      const ikRigComponent = getMutableComponent(entity, IKRigComponent);
      if(ikRigComponent) {
        // ikRigComponent.avatarIKRig.update(delta);
      }
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
  ikAvatar: {
    components: [IKRigComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
