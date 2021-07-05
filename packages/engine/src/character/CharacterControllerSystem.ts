import { Group, Quaternion, Vector3 } from "three";
import { Controller, ControllerHitEvent, RaycastQuery, SceneQueryType } from "three-physx";
import { isClient } from "../common/functions/isClient";
import { EngineEvents } from "../ecs/classes/EngineEvents";
import { System, SystemAttributes } from "../ecs/classes/System";
import { Not } from "../ecs/functions/ComponentFunctions";
import { getMutableComponent, getComponent, getRemovedComponent, getEntityByID, removeComponent, addComponent, hasComponent } from "../ecs/functions/EntityFunctions";
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
import { loadActorAvatar } from "./prefabs/NetworkPlayerCharacter";
import { Engine } from "../ecs/classes/Engine";
import { XRInputSourceComponent } from "./components/XRInputSourceComponent";
import { Network } from "../networking/classes/Network";
import { detectUserInPortal } from "./functions/detectUserInPortal";
import { ServerSpawnSystem } from "../scene/systems/ServerSpawnSystem";
import { sendClientObjectUpdate } from "../networking/functions/sendClientObjectUpdate";
import { NetworkObjectUpdateType } from "../networking/templates/NetworkObjectUpdateSchema";
import { updatePlayerRotationFromViewVector } from "./functions/updatePlayerRotationFromViewVector";
import { AnimationManager } from "./AnimationManager";
import { Object3DComponent } from "../scene/components/Object3DComponent";
import { applyVectorMatrixXZ } from "../common/functions/applyVectorMatrixXZ";
import { FollowCameraComponent } from "../camera/components/FollowCameraComponent";
import { CameraSystem } from "../camera/systems/CameraSystem";
import { DesiredTransformComponent } from "../transform/components/DesiredTransformComponent";
import { CharacterAnimationGraph } from "./animations/CharacterAnimationGraph";
import { CharacterStates } from "./animations/Util";
import { isEntityLocalClient } from "../networking/functions/isEntityLocalClient";

const forwardVector = new Vector3(0, 0, 1);
const prevControllerColliderPosition = new Vector3();
const vector3 = new Vector3();
const quat = new Quaternion();
const quat2 = new Quaternion();
const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);

export class CharacterControllerSystem extends System {

  // Entity
  static EVENTS = {
    LOAD_AVATAR: "CHARCACTER_SYSTEM_LOAD_AVATAR",
  }

  updateType = SystemUpdateType.Fixed;
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);

    EngineEvents.instance.addEventListener(CharacterControllerSystem.EVENTS.LOAD_AVATAR, ({ entityID, avatarId, avatarURL }) => {
      const entity = getEntityByID(entityID);
      const characterAvatar = getMutableComponent(entity, CharacterComponent);
      if (characterAvatar != null) {
        characterAvatar.avatarId = avatarId;
        characterAvatar.avatarURL = avatarURL;
      }
      loadActorAvatar(entity);
    });
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
    EngineEvents.instance.removeAllListenersForEvent(CharacterControllerSystem.EVENTS.LOAD_AVATAR);
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {

    this.queryResults.controller.added?.forEach((entity) => {
      
      const playerCollider = getMutableComponent(entity, ControllerColliderComponent);
      const actor = getMutableComponent(entity, CharacterComponent);
      const transform = getComponent(entity, TransformComponent);
      
      playerCollider.controller = PhysicsSystem.instance.createController(new Controller({
        isCapsule: true,
        collisionLayer: CollisionGroups.Characters,
        collisionMask: DefaultCollisionMask,
        height: playerCollider.capsuleHeight,
        contactOffset: playerCollider.contactOffset,
        stepOffset: 0.25,
        slopeLimit: 0,
        radius: playerCollider.capsuleRadius,
        position: {
          x: transform.position.x,
          y: transform.position.y + actor.actorHalfHeight,
          z: transform.position.z
        },
        material: {
          dynamicFriction: playerCollider.friction,
        }
      }));

      playerCollider.raycastQuery = PhysicsSystem.instance.addRaycastQuery(new RaycastQuery({
        type: SceneQueryType.Closest,
        origin: new Vector3(0, actor.actorHeight, 0),
        direction: new Vector3(0, -1, 0),
        maxDistance: actor.actorHalfHeight + 0.05,
        collisionMask: DefaultCollisionMask | CollisionGroups.Portal,
      }));
    });

    this.queryResults.controller.removed?.forEach(entity => {
      const collider = getRemovedComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      if (collider) {
        PhysicsSystem.instance.removeController(collider.controller);
        PhysicsSystem.instance.removeRaycastQuery(collider.raycastQuery);
      }

      const actor = getMutableComponent(entity, CharacterComponent);
      if(actor) {
        actor.isGrounded = false;
      }
    });

    this.queryResults.controller.all?.forEach((entity) => {
      const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);

      // iterate on all collisions since the last update
      collider.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => { })

      if(!isClient || (entity && entity === Network.instance.localClientEntity)) detectUserInPortal(entity);

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);

      if (!actor.movementEnabled) return;
      
      const transform = getComponent<TransformComponent>(entity, TransformComponent as any);

      // reset if vals are invalid
      if (isNaN(collider.controller.transform.translation.x)) {
        console.warn("WARNING: Character physics data reporting NaN", collider.controller.transform.translation)
        collider.controller.updateTransform({
          translation: { x: 0, y: 10, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        });
      }

      // TODO: implement scene lower bounds parameter
      if(!isClient && collider.controller.transform.translation.y < -10) {
        const { position, rotation } = ServerSpawnSystem.instance.getRandomSpawnPoint();
        position.y += actor.actorHalfHeight;
        console.log('player has fallen through the floor, teleporting them to', position)
        collider.controller.updateTransform({
          translation: position,
          rotation
        });
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ForceTransformUpdate, [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w])
      }

      transform.position.set(
        collider.controller.transform.translation.x,
        collider.controller.transform.translation.y,
        collider.controller.transform.translation.z
      );

      collider.raycastQuery.origin.copy(transform.position);
      collider.closestHit = collider.raycastQuery.hits[0];
      actor.isGrounded = collider.raycastQuery.hits.length > 0 || collider.controller.collisions.down;
    });

    // PhysicsMove LocalCharacter and Update velocity vector for Animations
    this.queryResults.localCharacter.all?.forEach(entity => {
      const controllerCollider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (!controllerCollider.controller || !actor.movementEnabled) return;

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

      characterMoveBehavior(entity, delta);

      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent);
      if(hasComponent(entity, FollowCameraComponent)) {
        const camTransform = getComponent(CameraSystem.instance.activeCamera, DesiredTransformComponent);
        if(camTransform) {
          actor.viewVector.set(0, 0, -1).applyQuaternion(camTransform.rotation);
        }
      } else if(xrInputSourceComponent) {
        actor.viewVector.set(0, 0, 1).applyQuaternion(transform.rotation);
      }

    });

    // PhysicsMove Characters On Server
    // its beacose we need physicsMove on server and for localCharacter, not for all character
    this.queryResults.characterOnServer.all?.forEach((entity) => {
      updatePlayerRotationFromViewVector(entity);
      characterMoveBehavior(entity, delta);
    })

    // temporarily disable animations on Oculus until we have buffer animation system / GPU animations
    if(!Engine.isHMD) {
      this.queryResults.animation.added?.forEach((entity) => {
        const animationComponent = getMutableComponent(entity, AnimationComponent);
        animationComponent.animationGraph = CharacterAnimationGraph.constructGraph();
        animationComponent.currentState = animationComponent.animationGraph.states[CharacterStates.IDLE];
        animationComponent.currentState.mount(getMutableComponent(entity, CharacterComponent), {});
        animationComponent.prevVelocity = new Vector3();
      });

      this.queryResults.animation.all?.forEach((entity) => {
        AnimationManager.instance.renderAnimations(entity, delta);
      });
    }

    this.queryResults.ikAvatar.added?.forEach((entity) => {
      removeComponent(entity, AnimationComponent);

      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent);
      const actor = getMutableComponent(entity, CharacterComponent);
      const object3DComponent = getComponent(entity, Object3DComponent);

      xrInputSourceComponent.controllerGroup.position.setY(-actor.actorHalfHeight);

      xrInputSourceComponent.controllerGroup.add(
        xrInputSourceComponent.controllerLeft, 
        xrInputSourceComponent.controllerGripLeft, 
        xrInputSourceComponent.controllerRight, 
        xrInputSourceComponent.controllerGripRight
      );
      
      xrInputSourceComponent.controllerGroup.applyQuaternion(rotate180onY);
      object3DComponent.value.add(xrInputSourceComponent.controllerGroup, xrInputSourceComponent.head);

      if(isEntityLocalClient(entity)) {
        // TODO: Temporarily make rig invisible until rig is fixed
        actor?.modelContainer?.traverse((child) => {
          if(child.visible) {
            child.visible = false;
          }
        });
      }
    });

    this.queryResults.ikAvatar.all?.forEach((entity) => {
      if(!isEntityLocalClient(entity)) return;
      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);

      quat.copy(transform.rotation).invert()
      quat2.copy(Engine.camera.quaternion).premultiply(quat)
      xrInputSourceComponent.head.quaternion.copy(quat2)

      vector3.subVectors(Engine.camera.position, transform.position)
      vector3.applyQuaternion(quat)
      xrInputSourceComponent.head.position.copy(vector3)
    })

    this.queryResults.ikAvatar.removed?.forEach((entity) => {

      addComponent(entity, AnimationComponent);
      const actor = getMutableComponent(entity, CharacterComponent);

      if(isEntityLocalClient(entity))
      // TODO: Temporarily make rig invisible until rig is fixed
      actor?.modelContainer?.traverse((child) => {
        if(child.visible) {
          child.visible = true;
        }
      });
    });
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
    components: [CharacterComponent, AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  ikAvatar: {
    components: [CharacterComponent, XRInputSourceComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
