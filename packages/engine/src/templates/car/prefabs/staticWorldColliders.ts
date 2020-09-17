import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";

const scale = [100, 0.1, 100]
const floor = new BoxBufferGeometry(scale[0], scale[1], scale[2]);
const mat = new MeshPhongMaterial({ color: "#ffffff" });
const floorMesh = new Mesh( floor, mat );
floorMesh.receiveShadow = true;
floorMesh.castShadow = false;

export const staticWorldColliders: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [ 0, -0.05, 0 ]  } },
      { type: ColliderComponent, data: { type: 'box', scale: scale, mass: 0 }}
    ],
    onCreate: [
        // add a 3d object
         {
             behavior: addObject3DComponent,
             args: {
                 obj3d: floorMesh
             }
         },
    ]
};
