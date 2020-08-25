// Components
import { BoxBufferGeometry, Mesh } from 'three';
import { addMeshCollider } from '../../physics/behaviors/addMeshCollider';
import { Input } from '../../input/components/Input';
import { State } from '../../state/components/State';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { DefaultMessageSchema } from './DefaultMessageSchema';
import { DefaultMessageTypes } from './DefaultMessageTypes';
import { CharacterInputSchema } from '../../templates/character/CharacterInputSchema';
import { Subscription } from '../../subscription/components/Subscription';
import { CharacterSubscriptionSchema } from '../character/CharacterSubscriptionSchema';
import { attachCamera } from '../../camera/behaviors/attachCamera';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { CharacterComponent } from '../../character/components/CharacterComponent';
import { CharacterStateSchema } from '../character/CharacterStateSchema';
import { addObject3DComponent, removeObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { MessageTypes } from '../../networking/enums/MessageTypes';
import { handleClientConnected, handleClientDisconnected, handleMessage } from '../../networking/functions/NetworkFunctions';

const box = new BoxBufferGeometry(0.25, 0.25, 0.25);
const miniGeo = new BoxBufferGeometry(2, 1, 4);

// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkPlayerCharacter: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    { type: NetworkObject },
    { type: CharacterComponent },
    { type: TransformComponent, networkedValues: ['position', 'rotation'] }
  ],
  // These are only created for the local player who owns this prefab
  components: [
    { type: Input, data: { schema: CharacterInputSchema } },
    { type: State, data: { schema: CharacterStateSchema } },
    { type: Subscription, data: { schema: CharacterSubscriptionSchema } }
  ],
  onCreate: [
    {
      behavior: addObject3DComponent,
      networked: true,
      args: {
        obj3d: Mesh,
        obj3dArgs: miniGeo
      }
    },
    {
      behavior: attachCamera
    },
    {
      behavior: addMeshCollider,
      networked: true
    }
  ],
  onDestroy: [
    {
      behavior: removeObject3DComponent
    }
  ]
};

// initializeCharacterComponent(cube, inputOptions)
// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkCube: NetworkPrefab = {
  networkComponents: [{ type: NetworkObject }, { type: TransformComponent }]
};

// Prefab is a pattern for creating an entity and component collection as a prototype
const Car: NetworkPrefab = {
  networkComponents: [{ type: NetworkObject }, { type: TransformComponent }]
};

export const PrefabType = {
  Player: 0,
  Cube: 1,
  Car: 2
};

export const DefaultPrefabs: Array<{
  id: any
  prefab: NetworkPrefab
}> = [
  { id: PrefabType.Player, prefab: NetworkPlayerCharacter },
  { id: PrefabType.Cube, prefab: NetworkCube },
  { id: PrefabType.Car, prefab: Car }
];

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageHandlers: {
    [MessageTypes.ClientConnected]: {
      behavior: handleClientConnected
    },
    [MessageTypes.ClientDisconnected]: {
      behavior: handleClientDisconnected
    },
    [MessageTypes.ReliableMessage]: {
      behavior: handleMessage
    },
    [MessageTypes.UnreliableMessage]: {
      behavior: handleMessage
    }
  },
  messageSchemas: {
    [DefaultMessageTypes.Clock]: DefaultMessageSchema.Clock,
    [DefaultMessageTypes.World]: DefaultMessageSchema.World,
    [DefaultMessageTypes.Position]: DefaultMessageSchema.Position,
    [DefaultMessageTypes.Velocity]: DefaultMessageSchema.Velocity,
    [DefaultMessageTypes.Spin]: DefaultMessageSchema.Spin,
    [DefaultMessageTypes.Rotation]: DefaultMessageSchema.Rotation,
    [DefaultMessageTypes.Scale]: DefaultMessageSchema.Scale,
    [DefaultMessageTypes.Client]: DefaultMessageSchema.Client,
    [DefaultMessageTypes.Object]: DefaultMessageSchema.Object
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
