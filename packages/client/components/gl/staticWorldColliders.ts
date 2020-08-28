import { BoxBufferGeometry, Mesh } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addCollider } from "@xr3ngine/engine/src/physics/behaviors/ColliderBehavior";

const floor = new BoxBufferGeometry(10,0.1,10);

export const staticWorldColliders: Prefab = {
    components: [],
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
            behavior: addMeshCollider
        },
        {
            behavior: addCollider
        }
    ]
};
