import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InteractBehaviorArguments } from "../types";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";

import { Object3D, Ray, Raycaster, Vector3, Vector2, Mesh, Frustum, Matrix4, Box3 } from "three";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Interactive } from "../components/Interactive";
import { Interacts } from "../components/Interacts";
import { Engine } from "../../ecs/classes/Engine";

const rx1 = -0.1; // first right x point of screen, two-dimensional square on the screen, hitting which the interactive objects are highlighted
const ry1 = -0.1; // first right y point of screen
const rx2 = 0.1; // second right x point of screen
const ry2 = 0.1; // second right y point of screen
const farDistance = 5; // distance to which interactive objects from the camera will be highlighted

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

export const interactBoxRaycast: Behavior = (entity: Entity, { interactive }:InteractBehaviorArguments, delta: number): void => {

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

  const projectionMatrix = new Matrix4().makePerspective( rx1, rx2, ry1, ry2, Engine.camera.near, farDistance );
  Engine.camera.updateMatrixWorld();
  Engine.camera.matrixWorldInverse.getInverse( Engine.camera.matrixWorld );

  const viewProjectionMatrix = new Matrix4().multiplyMatrices( projectionMatrix, Engine.camera.matrixWorldInverse );
  const frustum = new Frustum().setFromProjectionMatrix( viewProjectionMatrix );

  const subFocusedArray = raycastList.filter(scene => {
    let child:any = scene.children[0];
    if (child instanceof Mesh) {
      return frustum.intersectsBox(child.geometry.boundingBox);
    } else
    if (child instanceof Object3D) {
     const aabb = new Box3().setFromObject( child );
     return frustum.intersectsBox(aabb);
   }
  })

  const interacts = getMutableComponent(entity, Interacts);
  interacts.subFocusedArray = subFocusedArray;
};
