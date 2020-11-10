import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { Subscription } from "@xr3ngine/engine/src/subscription/components/Subscription";
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";
import { EmptyCharacterInputSchema } from "@xr3ngine/engine/src/templates/character/EmptyCharacterInputSchema";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { CharacterSubscriptionSchema } from "@xr3ngine/engine/src/templates/character/CharacterSubscriptionSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
//import { setCameraFollow } from "../../../camera/behaviors/setCameraFollow";
import { initializeCharacter } from "../behaviors/initializeCharacter";
import { CharacterComponent } from "../components/CharacterComponent";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { Interactor } from "../../../interaction/components/Interactor";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { loadActorAvatar } from "../behaviors/loadActorAvatar";

// Prefab is a pattern for creating an entity and component collection as a prototype
export const PlayerCharacter: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    components: [
        // ActorComponent has values like movement speed, deceleration, jump height, etc
        { type: CharacterComponent },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        // { type: Input, data: { schema: CharacterInputSchema } },
        { type: Input, data: { schema: EmptyCharacterInputSchema } },
        { type: CharacterAvatarComponent, data: { avatarId: 'Rose' }},
        { type: LocalInputReceiver },
        // Follow Camera for the entity
        { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" }},
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: CharacterStateSchema } },
        // Similar to Unity's Update(), LateUpdate(), and Start()
        { type: Subscription, data: { schema: CharacterSubscriptionSchema } },
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
