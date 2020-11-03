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
      { type: TransformComponent, data: { position: [0.4, 1,-0.4]} },
      { type: ColliderComponent, data: { type: 'sphere', scale: [0.3, 1, 1], mass: 10 }},
      { type: RigidBody },
    ],
    onAfterCreate: [
        {
            behavior: addObject3DComponent,
            args: {
              obj3d: new Mesh(
                new SphereBufferGeometry( 0.15, 64, 64 ),
                new MeshStandardMaterial({
                  color: new Color(0.513410553336143494, 0.81341053336143494, 0.40206481294706464),
                  metalness: 0.8323529362678528,
                  refractionRatio: 0.98,
                  roughness: 0.5527864098548889,
                })
              )
            }
        }
    ]
};
