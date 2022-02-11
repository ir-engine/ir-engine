import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import assert from 'assert'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { equipEntity, unequipEntity } from './equippableFunctions'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { Network } from '../../networking/classes/Network'
import { TestNetwork } from '../../../tests/networking/TestNetwork'
import { createWorld } from '../../ecs/classes/World'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

describe('equippableFunctions', () => {
  beforeEach(() => {
    const world = createWorld()
    Engine.currentWorld = world
    Network.instance = new TestNetwork()
  })

  it('equipEntity', () => {
    const entity1: Entity = createEntity()
    const entity2: Entity = createEntity()

    assert(!hasComponent(entity1, EquipperComponent))
    assert(!hasComponent(entity2, EquippedComponent))

    const networkObject = addComponent(entity2, NetworkObjectComponent, {
      ownerId: 'server' as UserId,
      ownerIndex: 0,
      networkId: 0 as NetworkId,
      prefab: '',
      parameters: {}
    })

    equipEntity(entity1, entity2)
    assert(hasComponent(entity1, EquipperComponent))
    assert(hasComponent(entity2, EquippedComponent))
  })

  it('unequipEntity', () => {
    const entity1: Entity = createEntity()
    const entity2: Entity = createEntity()
    const networkObject = addComponent(entity2, NetworkObjectComponent, {
      ownerId: 'server' as UserId,
      ownerIndex: 0,
      networkId: 0 as NetworkId,
      prefab: '',
      parameters: {}
    })

    equipEntity(entity1, entity2)
    assert(hasComponent(entity1, EquipperComponent))
    unequipEntity(entity1)
    assert(!hasComponent(entity1, EquipperComponent))
  })
})
