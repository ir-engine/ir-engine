import { AvatarTagComponent } from '../../avatar/components/AvatarTagComponent'
import { RigidBodyTagComponent } from '../../physics/components/RigidBodyTagComponent'
import { MessageTypes } from '../enums/MessageTypes'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { PrefabType } from './PrefabType'

export const DefaultPrefabs = new Map()
DefaultPrefabs.set(PrefabType.Player, AvatarTagComponent)
DefaultPrefabs.set(PrefabType.RigidBody, RigidBodyTagComponent)

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...MessageTypes
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
}
