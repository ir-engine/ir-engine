import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CylinderGeometry, Matrix4, Mesh, Vector3 } from "three";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';

export const addWorldColliders: Behavior = (entity: Entity, args: any ) => {

  const asset = args.asset
  let deleteArr = []
  let collisionBoxArr = []
  let collisionTrimeshArr = []
   asset.scene.traverse( mesh => {



     if (mesh.userData.data == "physics") {
       if (mesh.userData.type == "box") {
         collisionBoxArr.push(mesh)
         addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale)
       } else
       if (mesh.userData.type == "trimesh") {
         console.log(collisionTrimeshArr);
         collisionTrimeshArr.push(mesh)
       }
     }

   })

   for (let i = 0; i < collisionBoxArr.length; i++) {
     collisionBoxArr[i].parent.remove(collisionBoxArr[i])
   }

   //mesh.position    mesh.scale

  return entity;
};
