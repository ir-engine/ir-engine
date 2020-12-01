import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { CylinderGeometry, Matrix4, Mesh, Vector3 } from "three";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { addColliderWithoutEntity } from '@xr3ngine/engine/src/physics/behaviors/addColliderWithoutEntity';

export const addWorldColliders: Behavior = (entity: Entity, args: any ) => {

  const asset = args.asset;
  const deleteArr = [];

  const transform = getComponent(entity, TransformComponent);

  function parseColliders( mesh ) {
    // console.warn(mesh.userData.data);

    if (mesh.userData.data == "physics") {
      if (mesh.userData.type == "box" || mesh.userData.type == "trimesh") {
         //console.warn('ADD COLLIDER');
        deleteArr.push(mesh);
        if(mesh.type == 'Group') {
          for (let i = 0; i < mesh.children.length; i++) {
            mesh.position.set(
              transform.position.x + mesh.position.x,
              transform.position.y + mesh.position.y,
              transform.position.z + mesh.position.z
            )
            addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.children[i].quaternion, mesh.children[i].scale, mesh.children[i]);
          }
        } else if (mesh.type == 'Mesh') {
          mesh.position.set(
            transform.position.x + mesh.position.x,
            transform.position.y + mesh.position.y,
            transform.position.z + mesh.position.z
          )
          addColliderWithoutEntity(mesh.userData.type, mesh.position, mesh.quaternion, mesh.scale, mesh);
        }

      }
    }
  }


   if (asset.scene) {
     asset.scene.traverse( parseColliders );
   } else {
     asset.traverse( parseColliders );
   }


   for (let i = 0; i < deleteArr.length; i++) {
     deleteArr[i].parent.remove(deleteArr[i]);
   }

  return entity;
};
