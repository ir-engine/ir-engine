import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CylinderGeometry, Matrix4, Mesh, Vector3 } from "three";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';
import { AssetLoader } from "../../../assets/components/AssetLoader";

export const addWorldColliders: Behavior = (entity: Entity, args: any ) => {

  const asset = args.asset;
  const deleteArr = [];
 
   asset.traverse( mesh => {
       
     if (mesh.userData.data == "physics") {
       if (mesh.userData.type == "box" || mesh.userData.type == "trimesh") {
        //  console.warn('ADD COLLIDER');
         deleteArr.push(mesh);
        //  console.log(mesh);
         if(mesh.type == 'Group') {
           for (let i = 0; i < mesh.children.length; i++) {
             addColliderWithoutEntity(mesh.userData.type, mesh.children[i].position, mesh.children[i].quaternion, mesh.children[i].scale, mesh.children[i]);
           }
         } else if (mesh.type == 'Mesh') {
           addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale, mesh);
         }
       }
     }
   });

   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i]);
   }

  return entity;
};
