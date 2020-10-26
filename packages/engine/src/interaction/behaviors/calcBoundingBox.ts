import { Object3D, Ray, Raycaster, Vector3, Vector2, Mesh, Frustum, Matrix4, Box3, Scene } from "three";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InteractBehaviorArguments } from "../types";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";

import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Interactive } from "../components/Interactive";
import { BoundingBox } from "../components/BoundingBox";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { Interacts } from "../components/Interacts";
import { Engine } from "../../ecs/classes/Engine";

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

 function searchModelChildrenByName(entity, name) {
  // console.warn(entity);

   let screne = getComponent(entity, Object3DComponent).value
  // console.warn(screne);

   let m
   screne.children[0].traverse(value => {
     if (name == value.name) {
       m = value
     }
   })

   //console.warn(m);
   return m
 }

 function applyPositionToObject3D(entity, dynamic) {
   let object3D = getMutableComponent(entity, Object3DComponent);
   let transform = getComponent(entity, TransformComponent);

   object3D.value.position.copy(transform.position);
   object3D.value.rotation.setFromQuaternion(transform.rotation);

   if (!dynamic) {
     object3D.value.updateMatrixWorld();
   }
 }



 export const calcBoundingBox: Behavior = (entity: Entity, args, delta: number): void => {

   const interactive = getMutableComponent(entity, Interactive);
   const calcBoundingBox = getMutableComponent(entity, BoundingBox);

   applyPositionToObject3D(entity, calcBoundingBox.dynamic);


     if (interactive.interactionParts.length) {

       let arr = interactive.interactionParts.map(name => searchModelChildrenByName(entity, name));
       getMutableComponent(entity, BoundingBox).boxArray = arr;

     } else {

       let aabb = new Box3();
       let object3D = getComponent(entity, Object3DComponent).value;

       if (object3D instanceof Scene) object3D = object3D.children[0];
       if (object3D instanceof Mesh) {

         if( object3D.geometry.boundingBox == null) object3D.geometry.computeBoundingBox();
           aabb.copy(object3D.geometry.boundingBox);

           if(!calcBoundingBox.dynamic) {
             aabb.applyMatrix4( object3D.matrixWorld );
           }

        } else
        if (object3D instanceof Object3D) {
          aabb.setFromObject( object3D );
        }

       calcBoundingBox.box = aabb;
     }
 }
