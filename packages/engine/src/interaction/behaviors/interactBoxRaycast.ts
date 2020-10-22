import { Object3D, Ray, Raycaster, Vector3, Vector2, Mesh, Frustum, Matrix4, Box3 } from "three";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InteractBehaviorArguments } from "../types";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";

import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Interactive } from "../components/Interactive";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { Interacts } from "../components/Interacts";
import { Engine } from "../../ecs/classes/Engine";

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

export const interactBoxRaycast: Behavior = (entity: Entity, { interactive }:InteractBehaviorArguments, delta: number): void => {

  if (!hasComponent(entity, FollowCameraComponent)) return;
  const followCamera = getComponent(entity, FollowCameraComponent);
  if (!followCamera.raycastBoxOn) return;

  const raycastList:Array<Object3D> = interactive
    .filter(interactiveEntity => {
      // - have object 3d to raycast
      if (!hasComponent(interactiveEntity, Object3DComponent)) {
        return false;
      }
      const interactive = getComponent(interactiveEntity, Interactive);
      // - onInteractionCheck is not set or passed
      return (typeof interactive.onInteractionCheck !== 'function' || interactive.onInteractionCheck(entity, interactiveEntity));
    })
    .map(entity => getComponent(entity, Object3DComponent).value );

  if (!raycastList.length) {
    return;
  }

  const projectionMatrix = new Matrix4().makePerspective(
    followCamera.rx1,
    followCamera.rx2,
    followCamera.ry1,
    followCamera.ry2,
    Engine.camera.near,
    followCamera.farDistance
  );

  Engine.camera.updateMatrixWorld();
  Engine.camera.matrixWorldInverse.getInverse( Engine.camera.matrixWorld );

  const viewProjectionMatrix = new Matrix4().multiplyMatrices( projectionMatrix, Engine.camera.matrixWorldInverse );
  const frustum = new Frustum().setFromProjectionMatrix( viewProjectionMatrix );

  const subFocusedArray = raycastList.filter(scene => {
    const child:any = scene.children[0];
    const aabb = new Box3();
    if (child instanceof Mesh) {
      aabb.copy(child.geometry.boundingBox);
      aabb.applyMatrix4( child.matrixWorld );
    } else
    if (child instanceof Object3D) {
     aabb.setFromObject( child );
    }
    return frustum.intersectsBox(aabb);
  })

  const interacts = getMutableComponent(entity, Interacts);
  interacts.subFocusedArray = subFocusedArray;
};
