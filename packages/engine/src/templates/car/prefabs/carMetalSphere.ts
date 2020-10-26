import {
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereBufferGeometry,
  Color
} from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";

const geometry = new SphereBufferGeometry(1, 24, 32);
const color = new Color(0.513410553336143494, 0, 0.002206481294706464);

const materialStandard = new MeshStandardMaterial({
  color: color,
  metalness: 0.8323529362678528,
  refractionRatio: 0.98,
  roughness: 0.5527864098548889,
});

const materialPhysical = new MeshPhysicalMaterial({
  clearcoat: 1,
  clearcoatRoughness: 0.029999999329447746
});

materialPhysical.setValues(materialStandard);
materialPhysical.defines = { STANDARD: '', PHYSICAL: '' };

const meshStandard = new Mesh(geometry, materialStandard);
const meshPhysical = new Mesh(geometry, materialPhysical);

export const carMetalSphereStandard: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [-3, 2,-3]} },
      { type: ColliderComponent, data: { type: 'sphere', scale: [2, 2, 2], mass: 0.1 }},
      { type: RigidBody }
    ],
    onBeforeCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: meshStandard
            }
        }
    ]
};

export const carMetalSpherePhysical: Prefab = {
  components: [
    { type: TransformComponent, data: { position: [3, 2,-3]} },
    { type: ColliderComponent, data: { type: 'sphere', scale: [1, 1, 1], mass: 0 }},
    { type: RigidBody }
  ],
  onBeforeCreate: [
    // add a 3d object
    {
      behavior: addObject3DComponent,
      args: {
        obj3d: meshPhysical
      }
    }
  ]
};
