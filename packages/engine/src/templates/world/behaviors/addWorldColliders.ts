import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CylinderGeometry, Matrix4, Mesh, Vector3 } from "three";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';

export const addWorldColliders: Behavior = (entity: Entity, args: any ) => {

  const asset = args.asset
  const deleteArr = []

   asset.scene.traverse( mesh => {

     if (mesh.userData.data == "physics") {
       if (mesh.userData.type == "box" || mesh.userData.type == "trimesh") {
         deleteArr.push(mesh)
         addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale, mesh)
       }
     }

   })

   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i])
   }

  return entity;
};
