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
