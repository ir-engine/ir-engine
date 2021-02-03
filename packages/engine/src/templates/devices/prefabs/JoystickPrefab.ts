import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addComponentFromSchema } from "@xr3ngine/engine/src/common/behaviors/addComponentFromSchema";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Entity } from "../../../ecs/classes/Entity";
import { onInteraction, onInteractionHover } from "../../interactive/functions/commonInteractive";


export const JoystickPrefab: Prefab = {
    localClientComponents: [{ type: TransformComponent, data: { position: [3, 1, 0] } }],
    onAfterCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                component: AssetLoader,
                componentArgs: {
                    url: "models/devices/Wildcat_Arena.glb",
                    receiveShadow: true,
                    castShadow: true,
                    // onLoaded: ProcessModelAsset
                }
            }
        },
        {
          behavior: addMeshCollider,
          args: {
            type: 'box',
            scale: [0.434122, 0.367724, 0.55483],
            mass: 1
          }
        }
    ]
};
