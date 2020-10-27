import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Box3, Mesh, Object3D, Scene } from "three";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { BoundingBox } from "../components/BoundingBox";
import { Interactable } from "../components/Interactable";



 function searchModelChildrenByName(entity: Entity, name: string): Object3D {
   const screne = getComponent(entity, Object3DComponent).value
   return screne.children[0].getObjectByName(name)
 }

 function applyPositionToObject3D(entity: Entity, dynamic: boolean): void {
   let object3D = getMutableComponent(entity, Object3DComponent);
   let transform = getComponent(entity, TransformComponent);

   object3D.value.position.copy(transform.position);
   object3D.value.rotation.setFromQuaternion(transform.rotation);

   if (!dynamic) {
     object3D.value.updateMatrixWorld();
   }
 }



 export const calcBoundingBox: Behavior = (entity: Entity): void => {

   const interactive = getMutableComponent(entity, Interactable);
   const calcBoundingBox = getMutableComponent(entity, BoundingBox);

   applyPositionToObject3D(entity, calcBoundingBox.dynamic);


     if (interactive.interactionParts.length) {

       let arr = interactive.interactionParts.map(name => searchModelChildrenByName(entity, name));
       getMutableComponent(entity, BoundingBox).boxArray = arr;

     } else {

       const aabb = new Box3();
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
