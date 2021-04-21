import { Matrix4, Quaternion, Vector3 } from "three";
import { addObject3DComponent } from '../../scene/behaviors/addObject3DComponent';
import { CameraTagComponent } from '../../scene/components/Object3DTagComponents';
import { isMobileOrTablet } from "../../common/functions/isMobile";
import { NumericalType } from "../../common/types/NumericalTypes";
import { Engine } from '../../ecs/classes/Engine';
import { System } from '../../ecs/classes/System';
import { addComponent, createEntity, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { CameraComponent } from '../components/CameraComponent';
import { FollowCameraComponent } from '../components/FollowCameraComponent';
import { CameraModes } from "../types/CameraModes";
import { Entity } from "../../ecs/classes/Entity";
import { PhysicsSystem } from "../../physics/systems/PhysicsSystem";
import { CollisionGroups } from "../../physics/enums/CollisionGroups";

let direction = new Vector3();
const upVector = new Vector3(0, 1, 0);
const empty = new Vector3();
const PI_2Deg = Math.PI / 180;
const mx = new Matrix4();
const vec3 = new Vector3();


/** System class which provides methods for Camera system. */
export class CameraSystem extends System {
  static activeCamera: Entity

  prevState = [0, 0] as NumericalType;

  /** Constructs camera system. */
  constructor() {
    super();
    const cameraEntity = createEntity();
    addComponent(cameraEntity, CameraComponent );
    addComponent(cameraEntity, CameraTagComponent );
    addObject3DComponent(cameraEntity, { obj3d: Engine.camera });
    addComponent(cameraEntity, TransformComponent);
    addComponent(cameraEntity, DesiredTransformComponent);
    CameraSystem.activeCamera = cameraEntity;
  }

  /**
   * Execute the camera system for different events of queries.\
   * Called each frame by default.
   *
   * @param delta time since last frame.
   */
  execute(delta: number): void {
    this.queryResults.followCameraComponent.added?.forEach(entity => {
      CameraComponent.instance.followTarget = entity;
    });
    this.queryResults.followCameraComponent.removed?.forEach(entity => {
      CameraComponent.instance.followTarget = null;
    });

    // follow camera component should only ever be on the character
    this.queryResults.followCameraComponent.all?.forEach(entity => {
      const cameraDesiredTransform: DesiredTransformComponent = getMutableComponent(CameraSystem.activeCamera, DesiredTransformComponent) as DesiredTransformComponent; // Camera
      if (!cameraDesiredTransform.position) {
        cameraDesiredTransform.position = new Vector3();
      }
      if (!cameraDesiredTransform.rotation) {
        cameraDesiredTransform.rotation = new Quaternion();
      }
      const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
      const actorTransform = getMutableComponent(entity, TransformComponent);

      const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent) as FollowCameraComponent;

      cameraDesiredTransform.rotationRate = isMobileOrTablet() || cameraFollow.mode === CameraModes.FirstPerson ? 5 : 3.5
      cameraDesiredTransform.positionRate = isMobileOrTablet() || cameraFollow.mode === CameraModes.FirstPerson ? 3.5 : 2

      let camDist = cameraFollow.distance;
      if (cameraFollow.mode === CameraModes.FirstPerson) camDist = 0.01;
      else if (cameraFollow.mode === CameraModes.ShoulderCam) camDist = cameraFollow.minDistance;
      else if (cameraFollow.mode === CameraModes.TopDown) camDist = cameraFollow.maxDistance;

      const phi = cameraFollow.mode === CameraModes.TopDown ? 85 : cameraFollow.phi;

      let targetPosition;
      if (actor) { // this is for cars
        const shoulderOffsetWorld = cameraFollow.offset.clone().applyQuaternion(actor.tiltContainer.quaternion);
        targetPosition = actor.tiltContainer.getWorldPosition(vec3).add(shoulderOffsetWorld);
      } else {
        cameraDesiredTransform.rotationRate = 7;
        cameraDesiredTransform.positionRate = 15;
        targetPosition = actorTransform.position;
      }

      // Raycast for camera
      const cameraTransform: TransformComponent = getMutableComponent(CameraSystem.activeCamera, TransformComponent)
      const raycastDirection = new Vector3().subVectors(cameraTransform.position, targetPosition).normalize();
      cameraFollow.raycastQuery.origin = new Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
      cameraFollow.raycastQuery.direction = new Vector3(raycastDirection.x, raycastDirection.y, raycastDirection.z);
      
      const closestHit = cameraFollow.raycastQuery.hits[0];

      if(cameraFollow.mode !== CameraModes.FirstPerson && cameraFollow.rayHasHit && closestHit.distance < camDist && closestHit.distance > 0.1) {
        camDist = closestHit.distance - 0.5;
      }

      cameraDesiredTransform.position.set(
          targetPosition.x + camDist * Math.sin(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg),
          targetPosition.y + camDist * Math.sin(phi * PI_2Deg),
          targetPosition.z + camDist * Math.cos(cameraFollow.theta * PI_2Deg) * Math.cos(phi * PI_2Deg)
      );

      direction.copy(cameraDesiredTransform.position);
      direction = direction.sub(targetPosition).normalize();

      mx.lookAt(direction, empty, upVector);
      cameraDesiredTransform.rotation.setFromRotationMatrix(mx);
      if (actor) {
        actor.viewVector = new Vector3(0, 0, -1).applyQuaternion(cameraDesiredTransform.rotation)
      } else {
        cameraTransform.rotation.copy(cameraDesiredTransform.rotation);
      }

      // for pointer lock controls
      // if(cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
      //     cameraTransform.rotation.copy(cameraDesiredTransform.rotation);
      // }
      if (cameraFollow.mode === CameraModes.FirstPerson) {
        cameraDesiredTransform.position.copy(targetPosition);
      }
    });
  }
}

/**
 * Queries must have components attribute which defines the list of components
 */
CameraSystem.queries = {
  cameraComponent: {
    components: [CameraComponent, TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  },
  followCameraComponent: {
    components: [ FollowCameraComponent, TransformComponent ],
    listen: {
      added: true,
      changed: true
    }
  }


};
