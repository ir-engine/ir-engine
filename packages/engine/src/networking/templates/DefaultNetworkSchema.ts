import { AvatarTagComponent } from '../../avatar/components/AvatarTagComponent'
import { MappedComponent } from '../../ecs/functions/EntityFunctions'
import { RigidBodyTagComponent } from '../../physics/components/RigidBodyTagComponent'
import { MessageTypes } from '../enums/MessageTypes'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { PrefabType } from './PrefabType'

export const DefaultPrefabs = new Map<string, MappedComponent<any, any>>()
DefaultPrefabs.set(PrefabType.Player, AvatarTagComponent)
DefaultPrefabs.set(PrefabType.RigidBody, RigidBodyTagComponent)

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...MessageTypes
  },
  prefabs: DefaultPrefabs
}
