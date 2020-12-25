import { Object3D, Ray, Raycaster, Vector3, Vector2, Mesh, Frustum, Matrix4, Box3, Scene } from "three";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InteractBehaviorArguments } from "../types/InteractionTypes";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";

import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Interactable } from "../components/Interactable";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { Interactor } from "../components/Interactor";
import { BoundingBox } from "../components/BoundingBox";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { Engine } from "../../ecs/classes/Engine";

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

export const interactBoxRaycast: Behavior = (entity: Entity, { interactive }: InteractBehaviorArguments, delta: number): void => {

  if (!hasComponent(entity, FollowCameraComponent)) return;
  const followCamera = getComponent(entity, FollowCameraComponent);
  if (!followCamera.raycastBoxOn) return;

  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  const raycastList: Array<Entity> = interactive
    .filter(interactiveEntity => {
      // - have object 3d to raycast
      if (!hasComponent(interactiveEntity, Object3DComponent)) {
        return false;
      }
      const interactive = getComponent(interactiveEntity, Interactable);
      // - onInteractionCheck is not set or passed
      return (typeof interactive.onInteractionCheck !== 'function' || interactive.onInteractionCheck(entity, interactiveEntity));
    })

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
  Engine.camera.matrixWorldInverse.getInverse(Engine.camera.matrixWorld);

  const viewProjectionMatrix = new Matrix4().multiplyMatrices(projectionMatrix, Engine.camera.matrixWorldInverse);
  const frustum = new Frustum().setFromProjectionMatrix(viewProjectionMatrix);


  const subFocusedArray = raycastList.map(entityIn => {

    const boundingBox = getComponent(entityIn, BoundingBox);
    if (boundingBox.boxArray.length) {
      // TO DO: static group object
      if (boundingBox.dynamic) {

        const arr = boundingBox.boxArray.map((object3D, index) => {
          const aabb = new Box3();
          aabb.setFromObject(object3D);
          return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position), index];
        }).filter(value => value[1]).sort((a: any, b: any) => a[2] - b[2])

        if (arr.length) {
          return arr[0]
        } else {
          return [null, false]
        }

      }
    } else {
      if (boundingBox.dynamic) {
        const object3D = getComponent(entityIn, Object3DComponent);
        const aabb = new Box3();
        aabb.copy(boundingBox.box);
        aabb.applyMatrix4(object3D.value.matrixWorld);
        return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position)];
      } else {
        return [entityIn, frustum.intersectsBox(boundingBox.box), boundingBox.box.distanceToPoint(transform.position)];
      }
    }
  }).filter(value => value[1]);

  const selectNearest = subFocusedArray.sort((a: any, b: any) => a[2] - b[2])

  const interacts = getMutableComponent(entity, Interactor);
  interacts.subFocusedArray = subFocusedArray.map((v: any) => getComponent(v[0], Object3DComponent).value);

  const newBoxHit = selectNearest.length ? selectNearest[0] : null;
  (interacts.BoxHitResult as any) = newBoxHit;
  (interacts.focusedInteractive as any) = newBoxHit ? newBoxHit[0] : null;
};
