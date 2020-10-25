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

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // ActorComponent has values like movement speed, deceleration, jump height, etc
    { type: CharacterComponent },
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } },

    // Current state (isJumping, isidle, etc)
    { type: State, data: { schema: CharacterStateSchema } },
    // Similar to Unity's Update(), LateUpdate(), and Start()
    { type: Subscription, data: { schema: CharacterSubscriptionSchema } },
    //  { type: LocalInputReceiver }
  ],
  // These are only created for the local player who owns this prefab
  components: [
    { type: LocalInputReceiver },
    { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" } },

  ],
  onAfterCreate: [
    {
      behavior: addComponentFromSchema,
      networked: true,
      args: {
        // addObject3DComponent is going to call new obj(objArgs)
        // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
        component: AssetLoader,
        componentArgs: {
          url: "models/avatars/ToonFemale.glb",
          receiveShadow: true,
          castShadow: true
        }
      }
    },
    {
      behavior: initializeCharacter,
      networked: true
    }
  ],
  onBeforeDestroy: [

  ]
};
