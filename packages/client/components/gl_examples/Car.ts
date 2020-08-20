import { BoxBufferGeometry, Mesh } from "three";
import { myCustomBehavior } from "./mycustomBehavior";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";

const myCoolCar = new BoxBufferGeometry(1,1,1);

export const car: Prefab = {
    components: [],
    onCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: Mesh,
                obj3dArgs: myCoolCar
            }
        },
        {
            behavior: myCustomBehavior
        }
    ]
};