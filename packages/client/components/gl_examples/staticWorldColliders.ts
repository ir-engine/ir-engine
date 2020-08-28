import { BoxBufferGeometry, Mesh } from "three";
import { myCustomBehavior } from "./mycustomBehavior";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";

const floor = new BoxBufferGeometry(20,0.1,20);

export const staticWorldColliders: Prefab = {
    components: [
      { type: TransformComponent,  data: { position: [0,0,0]} }
    ],
    onCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: Mesh,
                obj3dArgs: floor
            }
        },

        {
            behavior: addMeshCollider,
            args: {
               type: 'box', scale: [20, 0.1, 20], mass: 0
            }
        }

    ]
};
