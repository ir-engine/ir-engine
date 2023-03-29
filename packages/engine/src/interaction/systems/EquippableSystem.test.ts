import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { spawnAvatarReceptor } from '../../avatar/functions/spawnAvatarReceptor'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'

// @TODO this needs to be re-thought

describe.skip('EquippableSystem Integration Tests', () => {
  let equippableSystem
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('system test', async () => {
    const player = createEntity()
    const item = createEntity()

    addComponent(player, NetworkObjectComponent, {
      ownerId: Engine.instance.userId,
      authorityPeerID: 'peer id' as PeerID,
      networkId: 0 as NetworkId
    })
    const networkObject = getComponent(player, NetworkObjectComponent)

    spawnAvatarReceptor(
      WorldNetworkAction.spawnAvatar({
        $from: Engine.instance.userId,
        networkId: networkObject.networkId,
        position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942),
        rotation: new Quaternion(),
        uuid: Engine.instance.userId
      })
    )

    addComponent(item, EquippedComponent, {
      equipperEntity: player,
      attachmentPoint: 'none'
    })
    const equippedComponent = getComponent(player, EquippedComponent)
    addComponent(player, EquipperComponent, { equippedEntity: item })

    setTransformComponent(item)
    const equippableTransform = getComponent(item, TransformComponent)
    const attachmentPoint = equippedComponent.attachmentPoint
    const target = getHandTarget(item, attachmentPoint)!
    const position = target.getWorldPosition(new Vector3())
    const rotation = target.getWorldQuaternion(new Quaternion())

    equippableSystem()

    assert(!hasComponent(item, EquipperComponent))

    strictEqual(equippableTransform.position.x, position.x)
    strictEqual(equippableTransform.position.y, position.y)
    strictEqual(equippableTransform.position.z, position.z)

    strictEqual(equippableTransform.rotation.x, rotation.x)
    strictEqual(equippableTransform.rotation.y, rotation.y)
    strictEqual(equippableTransform.rotation.z, rotation.z)
    strictEqual(equippableTransform.rotation.w, rotation.w)

    removeComponent(item, EquippedComponent)
    equippableSystem()
  })
})
