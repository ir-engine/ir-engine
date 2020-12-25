import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { EmptyCharacterInputSchema } from "@xr3ngine/engine/src/templates/character/EmptyCharacterInputSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { Interactor } from "../../../interaction/components/Interactor";
//import { setCameraFollow } from "../../../camera/behaviors/setCameraFollow";
import { initializeCharacter } from "../behaviors/initializeCharacter";
import { loadActorAvatar } from "../behaviors/loadActorAvatar";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterComponent } from "../components/CharacterComponent";

// Prefab is a pattern for creating an entity and component collection as a prototype
export const PlayerCharacter: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    localClientComponents: [
        // ActorComponent has values like movement speed, deceleration, jump height, etc
        { type: CharacterComponent },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        // { type: Input, data: { schema: CharacterInputSchema } },
        { type: Input, data: { schema: EmptyCharacterInputSchema } },
        { type: CharacterAvatarComponent, data: { avatarId: 'VRMAvatar' }},
        { type: LocalInputReceiver },
        // Follow Camera for the entity
        { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" }},
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: CharacterStateSchema } },
        { type: Interactor }
    ],
    onAfterCreate: [
        {
            behavior: initializeCharacter
        },
        {
            behavior: loadActorAvatar
        }
    ],
    onBeforeDestroy: [

    ]
};
