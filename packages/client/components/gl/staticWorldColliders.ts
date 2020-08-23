import { BoxBufferGeometry, Mesh } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";
const floor = new BoxBufferGeometry(1,0.1,1);

export const staticWorldColliders: Prefab = {
    components: [


    ],
    onCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: Mesh,
                obj3dArgs: floor
            }
        }
    ]
};
