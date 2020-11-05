import { BoxBufferGeometry } from 'three';
import { Input } from '../../../input/components/Input';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { NetworkObject } from '../../../networking/components/NetworkObject';
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { State } from '../../../state/components/State';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterInputSchema } from '../CharacterInputSchema';
import { CharacterStateSchema } from '../CharacterStateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { Subscription } from '../../../subscription/components/Subscription';
import { CharacterSubscriptionSchema } from '../CharacterSubscriptionSchema';
import { FollowCameraComponent } from '../../../camera/components/FollowCameraComponent';
import { addComponentFromSchema } from '../../../common/behaviors/addComponentFromSchema';
import { AssetLoader } from '../../../assets/components/AssetLoader';
import { initializeCharacter } from '../behaviors/initializeCharacter';
import { CharacterAvatarComponent } from '../components/CharacterAvatarComponent';
import { Interactor } from '../../../interaction/components/Interactor';

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent },
    // Handle character's body
    { type: CharacterAvatarComponent, data: { avatarId: 'Rose' }},
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } },
    // Similar to Unity's Update(), LateUpdate(), and Start()
    { type: Subscription, data: { schema: CharacterSubscriptionSchema } },
    // Current state (isJumping, isidle, etc)
    { type: State, data: { schema: CharacterStateSchema } },
  ],
  // These are only created for the local player who owns this prefab
  components: [
    { type: LocalInputReceiver },
    { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" } },
    { type: Interactor }
  ],
  onAfterCreate: [
    // {
    //   behavior: initializeCharacter,
    //   networked: true
    // }
  ],
  onBeforeDestroy: [

  ]
};
