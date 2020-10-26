import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: 'red' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);

export const rigidBodyBox: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [-3, 8,-3]} },
      { type: ColliderComponent, data: { type: 'box', scale: [1, 1, 1], mass: 10 }},
      { type: RigidBody }
    ],
    onBeforeCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh
            }
        }
    ]
};
