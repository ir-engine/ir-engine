import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { addComponentFromSchema } from "@xr3ngine/engine/src/common/behaviors/addComponentFromSchema";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { addWorldColliders } from "../behaviors/addWorldColliders";

export const WorldPrefab: Prefab = {
    localClientComponents: [{ type: TransformComponent, data: { position: [0, -0.03, 0] } }],
    onAfterCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                component: AssetLoader,
                componentArgs: {
                    url: "../models/worlds/island_zero_dark_green2.glb",
                    receiveShadow: true,
                    castShadow: true
                }
            }
        },
        {
            behavior: (entity) => {
                const loader = getMutableComponent(entity, AssetLoader)
                loader.onLoaded.push(addWorldColliders)
            }
        }
    ]
};
