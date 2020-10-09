import {
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  SphereBufferGeometry,
  Color,
  MeshStandardMaterial
} from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";

export const rigidBodyBox2: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [-2.6, 2,-2.6]} },
      { type: ColliderComponent, data: { type: 'sphere', scale: [1, 1, 1], mass: 10 }},
      { type: RigidBody }
    ],
    onCreate: [
        {
            behavior: addObject3DComponent,
            args: {
              obj3d: new Mesh(
                new SphereBufferGeometry( 0.5, 32, 32 ),
                new MeshStandardMaterial({
                  color: new Color(0.513410553336143494, 0, 0.002206481294706464),
                  metalness: 0.8323529362678528,
                  refractionRatio: 0.98,
                  roughness: 0.5527864098548889,
                })
              )
            }
        }
    ]
};
