import { BoxBufferGeometry, Mesh } from 'three';
import { addMeshCollider } from '../../../physics/behaviors/addMeshCollider';
import { Input } from '../../../input/components/Input';
import { State } from '../../../state/components/State';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterInputSchema } from '../CharacterInputSchema';
import { Subscription } from '../../../subscription/components/Subscription';
import { CharacterSubscriptionSchema } from '../CharacterSubscriptionSchema';
import { attachCamera } from '../../../camera/behaviors/attachCamera';
import { NetworkPrefab } from '../../../networking/interfaces/NetworkPrefab';
import { NetworkObject } from '../../../networking/components/NetworkObject';
import { CharacterComponent } from '../components/CharacterComponent';
import { CharacterStateSchema } from '../CharacterStateSchema';
import { addObject3DComponent, removeObject3DComponent } from '../../../common/behaviors/Object3DBehaviors';
import { uint16, int32, float32 } from '../../../common/types/DataTypes';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
const box = new BoxBufferGeometry(0.25, 0.25, 0.25);
const miniGeo = new BoxBufferGeometry(2, 1, 4);
// Prefab is a pattern for creating an entity and component collection as a prototype

export const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    { type: NetworkObject },
    { type: CharacterComponent },
    { type: State, data: { schema: CharacterStateSchema } },
    {type: TransformComponent},
  { type: Input, data: { schema: CharacterInputSchema } }
  ],
  // These are only created for the local player who owns this prefab
  components: [
    { type: LocalInputReceiver }
  ],
  onCreate: [
  //   {
  //     behavior: addObject3DComponent,
  //     networked: true,
  //     args: {
  //       obj3d: Mesh,
  //       obj3dArgs: miniGeo
  //     }
  //   },
  //   {
  //     behavior: attachCamera
  //   },
  //   {
  //     behavior: addMeshCollider,
  //     networked: true
  //   }
  ],
  onDestroy: [
    // {
    //   behavior: removeObject3DComponent
    // }
  ]
};
