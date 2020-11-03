import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";

const boxGeometry = new BoxBufferGeometry(0.3, 0.3, 0.3);
const boxMaterial = new MeshPhongMaterial({ color: 'red' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);
boxMesh.name = 'simpleBox';

export const rigidBodyBox: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [0.8, 1,-0.8]} },
      { type: ColliderComponent, data: { type: 'box', scale: [0.3, 0.3, 0.3], mass: 10 }},
      { type: RigidBody }
    ],
    onAfterCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh
            }
        }
    ]
};
