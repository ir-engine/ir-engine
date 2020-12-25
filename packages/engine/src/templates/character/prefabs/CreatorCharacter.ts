import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { Interactor } from "../../../interaction/components/Interactor";
import { initializeCreatorCharacter } from "../behaviors/initializeCreatorCharacter";
import { CharacterComponent } from "../components/CharacterComponent";

// Prefab is a pattern for creating an entity and component collection as a prototype
export const CreatorCharacter: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    localClientComponents: [
        // ActorComponent has values like movement speed, deceleration, jump height, etc
        { type: CharacterComponent },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        { type: Input, data: { schema: CharacterInputSchema } },
        // Follow Camera for thet entity
        { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" } },
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: CharacterStateSchema } },
        { type: Interactor }
    ],
    onAfterCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                component: AssetLoader,
                componentArgs: {
                    url: "models/characters/VRMAvatar.glb",
                    receiveShadow: true,
                    castShadow: true
                }
            }
        },
        {
            behavior: initializeCreatorCharacter
        }
    ],
    onBeforeDestroy: [

    ]
};
