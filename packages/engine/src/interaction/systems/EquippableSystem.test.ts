import assert, { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { createAvatar } from '../../avatar/functions/createAvatar'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'
import { getParity } from '../functions/equippableFunctions'
import EquippableSystem from './EquippableSystem'

// @TODO this needs to be re-thought

describe.skip('EquippableSystem Integration Tests', () => {
  let equippableSystem
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('system test', async () => {
    const world = Engine.instance.currentWorld
    const player = createEntity(world)
    const item = createEntity(world)

    const networkObject = addComponent(player, NetworkObjectComponent, {
      ownerId: Engine.instance.userId,
      authorityUserId: Engine.instance.userId,
      networkId: 0 as NetworkId
    })

    createAvatar(
      WorldNetworkAction.spawnAvatar({
        $from: Engine.instance.userId,
        networkId: networkObject.networkId,
        position: new Vector3(-0.48624888685311896, 0, -0.12087574159728942),
        rotation: new Quaternion()
      })
    )

    const equippedComponent = addComponent(item, EquippedComponent, {
      equipperEntity: player,
      attachmentPoint: EquippableAttachmentPoint.HEAD
    })
    addComponent(player, EquipperComponent, { equippedEntity: item })

    const equippableTransform = setTransformComponent(item)
    const attachmentPoint = equippedComponent.attachmentPoint
    const target = getHandTarget(item, getParity(attachmentPoint))!
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
